import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FaNewspaper, FaMapMarkerAlt, FaExternalLinkAlt, FaExclamationCircle, 
  FaShieldAlt, FaSatellite, FaUsers, FaArrowRight, FaTimesCircle 
} from 'react-icons/fa';
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
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [sosStep, setSosStep] = useState(0);

  useEffect(() => {
    const fetchNews = async (lat: number, lon: number) => {
      try {
        const response = await axios.get(`http://localhost:3001/api/disasters/realtime?lat=${lat}&lon=${lon}`);
        const liveNews = response.data.map((item: any) => ({ ...item, isLive: true }));
        setNews(liveNews);
        setLoading(false);
        setError(false);

        const criticalAlert = liveNews.find((n: any) => n.severity === 'Critical');
        if (criticalAlert) {
          toast.error(`BREAKING: ${criticalAlert.title}`, {
            duration: 8000,
            position: 'top-right',
            style: {
              background: '#ef4444',
              color: '#fff',
              fontWeight: 'bold',
              borderRadius: '12px'
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

  const handleProtocolClick = () => {
    setIsSOSActive(true);
    setSosStep(0);
    
    // Animate the SOS protocol steps
    setTimeout(() => setSosStep(1), 1500); // Notifications
    setTimeout(() => setSosStep(2), 3000); // Searching Safe Zone
    setTimeout(() => setSosStep(3), 4500); // Results
  };

  const closeSOS = () => {
    setIsSOSActive(false);
    setSosStep(0);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* SOS OVERLAY MODAL */}
      {isSOSActive && (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4">
           {/* ALARM BACKGROUND PULSE */}
           <div className="absolute inset-0 bg-red-600/5 animate-pulse-slow"></div>
           
           <div className="relative w-full max-w-2xl bg-[#060d1a] border border-red-500/40 rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(239,68,68,0.3)]">
              {/* Header */}
              <div className="bg-red-600 p-6 flex justify-between items-center">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-600 shadow-lg animate-bounce">
                     <FaExclamationCircle className="text-2xl" />
                   </div>
                   <div>
                     <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">Active Emergency Protocol</h2>
                     <p className="text-[10px] text-red-100 font-black tracking-[4px] uppercase opacity-80">Crisis Response Hub — IND.001</p>
                   </div>
                 </div>
                 <button onClick={closeSOS} className="p-2 hover:bg-black/20 rounded-full transition text-white">
                   <FaTimesCircle className="text-2xl" />
                 </button>
              </div>

              {/* Body */}
              <div className="p-10 space-y-8">
                 {/* STEP 1: NOTIFICATIONS */}
                 <div className={`flex items-start gap-6 transition-all duration-500 ${sosStep >= 1 ? 'opacity-100 translate-x-0' : 'opacity-20 -translate-x-4'}`}>
                    <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center shrink-0 border border-blue-500/30">
                       <FaSatellite className={sosStep === 1 ? 'animate-spin' : ''} />
                    </div>
                    <div>
                      <h4 className="font-black text-white uppercase tracking-widest text-sm mb-1">Broadcasting Alerts</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">Notifications being pushed to 14,000+ regional inhabitants and local first responders.</p>
                      {sosStep === 1 && <span className="text-[10px] font-black text-blue-400 animate-pulse mt-2 block">TRANSMITTING...</span>}
                      {sosStep > 1 && <span className="text-[10px] font-black text-emerald-400 mt-2 block">COMPLETED ✓</span>}
                    </div>
                 </div>

                 {/* STEP 2: SEARCHING SAFE ZONE */}
                 <div className={`flex items-start gap-6 transition-all duration-500 ${sosStep >= 2 ? 'opacity-100 translate-x-0' : 'opacity-20 -translate-x-4'}`}>
                    <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center shrink-0 border border-purple-500/30">
                       <FaMapMarkerAlt className={sosStep === 2 ? 'animate-pulse' : ''} />
                    </div>
                    <div>
                      <h4 className="font-black text-white uppercase tracking-widest text-sm mb-1">Neural Safe Zone Scan</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">Cross-referencing topographical data with crowd density to identify optimal safe sectors.</p>
                      {sosStep === 2 && <span className="text-[10px] font-black text-purple-400 animate-pulse mt-2 block">LOCALIZING OPTIMAL SECTOR...</span>}
                      {sosStep > 2 && <span className="text-[10px] font-black text-emerald-400 mt-2 block">FOUND ✓</span>}
                    </div>
                 </div>

                 {/* STEP 3: RESULTS & VOLUNTEERS */}
                 {sosStep >= 3 && (
                   <div className="pt-6 border-t border-white/5 space-y-6 animate-fadeIn">
                       {/* SAFE ZONE SUGGESTION */}
                       <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                          <span className="text-[9px] font-black text-emerald-400 tracking-[3px] uppercase block mb-3">Priority Safe Zone Identified</span>
                          <h3 className="text-xl font-bold text-white mb-2">SECTOR 12 COMMUNAL HUB</h3>
                          <p className="text-slate-400 text-xs mb-4">Located 2.4km from your current location. Reinforced structural integrity and 24h medical supply access.</p>
                          <button className="flex items-center gap-3 bg-emerald-500 text-black px-6 py-3 rounded-xl font-black text-xs uppercase hover:bg-emerald-400 transition transform hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/30">
                            Navigate to Safety <FaArrowRight />
                          </button>
                       </div>

                       {/* VOLUNTEER MESSAGE */}
                       <div className="flex items-center gap-4 bg-slate-900/50 border border-white/10 p-4 rounded-xl">
                          <FaUsers className="text-blue-400 text-2xl animate-pulse" />
                          <div>
                            <p className="text-white font-bold text-xs">Volunteer Shield Force Activated</p>
                            <p className="text-slate-500 text-[10px]">124 Local Volunteers have been alerted and are currently safeguarding evacuation routes.</p>
                          </div>
                          <FaShieldAlt className="ml-auto text-emerald-400" />
                       </div>
                   </div>
                 )}
              </div>

              {/* Footer Banner */}
              <div className="bg-slate-900 border-t border-white/5 p-4 flex items-center justify-center gap-4">
                 <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                 <span className="text-[10px] font-black text-slate-500 tracking-[5px] uppercase">Official Response Protocol V2.1</span>
              </div>
           </div>
        </div>
      )}

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
                  
                  <button 
                    onClick={handleProtocolClick}
                    className="lp-news-action-btn mt-3 group-hover:bg-red-600! group-hover:text-white! group-hover:border-red-400! transition-all duration-300 transform active:scale-95"
                  >
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
