/**
 * User Menu Component
 * 显示用户信息和退出登录菜单
 */

import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export const UserMenu: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  if (!user) return null;

  const handleLogout = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      setIsLoggingOut(true);
      try {
        await logout();
      } catch (error) {
        console.error('[UserMenu] Logout error:', error);
      } finally {
        setIsLoggingOut(false);
        setShowMenu(false);
      }
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User Info Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-gray-50 transition-colors rounded-lg group"
        disabled={isLoggingOut}
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {/* User Avatar */}
          <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-medium text-gray-900 truncate">
              {user.email}
            </p>
            <p className="text-[10px] text-gray-500">
              Credits: {user.credits.total.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Chevron Icon */}
        <ChevronDown
          className={`w-3 h-3 text-gray-400 flex-shrink-0 transition-transform ${
            showMenu ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="w-4 h-4" />
            <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
