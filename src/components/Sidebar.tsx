import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  Warehouse,
  Package,
  Radio,
  CreditCard,
  BookOpen,
  Settings,
  LogOut,
  Bell,
  Lightbulb,
  Bird,
  Activity,
  Crown,
  Boxes,
  ChevronRight,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: t('sidebar.dashboard') },
    { to: '/admin/farmers', icon: UserCheck, label: t('sidebar.farmers') },
    { to: '/admin/subscriptions', icon: CreditCard, label: t('sidebar.subscriptions') },
    { to: '/admin/recommendations', icon: Lightbulb, label: t('sidebar.recommendations') },
    { to: '/admin/alerts', icon: Bell, label: t('sidebar.alerts') },
    { to: '/admin/devices', icon: Radio, label: t('sidebar.devices') },
    { to: '/admin/farms', icon: Warehouse, label: t('sidebar.allFarms') },
    { to: '/admin/batches', icon: Package, label: t('sidebar.allBatches') },
    { to: '/admin/breeds', icon: Bird, label: t('sidebar.breedConfigs') },
    { to: '/admin/settings', icon: Settings, label: t('common.settings') },
  ];

  const farmerLinks = [
    { to: '/farmer', icon: LayoutDashboard, label: t('common.dashboard') },
    { to: '/farmer/farms', icon: Warehouse, label: t('sidebar.myFarms') },
    { to: '/farmer/batches', icon: Package, label: t('sidebar.batches') },
    { to: '/farmer/activities', icon: BookOpen, label: t('sidebar.activities') },
    { to: '/farmer/inventory', icon: Boxes, label: t('sidebar.inventory') },
    { to: '/disease-prediction', icon: Activity, label: t('sidebar.diseasePrediction') },
    { to: '/farmer/knowledge', icon: Lightbulb, label: t('sidebar.knowledgeBase') },
    { to: '/farmer/alerts', icon: Bell, label: t('sidebar.alerts') },
    { to: '/farmer/subscription', icon: Crown, label: t('sidebar.subscription') },
    { to: '/farmer/currency', icon: DollarSign, label: 'Currency' },
    { to: '/farmer/profile', icon: Settings, label: t('common.profile') },
  ];

  const links = user?.role === 'ADMIN' ? adminLinks : farmerLinks;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[50] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-[60] h-full bg-white border-r border-gray-100 transition-all duration-500 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } w-72 shadow-2xl shadow-gray-200/50`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Bird className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none uppercase">FugajiSmart</h1>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">{t('sidebar.poultry_hub')}</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 mb-4">{t('sidebar.core_analytics')}</p>
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                const isDashboard = link.label.toLowerCase().includes('dashboard');

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={onClose}
                    className={`group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 relative
                      ${isActive ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-[1.02]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                      ${isActive && isDashboard ? 'border-l-8 border-amber-400 pl-2' : ''}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl transition-colors flex items-center justify-center
                        ${isActive ? 'bg-white/20' : 'bg-gray-50 text-gray-400 group-hover:bg-white group-hover:text-blue-600'}
                        ${isActive && isDashboard ? 'animate-bounce-slow' : ''}
                      `}>
                        <Icon className={`w-6 h-6 ${isActive && isDashboard ? 'text-amber-300 drop-shadow-lg' : ''}`} />
                      </div>
                      <span className={`tracking-widest font-black uppercase ${isDashboard && isActive ? 'text-base' : 'text-xs'}`}>{link.label}
                        {isDashboard && isActive && <span className="ml-2 px-2 py-0.5 bg-amber-400 text-blue-900 rounded-full text-[10px] font-bold animate-pulse">Home</span>}
                      </span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
                  </Link>
                );
              })}

            </div>

            {/* Pro Tip Card */}
            <div className="mt-8 px-2">
              <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl text-white relative overflow-hidden group shadow-xl shadow-blue-200">
                <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">{t('sidebar.upgrade_pulse')}</p>
                <p className="text-sm font-bold leading-snug mb-4">{t('sidebar.upgrade_desc')}</p>
                <Link to="/farmer/subscription" className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-colors">
                  {t('sidebar.view_plans')}
                  <TrendingUp className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </nav>

          {/* User Section / Sign Out */}
          <div className="p-4 bg-gray-50/50 border-t border-gray-100">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-4 w-full px-5 py-4 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all group font-black uppercase text-[10px] tracking-widest"
            >
              <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-rose-100 group-hover:text-rose-600 transition-colors">
                <LogOut className="w-5 h-5" />
              </div>
              {t('common.logout')}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
