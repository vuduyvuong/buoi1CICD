import React from 'react';
import { Link } from 'react-router-dom';
import './index.css';
const NotFound=()=> <main className="not-found"><div><span>404</span><p>TRANG KHÔNG TỒN TẠI</p><h1>Có lẽ bạn đã rẽ nhầm một lối</h1><p>Hãy trở lại trang chủ hoặc tiếp tục khám phá những thiết kế mới nhất.</p><Link to="/">Về trang chủ</Link><Link className="outline" to="/clothes">Xem bộ sưu tập</Link></div></main>;
export default NotFound;
