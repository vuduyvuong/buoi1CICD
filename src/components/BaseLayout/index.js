// Dependencies
import React, { Component } from 'react';
// Externals
import Navbar from './components/NavBar';
import Footer from './components/Footer';
import './index.css';
import { currentUser, refreshUser } from '../Auth/store';


export default class BaseLayout extends Component {
  componentDidMount() {
    if (currentUser()) refreshUser();
  }

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
