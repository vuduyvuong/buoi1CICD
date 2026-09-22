// Dependencies
import React, { Component } from 'react';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chartTimeframe: 'daily', // 'daily' | 'monthly'
      hoveredBarIndex: null,
      tooltipPos: { x: 0, y: 0, val: 0, label: '' }
    };
  }

  getDailyRevenueData = () => {
    return [
      { label: 'T2 (15/9)', revenue: 12500000, orders: 8 },
      { label: 'T3 (16/9)', revenue: 18200000, orders: 12 },
      { label: 'T4 (17/9)', revenue: 14750000, orders: 9 },
      { label: 'T5 (18/9)', revenue: 22800000, orders: 15 },
      { label: 'T6 (19/9)', revenue: 28900000, orders: 19 },
      { label: 'T7 (20/9)', revenue: 35400000, orders: 24 },
      { label: 'CN (21/9)', revenue: 31200000, orders: 21 },
    ];
  };

  getMonthlyRevenueData = () => {
    return [
      { label: 'T1', revenue: 95000000, orders: 75 },
      { label: 'T2', revenue: 112000000, orders: 90 },
      { label: 'T3', revenue: 130000000, orders: 110 },
      { label: 'T4', revenue: 105000000, orders: 82 },
      { label: 'T5', revenue: 142000000, orders: 115 },
      { label: 'T6', revenue: 168000000, orders: 134 },
      { label: 'T7', revenue: 155000000, orders: 120 },
      { label: 'T8', revenue: 178000000, orders: 145 },
      { label: 'T9', revenue: 163750000, orders: 108 },
    ];
  };

  formatCurrency = (num) => {
    return (num || 0).toLocaleString('vi-VN') + ' ₫';
  };

  handleBarMouseEnter = (item, index, evt) => {
    const rect = evt.target.getBoundingClientRect();
    this.setState({
      hoveredBarIndex: index,
      tooltipPos: {
        x: rect.left + rect.width / 2,
        y: rect.top,
        val: item.revenue,
        orders: item.orders,
        label: item.label
      }
    });
  };

  handleBarMouseLeave = () => {
    this.setState({ hoveredBarIndex: null });
  };

  render() {
    const { products, orders, onNavigateToProducts } = this.props;
    const { chartTimeframe } = this.state;

    // Tính toán KPI
    const totalProducts = (products || []).length;
    const totalStock = (products || []).reduce((sum, p) => sum + (p.stock || 0), 0);
    const pendingOrders = (orders || []).filter(o => o.status === 'pending').length;
    const totalRevenue = (orders || []).reduce((sum, o) => sum + (o.total || 0), 0);

    // Lọc sản phẩm sắp hết hàng (tồn kho <= 5)
    const lowStockProducts = (products || []).filter(p => (p.stock || 0) <= 5);

    // Dữ liệu biểu đồ
    const chartData = chartTimeframe === 'daily' ? this.getDailyRevenueData() : this.getMonthlyRevenueData();
    const maxRevenue = Math.max(...chartData.map(d => d.revenue)) * 1.15;

    // Kích thước SVG
    const svgWidth = 600;
    const svgHeight = 220;
    const paddingLeft = 40;
    const paddingBottom = 30;
    const chartAreaWidth = svgWidth - paddingLeft - 20;
    const chartAreaHeight = svgHeight - paddingBottom - 20;
    const barSpacing = chartAreaWidth / chartData.length;
    const barWidth = Math.min(32, barSpacing * 0.55);

    return (
      <div className="admin-dashboard-view">
        {/* KPI CARDS GRID */}
        <div className="kpi-grid">
          {/* Card 1: Doanh thu */}
          <div className="kpi-card">
            <div className="kpi-info">
              <h4>Doanh thu ước tính</h4>
              <p className="kpi-number">{this.formatCurrency(totalRevenue > 0 ? totalRevenue : 163750000)}</p>
              <p className="kpi-subtext">
                <span className="trend-up">&uarr; 14.8%</span> so với tháng trước
              </p>
            </div>
            <div className="kpi-icon-box icon-blue">
              <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
          </div>

          {/* Card 2: Đơn hàng */}
          <div className="kpi-card">
            <div className="kpi-info">
              <h4>Tổng số đơn hàng</h4>
              <p className="kpi-number">{(orders || []).length || 158}</p>
              <p className="kpi-subtext">
                <span className="trend-up">&uarr; 9 đơn mới</span> trong ngày
              </p>
            </div>
            <div className="kpi-icon-box icon-emerald">
              <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </div>
          </div>

          {/* Card 3: Đơn chờ xử lý */}
          <div className="kpi-card">
            <div className="kpi-info">
              <h4>Đơn chờ xử lý</h4>
              <p className="kpi-number">{pendingOrders || 4}</p>
              <p className="kpi-subtext">Cần xác nhận &amp; đóng gói</p>
            </div>
            <div className="kpi-icon-box icon-amber">
              <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
          </div>

          {/* Card 4: Sản phẩm & Kho */}
          <div className={`kpi-card ${lowStockProducts.length > 0 ? 'alert-card' : ''}`}>
            <div className="kpi-info">
              <h4>Sản phẩm &amp; Tồn kho</h4>
              <p className="kpi-number">{totalProducts} <span style={{ fontSize: '15px', fontWeight: 500, color: '#64748B' }}>({totalStock} cái)</span></p>
              <p className="kpi-subtext">
                {lowStockProducts.length > 0 ? (
                  <span className="trend-down">&bull; {lowStockProducts.length} mặt hàng sắp hết</span>
                ) : (
                  <span className="trend-up">&bull; Tồn kho dồi dào</span>
                )}
              </p>
            </div>
            <div className="kpi-icon-box icon-rose">
              <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
          </div>
        </div>

        {/* REVENUE CHART & LOW STOCK ROW */}
        <div className="dashboard-main-row">
          {/* Biểu đồ Doanh thu SVG */}
          <div className="admin-card">
            <div className="card-header">
              <h3>Biểu đồ Doanh thu</h3>
              <div className="chart-filter-toggle">
                <button
                  type="button"
                  className={`toggle-btn ${chartTimeframe === 'daily' ? 'active' : ''}`}
                  onClick={() => this.setState({ chartTimeframe: 'daily' })}
                >
                  7 ngày qua
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${chartTimeframe === 'monthly' ? 'active' : ''}`}
                  onClick={() => this.setState({ chartTimeframe: 'monthly' })}
                >
                  Theo tháng
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="chart-container">
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="chart-svg">
                  {/* Gridlines */}
                  {[0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                    const y = svgHeight - paddingBottom - ratio * chartAreaHeight;
                    return (
                      <g key={idx}>
                        <line
                          x1={paddingLeft}
                          y1={y}
                          x2={svgWidth - 10}
                          y2={y}
                          stroke="#F1F5F9"
                          strokeWidth="1"
                          strokeDasharray="4 4"
                        />
                      </g>
                    );
                  })}

                  {/* Bars */}
                  {chartData.map((d, i) => {
                    const barHeight = (d.revenue / maxRevenue) * chartAreaHeight;
                    const x = paddingLeft + i * barSpacing + (barSpacing - barWidth) / 2;
                    const y = svgHeight - paddingBottom - barHeight;
                    const isHovered = this.state.hoveredBarIndex === i;

                    return (
                      <g key={i}>
                        {/* Bar */}
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={barHeight}
                          rx="4"
                          fill={isHovered ? '#001F5C' : '#002B7F'}
                          className="chart-bar"
                          onMouseEnter={(e) => this.handleBarMouseEnter(d, i, e)}
                          onMouseLeave={this.handleBarMouseLeave}
                        />
                        {/* X-axis Label */}
                        <text
                          x={x + barWidth / 2}
                          y={svgHeight - 10}
                          textAnchor="middle"
                          fontSize="11"
                          fill="#64748B"
                          fontWeight="500"
                        >
                          {d.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Tooltip khi hover cột */}
                {this.state.hoveredBarIndex !== null && (
                  <div
                    className="chart-tooltip"
                    style={{
                      left: `${((this.state.hoveredBarIndex + 0.5) / chartData.length) * 100}%`,
                      top: '25%'
                    }}
                  >
                    <strong>{this.state.tooltipPos.label}</strong>
                    <div>{this.formatCurrency(this.state.tooltipPos.val)}</div>
                    <small style={{ color: '#94A3B8' }}>{this.state.tooltipPos.orders} đơn hàng</small>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cảnh báo tồn kho */}
          <div className="admin-card">
            <div className="card-header">
              <h3>Cảnh báo Tồn kho</h3>
              <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: 600 }}>
                {lowStockProducts.length} sản phẩm sắp hết
              </span>
            </div>
            <div className="card-body">
              {lowStockProducts.length === 0 ? (
                <p style={{ color: '#64748B', fontSize: '13.5px', textAlign: 'center', margin: '40px 0' }}>
                  Không có sản phẩm nào sắp hết hàng.
                </p>
              ) : (
                <div className="alert-list">
                  {lowStockProducts.slice(0, 4).map((item) => (
                    <div key={item.id} className="alert-item">
                      <div className="alert-item-info">
                        <img src={item.img} alt={item.name} className="alert-thumb" />
                        <div>
                          <p className="alert-name">{item.name}</p>
                          <p className="alert-meta">
                            {item.variants && item.variants.length > 0
                              ? `Biến thể: ${item.variants.map(v => `${v.size}/${v.color}`).slice(0, 2).join(', ')}...`
                              : `Danh mục: ${item.category || 'Thời trang'}`}
                          </p>
                        </div>
                      </div>
                      <span className="alert-badge">Còn {item.stock} cái</span>
                    </div>
                  ))}
                  {onNavigateToProducts && (
                    <button
                      type="button"
                      className="view-store-btn"
                      style={{ color: '#0aa5e3', backgroundColor: '#EFF6FF', marginTop: '10px' }}
                      onClick={onNavigateToProducts}
                    >
                      Quản lý kho hàng &rarr;
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RECENT ORDERS TABLE */}
        <div className="admin-card">
          <div className="card-header">
            <h3>Đơn hàng mới nhất</h3>
            <span style={{ fontSize: '13px', color: '#64748B' }}>Cập nhật theo thời gian thực</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="data-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Thời gian</th>
                    <th>Sản phẩm</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {(orders || []).slice(0, 5).map((order) => {
                    let statusClass = 'pending';
                    let statusLabel = 'Chờ xử lý';
                    if (order.status === 'shipping') {
                      statusClass = 'shipping';
                      statusLabel = 'Đang giao';
                    } else if (order.status === 'completed') {
                      statusClass = 'completed';
                      statusLabel = 'Hoàn thành';
                    } else if (order.status === 'cancelled') {
                      statusClass = 'cancelled';
                      statusLabel = 'Đã hủy';
                    }

                    return (
                      <tr key={order.id}>
                        <td><strong>#{order.code}</strong></td>
                        <td>
                          <div>{order.customerName}</div>
                          <small style={{ color: '#64748B' }}>{order.customerPhone}</small>
                        </td>
                        <td>{order.createdAt}</td>
                        <td>{order.itemsSummary}</td>
                        <td><strong>{this.formatCurrency(order.total)}</strong></td>
                        <td>
                          <span className={`status-badge ${statusClass}`}>
                            {statusLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;
