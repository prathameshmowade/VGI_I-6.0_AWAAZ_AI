import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import DigitalTwinMap from '../components/DigitalTwinMap';
import {
  ShieldCheck,
  Brain,
  Wrench,
  Building2,
  Lock,
  Sparkles,
  ArrowRight,
  Send,
  CheckCircle2,
  Activity,
  FileText,
  Users,
  MapPin,
  TrendingUp,
  Cpu
} from 'lucide-react';

export default function LandingPage() {
  const { t, isHindi } = useContext(LanguageContext);
  const [activeZoneFilter, setActiveZoneFilter] = useState(12);

  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const ARCHITECTURAL_PILLARS = [
    {
      icon: Brain,
      title: t('pillar1_title'),
      desc: t('pillar1_desc'),
      badge: isHindi ? 'स्तंभ 1' : 'PILLAR 1',
      color: {
        iconBg: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400',
        badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
        border: 'border-indigo-100 dark:border-indigo-900/50 hover:border-indigo-300'
      }
    },
    {
      icon: Activity,
      title: t('pillar2_title'),
      desc: t('pillar2_desc'),
      badge: isHindi ? 'स्तंभ 2' : 'PILLAR 2',
      color: {
        iconBg: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400',
        badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300',
        border: 'border-cyan-100 dark:border-cyan-900/50 hover:border-cyan-300'
      }
    },
    {
      icon: Wrench,
      title: t('pillar3_title'),
      desc: t('pillar3_desc'),
      badge: isHindi ? 'स्तंभ 3' : 'PILLAR 3',
      color: {
        iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
        badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
        border: 'border-emerald-100 dark:border-emerald-900/50 hover:border-emerald-300'
      }
    },
    {
      icon: Building2,
      title: t('pillar4_title'),
      desc: t('pillar4_desc'),
      badge: isHindi ? 'स्तंभ 4' : 'PILLAR 4',
      color: {
        iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
        border: 'border-amber-100 dark:border-amber-900/50 hover:border-amber-300'
      }
    }
  ];

  const RESOLUTION_WORKFLOW = [
    { step: '01', color: 'bg-blue-100 text-blue-800 border-blue-200', title: isHindi ? 'नागरिक शिकायत प्रविष्टि' : 'Resident Intake', desc: isHindi ? 'हिंदी, मराठी और अंग्रेजी में आवाज़ या टेक्स्ट से तुरंत ऑटो जीपीएस स्थान के साथ प्रविष्टि।' : 'Voice or text entry in EN/HI/MR with auto GPS map pinpointing.' },
    { step: '02', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', title: isHindi ? 'एक्सएआई बहु-श्रेणी ट्राइएज' : 'XAI Multi-Class Triage', desc: isHindi ? 'सड़क, जल, सफाई, बिजली में 96% एआई सटीकता के साथ स्वतः वर्गीकरण।' : 'Categorized into Road, Water, Sanitation, Electrical with 96% AI confidence.' },
    { step: '03', color: 'bg-purple-100 text-purple-800 border-purple-200', title: isHindi ? 'सामुदायिक क्लस्टरिंग व जनसमर्थन' : 'Community Weighting', desc: isHindi ? 'आसपास के प्रभावित नागरिकों द्वारा स्वतः अपवोट और समूह निर्माण।' : 'Auto upvoted and clustered by nearby affected citizens.' },
    { step: '04', color: 'bg-cyan-100 text-cyan-800 border-cyan-200', title: isHindi ? 'स्वायत्त वर्क ऑर्डर प्रेषण' : 'Agentic Work Order', desc: isHindi ? '60 सेकंड में अधिकृत नगर निगम ठेकेदारों को स्वतः वर्क ऑर्डर जारी।' : '60s autonomous dispatch to city municipal contractors.' },
    { step: '05', color: 'bg-amber-100 text-amber-800 border-amber-200', title: isHindi ? 'अधिकारी डिजिटल स्वीकृति' : 'Officer Sign-Off', desc: isHindi ? 'अधिकारी द्वारा स्थिति निरीक्षण और वर्क ऑर्डर पर्यवेक्षण।' : 'Human-in-the-loop override & execution supervision.' },
    { step: '06', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', title: isHindi ? 'क्लिप (CLIP) फोटो सत्यापन' : 'CLIP Photo Proof', desc: isHindi ? 'मरम्मत पूर्व व मरम्मत पश्चात कंप्यूटर विजन स्ट्रक्चरल मिलान।' : 'Computer vision pre-and-post repair structural verification.' },
    { step: '07', color: 'bg-teal-100 text-teal-800 border-teal-200', title: isHindi ? 'अपरिवर्तनीय ब्लॉकचेन ऑडिट' : 'SHA-256 Audit Log', desc: isHindi ? 'पारदर्शिता के लिए SHA-256 ब्लॉकचेन पब्लिक लेजर में स्थाई प्रविष्टि।' : 'Tamper-evident public ledger block recording.' }
  ];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (contactForm.name && contactForm.email) {
      setContactSubmitted(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero Section */}
      <section className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-3.5 py-1.5 rounded-full text-xs font-bold text-blue-800 dark:text-blue-300">
              <img src="/logo.png" alt="awaaz.ai" className="w-5 h-5 object-contain" />
              <span>{t('hero_badge')}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
              {t('hero_title')}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm leading-relaxed">
              {t('hero_sub')}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/citizen" className="btn-primary text-xs py-3 px-6">
                <FileText className="w-4 h-4" />
                <span>{t('hero_btn_submit')}</span>
              </Link>
              <Link to="/officer" className="btn-amber text-xs py-3 px-6">
                <Cpu className="w-4 h-4" />
                <span>{t('hero_btn_officer')}</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Multi-Color Badge Container */}
          <div className="w-full lg:w-80 bg-slate-50 dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 shadow-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>{t('system_status')}</span>
              </span>
              <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded shadow-2xs">{t('operational')}</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300 font-medium">
                <span>{t('avg_sla')}</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{t('avg_sla_val')}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300 font-medium">
                <span>{t('ai_conf_score')}</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">96.4%</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300 font-medium">
                <span>{t('blockchain_blocks')}</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{t('blockchain_blocks_val')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Architectural Pillars Grid */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t('pillars_heading')}</h2>
          <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm">{t('pillars_sub')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {ARCHITECTURAL_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div 
                key={idx} 
                className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border ${pillar.color.border} shadow-xs space-y-3.5 transition-all duration-300 hover:shadow-lg group`}
              >
                <div className="flex justify-between items-center">
                  <div className={`w-12 h-12 rounded-2xl ${pillar.color.iconBg} flex items-center justify-center shadow-xs transition-transform group-hover:scale-110`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] font-mono font-black ${pillar.color.badge} px-2.5 py-1 rounded-full shadow-2xs`}>
                    {pillar.badge}
                  </span>
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-sm group-hover:text-blue-600 transition-colors">{pillar.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{pillar.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7-Step Workflow Section */}
      <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-md">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t('workflow_heading')}</h2>
          <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm">{t('workflow_sub')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RESOLUTION_WORKFLOW.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 hover:shadow-xs transition">
              <div className="flex justify-between items-center">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg border ${item.color}`}>
                  {item.step}
                </span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <h4 className="font-black text-slate-900 dark:text-white text-xs">{item.title}</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Live City Telemetry Layer */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-6 h-6 text-blue-600" />
              <span>{t('telemetry_heading')}</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm">{t('telemetry_sub')}</p>
          </div>
          <Link
            to="/digital-twin"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 flex items-center gap-1"
          >
            <span>{t('explore_digital_twin')}</span>
          </Link>
        </div>

        {/* Telemetry Digital Twin Map */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
          <DigitalTwinMap />
        </div>
      </section>

      {/* Citizen Helpdesk & Contact Section */}
      <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {isHindi ? 'नागरिक सहायता व संपर्क केंद्र' : 'Municipal Citizen Helpdesk & Support'}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm">
            {isHindi ? 'इंदौर नगर निगम (IMC) के हेल्पलाइन अधिकारियों से संपर्क करें अथवा अपना सुझाव भेजें।' : 'Reach out to Indore Municipal Corporation (IMC) redressal officers or submit feedback.'}
          </p>
        </div>

        {contactSubmitted ? (
          <div className="p-6 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-2 max-w-lg mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              {isHindi ? 'संदेश सफलतापूर्वक भेजा गया!' : 'Message Sent Successfully!'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {isHindi ? 'हमारा नगर निगम सहायता केंद्र जल्द आपसे संपर्क करेगा।' : 'Our municipal redressal cell will review your inquiry shortly.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleContactSubmit} className="max-w-xl mx-auto space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder={isHindi ? 'आपका नाम' : 'Your Full Name'}
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                required
                placeholder={isHindi ? 'ईमेल या फोन नंबर' : 'Email or Phone'}
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <textarea
              rows={3}
              placeholder={isHindi ? 'अपनी पूछताछ या सुझाव यहाँ लिखें...' : 'How can we help your ward infrastructure?'}
              value={contactForm.message}
              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="w-full btn-primary text-xs py-3 justify-center">
              <Send className="w-4 h-4" />
              <span>{isHindi ? 'संदेश भेजें' : 'Send Inquiry'}</span>
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
