const express = require('express');
const path = require('path');
const db = require('./db');
const { verifyConnection } = require('./sqlserver');
const { hashPassword, verifyPassword, randomToken, tokenHash, publicUser } = require('./security');

const app = express();
const PORT = Number(process.env.PORT || 4000);
const SESSION_DAYS = 7;
const loginAttempts = new Map();

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

function parseCookies(req) {
  return String(req.headers.cookie || '').split(';').reduce((result, part) => {
    const index = part.indexOf('=');
    if (index > -1) result[part.slice(0, index).trim()] = decodeURIComponent(part.slice(index + 1).trim());
    return result;
  }, {});
}

function getToken(req) {
  const authorization = req.headers.authorization || '';
  if (authorization.indexOf('Bearer ') === 0) return authorization.slice(7);
  return parseCookies(req).bansac_session || '';
}

function findSessionUser(req) {
  const token = getToken(req);
  if (!token) return null;
  const data = db.read();
  const session = data.sessions.find((item) => item.tokenHash === tokenHash(token) && item.expiresAt > Date.now());
  if (!session) return null;
  return data.users.find((user) => user.id === session.userId) || null;
}

function optionalAuth(req, res, next) { req.user = findSessionUser(req); next(); }
function requireAuth(req, res, next) { req.user = findSessionUser(req); if (!req.user) return res.status(401).json({ error: 'Vui lòng đăng nhập để tiếp tục.' }); next(); }
function requireAdmin(req, res, next) { requireAuth(req, res, () => req.user.role === 'admin' ? next() : res.status(403).json({ error: 'Bạn không có quyền thực hiện thao tác này.' })); }

function cleanText(value, max) { return String(value || '').trim().slice(0, max || 500); }
function validEmail(value) { return /^\S+@\S+\.\S+$/.test(String(value || '').trim()); }
function setSessionCookie(res, token, persistent) {
  const secure = process.env.COOKIE_SECURE === 'true' ? '; Secure' : '';
  const maxAge = persistent ? `; Max-Age=${SESSION_DAYS * 86400}` : '';
  res.setHeader('Set-Cookie', `bansac_session=${token}; HttpOnly; SameSite=Lax; Path=/${maxAge}${secure}`);
}

function createSession(userId, persistent) {
  const token = randomToken();
  db.update((data) => {
    data.sessions = data.sessions.filter((item) => item.expiresAt > Date.now() && item.userId !== userId);
    data.sessions.push({ id: Date.now(), userId, tokenHash: tokenHash(token), createdAt: Date.now(), expiresAt: Date.now() + SESSION_DAYS * 86400000 });
  });
  return token;
}

function rateLimited(key) {
  const now = Date.now();
  const attempts = (loginAttempts.get(key) || []).filter((time) => now - time < 15 * 60 * 1000);
  attempts.push(now); loginAttempts.set(key, attempts);
  return attempts.length > 10;
}

function calculatePromo(data, code, subtotal, baseShipping) {
  const promo = data.promos.find((item) => item.active && item.code === String(code || '').trim().toUpperCase() && subtotal >= item.minOrder);
  if (!promo) return { code: '', discount: 0, shipping: baseShipping, total: subtotal + baseShipping, valid: !code };
  if (promo.type === 'shipping' && baseShipping > 50000) return { code: '', discount: 0, shipping: baseShipping, total: subtotal + baseShipping, valid: false };
  const discount = promo.type === 'percent' ? Math.round(subtotal * promo.value / 100) : 0;
  const shipping = promo.type === 'shipping' ? 0 : baseShipping;
  return { code: promo.code, discount, shipping, total: Math.max(0, subtotal - discount + shipping), valid: true };
}

function seedAdmin() {
  const data = db.read();
  if (data.users.some((user) => user.role === 'admin')) return;
  db.update((database) => database.users.push({ id: `usr_${Date.now()}`, name: 'BẢN SẮC Admin', email: String(process.env.ADMIN_EMAIL || 'admin@bansac.vn').toLowerCase(), phone: '', passwordHash: hashPassword(process.env.ADMIN_PASSWORD || 'Admin@123'), role: 'admin', createdAt: Date.now() }));
}

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'bansac-api', time: new Date().toISOString() }));
app.get('/api/health/database', async (req, res) => {
  try {
    const database = await verifyConnection();
    res.json({ status: 'ok', database });
  } catch (error) {
    res.status(503).json({ status: 'error', error: error.message });
  }
});

app.post('/api/auth/register', (req, res) => {
  const name = cleanText(req.body.name, 80); const email = cleanText(req.body.email, 120).toLowerCase(); const phone = cleanText(req.body.phone, 20); const password = String(req.body.password || '');
  if (name.length < 2 || !validEmail(email) || password.length < 8) return res.status(400).json({ error: 'Thông tin chưa hợp lệ. Mật khẩu cần ít nhất 8 ký tự.' });
  const data = db.read();
  if (data.users.some((user) => user.email === email)) return res.status(409).json({ error: 'Email này đã được đăng ký.' });
  const user = { id: `usr_${Date.now()}_${Math.floor(Math.random()*1000)}`, name, email, phone, passwordHash: hashPassword(password), role: 'customer', createdAt: Date.now() };
  db.update((database) => database.users.push(user));
  const token = createSession(user.id, true); setSessionCookie(res, token, true);
  res.status(201).json({ user: publicUser(user) });
});

app.post('/api/auth/login', (req, res) => {
  const email = cleanText(req.body.email, 120).toLowerCase(); const key = `${req.ip}:${email}`;
  if (rateLimited(key)) return res.status(429).json({ error: 'Bạn đã thử quá nhiều lần. Vui lòng thử lại sau 15 phút.' });
  const user = db.read().users.find((item) => item.email === email);
  if (!user || !verifyPassword(String(req.body.password || ''), user.passwordHash)) return res.status(401).json({ error: 'Email hoặc mật khẩu chưa chính xác.' });
  const remember = req.body.remember !== false; const token = createSession(user.id, remember); setSessionCookie(res, token, remember);
  loginAttempts.delete(key); res.json({ user: publicUser(user) });
});

app.get('/api/auth/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));
app.post('/api/auth/logout', optionalAuth, (req, res) => { const token = getToken(req); if (token) db.update((data) => { data.sessions = data.sessions.filter((item) => item.tokenHash !== tokenHash(token)); }); res.setHeader('Set-Cookie', 'bansac_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0'); res.status(204).end(); });
app.post('/api/auth/forgot-password', (req, res) => { const email = cleanText(req.body.email, 120).toLowerCase(); const user = db.read().users.find((item) => item.email === email); let resetToken = null; if (user) { resetToken = randomToken(); db.update((data) => { data.passwordResets = data.passwordResets.filter((item) => item.expiresAt > Date.now() && item.userId !== user.id); data.passwordResets.push({ userId:user.id, tokenHash:tokenHash(resetToken), expiresAt:Date.now()+30*60*1000 }); }); } const response={ message:'Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.' }; if (process.env.NODE_ENV !== 'production' && resetToken) response.devResetToken=resetToken; res.json(response); });
app.post('/api/auth/reset-password', (req, res) => { const token=String(req.body.token||'');const password=String(req.body.password||'');if(password.length<8)return res.status(400).json({error:'Mật khẩu cần ít nhất 8 ký tự.'});const data=db.read();const reset=data.passwordResets.find((item)=>item.tokenHash===tokenHash(token)&&item.expiresAt>Date.now());if(!reset)return res.status(400).json({error:'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.'});db.update((database)=>{const user=database.users.find((item)=>item.id===reset.userId);user.passwordHash=hashPassword(password);database.passwordResets=database.passwordResets.filter((item)=>item.userId!==reset.userId);database.sessions=database.sessions.filter((item)=>item.userId!==reset.userId);});res.json({message:'Mật khẩu đã được cập nhật.'}); });

app.get('/api/products', (req, res) => { let products=db.read().products.filter((item)=>item.status==='active');if(req.query.category)products=products.filter((item)=>item.category===req.query.category);if(req.query.gender)products=products.filter((item)=>item.gender===req.query.gender);if(req.query.search){const q=String(req.query.search).toLowerCase();products=products.filter((item)=>`${item.name} ${item.description}`.toLowerCase().includes(q));}res.json({products}); });
app.get('/api/products/:id', (req, res) => { const product=db.read().products.find((item)=>String(item.id)===req.params.id&&item.status==='active');if(!product)return res.status(404).json({error:'Không tìm thấy sản phẩm.'});res.json({product}); });
app.get('/api/admin/products', requireAdmin, (req, res) => res.json({ products: db.read().products.filter((item) => item.status !== 'deleted') }));
app.post('/api/products', requireAdmin, (req, res) => {
  const body=req.body||{};
  if(!cleanText(body.name,120)||!Number(body.price))return res.status(400).json({error:'Tên và giá sản phẩm là bắt buộc.'});
  const product=Object.assign({},body,{id:`prd_${Date.now()}`,name:cleanText(body.name,120),description:cleanText(body.description,500),price:Number(body.price),stock:Math.max(0,Number(body.stock)||0),status:body.status||'active',sizes:Array.isArray(body.sizes)?body.sizes:(body.selectedSizes||['Một cỡ']),colors:Array.isArray(body.colors)?body.colors:['#222222'],img:cleanText(body.img||(body.images&&body.images[0]),1000),category:body.category||'clothes',gender:body.gender||'women',type:body.type||'item'});
  db.update((data)=>data.products.push(product));res.status(201).json({product});
});
app.put('/api/products/:id', requireAdmin, (req, res) => {
  let product;db.update((data)=>{const index=data.products.findIndex((item)=>String(item.id)===req.params.id);if(index<0)return;product=Object.assign({},data.products[index],req.body,{id:data.products[index].id,price:Number(req.body.price===undefined?data.products[index].price:req.body.price),stock:Math.max(0,Number(req.body.stock===undefined?data.products[index].stock:req.body.stock))});if(req.body.selectedSizes&&!req.body.sizes)product.sizes=req.body.selectedSizes;if(req.body.images&&req.body.images[0])product.img=req.body.images[0];if(!Array.isArray(product.colors)||!product.colors.length)product.colors=['#222222'];data.products[index]=product;});
  if(!product)return res.status(404).json({error:'Không tìm thấy sản phẩm.'});res.json({product});
});
app.delete('/api/products/:id', requireAdmin, (req, res) => { let found=false;db.update((data)=>{const product=data.products.find((item)=>String(item.id)===req.params.id);if(product){product.status='deleted';found=true;}});res.status(found?204:404).end(); });

app.get('/api/cart', requireAuth, (req, res) => { const cart=db.read().carts.find((item)=>item.userId===req.user.id);res.json({items:cart?cart.items:[]}); });
app.put('/api/cart', requireAuth, (req, res) => { const items=Array.isArray(req.body.items)?req.body.items.slice(0,100).map((item)=>({id:item.id,quantity:Math.max(1,Math.min(20,Number(item.quantity)||1)),size:cleanText(item.size,20)||null,color:cleanText(item.color,30)||null,lineKey:cleanText(item.lineKey,100)})):[];db.update((data)=>{const cart=data.carts.find((item)=>item.userId===req.user.id);if(cart){cart.items=items;cart.updatedAt=Date.now();}else data.carts.push({userId:req.user.id,items,updatedAt:Date.now()});});res.json({items}); });
app.post('/api/promos/validate', (req, res) => { const subtotal=Math.max(0,Number(req.body.subtotal)||0);const shipping=subtotal===0||subtotal>=1000000?0:50000;const pricing=calculatePromo(db.read(),req.body.code,subtotal,shipping);if(!pricing.valid)return res.status(400).json({error:'Mã ưu đãi chưa hợp lệ hoặc đã hết hạn.'});res.json(pricing); });

app.post('/api/orders', optionalAuth, (req, res) => {
  const body=req.body||{};const address=body.address||{};if(!cleanText(address.name,80)||!validEmail(address.email)||!cleanText(address.phone,20)||!cleanText(address.address,200))return res.status(400).json({error:'Thông tin giao hàng chưa đầy đủ.'});if(!Array.isArray(body.items)||!body.items.length)return res.status(400).json({error:'Giỏ hàng đang trống.'});
  try { const order=db.update((data)=>{let subtotal=0;const items=body.items.map((entry)=>{const product=data.products.find((item)=>String(item.id)===String(entry.id)&&item.status==='active');if(!product)throw new Error('Một sản phẩm không còn tồn tại.');const quantity=Math.max(1,Math.min(20,Number(entry.quantity)||1));if(product.stock<quantity)throw new Error(`${product.name} không đủ tồn kho.`);if(product.sizes&&entry.size&&!product.sizes.includes(entry.size))throw new Error(`Kích cỡ của ${product.name} không hợp lệ.`);product.stock-=quantity;subtotal+=product.price*quantity;return {id:product.id,name:product.name,img:product.img||'',price:product.price,quantity,size:entry.size||null,color:entry.color||null};});const baseShipping=body.shippingMethod==='express'?80000:(subtotal>=1000000?0:50000);const pricing=calculatePromo(data,body.promoCode,subtotal,baseShipping);const created={id:`BS${String(Date.now()).slice(-8)}`,userId:req.user?req.user.id:null,customerName:cleanText(address.name,80),customerPhone:cleanText(address.phone,20),address:{name:cleanText(address.name,80),email:cleanText(address.email,120),phone:cleanText(address.phone,20),address:cleanText(address.address,200),district:cleanText(address.district,80),city:cleanText(address.city,80),note:cleanText(address.note,300)},items,subtotal,shipping:pricing.shipping,discount:pricing.discount,total:pricing.total,promoCode:pricing.code,payment:['cod','bank','card'].includes(body.payment)?body.payment:'cod',shippingMethod:body.shippingMethod==='express'?'express':'standard',status:'pending',createdAt:Date.now()};data.orders.push(created);if(req.user){const cart=data.carts.find((item)=>item.userId===req.user.id);if(cart)cart.items=[];}return created;});res.status(201).json({order}); } catch(error){res.status(400).json({error:error.message});}
});
app.get('/api/orders/my', requireAuth, (req, res) => res.json({orders:db.read().orders.filter((item)=>item.userId===req.user.id).sort((a,b)=>b.createdAt-a.createdAt)}));
app.get('/api/orders', requireAdmin, (req, res) => res.json({orders:db.read().orders.slice().sort((a,b)=>b.createdAt-a.createdAt)}));
app.patch('/api/orders/:id/status', requireAdmin, (req, res) => { const allowed=['pending','confirmed','shipping','completed','cancelled'];if(!allowed.includes(req.body.status))return res.status(400).json({error:'Trạng thái không hợp lệ.'});let order;db.update((data)=>{order=data.orders.find((item)=>item.id===req.params.id);if(order)order.status=req.body.status;});if(!order)return res.status(404).json({error:'Không tìm thấy đơn hàng.'});res.json({order}); });

app.put('/api/profile', requireAuth, (req, res) => { const name=cleanText(req.body.name,80);const phone=cleanText(req.body.phone,20);if(name.length<2)return res.status(400).json({error:'Họ tên chưa hợp lệ.'});let user;db.update((data)=>{user=data.users.find((item)=>item.id===req.user.id);user.name=name;user.phone=phone;});res.json({user:publicUser(user)}); });
app.post('/api/contacts', optionalAuth, (req, res) => { const name=cleanText(req.body.name,80);const email=cleanText(req.body.email,120);const message=cleanText(req.body.message,2000);if(!name||!validEmail(email)||message.length<5)return res.status(400).json({error:'Vui lòng nhập đầy đủ thông tin hỗ trợ.'});const contact={id:`ct_${Date.now()}`,userId:req.user?req.user.id:null,name,email,topic:cleanText(req.body.topic,80),message,status:'new',createdAt:Date.now()};db.update((data)=>data.contacts.push(contact));res.status(201).json({contact:{id:contact.id,status:contact.status}}); });

if (process.env.SERVE_STATIC === 'true') {
  const buildPath=path.join(__dirname,'..','build');app.use(express.static(buildPath));app.get('*',(req,res)=>res.sendFile(path.join(buildPath,'index.html')));
}

app.use((req, res) => res.status(404).json({ error: 'API endpoint không tồn tại.' }));
app.use((error, req, res, next) => { console.error(error); res.status(500).json({ error: 'Đã có lỗi máy chủ. Vui lòng thử lại.' }); });

seedAdmin();
if (require.main === module) app.listen(PORT, () => console.log(`BẢN SẮC API đang chạy tại http://localhost:${PORT}`));
module.exports = app;
