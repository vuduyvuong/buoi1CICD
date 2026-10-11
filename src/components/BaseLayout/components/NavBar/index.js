import React, { Component } from 'react';
import { NavLink, Link, withRouter } from 'react-router-dom';
import brandLogoTop from '../../../../img/brand-logo-top.png';
import { cartCount, CART_EVENT } from '../../../Cart/store';
import { currentUser, AUTH_EVENT } from '../../../Auth/store';
import './index.css';

class Navbar extends Component {
  constructor(props){super(props);this.state={searchQuery:'',isScrolled:false,mobileOpen:false,cartCount:cartCount(),user:currentUser()};}
  componentDidMount(){window.addEventListener('scroll',this.handleScroll);window.addEventListener(CART_EVENT,this.syncCart);window.addEventListener(AUTH_EVENT,this.syncUser);}
  componentWillUnmount(){window.removeEventListener('scroll',this.handleScroll);window.removeEventListener(CART_EVENT,this.syncCart);window.removeEventListener(AUTH_EVENT,this.syncUser);}
  syncCart=()=>this.setState({cartCount:cartCount()});
  syncUser=()=>this.setState({user:currentUser()});
  handleScroll=()=>this.setState({isScrolled:window.scrollY>40});
  closeMenu=()=>this.setState({mobileOpen:false});
  handleSearchSubmit=(e)=>{e.preventDefault();const query=this.state.searchQuery.trim();if(query){this.props.history.push(`/clothes?search=${encodeURIComponent(query)}`);this.setState({mobileOpen:false});}};
  accountPath=()=>!this.state.user?'/login':this.state.user.role==='admin'?'/admin':'/account';
  render(){return <header className="bansac-header-wrapper">
    <div className="top-announcement-bar"><p>MIỄN PHÍ VẬN CHUYỂN TOÀN QUỐC CHO ĐƠN HÀNG TỪ 1.000.000₫ · ĐỔI TRẢ TRONG 14 NGÀY</p></div>
    <nav className={`bansac-navbar ${this.state.isScrolled?'scrolled':''}`}><div className="navbar-container">
      <button className="mobile-menu-toggle" onClick={()=>this.setState({mobileOpen:!this.state.mobileOpen})} aria-label="Mở menu" aria-expanded={this.state.mobileOpen}><span/><span/><span/></button>
      <Link to="/" className="navbar-logo" onClick={this.closeMenu}><img src={brandLogoTop} alt="BẢN SẮC STUDIO" className="navbar-logo-img"/></Link>
      <ul className={`nav-menu ${this.state.mobileOpen?'mobile-open':''}`}>
        <li><NavLink exact to="/" activeClassName="nav-active" className="nav-link" onClick={this.closeMenu}>Trang chủ</NavLink></li><li><NavLink to="/women" activeClassName="nav-active" className="nav-link" onClick={this.closeMenu}>Nữ</NavLink></li><li><NavLink to="/men" activeClassName="nav-active" className="nav-link" onClick={this.closeMenu}>Nam</NavLink></li><li><NavLink to="/clothes" activeClassName="nav-active" className="nav-link" onClick={this.closeMenu}>Trang phục</NavLink></li><li><NavLink to="/accessories" activeClassName="nav-active" className="nav-link" onClick={this.closeMenu}>Phụ kiện</NavLink></li><li><Link to="/#artisan-story" className="nav-link" onClick={this.closeMenu}>Câu chuyện</Link></li><li><a href="#contact" className="nav-link" onClick={this.closeMenu}>Liên hệ</a></li>
      </ul>
      <div className="nav-actions"><form className="nav-search-form" onSubmit={this.handleSearchSubmit}><svg className="search-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="text" placeholder="Tìm kiếm..." value={this.state.searchQuery} onChange={(e)=>this.setState({searchQuery:e.target.value})} className="search-input"/></form>
        <Link to={this.accountPath()} className={`action-btn user-btn ${this.state.user?'signed-in':''}`} title={this.state.user?(this.state.user.role==='admin'?'Dashboard quản trị':`Tài khoản ${this.state.user.name}`):'Đăng nhập'} aria-label={this.state.user?(this.state.user.role==='admin'?'Dashboard quản trị':'Tài khoản của tôi'):'Đăng nhập'}>{this.state.user?<span className="user-initial">{this.state.user.name.charAt(0).toUpperCase()}</span>:<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.8" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}</Link>
        <Link to="/cart" className="action-btn cart-btn" title="Giỏ hàng" aria-label={`Giỏ hàng có ${this.state.cartCount} sản phẩm`}><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.8" fill="none"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>{this.state.cartCount>0&&<span className="cart-badge">{this.state.cartCount}</span>}</Link>
      </div>
    </div></nav>{this.state.mobileOpen&&<button className="nav-backdrop" onClick={this.closeMenu} aria-label="Đóng menu"/>}
  </header>;}
}
export default withRouter(Navbar);
