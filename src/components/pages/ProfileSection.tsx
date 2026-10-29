import React, { useState } from 'react';
import { User, Business } from '../../types';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Key, 
  Lock, 
  CheckCircle2, 
  Camera, 
  Sparkles, 
  Save, 
  Bell, 
  Smartphone, 
  Globe, 
  Building2, 
  Shield, 
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Sliders,
  Check
} from 'lucide-react';
import { Switch } from '../ui/switch';

interface ProfileSectionProps {
  currentUser: User;
  businesses: Business[];
  onUpdateProfile: (updatedData: Partial<User>) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const AVATAR_PRESETS = [
  {
    id: 'preset-1',
    label: 'Ejecutivo Premium',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-2',
    label: 'Especialista Studio',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-3',
    label: 'Directora de Marca',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-4',
    label: 'Consultor B2B',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-5',
    label: 'Líder Operativo',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-6',
    label: 'Diseñador Creativo',
    url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80',
  },
];

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  currentUser,
  businesses,
  onUpdateProfile,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'avatar' | 'security' | 'preferences'>('info');

  // Form State: Personal Info
  const [nameInput, setNameInput] = useState(currentUser.name);
  const [emailInput, setEmailInput] = useState(currentUser.email);
  const [phoneInput, setPhoneInput] = useState(currentUser.phone || '304 347 0984');
  const [bioInput, setBioInput] = useState(
    currentUser.bio || 'Especialista en administración de tiendas virtuales y gestión de catálogos multi-tenant en Nexus Commerce Suite.'
  );

  // Form State: Avatar
  const [avatarInput, setAvatarInput] = useState(currentUser.avatar);

  // Form State: Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(currentUser.twoFactorEnabled ?? true);

  // Form State: Preferences
  const [notifOrders, setNotifOrders] = useState(true);
  const [notifInventory, setNotifInventory] = useState(true);
  const [notifSecurity, setNotifSecurity] = useState(true);

  // Feedback Toasts
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);
  const [saveErrorNotice, setSaveErrorNotice] = useState<string | null>(null);

  const activeBusiness = businesses.find(b => b.id === currentUser.activeBusinessId) || businesses[0];

  const handleSavePersonalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveErrorNotice(null);

    if (!nameInput.trim() || !emailInput.trim()) {
      setSaveErrorNotice('Por favor completa los campos obligatorios (Nombre y Correo electrónico).');
      return;
    }

    onUpdateProfile({
      name: nameInput.trim(),
      email: emailInput.trim(),
      phone: phoneInput.trim(),
      bio: bioInput.trim(),
    });

    setSaveSuccessNotice('¡Información personal actualizada correctamente en Nexus Commerce Suite!');
    setTimeout(() => setSaveSuccessNotice(null), 4000);
  };

  const handleSaveAvatar = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveErrorNotice(null);

    if (!avatarInput.trim()) {
      setSaveErrorNotice('Ingresa una URL válida o selecciona un avatar preestablecido.');
      return;
    }

    onUpdateProfile({
      avatar: avatarInput.trim(),
    });

    setSaveSuccessNotice('¡Foto de avatar actualizada con éxito!');
    setTimeout(() => setSaveSuccessNotice(null), 4000);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveErrorNotice(null);

    if (!currentPassword) {
      setSaveErrorNotice('Debes ingresar tu contraseña actual para confirmar el cambio.');
      return;
    }

    if (newPassword.length < 8) {
      setSaveErrorNotice('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSaveErrorNotice('La confirmación de la contraseña no coincide.');
      return;
    }

    onUpdateProfile({
      password: newPassword,
    });

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSaveSuccessNotice('¡Contraseña de seguridad actualizada correctamente!');
    setTimeout(() => setSaveSuccessNotice(null), 4000);
  };

  const handleToggle2FA = (checked: boolean) => {
    setTwoFactorEnabled(checked);
    onUpdateProfile({
      twoFactorEnabled: checked,
    });
    setSaveSuccessNotice(checked ? 'Autenticación de 2 Factores (2FA) activada.' : 'Autenticación de 2 Factores (2FA) desactivada.');
    setTimeout(() => setSaveSuccessNotice(null), 3000);
  };

  const getRoleLabel = (role: User['role']) => {
    switch (role) {
      case 'superadmin':
        return 'Superadmin Core';
      case 'business_owner':
        return 'Propietario de Tienda';
      case 'employee':
        return 'Empleado RBAC';
      case 'supplier':
        return 'Proveedor B2B';
      default:
        return 'Cliente Registrado';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* SUCCESS / ERROR ALERTS */}
      {saveSuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{saveSuccessNotice}</span>
        </div>
      )}

      {saveErrorNotice && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{saveErrorNotice}</span>
        </div>
      )}

      {/* HEADER PROFILE SUMMARY HERO CARD */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 dark:bg-slate-950 text-white border border-slate-800 shadow-2xl p-6 sm:p-8 lg:p-10 space-y-6">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-transparent"></div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <img 
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'} 
                alt={currentUser.name} 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-amber-500/40 shadow-xl" 
              />
              <button
                onClick={() => setActiveTab('avatar')}
                className="absolute inset-0 rounded-2xl bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                title="Cambiar Foto"
              >
                <Camera className="w-6 h-6 text-amber-400" />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {currentUser.name}
                </h1>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                  {getRoleLabel(currentUser.role)}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentUser.email}</span>
              </p>

              <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Conectado a: <strong className="text-slate-200">{activeBusiness ? activeBusiness.name : 'Nexus Web Studio Core'}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Estado RBAC</span>
              <span className="text-xs font-black text-emerald-400 flex items-center gap-1 justify-center mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Protegido</span>
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Seguridad 2FA</span>
              <span className={`text-xs font-black flex items-center gap-1 justify-center mt-0.5 ${twoFactorEnabled ? 'text-emerald-400' : 'text-amber-400'}`}>
                <Key className="w-3.5 h-3.5" />
                <span>{twoFactorEnabled ? 'Activa' : 'Opcional'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'info'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Información Personal</span>
        </button>

        <button
          onClick={() => setActiveTab('avatar')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'avatar'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Foto de Avatar</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'security'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Seguridad &amp; Contraseña</span>
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'preferences'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Preferencias &amp; Notificaciones</span>
        </button>
      </div>

      {/* TAB 1: INFORMACIÓN PERSONAL */}
      {activeTab === 'info' && (
        <form onSubmit={handleSavePersonalInfo} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-amber-500" />
              <span>Editar Información Personal</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Actualiza tus datos de identificación y contacto en Nexus Commerce Suite.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Nombre Completo */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-amber-500" />
                <span>Nombre Completo *</span>
              </label>
              <input 
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            {/* Correo Electrónico */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-500" />
                <span>Correo Electrónico *</span>
              </label>
              <input 
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="ejemplo@nexusprime.io"
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            {/* Teléfono / WhatsApp */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-500" />
                <span>Teléfono de Contacto / WhatsApp</span>
              </label>
              <input 
                type="text"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="+57 304 347 0984"
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            {/* Rol de Sistema (Lectura) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-500" />
                <span>Rol Asignado en Plataforma</span>
              </label>
              <input 
                type="text"
                disabled
                value={`${getRoleLabel(currentUser.role)} (Asignado por Nexus Web Studio)`}
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 font-semibold cursor-not-allowed"
              />
            </div>

          </div>

          {/* Biografía / Descripción */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Biografía Profesional</span>
            </label>
            <textarea 
              rows={3}
              value={bioInput}
              onChange={(e) => setBioInput(e.target.value)}
              placeholder="Describe tu rol o experiencia..."
              className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-all shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios Personales</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: FOTO DE AVATAR */}
      {activeTab === 'avatar' && (
        <form onSubmit={handleSaveAvatar} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-500" />
              <span>Cambiar Foto de Avatar</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Selecciona uno de los avatares predeterminados de alta resolución o proporciona el enlace de tu propia imagen.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            <img 
              src={avatarInput || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'} 
              alt="Vista Previa de Avatar" 
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-amber-500/50 shadow-xl shrink-0" 
            />
            <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Vista Previa Actual
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Esta imagen identificará tu perfil en la barra de navegación, paneles operativos y registros de auditoría de Nexus Web Studio.
              </p>
            </div>
          </div>

          {/* Preset Avatar Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Avatares Predeterminados de Alta Gama:
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {AVATAR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setAvatarInput(preset.url)}
                  className={`p-2 rounded-2xl border transition-all text-center group cursor-pointer ${
                    avatarInput === preset.url
                      ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500'
                      : 'border-slate-200 dark:border-slate-800 hover:border-amber-500/50 bg-slate-50 dark:bg-slate-800/40'
                  }`}
                >
                  <img 
                    src={preset.url} 
                    alt={preset.label} 
                    className="w-16 h-16 mx-auto rounded-xl object-cover mb-2 group-hover:scale-105 transition-transform" 
                  />
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block truncate">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom URL Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-500" />
              <span>O ingresa una URL de imagen personalizada:</span>
            </label>
            <input 
              type="url"
              value={avatarInput}
              onChange={(e) => setAvatarInput(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-all shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Actualizar Avatar</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: SEGURIDAD & CONTRASEÑA */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          
          {/* Change Password Form */}
          <form onSubmit={handleSavePassword} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" />
                <span>Cambiar Contraseña de Acceso</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Asegura tu cuenta con una contraseña fuerte y robusta.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Contraseña Actual */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Contraseña Actual *</span>
                </label>
                <div className="relative">
                  <input 
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-10 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Nueva Contraseña */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-500" />
                  <span>Nueva Contraseña *</span>
                </label>
                <div className="relative">
                  <input 
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full px-4 py-2.5 pr-10 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmar Nueva Contraseña */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Confirmar Contraseña *</span>
                </label>
                <input 
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-all shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Actualizar Contraseña</span>
              </button>
            </div>
          </form>

          {/* 2FA Two-Factor Authentication Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-1 max-w-xl">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Autenticación de 2 Factores (2FA por Código OTP)</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Solicita un código de verificación enviado a tu correo electrónico al iniciar sesión para evitar accesos no autorizados.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold uppercase tracking-wider ${twoFactorEnabled ? 'text-emerald-500' : 'text-slate-400'}`}>
                {twoFactorEnabled ? 'Activado' : 'Desactivado'}
              </span>
              <Switch 
                checked={twoFactorEnabled} 
                onCheckedChange={handleToggle2FA} 
              />
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: PREFERENCIAS & NOTIFICACIONES */}
      {activeTab === 'preferences' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              <span>Preferencias de Alertas &amp; Apariencia</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Personaliza cómo recibes notificaciones y el modo visual en Nexus Commerce Suite.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Dark Mode Toggle */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Modo Oscuro / Día (Tema de Interfaz)
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Actualmente en modo <strong className="text-amber-500 uppercase">{isDarkMode ? 'Noche (Dark)' : 'Día (Light)'}</strong>.
                  </p>
                </div>
              </div>

              <Switch 
                checked={isDarkMode} 
                onCheckedChange={onToggleDarkMode} 
              />
            </div>

            {/* Notification Orders Toggle */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Alertas de Nuevas Órdenes en Tiempo Real
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Notificaciones emergentes en la Navbar al registrar ventas.
                  </p>
                </div>
              </div>

              <Switch 
                checked={notifOrders} 
                onCheckedChange={setNotifOrders} 
              />
            </div>

            {/* Notification Inventory Toggle */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Alertas de Stock Bajo &amp; Reabastecimiento B2B
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Notificaciones cuando un producto tiene menos de 5 unidades.
                  </p>
                </div>
              </div>

              <Switch 
                checked={notifInventory} 
                onCheckedChange={setNotifInventory} 
              />
            </div>

            {/* Notification Security Toggle */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Avisos de Seguridad &amp; Accesos Multi-Tenant
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Alertas sobre cambios de estado en tiendas o inicio de sesión.
                  </p>
                </div>
              </div>

              <Switch 
                checked={notifSecurity} 
                onCheckedChange={setNotifSecurity} 
              />
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
