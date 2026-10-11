import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import PRODUCTS from '../Data';
import { addToCart } from '../Cart/store';
import { api } from '../../services/api';
import './index.css';

class ProductCatalog extends Component {
  constructor(props) {
    super(props);
    const params = new URLSearchParams(window.location.search);
    this.state = { sort: 'featured', search: params.get('search') || '', notice: '', products: PRODUCTS };
  }

  componentDidMount() {
    api.get('/products').then((result) => {
      const products=result.products.map((item)=>{const local=PRODUCTS.find((product)=>String(product.id)===String(item.id));return Object.assign({},local||{},item,{img:item.img||(local&&local.img)||''});});
      localStorage.setItem('BANSAC_CATALOG_CACHE',JSON.stringify(products));
      this.setState({products});
    }).catch(()=>null);
  }

  addProduct = (product) => {
    addToCart(product.id, 1, { size: product.sizes[0], color: product.colors[0] });
    this.setState({ notice: `Đã thêm “${product.name}” vào giỏ hàng` });
    clearTimeout(this.noticeTimer);
    this.noticeTimer = setTimeout(() => this.setState({ notice: '' }), 2600);
  };

  componentWillUnmount() { clearTimeout(this.noticeTimer); }
  componentWillReceiveProps(nextProps) {
    if (nextProps.location.search !== this.props.location.search) {
      const params = new URLSearchParams(nextProps.location.search);
      this.setState({ search: params.get('search') || '' });
    }
  }

  render() {
    const { title, eyebrow, description, filter } = this.props;
    let products = this.state.products.filter(filter || (() => true));
    const query = this.state.search.trim().toLowerCase();
    if (query) products = products.filter((p) => `${p.name} ${p.description}`.toLowerCase().indexOf(query) !== -1);
    if (this.state.sort === 'price-low') products.sort((a, b) => a.price - b.price);
    if (this.state.sort === 'price-high') products.sort((a, b) => b.price - a.price);
    if (this.state.sort === 'name') products.sort((a, b) => a.name.localeCompare(b.name));

    return (
      <main className="catalog-page">
        {this.state.notice && <div className="catalog-toast" role="status">✓ {this.state.notice}</div>}
        <header className="catalog-hero"><div className="catalog-shell"><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div></header>
        <section className="catalog-shell catalog-content">
          <div className="catalog-toolbar">
            <p><strong>{products.length}</strong> sản phẩm được tuyển chọn</p>
            <div className="catalog-controls">
              <label className="catalog-search"><span aria-hidden="true">⌕</span><input value={this.state.search} onChange={(e) => this.setState({ search: e.target.value })} placeholder="Tìm trong bộ sưu tập" aria-label="Tìm sản phẩm" /></label>
              <select value={this.state.sort} onChange={(e) => this.setState({ sort: e.target.value })} aria-label="Sắp xếp sản phẩm"><option value="featured">Nổi bật</option><option value="price-low">Giá thấp đến cao</option><option value="price-high">Giá cao đến thấp</option><option value="name">Tên A–Z</option></select>
            </div>
          </div>
          {products.length ? <div className="catalog-grid">{products.map((product) => (
            <article className="catalog-card" key={product.id}>
              <Link to={`/products/${product.id}`} className="catalog-image">{product.badge && <span className="catalog-badge">{product.badge}</span>}<img src={product.img} alt={product.name} /><span className="catalog-view">Xem chi tiết</span></Link>
              <div className="catalog-card-body"><div><p className="catalog-type">{product.type}</p><h2><Link to={`/products/${product.id}`}>{product.name}</Link></h2><p className="catalog-description">{product.description}</p></div><div className="catalog-buy-row"><strong>{product.price.toLocaleString('vi-VN')} ₫</strong><button onClick={() => this.addProduct(product)} aria-label={`Thêm ${product.name} vào giỏ`}>+</button></div></div>
            </article>
          ))}</div> : <div className="catalog-empty"><h2>Chưa tìm thấy sản phẩm</h2><p>Thử một từ khóa khác hoặc khám phá toàn bộ bộ sưu tập.</p><button onClick={() => this.setState({ search: '' })}>Xóa tìm kiếm</button></div>}
        </section>
      </main>
    );
  }
}

export default withRouter(ProductCatalog);
