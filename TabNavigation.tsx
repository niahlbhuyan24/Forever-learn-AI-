
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const TabNavigation: React.FC = () => {
  const location = useLocation();
  
  const tabs = [
    { 
      to: '/dashboard', 
      label: 'Home', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> 
    },
    { 
      to: '/notes', 
      label: 'Notes', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> 
    },
    { 
      to: '/doubt-solver', 
      label: 'Doubts', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> 
    }
  ];

  // Don't show on specific screens
  const hiddenRoutes = ['/', '/auth', '/onboarding'];
  if (hiddenRoutes.includes(location.pathname)) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-md">
      <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl shadow-blue-900/10 rounded-full p-1.5 flex items-center justify-between">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.to;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-full transition-all duration-300 relative group ${
                isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-blue-50 rounded-full animate-in fade-in zoom-in-95 duration-200"></div>
              )}
              <div className="relative z-10 flex flex-col items-center">
                <div className={`mb-0.5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {tab.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-tighter">
                  {tab.label}
                </span>
              </div>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default TabNavigation;
