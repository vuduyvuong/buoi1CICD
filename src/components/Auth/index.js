import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import authImage from '../../img/category-women -tile.png';
import { loginUser, registerUser } from './store';
import './index.css';

class Auth extends Component {
  constructor(props) {
    super(props);
    this.state = { name: '', email: '', phone: '', password: '', confirmPassword: '', remember: true, showPassword: false, loading: false, error: '', fieldErrors: {} };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.mode !== this.props.mode) this.setState({ error: '', fieldErrors: {}, password: '', confirmPassword: '' });
  }

  validate = () => {
    const isRegister = this.props.mode === 'register';
    const errors = {};
    if (isRegister && this.state.name.trim().length < 2) errors.name = 'Vui lòng nhập họ và tên.';
    if (!/^\S+@\S+\.\S+$/.test(this.state.email.trim())) errors.email = 'Email chưa đúng định dạng.';
    if (isRegister && this.state.phone && !/^[0-9+\s]{9,13}$/.test(this.state.phone)) errors.phone = 'Số điện thoại chưa hợp lệ.';
    if (this.state.password.length < 8) errors.password = 'Mật khẩu cần ít nhất 8 ký tự.';
    if (isRegister && this.state.password !== this.state.confirmPassword) errors.confirmPassword = 'Mật khẩu nhập lại chưa khớp.';
    this.setState({ fieldErrors: errors });
    return Object.keys(errors).length === 0;
  };

  submit = async (e) => {
    e.preventDefault();
    if (!this.validate()) return;
    this.setState({ loading: true, error: '' });
    try {
      const user = this.props.mode === 'register' ? await registerUser(this.state) : await loginUser(this.state.email, this.state.password, this.state.remember);
      this.props.history.push(user.role === 'admin' ? '/admin' : '/account');
    } catch (error) {
      this.setState({ error: error.message, loading: false });
    }
  };

  field = (name, label, type, placeholder) => <label className={`auth-field ${this.state.fieldErrors[name] ? 'has-error' : ''}`}>
    <span>{label}</span><input type={type} value={this.state[name]} placeholder={placeholder} onChange={(e) => this.setState({ [name]: e.target.value, fieldErrors: Object.assign({}, this.state.fieldErrors, { [name]: '' }) })}/>{this.state.fieldErrors[name] && <small>{this.state.fieldErrors[name]}</small>}
  </label>;

  render() {
    const isRegister = this.props.mode === 'register';
    const passwordType = this.state.showPassword ? 'text' : 'password';
    return <main className="auth-page"><section className="auth-visual"><img src={authImage} alt="Bộ sưu tập BẢN SẮC"/><div className="auth-visual-overlay"><span>BẢN SẮC MEMBERSHIP</span><h2>Phong cách của bạn,<br/>được lưu giữ riêng.</h2><p>Trở thành thành viên để theo dõi đơn hàng và nhận quyền truy cập sớm vào các bộ sưu tập mới.</p></div></section>
      <section className="auth-panel"><div className="auth-box"><Link to="/" className="auth-back">← Trở về cửa hàng</Link><div className="auth-heading"><p>{isRegister ? 'TẠO TÀI KHOẢN' : 'CHÀO MỪNG TRỞ LẠI'}</p><h1>{isRegister ? 'Gia nhập BẢN SẮC' : 'Đăng nhập'}</h1><span>{isRegister ? 'Tạo tài khoản để trải nghiệm mua sắm thuận tiện hơn.' : 'Nhập thông tin tài khoản để tiếp tục hành trình của bạn.'}</span></div>
        {this.state.error && <div className="auth-error" role="alert">{this.state.error}</div>}
        <form onSubmit={this.submit} noValidate>
          {isRegister && this.field('name', 'Họ và tên', 'text', 'Nguyễn Văn An')}
          {this.field('email', 'Email', 'email', 'ban@email.com')}
          {isRegister && this.field('phone', 'Số điện thoại', 'tel', '09xx xxx xxx')}
          <label className={`auth-field ${this.state.fieldErrors.password ? 'has-error' : ''}`}><span>Mật khẩu</span><div className="password-input"><input type={passwordType} value={this.state.password} placeholder="Tối thiểu 6 ký tự" onChange={(e) => this.setState({ password: e.target.value, fieldErrors: Object.assign({}, this.state.fieldErrors, { password: '' }) })}/><button type="button" onClick={() => this.setState({showPassword:!this.state.showPassword})}>{this.state.showPassword ? 'Ẩn' : 'Hiện'}</button></div>{this.state.fieldErrors.password && <small>{this.state.fieldErrors.password}</small>}</label>
          {isRegister && this.field('confirmPassword', 'Nhập lại mật khẩu', passwordType, 'Nhập lại mật khẩu')}
          {!isRegister && <div className="auth-options"><label><input type="checkbox" checked={this.state.remember} onChange={(e)=>this.setState({remember:e.target.checked})}/><span>Ghi nhớ đăng nhập</span></label><Link to="/forgot-password">Quên mật khẩu?</Link></div>}
          {isRegister && <label className="auth-consent"><input type="checkbox" required/><span>Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật.</span></label>}
          <button className="auth-submit" type="submit" disabled={this.state.loading}>{this.state.loading ? 'ĐANG XỬ LÝ...' : (isRegister ? 'TẠO TÀI KHOẢN' : 'ĐĂNG NHẬP')}</button>
        </form>
        <div className="auth-switch">{isRegister ? 'Đã có tài khoản?' : 'Bạn chưa có tài khoản?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Đăng nhập' : 'Đăng ký ngay'}</Link></div>
        <div className="auth-security"><span>✓</span> Thông tin của bạn được bảo mật an toàn</div>
      </div></section>
    </main>;
  }
}
export default withRouter(Auth);
