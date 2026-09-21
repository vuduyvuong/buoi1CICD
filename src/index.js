import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';

import { BrowserRouter, Route, Switch } from 'react-router-dom';

import App from './components/App';
import Cart from './components/Cart';
import BaseLayout from './components/BaseLayout';
import Women from './components/Women';
import Men from './components/Men';
import Clothes from './components/Clothes';
import Accessories from './components/Accessories';
import ShowProduct from './components/ShowProduct';
import AdminPortal from './components/Admin';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      {/* Route Quản trị riêng biệt, độc lập với BaseLayout của storefront */}
      <Route path="/admin" component={AdminPortal} />

      {/* Routes Khách hàng với BaseLayout */}
      <Route render={() => (
        <BaseLayout>
          <Switch>
            <Route exact path="/" component={App} />
            <Route path="/cart" component={Cart} />
            <Route path="/women" component={Women} />
            <Route path="/men" component={Men} />
            <Route path="/clothes" component={Clothes} />
            <Route path="/accessories" component={Accessories} />
            <Route exact path="/products/:id" component={ShowProduct} />
          </Switch>
        </BaseLayout>
      )} />
    </Switch>
  </BrowserRouter>
, document.getElementById('root'));
registerServiceWorker();
