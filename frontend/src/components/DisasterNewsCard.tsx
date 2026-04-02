import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaNewspaper, FaMapMarkerAlt, FaExternalLinkAlt, FaClock, FaExclamationCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

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
    title: "Brahmaputra Basin Alert: Multiple Flooding Breakdown in Assam",
    description: "Water levels critically breached danger marks. NDMA issued high-priority evacuation warnings.",
    severity: "Critical",
    type: "Flood",
    location: "Assam, India",
    date: "Awaiting Stream...",
    isLive: false
  },
  {
    title: "Cyclone Watch: Coastal Odisha Storm Probability at 74%",
    description: "Met department monitors severe weather formation in Bay of Bengal. Relief teams pre-positioning.",
    severity: "Warning",
    type: "Cyclone",
    location: "Odisha, India",
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

        // PRODUCTION POP-UP LOGIC: Alert only on Critical news
        const criticalAlert = liveNews.find((n: any) => n.severity === 'Critical');
        if (criticalAlert) {
          toast.error(`BREAKING: ${criticalAlert.title}`, {
            duration: 8000,
            position: 'top-right',
            style: {
              background: '#ef4444',
              color: '#fff',
              fontWeight: 'bold',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 20px 40px rgba(239, 68, 68, 0.4)'
            },
            icon: <FaExclamationCircle />
          });
        }
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
        fetchNews(28.6139, 77.2090);
      });
    } else {
      fetchNews(28.6139, 77.2090);
    }
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* GLOBAL PRODUCTION TICKER */}
      <div className="lp-ticker-wrapper bg-red-600/10 border-y border-red-500/20 py-2 overflow-hidden whitespace-nowrap mb-4">
        <div className="lp-ticker-content animate-marquee inline-block text-[10px] font-black tracking-widest text-red-500!">
           {news.length > 0 ? news.map(n => ` [ BREAKING: ${n.title.toUpperCase()} ] • `).join("") : " [ INITIALIZING GLOBAL DISASTER STREAM... ] "}
        </div>
      </div>

      <div className="lp-news-card lp-fade-in shadow-[0_0_80px_rgba(239,68,68,0.15)] ring-1 ring-white/10">
        <div className="lp-news-header">
          <FaNewspaper className="lp-news-icon text-red-500!" />
          <div>
            <h3 className="font-black">LIVE REAL-TIME DATA (IND)</h3>
            <p className="opacity-60">India Regional Neural Matrix</p>
          </div>
          <div className={`lp-news-live-tag ${error ? 'bg-orange-600/20! text-orange-400!' : 'bg-red-600/20! text-red-400! animate-pulse'}`}>
            {error ? 'OFFLINE MODE' : 'SYSTEM LIVE'}
          </div>
        </div>

        <div className="lp-news-content">
          {loading ? (
            <div className="lp-news-loading">
              <div className="lp-news-spinner"></div>
              <p className="font-black text-[10px] tracking-widest">CONNECTING TO SATELLITE UPLINK...</p>
            </div>
          ) : (
            <div className="lp-news-list">
              {news.map((item, index) => (
                <div key={index} className={`lp-news-item ${item.severity.toLowerCase()} relative overflow-hidden group border border-white/5! hover:border-red-500/30! transition-all duration-300`}>
                  {item.severity === 'Critical' && (
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 text-[8px] font-black bg-red-600 text-white border border-red-400/30 px-2 py-0.5 rounded-full z-10 shadow-lg">
                      <FaExclamationCircle className="animate-pulse" /> URGENT
                    </div>
                  )}
                  
                  <div className="lp-news-item-top flex justify-between items-center pr-16">
                    <span className="lp-news-tag text-red-500! font-black">{item.type}</span>
                    <span className="lp-news-date opacity-50 font-mono text-[9px]">{item.date === "Awaiting Stream..." ? new Date().toLocaleDateString() : item.date}</span>
                  </div>
                  <h4 className="text-sm font-bold tracking-tight mb-1 group-hover:text-red-400 transition-colors uppercase">{item.title}</h4>
                  <p className="lp-news-loc text-cyan-400! font-black text-[10px] mb-2 flex items-center gap-1">
                    <FaMapMarkerAlt /> {item.location.toUpperCase()}
                  </p>
                  <p className="lp-news-desc text-xs text-slate-400 leading-relaxed group-hover:text-slate-200 transition-colors">{item.description}</p>
                  
                  <button className="lp-news-action-btn mt-3 group-hover:bg-red-600! group-hover:text-white! group-hover:border-red-400! transition-all duration-300 transform active:scale-95">
                    INITIALIZE PRE-ACTION PROTOCOL <FaExternalLinkAlt />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="lp-news-footer border-t border-white/5! py-3 text-[9px] font-black text-slate-500! tracking-[4px] uppercase text-center mt-2">
            Regional Analysis Hub — Alpha Section (IND)
        </div>
      </div>
    </div>
  );
}
