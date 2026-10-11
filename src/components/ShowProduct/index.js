import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PRODUCTS from '../Data';
import { addToCart } from '../Cart/store';
import { api } from '../../services/api';
import './index.css';

class ShowProduct extends Component {
  constructor(props) { super(props); this.state = { size: '', color: '', quantity: 1, added: false, error: '', showGuide: false, remoteProduct: null }; }
  componentDidMount() { this.loadProduct(this.props.match.params.id); }
  componentWillReceiveProps(nextProps) { window.scrollTo(0, 0); this.setState({ size: '', color: '', quantity: 1, added: false, error: '', showGuide: false, remoteProduct: null }); this.loadProduct(nextProps.match.params.id); }
  loadProduct = (id) => api.get(`/products/${id}`).then((result) => { const local=PRODUCTS.find((item)=>String(item.id)===String(id));this.setState({remoteProduct:Object.assign({},local||{},result.product,{img:result.product.img||(local&&local.img)||''})}); }).catch(()=>null);

  add = (product) => {
    const size = this.state.size || (product.sizes.length === 1 ? product.sizes[0] : '');
    const color = this.state.color || (product.colors.length === 1 ? product.colors[0] : '');
    if (!size || !color) { this.setState({ error: 'Vui lòng chọn đầy đủ màu sắc và kích cỡ.' }); return; }
    addToCart(product.id, this.state.quantity, { size, color });
    this.setState({ added: true, error: '', size, color });
  };

  render() {
    const product = this.state.remoteProduct || PRODUCTS.find((item) => String(item.id) === String(this.props.match.params.id));
    if (!product) return <div className="product-not-found"><h1>Không tìm thấy sản phẩm</h1><Link to="/clothes">Quay lại cửa hàng</Link></div>;
    const related = PRODUCTS.filter((item) => item.id !== product.id && (item.gender === product.gender || item.category === product.category)).slice(0, 3);
    return <main className="detail-page">
      <div className="detail-shell"><div className="detail-breadcrumb"><Link to="/">Trang chủ</Link><span>/</span><Link to={product.category === 'accessories' ? '/accessories' : '/clothes'}>{product.category === 'accessories' ? 'Phụ kiện' : 'Trang phục'}</Link><span>/</span><b>{product.name}</b></div>
        <section className="detail-grid"><div className="detail-media"><img src={product.img} alt={product.name}/><span>Phiên bản tuyển chọn</span></div>
          <div className="detail-info"><p className="detail-kicker">BẢN SẮC STUDIO · {product.type}</p><h1>{product.name}</h1><p className="detail-price">{product.price.toLocaleString('vi-VN')} ₫</p><div className="detail-rating"><span>★★★★★</span><small>4.9 · 28 đánh giá</small></div><p className="detail-description">{product.description}. Một thiết kế chú trọng tính ứng dụng, được hoàn thiện tỉ mỉ để giữ phom đẹp và đồng hành bền lâu.</p>
            <div className="detail-option"><div className="detail-label"><b>Màu sắc</b><span>{this.state.color ? 'Đã chọn' : 'Chọn một màu'}</span></div><div className="color-list">{product.colors.map((color, index) => <button aria-label={`Màu ${index + 1}`} className={this.state.color === color ? 'active' : ''} onClick={() => this.setState({ color, error: '', added: false })} key={color} style={{backgroundColor:color}} />)}</div></div>
            <div className="detail-option"><div className="detail-label"><b>Kích cỡ</b><button className="size-guide-trigger" onClick={() => this.setState({showGuide:true})}>Hướng dẫn chọn size</button></div><div className="size-list">{product.sizes.map((size) => <button className={this.state.size === size ? 'active' : ''} onClick={() => this.setState({size,error:'',added:false})} key={size}>{size}</button>)}</div></div>
            {this.state.error && <p className="detail-error" role="alert">{this.state.error}</p>}
            <div className="detail-actions"><div className="quantity-picker"><button onClick={() => this.setState({quantity:Math.max(1,this.state.quantity-1)})}>−</button><span>{this.state.quantity}</span><button onClick={() => this.setState({quantity:this.state.quantity+1})}>+</button></div><button className="detail-add" onClick={() => this.add(product)}>{this.state.added ? '✓ ĐÃ THÊM VÀO GIỎ' : 'THÊM VÀO GIỎ HÀNG'}</button></div>
            <ul className="detail-benefits"><li>Miễn phí giao hàng từ 1.000.000 ₫</li><li>Đổi trả miễn phí trong 14 ngày</li><li>Tư vấn kích cỡ qua hotline 1900 888 999</li></ul>
          </div></section>
        <section className="related-section"><div><p className="detail-kicker">Có thể bạn sẽ thích</p><h2>Hoàn thiện phong cách</h2></div><div className="related-grid">{related.map((item) => <Link to={`/products/${item.id}`} key={item.id}><img src={item.img} alt={item.name}/><h3>{item.name}</h3><p>{item.price.toLocaleString('vi-VN')} ₫</p></Link>)}</div></section>
      </div>
      {this.state.showGuide && <div className="size-modal-backdrop" onClick={() => this.setState({showGuide:false})}><section className="size-modal" onClick={(e)=>e.stopPropagation()}><button className="size-modal-close" onClick={() => this.setState({showGuide:false})}>×</button><p className="detail-kicker">BẢN SẮC FIT GUIDE</p><h2>Hướng dẫn chọn kích cỡ</h2><p>Đo sát cơ thể, không siết thước. Nếu số đo nằm giữa hai size, hãy chọn size lớn hơn để thoải mái.</p><div className="size-table"><div><b>Size</b><b>Ngực</b><b>Eo</b><b>Hông</b></div><div><span>XS</span><span>78–82</span><span>60–64</span><span>84–88</span></div><div><span>S</span><span>83–87</span><span>65–69</span><span>89–93</span></div><div><span>M</span><span>88–92</span><span>70–74</span><span>94–98</span></div><div><span>L</span><span>93–98</span><span>75–80</span><span>99–104</span></div><div><span>XL</span><span>99–104</span><span>81–86</span><span>105–110</span></div></div><small>Đơn vị: cm. Cần hỗ trợ? Gọi 1900 888 999.</small></section></div>}
    </main>;
  }
}
export default ShowProduct;
