import React from 'react';
import ProductCatalog from '../ProductCatalog';
const Clothes = () => <ProductCatalog eyebrow="Tuyển tập mùa mới" title="Trang phục" description="Khám phá những thiết kế chủ đạo của BẢN SẮC — được tạo nên để đồng hành lâu dài cùng nhịp sống hiện đại." filter={(product) => product.category === 'clothes'} />;
export default Clothes;
