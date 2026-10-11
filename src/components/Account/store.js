import { api } from '../../services/api';
import { currentUser } from '../Auth/store';
import { getProducts } from '../Data';

const CACHE_KEY = 'BANSAC_ORDER_CACHE';
export const ORDER_EVENT = 'bansac-order-change';

function cacheOrders(orders) {
  const user=currentUser();
  if(user)localStorage.setItem(`${CACHE_KEY}_${user.id}`,JSON.stringify(orders));
  window.dispatchEvent(new Event(ORDER_EVENT));
  return orders;
}

export function getMyOrders() {
  const user=currentUser();if(!user)return [];
  try{return JSON.parse(localStorage.getItem(`${CACHE_KEY}_${user.id}`))||[];}catch(e){return [];}
}

export function fetchMyOrders() {
  if(!currentUser())return Promise.resolve([]);
  return api.get('/orders/my').then((result)=>{const products=getProducts();const orders=result.orders.map((order)=>Object.assign({},order,{items:order.items.map((item)=>{const product=products.find((entry)=>String(entry.id)===String(item.id));return Object.assign({},item,{img:item.img||(product&&product.img)||''});})}));return cacheOrders(orders);});
}

export function createOrder(cartItems, products, subtotal, shipping, details) {
  const payload={items:cartItems.map((item)=>({id:item.id,quantity:item.quantity,size:item.size,color:item.color})),promoCode:details&&details.promoCode,shippingMethod:details&&details.shippingMethod,payment:details&&details.payment,address:details&&details.address};
  return api.post('/orders',payload).then((result)=>{const catalog=getProducts();const order=Object.assign({},result.order,{items:result.order.items.map((item)=>{const product=catalog.find((entry)=>String(entry.id)===String(item.id));return Object.assign({},item,{img:item.img||(product&&product.img)||''});})});if(currentUser())cacheOrders([order].concat(getMyOrders().filter((item)=>item.id!==order.id)));return order;});
}
