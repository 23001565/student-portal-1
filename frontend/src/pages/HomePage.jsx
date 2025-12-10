import React from "react";
import { Link } from "react-router-dom";
import "../styles/homepage.css";

const navItems = [
  { label: "Danh sách kỹ năng", anchor: "#skills" },
  { label: "Quản lý môn", anchor: "#subjects" },
  { label: "Quản lý chung", anchor: "#general" },
  { label: "Luyện thi violympic", anchor: "#violympic", badge: "FREE" },
  { label: "Thi AIMO", anchor: "#aimo", badge: "NEW" },
  { label: "Ngân hàng câu hỏi", anchor: "#bank" },
  { label: "Giao bài tập", anchor: "#assignments" },
  { label: "Bài kiểm tra", anchor: "#tests" },
  { label: "Thống kê", anchor: "#stats" },
];

const HomePage = () => {
  return (
    <div className="landing-page">
      <header className="landing-topbar">
        <div className="topbar-left">
          <span className="brand-mark">VioEdu</span>
          <span className="divider">•</span>
          <span>1900 636 111</span>
          <span className="divider">•</span>
          <span>0353055060</span>
        </div>
        <div className="topbar-right">
          <a className="topbar-link" href="mailto:support@vio.edu.vn">
            support@vio.edu.vn
          </a>
          <Link className="topbar-btn" to="/login">
            Đăng nhập
          </Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="hero-copy">
          <div className="hero-pill">Hỗ trợ toàn quốc</div>
          <h1>
            Dạy & học trên <span>VioEdu</span> miễn phí
          </h1>
          <p>Cho đến khi kết thúc dịch corona</p>
          <div className="hero-actions">
            <Link className="hero-primary" to="/login">
              Bắt đầu ngay
            </Link>
            <Link className="hero-secondary" to="/registration">
              Xem đăng ký học phần
            </Link>
          </div>
        </div>
        <div className="hero-figure">
          <div className="figure-card">
            <div className="figure-avatar bot">🤖</div>
            <div>
              <p className="figure-title">Trợ lý học tập</p>
              <p className="figure-sub">Giải đáp nhanh & gợi ý bài tập</p>
            </div>
          </div>
          <div className="figure-card">
            <div className="figure-avatar student">🎒</div>
            <div>
              <p className="figure-title">Học sinh & Giáo viên</p>
              <p className="figure-sub">Cùng học và giao bài tập trực tuyến</p>
            </div>
          </div>
        </div>
        <div className="grid-overlay" aria-hidden="true"></div>
      </section>

      <nav className="landing-menu">
        {navItems.map((item) => (
          <a key={item.label} href={item.anchor} className="menu-item">
            {item.label}
            {item.badge && (
              <span
                className={`menu-badge ${item.badge === "NEW" ? "is-new" : ""}`}
              >
                {item.badge}
              </span>
            )}
          </a>
        ))}
      </nav>

      <section className="landing-content" id="skills">
        <div className="content-card">
          <h2>Điều hướng nhanh</h2>
          <p>
            Chọn các mục trên thanh màu xanh để đi tới chức năng mong muốn. Bạn
            có thể quản lý môn, giao bài, xem ngân hàng câu hỏi và thống kê chỉ
            với một cú nhấp.
          </p>
        </div>
        <div className="content-grid">
          <div className="content-card" id="bank">
            <h3>Ngân hàng câu hỏi</h3>
            <p>
              Tập trung toàn bộ câu hỏi của bạn trong một nơi, dễ tìm kiếm và
              tái sử dụng cho bài kiểm tra hoặc bài tập.
            </p>
          </div>
          <div className="content-card" id="assignments">
            <h3>Giao bài tập</h3>
            <p>
              Giao bài tập trực tuyến, đặt hạn nộp và theo dõi tiến độ của học
              viên trong thời gian thực.
            </p>
          </div>
          <div className="content-card" id="stats">
            <h3>Thống kê</h3>
            <p>
              Xem báo cáo kết quả học tập, tiến độ hoàn thành kỹ năng và các chỉ
              số quan trọng khác.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
