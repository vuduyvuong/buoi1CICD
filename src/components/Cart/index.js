//Dependencies
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import map from 'lodash/map';
//Internals
import './index.css';

class CartProducts extends Component {
  static propTypes = {
    addItemToCart: PropTypes.func,
  };

  render() {
    return(
      <div className="cart-container" style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', minHeight: '60vh' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px' }}>Giỏ hàng của bạn</h1>
        <div className="items">
          {this.props.cartProducts && this.props.cartProducts.length > 0 ? (
            map(this.props.cartProducts, (product) => (
              <h2 key={product.id}>{product.name}</h2>
            ))
          ) : (
            <p style={{ color: '#666', fontSize: '16px' }}>Giỏ hàng của bạn hiện đang trống. Hãy khám phá các bộ sưu tập của BẢN SẮC!</p>
          )}
        </div>
      </div>
    );
  }
}

export default CartProducts;
