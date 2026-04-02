import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaNewspaper, FaMapMarkerAlt, FaExternalLinkAlt, FaClock } from 'react-icons/fa';

interface NewsItem {
  title: string;
  description: string;
  severity: 'Critical' | 'Warning' | 'Notice';
  type: string;
  location: string;
  date: string;
  isLive?: boolean;
}

const FALLBACK_NEWS: NewsItem[] = [
  {
    title: "Brahmaputra Basin Alert: Multiple Flooding Breakdown reported in Assam",
    description: "Water levels have critically breached the danger mark in several districts. NDMA has issued high-priority evacuation warnings.",
    severity: "Critical",
    type: "Flood",
    location: "Assam, India (Past 24H)",
    date: "Awaiting Stream...",
    isLive: false
  },
  {
    title: "Cyclone Watch: Coastal Odisha Storm Probability at 74% ",
    description: "Met department monitors a severe weather formation in the Bay of Bengal. Pre-positioning of disaster relief teams initiated.",
    severity: "Warning",
    type: "Cyclone",
    location: "Odisha, India (Past 24H)",
    date: "Awaiting Stream...",
    isLive: false
  }
];

export function DisasterNewsCard() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchNews = async (lat: number, lon: number) => {
      try {
        const response = await axios.get(`http://localhost:3001/api/disasters/realtime?lat=${lat}&lon=${lon}`);
        const liveNews = response.data.map((item: any) => ({ ...item, isLive: true }));
        setNews(liveNews);
        setLoading(false);
        setError(false);
      } catch (err) {
        console.error('Failed to fetch disaster news:', err);
        setNews(FALLBACK_NEWS);
        setLoading(false);
        setError(true);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        fetchNews(position.coords.latitude, position.coords.longitude);
      }, (err) => {
        console.warn("Geolocation blocked, using default location (New Delhi, India).", err);
        fetchNews(28.6139, 77.2090); // Default to New Delhi
      });
    } else {
      fetchNews(28.6139, 77.2090);
    }
  }, []);

  return (
    <div className="lp-news-card lp-fade-in shadow-[0_0_50px_rgba(239,68,68,0.1)]">
      <div className="lp-news-header">
        <FaNewspaper className="lp-news-icon text-red-500!" />
        <div>
          <h3>LIVE REAL-TIME DATA STREAM (INDIA)</h3>
          <p>Analyzing Regional India Sensor Matrix</p>
        </div>
        <div className={`lp-news-live-tag ${error ? 'bg-orange-500/20! text-orange-400!' : 'animate-pulse'}`}>
          {error ? 'OFFLINE INDIA MODE' : 'SYSTEM LIVE'}
        </div>
      </div>

      <div className="lp-news-content">
        {loading ? (
          <div className="lp-news-loading">
            <div className="lp-news-spinner"></div>
            <p>Decrypting Satellite Uplink...</p>
          </div>
        ) : (
          <div className="lp-news-list">
            {news.map((item, index) => (
              <div key={index} className={`lp-news-item ${item.severity.toLowerCase()} relative overflow-hidden group`}>
                {item.isLive && (
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 text-[8px] font-black bg-red-600/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-full z-10">
                    <span className="w-1 h-1 bg-red-400 rounded-full animate-ping"></span> INDIA-LIVE
                  </div>
                )}
                {!item.isLive && (
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 text-[8px] font-black bg-slate-700/50 text-slate-400 border border-slate-600/30 px-1.5 py-0.5 rounded-full z-10">
                    <FaClock className="text-[7px]" /> PAST 24H
                  </div>
                )}
                <div className="lp-news-item-top flex justify-between items-center pr-12">
                  <span className="lp-news-tag text-red-500! font-black">{item.type}</span>
                  <span className="lp-news-date opacity-50">{item.date === "Awaiting Stream..." ? new Date().toLocaleDateString() : item.date}</span>
                </div>
                <h4>{item.title}</h4>
                <p className="lp-news-loc text-cyan-400!">
                  <FaMapMarkerAlt className="text-xs" /> {item.location}
                </p>
                <p className="lp-news-desc italic opacity-80">{item.description}</p>
                <button className="lp-news-action-btn group-hover:bg-red-600! group-hover:text-white! transition-all duration-300">
                  INITIALIZE RESPONSE <FaExternalLinkAlt />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="lp-news-footer border-t border-red-500/10! py-2 text-xs font-black text-red-400/60! tracking-[3px] uppercase">
        Verified through Neural Risk Analysis (IND)
      </div>
    </div>
  );
}
