import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  Sun,
  Moon,
  Globe,
  User,
  LayoutDashboard,
  Database,
  Upload,
  Download,
  ShieldCheck,
  Settings,
  LogIn,
  LogOut,
} from 'lucide-react';
import './Header.css';

export const Header = ({ toggleSidebar, isSidebarCollapsed }) => {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const { isAuthenticated, currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitleKey = (path) => {
    switch (path) {
      case '/dashboard':
        return 'dashboard';
      case '/records':
        return 'records';
      case '/import':
        return 'import';
      case '/export':
        return 'export';
      case '/backup':
        return 'backup';
      case '/settings':
        return 'settings';
      case '/login':
        return 'login';
      default:
        return 'dashboard';
    }
  };

  const currentTitle = t(getPageTitleKey(location.pathname));

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          onClick={toggleSidebar}
          className="header-icon-btn toggle-btn"
          aria-label="Toggle Sidebar"
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <Menu size={20} />
        </button>
        <div className="page-breadcrumb">
          <h1 className="page-title">{currentTitle}</h1>
        </div>
      </div>

      <div className="header-right">
        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="header-icon-btn lang-btn"
          title={t('language')}
          aria-label="Toggle Language"
        >
          <Globe size={18} />
          <span className="btn-label">{language === 'ar' ? 'EN' : 'عربي'}</span>
        </button>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="header-icon-btn theme-btn"
          title={theme === 'light' ? t('darkMode') : t('lightMode')}
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div className="header-divider"></div>

        {/* User Account Area */}
        <div className="user-profile">
          <div className="avatar">
            <User size={18} />
          </div>
          <div className="user-info">
            <span className="user-name">
              {isAuthenticated ? currentUser.username : t('userName')}
            </span>
            <span className="user-role">{t('userRole')}</span>
          </div>
        </div>

        {/* Login / Logout Button */}
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="login-shortcut-btn"
            style={{ color: '#ef4444' }}
            title={t('logout')}
          >
            <LogOut size={18} />
          </button>
        ) : (
          <Link to="/login" className="login-shortcut-btn" title={t('login')}>
            <LogIn size={18} />
          </Link>
        )}
      </div>
    </header>
  );
};
