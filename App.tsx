
import React, { useState, useEffect } from 'react';
import { AppView, User, Language } from './types';
import MainDashboard from './components/MainDashboard';
import AssetManager from './components/AssetManager';
import WorkOrderManager from './components/WorkOrderManager';
import PPMManager from './components/PPMManager';
import AdminManager from './components/AdminManager';
import InventoryManager from './components/InventoryManager';
import AIAnalytics from './components/AIAnalytics';
import MobileAppHub from './components/MobileAppHub';
import DashboardMonitor from './components/DashboardMonitor';
import Login from './components/Login';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>(AppView.MAIN);
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLang] = useState<Language>((localStorage.getItem('imatoms_lang') as Language) || 'TH');

  const handleLanguageToggle = (l: Language) => {
    setLang(l);
    localStorage.setItem('imatoms_lang', l);
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setCurrentView(AppView.MAIN);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} lang={lang} setLang={handleLanguageToggle} />;
  }

  const renderView = () => {
    const props = { lang, setLang: handleLanguageToggle };
    switch (currentView) {
      case AppView.ASSET:
        return <AssetManager onBack={() => setCurrentView(AppView.MAIN)} {...props} />;
      case AppView.WORK_ORDER:
        return <WorkOrderManager onBack={() => setCurrentView(AppView.MAIN)} {...props} />;
      case AppView.PPM:
        return <PPMManager onBack={() => setCurrentView(AppView.MAIN)} user={user!} {...props} />;
      case AppView.ADMIN:
        return <AdminManager onBack={() => setCurrentView(AppView.MAIN)} {...props} />;
      case AppView.INVENTORY:
        return <InventoryManager onBack={() => setCurrentView(AppView.MAIN)} user={user!} {...props} />;
      case AppView.AI_ANALYTICS:
        return <AIAnalytics onBack={() => setCurrentView(AppView.MAIN)} user={user!} {...props} />;
      case AppView.MOBILE_APPS:
        return <MobileAppHub onBack={() => setCurrentView(AppView.MAIN)} user={user!} {...props} />;
      case AppView.DASHBOARD_MONITOR:
        return <DashboardMonitor onBack={() => setCurrentView(AppView.MAIN)} {...props} />;
      case AppView.MAIN:
      default:
        return (
          <MainDashboard 
            user={user!} 
            onNavigate={(view) => setCurrentView(view)} 
            onLogout={handleLogout}
            {...props}
          />
        );
    }
  };

  return (
    <div className="h-full bg-[#0a0e17] text-white">
      {renderView()}
    </div>
  );
};

export default App;
