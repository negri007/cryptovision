import axios from 'axios';
import * as logger from 'firebase-functions/logger';

const NEWS_API_KEY = process.env.NEWS_API_KEY || '';
const BASE_URL = 'https://newsapi.org/v2';

const isMockMode = () => !NEWS_API_KEY && process.env.FUNCTIONS_EMULATOR === 'true';

export interface Article {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  content?: string;
}

export async function getEverything(keywords: string, language = 'pt', pageSize = 10): Promise<Article[]> {
  if (isMockMode()) {
    logger.info(`NewsAPI: Running in Mock Mode for getEverything (${keywords})`);
    return [
      {
        title: 'Bitcoin atinge nova alta histórica com fluxo de ETFs',
        description: 'O preço do Bitcoin subiu acima de US$ 64.000, impulsionado pela forte demanda contínua por ETFs de Bitcoin à vista nos EUA.',
        url: 'https://example.com/btc-high',
        source: 'CryptoNews',
        publishedAt: new Date().toISOString()
      },
      {
        title: 'Ethereum enfrenta queda após taxas de gás subirem drasticamente',
        description: 'Analistas apontam preocupações de congestionamento na rede principal do Ethereum, forçando desenvolvedores a migrarem para soluções de segunda camada.',
        url: 'https://example.com/eth-fees',
        source: 'DefiNews',
        publishedAt: new Date().toISOString()
      }
    ];
  }

  try {
    const response = await axios.get(`${BASE_URL}/everything`, {
      params: {
        q: keywords,
        language,
        pageSize,
        apiKey: NEWS_API_KEY
      }
    });
    return (response.data.articles || []).map((art: any) => ({
      title: art.title || '',
      description: art.description || '',
      url: art.url || '',
      source: art.source?.name || 'Unknown',
      publishedAt: art.publishedAt || new Date().toISOString()
    }));
  } catch (error: any) {
    logger.error(`NewsAPI: Error in getEverything for ${keywords}`, { error: error.message });
    throw error;
  }
}

export async function getTopHeadlines(category = 'business', country = 'br', pageSize = 10): Promise<Article[]> {
  if (isMockMode()) {
    logger.info(`NewsAPI: Running in Mock Mode for getTopHeadlines (${category})`);
    return [
      {
        title: 'Mercados globais registram forte volatilidade no início da semana',
        description: 'Investidores aguardam novos dados da inflação americana e decisões sobre taxas de juros de bancos centrais.',
        url: 'https://example.com/global-markets',
        source: 'FinançaInfo',
        publishedAt: new Date().toISOString()
      }
    ];
  }

  try {
    const response = await axios.get(`${BASE_URL}/top-headlines`, {
      params: {
        category,
        country,
        pageSize,
        apiKey: NEWS_API_KEY
      }
    });
    return (response.data.articles || []).map((art: any) => ({
      title: art.title || '',
      description: art.description || '',
      url: art.url || '',
      source: art.source?.name || 'Unknown',
      publishedAt: art.publishedAt || new Date().toISOString()
    }));
  } catch (error: any) {
    logger.error(`NewsAPI: Error in getTopHeadlines for ${category}`, { error: error.message });
    throw error;
  }
}

// Regex-based RSS Feed XML Parser to avoid bloated dependencies
export async function parseRssFeed(feedUrl: string): Promise<Article[]> {
  try {
    // If running offline or in mock emulator mode without access to RSS
    if (process.env.FUNCTIONS_EMULATOR === 'true' && feedUrl.includes('mock')) {
      logger.info(`NewsAPI: Running in Mock Mode for parseRssFeed (${feedUrl})`);
      return [
        {
          title: 'Notícia mockada do feed RSS',
          description: 'Esta é uma descrição realista gerada pelo simulador para testar o parseamento de feeds RSS.',
          url: 'https://example.com/rss-mock',
          source: 'RSS Feed Mock',
          publishedAt: new Date().toISOString()
        }
      ];
    }

    const response = await axios.get(feedUrl, { timeout: 10000 });
    const xml = response.data;
    const articles: Article[] = [];
    
    // Split by <item>
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    
    while ((match = itemRegex.exec(xml)) !== null) {
      const itemContent = match[1];
      
      const titleMatch = itemContent.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || itemContent.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/);
      const descMatch = itemContent.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || itemContent.match(/<description>([\s\S]*?)<\/description>/);
      const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      
      const title = titleMatch ? titleMatch[1].trim() : '';
      const url = linkMatch ? linkMatch[1].trim() : '';
      const description = descMatch ? descMatch[1].replace(/<[^>]*>/g, '').trim() : '';
      const publishedAt = pubDateMatch ? new Date(pubDateMatch[1].trim()).toISOString() : new Date().toISOString();
      
      if (title && url) {
        articles.push({
          title,
          description,
          url,
          source: new URL(feedUrl).hostname,
          publishedAt
        });
      }
    }
    
    return articles;
  } catch (error: any) {
    logger.error(`NewsAPI: Error in parseRssFeed for ${feedUrl}`, { error: error.message });
    // In emulator, fall back to mock data if actual fetch fails
    if (process.env.FUNCTIONS_EMULATOR === 'true') {
      return [
        {
          title: `Fallback Feed RSS: Falha ao carregar ${new URL(feedUrl).hostname}`,
          description: 'Retornando este mock de fallback devido a falha na requisição externa em ambiente local.',
          url: feedUrl,
          source: 'RSS Fallback',
          publishedAt: new Date().toISOString()
        }
      ];
    }
    throw error;
  }
}
