import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../Data';
import { getCart, updateCartItem, removeCartItem } from './store';
import { calculatePricing } from './pricing';
import './index.css';

class Cart extends Component {
  constructor(props){super(props);this.state={cart:getCart(),promoInput:'',promoCode:'',promoMessage:''};}
  refresh = (cart) => this.setState({cart});
  applyPromo = () => { const result=calculatePricing(this.subtotal(),this.state.promoInput);this.setState({promoCode:result.code,promoMessage:result.message}); };
  rows = () => { const products=getProducts();return this.state.cart.map((entry)=>({entry,product:products.find((p)=>String(p.id)===String(entry.id))})).filter((row)=>row.product); };
  subtotal = () => this.rows().reduce((sum,row)=>sum+row.product.price*row.entry.quantity,0);
  render(){
    const rows=this.rows();
    const subtotal=this.subtotal();
    const pricing=calculatePricing(subtotal,this.state.promoCode);
    return <main className="cart-page"><div className="cart-shell"><div className="cart-heading"><p>GIỎ HÀNG</p><h1>Lựa chọn của bạn</h1><span>{rows.reduce((sum,row)=>sum+row.entry.quantity,0)} sản phẩm</span></div>
      {!rows.length?<div className="empty-cart"><div>⌑</div><h2>Giỏ hàng đang trống</h2><p>Những thiết kế dành riêng cho bạn vẫn đang chờ được khám phá.</p><Link to="/clothes">Khám phá bộ sưu tập</Link></div>:
      <div className="cart-layout"><section className="cart-list">{rows.map(({entry,product})=><article className="cart-row" key={entry.lineKey}><Link to={`/products/${product.id}`} className="cart-thumb"><img src={product.img} alt={product.name}/></Link><div className="cart-row-info"><p>{product.type}</p><h2><Link to={`/products/${product.id}`}>{product.name}</Link></h2><span>{product.description}</span><div className="cart-variant"><span>Size: <b>{entry.size || product.sizes[0]}</b></span><span>Màu: <i style={{backgroundColor:entry.color || product.colors[0]}}/></span></div><div className="cart-row-bottom"><div className="cart-quantity"><button onClick={()=>this.refresh(updateCartItem(entry.lineKey,entry.quantity-1))}>−</button><b>{entry.quantity}</b><button onClick={()=>this.refresh(updateCartItem(entry.lineKey,entry.quantity+1))}>+</button></div><button className="cart-remove" onClick={()=>this.refresh(removeCartItem(entry.lineKey))}>Xóa</button></div></div><strong>{(product.price*entry.quantity).toLocaleString('vi-VN')} ₫</strong></article>)}</section>
        <aside className="cart-summary"><p className="summary-kicker">TÓM TẮT ĐƠN HÀNG</p><div><span>Tạm tính</span><b>{subtotal.toLocaleString('vi-VN')} ₫</b></div>{pricing.discount>0&&<div className="discount-row"><span>Giảm giá</span><b>−{pricing.discount.toLocaleString('vi-VN')} ₫</b></div>}<div><span>Vận chuyển</span><b>{pricing.shipping?`${pricing.shipping.toLocaleString('vi-VN')} ₫`:'Miễn phí'}</b></div><label>Mã ưu đãi<input value={this.state.promoInput} onChange={(e)=>this.setState({promoInput:e.target.value,promoMessage:''})} placeholder="BANSAC10 hoặc FREESHIP"/><button type="button" onClick={this.applyPromo}>ÁP DỤNG</button></label>{this.state.promoMessage&&<p className={`promo-message ${pricing.valid?'valid':'invalid'}`}>{this.state.promoMessage}</p>}<div className="summary-total"><span>Tổng cộng</span><strong>{pricing.total.toLocaleString('vi-VN')} ₫</strong></div><Link className="checkout-button" to={{pathname:'/checkout',state:{promoCode:this.state.promoCode}}}>TIẾN HÀNH THANH TOÁN</Link><p className="secure-note">Thanh toán an toàn · Đổi trả trong 14 ngày</p></aside></div>}
    </div></main>;
  }
}
export default Cart;
