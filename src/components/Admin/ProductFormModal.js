// Dependencies
import React, { Component } from 'react';

const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'Free Size'];
const COMMON_COLORS = ['Đen', 'Trắng', 'Nâu đất', 'Be/Kem', 'Xanh Navy', 'Xám ghi'];

class ProductFormModal extends Component {
  constructor(props) {
    super(props);
    const p = props.product || {};

    // Khởi tạo state từ sản phẩm cần sửa hoặc giá trị mặc định cho thêm mới
    this.state = {
      name: p.name || '',
      sku: p.sku || `BS-${Math.floor(1000 + Math.random() * 9000)}`,
      category: p.category || 'clothes',
      gender: p.gender || 'women',
      price: p.price || '',
      originalPrice: p.originalPrice || '',
      description: p.description || '',
      status: p.status || 'active', // 'active' | 'hidden' | 'out_of_stock'
      images: p.images && p.images.length > 0 ? [...p.images] : (p.img ? [p.img] : []),
      newImageUrl: '',
      // Phân loại biến thể Size + Màu + Tồn kho
      selectedSizes: p.selectedSizes || (p.variants ? Array.from(new Set(p.variants.map(v => v.size))) : ['S', 'M', 'L']),
      selectedColors: p.selectedColors || (p.variants ? Array.from(new Set(p.variants.map(v => v.color))) : ['Nâu đất', 'Be/Kem']),
      customColorInput: '',
      // variants map: { "Nâu đất-S": 10, "Nâu đất-M": 15, ... }
      variantStockMap: this.initVariantStockMap(p)
    };
  }

  initVariantStockMap = (product) => {
    const map = {};
    if (product && product.variants && product.variants.length > 0) {
      product.variants.forEach(v => {
        map[`${v.color}-${v.size}`] = v.stock;
      });
    } else {
      // Mặc định
      ['Nâu đất', 'Be/Kem'].forEach(color => {
        ['S', 'M', 'L'].forEach(size => {
          map[`${color}-${size}`] = 10;
        });
      });
    }
    return map;
  };

  // Upload nhiều file ảnh
  handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        this.setState(prevState => ({
          images: [...prevState.images, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  handleAddImageUrl = () => {
    if (this.state.newImageUrl.trim()) {
      this.setState(prevState => ({
        images: [...prevState.images, prevState.newImageUrl.trim()],
        newImageUrl: ''
      }));
    }
  };

  handleRemoveImage = (index) => {
    this.setState(prevState => ({
      images: prevState.images.filter((_, i) => i !== index)
    }));
  };

  handleSetFeaturedImage = (index) => {
    if (index === 0) return;
    this.setState(prevState => {
      const updated = [...prevState.images];
      const target = updated.splice(index, 1)[0];
      updated.unshift(target);
      return { images: updated };
    });
  };

  // Quản lý Size
  handleToggleSize = (size) => {
    this.setState(prevState => {
      const exists = prevState.selectedSizes.includes(size);
      const updated = exists
        ? prevState.selectedSizes.filter(s => s !== size)
        : [...prevState.selectedSizes, size];
      return { selectedSizes: updated };
    });
  };

  // Quản lý Màu
  handleToggleColor = (color) => {
    this.setState(prevState => {
      const exists = prevState.selectedColors.includes(color);
      const updated = exists
        ? prevState.selectedColors.filter(c => c !== color)
        : [...prevState.selectedColors, color];
      return { selectedColors: updated };
    });
  };

  handleAddCustomColor = () => {
    const color = this.state.customColorInput.trim();
    if (color && !this.state.selectedColors.includes(color)) {
      this.setState(prevState => ({
        selectedColors: [...prevState.selectedColors, color],
        customColorInput: ''
      }));
    }
  };

  handleStockChange = (color, size, val) => {
    const num = parseInt(val, 10);
    const key = `${color}-${size}`;
    this.setState(prevState => ({
      variantStockMap: {
        ...prevState.variantStockMap,
        [key]: isNaN(num) || num < 0 ? 0 : num
      }
    }));
  };

  calculateTotalStock = () => {
    const { selectedColors, selectedSizes, variantStockMap } = this.state;
    let total = 0;
    selectedColors.forEach(c => {
      selectedSizes.forEach(s => {
        total += (variantStockMap[`${c}-${s}`] || 0);
      });
    });
    return total;
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const {
      name, sku, category, gender, price, originalPrice, description,
      status, images, selectedColors, selectedSizes, variantStockMap
    } = this.state;

    // Tạo mảng variants hoàn chỉnh
    const variants = [];
    selectedColors.forEach(c => {
      selectedSizes.forEach(s => {
        variants.push({
          color: c,
          size: s,
          stock: variantStockMap[`${c}-${s}`] || 0
        });
      });
    });

    const totalStock = this.calculateTotalStock();

    const productData = {
      id: this.props.product ? this.props.product.id : Date.now(),
      name,
      sku,
      category,
      gender,
      price: parseFloat(price) || 0,
      originalPrice: parseFloat(originalPrice) || null,
      description,
      status,
      img: images[0] || 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
      images,
      stock: totalStock,
      selectedSizes,
      selectedColors,
      variants
    };

    this.props.onSave(productData);
  };

  render() {
    const { onClose, isEdit } = this.props;
    const {
      name, sku, category, gender, price, originalPrice, description,
      status, images, newImageUrl, selectedSizes, selectedColors,
      customColorInput, variantStockMap
    } = this.state;

    const totalStock = this.calculateTotalStock();

    return (
      <div className="admin-modal-backdrop" onClick={onClose}>
        <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header">
            <h3>{isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
            <button type="button" className="modal-close-btn" onClick={onClose}>
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={this.handleSubmit} style={{ display: 'contents' }}>
            <div className="modal-body">
              {/* Row 1: Tên & SKU */}
              <div className="form-row-2">
                <div className="form-group">
                  <label>Tên sản phẩm *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={name}
                    onChange={(e) => this.setState({ name: e.target.value })}
                    placeholder="Ví dụ: Áo sơ mi đũi dệt thoi..."
                  />
                </div>
                <div className="form-group">
                  <label>Mã sản phẩm (SKU) *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={sku}
                    onChange={(e) => this.setState({ sku: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 2: Danh mục, Phân loại, Trạng thái */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Danh mục</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => this.setState({ category: e.target.value })}
                  >
                    <option value="clothes">Trang phục</option>
                    <option value="women">Thời trang Nữ</option>
                    <option value="men">Thời trang Nam</option>
                    <option value="accessories">Phụ kiện</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Phân loại đối tượng</label>
                  <select
                    className="form-select"
                    value={gender}
                    onChange={(e) => this.setState({ gender: e.target.value })}
                  >
                    <option value="women">Dành cho Nữ</option>
                    <option value="men">Dành cho Nam</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Trạng thái hiển thị</label>
                  <select
                    className="form-select"
                    value={status}
                    onChange={(e) => this.setState({ status: e.target.value })}
                  >
                    <option value="active">Đang bán</option>
                    <option value="hidden">Tạm ẩn</option>
                    <option value="out_of_stock">Hết hàng</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Giá bán & Giá gốc */}
              <div className="form-row-2">
                <div className="form-group">
                  <label>Giá bán niêm yết (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    className="form-input"
                    value={price}
                    onChange={(e) => this.setState({ price: e.target.value })}
                    placeholder="1450000"
                  />
                </div>
                <div className="form-group">
                  <label>Giá gốc / Khuyến mãi (VNĐ)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={originalPrice}
                    onChange={(e) => this.setState({ originalPrice: e.target.value })}
                    placeholder="1850000 (không bắt buộc)"
                  />
                </div>
              </div>

              {/* Row 4: Upload nhiều hình ảnh */}
              <div className="form-group">
                <label>Hình ảnh sản phẩm (Upload nhiều ảnh, click ảnh để chọn làm ảnh chính)</label>
                <div className="image-upload-section">
                  <label className="btn-file-upload">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" style={{ verticalAlign: 'middle', marginRight: '6px' }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    Chọn file ảnh từ máy tính
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={this.handleFileUpload}
                    />
                  </label>

                  <div style={{ margin: '10px 0', fontSize: '13px', color: '#64748B' }}>Hoặc nhập link ảnh trực tuyến:</div>
                  <div style={{ display: 'flex', gap: '8px', maxWidth: '480px', margin: '0 auto' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="https://..."
                      value={newImageUrl}
                      onChange={(e) => this.setState({ newImageUrl: e.target.value })}
                    />
                    <button
                      type="button"
                      className="btn-modal-cancel"
                      onClick={this.handleAddImageUrl}
                    >
                      Thêm
                    </button>
                  </div>

                  {/* Danh sách ảnh thumbnails */}
                  {images.length > 0 && (
                    <div className="upload-thumbnails-grid">
                      {images.map((imgSrc, idx) => (
                        <div
                          key={idx}
                          className="upload-thumb-card"
                          onClick={() => this.handleSetFeaturedImage(idx)}
                          title={idx === 0 ? 'Ảnh đại diện chính' : 'Bấm để đặt làm ảnh đại diện chính'}
                          style={{ cursor: 'pointer' }}
                        >
                          <img src={imgSrc} alt="Thumbnail preview" />
                          {idx === 0 && <span className="thumb-featured-badge">ẢNH CHÍNH</span>}
                          <button
                            type="button"
                            className="thumb-remove-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              this.handleRemoveImage(idx);
                            }}
                            title="Xóa ảnh"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 5: Mô tả sản phẩm */}
              <div className="form-group">
                <label>Mô tả chi tiết sản phẩm</label>
                <textarea
                  className="form-textarea"
                  value={description}
                  onChange={(e) => this.setState({ description: e.target.value })}
                  placeholder="Chất liệu đũi tự nhiên, thoáng mát, phom dáng thoải mái tôn dáng..."
                />
              </div>

              {/* Row 6: ĐẶC BIỆT: Ma trận Size + Màu + Tồn kho */}
              <div className="form-group">
                <label style={{ fontSize: '14px', color: '#002B7F', fontWeight: 700 }}>
                  Quản lý Biến thể (Size + Màu sắc + Tồn kho)
                </label>
                <div className="variant-matrix-box">
                  {/* Chọn Kích cỡ */}
                  <div className="variant-selector-row">
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Kích cỡ (Sizes):</span>
                      <div className="variant-options-list">
                        {AVAILABLE_SIZES.map(size => (
                          <label key={size} className="checkbox-chip">
                            <input
                              type="checkbox"
                              checked={selectedSizes.includes(size)}
                              onChange={() => this.handleToggleSize(size)}
                            />
                            {size}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Chọn Màu sắc */}
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Màu sắc (Colors):</span>
                      <div className="variant-options-list">
                        {COMMON_COLORS.map(color => (
                          <label key={color} className="checkbox-chip">
                            <input
                              type="checkbox"
                              checked={selectedColors.includes(color)}
                              onChange={() => this.handleToggleColor(color)}
                            />
                            {color}
                          </label>
                        ))}
                      </div>

                      {/* Thêm màu tùy chỉnh */}
                      <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                        <input
                          type="text"
                          className="form-input"
                          style={{ maxWidth: '160px', height: '32px' }}
                          placeholder="Màu khác..."
                          value={customColorInput}
                          onChange={(e) => this.setState({ customColorInput: e.target.value })}
                        />
                        <button
                          type="button"
                          className="btn-modal-cancel"
                          style={{ padding: '4px 12px', fontSize: '12px' }}
                          onClick={this.handleAddCustomColor}
                        >
                          + Thêm màu
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bảng ma trận nhập Tồn kho từng loại */}
                  {selectedColors.length > 0 && selectedSizes.length > 0 ? (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                          Bảng nhập số lượng tồn kho theo Màu &amp; Kích cỡ:
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#002B7F' }}>
                          Tổng tồn kho: {totalStock} cái
                        </span>
                      </div>

                      <table className="matrix-table">
                        <thead>
                          <tr>
                            <th>Màu sắc</th>
                            {selectedSizes.map(s => (
                              <th key={s} style={{ textAlign: 'center' }}>Size {s}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedColors.map(c => (
                            <tr key={c}>
                              <td><strong>{c}</strong></td>
                              {selectedSizes.map(s => (
                                <td key={s} style={{ textAlign: 'center' }}>
                                  <input
                                    type="number"
                                    min="0"
                                    className="matrix-stock-input"
                                    value={variantStockMap[`${c}-${s}`] !== undefined ? variantStockMap[`${c}-${s}`] : 0}
                                    onChange={(e) => this.handleStockChange(c, s, e.target.value)}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p style={{ color: '#EF4444', fontSize: '13px', margin: 0 }}>
                      Vui lòng chọn ít nhất 1 kích cỡ và 1 màu sắc để sinh bảng tồn kho.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="modal-footer">
              <button type="button" className="btn-modal-cancel" onClick={onClose}>
                Hủy bỏ
              </button>
              <button type="submit" className="btn-modal-save">
                {isEdit ? 'Lưu cập nhật' : 'Tạo sản phẩm'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default ProductFormModal;
