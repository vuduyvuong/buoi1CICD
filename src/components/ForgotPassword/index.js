import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import './index.css';

class ForgotPassword extends Component {
  constructor(props){super(props);this.state={email:'',sent:false,error:'',loading:false};}
  submit=async(e)=>{e.preventDefault();if(!/^\S+@\S+\.\S+$/.test(this.state.email)){this.setState({error:'Vui lòng nhập email hợp lệ.'});return;}this.setState({loading:true,error:''});try{await api.post('/auth/forgot-password',{email:this.state.email});this.setState({sent:true,loading:false});}catch(error){this.setState({error:error.message,loading:false});}};
  render(){return <main className="forgot-page"><div className="forgot-card"><Link to="/login">← Quay lại đăng nhập</Link>{this.state.sent?<div className="forgot-success"><span>✓</span><p>YÊU CẦU ĐÃ ĐƯỢC GỬI</p><h1>Kiểm tra hộp thư của bạn</h1><p>Nếu email <b>{this.state.email}</b> tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.</p><Link to="/login">TRỞ VỀ ĐĂNG NHẬP</Link></div>:<div className="forgot-form"><p>KHÔI PHỤC TÀI KHOẢN</p><h1>Quên mật khẩu?</h1><span>Nhập email đã đăng ký. Chúng tôi sẽ gửi hướng dẫn để bạn lấy lại quyền truy cập.</span><form onSubmit={this.submit}><label>Email<input type="email" value={this.state.email} onChange={(e)=>this.setState({email:e.target.value,error:''})} placeholder="ban@email.com"/></label>{this.state.error&&<small>{this.state.error}</small>}<button>GỬI HƯỚNG DẪN</button></form></div>}</div></main>;}
}
export default ForgotPassword;
