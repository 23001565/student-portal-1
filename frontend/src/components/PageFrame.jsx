import React from "react";
import "./PageFrame.css";

/**
 * PageFrame Component - Tạo khung cho từng trang
 *
 * @param {string} title - Tiêu đề trang
 * @param {string} subtitle - Phụ đề trang
 * @param {ReactNode} children - Nội dung trang
 * @param {string} className - Class CSS bổ sung
 * @param {boolean} showHeader - Hiển thị header hay không
 * @param {ReactNode} headerActions - Các action buttons trong header
 * @param {ReactNode} footer - Footer của trang
 */
const PageFrame = ({
  title,
  subtitle,
  children,
  className = "",
  showHeader = true,
  headerActions,
  footer,
}) => {
  return (
    <div className={`page-frame ${className}`}>
      {showHeader && (title || subtitle || headerActions) && (
        <div className="page-header">
          <div className="page-header-content">
            <div>
              {title && <h1 className="page-title">{title}</h1>}
              {subtitle && <p className="page-subtitle">{subtitle}</p>}
            </div>
            {headerActions && (
              <div className="page-header-actions">{headerActions}</div>
            )}
          </div>
        </div>
      )}
      <div className="page-body">{children}</div>
      {footer && <div className="page-footer">{footer}</div>}
    </div>
  );
};

export default PageFrame;
