// Dependencies
import React, { Component } from 'react';
import { NavLink, Link } from 'react-router-dom';
// Internals
import './index.css';
import brandLogoTop from '../../../../img/brand-logo-top.png';

class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: '',
      isScrolled: false
    };
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll = () => {
    if (window.scrollY > 40) {
      this.setState({ isScrolled: true });
    } else {
      this.setState({ isScrolled: false });
    }
  };

  handleSearchSubmit = (e) => {
    e.preventDefault();
    if (this.state.searchQuery.trim()) {
      window.location.href = `/clothes?search=${encodeURIComponent(this.state.searchQuery)}`;
    }
  };

  render() {
    return (
      <header className="bansac-header-wrapper">
        {/* Top Announcement Bar */}
        <div className="top-announcement-bar">
          <p>
            MIỄN PHÍ VẬN CHUYỂN TOÀN QUỐC CHO ĐƠN HÀNG TỪ 1.000.000₫ &bull; ĐỔI TRẢ TRONG 14 NGÀY
          </p>
        </div>

        {/* Main Navbar */}
        <nav className={`bansac-navbar ${this.state.isScrolled ? 'scrolled' : ''}`}>
          <div className="navbar-container">
            {/* Logo */}
            <Link to="/" className="navbar-logo">
              <img src={brandLogoTop} alt="BẢN SẮC STUDIO" className="navbar-logo-img" />
            </Link>

            {/* Navigation Links */}
            <ul className="nav-menu">
              <li className="nav-item">
                <NavLink exact to="/" activeClassName="nav-active" className="nav-link">
                  Trang chủ
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/women" activeClassName="nav-active" className="nav-link">
                  Nữ
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/men" activeClassName="nav-active" className="nav-link">
                  Nam
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/clothes" activeClassName="nav-active" className="nav-link">
                  Trang phục
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/accessories" activeClassName="nav-active" className="nav-link">
                  Phụ kiện
                </NavLink>
              </li>
              <li className="nav-item">
                <a href="#artisan-story" className="nav-link">
                  Câu chuyện
                </a>
              </li>
              <li className="nav-item">
                <a href="#contact" className="nav-link">
                  Liên hệ
                </a>
              </li>
            </ul>

            {/* Right utilities: Search & Actions */}
            <div className="nav-actions">
              <form className="nav-search-form" onSubmit={this.handleSearchSubmit}>
                <svg className="search-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={this.state.searchQuery}
                  onChange={(e) => this.setState({ searchQuery: e.target.value })}
                  className="search-input"
                />
              </form>

              <Link to="/admin" className="action-btn user-btn" title="Khu vực Quản trị (Admin)" aria-label="Khu vực Quản trị">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </Link>

              <Link to="/cart" className="action-btn cart-btn" title="Giỏ hàng" aria-label="Giỏ hàng">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <span className="cart-badge">2</span>
              </Link>
            </div>
          </div>
        </nav>
      </header>
    );
  }
}

export default Navbar;
