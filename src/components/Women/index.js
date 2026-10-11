import React from 'react';
import ProductCatalog from '../ProductCatalog';
const Women = () => <ProductCatalog eyebrow="Bộ sưu tập dành cho nữ" title="Nữ" description="Những đường nét mềm mại, phom dáng hiện đại và chất liệu được tuyển chọn cho tủ đồ thanh lịch mỗi ngày." filter={(product) => product.gender === 'women'} />;
export default Women;
