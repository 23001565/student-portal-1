import React from "react";
import "./Button.css";

/**
 * Button Component - Tái sử dụng cho các nút trong ứng dụng
 *
 * @param {string} variant - Loại button: 'primary', 'secondary', 'danger', 'success', 'outline'
 * @param {string} size - Kích thước: 'sm', 'md', 'lg'
 * @param {boolean} disabled - Trạng thái disabled
 * @param {boolean} loading - Hiển thị loading spinner
 * @param {string} className - Class CSS bổ sung
 * @param {ReactNode} children - Nội dung button
 * @param {function} onClick - Hàm xử lý click
 * @param {string} type - Type của button: 'button', 'submit', 'reset'
 */
const Button = ({
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className = "",
  children,
  onClick,
  type = "button",
  ...props
}) => {
  const baseClass = "btn";
  const variantClass = `btn-${variant}`;
  const sizeClass = size !== "md" ? `btn-${size}` : "";
  const disabledClass = disabled || loading ? "btn-disabled" : "";
  const loadingClass = loading ? "btn-loading" : "";

  const classes = [
    baseClass,
    variantClass,
    sizeClass,
    disabledClass,
    loadingClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="btn-spinner">
          <span className="spinner"></span>
        </span>
      )}
      <span className={loading ? "btn-content-loading" : ""}>{children}</span>
    </button>
  );
};

export default Button;
