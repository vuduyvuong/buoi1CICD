const express = require('express');
const path = require('path');
const { sql, getPool, verifyConnection } = require('./sqlserver');
const { hashPassword, verifyPassword, randomToken, tokenHash, publicUser } = require('./security');

const app = express();
const SESSION_DAYS = 7;
const loginAttempts = new Map();

app.disable('x-powered-by');
app.use(express.json({ limit: '5mb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
const cleanText = (value, max) => String(value || '').trim().slice(0, max || 500);
const validEmail = (value) => /^\S+@\S+\.\S+$/.test(String(value || '').trim());

function parseCookies(req) {
  return String(req.headers.cookie || '').split(';').reduce((result, part) => {
    const index = part.indexOf('=');
    if (index > -1) result[part.slice(0, index).trim()] = decodeURIComponent(part.slice(index + 1).trim());
    return result;
  }, {});
}

function getToken(req) {
  const authorization = req.headers.authorization || '';
  return authorization.indexOf('Bearer ') === 0 ? authorization.slice(7) : (parseCookies(req).bansac_session || '');
}

function setSessionCookie(res, token, persistent) {
  const secure = process.env.COOKIE_SECURE === 'true' ? '; Secure' : '';
  const maxAge = persistent ? `; Max-Age=${SESSION_DAYS * 86400}` : '';
  res.setHeader('Set-Cookie', `bansac_session=${token}; HttpOnly; SameSite=Lax; Path=/${maxAge}${secure}`);
}

function mapUser(row) {
  return row && { id: String(row.id), name: row.name, email: row.email, phone: row.phone || '', passwordHash: row.passwordHash, role: row.role, createdAt: row.createdAt };
}

async function findUserByEmail(email) {
  const pool = await getPool();
  const result = await pool.request().input('email', sql.VarChar(255), email).query(`
    SELECT u.UserId id, u.FullName name, u.Email email, u.Phone phone, u.PasswordHash passwordHash,
           r.RoleCode role, u.CreatedAt createdAt
    FROM dbo.Users u JOIN dbo.Roles r ON r.RoleId=u.RoleId
    WHERE u.Email=@email AND u.Status='active';`);
  return mapUser(result.recordset[0]);
}

async function findSessionUser(req) {
  const token = getToken(req);
  if (!token) return null;
  const pool = await getPool();
  const result = await pool.request().input('hash', sql.Char(64), tokenHash(token)).query(`
    SELECT u.UserId id, u.FullName name, u.Email email, u.Phone phone, u.PasswordHash passwordHash,
           r.RoleCode role, u.CreatedAt createdAt
    FROM dbo.AuthSessions s
    JOIN dbo.Users u ON u.UserId=s.UserId
    JOIN dbo.Roles r ON r.RoleId=u.RoleId
    WHERE s.TokenHash=@hash AND s.ExpiresAt>SYSUTCDATETIME() AND s.RevokedAt IS NULL AND u.Status='active';`);
  return mapUser(result.recordset[0]);
}

const optionalAuth = asyncRoute(async (req, res, next) => { req.user = await findSessionUser(req); next(); });
const requireAuth = asyncRoute(async (req, res, next) => {
  req.user = await findSessionUser(req);
  if (!req.user) return res.status(401).json({ error: 'Vui lòng đăng nhập để tiếp tục.' });
  next();
});
const requireAdmin = [requireAuth, (req, res, next) => req.user.role === 'admin' ? next() : res.status(403).json({ error: 'Bạn không có quyền thực hiện thao tác này.' })];

async function createSession(userId, persistent) {
  const pool = await getPool();
  const token = randomToken();
  await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .input('hash', sql.Char(64), tokenHash(token))
    .input('days', sql.Int, SESSION_DAYS)
    .query(`DELETE FROM dbo.AuthSessions WHERE UserId=@userId OR ExpiresAt<=SYSUTCDATETIME();
            INSERT dbo.AuthSessions(UserId,TokenHash,ExpiresAt)
            VALUES(@userId,@hash,DATEADD(DAY,@days,SYSUTCDATETIME()));`);
  return token;
}

function rateLimited(key) {
  const now = Date.now();
  const attempts = (loginAttempts.get(key) || []).filter((time) => now - time < 15 * 60 * 1000);
  attempts.push(now); loginAttempts.set(key, attempts);
  return attempts.length > 10;
}

function slugify(value) {
  return cleanText(value, 180).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'san-pham';
}

async function loadProducts(includeHidden) {
  const pool = await getPool();
  const request = pool.request().input('includeHidden', sql.Bit, includeHidden ? 1 : 0);
  const result = await request.query(`
    SELECT p.ProductId id,p.ProductName name,p.ShortDescription description,p.Gender gender,
           p.ProductType type,p.Badge badge,p.BasePrice price,p.CompareAtPrice originalPrice,
           p.Status status,c.CategoryCode category
    FROM dbo.Products p JOIN dbo.Categories c ON c.CategoryId=p.CategoryId
    WHERE (@includeHidden=1 AND p.Status<>'deleted') OR (@includeHidden=0 AND p.Status='active');
    SELECT v.VariantId variantId,v.ProductId id,v.Sku sku,v.StockQuantity stock,v.Status,
           co.ColorName color,co.HexCode hex,s.SizeCode sizeCode,s.SizeName size
    FROM dbo.ProductVariants v LEFT JOIN dbo.Colors co ON co.ColorId=v.ColorId
    LEFT JOIN dbo.Sizes s ON s.SizeId=v.SizeId;
    SELECT ProductId id,ImageUrl img,DisplayOrder,IsPrimary FROM dbo.ProductImages ORDER BY IsPrimary DESC,DisplayOrder;`);
  const variants = result.recordsets[1];
  const images = result.recordsets[2];
  return result.recordsets[0].map((product) => {
    const ownVariants = variants.filter((item) => String(item.id) === String(product.id) && item.Status !== 'hidden');
    const ownImages = images.filter((item) => String(item.id) === String(product.id)).map((item) => item.img);
    const selectedColors = [...new Set(ownVariants.map((item) => item.color).filter(Boolean))];
    const selectedSizes = [...new Set(ownVariants.map((item) => item.sizeCode === 'ONE' ? 'Free Size' : item.sizeCode).filter(Boolean))];
    return Object.assign({}, product, {
      id: Number(product.id), price: Number(product.price), originalPrice: product.originalPrice == null ? null : Number(product.originalPrice),
      stock: ownVariants.reduce((sum, item) => sum + Number(item.stock), 0), img: ownImages[0] || '', images: ownImages,
      colors: [...new Set(ownVariants.map((item) => item.hex || item.color).filter(Boolean))], selectedColors, selectedSizes,
      sizes: selectedSizes, sku: ownVariants[0] ? ownVariants[0].sku : '',
      variants: ownVariants.map((item) => ({ color:item.color, size:item.sizeCode === 'ONE' ? 'Free Size' : item.sizeCode, stock:Number(item.stock) }))
    });
  });
}

async function loadProduct(id, includeHidden) {
  const products = await loadProducts(includeHidden);
  return products.find((item) => String(item.id) === String(id));
}

async function getOrCreateColor(transaction, name) {
  const display = cleanText(name, 80) || 'Mặc định';
  const hex = /^#[0-9a-f]{6}$/i.test(display) ? display.toUpperCase() : null;
  const code = `c-${Buffer.from(display).toString('hex').slice(0, 24)}`;
  const result = await new sql.Request(transaction).input('code',sql.VarChar(30),code).input('name',sql.NVarChar(80),display).input('hex',sql.Char(7),hex).query(`
    IF NOT EXISTS(SELECT 1 FROM dbo.Colors WHERE ColorCode=@code)
      INSERT dbo.Colors(ColorCode,ColorName,HexCode) VALUES(@code,@name,@hex);
    SELECT ColorId FROM dbo.Colors WHERE ColorCode=@code;`);
  return result.recordset[0].ColorId;
}

async function getOrCreateSize(transaction, name) {
  const display = cleanText(name, 50) || 'Free Size';
  const code = display === 'Free Size' || display === 'Một cỡ' ? 'ONE' : cleanText(display.toUpperCase(),20);
  const result = await new sql.Request(transaction).input('code',sql.VarChar(20),code).input('name',sql.NVarChar(50),display).query(`
    IF NOT EXISTS(SELECT 1 FROM dbo.Sizes WHERE SizeCode=@code)
      INSERT dbo.Sizes(SizeCode,SizeName,DisplayOrder) VALUES(@code,@name,99);
    SELECT SizeId FROM dbo.Sizes WHERE SizeCode=@code;`);
  return result.recordset[0].SizeId;
}

async function saveProduct(body, productId) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool); await transaction.begin();
  try {
    const category = ['clothes','accessories'].includes(body.category) ? body.category : 'clothes';
    const categoryResult = await new sql.Request(transaction).input('category',sql.VarChar(50),category).query('SELECT CategoryId FROM dbo.Categories WHERE CategoryCode=@category');
    if (!categoryResult.recordset[0]) throw new Error('Danh mục sản phẩm không tồn tại.');
    const request = new sql.Request(transaction)
      .input('categoryId',sql.Int,categoryResult.recordset[0].CategoryId).input('name',sql.NVarChar(180),cleanText(body.name,180))
      .input('description',sql.NVarChar(500),cleanText(body.description,500)).input('gender',sql.VarChar(20),['men','women','unisex'].includes(body.gender)?body.gender:'unisex')
      .input('type',sql.VarChar(50),cleanText(body.type,50)||'item').input('badge',sql.NVarChar(50),cleanText(body.badge,50)||null)
      .input('price',sql.Decimal(19,2),Number(body.price)).input('originalPrice',sql.Decimal(19,2),Number(body.originalPrice)||null)
      .input('status',sql.VarChar(20),['active','hidden','draft'].includes(body.status)?body.status:'active');
    if (productId) {
      request.input('id',sql.BigInt,productId);
      await request.query(`UPDATE dbo.Products SET CategoryId=@categoryId,ProductName=@name,ShortDescription=@description,
        Gender=@gender,ProductType=@type,Badge=@badge,BasePrice=@price,CompareAtPrice=@originalPrice,Status=@status,UpdatedAt=SYSUTCDATETIME() WHERE ProductId=@id;`);
    } else {
      request.input('slug',sql.VarChar(220),`${slugify(body.name)}-${Date.now()}`);
      const inserted = await request.query(`INSERT dbo.Products(CategoryId,ProductName,Slug,ShortDescription,Gender,ProductType,Badge,BasePrice,CompareAtPrice,Status)
        OUTPUT INSERTED.ProductId id VALUES(@categoryId,@name,@slug,@description,@gender,@type,@badge,@price,@originalPrice,@status);`);
      productId = inserted.recordset[0].id;
    }
    const suppliedVariants = Array.isArray(body.variants) && body.variants.length ? body.variants : [{ color:(body.selectedColors||['Mặc định'])[0], size:(body.selectedSizes||['Free Size'])[0], stock:Number(body.stock)||0 }];
    await new sql.Request(transaction).input('id',sql.BigInt,productId).query("UPDATE dbo.ProductVariants SET Status='hidden',UpdatedAt=SYSUTCDATETIME() WHERE ProductId=@id");
    for (let index=0; index<suppliedVariants.length; index += 1) {
      const variant=suppliedVariants[index]; const colorId=await getOrCreateColor(transaction,variant.color); const sizeId=await getOrCreateSize(transaction,variant.size);
      const sku=cleanText(body.sku,60) ? `${cleanText(body.sku,60)}-${index+1}` : `BS-${productId}-${index+1}`;
      await new sql.Request(transaction).input('productId',sql.BigInt,productId).input('colorId',sql.Int,colorId).input('sizeId',sql.Int,sizeId).input('sku',sql.VarChar(80),sku).input('stock',sql.Int,Math.max(0,Number(variant.stock)||0)).query(`
        MERGE dbo.ProductVariants AS target USING (SELECT @productId ProductId,@colorId ColorId,@sizeId SizeId) source
        ON target.ProductId=source.ProductId AND target.ColorId=source.ColorId AND target.SizeId=source.SizeId
        WHEN MATCHED THEN UPDATE SET StockQuantity=@stock,Status='active',UpdatedAt=SYSUTCDATETIME()
        WHEN NOT MATCHED THEN INSERT(ProductId,ColorId,SizeId,Sku,StockQuantity,Status) VALUES(@productId,@colorId,@sizeId,@sku,@stock,'active');`);
    }
    if (Array.isArray(body.images) && body.images.length) {
      await new sql.Request(transaction).input('id',sql.BigInt,productId).query('DELETE FROM dbo.ProductImages WHERE ProductId=@id');
      for (let index=0; index<body.images.length; index += 1) {
        await new sql.Request(transaction).input('id',sql.BigInt,productId).input('url',sql.NVarChar(1000),cleanText(body.images[index],1000)).input('order',sql.Int,index).input('primary',sql.Bit,index===0).query('INSERT dbo.ProductImages(ProductId,ImageUrl,DisplayOrder,IsPrimary) VALUES(@id,@url,@order,@primary)');
      }
    }
    await transaction.commit(); return loadProduct(productId,true);
  } catch (error) { await transaction.rollback().catch(()=>null); throw error; }
}

async function calculatePromo(code, subtotal, baseShipping, transaction) {
  if (!code) return { code:'',discount:0,shipping:baseShipping,total:subtotal+baseShipping,valid:true,promotionId:null };
  const request = new sql.Request(transaction || await getPool()).input('code',sql.VarChar(50),cleanText(code,50).toUpperCase()).input('subtotal',sql.Decimal(19,2),subtotal);
  const result = await request.query(`SELECT TOP 1 PromotionId,PromotionCode,DiscountType,DiscountValue,MaxDiscountValue FROM dbo.Promotions
    WHERE PromotionCode=@code AND IsActive=1 AND MinOrderValue<=@subtotal AND StartsAt<=SYSUTCDATETIME() AND (EndsAt IS NULL OR EndsAt>SYSUTCDATETIME());`);
  const promo=result.recordset[0]; if(!promo)return {valid:false,code:'',discount:0,shipping:baseShipping,total:subtotal+baseShipping};
  let discount=promo.DiscountType==='percent'?subtotal*Number(promo.DiscountValue)/100:(promo.DiscountType==='fixed'?Number(promo.DiscountValue):0);
  if(promo.MaxDiscountValue!=null)discount=Math.min(discount,Number(promo.MaxDiscountValue));
  const shipping=promo.DiscountType==='shipping'?0:baseShipping;
  return {valid:true,code:promo.PromotionCode,discount:Math.round(discount),shipping,total:Math.max(0,subtotal-Math.round(discount)+shipping),promotionId:promo.PromotionId};
}

async function getOrders(userId) {
  const pool=await getPool(); const request=pool.request();
  let where=''; if(userId){request.input('userId',sql.UniqueIdentifier,userId);where='WHERE o.UserId=@userId';}
  const result=await request.query(`SELECT o.OrderId,o.OrderNumber,o.UserId,o.CustomerName,o.CustomerPhone,o.CustomerEmail,o.ShippingAddress,o.ShippingDistrict,o.ShippingCity,o.CustomerNote,o.ShippingMethod,o.PaymentMethod,o.OrderStatus,o.SubtotalAmount,o.DiscountAmount,o.ShippingAmount,o.TotalAmount,o.PlacedAt FROM dbo.Orders o ${where} ORDER BY o.PlacedAt DESC;
    SELECT oi.OrderId,oi.ProductId id,oi.ProductName name,oi.ImageUrl img,oi.UnitPrice price,oi.Quantity quantity,oi.SizeName size,oi.ColorName color FROM dbo.OrderItems oi;`);
  return result.recordsets[0].map((o)=>({id:o.OrderNumber,dbId:Number(o.OrderId),userId:o.UserId?String(o.UserId):null,customerName:o.CustomerName,customerPhone:o.CustomerPhone,address:{name:o.CustomerName,email:o.CustomerEmail,phone:o.CustomerPhone,address:o.ShippingAddress,district:o.ShippingDistrict,city:o.ShippingCity,note:o.CustomerNote},shippingMethod:o.ShippingMethod,payment:o.PaymentMethod,status:o.OrderStatus,subtotal:Number(o.SubtotalAmount),discount:Number(o.DiscountAmount),shipping:Number(o.ShippingAmount),total:Number(o.TotalAmount),createdAt:new Date(o.PlacedAt).getTime(),items:result.recordsets[1].filter(i=>String(i.OrderId)===String(o.OrderId)).map(i=>Object.assign({},i,{id:Number(i.id),price:Number(i.price),quantity:Number(i.quantity)}))}));
}

app.get('/api/health', asyncRoute(async (req,res)=>res.json({status:'ok',service:'bansac-api',database:await verifyConnection(),time:new Date().toISOString()})));
app.get('/api/health/database', asyncRoute(async (req,res)=>res.json({status:'ok',database:await verifyConnection()})));

app.post('/api/auth/register', asyncRoute(async (req,res)=>{
  const name=cleanText(req.body.name,80),email=cleanText(req.body.email,120).toLowerCase(),phone=cleanText(req.body.phone,20),password=String(req.body.password||'');
  if(name.length<2||!validEmail(email)||password.length<8)return res.status(400).json({error:'Thông tin chưa hợp lệ. Mật khẩu cần ít nhất 8 ký tự.'});
  if(await findUserByEmail(email))return res.status(409).json({error:'Email này đã được đăng ký.'});
  const pool=await getPool(); const result=await pool.request().input('name',sql.NVarChar(100),name).input('email',sql.VarChar(255),email).input('phone',sql.VarChar(20),phone||null).input('hash',sql.VarChar(255),hashPassword(password)).query(`INSERT dbo.Users(RoleId,FullName,Email,Phone,PasswordHash) OUTPUT INSERTED.UserId id,INSERTED.CreatedAt createdAt SELECT RoleId,@name,@email,@phone,@hash FROM dbo.Roles WHERE RoleCode='customer';`);
  const user={id:String(result.recordset[0].id),name,email,phone,role:'customer',createdAt:result.recordset[0].createdAt}; const token=await createSession(user.id,true);setSessionCookie(res,token,true);res.status(201).json({user:publicUser(user)});
}));
app.post('/api/auth/login',asyncRoute(async(req,res)=>{const email=cleanText(req.body.email,120).toLowerCase(),key=`${req.ip}:${email}`;if(rateLimited(key))return res.status(429).json({error:'Bạn đã thử quá nhiều lần. Vui lòng thử lại sau 15 phút.'});const user=await findUserByEmail(email);if(!user||!verifyPassword(String(req.body.password||''),user.passwordHash))return res.status(401).json({error:'Email hoặc mật khẩu chưa chính xác.'});const remember=req.body.remember!==false,token=await createSession(user.id,remember);setSessionCookie(res,token,remember);loginAttempts.delete(key);res.json({user:publicUser(user)});}));
app.get('/api/auth/me',requireAuth,(req,res)=>res.json({user:publicUser(req.user)}));
app.post('/api/auth/logout',optionalAuth,asyncRoute(async(req,res)=>{const token=getToken(req);if(token){const pool=await getPool();await pool.request().input('hash',sql.Char(64),tokenHash(token)).query('DELETE dbo.AuthSessions WHERE TokenHash=@hash');}res.setHeader('Set-Cookie','bansac_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');res.status(204).end();}));
app.post('/api/auth/forgot-password',asyncRoute(async(req,res)=>{const user=await findUserByEmail(cleanText(req.body.email,120).toLowerCase()),response={message:'Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.'};if(user){const token=randomToken(),pool=await getPool();await pool.request().input('userId',sql.UniqueIdentifier,user.id).input('hash',sql.Char(64),tokenHash(token)).query(`DELETE dbo.PasswordResetTokens WHERE UserId=@userId OR ExpiresAt<=SYSUTCDATETIME();INSERT dbo.PasswordResetTokens(UserId,TokenHash,ExpiresAt) VALUES(@userId,@hash,DATEADD(MINUTE,30,SYSUTCDATETIME()));`);if(process.env.NODE_ENV!=='production')response.devResetToken=token;}res.json(response);}));
app.post('/api/auth/reset-password',asyncRoute(async(req,res)=>{const password=String(req.body.password||'');if(password.length<8)return res.status(400).json({error:'Mật khẩu cần ít nhất 8 ký tự.'});const pool=await getPool(),transaction=new sql.Transaction(pool);await transaction.begin();try{const found=await new sql.Request(transaction).input('hash',sql.Char(64),tokenHash(String(req.body.token||''))).query('SELECT TOP 1 UserId FROM dbo.PasswordResetTokens WITH(UPDLOCK) WHERE TokenHash=@hash AND ExpiresAt>SYSUTCDATETIME() AND UsedAt IS NULL');if(!found.recordset[0]){await transaction.rollback();return res.status(400).json({error:'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.'});}const id=found.recordset[0].UserId;await new sql.Request(transaction).input('id',sql.UniqueIdentifier,id).input('password',sql.VarChar(255),hashPassword(password)).query('UPDATE dbo.Users SET PasswordHash=@password,UpdatedAt=SYSUTCDATETIME() WHERE UserId=@id;DELETE dbo.PasswordResetTokens WHERE UserId=@id;DELETE dbo.AuthSessions WHERE UserId=@id;');await transaction.commit();res.json({message:'Mật khẩu đã được cập nhật.'});}catch(e){await transaction.rollback().catch(()=>null);throw e;}}));

app.get('/api/products',asyncRoute(async(req,res)=>{let products=await loadProducts(false);if(req.query.category)products=products.filter(p=>p.category===req.query.category);if(req.query.gender)products=products.filter(p=>p.gender===req.query.gender);if(req.query.search){const q=String(req.query.search).toLowerCase();products=products.filter(p=>`${p.name} ${p.description}`.toLowerCase().includes(q));}res.json({products});}));
app.get('/api/products/:id',asyncRoute(async(req,res)=>{const product=await loadProduct(req.params.id,false);if(!product)return res.status(404).json({error:'Không tìm thấy sản phẩm.'});res.json({product});}));
app.get('/api/admin/products',...requireAdmin,asyncRoute(async(req,res)=>res.json({products:await loadProducts(true)})));
app.post('/api/products',...requireAdmin,asyncRoute(async(req,res)=>{if(!cleanText(req.body.name,120)||!Number(req.body.price))return res.status(400).json({error:'Tên và giá sản phẩm là bắt buộc.'});res.status(201).json({product:await saveProduct(req.body,null)});}));
app.put('/api/products/:id',...requireAdmin,asyncRoute(async(req,res)=>{if(!await loadProduct(req.params.id,true))return res.status(404).json({error:'Không tìm thấy sản phẩm.'});res.json({product:await saveProduct(req.body,req.params.id)});}));
app.delete('/api/products/:id',...requireAdmin,asyncRoute(async(req,res)=>{const pool=await getPool(),result=await pool.request().input('id',sql.BigInt,req.params.id).query("UPDATE dbo.Products SET Status='deleted',UpdatedAt=SYSUTCDATETIME() WHERE ProductId=@id AND Status<>'deleted'");res.status(result.rowsAffected[0]?204:404).end();}));

app.get('/api/cart',requireAuth,asyncRoute(async(req,res)=>{const pool=await getPool(),result=await pool.request().input('userId',sql.UniqueIdentifier,req.user.id).query(`SELECT p.ProductId id,ci.Quantity quantity,s.SizeCode size,COALESCE(co.HexCode,co.ColorName) color,CONCAT(p.ProductId,'-',COALESCE(s.SizeCode,'default'),'-',COALESCE(co.HexCode,co.ColorName,'default')) lineKey FROM dbo.Carts c JOIN dbo.CartItems ci ON ci.CartId=c.CartId JOIN dbo.ProductVariants v ON v.VariantId=ci.VariantId JOIN dbo.Products p ON p.ProductId=v.ProductId LEFT JOIN dbo.Sizes s ON s.SizeId=v.SizeId LEFT JOIN dbo.Colors co ON co.ColorId=v.ColorId WHERE c.UserId=@userId AND c.Status='active';`);res.json({items:result.recordset});}));
app.put('/api/cart',requireAuth,asyncRoute(async(req,res)=>{const items=Array.isArray(req.body.items)?req.body.items.slice(0,100):[],pool=await getPool(),transaction=new sql.Transaction(pool);await transaction.begin();try{const cartResult=await new sql.Request(transaction).input('userId',sql.UniqueIdentifier,req.user.id).query(`DECLARE @CartId UNIQUEIDENTIFIER=(SELECT CartId FROM dbo.Carts WHERE UserId=@userId AND Status='active');IF @CartId IS NULL BEGIN SET @CartId=NEWID();INSERT dbo.Carts(CartId,UserId,Status) VALUES(@CartId,@userId,'active');END SELECT @CartId CartId;`),cartId=cartResult.recordset[0].CartId;await new sql.Request(transaction).input('cartId',sql.UniqueIdentifier,cartId).query('DELETE dbo.CartItems WHERE CartId=@cartId');for(const item of items){const variant=await new sql.Request(transaction).input('id',sql.BigInt,item.id).input('size',sql.NVarChar(50),item.size||'').input('color',sql.NVarChar(80),item.color||'').query(`SELECT TOP 1 v.VariantId FROM dbo.ProductVariants v LEFT JOIN dbo.Sizes s ON s.SizeId=v.SizeId LEFT JOIN dbo.Colors c ON c.ColorId=v.ColorId WHERE v.ProductId=@id AND v.Status='active' AND (@size='' OR s.SizeCode=@size OR s.SizeName=@size OR (@size='Free Size' AND s.SizeCode='ONE')) AND (@color='' OR c.ColorName=@color OR c.HexCode=@color) ORDER BY v.VariantId;`);if(variant.recordset[0])await new sql.Request(transaction).input('cartId',sql.UniqueIdentifier,cartId).input('variantId',sql.BigInt,variant.recordset[0].VariantId).input('quantity',sql.Int,Math.max(1,Math.min(20,Number(item.quantity)||1))).query('INSERT dbo.CartItems(CartId,VariantId,Quantity) VALUES(@cartId,@variantId,@quantity)');}await transaction.commit();res.json({items});}catch(e){await transaction.rollback().catch(()=>null);throw e;}}));
app.post('/api/promos/validate',asyncRoute(async(req,res)=>{const subtotal=Math.max(0,Number(req.body.subtotal)||0),shipping=subtotal===0||subtotal>=1000000?0:50000,pricing=await calculatePromo(req.body.code,subtotal,shipping);if(!pricing.valid)return res.status(400).json({error:'Mã ưu đãi chưa hợp lệ hoặc đã hết hạn.'});res.json(pricing);}));

app.post('/api/orders',optionalAuth,asyncRoute(async(req,res)=>{const body=req.body||{},address=body.address||{};if(!cleanText(address.name,80)||!validEmail(address.email)||!cleanText(address.phone,20)||!cleanText(address.address,200))return res.status(400).json({error:'Thông tin giao hàng chưa đầy đủ.'});if(!Array.isArray(body.items)||!body.items.length)return res.status(400).json({error:'Giỏ hàng đang trống.'});const pool=await getPool(),transaction=new sql.Transaction(pool);await transaction.begin();try{let subtotal=0;const orderItems=[];for(const entry of body.items){const result=await new sql.Request(transaction).input('id',sql.BigInt,entry.id).input('size',sql.NVarChar(50),entry.size||'').input('color',sql.NVarChar(80),entry.color||'').query(`SELECT TOP 1 p.ProductId,p.ProductName,p.BasePrice,v.VariantId,v.Sku,v.StockQuantity,c.ColorName,s.SizeName,pi.ImageUrl FROM dbo.Products p JOIN dbo.ProductVariants v ON v.ProductId=p.ProductId LEFT JOIN dbo.Colors c ON c.ColorId=v.ColorId LEFT JOIN dbo.Sizes s ON s.SizeId=v.SizeId LEFT JOIN dbo.ProductImages pi ON pi.ProductId=p.ProductId AND pi.IsPrimary=1 WHERE p.ProductId=@id AND p.Status='active' AND v.Status='active' AND (@size='' OR s.SizeCode=@size OR s.SizeName=@size OR (@size='Free Size' AND s.SizeCode='ONE')) AND (@color='' OR c.ColorName=@color OR c.HexCode=@color) ORDER BY v.VariantId;`);const product=result.recordset[0],quantity=Math.max(1,Math.min(20,Number(entry.quantity)||1));if(!product)throw new Error('Một sản phẩm hoặc biến thể không còn tồn tại.');const updated=await new sql.Request(transaction).input('variantId',sql.BigInt,product.VariantId).input('quantity',sql.Int,quantity).query('UPDATE dbo.ProductVariants SET StockQuantity=StockQuantity-@quantity,UpdatedAt=SYSUTCDATETIME() WHERE VariantId=@variantId AND StockQuantity-ReservedQuantity>=@quantity');if(!updated.rowsAffected[0])throw new Error(`${product.ProductName} không đủ tồn kho.`);subtotal+=Number(product.BasePrice)*quantity;orderItems.push({product,quantity});}const baseShipping=body.shippingMethod==='express'?80000:(subtotal>=1000000?0:50000),pricing=await calculatePromo(body.promoCode,subtotal,baseShipping,transaction),number=`BS${Date.now()}${Math.floor(Math.random()*90+10)}`,payment=['cod','bank','card'].includes(body.payment)?body.payment:'cod';const inserted=await new sql.Request(transaction).input('number',sql.VarChar(30),number).input('userId',sql.UniqueIdentifier,req.user?req.user.id:null).input('promotionId',sql.BigInt,pricing.promotionId||null).input('name',sql.NVarChar(100),cleanText(address.name,100)).input('email',sql.VarChar(255),cleanText(address.email,255)).input('phone',sql.VarChar(20),cleanText(address.phone,20)).input('address',sql.NVarChar(255),cleanText(address.address,255)).input('district',sql.NVarChar(100),cleanText(address.district,100)||'Chưa cung cấp').input('city',sql.NVarChar(100),cleanText(address.city,100)||'Chưa cung cấp').input('note',sql.NVarChar(500),cleanText(address.note,500)||null).input('shippingMethod',sql.VarChar(20),body.shippingMethod==='express'?'express':'standard').input('payment',sql.VarChar(20),payment).input('subtotal',sql.Decimal(19,2),subtotal).input('discount',sql.Decimal(19,2),pricing.discount).input('shipping',sql.Decimal(19,2),pricing.shipping).query(`INSERT dbo.Orders(OrderNumber,UserId,PromotionId,CustomerName,CustomerEmail,CustomerPhone,ShippingAddress,ShippingDistrict,ShippingCity,CustomerNote,ShippingMethod,PaymentMethod,SubtotalAmount,DiscountAmount,ShippingAmount) OUTPUT INSERTED.OrderId id VALUES(@number,@userId,@promotionId,@name,@email,@phone,@address,@district,@city,@note,@shippingMethod,@payment,@subtotal,@discount,@shipping);`),orderId=inserted.recordset[0].id;for(const item of orderItems){const p=item.product;await new sql.Request(transaction).input('orderId',sql.BigInt,orderId).input('productId',sql.BigInt,p.ProductId).input('variantId',sql.BigInt,p.VariantId).input('name',sql.NVarChar(180),p.ProductName).input('sku',sql.VarChar(80),p.Sku).input('color',sql.NVarChar(80),p.ColorName).input('size',sql.NVarChar(50),p.SizeName).input('img',sql.NVarChar(1000),p.ImageUrl).input('price',sql.Decimal(19,2),p.BasePrice).input('quantity',sql.Int,item.quantity).query('INSERT dbo.OrderItems(OrderId,ProductId,VariantId,ProductName,Sku,ColorName,SizeName,ImageUrl,UnitPrice,Quantity) VALUES(@orderId,@productId,@variantId,@name,@sku,@color,@size,@img,@price,@quantity)');}if(req.user)await new sql.Request(transaction).input('userId',sql.UniqueIdentifier,req.user.id).query("UPDATE dbo.Carts SET Status='converted',UpdatedAt=SYSUTCDATETIME() WHERE UserId=@userId AND Status='active'");await transaction.commit();const orders=await getOrders(req.user?req.user.id:null),order=orders.find(o=>o.id===number);res.status(201).json({order});}catch(e){await transaction.rollback().catch(()=>null);res.status(400).json({error:e.message});}}));
app.get('/api/orders/my',requireAuth,asyncRoute(async(req,res)=>res.json({orders:await getOrders(req.user.id)})));
app.get('/api/orders',...requireAdmin,asyncRoute(async(req,res)=>res.json({orders:await getOrders(null)})));
app.patch('/api/orders/:id/status',...requireAdmin,asyncRoute(async(req,res)=>{const allowed=['pending','confirmed','shipping','completed','cancelled','returned'];if(!allowed.includes(req.body.status))return res.status(400).json({error:'Trạng thái không hợp lệ.'});const pool=await getPool(),result=await pool.request().input('id',sql.VarChar(30),req.params.id).input('status',sql.VarChar(20),req.body.status).input('userId',sql.UniqueIdentifier,req.user.id).query(`DECLARE @OrderId BIGINT=(SELECT OrderId FROM dbo.Orders WHERE OrderNumber=@id OR CONVERT(varchar(30),OrderId)=@id);IF @OrderId IS NOT NULL EXEC dbo.usp_ChangeOrderStatus @OrderId=@OrderId,@NewStatus=@status,@ChangedByUserId=@userId;SELECT @OrderId id;`);if(!result.recordset[0].id)return res.status(404).json({error:'Không tìm thấy đơn hàng.'});const orders=await getOrders(null);res.json({order:orders.find(o=>String(o.dbId)===String(result.recordset[0].id))});}));
app.put('/api/profile',requireAuth,asyncRoute(async(req,res)=>{const name=cleanText(req.body.name,80),phone=cleanText(req.body.phone,20);if(name.length<2)return res.status(400).json({error:'Họ tên chưa hợp lệ.'});const pool=await getPool();await pool.request().input('id',sql.UniqueIdentifier,req.user.id).input('name',sql.NVarChar(100),name).input('phone',sql.VarChar(20),phone||null).query('UPDATE dbo.Users SET FullName=@name,Phone=@phone,UpdatedAt=SYSUTCDATETIME() WHERE UserId=@id');res.json({user:publicUser(Object.assign({},req.user,{name,phone}))});}));
app.post('/api/contacts',optionalAuth,asyncRoute(async(req,res)=>{const name=cleanText(req.body.name,80),email=cleanText(req.body.email,120),message=cleanText(req.body.message,2000);if(!name||!validEmail(email)||message.length<5)return res.status(400).json({error:'Vui lòng nhập đầy đủ thông tin hỗ trợ.'});const pool=await getPool(),result=await pool.request().input('userId',sql.UniqueIdentifier,req.user?req.user.id:null).input('name',sql.NVarChar(100),name).input('email',sql.VarChar(255),email).input('topic',sql.NVarChar(100),cleanText(req.body.topic,100)||'Hỗ trợ').input('message',sql.NVarChar(sql.MAX),message).query('INSERT dbo.SupportRequests(UserId,FullName,Email,Topic,Message) OUTPUT INSERTED.SupportRequestId id,INSERTED.Status status VALUES(@userId,@name,@email,@topic,@message)');res.status(201).json({contact:result.recordset[0]});}));

if(process.env.SERVE_STATIC==='true'){const buildPath=path.join(__dirname,'..','build');app.use(express.static(buildPath));app.get('*',(req,res)=>res.sendFile(path.join(buildPath,'index.html')));}
app.use((req,res)=>res.status(404).json({error:'API endpoint không tồn tại.'}));
app.use((error,req,res,next)=>{console.error(error);res.status(500).json({error:process.env.NODE_ENV==='production'?'Đã có lỗi máy chủ. Vui lòng thử lại.':error.message});});

async function initialize(){const pool=await getPool();await verifyConnection();const email=String(process.env.ADMIN_EMAIL||'admin@bansac.vn').toLowerCase();const exists=await findUserByEmail(email);if(!exists){await pool.request().input('name',sql.NVarChar(100),'BẢN SẮC Admin').input('email',sql.VarChar(255),email).input('hash',sql.VarChar(255),hashPassword(process.env.ADMIN_PASSWORD||'Admin@123')).query(`INSERT dbo.Users(RoleId,FullName,Email,PasswordHash) SELECT RoleId,@name,@email,@hash FROM dbo.Roles WHERE RoleCode='admin';`);}}

module.exports={app,initialize};
