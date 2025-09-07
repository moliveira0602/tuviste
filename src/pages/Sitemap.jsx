import React, { useState, useEffect } from 'react';
import { Article } from '@/api/entities';
import { createPageUrl } from '@/utils';

const Sitemap = () => {
    const [sitemapContent, setSitemapContent] = useState('');

    useEffect(() => {
        const generateSitemap = async () => {
            const baseUrl = window.location.origin;
            const articles = await Article.filter({ status: 'publicado' }, '-published_date', 5000);

            const articleUrls = articles.map(article => `
    <url>
        <loc>${baseUrl}${createPageUrl(`Article?id=${article.id}`)}</loc>
        <lastmod>${new Date(article.updated_date).toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`).join('');
            
            // Adicionar páginas estáticas
            const staticPages = ['Home', 'Sobre', 'Noticias', 'Contacto'];
            const staticUrls = staticPages.map(page => `
    <url>
        <loc>${baseUrl}${createPageUrl(page)}</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>`).join('');

            const content = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${staticUrls}
    ${articleUrls}
</urlset>`;
            
            setSitemapContent(content);
        };

        generateSitemap();
    }, []);

    // Esta página não é para ser vista, mas para ser lida por crawlers.
    // O ideal seria configurar o servidor para responder com content-type 'application/xml'.
    // Como estamos no frontend, simplesmente exibimos o XML como texto.
    return (
        <div style={{ whiteSpace: 'pre', fontFamily: 'monospace', padding: '20px' }}>
            {sitemapContent ? sitemapContent.trim() : 'Gerando sitemap...'}
        </div>
    );
};

export default Sitemap;