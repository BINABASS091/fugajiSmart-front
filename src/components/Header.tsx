import { Menu, Bell, Globe, Search, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { dataService } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { API_BASE_URL } from '../lib/api';
import CurrencySelector from './CurrencySelector';

interface HeaderProps {
  onMenuClick: () => void;
}

// Helper function to get full avatar URL
const getAvatarUrl = (avatarUrl: string | null | undefined): string | null => {
  if (!avatarUrl) return null;
  // If it's already a full URL, return it
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://') || avatarUrl.startsWith('data:')) {
    return avatarUrl;
  }
  // If it's a relative URL, prepend the API base URL
  const baseUrl = API_BASE_URL.replace('/api/v1', '');
  return `${baseUrl}${avatarUrl.startsWith('/') ? avatarUrl : '/' + avatarUrl}`;
};

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnreadAlerts = async () => {
      if (!user) return;

      if (user.role === 'FARMER') {
        try {
          const alerts = await dataService.getAlerts(user.id);
          const unread = alerts.filter(a => !a.is_read);
          setUnreadCount(unread.length);
        } catch (err) {
          console.error('Failed to fetch unread alerts:', err);
        }
      }
    };

    fetchUnreadAlerts();
    const interval = setInterval(fetchUnreadAlerts, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (user) {
      // Try to get avatar from farmer_profile first, then from user, then localStorage
      const profileAvatar = (user as any).farmer_profile?.avatar_url;
      const userAvatar = (user as any).avatar_url;
      const avatarUrl = getAvatarUrl(profileAvatar || userAvatar);
      
      if (avatarUrl) {
        setAvatarUrl(avatarUrl);
      } else {
        // Fallback to localStorage
        try {
          const stored = localStorage.getItem('profile_avatar');
          setAvatarUrl(stored || null);
        } catch {
          setAvatarUrl(null);
        }
      }
    } else {
      setAvatarUrl(null);
    }
  }, [user]);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'sw' : 'en';
    setLanguage(newLang);
    setShowLangMenu(false);
  };

  return (
    <header className="sticky top-0 z-[40] w-full bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="p-2.5 rounded-2xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all lg:hidden"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden lg:flex items-center gap-2 group cursor-pointer px-4 py-2 rounded-2xl hover:bg-gray-50 transition-all">
              <Search className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
              <span className="text-sm font-bold text-gray-400 group-hover:text-gray-600">Quick search...</span>
              <span className="hidden xl:block ml-4 text-[10px] font-black text-gray-300 border border-gray-200 px-1.5 py-0.5 rounded-md uppercase tracking-widest">⌘K</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            {/* Language Selection */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
              >
                <Globe className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-black uppercase tracking-widest text-gray-600">{language}</span>
                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-300 ${showLangMenu ? 'rotate-180' : ''}`} />
              </button>

              {showLangMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowLangMenu(false)} />
                  <div className="absolute right-0 mt-3 w-48 bg-white rounded-3xl shadow-2xl shadow-gray-200 border border-gray-100 z-20 overflow-hidden animate-[scaleIn_0.2s_ease-out]">
                    <div className="p-2">
                      <button
                        onClick={toggleLanguage}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-all"
                      >
                        <span>{language === 'en' ? 'Swahili (SW)' : 'English (EN)'}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Currency Selector */}
            <CurrencySelector variant="toggle" className="hidden sm:flex" />

            {/* Notifications */}
            {user?.role === 'FARMER' && (
              <button
                className="relative p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all group"
                aria-label="View alerts"
              >
                <Bell className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-5 h-5 bg-rose-500 ring-4 ring-white text-[10px] font-black text-white rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Profile Section */}
            <div className="flex items-center gap-4 pl-4 border-l border-gray-100">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-black text-gray-900 leading-none">
                  {user?.first_name || user?.email?.split('@')[0] || 'Member'}
                </span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                  {user?.role?.toLowerCase() || 'Verified Account'}
                </span>
              </div>
              <div className="relative group cursor-pointer">
                <div className="w-11 h-11 rounded-[1.25rem] bg-gradient-to-tr from-blue-600 to-indigo-700 p-0.5 shadow-lg shadow-blue-200 group-hover:scale-105 transition-all">
                  <div className="w-full h-full rounded-[1.125rem] bg-white p-0.5 overflow-hidden">
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="User Avatar" 
                        className="w-full h-full object-cover rounded-[1rem]"
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const fallback = document.createElement('div');
                            fallback.className = 'w-full h-full bg-blue-50 text-blue-600 rounded-[1rem] flex items-center justify-center text-sm font-black';
                            fallback.textContent = (user?.first_name || user?.email || 'U')[0].toUpperCase();
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-50 text-blue-600 rounded-[1rem] flex items-center justify-center text-sm font-black">
                        {(user?.first_name || user?.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
