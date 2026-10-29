import React, { useState } from 'react';
import { User, AppNotification } from '../types';
import { 
  Sun, 
  Moon, 
  Lock, 
  LayoutDashboard, 
  LogOut, 
  ChevronDown, 
  User as UserIcon, 
  Settings,
  Bell,
  ShoppingBag,
  Package,
  Building2,
  Sparkles,
  CheckCheck,
  Check,
  Trash2,
  Radio
} from 'lucide-react';
import nexusLogo from '../assets/images/nexus_prime_logo_1793077972565.jpg';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Switch } from './ui/switch';

export type MainNavPage = 'home' | 'businesses' | 'about' | 'contact' | 'storefront' | 'dashboard' | 'profile';

interface NavbarProps {
  currentUser: User;
  allUsers: User[];
  onSelectRoleUser?: (user: User) => void;
  activeNavPage: MainNavPage;
  onNavigate: (page: MainNavPage) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenLoginModal: () => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  notifications?: AppNotification[];
  onMarkNotificationAsRead?: (id: string) => void;
  onMarkAllNotificationsAsRead?: () => void;
  onClearNotifications?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeNavPage,
  onNavigate,
  isDarkMode,
  onToggleDarkMode,
  onOpenLoginModal,
  isLoggedIn,
  onLogout,
  notifications = [],
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onClearNotifications,
}) => {
  const [notifFilter, setNotifFilter] = useState<'all' | 'order' | 'inventory' | 'tenant'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (notifFilter === 'all') return true;
    return n.type === notifFilter;
  });

  const getNotifIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'inventory':
        return <Package className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'tenant':
        return <Building2 className="w-4 h-4 text-blue-500 shrink-0" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />;
    }
  };

  const getNotifBadgeBg = (type: AppNotification['type']) => {
    switch (type) {
      case 'order':
        return 'bg-emerald-500/10 border-emerald-500/30';
      case 'inventory':
        return 'bg-amber-500/10 border-amber-500/30';
      case 'tenant':
        return 'bg-blue-500/10 border-blue-500/30';
      default:
        return 'bg-purple-500/10 border-purple-500/30';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      
      {/* Top Bar Navigation Container - Strictly aligned max-w-7xl px-6 sm:px-8 lg:px-8 */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4 sm:gap-6">
        
        {/* Zone 1: Brand Wordmark with Logo */}
        <button 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 hover:opacity-90 transition-opacity shrink-0 text-left cursor-pointer focus:outline-none"
        >
          <img 
            src={nexusLogo} 
            alt="Nexus Web Studio Logo" 
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl object-cover shadow-md border border-amber-500/30 shrink-0" 
          />
          <div className="flex flex-col">
            <span className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white font-sans leading-none">
              Nexus Commerce
            </span>
            <span className="text-[9px] sm:text-[10px] font-semibold text-amber-600 dark:text-amber-400 tracking-wider uppercase mt-1">
              By Nexus Web Studio
            </span>
          </div>
        </button>

        {/* Zone 2: Main Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onNavigate('home')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
              activeNavPage === 'home' ? 'text-amber-600 dark:text-amber-400 font-bold border-b-2 border-amber-500' : ''
            }`}
          >
            Inicio
          </button>

          <button
            onClick={() => onNavigate('businesses')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
              activeNavPage === 'businesses' ? 'text-amber-600 dark:text-amber-400 font-bold border-b-2 border-amber-500' : ''
            }`}
          >
            Negocios Registrados
          </button>

          <button
            onClick={() => onNavigate('about')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
              activeNavPage === 'about' ? 'text-amber-600 dark:text-amber-400 font-bold border-b-2 border-amber-500' : ''
            }`}
          >
            Sobre Nosotros
          </button>

          <button
            onClick={() => onNavigate('contact')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
              activeNavPage === 'contact' ? 'text-amber-600 dark:text-amber-400 font-bold border-b-2 border-amber-500' : ''
            }`}
          >
            Contáctenos
          </button>

          {/* Show Shadcn DropdownMenu for "Mi Panel" ONLY when logged in */}
          {isLoggedIn && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 px-3 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/30 font-bold text-amber-700 dark:text-amber-300 cursor-pointer outline-none ${
                    activeNavPage === 'dashboard' ? 'ring-2 ring-amber-500' : ''
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-amber-500" />
                  <span>Mi Panel</span>
                  <ChevronDown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64 p-2">
                {currentUser && (
                  <>
                    <DropdownMenuLabel className="p-0">
                      <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center gap-3">
                        <img 
                          src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                          alt={currentUser.name} 
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-500/30 shrink-0" 
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {currentUser.name}
                          </span>
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider truncate">
                            {currentUser.role === 'superadmin' ? 'Superadmin Core' : currentUser.role}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-1" />
                  </>
                )}

                {/* Option 1: Mi perfil */}
                <DropdownMenuItem 
                  onClick={() => onNavigate('profile')}
                  className="cursor-pointer font-medium"
                >
                  <UserIcon className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Mi perfil</span>
                </DropdownMenuItem>

                {/* Option 2: Mi panel (Panel Superadmin) */}
                <DropdownMenuItem 
                  onClick={() => onNavigate('dashboard')}
                  className="cursor-pointer font-bold text-amber-600 dark:text-amber-400"
                >
                  <LayoutDashboard className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Mi panel (Panel Superadmin)</span>
                </DropdownMenuItem>

                {/* Option 3: Configuración */}
                <DropdownMenuItem 
                  onClick={() => onNavigate('dashboard')}
                  className="cursor-pointer font-medium"
                >
                  <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                  <span>Configuración</span>
                </DropdownMenuItem>

                {/* Option 3: Activar modo día/noche con Switch interno de Shadcn UI */}
                <DropdownMenuItem 
                  onSelect={(e) => {
                    e.preventDefault();
                    onToggleDarkMode();
                  }}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    {isDarkMode ? (
                      <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <Moon className="w-4 h-4 text-indigo-500 shrink-0" />
                    )}
                    <span>Activar modo día/noche</span>
                  </div>
                  <Switch 
                    checked={isDarkMode} 
                    onCheckedChange={onToggleDarkMode} 
                    onClick={(e) => e.stopPropagation()}
                  />
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1" />

                {/* Option 4: Cerrar sesión */}
                <DropdownMenuItem 
                  onClick={onLogout}
                  className="text-rose-600 dark:text-rose-400 focus:text-rose-600 dark:focus:text-rose-400 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        {/* Zone 3: Actions (Notifications Bell, Theme Toggle, Login/Logout) */}
        <div className="flex items-center gap-2.5 shrink-0">

          {/* REAL-TIME NOTIFICATIONS BELL SYSTEM */}
          {isLoggedIn && (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  title="Notificaciones en Tiempo Real"
                  className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors shrink-0 cursor-pointer outline-none"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white shadow-xs">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative z-10">{unreadCount > 9 ? '9+' : unreadCount}</span>
                    </span>
                  )}
                </button>
              </PopoverTrigger>

              <PopoverContent align="end" className="p-0 w-80 sm:w-96 overflow-hidden">
                
                {/* Popover Header */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Bell className="w-4 h-4 text-amber-500" />
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        Notificaciones en Tiempo Real
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Radio className="w-2.5 h-2.5 text-emerald-500 animate-pulse" />
                        <span>Google Sheets & DB Sync</span>
                      </p>
                    </div>
                  </div>

                  {unreadCount > 0 && onMarkAllNotificationsAsRead && (
                    <button
                      onClick={onMarkAllNotificationsAsRead}
                      className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Leídas</span>
                    </button>
                  )}
                </div>

                {/* Filter Category Tabs */}
                <div className="flex items-center gap-1 p-2 bg-slate-100/60 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold">
                  <button
                    onClick={() => setNotifFilter('all')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      notifFilter === 'all'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Todas ({notifications.length})
                  </button>
                  <button
                    onClick={() => setNotifFilter('order')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                      notifFilter === 'order'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <ShoppingBag className="w-3 h-3" />
                    <span>Órdenes</span>
                  </button>
                  <button
                    onClick={() => setNotifFilter('inventory')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                      notifFilter === 'inventory'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Package className="w-3 h-3" />
                    <span>Stock</span>
                  </button>
                  <button
                    onClick={() => setNotifFilter('tenant')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                      notifFilter === 'tenant'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Building2 className="w-3 h-3" />
                    <span>Inquilinos</span>
                  </button>
                </div>

                {/* Notifications Scrollable List */}
                <div className="max-h-72 overflow-y-auto p-2 space-y-1.5">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                      No hay notificaciones en esta categoría.
                    </div>
                  ) : (
                    filteredNotifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          if (onMarkNotificationAsRead && !n.read) {
                            onMarkNotificationAsRead(n.id);
                          }
                          if (n.linkTo) {
                            onNavigate(n.linkTo as MainNavPage);
                          }
                        }}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer relative group ${
                          !n.read
                            ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`p-1.5 rounded-lg border shrink-0 ${getNotifBadgeBg(n.type)}`}>
                            {getNotifIcon(n.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {n.title}
                              </span>
                              <span className="text-[10px] text-slate-400 shrink-0 whitespace-nowrap">
                                {n.timestamp}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">
                              {n.message}
                            </p>
                          </div>
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 self-center"></span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Popover Footer */}
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    {notifications.length} eventos registrados
                  </span>
                  {notifications.length > 0 && onClearNotifications && (
                    <button
                      onClick={onClearNotifications}
                      className="text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Limpiar</span>
                    </button>
                  )}
                </div>

              </PopoverContent>
            </Popover>
          )}

          {/* Theme toggle icon button when logged in */}
          {isLoggedIn && (
            <button
              onClick={onToggleDarkMode}
              title={isDarkMode ? 'Cambiar a Modo Día (Light)' : 'Cambiar a Modo Noche (Dark)'}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          )}

          {!isLoggedIn ? (
            <button
              onClick={onOpenLoginModal}
              className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 rounded-xl sm:rounded-2xl transition-all duration-150 whitespace-nowrap shrink-0 shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5"
            >
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 stroke-[2.5]" />
              <span>Ingresar</span>
            </button>
          ) : (
            <button
              onClick={onLogout}
              title="Cerrar Sesión"
              className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl transition-all duration-150 whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
