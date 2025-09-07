import React, { useEffect } from 'react';

const SEO = ({ title, description, keywords, ogTitle, ogDescription, ogImage, canonicalUrl, structuredData }) => {
  useEffect(() => {
    // Definir título
    if (title) {
      document.title = title;
    }

    // Função para criar ou atualizar meta tags
    const setMeta = (name, content) => {
      if (!content) return;
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };
    
    // Função para criar ou atualizar property tags (Open Graph)
    const setProperty = (property, content) => {
        if (!content) return;
        let element = document.querySelector(`meta[property="${property}"]`);
        if (!element) {
            element = document.createElement('meta');
            element.setAttribute('property', property);
            document.head.appendChild(element);
        }
        element.setAttribute('content', content);
    };

    // Função para criar ou atualizar link tags
    const setLink = (rel, href) => {
        if (!href) return;
        let element = document.querySelector(`link[rel="${rel}"]`);
        if (!element) {
            element = document.createElement('link');
            element.setAttribute('rel', rel);
            document.head.appendChild(element);
        }
        element.setAttribute('href', href);
    };

    setMeta('description', description);
    setMeta('keywords', keywords);

    // Open Graph Tags
    setProperty('og:title', ogTitle || title);
    setProperty('og:description', ogDescription || description);
    setProperty('og:image', ogImage);
    setProperty('og:type', 'website');
    if(canonicalUrl) setProperty('og:url', canonicalUrl);

    // Canonical URL
    setLink('canonical', canonicalUrl);
    
    // Structured Data
    const scriptId = 'structured-data-script';
    let scriptElement = document.getElementById(scriptId);
    if (structuredData) {
        if (!scriptElement) {
            scriptElement = document.createElement('script');
            scriptElement.id = scriptId;
            scriptElement.type = 'application/ld+json';
            document.head.appendChild(scriptElement);
        }
        scriptElement.textContent = JSON.stringify(structuredData);
    }

    // Cleanup function
    return () => {
      if (scriptElement && structuredData) {
        // Ao desmontar, podemos remover o script para evitar duplicação em SPAs
        // scriptElement.remove();
      }
    };
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, canonicalUrl, structuredData]);

  return null; // Este componente não renderiza nada
};

export default SEO;