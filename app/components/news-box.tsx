"use client";

import { Link } from "@heroui/react";
import { useState, useEffect } from "react";

const ApiUrl = `https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=cfa20054a3fe4077a4f572c61fa2a8c4`;

interface NewsArticle {
  title: string;
  description: string;
  url: string;
}

export default function NewsBox() {
  const [news, setNews] = useState<NewsArticle[]>([]); // gamiton array para sa multiple articles

  useEffect(() => {
    const fetchData = async () => {
      const result = await fetch(ApiUrl);
      result.json().then((json) => {
        setNews(json.articles); // store lang ang articles directly sa state
        console.log(json);
      });
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
          {news.length > 0 ? (
            <div className="space-y-4">
              {news.slice(0, 3).map((article, index) => (
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">Loading news...</p>
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
