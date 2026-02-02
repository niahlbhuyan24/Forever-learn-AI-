
import React from 'react';
import { UserProfile } from '../types.ts';

interface NavbarProps {
  user: UserProfile | null;
  onLogout: () => void;
  isSyncing?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, isSyncing }) => {
  return (
    <nav className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 p-2 rounded-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-800">ForeverLearn<span className="text-blue-600">AI</span></span>
        
        {isSyncing && (
          <div className="ml-4 flex items-center gap-2 text-[10px] font-black uppercase text-blue-500 bg-blue-50 px-3 py-1 rounded-full animate-pulse">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></span>
            Syncing...
          </div>
        )}
      </div>
      
      {user && (
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-sm font-semibold text-slate-800">{user.name}</span>
            <span className="text-xs text-slate-500">Class {user.classLevel} (CBSE)</span>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 text-slate-600 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-slate-100"
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
