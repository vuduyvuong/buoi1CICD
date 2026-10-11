import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './index.css';

const CONTENT = {
  'size-guide': { eyebrow:'TƯ VẤN KÍCH CỠ', title:'Hướng dẫn chọn size', intro:'Số đo chính xác giúp trang phục giữ đúng tinh thần thiết kế và mang lại cảm giác thoải mái.', sections:[['Cách đo','Vòng ngực: đo quanh phần đầy nhất. Vòng eo: đo quanh phần nhỏ nhất. Vòng hông: đo quanh phần đầy nhất. Giữ thước song song với mặt đất.'],['Bảng size nữ','XS: ngực 78–82, eo 60–64 · S: ngực 83–87, eo 65–69 · M: ngực 88–92, eo 70–74 · L: ngực 93–98, eo 75–80.'],['Bảng size nam','M: ngực 90–96, eo 76–82 · L: ngực 97–103, eo 83–89 · XL: ngực 104–110, eo 90–96. Tất cả số đo tính bằng cm.']] },
  shipping: { eyebrow:'DỊCH VỤ GIAO HÀNG', title:'Chính sách vận chuyển', intro:'BẢN SẮC đóng gói cẩn thận và cập nhật hành trình đơn hàng minh bạch.', sections:[['Phí vận chuyển','Miễn phí giao hàng tiêu chuẩn cho đơn từ 1.000.000 ₫. Đơn dưới mức này có phí 50.000 ₫. Giao hỏa tốc có phí 80.000 ₫.'],['Thời gian giao hàng','Nội thành: 1–2 ngày làm việc. Các tỉnh thành khác: 2–4 ngày. Khu vực xa có thể cần thêm 1–2 ngày.'],['Theo dõi đơn hàng','Sau khi đơn được xác nhận, bạn có thể theo dõi trạng thái trong mục Đơn hàng của tôi hoặc liên hệ hotline.']] },
  returns: { eyebrow:'AN TÂM MUA SẮM', title:'Đổi trả & bảo hành', intro:'Bạn có 14 ngày để đổi trả sản phẩm còn nguyên trạng và đầy đủ nhãn mác.', sections:[['Điều kiện đổi trả','Sản phẩm chưa qua sử dụng, chưa giặt, còn nguyên tem nhãn và hóa đơn. Phụ kiện cá nhân không áp dụng đổi trả vì lý do vệ sinh.'],['Quy trình','Liên hệ bộ phận hỗ trợ, cung cấp mã đơn và lý do đổi trả. Chúng tôi sẽ hướng dẫn gửi hàng hoặc đặt lịch lấy hàng.'],['Bảo hành','Hỗ trợ lỗi đường may, khóa kéo và phụ liệu do sản xuất trong 90 ngày kể từ ngày nhận hàng.']] },
  privacy: { eyebrow:'QUYỀN RIÊNG TƯ', title:'Chính sách bảo mật', intro:'Chúng tôi chỉ thu thập dữ liệu cần thiết để xử lý đơn hàng và cải thiện trải nghiệm.', sections:[['Dữ liệu được thu thập','Thông tin tài khoản, địa chỉ giao hàng, lịch sử đơn và tương tác với website.'],['Mục đích sử dụng','Xác nhận đơn, giao hàng, chăm sóc khách hàng và gửi nội dung tiếp thị khi bạn đồng ý.'],['Quyền của bạn','Bạn có quyền yêu cầu xem, chỉnh sửa hoặc xóa dữ liệu cá nhân bằng cách liên hệ contact@bansac.vn.']] },
  terms: { eyebrow:'THÔNG TIN PHÁP LÝ', title:'Điều khoản dịch vụ', intro:'Việc sử dụng website đồng nghĩa bạn đồng ý với các điều khoản mua bán dưới đây.', sections:[['Giá và sản phẩm','Giá niêm yết đã bao gồm thuế áp dụng. Màu sắc thực tế có thể chênh lệch nhẹ do thiết bị hiển thị.'],['Xác nhận đơn','Đơn hàng chỉ được xem là xác nhận sau khi BẢN SẮC gửi thông báo hoặc liên hệ trực tiếp.'],['Trách nhiệm','Khách hàng chịu trách nhiệm cung cấp thông tin giao nhận chính xác và kiểm tra sản phẩm khi nhận.']] }
};

class InfoPage extends Component {
  constructor(props){super(props);this.state={sent:false};}

  renderFaq(){
    const items=[['Tôi có thể thay đổi đơn hàng không?','Bạn có thể yêu cầu thay đổi trước khi đơn chuyển sang trạng thái đang giao. Hãy liên hệ hotline và cung cấp mã đơn.'],['Bao lâu tôi nhận được hàng?','Thời gian dự kiến là 1–4 ngày làm việc tùy khu vực và phương thức vận chuyển.'],['Tôi có được thử sản phẩm khi nhận không?','Bạn được kiểm tra ngoại quan và thông tin sản phẩm. Việc thử đồ phụ thuộc chính sách của đơn vị vận chuyển.'],['Làm sao để đổi size?','Gửi yêu cầu trong vòng 14 ngày. Sản phẩm cần còn nguyên tem nhãn và chưa qua sử dụng.'],['BẢN SẮC có cửa hàng không?','Chúng tôi có flagship tại Hà Nội và TP. Hồ Chí Minh, mở cửa hàng ngày từ 09:00 đến 21:30.']];
    return <main className="info-page"><div className="info-hero"><p>GIẢI ĐÁP NHANH</p><h1>Câu hỏi thường gặp</h1><span>Những thông tin thường được khách hàng quan tâm khi mua sắm tại BẢN SẮC.</span></div><div className="faq-list">{items.map((item,index)=><details key={index}><summary>{item[0]}<span>+</span></summary><p>{item[1]}</p></details>)}</div></main>;
  }

  renderSupport(){
    return <main className="info-page"><div className="info-hero"><p>CHĂM SÓC KHÁCH HÀNG</p><h1>Chúng tôi có thể giúp gì?</h1><span>Đội ngũ BẢN SẮC phản hồi yêu cầu trong vòng một ngày làm việc.</span></div><div className="support-layout"><div className="support-cards"><article><b>Hotline</b><a href="tel:1900888999">1900 888 999</a><span>09:00–21:30 hàng ngày</span></article><article><b>Email</b><a href="mailto:contact@bansac.vn">contact@bansac.vn</a><span>Phản hồi trong 24 giờ</span></article></div><form className="support-form" onSubmit={(e)=>{e.preventDefault();this.setState({sent:true});}}>{this.state.sent?<div className="support-sent"><b>✓ Yêu cầu đã được gửi</b><p>Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.</p><button type="button" onClick={()=>this.setState({sent:false})}>Gửi yêu cầu khác</button></div>:<div className="support-form-fields"><h2>Gửi yêu cầu hỗ trợ</h2><div className="support-field-row"><label>Họ và tên<input required/></label><label>Email<input type="email" required/></label></div><label>Chủ đề<select><option>Tư vấn sản phẩm</option><option>Kiểm tra đơn hàng</option><option>Đổi trả & bảo hành</option><option>Góp ý khác</option></select></label><label>Nội dung<textarea required/></label><button type="submit">GỬI YÊU CẦU</button></div>}</form></div></main>;
  }

  render(){
    if(this.props.type==='faq')return this.renderFaq();
    if(this.props.type==='support')return this.renderSupport();
    const content=CONTENT[this.props.type]||CONTENT.shipping;
    return <main className="info-page"><div className="info-hero"><p>{content.eyebrow}</p><h1>{content.title}</h1><span>{content.intro}</span></div><div className="policy-content"><aside><p>TRONG TRANG NÀY</p>{content.sections.map((section,index)=><a href={`#section-${index}`} key={section[0]}>{section[0]}</a>)}</aside><article>{content.sections.map((section,index)=><section id={`section-${index}`} key={section[0]}><span>0{index+1}</span><div><h2>{section[0]}</h2><p>{section[1]}</p></div></section>)}<div className="policy-help"><b>Bạn vẫn cần hỗ trợ?</b><p>Đội ngũ chăm sóc khách hàng luôn sẵn sàng đồng hành.</p><Link to="/support">Liên hệ BẢN SẮC →</Link></div></article></div></main>;
  }
}
export default InfoPage;
