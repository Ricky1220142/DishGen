import { useState, useEffect } from 'react';
import { Home, ChefHat, BookmarkIcon, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('/');

  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path === '/home') setActiveTab('/');
    else if (path === '/generate') setActiveTab('/generate');
    else if (path === '/saved') setActiveTab('/saved');
    else if (path === '/profile') setActiveTab('/profile');
  }, [location]);

  const tabs = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/generate', icon: ChefHat, label: 'Genera' },
    { path: '/saved', icon: BookmarkIcon, label: 'Salvate' },
    { path: '/profile', icon: User, label: 'Profilo' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-30 safe-bottom md:hidden">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.path;
          return (
            <button
              key={tab.path}
              data-testid={`nav-${tab.label.toLowerCase()}`}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
              <span className={`text-xs mt-1 font-body ${isActive ? 'font-semibold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
