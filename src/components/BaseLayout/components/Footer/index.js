// Dependencies
import React from 'react';
import { Link } from 'react-router-dom';
// Internals
import './index.css';
import logoFooter from '../../../../img/logo-footer.png';

const Footer = () => (
  <footer className="bansac-footer" id="contact">
    <div className="footer-container">
      {/* 4 Columns Top */}
      <div className="footer-grid">
        {/* Col 1: Brand Info */}
        <div className="footer-col brand-col">
          <div className="footer-logo">
            <img src={logoFooter} alt="BẢN SẮC STUDIO" className="footer-logo-img" />
          </div>
          <p className="brand-desc">
            Thương hiệu thời trang thiết kế cao cấp mang đậm dấu ấn bản sắc đương đại và tôn vinh phong cách sống tinh tế.
          </p>
          <div className="social-links">
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="1.8" fill="none">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="1.8" fill="none">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href="https://www.pinterest.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Pinterest">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="1.8" fill="none">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 12c0-2.5 2-4 4-4s4 1.5 4 4c0 2-1 3.5-2.5 3.5-.8 0-1.5-.5-1.5-1.5 0-.5.2-1.5.2-2 0-1-.5-1.5-1.2-1.5-.8 0-1.5.8-1.5 1.8 0 .8.3 1.2.3 1.2s-1 4.5-1.2 5.5"></path>
              </svg>
            </a>
          </div>
        </div>

        {/* Col 2: Collection Links */}
        <div className="footer-col">
          <h4 className="footer-heading">BỘ SƯU TẬP</h4>
          <ul className="footer-list">
            <li><Link to="/clothes">Mùa Thu Đông 2026</Link></li>
            <li><Link to="/women">Trang Phục May Đo</Link></li>
            <li><Link to="/men">Áo Khoác & Blazer</Link></li>
            <li><Link to="/accessories">Phụ Kiện Cao Cấp</Link></li>
            <li><Link to="/clothes">Lookbook Độc Quyền</Link></li>
          </ul>
        </div>

        {/* Col 3: Customer Care */}
        <div className="footer-col">
          <h4 className="footer-heading">CHĂM SÓC KHÁCH HÀNG</h4>
          <ul className="footer-list">
            <li><Link to="/size-guide">Hướng dẫn chọn kích cỡ</Link></li>
            <li><Link to="/shipping">Chính sách vận chuyển</Link></li>
            <li><Link to="/returns">Đổi trả & Bảo hành</Link></li>
            <li><Link to="/faq">Câu hỏi thường gặp (FAQ)</Link></li>
            <li><Link to="/support">Liên hệ hỗ trợ</Link></li>
          </ul>
        </div>

        {/* Col 4: Contact */}
        <div className="footer-col">
          <h4 className="footer-heading">LIÊN HỆ</h4>
          <ul className="footer-list contact-list">
            <li><strong>Hotline:</strong> 1900 888 999</li>
            <li><strong>Email:</strong> contact@bansac.vn</li>
            <li><strong>Flagship:</strong> Hà Nội & TP. Hồ Chí Minh</li>
            <li><strong>Giờ mở cửa:</strong> 09:00 - 21:30 (Hàng ngày)</li>
          </ul>
        </div>
      </div>

      {/* Giant Watermark */}
      <div className="footer-watermark">
        <span>BẢN SẮC</span>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p className="copyright-text">
          &copy; 2026 BẢN SẮC. Tất cả quyền được bảo lưu.
        </p>
        <div className="footer-policy-links">
          <Link to="/privacy">Chính sách bảo mật</Link>
          <span className="divider">•</span>
          <Link to="/terms">Điều khoản dịch vụ</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
