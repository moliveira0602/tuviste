import Layout from "./Layout.jsx";

import Home from "./Home";

import Article from "./Article";

import Admin from "./Admin";

import CreateArticle from "./CreateArticle";

import Analytics from "./Analytics";

import NewsCollector from "./NewsCollector";

import GDPRCompliance from "./GDPRCompliance";

import Sobre from "./Sobre";

import Noticias from "./Noticias";

import Contacto from "./Contacto";

import Profile from "./Profile";

import JogosDaSemana from "./JogosDaSemana";

import Sitemap from "./Sitemap";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Article: Article,
    
    Admin: Admin,
    
    CreateArticle: CreateArticle,
    
    Analytics: Analytics,
    
    NewsCollector: NewsCollector,
    
    GDPRCompliance: GDPRCompliance,
    
    Sobre: Sobre,
    
    Noticias: Noticias,
    
    Contacto: Contacto,
    
    Profile: Profile,
    
    JogosDaSemana: JogosDaSemana,
    
    Sitemap: Sitemap,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Article" element={<Article />} />
                
                <Route path="/Admin" element={<Admin />} />
                
                <Route path="/CreateArticle" element={<CreateArticle />} />
                
                <Route path="/Analytics" element={<Analytics />} />
                
                <Route path="/NewsCollector" element={<NewsCollector />} />
                
                <Route path="/GDPRCompliance" element={<GDPRCompliance />} />
                
                <Route path="/Sobre" element={<Sobre />} />
                
                <Route path="/Noticias" element={<Noticias />} />
                
                <Route path="/Contacto" element={<Contacto />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/JogosDaSemana" element={<JogosDaSemana />} />
                
                <Route path="/Sitemap" element={<Sitemap />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}