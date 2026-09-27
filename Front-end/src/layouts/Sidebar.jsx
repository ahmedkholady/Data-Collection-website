import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard,
  Database,
  Upload,
  Download,
  ShieldCheck,
  Settings,
  Layers,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import './Sidebar.css';

export const Sidebar = ({ isCollapsed, isMobileOpen, closeMobileSidebar, toggleSidebar }) => {
  const { t, dir } = useLanguage();

  const navItems = [
    { path: '/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
    { path: '/records', labelKey: 'records', icon: Database },
    { path: '/import', labelKey: 'import', icon: Upload },
    { path: '/export', labelKey: 'export', icon: Download },
    { path: '/backup', labelKey: 'backup', icon: ShieldCheck },
    { path: '/settings', labelKey: 'settings', icon: Settings },
  ];

  const CollapseIcon = dir === 'rtl' 
    ? (isCollapsed ? ChevronLeft : ChevronRight) 
    : (isCollapsed ? ChevronRight : ChevronLeft);

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && <div className="sidebar-backdrop" onClick={closeMobileSidebar} />}

      <aside
        className={`app-sidebar ${isCollapsed ? 'collapsed' : ''} ${
          isMobileOpen ? 'mobile-open' : ''
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-logo">
            <Layers size={22} className="brand-icon" />
          </div>
          {!isCollapsed && (
            <div className="brand-text">
              <span className="brand-name">{t('appName')}</span>
              <span className="brand-sub">{t('appSubtitle')}</span>
            </div>
          )}
          <button
            className="mobile-close-btn"
            onClick={closeMobileSidebar}
            aria-label="Close Sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.path} className="nav-item">
                  <NavLink
                    to={item.path}
                    onClick={closeMobileSidebar}
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'active' : ''}`
                    }
                    title={isCollapsed ? t(item.labelKey) : undefined}
                  >
                    <IconComponent size={20} className="nav-icon" />
                    {!isCollapsed && <span className="nav-label">{t(item.labelKey)}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer Collapse Action */}
        <div className="sidebar-footer">
          <button
            onClick={toggleSidebar}
            className="collapse-toggle-btn"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <CollapseIcon size={18} />
            {!isCollapsed && <span className="collapse-text">{dir === 'rtl' ? 'طَي القائمة' : 'Collapse'}</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
