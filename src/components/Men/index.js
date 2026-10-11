import React from 'react';
import ProductCatalog from '../ProductCatalog';
const Men = () => <ProductCatalog eyebrow="Bộ sưu tập dành cho nam" title="Nam" description="Tủ đồ nam đương đại cân bằng giữa cấu trúc, sự thoải mái và tinh thần tối giản vượt thời gian." filter={(product) => product.gender === 'men'} />;
export default Men;
