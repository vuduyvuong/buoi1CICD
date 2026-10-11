// Dependencies
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
// Internals
import './admin.css';
import Dashboard from './Dashboard';
import ProductManager from './ProductManager';
import PRODUCTS from '../Data';
import logoFooter from '../../img/logo-footer.png';
import { api } from '../../services/api';
import { currentUser } from '../Auth/store';

// Initial sample orders
const INITIAL_ORDERS = [
  {
    id: 1,
    code: 'ORD-8821',
    customerName: 'Nguyễn Văn An',
    customerPhone: '0912 345 678',
    createdAt: '21/09/2026 18:32',
    itemsSummary: '1x Áo sơ mi đũi dệt thoi (Nâu/M)',
    total: 1450000,
    status: 'pending' // pending | shipping | completed | cancelled
  },
  {
    id: 2,
    code: 'ORD-8820',
    customerName: 'Trần Thị Mai',
    customerPhone: '0988 765 432',
    createdAt: '21/09/2026 16:15',
    itemsSummary: '1x Áo trench coat dạ dáng dài (Be/L)',
    total: 3850000,
    status: 'shipping'
  },
  {
    id: 3,
    code: 'ORD-8819',
    customerName: 'Lê Hoàng Long',
    customerPhone: '0903 112 233',
    createdAt: '21/09/2026 14:02',
    itemsSummary: '1x Đồng hồ dây kim loại tối giản',
    total: 4200000,
    status: 'completed'
  },
  {
    id: 4,
    code: 'ORD-8818',
    customerName: 'Phạm Minh Hạnh',
    customerPhone: '0945 998 877',
    createdAt: '21/09/2026 11:40',
    itemsSummary: '2x Vòng tay đá tự nhiên phối charm',
    total: 1780000,
    status: 'pending'
  },
  {
    id: 5,
    code: 'ORD-8817',
    customerName: 'Đặng Thảo Vy',
    customerPhone: '0977 445 566',
    createdAt: '20/09/2026 21:10',
    itemsSummary: '1x Brown Linen Shirt (S)',
    total: 1450000,
    status: 'completed'
  }
];

class AdminPortal extends Component {
  constructor(props) {
    super(props);

    // Lấy dữ liệu từ localStorage nếu có, nếu không lấy từ Data mặc định
    let savedProducts = null;
    try {
      const stored = localStorage.getItem('BANSAC_ADMIN_PRODUCTS');
      if (stored) {
        savedProducts = JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }

    if (!savedProducts || savedProducts.length === 0) {
      savedProducts = (PRODUCTS || []).slice(0, 10).map((p, idx) => ({
        ...p,
        sku: `BS-${1000 + p.id}`,
        status: 'active',
        stock: idx === 1 ? 3 : idx === 3 ? 4 : Math.floor(12 + Math.random() * 25), // Tạo 2 sản phẩm sắp hết để demo cảnh báo
        price: typeof p.price === 'number' && p.price < 100 ? p.price * 50000 : p.price,
        selectedSizes: ['S', 'M', 'L'],
        selectedColors: ['Nâu đất', 'Be/Kem'],
        variants: [
          { color: 'Nâu đất', size: 'S', stock: idx === 1 ? 1 : 5 },
          { color: 'Nâu đất', size: 'M', stock: idx === 1 ? 2 : 10 },
          { color: 'Be/Kem', size: 'L', stock: idx === 1 ? 0 : 8 }
        ]
      }));
    }

    this.state = {
      activeTab: 'dashboard', // 'dashboard' | 'products' | 'orders'
      products: savedProducts,
      orders: INITIAL_ORDERS,
      loadingApi: true,
      apiError: ''
    };
  }

  componentDidMount() {
    if (!currentUser() || currentUser().role !== 'admin') { this.setState({ loadingApi: false }); return; }
    Promise.all([api.get('/admin/products'), api.get('/orders')]).then(([productResult, orderResult]) => {
      const products = productResult.products.map((product) => {
        const local = PRODUCTS.find((item) => String(item.id) === String(product.id));
        return Object.assign({}, local || {}, product, { img: product.img || (local && local.img) || '' });
      });
      const orders = orderResult.orders.map((order) => ({ id: order.id, code: order.id, customerName: order.customerName, customerPhone: order.customerPhone || (order.address && order.address.phone) || '', createdAt: new Date(order.createdAt).toLocaleString('vi-VN'), itemsSummary: order.items.map((item) => `${item.quantity}x ${item.name}`).join(', '), total: order.total, status: order.status === 'confirmed' ? 'pending' : order.status }));
      this.setState({ products, orders, loadingApi: false, apiError: '' });
    }).catch((error) => this.setState({ loadingApi: false, apiError: error.message }));
  }

  saveProductsToStorage = (products) => {
    this.setState({ products });
    try {
      localStorage.setItem('BANSAC_ADMIN_PRODUCTS', JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  };

  // Thêm hoặc Cập nhật sản phẩm
  handleSaveProduct = (productData) => {
    const { products } = this.state;
    const exists = products.find(p => p.id === productData.id);

    let updatedProducts;
    if (exists) {
      updatedProducts = products.map(p => p.id === productData.id ? productData : p);
    } else {
      updatedProducts = [productData, ...products];
    }

    this.saveProductsToStorage(updatedProducts);
    const request = exists ? api.put(`/products/${productData.id}`, productData) : api.post('/products', productData);
    request.then(({ product }) => {
      const synced = exists ? this.state.products.map((item) => item.id === productData.id ? Object.assign({}, productData, product) : item) : [Object.assign({}, productData, product)].concat(this.state.products.filter((item) => item.id !== productData.id));
      this.saveProductsToStorage(synced);
    }).catch((error) => this.setState({ apiError: error.message }));
  };

  // Xóa sản phẩm
  handleDeleteProduct = (productId) => {
    const updated = this.state.products.filter(p => p.id !== productId);
    this.saveProductsToStorage(updated);
    api.delete(`/products/${productId}`).catch((error) => this.setState({ apiError: error.message }));
  };

  // Chuyển đổi trạng thái nhanh (Đang bán <-> Tạm ẩn)
  handleToggleProductStatus = (productId) => {
    const updated = this.state.products.map(p => {
      if (p.id === productId) {
        const nextStatus = p.status === 'active' ? 'hidden' : 'active';
        return { ...p, status: nextStatus };
      }
      return p;
    });
    this.saveProductsToStorage(updated);
    const changed = updated.find((item) => item.id === productId);
    api.put(`/products/${productId}`, changed).catch((error) => this.setState({ apiError: error.message }));
  };

  render() {
    const { activeTab, products, orders } = this.state;

    if (!currentUser() || currentUser().role !== 'admin') return <div className="admin-access-denied"><h1>Yêu cầu quyền quản trị</h1><p>Đăng nhập bằng tài khoản quản trị để truy cập khu vực này.</p><Link to="/login">Đăng nhập quản trị</Link></div>;

    return (
      <div className="admin-portal-wrapper">
        {/* SIDEBAR TRÁI */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar-header">
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <img src={logoFooter} alt="BẢN SẮC" className="sidebar-logo-img" />
            </Link>
            <span className="admin-badge-tag">ADMIN</span>
          </div>

          <div className="admin-sidebar-nav">
            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => this.setState({ activeTab: 'dashboard' })}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span>Dashboard Tổng quan</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => this.setState({ activeTab: 'products' })}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                <line x1="7" y1="7" x2="7.01" y2="7"></line>
              </svg>
              <span>Quản lý Sản phẩm</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => this.setState({ activeTab: 'orders' })}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span>Đơn hàng ({orders.length})</span>
            </button>
          </div>

          <div className="admin-sidebar-footer">
            <Link to="/" className="view-store-btn" title="Về trang bán hàng">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              <span>Xem Cửa hàng</span>
            </Link>
          </div>
        </aside>

        {/* PHẦN CHÍNH */}
        <div className="admin-main">
          {this.state.apiError && <div className="admin-api-error">{this.state.apiError}</div>}
          {/* Topbar */}
          <header className="admin-topbar">
            <div className="admin-breadcrumbs">
              <h2>
                {activeTab === 'dashboard' ? 'Tổng quan Cửa hàng' :
                 activeTab === 'products' ? 'Quản lý Sản phẩm' : 'Danh sách Đơn hàng'}
              </h2>
            </div>

            <div className="admin-topbar-actions">
              <Link to="/" className="btn-modal-cancel" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                Về Storefront
              </Link>

              <div className="admin-user-profile">
                <div className="user-avatar">AD</div>
                <div className="user-info">
                  <p className="user-name">Quản trị viên</p>
                  <p className="user-role">admin@bansac.vn</p>
                </div>
              </div>
            </div>
          </header>

          {/* Body nội dung theo tab */}
          <main className="admin-body">
            {activeTab === 'dashboard' && (
              <Dashboard
                products={products}
                orders={orders}
                onNavigateToProducts={() => this.setState({ activeTab: 'products' })}
              />
            )}

            {activeTab === 'products' && (
              <ProductManager
                products={products}
                onSaveProduct={this.handleSaveProduct}
                onDeleteProduct={this.handleDeleteProduct}
                onToggleProductStatus={this.handleToggleProductStatus}
              />
            )}

            {activeTab === 'orders' && (
              <div className="admin-card">
                <div className="card-header">
                  <h3>Tất cả Đơn hàng ({orders.length})</h3>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Khách hàng</th>
                        <th>Thời gian</th>
                        <th>Chi tiết sản phẩm</th>
                        <th>Tổng thanh toán</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id}>
                          <td><strong>#{order.code}</strong></td>
                          <td>
                            <div>{order.customerName}</div>
                            <small style={{ color: '#64748B' }}>{order.customerPhone}</small>
                          </td>
                          <td>{order.createdAt}</td>
                          <td>{order.itemsSummary}</td>
                          <td><strong>{(order.total || 0).toLocaleString('vi-VN')} ₫</strong></td>
                          <td>
                            <span className={`status-badge ${order.status}`}>
                              {order.status === 'pending' ? 'Chờ xử lý' :
                               order.status === 'shipping' ? 'Đang giao' :
                               order.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }
}

export default AdminPortal;
