import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaExclamationTriangle, FaNewspaper, FaMapMarkerAlt, FaExternalLinkAlt } from 'react-icons/fa';

interface NewsItem {
  title: string;
  description: string;
  severity: 'Critical' | 'Warning' | 'Notice';
  type: string;
  location: string;
  date: string;
}

export function DisasterNewsCard() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async (lat: number, lon: number) => {
      try {
        const response = await axios.get(`http://localhost:3001/api/disasters/realtime?lat=${lat}&lon=${lon}`);
        setNews(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch disaster news:', err);
        setError('Real-time data stream currently unavailable.');
        setLoading(false);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        fetchNews(position.coords.latitude, position.coords.longitude);
      }, (err) => {
        console.warn("Geolocation blocked, using default location (New York).", err);
        fetchNews(40.7128, -74.0060); // Default fallback
      });
    } else {
      fetchNews(40.7128, -74.0060);
    }
  }, []);

  return (
    <div className="lp-news-card lp-fade-in">
      <div className="lp-news-header">
        <FaNewspaper className="lp-news-icon" />
        <div>
          <h3>REGIONAL INSIGHTS</h3>
          <p>Powered by Gemini 1.5 Pro</p>
        </div>
        <div className="lp-news-live-tag">LIVE</div>
      </div>

      <div className="lp-news-content">
        {loading ? (
          <div className="lp-news-loading">
            <div className="lp-news-spinner"></div>
            <p>Analyzing satellite feeds...</p>
          </div>
        ) : error ? (
          <div className="lp-news-error">
            <FaExclamationTriangle />
            <p>{error}</p>
          </div>
        ) : (
          <div className="lp-news-list">
            {news.map((item, index) => (
              <div key={index} className={`lp-news-item ${item.severity.toLowerCase()}`}>
                <div className="lp-news-item-top">
                  <span className="lp-news-tag">{item.type}</span>
                  <span className="lp-news-date">{item.date}</span>
                </div>
                <h4>{item.title}</h4>
                <p className="lp-news-loc">
                  <FaMapMarkerAlt /> {item.location}
                </p>
                <p className="lp-news-desc">{item.description}</p>
                <button className="lp-news-action-btn">
                  ACT NOW <FaExternalLinkAlt />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="lp-news-footer">
        Verified through Neural Risk Analysis
      </div>
    </div>
  );
}
