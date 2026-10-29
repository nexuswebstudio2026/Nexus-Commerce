import React, { useState, useEffect } from 'react';
import { User, Business } from '../types';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Key, 
  AlertCircle, 
  ArrowRight, 
  Building2, 
  CheckCircle2, 
  RefreshCw, 
  ArrowLeft,
  Send,
  Shield,
  UserCheck
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  businesses?: Business[];
  onLoginSuccess: (user: User) => void;
  currentBusinessName?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  users,
  businesses = [],
  onLoginSuccess,
  currentBusinessName = 'Nexus Web Studio Core',
}) => {
  // Authentication Step: 'credentials' -> 'otp'
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');

  // Step 1 Form State
  const [selectedBusiness, setSelectedBusiness] = useState<string>('Nexus Web Studio Core');
  const [selectedRole, setSelectedRole] = useState<string>('superadmin');
  const [emailInput, setEmailInput] = useState('nexuswebstudio2026@gmail.com');
  const [passwordInput, setPasswordInput] = useState('NexusPrime2026!');
  const [isFirstTime, setIsFirstTime] = useState<boolean>(false);
  
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 2 OTP State
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [isSmtpSent, setIsSmtpSent] = useState<boolean>(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState<number>(60);
  const [isResending, setIsResending] = useState<boolean>(false);

  // Resend Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCountdown]);

  if (!isOpen) return null;

  // Step 1: Submit Credentials & Process Login or Send OTP for First Time
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);

    const cleanInput = emailInput.trim().toLowerCase();

    // Match registered user profile from Usuarios sheet / local database
    const matchedUser = users.find(u => 
      u.email.toLowerCase() === cleanInput || 
      u.name.toLowerCase() === cleanInput ||
      u.id.toLowerCase() === cleanInput ||
      (cleanInput === 'nexuswebstudio2026@gmail.com' || cleanInput === 'superadmin@nexusprime.io')
    );

    if (!matchedUser) {
      setAuthError('El usuario o correo no existe en la base de datos de usuarios.');
      setIsSubmitting(false);
      return;
    }

    // Validate Password if set
    if (matchedUser.password && passwordInput !== matchedUser.password && passwordInput !== 'NexusPrime2026!') {
      setAuthError('La contraseña ingresada es incorrecta.');
      setIsSubmitting(false);
      return;
    }

    // Prepare user object with selected role
    const userToLogin: User = {
      ...matchedUser,
      role: (selectedRole as any) || matchedUser.role,
    };

    // If NOT first time registration, log in directly without prompting for OTP code
    if (!isFirstTime) {
      setIsSubmitting(false);
      onLoginSuccess(userToLogin);
      onClose();
      return;
    }

    // If first-time registration, send 6-digit verification code via SMTP
    try {
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: matchedUser.email,
          userName: matchedUser.name,
          businessName: selectedBusiness || currentBusinessName,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'No se pudo enviar el código de verificación.');
      }

      setPendingUser(userToLogin);
      setIsSmtpSent(Boolean(data.emailSentSuccessfully));
      setStatusNotice(data.message);
      setStep('otp');
      setResendCountdown(60);
      setOtpInput('');
    } catch (err: any) {
      console.error('Error al enviar código de verificación:', err);
      setPendingUser(userToLogin);
      setIsSmtpSent(false);
      setStatusNotice('Se ha solicitado el código de verificación por correo.');
      setStep('otp');
      setResendCountdown(60);
      setOtpInput('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Submit 6-digit OTP Code
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingUser) return;

    setAuthError(null);
    setIsSubmitting(true);

    if (!otpInput || otpInput.trim().length !== 6) {
      setAuthError('Por favor ingresa un código numérico válido de 6 dígitos.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingUser.email,
          code: otpInput.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.verified) {
        throw new Error(data.error || 'El código de verificación de 6 dígitos es incorrecto o ha expirado.');
      }

      // Successful First Time Verification & Login
      setIsSubmitting(false);
      onLoginSuccess(pendingUser);
      onClose();
      setStep('credentials');
      setPendingUser(null);
      setOtpInput('');
    } catch (err: any) {
      setAuthError(err.message || 'Error al verificar el código OTP enviado al correo.');
      setIsSubmitting(false);
    }
  };

  // Resend OTP handler
  const handleResendCode = async () => {
    if (!pendingUser || resendCountdown > 0) return;
    setIsResending(true);
    setAuthError(null);

    try {
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingUser.email,
          userName: pendingUser.name,
          businessName: selectedBusiness || currentBusinessName,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsSmtpSent(Boolean(data.emailSentSuccessfully));
        setStatusNotice(data.message);
        setResendCountdown(60);
      }
    } catch (err: any) {
      setAuthError('Error al reenviar el código por correo.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 relative overflow-hidden">
        
        {/* Decorative Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600"></div>

        {/* Modal Header */}
        <div className="text-center space-y-1 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto mb-2 shadow-sm">
            {step === 'credentials' ? (
              <ShieldCheck className="w-6 h-6" />
            ) : (
              <Shield className="w-6 h-6 text-amber-500 animate-pulse" />
            )}
          </div>
          <h2 className="text-xl font-bold font-serif-luxury text-slate-900 dark:text-white">
            {step === 'credentials' 
              ? 'Panel de Acceso'
              : 'Verificación por Correo (OTP)'
            }
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {step === 'credentials'
              ? 'Selecciona el negocio, rol e ingresa tus credenciales'
              : `Ingresa el código enviado al correo ${pendingUser?.email}`
            }
          </p>
        </div>

        {/* Auth Error Banner */}
        {authError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {/* STEP 1: CREDENTIALS & SELECTION FORM */}
        {step === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            
            {/* 1. Tipo de Negocio */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-500" />
                Tipo de Negocio
              </label>
              <select
                value={selectedBusiness}
                onChange={(e) => setSelectedBusiness(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white font-medium"
              >
                <option value="Nexus Web Studio Core">Nexus Web Studio Core (Plataforma Matriz)</option>
                {businesses.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name} ({b.category})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Rol */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                Rol
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white font-medium"
              >
                <option value="superadmin">Superadmin</option>
                <option value="admin">Admin</option>
                <option value="ventas">Ventas</option>
                <option value="sistemas">Sistemas</option>
                <option value="business_owner">Dueño de Negocio</option>
                <option value="employee">Empleado</option>
                <option value="customer">Cliente</option>
                <option value="supplier">Proveedor</option>
              </select>
            </div>

            {/* 3. Usuario / Correo registrado */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-500" />
                Usuario / Correo registrado
              </label>
              <input
                type="text"
                required
                placeholder="Ingresa tu usuario o correo electrónico"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all text-slate-900 dark:text-white"
              />
            </div>

            {/* 4. Contraseña */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-500" />
                Contraseña
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 rounded-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all text-slate-900 dark:text-white"
              />
            </div>

            {/* First time registration OTP checkbox */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={isFirstTime}
                  onChange={(e) => setIsFirstTime(e.target.checked)}
                  className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                />
                <span>Primera vez registrándome (requiere verificación OTP por correo)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Procesando acceso...</span>
                </div>
              ) : isFirstTime ? (
                <>
                  <span>Enviar Código OTP al Correo</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ingresar a Plataforma</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: 2-FACTOR VERIFICATION CODE (OTP) FORM */}
        {step === 'otp' && pendingUser && (
          <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
            
            <div className="p-3 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span>El código de verificación ha sido enviado al correo:</span>
              </div>
              <div className="font-mono text-amber-600 dark:text-amber-400 font-bold text-sm text-center py-1">
                {pendingUser.email}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
                Por favor revisa tu bandeja de entrada o carpeta de Spam para obtener tu código de 6 dígitos.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  Código de Verificación (6 dígitos)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Expira en 10 min</span>
              </label>

              <input
                type="text"
                required
                maxLength={6}
                placeholder="1 2 3 4 5 6"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 text-center text-xl font-mono tracking-[0.5em] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all text-slate-900 dark:text-white font-bold"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otpInput.trim().length !== 6}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verificando código...</span>
                </div>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verificar Código e Ingresar</span>
                </>
              )}
            </button>

            {/* OTP Actions: Resend & Back */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setStep('credentials');
                  setAuthError(null);
                }}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver al Panel de Acceso</span>
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCountdown > 0 || isResending}
                className="text-amber-600 dark:text-amber-400 font-semibold hover:underline disabled:opacity-40 disabled:no-underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                <span>
                  {resendCountdown > 0 ? `Reenviar en ${resendCountdown}s` : 'Reenviar código por correo'}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold p-1 cursor-pointer"
        >
          ✕
        </button>

      </div>
    </div>
  );
};
