import React from 'react';
import ProductCatalog from '../ProductCatalog';
const Accessories = () => <ProductCatalog eyebrow="Điểm nhấn hoàn thiện" title="Phụ kiện" description="Những chi tiết nhỏ được chế tác kỹ lưỡng để tạo nên dấu ấn cá nhân khác biệt và đầy tinh tế." filter={(product) => product.category === 'accessories'} />;
export default Accessories;
