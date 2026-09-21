// Dependencies
import React, { Component } from 'react';
import ProductFormModal from './ProductFormModal';

class ProductManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: '',
      categoryFilter: 'all',
      statusFilter: 'all',
      isModalOpen: false,
      editingProduct: null,
    };
  }

  handleOpenAddModal = () => {
    this.setState({
      isModalOpen: true,
      editingProduct: null,
    });
  };

  handleOpenEditModal = (product) => {
    this.setState({
      isModalOpen: true,
      editingProduct: product,
    });
  };

  handleCloseModal = () => {
    this.setState({
      isModalOpen: false,
      editingProduct: null,
    });
  };

  handleSaveProduct = (productData) => {
    this.props.onSaveProduct(productData);
    this.handleCloseModal();
  };

  formatCurrency = (val) => {
    return (val || 0).toLocaleString('vi-VN') + ' ₫';
  };

  render() {
    const { products, onDeleteProduct, onToggleProductStatus } = this.props;
    const { searchQuery, categoryFilter, statusFilter, isModalOpen, editingProduct } = this.state;

    // Lọc và tìm kiếm
    const filteredProducts = (products || []).filter(p => {
      const matchSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.sku || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    });

    return (
      <div className="product-manager-view">
        {/* Header bar */}
        <div className="pm-header-bar">
          <div>
            <h2>Quản lý Sản phẩm</h2>
            <span style={{ fontSize: '13.5px', color: '#64748B' }}>
              Tổng số: <strong>{(products || []).length}</strong> sản phẩm | Đang hiển thị: {filteredProducts.length}
            </span>
          </div>
          <button
            type="button"
            className="btn-add-product"
            onClick={this.handleOpenAddModal}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Thêm sản phẩm mới
          </button>
        </div>

        {/* Filter bar */}
        <div className="filter-bar">
          <div className="search-filter-box">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên sản phẩm hoặc mã SKU..."
              value={searchQuery}
              onChange={(e) => this.setState({ searchQuery: e.target.value })}
            />
          </div>

          <select
            className="select-filter"
            value={categoryFilter}
            onChange={(e) => this.setState({ categoryFilter: e.target.value })}
          >
            <option value="all">Tất cả danh mục</option>
            <option value="clothes">Trang phục (Clothes)</option>
            <option value="women">Thời trang Nữ</option>
            <option value="men">Thời trang Nam</option>
            <option value="accessories">Phụ kiện (Accessories)</option>
          </select>

          <select
            className="select-filter"
            value={statusFilter}
            onChange={(e) => this.setState({ statusFilter: e.target.value })}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang bán</option>
            <option value="hidden">Tạm ẩn</option>
            <option value="out_of_stock">Hết hàng</option>
          </select>
        </div>

        {/* Products Data Table */}
        <div className="admin-card">
          <div className="data-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Giá bán</th>
                  <th>Tồn kho</th>
                  <th>Biến thể (Size / Màu)</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                      Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const isLowStock = (p.stock || 0) <= 5;
                    return (
                      <tr key={p.id}>
                        {/* Sản phẩm */}
                        <td>
                          <div className="product-cell">
                            <img src={p.img} alt={p.name} className="product-cell-img" />
                            <div className="product-cell-info">
                              <p className="title">{p.name}</p>
                              <p className="sku">SKU: {p.sku || `BS-${p.id}`}</p>
                            </div>
                          </div>
                        </td>

                        {/* Danh mục */}
                        <td>
                          <span style={{ textTransform: 'capitalize' }}>
                            {p.category === 'clothes' ? 'Trang phục' :
                             p.category === 'women' ? 'Nữ' :
                             p.category === 'men' ? 'Nam' :
                             p.category === 'accessories' ? 'Phụ kiện' : p.category}
                          </span>
                        </td>

                        {/* Giá */}
                        <td>
                          <strong>{this.formatCurrency(p.price)}</strong>
                          {p.originalPrice && (
                            <div>
                              <small style={{ textDecoration: 'line-through', color: '#94A3B8' }}>
                                {this.formatCurrency(p.originalPrice)}
                              </small>
                            </div>
                          )}
                        </td>

                        {/* Tồn kho */}
                        <td>
                          <span style={{
                            fontWeight: 700,
                            color: isLowStock ? '#EF4444' : '#0F172A',
                            backgroundColor: isLowStock ? '#FEE2E2' : 'transparent',
                            padding: isLowStock ? '3px 8px' : 0,
                            borderRadius: '4px'
                          }}>
                            {p.stock !== undefined ? p.stock : 25} cái
                          </span>
                          {isLowStock && <small style={{ display: 'block', color: '#EF4444' }}>Sắp hết</small>}
                        </td>

                        {/* Biến thể */}
                        <td>
                          {p.variants && p.variants.length > 0 ? (
                            <div className="variant-tag-group">
                              {p.selectedSizes && p.selectedSizes.map(s => (
                                <span key={s} className="variant-tag">Size {s}</span>
                              ))}
                              {p.selectedColors && p.selectedColors.slice(0, 2).map(c => (
                                <span key={c} className="variant-tag">{c}</span>
                              ))}
                              {p.selectedColors && p.selectedColors.length > 2 && (
                                <span className="variant-tag">+{p.selectedColors.length - 2} màu</span>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: '#94A3B8', fontSize: '12px' }}>Tiêu chuẩn</span>
                          )}
                        </td>

                        {/* Trạng thái */}
                        <td>
                          <button
                            type="button"
                            className={`status-badge ${p.status || 'active'}`}
                            style={{ cursor: 'pointer', border: 'none' }}
                            title="Click để đổi trạng thái nhanh"
                            onClick={() => onToggleProductStatus(p.id)}
                          >
                            {p.status === 'hidden' ? 'Tạm ẩn' :
                             p.status === 'out_of_stock' ? 'Hết hàng' : 'Đang bán'}
                          </button>
                        </td>

                        {/* Thao tác */}
                        <td style={{ textAlign: 'right' }}>
                          <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                            {/* Nút sửa */}
                            <button
                              type="button"
                              className="btn-icon-action"
                              title="Chỉnh sửa sản phẩm"
                              onClick={() => this.handleOpenEditModal(p)}
                            >
                              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </button>

                            {/* Nút xóa */}
                            <button
                              type="button"
                              className="btn-icon-action delete"
                              title="Xóa sản phẩm"
                              onClick={() => {
                                if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${p.name}"?`)) {
                                  onDeleteProduct(p.id);
                                }
                              }}
                            >
                              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Thêm / Sửa Sản Phẩm */}
        {isModalOpen && (
          <ProductFormModal
            product={editingProduct}
            isEdit={Boolean(editingProduct)}
            onClose={this.handleCloseModal}
            onSave={this.handleSaveProduct}
          />
        )}
      </div>
    );
  }
}

export default ProductManager;
