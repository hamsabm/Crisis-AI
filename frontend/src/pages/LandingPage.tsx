import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export function LandingPage() {
  const navigate = useNavigate();
  const onLaunch = () => navigate('/login');
  const [counts, setCounts] = useState({ cnt1: 0, cnt2: 0, cnt3: 0, cnt4: 0 });

  useEffect(() => {
    const animateCount = (target: number, key: string, speed: number) => {
      let current = 0;
      const step = target / (speed / 16);
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setCounts(prev => ({ ...prev, [key]: Math.floor(current) }));
      }, 16);
    };

    setTimeout(() => {
      animateCount(7, 'cnt1', 2000);
      animateCount(142, 'cnt2', 2000);
      animateCount(48600, 'cnt3', 2000);
      animateCount(34, 'cnt4', 2000);
    }, 500);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).style.opacity = '1';
          (e.target as HTMLElement).style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.lp-kpi,.lp-role-card,.lp-ai-feature,.lp-source-card,.lp-notif-card,.lp-cloud-card,.lp-tech-layer').forEach(el => {
      (el as HTMLElement).style.opacity = '0';
      (el as HTMLElement).style.transform = 'translateY(20px)';
      (el as HTMLElement).style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const [simLines, setSimLines] = useState<{t:string; m:string}[]>([
    {t:'info', m:'// Select a scenario and click RUN SIMULATION to begin.'},
    {t:'info', m:'// CRISIS IQ Simulation Engine v2.4.1 — Ready'}
  ]);
  const [simRes, setSimRes] = useState<any>(null);
  const [simType, setSimType] = useState('flood');
  const simOutputRef = useRef<HTMLDivElement>(null);

  const simScenarios: Record<string, any> = {
    flood: {
      lines: [
        {t:'info', m:'[INIT] Loading flood simulation model...'},
        {t:'ok',   m:'[OK] Hydrological model v3.1 loaded'},
        {t:'info', m:'[DATA] Ingesting weather feed: rainfall 80mm/hr'},
        {t:'info', m:'[DATA] Loading terrain elevation map...'},
        {t:'ok',   m:'[OK] Terrain data loaded — 2.4km² flood zone identified'},
        {t:'warn', m:'[WARN] River level at 94% capacity — breach imminent'},
        {t:'info', m:'[AI] Running scenario analysis...'},
        {t:'ok',   m:'[OK] Risk Score: CRITICAL (0.91)'},
        {t:'info', m:'[AI] Computing evacuation routes via Route NH-48, Ring Road...'},
        {t:'ok',   m:'[OK] 3 evacuation routes computed'},
        {t:'warn', m:'[WARN] Zone 4B, 6C require immediate evacuation'},
        {t:'ok',   m:'[OK] Alerts dispatched to 12,400 residents via SMS + App'},
        {t:'ok',   m:'[SIMULATION COMPLETE] ✓ Response plan generated'}
      ],
      sr1:'94%', sr2:'12.4K', sr3:'2.1 hrs', sr4:'48 units'
    },
    fire: {
      lines: [
        {t:'info', m:'[INIT] Loading wildfire behavior model...'},
        {t:'ok',   m:'[OK] Fire spread model loaded'},
        {t:'info', m:'[DATA] Wind: 42km/h NE · Humidity: 18% · Temp: 38°C'},
        {t:'warn', m:'[WARN] Extreme fire weather conditions detected'},
        {t:'info', m:'[AI] Modelling fire perimeter spread...'},
        {t:'err',  m:'[CRITICAL] Projected spread: 6.2km² in 4 hours'},
        {t:'info', m:'[AI] Identifying firebreak coordinates...'},
        {t:'ok',   m:'[OK] Optimal firebreak: 12.9X, 77.5Y'},
        {t:'warn', m:'[WARN] 3 settlements within projected spread zone'},
        {t:'ok',   m:'[OK] Dispatching 6 fire brigades + aerial support'},
        {t:'ok',   m:'[SIMULATION COMPLETE] ✓ Containment plan ready'}
      ],
      sr1:'88%', sr2:'8.7K', sr3:'3.5 hrs', sr4:'72 units'
    },
    earthquake: {
      lines: [
        {t:'info', m:'[INIT] Loading seismic analysis model...'},
        {t:'ok',   m:'[OK] USGS feed connected · Seismograph online'},
        {t:'info', m:'[DATA] Magnitude: 6.0 · Depth: 12km · Epicenter: Zone 7'},
        {t:'warn', m:'[WARN] Aftershock probability: 72% within 48 hours'},
        {t:'info', m:'[AI] Assessing structural damage...'},
        {t:'err',  m:'[CRITICAL] 340 structures in high-risk zone'},
        {t:'info', m:'[AI] Calculating survivor locations...'},
        {t:'ok',   m:'[OK] 7 priority search & rescue zones identified'},
        {t:'warn', m:'[WARN] Tsunami risk: LOW — no coastal threat'},
        {t:'ok',   m:'[OK] NDRF teams dispatched to Zones 7A, 7B, 7C'},
        {t:'ok',   m:'[SIMULATION COMPLETE] ✓ SAR plan activated'}
      ],
      sr1:'82%', sr2:'21K', sr3:'6 hrs', sr4:'120 units'
    },
    cyclone: {
      lines: [
        {t:'info', m:'[INIT] Loading cyclone track model...'},
        {t:'ok',   m:'[OK] IMD satellite feed connected'},
        {t:'info', m:'[DATA] Category 2 · Wind: 155km/h · ETA: 14 hours'},
        {t:'info', m:'[AI] Modelling storm surge on coastal zones...'},
        {t:'warn', m:'[WARN] 3.2m storm surge expected in coastal areas'},
        {t:'err',  m:'[CRITICAL] 4 low-lying settlements require evacuation'},
        {t:'info', m:'[AI] Plotting evacuation corridors inland...'},
        {t:'ok',   m:'[OK] 5 evacuation corridors identified'},
        {t:'ok',   m:'[OK] Pre-positioning relief camps at Zones A3, B1, C2'},
        {t:'warn', m:'[WARN] Landfall in 14 hours — begin evacuation NOW'},
        {t:'ok',   m:'[SIMULATION COMPLETE] ✓ Cyclone response plan ready'}
      ],
      sr1:'96%', sr2:'35K', sr3:'8 hrs', sr4:'200 units'
    }
  };

  const runSimulation = () => {
    setSimLines([]);
    setSimRes(null);
    const scenario = simScenarios[simType];
    let delay = 0;
    
    scenario.lines.forEach((line: any) => {
      setTimeout(() => {
        setSimLines(prev => {
          const newLines = [...prev, line];
          setTimeout(() => {
            if (simOutputRef.current) {
              simOutputRef.current.scrollTop = simOutputRef.current.scrollHeight;
            }
          }, 10);
          return newLines;
        });
      }, delay);
      delay += 180 + Math.random() * 100;
    });

    setTimeout(() => {
      setSimRes({ sr1: scenario.sr1, sr2: scenario.sr2, sr3: scenario.sr3, sr4: scenario.sr4 });
    }, delay + 200);
  };

  const clearSim = () => {
    setSimLines([
      {t:'info', m:'// Select a scenario and click RUN SIMULATION to begin.'},
      {t:'info', m:'// CRISIS IQ Simulation Engine v2.4.1 — Ready'}
    ]);
    setSimRes(null);
  };

  const [activeAlertMsg, setActiveAlertMsg] = useState<string | null>(null);

  const showAlert = (msg: string) => {
    setActiveAlertMsg(msg);
  };

  const renderAlertBox = () => {
    if (!activeAlertMsg) return null;
    const lines = activeAlertMsg.split('\n');
    return (
      <div className="lp-alert-overlay" onClick={() => setActiveAlertMsg(null)}>
        <div className="lp-alert-box" onClick={e => e.stopPropagation()}>
          <div className="lp-alert-header">⚠ AI INCIDENT REPORT</div>
          {lines.map((l, i) => {
            const parts = l.split('—');
            const k = parts.shift() || '';
            const v = parts;
            return (
              <div key={i} className="lp-alert-line">
                <span className="lp-alert-key">{k.trim()}</span>
                {v.length > 0 && <span className="lp-alert-val"> — {v.join('—')}</span>}
              </div>
            );
          })}
          <button className="lp-alert-btn" onClick={() => setActiveAlertMsg(null)}>ACKNOWLEDGE</button>
        </div>
      </div>
    );
  };

  return (
    <div className="landing-page">
      {renderAlertBox()}
      <div className="lp-grid-bg"></div>

      <nav className="lp-nav">
        <div className="lp-nav-logo">
          <div className="lp-logo-dot"></div>CRISIS<span style={{marginLeft: '4px'}}>IQ</span>
        </div>
        <ul className="lp-nav-links">
          <li><a onClick={() => document.getElementById('dashboard')?.scrollIntoView({behavior:'smooth'})}>Dashboard</a></li>
          <li><a onClick={() => document.getElementById('ai-engine')?.scrollIntoView({behavior:'smooth'})}>AI Engine</a></li>
          <li><a onClick={() => document.getElementById('roles')?.scrollIntoView({behavior:'smooth'})}>Roles</a></li>
          <li><a onClick={() => document.getElementById('simulation')?.scrollIntoView({behavior:'smooth'})}>Simulation</a></li>
          <li><a onClick={() => document.getElementById('tech')?.scrollIntoView({behavior:'smooth'})}>Architecture</a></li>
        </ul>
        <div className="lp-nav-right">
          <div className="lp-alert-badge">⚠ 3 ACTIVE ALERTS</div>
          <button className="lp-btn-nav" onClick={onLaunch}>Launch Dashboard</button>
        </div>
      </nav>

      <section id="hero" className="lp-hero">
        <div className="lp-hero-bg-orbs">
          <div className="lp-orb lp-orb1"></div>
          <div className="lp-orb lp-orb2"></div>
          <div className="lp-orb lp-orb3"></div>
        </div>
        <div style={{position:'relative', zIndex: 1}}>
          <div className="lp-hero-label"><span className="lp-blink">●</span> SYSTEM ONLINE — ALL SENSORS ACTIVE</div>
          <h1 className="lp-hero-title">
            <div className="lp-fade-in">CRISIS</div>
            <div className="line2 lp-fade-in lp-delay-1">IQ</div>
            <div className="line3 lp-fade-in lp-delay-2">AI-POWERED DISASTER RESPONSE</div>
          </h1>
          <p className="lp-hero-sub lp-fade-in lp-delay-3">Real-time disaster intelligence powered by AI. Monitor threats, coordinate responders, and protect communities — from a single command center.</p>
          <div className="lp-hero-ctas lp-fade-in lp-delay-4">
            <button className="lp-btn-primary" onClick={onLaunch}>Open Command Center</button>
            <button className="lp-btn-outline" onClick={() => document.getElementById('simulation')?.scrollIntoView({behavior:'smooth'})}>Run Simulation</button>
          </div>
          <div className="lp-hero-stats lp-fade-in lp-delay-4">
            <div className="lp-stat"><div className="lp-stat-num">{counts.cnt1}</div><div className="lp-stat-label">ACTIVE INCIDENTS</div></div>
            <div className="lp-stat"><div className="lp-stat-num">{counts.cnt2}</div><div className="lp-stat-label">RESPONDERS DEPLOYED</div></div>
            <div className="lp-stat"><div className="lp-stat-num">{counts.cnt3.toLocaleString()}</div><div className="lp-stat-label">CITIZENS ALERTED</div></div>
            <div className="lp-stat"><div className="lp-stat-num">{counts.cnt4}</div><div className="lp-stat-label">SAFE ZONES MAPPED</div></div>
          </div>
        </div>
      </section>

      <section id="dashboard" className="lp-section lp-dashboard">
        <div className="lp-section-inner">
          <div className="lp-section-tag">// Live Command Center</div>
          <h2 className="lp-section-title">OPERATIONS DASHBOARD</h2>
          <p className="lp-section-sub">Real-time situational awareness across all active incidents, resource deployments, and AI-generated risk assessments.</p>

          <div className="lp-dash-grid">
            <div className="lp-kpi red"><div className="lp-kpi-icon">🔴</div><div className="lp-kpi-val">7</div><div className="lp-kpi-label">Critical Incidents</div><div className="lp-kpi-change dn">↑ +2 since 6h ago</div></div>
            <div className="lp-kpi cyan"><div className="lp-kpi-icon">🚑</div><div className="lp-kpi-val">142</div><div className="lp-kpi-label">Responders Active</div><div className="lp-kpi-change up">↑ +18 deployed</div></div>
            <div className="lp-kpi green"><div className="lp-kpi-icon">🏥</div><div className="lp-kpi-val">34</div><div className="lp-kpi-label">Safe Zones Open</div><div className="lp-kpi-change up">↑ +4 added</div></div>
            <div className="lp-kpi orange"><div className="lp-kpi-icon">📡</div><div className="lp-kpi-val">98%</div><div className="lp-kpi-label">System Uptime</div><div className="lp-kpi-change up">● All systems nominal</div></div>
          </div>

          <div className="lp-dash-main">
            <div className="lp-panel">
              <div className="lp-panel-title">
                <span><span className="lp-live-dot"></span>LIVE INCIDENT MAP</span>
                <span onClick={onLaunch} style={{color:'var(--cyan)', fontSize:'0.75rem', cursor:'pointer'}}>View Full Map →</span>
              </div>
              <div className="lp-map-mock">
                <div className="lp-map-grid"></div>
                <div className="lp-map-pin lp-pin-red" title="Flood — Critical"></div>
                <div className="lp-map-pin lp-pin-red2" title="Fire — Critical"></div>
                <div className="lp-map-pin lp-pin-orange" title="Earthquake — Warning"></div>
                <div className="lp-map-pin lp-pin-green" title="Safe Zone"></div>
                <div className="lp-map-pin lp-pin-green2" title="Hospital"></div>
                <div className="lp-map-pin lp-pin-blue" title="Evacuation Point"></div>
                <div className="lp-map-legend">
                  <div className="lp-legend-item"><div className="lp-legend-dot" style={{background:'var(--red)'}}></div>Danger</div>
                  <div className="lp-legend-item"><div className="lp-legend-dot" style={{background:'var(--orange)'}}></div>Warning</div>
                  <div className="lp-legend-item"><div className="lp-legend-dot" style={{background:'var(--green)'}}></div>Safe</div>
                  <div className="lp-legend-item"><div className="lp-legend-dot" style={{background:'var(--blue)'}}></div>Evacuation</div>
                </div>
              </div>
            </div>

            <div className="lp-panel">
              <div className="lp-panel-title"><span><span className="lp-live-dot"></span>ACTIVE ALERTS</span></div>
              <div className="lp-alert-list">
                <div className="lp-alert-item critical" onClick={() => showAlert('Flood Warning — Zone 4B\nSeverity: CRITICAL\nAffected population: ~12,400\nAI Recommendation: Immediate evacuation via Route NH-48\nSurvival Probability: 94% if evacuated within 2 hours')}>
                  <div className="lp-alert-icon">🌊</div>
                  <div className="lp-alert-body">
                    <div className="lp-alert-name">Flood — Zone 4B</div>
                    <div className="lp-alert-meta">2 min ago · 12,400 affected</div>
                  </div>
                  <div className="lp-alert-badge-sm lp-badge-critical">CRITICAL</div>
                </div>
                <div className="lp-alert-item critical" onClick={() => showAlert('Forest Fire — Sector 12\nSeverity: CRITICAL\nWind speed: 42 km/h NE\nAI Recommendation: Deploy 3 fire brigades, establish firebreak at coordinate 12.9X, 77.5Y\nEvacuation route: Highway 7 South')}>
                  <div className="lp-alert-icon">🔥</div>
                  <div className="lp-alert-body">
                    <div className="lp-alert-name">Forest Fire — Sector 12</div>
                    <div className="lp-alert-meta">14 min ago · Wind: 42km/h NE</div>
                  </div>
                  <div className="lp-alert-badge-sm lp-badge-critical">CRITICAL</div>
                </div>
                <div className="lp-alert-item warning" onClick={() => showAlert('Earthquake — Magnitude 4.2\nDepth: 10km\nSeverity: WARNING\nAI Recommendation: Inspect Zone 7 structures, alert emergency services\nAfterstock probability: 60% within 24h')}>
                  <div className="lp-alert-icon">⚡</div>
                  <div className="lp-alert-body">
                    <div className="lp-alert-name">Earthquake M4.2</div>
                    <div className="lp-alert-meta">1 hr ago · Depth 10km</div>
                  </div>
                  <div className="lp-alert-badge-sm lp-badge-warning">WARNING</div>
                </div>
                <div className="lp-alert-item info">
                  <div className="lp-alert-icon">🌀</div>
                  <div className="lp-alert-body">
                    <div className="lp-alert-name">Cyclone Watch — Coast</div>
                    <div className="lp-alert-meta">4 hr ago · Category 1 forming</div>
                  </div>
                  <div className="lp-alert-badge-sm lp-badge-info">WATCH</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="roles" className="lp-section lp-roles">
        <div className="lp-section-inner">
          <div className="lp-section-tag">// Users & Access Control</div>
          <h2 className="lp-section-title">USER ROLES</h2>
          <p className="lp-section-sub">CRISIS IQ serves three distinct user types, each with tailored dashboards, capabilities, and data access.</p>
          <div className="lp-roles-grid">
            <div className="lp-role-card citizen">
              <div className="lp-role-icon">👤</div>
              <div className="lp-role-name">CITIZEN</div>
              <div className="lp-role-desc">Civilians affected by or near disaster zones. Access personal safety tools, real-time maps, and emergency guidance.</div>
              <div className="lp-role-caps">
                <div className="lp-role-cap">Report incidents in real-time</div>
                <div className="lp-role-cap">Receive AI-generated safe advice</div>
                <div className="lp-role-cap">View live evacuation maps</div>
                <div className="lp-role-cap">Get nearest hospital / safe zone</div>
              </div>
            </div>
            <div className="lp-role-card responder">
              <div className="lp-role-icon">🚒</div>
              <div className="lp-role-name">RESPONDER</div>
              <div className="lp-role-desc">Field personnel including fire, medical, police, and rescue teams. Coordinate with AI-powered dispatch and resource management.</div>
              <div className="lp-role-caps">
                <div className="lp-role-cap">Manage rescue operations</div>
                <div className="lp-role-cap">Coordinate team dispatch</div>
                <div className="lp-role-cap">Access AI resource recommendations</div>
                <div className="lp-role-cap">Update incident status in real-time</div>
              </div>
            </div>
            <div className="lp-role-card admin">
              <div className="lp-role-icon">🏛️</div>
              <div className="lp-role-name">ADMIN</div>
              <div className="lp-role-desc">Government and agency administrators overseeing multi-region operations with full system access and analytics control.</div>
              <div className="lp-role-caps">
                <div className="lp-role-cap">Monitor all active incidents</div>
                <div className="lp-role-cap">Issue mass public alerts</div>
                <div className="lp-role-cap">Access full analytics suite</div>
                <div className="lp-role-cap">Configure AI thresholds</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="ai-engine" className="lp-section lp-ai-engine">
        <div className="lp-section-inner">
          <div className="lp-section-tag">// Core Intelligence</div>
          <h2 className="lp-section-title">AI DECISION ENGINE</h2>
          <p className="lp-section-sub">The cognitive core of CRISIS IQ — processing real-time data streams to generate actionable intelligence, survival probabilities, and evacuation routes.</p>
          <div className="lp-ai-grid">
            <div className="lp-ai-visual">
              <div style={{textAlign:'center'}}>
                <div className="lp-ai-core">🧠<div className="lp-ai-orbit"><div className="lp-ai-orbit-dot"></div></div></div>
              </div>
              <div className="lp-ai-capabilities">
                <div className="lp-ai-cap"><div className="lp-ai-cap-dot" style={{background:'var(--red)'}}></div>Risk Assessment</div>
                <div className="lp-ai-cap"><div className="lp-ai-cap-dot" style={{background:'var(--orange)'}}></div>Impact Prediction</div>
                <div className="lp-ai-cap"><div className="lp-ai-cap-dot" style={{background:'var(--cyan)'}}></div>Resource Needs</div>
                <div className="lp-ai-cap"><div className="lp-ai-cap-dot" style={{background:'var(--green)'}}></div>Survival Probability</div>
                <div className="lp-ai-cap"><div className="lp-ai-cap-dot" style={{background:'var(--blue)'}}></div>Smart Recommendations</div>
                <div className="lp-ai-cap"><div className="lp-ai-cap-dot" style={{background:'var(--yellow)'}}></div>Evacuation Routes</div>
              </div>
              <div className="lp-ai-models">⚡ Powered by OpenAI GPT · Google Gemini · Custom ML Models</div>
            </div>
            <div className="lp-ai-content">
              <div className="lp-ai-feature"><div className="lp-ai-feature-icon">🎯</div><div><h4>Scenario Analysis</h4><p>Ingest live sensor data, weather APIs, and satellite feeds to model disaster scenarios in real-time. Predicts spread patterns with 91% accuracy.</p></div></div>
              <div className="lp-ai-feature"><div className="lp-ai-feature-icon">📊</div><div><h4>Decision Intelligence</h4><p>AI computes survival probability for affected zones, ranks evacuation options, and recommends optimal resource allocation within seconds.</p></div></div>
              <div className="lp-ai-feature"><div className="lp-ai-feature-icon">🗺️</div><div><h4>Dynamic Evacuation Routing</h4><p>Integrates Google Maps and Mapbox APIs to compute live evacuation routes that adapt to road conditions, crowd density, and hazard zones.</p></div></div>
              <div className="lp-ai-feature"><div className="lp-ai-feature-icon">⚡</div><div><h4>Real-Time Inference</h4><p>Sub-500ms inference pipeline using Redis caching and edge compute. Results stream directly to all connected clients via WebSocket.</p></div></div>
            </div>
          </div>
        </div>
      </section>

      <section id="data-sources" className="lp-section lp-data-sources">
        <div className="lp-section-inner">
          <div className="lp-section-tag">// External Integrations</div>
          <h2 className="lp-section-title">DATA SOURCES</h2>
          <p className="lp-section-sub">CRISIS IQ ingests real-time data from multiple authoritative sources to build a comprehensive operational picture.</p>
          <div className="lp-sources-grid">
            <div className="lp-source-card"><div className="lp-source-icon-wrap lp-src-weather">⛅</div>
              <div className="lp-source-body"><h4>Weather API</h4><p>Live meteorological data including rainfall, wind speed, temperature, and severe weather warnings updated every 5 minutes.</p>
                <div className="lp-source-tags"><span className="lp-tag">OpenWeather</span><span className="lp-tag">IMD</span><span className="lp-tag">NOAA</span></div>
              </div>
            </div>
            <div className="lp-source-card"><div className="lp-source-icon-wrap lp-src-disaster">⚠️</div>
              <div className="lp-source-body"><h4>Disaster Alerts</h4><p>Official seismic, flood, and geological event feeds from national and global disaster monitoring agencies.</p>
                <div className="lp-source-tags"><span className="lp-tag">USGS</span><span className="lp-tag">GDACS</span><span className="lp-tag">Govt Feeds</span></div>
              </div>
            </div>
            <div className="lp-source-card"><div className="lp-source-icon-wrap lp-src-location">📍</div>
              <div className="lp-source-body"><h4>Location Services</h4><p>GPS tracking, geocoding, and routing services for responders and evacuation route generation.</p>
                <div className="lp-source-tags"><span className="lp-tag">GPS</span><span className="lp-tag">Geocoding</span><span className="lp-tag">Routing API</span></div>
              </div>
            </div>
            <div className="lp-source-card"><div className="lp-source-icon-wrap lp-src-satellite">🛰️</div>
              <div className="lp-source-body"><h4>Satellite & IoT</h4><p>High-resolution satellite imagery and IoT sensor networks for flood depth, fire perimeter, and earthquake aftershock monitoring.</p>
                <div className="lp-source-tags"><span className="lp-tag">Live Sensors</span><span className="lp-tag">Flood</span><span className="lp-tag">Fire</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="notifications" className="lp-section lp-notifications">
        <div className="lp-section-inner">
          <div className="lp-section-tag">// Alert Delivery</div>
          <h2 className="lp-section-title">NOTIFICATION SYSTEM</h2>
          <p className="lp-section-sub">Multi-channel alert delivery ensures citizens and responders receive critical information instantly, regardless of connectivity.</p>
          <div className="lp-notif-grid">
            <div className="lp-notif-card"><div className="lp-notif-icon">📱</div><div className="lp-notif-name">In-App Alerts</div><div className="lp-notif-desc">Real-time push notifications within the CRISIS IQ mobile and web app with severity indicators and action prompts.</div><div className="lp-notif-status"><span className="lp-live-dot"></span> Active · avg 0.2s delivery</div></div>
            <div className="lp-notif-card"><div className="lp-notif-icon">🔔</div><div className="lp-notif-name">Push Notifications</div><div className="lp-notif-desc">Background alerts delivered to mobile devices even when the app is closed, using Firebase Cloud Messaging.</div><div className="lp-notif-status"><span className="lp-live-dot"></span> Active · FCM enabled</div></div>
            <div className="lp-notif-card"><div className="lp-notif-icon">📩</div><div className="lp-notif-name">SMS / Email</div><div className="lp-notif-desc">Failsafe SMS and email alerts for areas with limited internet. Powered by Twilio for reliable global delivery.</div><div className="lp-notif-status"><span className="lp-live-dot"></span> Active · Twilio integrated</div></div>
          </div>
        </div>
      </section>

      <section id="simulation" className="lp-section lp-simulation">
        <div className="lp-section-inner">
          <div className="lp-section-tag">// Scenario Planning</div>
          <h2 className="lp-section-title">DISASTER SIMULATION</h2>
          <p className="lp-section-sub">Test response plans, validate AI recommendations, and train responders against simulated disaster scenarios.</p>
          <div className="lp-sim-container">
            <div className="lp-sim-controls">
              <select className="lp-sim-select" value={simType} onChange={e => setSimType(e.target.value)}>
                <option value="flood">🌊 Flood — Category 3</option>
                <option value="fire">🔥 Forest Fire</option>
                <option value="earthquake">⚡ Earthquake M6.0</option>
                <option value="cyclone">🌀 Cyclone — Category 2</option>
              </select>
              <button className="lp-btn-sim-run" onClick={runSimulation}>▶ RUN SIMULATION</button>
              <button className="lp-btn-sim" onClick={clearSim}>✕ CLEAR</button>
            </div>
            <div className="lp-sim-output" ref={simOutputRef}>
              {simLines.map((line, i) => (
                <div key={i} className={`lp-sim-line ${line.t}`}>{line.m}</div>
              ))}
            </div>
            {simRes && (
              <div className="lp-sim-results">
                <div className="lp-sim-result"><div className="lp-sim-result-val" style={{color:'var(--cyan)'}}>{simRes.sr1}</div><div className="lp-sim-result-label">Survival Rate</div></div>
                <div className="lp-sim-result"><div className="lp-sim-result-val" style={{color:'var(--red)'}}>{simRes.sr2}</div><div className="lp-sim-result-label">Pop. at Risk</div></div>
                <div className="lp-sim-result"><div className="lp-sim-result-val" style={{color:'var(--green)'}}>{simRes.sr3}</div><div className="lp-sim-result-label">Evac. Time</div></div>
                <div className="lp-sim-result"><div className="lp-sim-result-val" style={{color:'var(--orange)'}}>{simRes.sr4}</div><div className="lp-sim-result-label">Resources Req.</div></div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="tech" className="lp-section lp-tech">
        <div className="lp-section-inner">
          <div className="lp-section-tag">// System Architecture</div>
          <h2 className="lp-section-title">TECH STACK</h2>
          <p className="lp-section-sub">Built on a modern, scalable, cloud-native architecture designed for zero-downtime operation during peak crisis events.</p>
          <div className="lp-tech-layers">
            <div className="lp-tech-layer"><div className="lp-tech-layer-name">Frontend</div><div className="lp-tech-items"><span className="lp-tech-pill">React</span><span className="lp-tech-pill">Tailwind CSS</span><span className="lp-tech-pill">WebSocket</span><span className="lp-tech-pill">Leaflet Maps</span></div></div>
            <div className="lp-tech-layer"><div className="lp-tech-layer-name">Backend</div><div className="lp-tech-items"><span className="lp-tech-pill">Node.js</span><span className="lp-tech-pill">Appwrite</span><span className="lp-tech-pill">RESTful API</span><span className="lp-tech-pill">Auth & RBAC</span></div></div>
            <div className="lp-tech-layer"><div className="lp-tech-layer-name">AI Layer</div><div className="lp-tech-items"><span className="lp-tech-pill">OpenAI GPT</span><span className="lp-tech-pill">Google Gemini</span><span className="lp-tech-pill">Scenario Analysis</span></div></div>
          </div>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-flow-bar">
            <strong style={{color:'var(--cyan)'}}>END-TO-END FLOW:</strong>
            <span>User Input</span> → <span>API Gateway</span> → <span>AI Engine + External Data</span> → <span>Decision + Map</span> → <span>Real-time Alert</span>
          </div>
          <div className="lp-footer-top">
            <div className="lp-footer-brand">
              <div className="lp-nav-logo"><div className="lp-logo-dot"></div>CRISIS<span style={{marginLeft:'4px'}}>IQ</span></div>
              <p>AI-powered disaster response infrastructure for governments, agencies, and emergency services worldwide.</p>
            </div>
            <div className="lp-footer-col">
              <h5>Platform</h5>
              <ul><li><a href="#dashboard">Dashboard</a></li><li><a href="#ai-engine">AI Engine</a></li><li><a href="#simulation">Simulation</a></li></ul>
            </div>
            <div className="lp-footer-col">
              <h5>Architecture</h5>
              <ul><li><a href="#tech">Tech Stack</a></li><li><a href="#cloud">Cloud & DevOps</a></li><li><a href="#data-sources">Data Sources</a></li></ul>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <span>© 2026 CRISIS IQ — AI-Powered Disaster Response System</span>
            <span style={{fontFamily:"'JetBrains Mono',monospace", color:'var(--cyan)'}}>v2.4.1 · All systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
