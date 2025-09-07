

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Newspaper, Home, Settings, PlusCircle, BarChart3, Mail, MapPin, Phone, Globe, Shield, LogIn, LogOut, Info, Contact, UserCircle, Search } from "lucide-react";
import HeaderWeather from "./components/weather/HeaderWeather";
import WeatherSlider from "./components/weather/WeatherSlider";
import BreakingNews from "./components/news/BreakingNews"; // Added import for BreakingNews
import SearchModal from "./components/search/SearchModal";
import { Button } from "./components/ui/button";
import { LanguageProvider, useLanguage } from "./components/context/LanguageContext";

// Componente de topo para clima e idioma
const TopBar = () => {
  const { language, setLanguage } = useLanguage();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
        try {
            const u = await User.me();
            setUser(u);
        } catch (e) {}
    }
    fetchUser();
  }, []);

  const handleLanguageChange = async (lang) => {
    setLanguage(lang);
    if(user) {
        try {
            await User.updateMyUserData({ preferences: { ...user?.preferences, language: lang } });
        } catch (e) {
            console.error("Failed to save language preference", e);
        }
    }
  };

  return (
    <div className="bg-gray-100 text-gray-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between text-sm">
        <HeaderWeather />
        <div className="flex items-center space-x-4">
          <button onClick={() => handleLanguageChange('pt-PT')} className={`flex items-center space-x-1 ${language === 'pt-PT' ? 'font-bold text-blue-600' : 'hover:text-gray-900'}`}>
            <img src="https://flagcdn.com/w20/pt.png" alt="Portugal Flag" className="w-4 h-3" />
            <span>PT</span>
          </button>
          <button onClick={() => handleLanguageChange('en-US')} className={`flex items-center space-x-1 ${language === 'en-US' ? 'font-bold text-blue-600' : 'hover:text-gray-900'}`}>
            <img src="https://flagcdn.com/w20/us.png" alt="USA Flag" className="w-4 h-3" />
            <span>EN</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const MainLayout = ({ children, currentPageName }) => {
  const { t } = useLanguage();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const fetchAndSetConfig = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchAndSetConfig();
  }, []);

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleLogout = async () => {
    await User.logout();
    window.location.href = createPageUrl("Home");
  };

  const isAdminRoute = location.pathname.startsWith('/admin') || 
                      ['Admin', 'CreateArticle', 'Analytics', 'NewsCollector', 'GDPRCompliance', 'Profile'].includes(currentPageName);

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col text-gray-900">
        <nav className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <Link to={createPageUrl("Home")} className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-700 to-blue-800 rounded-lg flex items-center justify-center shadow-lg">
                  <Newspaper className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-900">Tuviste?</span>
                <span className="text-sm text-gray-500 ml-2 bg-blue-50 px-2 py-1 rounded-full">Admin</span>
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link to={createPageUrl("Admin")} className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-colors ${currentPageName === 'Admin' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                  <Settings className="w-4 h-4" />
                  <span>Gestão</span>
                </Link>
                <Link to={createPageUrl("Profile")} className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-colors ${currentPageName === 'Profile' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                  <UserCircle className="w-4 h-4" />
                  <span>Perfil</span>
                </Link>
                <Link to={createPageUrl("NewsCollector")} className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-colors ${currentPageName === 'NewsCollector' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                  <Globe className="w-4 h-4" />
                  <span>Coletar</span>
                </Link>
                <Link to={createPageUrl("CreateArticle")} className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-colors ${currentPageName === 'CreateArticle' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                  <PlusCircle className="w-4 h-4" />
                  <span>Criar</span>
                </Link>
                <Link to={createPageUrl("Analytics")} className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-colors ${currentPageName === 'Analytics' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                </Link>
                <Link to={createPageUrl("GDPRCompliance")} className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-colors ${currentPageName === 'GDPRCompliance' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                  <Shield className="w-4 h-4" />
                  <span>GDPR</span>
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to={createPageUrl("Home")} className="text-sm text-blue-700 hover:text-blue-800 px-3 py-2 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors">Ver Site →</Link>
              <button onClick={handleLogout} className="flex items-center space-x-2 text-sm text-red-600 hover:text-red-800 px-3 py-2 rounded-lg border border-red-200 hover:bg-red-50 transition-colors font-medium">
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-gray-900">
      <TopBar />
      <BreakingNews /> {/* BreakingNews component added here */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to={createPageUrl("Home")} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-700 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
                <Newspaper className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-xl">Tuviste?</span>
                <div className="text-xs text-blue-700 font-medium">{t('footer.tagline')}</div>
              </div>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link to={createPageUrl("Home")} className={`flex items-center space-x-2 transition-colors ${currentPageName === 'Home' ? 'text-blue-700 font-semibold' : 'text-gray-700 hover:text-blue-700'}`}>
                <Home className="w-4 h-4" />
                <span>{t('nav.home')}</span>
              </Link>
              <Link to={createPageUrl("Sobre")} className={`flex items-center space-x-2 transition-colors ${currentPageName === 'Sobre' ? 'text-blue-700 font-semibold' : 'text-gray-700 hover:text-blue-700'}`}>
                <Info className="w-4 h-4" />
                <span>{t('nav.about')}</span>
              </Link>
              <Link to={createPageUrl("Noticias")} className={`flex items-center space-x-2 transition-colors ${currentPageName === 'Noticias' ? 'text-blue-700 font-semibold' : 'text-gray-700 hover:text-blue-700'}`}>
                <Newspaper className="w-4 h-4" />
                <span>{t('nav.news')}</span>
              </Link>
              <Link to={createPageUrl("Contacto")} className={`flex items-center space-x-2 transition-colors ${currentPageName === 'Contacto' ? 'text-blue-700 font-semibold' : 'text-gray-700 hover:text-blue-700'}`}>
                <Contact className="w-4 h-4" />
                <span>{t('nav.contact')}</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon" className="rounded-full border-blue-200 hover:bg-blue-50" onClick={() => setIsSearchOpen(true)} aria-label="Pesquisar">
                <Search className="w-5 h-5 text-blue-700" />
              </Button>
              {!loadingUser && (user ? 
                <Link to={createPageUrl("Admin")} className="text-sm text-white bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-lg">
                  {t('nav.adminPanel')}
                </Link> : 
                <button onClick={() => User.login()} className="flex items-center space-x-2 text-sm text-blue-700 hover:text-blue-800 px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors font-medium">
                  <LogIn className="w-4 h-4" />
                  <span>{t('nav.login')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1">{children}</main>
      
      <WeatherSlider />
      
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                  <Newspaper className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="font-bold text-xl">Tuviste?</span>
                  <div className="text-sm text-gray-400">{t('footer.tagline')}</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{t('footer.description')}</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">{t('footer.navigation')}</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to={createPageUrl("Home")} className="hover:text-white transition-colors">{t('nav.home')}</Link></li>
                <li><Link to={createPageUrl("Sobre")} className="hover:text-white transition-colors">{t('nav.about')}</Link></li>
                <li><Link to={createPageUrl("Noticias")} className="hover:text-white transition-colors">{t('nav.news')}</Link></li>
                <li><Link to={createPageUrl("Contacto")} className="hover:text-white transition-colors">{t('nav.contact')}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">{t('footer.legalPrivacy')}</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to={createPageUrl("GDPRCompliance")} className="hover:text-white transition-colors">{t('footer.privacyPolicy')}</Link></li>
                <li><Link to={createPageUrl("GDPRCompliance")} className="hover:text-white transition-colors">{t('footer.cookieManagement')}</Link></li>
                <li><a href="mailto:redacao@tuviste.pt" className="hover:text-white transition-colors">{t('footer.contactUs')}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">{t('footer.contactTitle')}</h3>
              <div className="space-y-3 text-gray-400 text-sm">
                <a href="mailto:redacao@tuviste.pt" className="flex items-center space-x-2 hover:text-white transition-colors">
                  <Mail className="w-4 h-4" />
                  <span>redacao@tuviste.pt</span>
                </a>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+351 21 000 0000</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Lisboa, Portugal</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Conforme GDPR</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-center items-center">
              <div className="text-gray-400 text-sm">{t('footer.copyright')}</div>
            </div>
          </div>
        </div>
      </footer>
      <SearchModal isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} />
    </div>
  );
};

export default function LayoutWrapper(props) {
  return (
    <LanguageProvider>
      <MainLayout {...props} />
    </LanguageProvider>
  );
}

