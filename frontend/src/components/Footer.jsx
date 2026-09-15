import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { ShieldCheck, Globe, Code, Mail, Phone, Heart, Sparkles } from 'lucide-react';

export default function Footer() {
  const { t, isHindi } = useContext(LanguageContext);

  return (
    <footer className="relative bg-slate-900 text-slate-200 pt-12 pb-8 border-t border-slate-800 overflow-hidden">
      {/* Subtle colorful top gradient border */}
      <div className="rainbow-strip h-[2px] w-full absolute top-0 left-0"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-wrap text-left lg:text-left">
          {/* Left Side: Brand & Social Links */}
          <div className="w-full lg:w-6/12 px-4 mb-8 lg:mb-0 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white rounded-xl shadow-md">
                <img src="/logo.png" alt="awaaz.ai logo" className="h-8 w-auto object-contain" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-white tracking-tight">
                  awaaz<span className="text-gradient-aurora font-black">.ai</span>
                </h4>
                <span className="text-[11px] font-bold text-slate-400 block">
                  {t('brand_slogan')}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              {t('footer_desc')}
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">

              <a
                href="#contact"
                className="bg-slate-800/80 text-cyan-400 hover:text-white hover:bg-cyan-600 border border-slate-700 h-9 w-9 flex items-center justify-center rounded-xl transition duration-200 shadow-xs"
                title="Portal Website"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="mailto:support@awaaz.ai"
                className="bg-slate-800/80 text-amber-400 hover:text-white hover:bg-amber-600 border border-slate-700 h-9 w-9 flex items-center justify-center rounded-xl transition duration-200 shadow-xs"
                title="Email Support"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="tel:1800112233"
                className="bg-slate-800/80 text-rose-400 hover:text-white hover:bg-rose-600 border border-slate-700 h-9 w-9 flex items-center justify-center rounded-xl transition duration-200 shadow-xs"
                title="Toll-Free Helpline"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right Side: Quick Links Columns */}
          <div className="w-full lg:w-6/12 px-4">
            <div className="flex flex-wrap items-top mb-6">
              <div className="w-full md:w-6/12 px-4 ml-auto space-y-3">
                <span className="block uppercase text-slate-100 text-xs font-black tracking-wider border-b border-slate-800 pb-1">
                  {t('footer_nav')}
                </span>
                <ul className="list-unstyled space-y-2 text-xs font-semibold">
                  <li>
                    <Link to="/" className="text-slate-400 hover:text-cyan-400 transition block">
                      {isHindi ? 'विहंगावलोकन व आर्किटेक्चर' : 'Overview & Architecture'}
                    </Link>
                  </li>
                  <li>
                    <Link to="/citizen" className="text-slate-400 hover:text-blue-400 transition block">
                      {isHindi ? 'नागरिक आवाज़ पोर्टल' : 'Citizen Voice Portal'}
                    </Link>
                  </li>
                  <li>
                    <Link to="/officer" className="text-slate-400 hover:text-amber-400 transition block">
                      {isHindi ? 'अधिकारी वर्क ऑर्डर बोर्ड' : 'Officer Work Order Board'}
                    </Link>
                  </li>
                  <li>
                    <Link to="/digital-twin" className="text-slate-400 hover:text-purple-400 transition block">
                      {isHindi ? 'पूर्वानुमानित डिजिटल ट्विन' : 'Predictive Digital Twin'}
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="w-full md:w-6/12 px-4 space-y-3">
                <span className="block uppercase text-slate-100 text-xs font-black tracking-wider border-b border-slate-800 pb-1">
                  {t('footer_transparency')}
                </span>
                <ul className="list-unstyled space-y-2 text-xs font-semibold">
                  <li>
                    <Link to="/track" className="text-slate-400 hover:text-purple-400 transition block">
                      {isHindi ? 'सार्वजनिक शिकायत ट्रैकिंग' : 'Public Grievance Tracker'}
                    </Link>
                  </li>
                  <li>
                    <Link to="/analytics" className="text-slate-400 hover:text-teal-400 transition block">
                      {isHindi ? 'इंदौर जोन 12 मेट्रिक्स' : 'Indore Zone 12 Metrics'}
                    </Link>
                  </li>
                  <li>
                    <span className="text-slate-400 block">
                      {isHindi ? 'संवैधानिक एआई सुरक्षा' : 'Constitutional AI Safety'}
                    </span>
                  </li>
                  <li>
                    <span className="text-slate-400 block">
                      {isHindi ? 'SHA-256 ब्लॉकचेन सत्यापन' : 'SHA-256 Block Ledger'}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Rights Notice */}
        <hr className="my-6 border-slate-800" />
        <div className="flex flex-wrap items-center md:justify-between justify-center text-xs">
          <div className="w-full md:w-6/12 px-4 mx-auto text-center md:text-left">
            <span className="text-slate-400 font-medium">
              Copyright © {new Date().getFullYear()} Innovik Hackathon 6.0 • Team{' '}
              <strong className="text-white font-bold">Pragati 2.0</strong>
            </span>
          </div>
          <div className="w-full md:w-6/12 px-4 mx-auto text-center md:text-right mt-2 md:mt-0">
            <span className="text-[11px] text-slate-400 font-mono">
              {t('footer_rights')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
