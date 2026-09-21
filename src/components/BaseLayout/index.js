// Dependencies
import React, { Component } from 'react';
// Externals
import Navbar from './components/NavBar';
import Footer from './components/Footer';
import './index.css';


export default class BaseLayout extends Component {
  render() {
    return(
      <div className="layout-wrapper">
        <Navbar />
        <div className="content">
          {this.props.children}
        </div>
        <Footer />
      </div>
    );
  }
}
