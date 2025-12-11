import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import "./Layout.css";

/**
 * Layout Component - Wrapper component that includes Sidebar and main content area
 *
 * @param {ReactNode} children - Page content to display
 */
const Layout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`layout-container ${isCollapsed ? "collapsed" : ""}`}>
      <aside className="layout-sidebar">
        <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
      </aside>
      <main className="layout-main">{children}</main>
    </div>
  );
};

export default Layout;
