// Dependencies
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
// Internals
import './index.css';

// =========================================================================
// HÌNH ẢNH NỘI BỘ TỪ THƯ MỤC SRC/IMG (THEO THIẾT KẾ FIGMA)
// =========================================================================
import heroImage from '../../img/hero-image.png';
import catWomen from '../../img/category-women -tile.png';
import catMen from '../../img/category-man- tile.png';
import catClothes from '../../img/category-clothes- tile.png';
import catAccessories from '../../img/category-accessories- tile.png';
import prodShirt from '../../img/Brown Linen Shirt-image-container.png';
import prodCoat from '../../img/Warm Woolen Shirt Women-image-container.png';
import prodWatch from '../../img/Women Watch Gold-image-container.png';
import prodNecklace from '../../img/Black Pearl Necklace-image-container.png';
import philosophyTexture from '../../img/(Triết lý Thiết Kế)texture-image.png';

export const HOME_IMAGES = {
  // 1. Hero Banner
  hero: heroImage,

  // 2. Danh mục nổi bật (Categories)
  categoryWomen: catWomen,
  categoryMen: catMen,
  categoryClothes: catClothes,
  categoryAccessories: catAccessories,

  // 3. Sản phẩm mùa mới (Products)
  productShirt: prodShirt,
  productCoat: prodCoat,
  productWatch: prodWatch,
  productBracelet: prodNecklace,

  // 4. Triết lý thiết kế (Texture)
  philosophy: philosophyTexture,

  // 5. Nghệ thuật khâu tay đương đại (Artisan)
  artisan: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80",
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      emailInput: '',
      isSubscribed: false,
      cartNotification: null
    };
  }

  handleAddToCart = (productName) => {
    this.setState({ cartNotification: `Đã thêm "${productName}" vào giỏ hàng!` });
    setTimeout(() => {
      this.setState({ cartNotification: null });
    }, 3000);
  };

  handleSubscribe = (e) => {
    e.preventDefault();
    if (this.state.emailInput.trim()) {
      this.setState({ isSubscribed: true, emailInput: '' });
      setTimeout(() => {
        this.setState({ isSubscribed: false });
      }, 4000);
    }
  };

  render() {
    return (
      <div className="bansac-home-page">
        {/* Toast Notification */}
        {this.state.cartNotification && (
          <div className="cart-toast-notification">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>{this.state.cartNotification}</span>
          </div>
        )}

        {/* 1. HERO SECTION */}
        <section className="hero-section">
          <div className="hero-container">
            {/* Hero Left Column: Editorial Photo */}
            <div className="hero-media-col">
              <div className="hero-image-wrapper">
                <img
                  src={HOME_IMAGES.hero}
                  alt="Sự Yên Lặng Đương Đại"
                  className="hero-image"
                />
              </div>
            </div>

            {/* Hero Right Column: Content */}
            <div className="hero-content-col">
              <div className="hero-content-inner">
                <span className="section-badge">BỘ SƯU TẬP MÙA THU</span>
                <h1 className="hero-title">
                  Sự Yên Lặng<br />Đương Đại
                </h1>
                <p className="hero-description">
                  Khám phá các thiết kế mang âm hưởng tối giản đương đại, tôn vinh phom dáng chuẩn mực cùng chất liệu cao cấp. Tinh thần thời trang thanh lịch và vượt thời gian cho phong cách sống tinh tế.
                </p>
                <div className="hero-action-group">
                  <Link to="/clothes" className="btn-primary">
                    KHÁM PHÁ BỘ SƯU TẬP
                  </Link>
                  <Link to="/women" className="btn-outline">
                    XEM LOOKBOOK
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. CATEGORIES SECTION */}
        <section className="categories-section">
          <div className="site-container">
            <div className="section-header center">
              <span className="section-badge">DANH MỤC NỔI BẬT</span>
              <h2 className="section-title">Không Gian Mua Sắm Riêng Biệt</h2>
              <p className="section-subtitle">
                Chọn lọc những thiết kế tinh hoa nhất dành cho bạn, kết hợp giữa phong cách cổ điển và chất liệu hiện đại.
              </p>
            </div>

            <div className="categories-grid">
              {/* Category 1: Women */}
              <Link to="/women" className="category-card">
                <div className="category-image-wrap">
                  <img
                    src={HOME_IMAGES.categoryWomen}
                    alt="Thời trang Nữ"
                  />
                  <div className="category-overlay">
                    <h3 className="category-name">Women</h3>
                    <span className="category-link">Thời trang Nữ &rarr;</span>
                  </div>
                </div>
              </Link>

              {/* Category 2: Men */}
              <Link to="/men" className="category-card">
                <div className="category-image-wrap">
                  <img
                    src={HOME_IMAGES.categoryMen}
                    alt="Thời trang Nam"
                  />
                  <div className="category-overlay">
                    <h3 className="category-name">Men</h3>
                    <span className="category-link">Thời trang Nam &rarr;</span>
                  </div>
                </div>
              </Link>

              {/* Category 3: Clothes */}
              <Link to="/clothes" className="category-card">
                <div className="category-image-wrap">
                  <img
                    src={HOME_IMAGES.categoryClothes}
                    alt="Trang phục"
                  />
                  <div className="category-overlay">
                    <h3 className="category-name">Clothes</h3>
                    <span className="category-link">Trang phục &rarr;</span>
                  </div>
                </div>
              </Link>

              {/* Category 4: Accessories */}
              <Link to="/accessories" className="category-card">
                <div className="category-image-wrap">
                  <img
                    src={HOME_IMAGES.categoryAccessories}
                    alt="Phụ kiện"
                  />
                  <div className="category-overlay">
                    <h3 className="category-name">Accessories</h3>
                    <span className="category-link">Phụ kiện &rarr;</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* 3. NEW COLLECTION / FEATURED PRODUCTS SECTION */}
        <section className="featured-products-section">
          <div className="site-container">
            <div className="products-header-row">
              <div>
                <span className="section-badge">SẢN PHẨM MỚI</span>
                <h2 className="section-title">Tuyển Tập Mùa Mới</h2>
              </div>
              <Link to="/clothes" className="view-all-link">
                XEM TẤT CẢ SẢN PHẨM &rarr;
              </Link>
            </div>

            <div className="products-grid">
              {/* Product 1: Brown Linen Shirt */}
              <div className="product-card">
                <div className="product-img-box">
                  <span className="product-tag">MỚI</span>
                  <Link to="/products/1">
                    <img
                      src={HOME_IMAGES.productShirt}
                      alt="Brown Linen Shirt"
                    />
                  </Link>
                </div>
                <div className="product-meta">
                  <div className="product-info-row">
                    <h3 className="product-name">
                      <Link to="/products/1">Brown Linen Shirt</Link>
                    </h3>
                    <span className="product-price">1.450.000 ₫</span>
                  </div>
                  <button
                    type="button"
                    className="add-to-cart-btn"
                    onClick={() => this.handleAddToCart('Brown Linen Shirt')}
                  >
                    Thêm vào giỏ hàng +
                  </button>
                </div>
              </div>

              {/* Product 2: Warm Woolen Shirt Women */}
              <div className="product-card">
                <div className="product-img-box">
                  <span className="product-tag">BÁN CHẠY</span>
                  <Link to="/products/4">
                    <img
                      src={HOME_IMAGES.productCoat}
                      alt="Warm Woolen Shirt Women"
                    />
                  </Link>
                </div>
                <div className="product-meta">
                  <div className="product-info-row">
                    <h3 className="product-name">
                      <Link to="/products/4">Warm Woolen Shirt Women</Link>
                    </h3>
                    <span className="product-price">3.850.000 ₫</span>
                  </div>
                  <button
                    type="button"
                    className="add-to-cart-btn"
                    onClick={() => this.handleAddToCart('Warm Woolen Shirt Women')}
                  >
                    Thêm vào giỏ hàng +
                  </button>
                </div>
              </div>

              {/* Product 3: Women Watch Gold */}
              <div className="product-card">
                <div className="product-img-box">
                  <span className="product-tag">PHỤ KIỆN</span>
                  <Link to="/products/11">
                    <img
                      src={HOME_IMAGES.productWatch}
                      alt="Women Watch Gold"
                    />
                  </Link>
                </div>
                <div className="product-meta">
                  <div className="product-info-row">
                    <h3 className="product-name">
                      <Link to="/products/11">Women Watch Gold</Link>
                    </h3>
                    <span className="product-price">4.200.000 ₫</span>
                  </div>
                  <button
                    type="button"
                    className="add-to-cart-btn"
                    onClick={() => this.handleAddToCart('Women Watch Gold')}
                  >
                    Thêm vào giỏ hàng +
                  </button>
                </div>
              </div>

              {/* Product 4: Black Pearl Necklace */}
              <div className="product-card">
                <div className="product-img-box">
                  <span className="product-tag">THỦ CÔNG</span>
                  <Link to="/products/12">
                    <img
                      src={HOME_IMAGES.productBracelet}
                      alt="Black Pearl Necklace"
                    />
                  </Link>
                </div>
                <div className="product-meta">
                  <div className="product-info-row">
                    <h3 className="product-name">
                      <Link to="/products/12">Black Pearl Necklace</Link>
                    </h3>
                    <span className="product-price">890.000 ₫</span>
                  </div>
                  <button
                    type="button"
                    className="add-to-cart-btn"
                    onClick={() => this.handleAddToCart('Black Pearl Necklace')}
                  >
                    Thêm vào giỏ hàng +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. DESIGN PHILOSOPHY SECTION (TRIẾT LÝ THIẾT KẾ) */}
        <section className="philosophy-section" id="story">
          <div className="philosophy-container">
            <div className="philosophy-text-col">
              <span className="section-badge-light">TRIẾT LÝ THIẾT KẾ</span>
              <blockquote className="philosophy-quote">
                “Thời trang không chỉ để ngắm nhìn, mà là cách chúng ta tương tác với thế giới xung quanh một cách tĩnh tại và kiêu hãnh.”
              </blockquote>
              <cite className="philosophy-author">
                &mdash; Giám đốc sáng tạo BẢN SẮC
              </cite>
              <div className="philosophy-link-wrap">
                <a href="#artisan-story" className="philosophy-link">
                  ĐỌC CÂU CHUYỆN THƯƠNG HIỆU &rarr;
                </a>
              </div>
            </div>

            <div className="philosophy-media-col">
              <img
                src={HOME_IMAGES.philosophy}
                alt="Chất liệu thủ công cao cấp"
                className="philosophy-image"
              />
            </div>
          </div>
        </section>

        {/* 5. SERVICES / VALUE PROPOSITION */}
        <section className="services-section">
          <div className="site-container">
            <div className="section-header center">
              <span className="section-badge">DỊCH VỤ ĐẶC QUYỀN</span>
              <h2 className="section-title">Trải Nghiệm Mua Sắm Tận Tâm</h2>
              <p className="section-subtitle">
                Cam kết mang đến dịch vụ hoàn hảo và trải nghiệm mua sắm thượng lưu cho từng khách hàng.
              </p>
            </div>

            <div className="services-grid">
              {/* Feature 1 */}
              <div className="service-card">
                <div className="service-icon-wrap">
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                    <rect x="1" y="3" width="15" height="13"></rect>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                  </svg>
                </div>
                <h3 className="service-title">Giao Hàng Tốc Hành</h3>
                <p className="service-desc">
                  Miễn phí vận chuyển toàn quốc cho mọi đơn hàng. Đóng gói hộp cao cấp chuẩn quà tặng sang trọng.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="service-card">
                <div className="service-icon-wrap">
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                  </svg>
                </div>
                <h3 className="service-title">Đổi Trả Dễ Dàng</h3>
                <p className="service-desc">
                  Chính sách đổi hàng linh hoạt trong vòng 14 ngày, dịch vụ lấy hàng tận nơi miễn phí hoàn toàn.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="service-card">
                <div className="service-icon-wrap">
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                  </svg>
                </div>
                <h3 className="service-title">Tư Vấn Phong Cách 1:1</h3>
                <p className="service-desc">
                  Đội ngũ chuyên gia thời trang sẵn sàng hỗ trợ định hình phong cách riêng và chọn size chuẩn xác.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. ARTISAN CRAFTSMANSHIP STORY */}
        <section className="artisan-section" id="artisan-story">
          <div className="site-container">
            <div className="artisan-container">
              {/* Left Column: Artisan photo */}
              <div className="artisan-media-col">
                <div className="artisan-image-wrapper">
                  <img
                    src={HOME_IMAGES.artisan}
                    alt="Nghệ Thuật Khâu Tay Đương Đại"
                    className="artisan-image"
                  />
                </div>
              </div>

              {/* Right Column: Artisan narrative */}
              <div className="artisan-content-col">
                <span className="section-badge">NGHỆ NHÂN &amp; CHẤT LIỆU</span>
                <h2 className="artisan-title">Nghệ Thuật Khâu Tay Đương Đại</h2>
                <p className="artisan-text">
                  Mỗi sản phẩm tại BẢN SẮC là kết tinh giữa sự tỉ mỉ của bàn tay nghệ nhân và chất liệu thượng hạng tuyển chọn từ khắp nơi trên thế giới. Từng đường kim, mũi chỉ đều chứa đựng niềm đam mê và tinh thần gìn giữ những giá trị thủ công truyền thống trong dòng chảy thời trang đương đại.
                </p>
                <p className="artisan-text">
                  Chúng tôi tin rằng thời trang thực sự bền vững chỉ đến từ sự trân trọng chất lượng và tôn vinh công sức của những người thợ lành nghề.
                </p>
                <div className="artisan-action">
                  <Link to="/clothes" className="artisan-link">
                    TÌM HIỂU QUY TRÌNH CHẾ TÁC &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. NEWSLETTER SECTION */}
        <section className="newsletter-section">
          <div className="site-container">
            <div className="newsletter-inner">
              <span className="section-badge">KẾT NỐI VỚI CHÚNG TÔI</span>
              <h2 className="newsletter-title">Nhận Thư Báo Bản Tin Định Kỳ</h2>
              <p className="newsletter-subtitle">
                Đăng ký nhận thông tin độc quyền về các bộ sưu tập giới hạn, sự kiện riêng tư và ưu đãi đặc quyền.
              </p>

              {this.state.isSubscribed ? (
                <div className="newsletter-success">
                  Cảm ơn bạn đã đăng ký! BẢN SẮC sẽ sớm gửi tin tức mới nhất đến bạn.
                </div>
              ) : (
                <form className="newsletter-form" onSubmit={this.handleSubscribe}>
                  <input
                    type="email"
                    required
                    placeholder="Địa chỉ email của bạn..."
                    className="newsletter-input"
                    value={this.state.emailInput}
                    onChange={(e) => this.setState({ emailInput: e.target.value })}
                  />
                  <button type="submit" className="newsletter-btn">
                    ĐĂNG KÝ
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    );
  }
}

export default App;
