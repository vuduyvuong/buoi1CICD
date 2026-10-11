const fs = require('fs');
const path = require('path');

const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data');
const dbPath = process.env.DB_FILE || path.join(dataDir, 'db.json');

const initialProducts = [
  { id: 1, name: 'Áo Sơ Mi Linen Nâu', description: 'Linen tự nhiên, phom suông thanh lịch', price: 1450000, gender: 'women', type: 'shirt', category: 'clothes', badge: 'Mới', colors: ['#8c6648','#e7dfd2'], sizes: ['S','M','L'], stock: 28, status: 'active' },
  { id: 2, name: 'Sơ Mi Lụa Cát', description: 'Bề mặt mềm nhẹ, đường may tối giản', price: 1690000, gender: 'women', type: 'shirt', category: 'clothes', badge: 'Độc quyền', colors: ['#d8c5ad','#1d2430'], sizes: ['S','M','L'], stock: 18, status: 'active' },
  { id: 3, name: 'Blazer Cấu Trúc', description: 'Cầu vai sắc nét, tinh thần đương đại', price: 3290000, gender: 'women', type: 'blazer', category: 'clothes', badge: 'Limited', colors: ['#222222','#b6aa9a'], sizes: ['S','M','L'], stock: 12, status: 'active' },
  { id: 4, name: 'Áo Len Dệt Ấm', description: 'Sợi len cao cấp cho những ngày se lạnh', price: 3850000, gender: 'women', type: 'knitwear', category: 'clothes', badge: 'Bán chạy', colors: ['#ded7ca','#4d443d'], sizes: ['S','M','L'], stock: 20, status: 'active' },
  { id: 5, name: 'Đầm Midi Tĩnh Lặng', description: 'Dáng rủ nữ tính cùng bảng màu trung tính', price: 2890000, gender: 'women', type: 'dress', category: 'clothes', colors: ['#ebe5dc','#243047'], sizes: ['XS','S','M','L'], stock: 15, status: 'active' },
  { id: 6, name: 'Áo Khoác Dạ Giao Mùa', description: 'Kết cấu nhẹ, hoàn thiện thủ công', price: 4590000, gender: 'women', type: 'coat', category: 'clothes', colors: ['#88786b','#161616'], sizes: ['S','M','L'], stock: 9, status: 'active' },
  { id: 7, name: 'Sơ Mi Nam Essential', description: 'Cotton thoáng mát, phom regular fit', price: 1590000, gender: 'men', type: 'shirt', category: 'clothes', badge: 'Mới', colors: ['#f0ede7','#2c3643'], sizes: ['M','L','XL'], stock: 26, status: 'active' },
  { id: 8, name: 'Áo Khoác Nam Studio', description: 'Thiết kế đa lớp với chi tiết tinh giản', price: 3950000, gender: 'men', type: 'jacket', category: 'clothes', colors: ['#232323','#8b8175'], sizes: ['M','L','XL'], stock: 11, status: 'active' },
  { id: 9, name: 'Quần Âu Relaxed', description: 'Ly đứng mềm, chuyển động thoải mái', price: 1890000, gender: 'men', type: 'trousers', category: 'clothes', colors: ['#202020','#c1b8aa'], sizes: ['M','L','XL'], stock: 23, status: 'active' },
  { id: 10, name: 'Áo Polo Dệt Kim', description: 'Chất dệt mịn, cổ áo hiện đại', price: 1750000, gender: 'men', type: 'shirt', category: 'clothes', colors: ['#ede8dd','#303b49'], sizes: ['M','L','XL'], stock: 30, status: 'active' },
  { id: 11, name: 'Đồng Hồ Nữ Ánh Kim', description: 'Mặt số thanh mảnh, dây thép mạ vàng', price: 4200000, gender: 'women', type: 'watch', category: 'accessories', badge: 'Phụ kiện', colors: ['#c5a467'], sizes: ['Một cỡ'], stock: 8, status: 'active' },
  { id: 12, name: 'Vòng Cổ Ngọc Trai Đen', description: 'Ngọc trai tuyển chọn, hoàn thiện thủ công', price: 890000, gender: 'women', type: 'necklace', category: 'accessories', badge: 'Thủ công', colors: ['#202020'], sizes: ['Một cỡ'], stock: 17, status: 'active' }
];

const initialData = { users: [], sessions: [], passwordResets: [], products: initialProducts, carts: [], orders: [], contacts: [], promos: [
  { code: 'BANSAC10', type: 'percent', value: 10, active: true, minOrder: 0 },
  { code: 'FREESHIP', type: 'shipping', value: 100, active: true, minOrder: 0 }
] };

function ensureDb() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), 'utf8');
}

function read() {
  ensureDb();
  try { return JSON.parse(fs.readFileSync(dbPath, 'utf8')); }
  catch (error) { throw new Error(`Không thể đọc database: ${error.message}`); }
}

function write(data) {
  ensureDb();
  const tempPath = `${dbPath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tempPath, dbPath);
  return data;
}

function update(mutator) {
  const data = read();
  const result = mutator(data);
  write(data);
  return result;
}

module.exports = { read, write, update, ensureDb, dbPath };
