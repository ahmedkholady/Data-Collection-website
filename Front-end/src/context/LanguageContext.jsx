import React, { createContext, useContext, useEffect, useState } from 'react';

const LanguageContext = createContext();

const translations = {
  ar: {
    appName: 'نظام جمع البيانات',
    appSubtitle: 'منصة البحث والتدقيق',
    dashboard: 'لوحة التحكم',
    records: 'السجلات',
    import: 'استيراد البيانات',
    export: 'تصدير البيانات',
    backup: 'النسخ الاحتياطي والاستعادة',
    settings: 'الإعدادات',
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    userRole: 'مسؤول النظام',
    userName: 'أحمد',
    lightMode: 'الوضع الفاتح',
    darkMode: 'الوضع الداكن',
    language: 'اللغة',
    arabic: 'العربية',
    english: 'English',
    welcomeTitle: 'مرحباً بك في نظام إدارة وجمع البيانات',
    welcomeDesc: 'هذه الواجهة الرئيسية الهيكلية للنظام. يمكنك التنقل بين الأقسام من خلال القائمة الجانبية.',
    recordsPlaceholderTitle: 'قسم إدارة السجلات',
    recordsPlaceholderDesc: 'هذه الصفحة مخصصة لعرض واستعلام وإدارة بيانات أرقام الهواتف والسجلات (صفحة هيكلية).',
    importPlaceholderTitle: 'قسم استيراد البيانات',
    importPlaceholderDesc: 'هذه الصفحة مخصصة لاستيراد ملفات CSV / XLSX / TXT وإضافتها للنظام (صفحة هيكلية).',
    exportPlaceholderTitle: 'قسم تصدير البيانات',
    exportPlaceholderDesc: 'هذه الصفحة مخصصة لتصدير واستخراج البيانات المفلترة إلى صيغ متعددة (صفحة هيكلية).',
    backupPlaceholderTitle: 'قسم النسخ الاحتياطي والاستعادة',
    backupPlaceholderDesc: 'هذه الصفحة مخصصة لإدارة النسخ الاحتياطية واستعادة قاعدة البيانات (صفحة هيكلية).',
    settingsPlaceholderTitle: 'قسم إعدادات النظام',
    settingsPlaceholderDesc: 'هذه الصفحة مخصصة لضبط خيارات وتفضيلات النظام والقواعد العامة (صفحة هيكلية).',
    loginPlaceholderTitle: 'تسجيل الدخول إلى النظام',
    loginPlaceholderDesc: 'صفحة تسجيل الدخول الهيكلية للتطبيقات المستقبلية.',
    systemStatus: 'حالة النظام الهيكلي',
    statusOk: 'جاهز وفعال',
    quickStats: 'نظرة عامة',
    totalRecords: 'إجمالي السجلات',
    systemVersion: 'إصدار النواة',
    demoMode: 'نموذج هيكلي متكامل',
    backToDashboard: 'العودة للوحة التحكم',
  },
  en: {
    appName: 'Data Collection System',
    appSubtitle: 'Search & Verification Platform',
    dashboard: 'Dashboard',
    records: 'Records',
    import: 'Import Data',
    export: 'Export Data',
    backup: 'Backup & Restore',
    settings: 'Settings',
    login: 'Login',
    logout: 'Logout',
    userRole: 'System Administrator',
    userName: 'Ahmed',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    language: 'Language',
    arabic: 'العربية',
    english: 'English',
    welcomeTitle: 'Welcome to Data Management & Collection System',
    welcomeDesc: 'This is the application shell and structural foundation. You can navigate through sections using the sidebar.',
    recordsPlaceholderTitle: 'Records Management Section',
    recordsPlaceholderDesc: 'This page is designated for viewing, querying, and managing phone records (Structural Placeholder).',
    importPlaceholderTitle: 'Data Import Section',
    importPlaceholderDesc: 'This page is designated for importing CSV / XLSX / TXT files into the system (Structural Placeholder).',
    exportPlaceholderTitle: 'Data Export Section',
    exportPlaceholderDesc: 'This page is designated for exporting filtered data to multiple formats (Structural Placeholder).',
    backupPlaceholderTitle: 'Backup & Restore Section',
    backupPlaceholderDesc: 'This page is designated for managing backups and restoring the database (Structural Placeholder).',
    settingsPlaceholderTitle: 'System Settings Section',
    settingsPlaceholderDesc: 'This page is designated for configuring system settings and preferences (Structural Placeholder).',
    loginPlaceholderTitle: 'System Login',
    loginPlaceholderDesc: 'Structural login page for future authentication integration.',
    systemStatus: 'Structural System Status',
    statusOk: 'Ready & Functional',
    quickStats: 'Quick Overview',
    totalRecords: 'Total Records',
    systemVersion: 'Core Version',
    demoMode: 'Structural Shell Active',
    backToDashboard: 'Back to Dashboard',
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const savedLang = localStorage.getItem('app-lang');
    return savedLang === 'en' || savedLang === 'ar' ? savedLang : 'ar';
  });

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', language);
    localStorage.setItem('app-lang', language);
  }, [language, dir]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, dir, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
