import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../Data';
import { currentUser, logoutUser } from '../Auth/store';
import { getCart, CART_EVENT } from '../Cart/store';
import { getMyOrders, fetchMyOrders, ORDER_EVENT } from './store';
import './index.css';

class Account extends Component {
  constructor(props) {
    super(props);
    this.state = { user: currentUser(), tab: 'overview', cart: getCart(), orders: getMyOrders() };
  }

  componentDidMount() {
    if (this.state.user && this.state.user.role === 'admin') {
      this.props.history.replace('/admin');
      return;
    }
    window.addEventListener(CART_EVENT, this.syncCommerce);
    window.addEventListener(ORDER_EVENT, this.syncCommerce);
    fetchMyOrders().then((orders) => this.setState({ orders })).catch(() => null);
  }

  componentWillUnmount() {
    window.removeEventListener(CART_EVENT, this.syncCommerce);
    window.removeEventListener(ORDER_EVENT, this.syncCommerce);
  }

  syncCommerce = () => this.setState({ cart: getCart(), orders: getMyOrders() });
  logout = () => { logoutUser(); this.props.history.push('/login'); };

  renderOrders() {
    if (!this.state.orders.length) return <div className="account-empty"><span>⌑</span><h3>Chưa có đơn hàng nào</h3><p>Khi bạn hoàn tất mua sắm, đơn hàng sẽ xuất hiện tại đây.</p><Link to="/clothes">Bắt đầu mua sắm</Link></div>;
    return <div className="order-list">{this.state.orders.map((order) => <article className="order-card" key={order.id}>
      <header><div><span>MÃ ĐƠN</span><b>#{order.id}</b></div><div><span>NGÀY ĐẶT</span><b>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</b></div><div><span>TỔNG TIỀN</span><b>{order.total.toLocaleString('vi-VN')} ₫</b></div><em>{order.status}</em></header>
      <div className="order-products">{order.items.map((item,index) => <div key={`${item.id}-${index}`}><img src={item.img} alt={item.name}/><p><strong>{item.name}</strong><span>SL: {item.quantity}{item.size ? ` · Size ${item.size}` : ''}</span></p><b>{(item.price * item.quantity).toLocaleString('vi-VN')} ₫</b></div>)}</div>
    </article>)}</div>;
  }

  render() {
    const user = this.state.user;
    if (user && user.role === 'admin') return null;
    if (!user) return <main className="account-guest"><div><p>TÀI KHOẢN THÀNH VIÊN</p><h1>Bạn chưa đăng nhập</h1><span>Đăng nhập để quản lý hồ sơ và theo dõi đơn hàng.</span><Link to="/login">ĐĂNG NHẬP</Link></div></main>;

    const initial = user.name.trim().charAt(0).toUpperCase();
    const products = getProducts();
    const cartRows = this.state.cart.map((entry) => ({ entry, product: products.find((item) => String(item.id) === String(entry.id)) })).filter((row) => row.product);
    const cartCount = cartRows.reduce((sum, row) => sum + row.entry.quantity, 0);
    const cartValue = cartRows.reduce((sum, row) => sum + row.product.price * row.entry.quantity, 0);
    const totalSpent = this.state.orders.reduce((sum, order) => sum + order.total, 0);

    return <main className="account-page"><div className="account-shell">
      <header className="account-header"><div><p>TÀI KHOẢN CỦA TÔI</p><h1>Xin chào, {user.name.split(' ').slice(-1)[0]}</h1><span>Quản lý thông tin và những trải nghiệm của bạn tại BẢN SẮC.</span></div><button onClick={this.logout}>Đăng xuất</button></header>
      <div className="account-layout">
        <aside className="account-sidebar"><div className="account-avatar">{initial}</div><strong>{user.name}</strong><span>{user.email}</span><nav><button className={this.state.tab === 'overview' ? 'active' : ''} onClick={() => this.setState({ tab: 'overview' })}>Tổng quan</button><button className={this.state.tab === 'orders' ? 'active' : ''} onClick={() => this.setState({ tab: 'orders' })}>Đơn hàng của tôi {this.state.orders.length > 0 && `(${this.state.orders.length})`}</button><button className={this.state.tab === 'profile' ? 'active' : ''} onClick={() => this.setState({ tab: 'profile' })}>Thông tin cá nhân</button></nav></aside>
        <section className="account-content">
          {this.state.tab === 'overview' && <div><h2>Tổng quan tài khoản</h2>
            <div className="account-cards"><article><span>GIỎ HÀNG</span><b>{cartCount}</b><p>{cartCount ? `${cartValue.toLocaleString('vi-VN')} ₫ đang chờ` : 'Chưa có sản phẩm'}</p></article><article><span>ĐƠN HÀNG</span><b>{this.state.orders.length}</b><p>{this.state.orders.length ? `${totalSpent.toLocaleString('vi-VN')} ₫ đã mua` : 'Chưa có đơn hàng'}</p></article><article><span>HẠNG THÀNH VIÊN</span><b>{totalSpent >= 10000000 ? 'Gold' : 'Member'}</b><p>{totalSpent >= 10000000 ? 'Khách hàng thân thiết' : 'Thành viên BẢN SẮC'}</p></article></div>
            {cartRows.length > 0 ? <div className="account-cart-preview"><div className="account-section-title"><div><p>GIỎ HÀNG HIỆN TẠI</p><h3>Sản phẩm đang chờ bạn</h3></div><Link to="/cart">Xem giỏ hàng →</Link></div>{cartRows.slice(0, 3).map(({ entry, product }) => <Link className="account-cart-item" to={`/products/${product.id}`} key={product.id}><img src={product.img} alt={product.name}/><div><strong>{product.name}</strong><span>{entry.quantity} × {product.price.toLocaleString('vi-VN')} ₫</span></div><b>{(entry.quantity * product.price).toLocaleString('vi-VN')} ₫</b></Link>)}</div>
            : <div className="account-welcome"><p>ĐẶC QUYỀN THÀNH VIÊN</p><h3>Chào mừng đến với BẢN SẮC</h3><span>Bạn sẽ nhận được thông báo sớm về bộ sưu tập mới, ưu đãi sinh nhật và các sự kiện dành riêng cho thành viên.</span><Link to="/clothes">Khám phá bộ sưu tập →</Link></div>}
          </div>}
          {this.state.tab === 'orders' && <div><h2>Đơn hàng của tôi</h2>{this.renderOrders()}</div>}
          {this.state.tab === 'profile' && <div><h2>Thông tin cá nhân</h2><div className="profile-grid"><label>Họ và tên<input value={user.name} readOnly/></label><label>Email<input value={user.email} readOnly/></label><label>Số điện thoại<input value={user.phone || 'Chưa cập nhật'} readOnly/></label><label>Hạng thành viên<input value={totalSpent >= 10000000 ? 'BẢN SẮC Gold' : 'BẢN SẮC Member'} readOnly/></label></div><p className="profile-note">Tổng chi tiêu ghi nhận: <strong>{totalSpent.toLocaleString('vi-VN')} ₫</strong></p></div>}
        </section>
      </div>
    </div></main>;
  }
}

export default Account;
