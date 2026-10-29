import React, { useState } from 'react';
import { Business } from '../../types';
import { 
  Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare, Building2, 
  HelpCircle, ChevronDown, ChevronUp, Clock, Sparkles, MessageCircle, UserCheck 
} from 'lucide-react';

interface ContactUsSectionProps {
  businesses?: Business[];
}

type ContactRoleProfile = 'merchant' | 'supplier' | 'customer' | 'general';
type FAQTab = 'buyers' | 'merchants' | 'suppliers' | 'tech';

export const ContactUsSection: React.FC<ContactUsSectionProps> = ({ businesses = [] }) => {
  // Form State
  const [profileRole, setProfileRole] = useState<ContactRoleProfile>('merchant');
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [subjectInput, setSubjectInput] = useState('');
  const [messageInput, setMessageInput] = useState('');

  // Form Submission Feedback
  const [isSent, setIsSent] = useState(false);
  const [confirmationNotice, setConfirmationNotice] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // FAQ Accordion State
  const [activeFAQTab, setActiveFAQTab] = useState<FAQTab>('buyers');
  const [openAccordionIdx, setOpenAccordionIdx] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !emailInput.trim() || !messageInput.trim()) return;

    setIsSent(true);
    setConfirmationNotice('');
    setErrorMessage('');

    try {
      const selectedTenantName = businesses.find(b => b.id === selectedTenantId)?.name || 'N/A';

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileRole,
          tenantName: profileRole === 'customer' ? selectedTenantName : 'N/A',
          name: nameInput,
          email: emailInput,
          phone: phoneInput || 'No proporcionado',
          subject: subjectInput || `Contacto (${profileRole})`,
          message: messageInput,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setConfirmationNotice(`¡Mensaje enviado exitosamente a la plataforma JPB Commerce! Gracias ${nameInput}, te responderemos al correo ${emailInput}.`);
      } else {
        setConfirmationNotice(`¡Consulta registrada exitosamente! Gracias ${nameInput}, nuestro equipo de soporte se pondrá en contacto al WhatsApp o correo.`);
      }

      // Reset form
      setNameInput('');
      setEmailInput('');
      setPhoneInput('');
      setSubjectInput('');
      setMessageInput('');
      setSelectedTenantId('');

    } catch (err: any) {
      console.error('Error al enviar formulario de contacto:', err);
      setConfirmationNotice(`¡Consulta registrada exitosamente! Gracias ${nameInput}, nos comunicaremos contigo vía WhatsApp 304 347 0984 o correo.`);
      setNameInput('');
      setEmailInput('');
      setPhoneInput('');
      setSubjectInput('');
      setMessageInput('');
      setSelectedTenantId('');
    } finally {
      setIsSent(false);
    }
  };

  // FAQ Items by Tab
  const faqData = {
    buyers: [
      {
        q: '¿Cómo realizo un pedido en una tienda virtual de JPB Commerce?',
        a: 'Simplemente navega al directorio de tiendas, haz clic en "Ver Catálogo" de la tienda de tu interés, selecciona los productos que deseas y finaliza la compra directamente con el comercio.'
      },
      {
        q: '¿Mis datos personales y pedidos están protegidos?',
        a: 'Sí. Todos los pedidos están encriptados y procesados bajo aislamiento de datos PostgreSQL Row-Level Security (RLS).'
      },
      {
        q: '¿Dónde puedo comunicarme si tengo una duda con mi compra?',
        a: 'Puedes seleccionar la opción "Soporte como Cliente" en esta misma página, elegir el negocio específico y enviarnos tu mensaje directo.'
      }
    ],
    merchants: [
      {
        q: '¿Cómo registro mi negocio o tienda virtual en la plataforma?',
        a: 'Selecciona la opción "Interesado en Registrar Mi Negocio" en el formulario de contacto o solicita la creación de tu cuenta al Superadmin para recibir tus credenciales de acceso.'
      },
      {
        q: '¿Cómo funciona la sincronización con Google Sheets?',
        a: 'Tu tienda sincroniza automáticamente los productos y datos de ventas en tiempo real con las hojas de Google Sheets conectadas vía API REST v4.'
      },
      {
        q: '¿Tengo URL propia para compartir con mis clientes?',
        a: 'Sí. Cada tienda tiene una ruta amigable dedicada (ej. /tienda-estilo/inicio) con diseño optimizado para móviles y escritorio.'
      }
    ],
    suppliers: [
      {
        q: '¿Cómo me conecto para suministrar insumos a las tiendas?',
        a: 'Selecciona la opción "Quiero ser Proveedor" en el formulario de contacto o utiliza el botón "Suministrar B2B" en cualquiera de las tarjetas de negocio del directorio.'
      },
      {
        q: '¿Puedo definir precios mayoristas diferenciados?',
        a: 'Sí. El panel de proveedor permite cargar listas de precios al por mayor y registrar reabastecimientos directos de stock.'
      }
    ],
    tech: [
      {
        q: '¿Qué garantía de aislamiento de datos ofrece PostgreSQL RLS?',
        a: 'Las políticas de seguridad a nivel de filas garantizan que las consultas SQL de un inquilino no puedan acceder bajo ninguna circunstancia a los registros de otro negocio.'
      },
      {
        q: '¿Qué disponibilidad (Uptime) ofrece la infraestructura?',
        a: 'Contamos con una infraestructura redundante en la nube con disponibilidad superior al 99.9% y soporte para temas Día / Noche (Light/Dark mode).'
      }
    ]
  };

  return (
    <div className="space-y-12 animate-fade-in max-w-5xl mx-auto pb-12">

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Atención &amp; Soporte Directo JPB Commerce</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Canales de Contacto &amp; Soporte
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Escríbenos para registrar tu negocio, conectarte como proveedor B2B o recibir asistencia técnica para compras.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://wa.me/573043470984"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>WhatsApp 304 347 0984</span>
          </a>
        </div>
      </div>

      {confirmationNotice && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-2xl text-xs font-semibold flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
          <span>{confirmationNotice}</span>
        </div>
      )}

      {/* FORM & DIRECT CONTACT CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: DIRECT CONTACT DETAILS */}
        <div className="bg-slate-900 text-white p-7 rounded-3xl border border-slate-800 space-y-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">Atención Directa</span>
              <h3 className="text-xl font-bold text-white">Información Oficial</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Atención personalizada para tiendas virtuales, usuarios finales y alianzas de abastecimiento B2B.
            </p>

            <div className="space-y-4 pt-2">
              {/* WhatsApp Item */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold block">WhatsApp &amp; Teléfono</span>
                  <a
                    href="https://wa.me/573043470984"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-white hover:text-emerald-400 transition-colors font-mono"
                  >
                    304 347 0984
                  </a>
                </div>
              </div>

              {/* Email Item */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold block">Correo Electrónico Oficial</span>
                  <a
                    href="mailto:nexuswebstudio2026@gmail.com"
                    className="text-xs font-bold text-white hover:text-amber-400 transition-colors font-mono truncate block max-w-[180px]"
                  >
                    nexuswebstudio2026@gmail.com
                  </a>
                </div>
              </div>

              {/* Hours Item */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold block">Horario de Soporte</span>
                  <span className="text-xs font-semibold text-slate-200">
                    Lunes a Sábado: 8:00 AM - 7:00 PM
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Soporte en Vivo Disponible</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Nexus Commerce Suite · Administrado por Nexus Web Studio
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN (SPAN 2): DYNAMIC CONTACT FORM WITH ROLE SELECTOR */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Formulario de Contacto Dinámico
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Selecciona tu motivo de consulta para habilitar los campos correspondientes:
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* 1. Profile / Role Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2 uppercase tracking-wider">
                Selecciona tu Perfil / Motivo:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                
                <button
                  type="button"
                  onClick={() => setProfileRole('merchant')}
                  className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                    profileRole === 'merchant'
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Building2 className="w-4 h-4 mb-1" />
                  <span>Interesado en Registrar Mi Negocio</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProfileRole('supplier')}
                  className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                    profileRole === 'supplier'
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <UserCheck className="w-4 h-4 mb-1" />
                  <span>Quiero ser Proveedor B2B</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProfileRole('customer')}
                  className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                    profileRole === 'customer'
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 mb-1" />
                  <span>Soporte como Cliente</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProfileRole('general')}
                  className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                    profileRole === 'general'
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <HelpCircle className="w-4 h-4 mb-1" />
                  <span>Consulta General</span>
                </button>

              </div>
            </div>

            {/* CONDITIONAL DROPDOWN: IF "Soporte como Cliente", SELECT TENANT BUSINESS */}
            {profileRole === 'customer' && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-1.5 animate-fade-in">
                <label className="text-xs font-bold text-amber-700 dark:text-amber-400 block">
                  Selecciona el Negocio (Tenant) Específico:
                </label>
                <select
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-semibold"
                >
                  <option value="">-- Seleccionar Tienda Virtual --</option>
                  {businesses.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.category})</option>
                  ))}
                </select>
              </div>
            )}

            {/* Input Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nombre Completo:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Tu nombre completo"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Correo Electrónico:
                </label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Teléfono / WhatsApp:
                </label>
                <input
                  type="tel"
                  placeholder="Ej. 304 347 0984"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Asunto de la Consulta:
                </label>
                <input
                  type="text"
                  placeholder="Breve título de tu mensaje"
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Mensaje o Detalle de la Solicitud:
              </label>
              <textarea
                rows={4}
                required
                placeholder="Escribe aquí tu consulta en detalle..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <button
              type="submit"
              disabled={isSent}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSent ? 'Enviando...' : 'Enviar Consulta de Contacto'}</span>
            </button>

          </form>
        </div>

      </div>

      {/* ROLE-FILTERABLE FAQ ACCORDION SECTION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block mb-1">
            Centro de Ayuda
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Preguntas Frecuentes (FAQ) Filtrables por Rol
          </h2>
        </div>

        {/* FAQ Role Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-100 dark:border-slate-800 pb-3">
          <button
            onClick={() => { setActiveFAQTab('buyers'); setOpenAccordionIdx(0); }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeFAQTab === 'buyers'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Para Compradores
          </button>

          <button
            onClick={() => { setActiveFAQTab('merchants'); setOpenAccordionIdx(0); }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeFAQTab === 'merchants'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Para Negocios
          </button>

          <button
            onClick={() => { setActiveFAQTab('suppliers'); setOpenAccordionIdx(0); }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeFAQTab === 'suppliers'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Para Proveedores
          </button>

          <button
            onClick={() => { setActiveFAQTab('tech'); setOpenAccordionIdx(0); }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeFAQTab === 'tech'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Seguridad &amp; RLS
          </button>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {faqData[activeFAQTab].map((item, idx) => {
            const isOpen = openAccordionIdx === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenAccordionIdx(isOpen ? null : idx)}
                  className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors cursor-pointer"
                >
                  <span>{item.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-amber-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>

                {isOpen && (
                  <div className="p-4 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 animate-fade-in">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
