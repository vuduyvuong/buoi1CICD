//Dependencies
import React, { Component } from 'react';
import find from 'lodash/find';
import { Link } from 'react-router-dom';
import { Icon } from 'react-materialize';
//Internals
import PRODUCTS from '../Data';
import './index.css';

class ShowProduct extends Component {
  render () {
    const product = find(PRODUCTS, ['id', parseInt(this.props.match.params.id, 10)]);
    const currentProduct = product || PRODUCTS[0];
    return (
      <div className="show-product">
        <div className="item-wrapper">
          <div className="item-image">
            <img className="product-image" src={currentProduct.img} alt="product" />
          </div>
          <div className="item-name">
            <div className="product-info">
              <h3 id="product-name">{currentProduct.name}</h3>
            </div>
            <div className="product-bio">
              <p id="product-description">{currentProduct.description}</p>
              <p id="product-price">{typeof currentProduct.price === 'number' && currentProduct.price > 1000 ? `${currentProduct.price.toLocaleString('vi-VN')} ₫` : `$${currentProduct.price}`}</p>
              <Icon small id="add-icon">add_shopping_cart</Icon>
            </div>
            <div className="product-review">
              <div className="stars">
                <Icon small id="add-icon">star</Icon>
                <Icon small id="add-icon">star</Icon>
                <Icon small id="add-icon">star</Icon>
                <Icon small id="add-icon">star</Icon>
                <Icon small id="add-icon">star_half</Icon>
              </div>
            </div>
          </div>
        </div>
        <div className="similar-products">
          <h5>Sản phẩm liên quan</h5>
          {PRODUCTS
            .filter((p) => p.gender === currentProduct.gender && p.id !== currentProduct.id)
            .slice(0, 4)
            .map((item) => (
              <div key={item.id} className="item">
                <Link to={`/products/${item.id}`}>
                  <div className="product-img">
                    <img alt={item.name} src={item.img} />
                  </div>
                  <div className="product-details">
                    <h1 id="product-name">{item.name}</h1>
                    <h4 id="product-description">{item.description}</h4>
                  </div>
                </Link>
                <div className="price-add">
                  <h5 id="product-price">{typeof item.price === 'number' && item.price > 1000 ? `${item.price.toLocaleString('vi-VN')} ₫` : `$${item.price}`}</h5>
                  <Icon small id="add-icon">add_shopping_cart</Icon>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }
}

export default ShowProduct;
