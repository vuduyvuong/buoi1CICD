import linenShirt from '../../img/Brown Linen Shirt-image-container.png';
import woolShirt from '../../img/Warm Woolen Shirt Women-image-container.png';
import goldWatch from '../../img/Women Watch Gold-image-container.png';
import pearlNecklace from '../../img/Black Pearl Necklace-image-container.png';
import editorialOne from '../../img/photo-1602810318383-e386cc2a3ccf.avif';
import editorialTwo from '../../img/photo-1584917865442-de89df76afd3.avif';
import editorialThree from '../../img/photo-1556905055-8f358a7a47b2.avif';
import editorialFour from '../../img/photo-1544441893-675973e31985.avif';
import editorialFive from '../../img/photo-1524805444758-089113d48a6d.avif';
import editorialSix from '../../img/338493_637289e70f3a49bb9167ee5f129f13f8~mv2.avif';

const products = [
  { id: 1, name: 'Áo Sơ Mi Linen Nâu', description: 'Linen tự nhiên, phom suông thanh lịch', price: 1450000, gender: 'women', type: 'shirt', img: linenShirt, category: 'clothes', badge: 'Mới', colors: ['#8c6648', '#e7dfd2'], sizes: ['S', 'M', 'L'] },
  { id: 2, name: 'Sơ Mi Lụa Cát', description: 'Bề mặt mềm nhẹ, đường may tối giản', price: 1690000, gender: 'women', type: 'shirt', img: editorialTwo, category: 'clothes', badge: 'Độc quyền', colors: ['#d8c5ad', '#1d2430'], sizes: ['S', 'M', 'L'] },
  { id: 3, name: 'Blazer Cấu Trúc', description: 'Cầu vai sắc nét, tinh thần đương đại', price: 3290000, gender: 'women', type: 'blazer', img: editorialFour, category: 'clothes', badge: 'Limited', colors: ['#222222', '#b6aa9a'], sizes: ['S', 'M', 'L'] },
  { id: 4, name: 'Áo Len Dệt Ấm', description: 'Sợi len cao cấp cho những ngày se lạnh', price: 3850000, gender: 'women', type: 'knitwear', img: woolShirt, category: 'clothes', badge: 'Bán chạy', colors: ['#ded7ca', '#4d443d'], sizes: ['S', 'M', 'L'] },
  { id: 5, name: 'Đầm Midi Tĩnh Lặng', description: 'Dáng rủ nữ tính cùng bảng màu trung tính', price: 2890000, gender: 'women', type: 'dress', img: editorialOne, category: 'clothes', colors: ['#ebe5dc', '#243047'], sizes: ['XS', 'S', 'M', 'L'] },
  { id: 6, name: 'Áo Khoác Dạ Giao Mùa', description: 'Kết cấu nhẹ, hoàn thiện thủ công', price: 4590000, gender: 'women', type: 'coat', img: editorialThree, category: 'clothes', colors: ['#88786b', '#161616'], sizes: ['S', 'M', 'L'] },
  { id: 7, name: 'Sơ Mi Nam Essential', description: 'Cotton thoáng mát, phom regular fit', price: 1590000, gender: 'men', type: 'shirt', img: editorialFive, category: 'clothes', badge: 'Mới', colors: ['#f0ede7', '#2c3643'], sizes: ['M', 'L', 'XL'] },
  { id: 8, name: 'Áo Khoác Nam Studio', description: 'Thiết kế đa lớp với chi tiết tinh giản', price: 3950000, gender: 'men', type: 'jacket', img: editorialSix, category: 'clothes', colors: ['#232323', '#8b8175'], sizes: ['M', 'L', 'XL'] },
  { id: 9, name: 'Quần Âu Relaxed', description: 'Ly đứng mềm, chuyển động thoải mái', price: 1890000, gender: 'men', type: 'trousers', img: editorialFour, category: 'clothes', colors: ['#202020', '#c1b8aa'], sizes: ['M', 'L', 'XL'] },
  { id: 10, name: 'Áo Polo Dệt Kim', description: 'Chất dệt mịn, cổ áo hiện đại', price: 1750000, gender: 'men', type: 'shirt', img: editorialFive, category: 'clothes', colors: ['#ede8dd', '#303b49'], sizes: ['M', 'L', 'XL'] },
  { id: 11, name: 'Đồng Hồ Nữ Ánh Kim', description: 'Mặt số thanh mảnh, dây thép mạ vàng', price: 4200000, gender: 'women', type: 'watch', img: goldWatch, category: 'accessories', badge: 'Phụ kiện', colors: ['#c5a467'], sizes: ['Một cỡ'] },
  { id: 12, name: 'Vòng Cổ Ngọc Trai Đen', description: 'Ngọc trai tuyển chọn, hoàn thiện thủ công', price: 890000, gender: 'women', type: 'necklace', img: pearlNecklace, category: 'accessories', badge: 'Thủ công', colors: ['#202020'], sizes: ['Một cỡ'] }
];

export function getProducts() {
  try {
    const remote = JSON.parse(localStorage.getItem('BANSAC_CATALOG_CACHE')) || [];
    if (!remote.length) return products;
    return remote.map((item) => {
      const local = products.find((product) => String(product.id) === String(item.id));
      return Object.assign({}, local || {}, item, { img: item.img || (local && local.img) || '' });
    });
  } catch (error) { return products; }
}

export default products;
