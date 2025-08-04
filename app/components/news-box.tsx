"use client";

import { Link } from "@heroui/react";
import { useState, useEffect } from "react";

// 🏥 Multiple API endpoints for better health news coverage
const healthApiUrls = [
  `https://newsapi.org/v2/top-headlines?category=health&language=en&pageSize=10&apiKey=cfa20054a3fe4077a4f572c61fa2a8c4`,
  `https://newsapi.org/v2/everything?q=health%20medical%20healthcare&language=en&sortBy=publishedAt&pageSize=10&apiKey=cfa20054a3fe4077a4f572c61fa2a8c4`,
  `https://newsapi.org/v2/everything?q=WHO%20CDC%20disease%20outbreak&language=en&sortBy=publishedAt&pageSize=10&apiKey=cfa20054a3fe4077a4f572c61fa2a8c4`
];

interface NewsArticle {
  title: string;
  description: string;
  url: string;
}

export default function NewsBox() {
  const [news, setNews] = useState<NewsArticle[]>([]); // gamiton array para sa multiple articles
  const [loading, setLoading] = useState(true);

  // 🏥 Fallback health news in case API fails
  const fallbackHealthNews: NewsArticle[] = [
    {
      title: "WHO Updates Global Health Guidelines for Disease Prevention",
      description: "World Health Organization releases new recommendations for preventing infectious diseases in communities worldwide.",
      url: "https://who.int"
    },
    {
      title: "CDC Reports on Latest Disease Surveillance Trends",
      description: "Centers for Disease Control provides insights on current disease monitoring and prevention strategies.",
      url: "https://cdc.gov"
    },
    {
      title: "Healthcare Workers Emphasize Importance of Vaccination Programs",
      description: "Medical professionals highlight the critical role of immunization in preventing disease outbreaks.",
      url: "https://who.int/immunization"
    }
  ];

  // 🏥 Health-related keywords para sa filtering
  const healthKeywords = [
    'health', 'medical', 'disease', 'healthcare', 'hospital', 'doctor', 'medicine',
    'treatment', 'vaccine', 'vaccination', 'epidemic', 'pandemic', 'virus', 'bacteria',
    'infection', 'WHO', 'CDC', 'public health', 'clinical', 'patient', 'therapy',
    'diagnosis', 'symptom', 'outbreak', 'prevention', 'wellness', 'nutrition'
  ];

  // 🚫 Keywords to exclude (crypto, business, etc.)
  const excludeKeywords = [
    'crypto', 'bitcoin', 'blockchain', 'trading', 'stock', 'market', 'investment',
    'finance', 'banking', 'economy', 'business', 'company', 'corporate', 'profit',
    'revenue', 'earnings', 'IPO', 'merger', 'acquisition', 'lawsuit', 'court'
  ];

  // 🔍 Function to check if article is health-related
  const isHealthRelated = (article: NewsArticle): boolean => {
    const text = `${article.title} ${article.description}`.toLowerCase();

    // Check if contains health keywords
    const hasHealthKeywords = healthKeywords.some(keyword =>
      text.includes(keyword.toLowerCase())
    );

    // Check if contains excluded keywords
    const hasExcludedKeywords = excludeKeywords.some(keyword =>
      text.includes(keyword.toLowerCase())
    );

    return hasHealthKeywords && !hasExcludedKeywords;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log('🔄 Fetching health news from multiple sources...');

        // 🏥 Try multiple API endpoints for better coverage
        for (let i = 0; i < healthApiUrls.length; i++) {
          try {
            console.log(`📡 Trying API endpoint ${i + 1}...`);
            const result = await fetch(healthApiUrls[i]);
            const json = await result.json();

            console.log(`📊 API ${i + 1} Response:`, json);

            if (json.articles && json.articles.length > 0) {
              // 🏥 Filter articles to only show valid content
              const validArticles = json.articles.filter((article: NewsArticle) =>
                article.title &&
                article.description &&
                article.url &&
                article.title !== '[Removed]' &&
                article.description !== '[Removed]' &&
                !article.title.toLowerCase().includes('removed') &&
                !article.description.toLowerCase().includes('removed')
              );

              console.log(`✅ Valid articles from API ${i + 1}:`, validArticles.length);

              if (validArticles.length > 0) {
                // For health category endpoint, use articles directly
                if (i === 0) {
                  setNews(validArticles.slice(0, 3));
                  setLoading(false);
                  console.log('🏥 Using health category articles:', validArticles.length);
                  return;
                } else {
                  // For search endpoints, apply health filtering
                  const healthArticles = validArticles.filter((article: NewsArticle) =>
                    isHealthRelated(article)
                  );

                  if (healthArticles.length > 0) {
                    setNews(healthArticles.slice(0, 3));
                    setLoading(false);
                    console.log('🏥 Using filtered health articles:', healthArticles.length);
                    return;
                  }
                }
              }
            }
          } catch (apiError) {
            console.error(`❌ Error with API endpoint ${i + 1}:`, apiError);
            continue;
          }
        }

        // If all APIs fail, use fallback health news
        console.log('⚠️ All API endpoints failed, using fallback health news');
        setNews(fallbackHealthNews);
        setLoading(false);

      } catch (error) {
        console.error('❌ Error fetching health news:', error);
        setNews(fallbackHealthNews);
        setLoading(false);
      }
    };
    fetchData();
  }, []); // make sure ni nga effect mag run once lang sa mount

  return (
    <div className="w-full h-full">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-[#EB5B00] to-[#ff6b1a] rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#143D60]">Health News</h3>
            <p className="text-sm text-gray-600">Latest health-related updates</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 h-80 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">Loading health news...</p>
              </div>
            </div>
          ) : news.length > 0 ? (
            <div className="space-y-4">
              {news.map((article, index) => (
                <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <h4 className="text-sm font-bold text-[#143D60] mb-2 line-clamp-2">{article.title}</h4>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{article.description}</p>
                  <Link
                    href={article.url}
                    isExternal
                    className="text-xs text-[#EB5B00] hover:text-[#143D60] font-semibold transition-colors"
                  >
                    Read more →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">No health news available</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <Link
            isExternal
            href="https://newsapi.org/"
            className="text-xs text-gray-500 hover:text-[#143D60] transition-colors"
          >
            Powered by NewsAPI
          </Link>
        </div>
      </div>
    </div>
  );
}
