import { useEffect, useRef, useState } from "react";

// ── Trip story — one per zoom level ─────────────────────────────────────────
const ZOOM_LEVELS = [
  {
    id: 0,
    label: "ORBIT",
    sublabel: "ALT · 35,786 KM",
    scale: 1,
    gridOpacity: 0,
    cityOpacity: 0,
    streetOpacity: 0,
    story: {
      question: "Where do you want to go?",
      detail: null,
      sub: "The whole world is waiting.",
      tag: null,
    },
  },
  {
    id: 1,
    label: "CONTINENT",
    sublabel: "ALT · 2,400 KM",
    scale: 3.2,
    gridOpacity: 0.15,
    cityOpacity: 0,
    streetOpacity: 0,
    story: {
      question: "You pick a destination.",
      detail: "Bali, Indonesia",
      sub: "14 Mar → 21 Mar · 7 nights",
      tag: "DESTINATION LOCKED",
    },
  },
  {
    id: 2,
    label: "CITY VIEW",
    sublabel: "ALT · 180 KM",
    scale: 9,
    gridOpacity: 0.55,
    cityOpacity: 1,
    streetOpacity: 0,
    story: {
      question: "We learn your style.",
      detail: "Adventure · Culture · Budget",
      sub: "Mapping your Traveler DNA.",
      
    },
  },
  {
    id: 3,
    label: "DISTRICT",
    sublabel: "ALT · 12 KM",
    scale: 28,
    gridOpacity: 1,
    cityOpacity: 0,
    streetOpacity: 0.7,
    story: {
      question: "Your plan is ready.",
      detail: "Food · Gems · Activities",
      sub: "Built around you",
      tag: "PLAN GENERATED",
    },
  },
  {
    id: 4,
    label: "STREET",
    sublabel: "ALT · 0.3 KM",
    scale: 80,
    gridOpacity: 0,
    cityOpacity: 0,
    streetOpacity: 1,
    story: {
      question: "You're already there.",
      detail: "Enjoy your trip. ✦",
      sub: "SoWeGo handled everything.",
      tag: "BON VOYAGE",
    },
  },
];

const CITIES = [
  { lat: 35.68,  lon: 139.69, name: "TYO" },
  { lat: 40.71,  lon: -74.01, name: "JFK" },
  { lat: 51.51,  lon: -0.13,  name: "LHR" },
  { lat: 25.20,  lon: 55.27,  name: "DXB" },
  { lat: 1.35,   lon: 103.82, name: "SIN" },
  { lat: -33.87, lon: 151.21, name: "SYD" },
  { lat: 19.08,  lon: 72.88,  name: "BOM" },
  { lat: 48.85,  lon: 2.35,   name: "CDG" },
  { lat: 31.23,  lon: 121.47, name: "PVG" },
  { lat: 55.75,  lon: 37.62,  name: "SVO" },
  { lat: 37.57,  lon: 126.98, name: "ICN" },
  { lat: -23.55, lon: -46.63, name: "GRU" },
  { lat: 41.01,  lon: 28.95,  name: "IST" },
  { lat: 40.42,  lon: -3.70,  name: "MAD" },
  { lat: 22.31,  lon: 114.17, name: "HKG" },
  // Bali (destination)
  { lat: -8.34,  lon: 115.09, name: "DPS" },
];

// Routes to animate at city zoom
const ROUTES = [[4,15],[0,15],[2,15],[3,15],[7,15],[13,15]];

function latLonToXY(lat, lon, cx, cy, R, rotDeg) {
  const phi   = (90 - lat)  * (Math.PI / 180);
  const theta = (lon + rotDeg + 180) * (Math.PI / 180);
  const x = -R * Math.sin(phi) * Math.cos(theta);
  const y =  R * Math.cos(phi);
  const z =  R * Math.sin(phi) * Math.sin(theta);
  return { px: cx + x, py: cy - y, z };
}

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }
function easeInOut(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }

function hexPath(ctx, hx, hy, hr) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i - 30);
    i === 0
      ? ctx.moveTo(hx + hr * Math.cos(a), hy + hr * Math.sin(a))
      : ctx.lineTo(hx + hr * Math.cos(a), hy + hr * Math.sin(a));
  }
  ctx.closePath();
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Exo+2:wght@300;400;600&display=swap');

  .ze-wrapper { position: relative; height: 500vh; }

  .ze-sticky {
    position: sticky; top: 0; height: 100vh;
    overflow: hidden; background: #03000f;
    display: flex; align-items: center; justify-content: center;
  }

  .ze-canvas { position: absolute; inset: 0; width: 100%; height: 100%; }

  .ze-hud { position: absolute; inset: 0; pointer-events: none; z-index: 10; }

  /* ── Scanlines ── */
  .ze-scanlines {
    position: absolute; inset: 0;
    background: repeating-linear-gradient(
      0deg, transparent, transparent 3px,
      rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 4px
    );
    pointer-events: none; z-index: 6;
  }

  /* ── Corners ── */
  .ze-corner { position: absolute; width: 44px; height: 44px; }
  .ze-corner.tl { top:20px; left:20px; border-top:1px solid rgba(0,255,200,0.3); border-left:1px solid rgba(0,255,200,0.3); }
  .ze-corner.tr { top:20px; right:20px; border-top:1px solid rgba(0,255,200,0.3); border-right:1px solid rgba(0,255,200,0.3); }
  .ze-corner.bl { bottom:20px; left:20px; border-bottom:1px solid rgba(0,255,200,0.3); border-left:1px solid rgba(0,255,200,0.3); }
  .ze-corner.br { bottom:20px; right:20px; border-bottom:1px solid rgba(0,255,200,0.3); border-right:1px solid rgba(0,255,200,0.3); }

  /* ── Altitude top center ── */
  .ze-altitude {
    position: absolute; top: 28px; left: 50%;
    transform: translateX(-50%); text-align: center;
    display: flex; flex-direction: column; align-items: center; gap: 6px;
  }
  .ze-altitude-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px; letter-spacing: 5px;
    color: rgba(0,255,200,0.35); text-transform: uppercase;
  }
  .ze-altitude-bar {
    width: 100px; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0,255,200,0.4), transparent);
  }
  .ze-altitude-value {
    font-family: 'Orbitron', monospace;
    font-size: 14px; letter-spacing: 4px;
    color: rgba(0,255,200,0.8);
  }

  /* ── Left progress track ── */
  .ze-progress-track {
    position: absolute; left: 32px; top: 50%;
    transform: translateY(-50%);
    display: flex; flex-direction: column; align-items: flex-start;
  }
  .ze-step-row { display: flex; flex-direction: column; align-items: center; }
  .ze-progress-dot {
    width: 9px; height: 9px; border-radius: 50%;
    border: 1px solid rgba(0,255,200,0.2);
    transition: all 0.4s ease; position: relative;
  }
  .ze-progress-dot.active {
    background: #00ffcc; border-color: #00ffcc;
    box-shadow: 0 0 14px rgba(0,255,200,1), 0 0 28px rgba(0,255,200,0.4);
  }
  .ze-progress-dot.done {
    background: rgba(0,255,200,0.3); border-color: rgba(0,255,200,0.5);
  }
  .ze-progress-line {
    width: 1px; height: 28px;
    background: linear-gradient(180deg, rgba(0,255,200,0.3), rgba(0,255,200,0.05));
  }
  .ze-step-label {
    position: absolute; left: 18px; top: -2px;
    font-family: 'Share Tech Mono', monospace;
    font-size: 9px; letter-spacing: 2.5px;
    color: rgba(0,255,200,0.25); white-space: nowrap; text-transform: uppercase;
    transition: color 0.3s;
  }
  .ze-progress-dot.active .ze-step-label { color: rgba(0,255,200,0.75); }

  /* ── STORY CARD — center bottom ── */
  .ze-story {
    position: absolute;
    bottom: 72px; left: 50%;
    transform: translateX(-50%);
    text-align: center;
    display: flex; flex-direction: column; align-items: center; gap: 0;
    width: 100%; max-width: 680px;
    padding: 0 24px;
  }

  /* Tag pill */
  .ze-story-tag {
    font-family: 'Share Tech Mono', monospace;
    font-size: 9px; letter-spacing: 4px;
    color: #00ffcc;
    border: 1px solid rgba(0,255,200,0.35);
    background: rgba(0,255,200,0.07);
    padding: 5px 14px; border-radius: 2px;
    text-transform: uppercase;
    margin-bottom: 18px;
    opacity: 0; transform: translateY(10px);
    transition: opacity 0.5s 0.05s ease, transform 0.5s 0.05s ease;
  }
  .ze-story-tag.show { opacity: 1; transform: translateY(0); }

  /* Big question */
  .ze-story-question {
    font-family: 'Orbitron', monospace;
    font-size: clamp(1.7rem, 3.5vw, 2.8rem);
    font-weight: 700;
    color: #e8fdff;
    letter-spacing: -0.5px;
    line-height: 1.1;
    margin: 0 0 16px;
    text-shadow: 0 0 40px rgba(0,255,200,0.15);
    opacity: 0; transform: translateY(14px);
    transition: opacity 0.55s ease, transform 0.55s ease;
  }
  .ze-story-question.show { opacity: 1; transform: translateY(0); }

  /* Main detail line */
  .ze-story-detail {
    font-family: 'Orbitron', monospace;
    font-size: clamp(1.4rem, 3vw, 2.3rem);
    font-weight: 900;
    letter-spacing: 2px;
    background: linear-gradient(135deg, #00ffcc 0%, #00aaff 50%, #a855f7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 0 16px rgba(0,255,200,0.4));
    margin: 0 0 12px;
    opacity: 0; transform: translateY(10px);
    transition: opacity 0.55s 0.1s ease, transform 0.55s 0.1s ease;
  }
  .ze-story-detail.show { opacity: 1; transform: translateY(0); }

  /* Sub line */
  .ze-story-sub {
    font-family: 'Share Tech Mono', monospace;
    font-size: 13px; letter-spacing: 2.5px;
    color: rgba(0,200,200,0.55);
    text-transform: uppercase;
    opacity: 0; transform: translateY(8px);
    transition: opacity 0.5s 0.18s ease, transform 0.5s 0.18s ease;
  }
  .ze-story-sub.show { opacity: 1; transform: translateY(0); }

  /* Divider line */
  .ze-story-divider {
    width: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0,255,200,0.5), transparent);
    margin: 20px auto;
    transition: width 0.6s 0.05s ease;
  }
  .ze-story-divider.show { width: 200px; }

  /* ── Crosshair ── */
  .ze-crosshair {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 32px; height: 32px;
    pointer-events: none; opacity: 0;
    transition: opacity 0.5s;
  }
  .ze-crosshair.visible { opacity: 1; }
  .ze-crosshair::before, .ze-crosshair::after {
    content: ''; position: absolute; background: rgba(0,255,200,0.55);
  }
  .ze-crosshair::before { width:1px; height:100%; left:50%; top:0; }
  .ze-crosshair::after  { height:1px; width:100%; top:50%; left:0; }

  /* Target ring at city level */
  .ze-target-ring {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 60px; height: 60px; border-radius: 50%;
    border: 1px solid rgba(0,255,200,0.25);
    pointer-events: none; opacity: 0;
    transition: opacity 0.5s;
    animation: ze-ring-spin 6s linear infinite;
  }
  .ze-target-ring.visible { opacity: 1; }
  .ze-target-ring-2 {
    width: 90px; height: 90px;
    border-color: rgba(0,255,200,0.12);
    animation-duration: 10s;
    animation-direction: reverse;
  }
  @keyframes ze-ring-spin {
    from { transform: translate(-50%,-50%) rotate(0deg); }
    to   { transform: translate(-50%,-50%) rotate(360deg); }
  }

  /* ── Scroll hint ── */
  .ze-scroll-hint {
    position: absolute; bottom: 24px; left: 50%;
    transform: translateX(-50%);
    display: flex; flex-direction: column; align-items: center; gap: 6px;
  }
  .ze-scroll-hint span {
    font-family: 'Share Tech Mono', monospace;
    font-size: 8px; letter-spacing: 4px;
    color: rgba(0,255,200,0.3); text-transform: uppercase;
    animation: ze-fadepulse 2.2s ease-in-out infinite;
  }
  .ze-scroll-arrow {
    width: 1px; height: 22px;
    background: linear-gradient(180deg, rgba(0,255,200,0.5), transparent);
    animation: ze-arrowdrop 2.2s ease-in-out infinite;
  }
  @keyframes ze-fadepulse {
    0%,100% { opacity: 0.3; } 50% { opacity: 0.8; }
  }
  @keyframes ze-arrowdrop {
    0%,100% { transform: scaleY(0.5) translateY(-4px); opacity: 0.2; }
    50% { transform: scaleY(1) translateY(0); opacity: 0.8; }
  }
`;

export default function ZoomEarthSection() {
  const wrapperRef  = useRef(null);
  const canvasRef   = useRef(null);
  const animRef     = useRef(null);
  const rotRef      = useRef(20);
  const progressRef = useRef(0);

  const [levelIndex, setLevelIndex]   = useState(0);
  const [rawProgress, setRawProgress] = useState(0);
  const [atEnd, setAtEnd]             = useState(false);
  const [cardVisible, setCardVisible] = useState(false);

  // Trigger card exit/enter animation on level change
  useEffect(() => {
    setCardVisible(false);
    const t = setTimeout(() => setCardVisible(true), 120);
    return () => clearTimeout(t);
  }, [levelIndex]);

  // ── Scroll tracking ─────────────────────────────────────────────────────────
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const onScroll = () => {
      const rect  = wrapper.getBoundingClientRect();
      const total = wrapper.offsetHeight - window.innerHeight;
      const p     = clamp(-rect.top / total, 0, 1);
      progressRef.current = p;
      setRawProgress(p);
      setLevelIndex(clamp(Math.floor(p * ZOOM_LEVELS.length), 0, ZOOM_LEVELS.length - 1));
      setAtEnd(p > 0.88);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Canvas draw loop ────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function draw(ts) {
      const p  = progressRef.current;
      const W  = canvas.width;
      const H  = canvas.height;
      const cx = W / 2;
      const cy = H / 2;

      const n      = ZOOM_LEVELS.length;
      const scaled = p * (n - 1);
      const fi     = clamp(Math.floor(scaled), 0, n - 2);
      const t      = easeInOut(scaled - fi);
      const fromL  = ZOOM_LEVELS[fi];
      const toL    = ZOOM_LEVELS[fi + 1];

      const scale       = lerp(fromL.scale,       toL.scale,       t);
      const gridAlpha   = lerp(fromL.gridOpacity,   toL.gridOpacity,   t);
      const cityAlpha   = lerp(fromL.cityOpacity,   toL.cityOpacity,   t);
      const streetAlpha = lerp(fromL.streetOpacity, toL.streetOpacity, t);
      const starAlpha   = clamp(1 - (scale - 1) / 2.8, 0, 1);

      const baseR = Math.min(W, H) * 0.38;
      const R     = baseR * scale;

      ctx.clearRect(0, 0, W, H);

      // ── Deep space bg ──────────────────────────────────────────────────────
      ctx.fillStyle = "#03000f";
      ctx.fillRect(0, 0, W, H);

      if (starAlpha > 0.01) {
        // Nebula clouds
        const neb1 = ctx.createRadialGradient(cx*0.3, cy*0.4, 0, cx*0.3, cy*0.4, W*0.4);
        neb1.addColorStop(0, `rgba(0,80,120,${0.14 * starAlpha})`);
        neb1.addColorStop(1, "transparent");
        ctx.fillStyle = neb1; ctx.fillRect(0,0,W,H);

        const neb2 = ctx.createRadialGradient(cx*1.7, cy*1.5, 0, cx*1.7, cy*1.5, W*0.35);
        neb2.addColorStop(0, `rgba(0,140,120,${0.10 * starAlpha})`);
        neb2.addColorStop(1, "transparent");
        ctx.fillStyle = neb2; ctx.fillRect(0,0,W,H);

        // Stars — twinkling, color-varied
        for (let i = 0; i < 220; i++) {
          const sx = (i * 137.508) % W;
          const sy = (i * 91.732 + 43) % H;
          const sr = 0.4 + (i % 4) * 0.35;
          const tw = 0.4 + 0.6 * Math.sin(ts / 1200 + i * 0.7);
          const hue = i%5===0 ? "140,255,230" : i%7===0 ? "100,220,255" : "200,240,255";
          ctx.beginPath();
          ctx.arc(sx, sy, sr, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${hue},${starAlpha * tw * (0.3 + (i%5)*0.1)})`;
          ctx.fill();
        }
      }

      // ── Clip globe ─────────────────────────────────────────────────────────
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(R + 2, Math.max(W,H)*2), 0, Math.PI*2);
      ctx.clip();

      if (R > 0) {
        // Globe base
        const globeGrad = ctx.createRadialGradient(cx-R*0.28, cy-R*0.28, R*0.05, cx, cy, R);
        globeGrad.addColorStop(0,    "rgba(0,35,45,1)");
        globeGrad.addColorStop(0.35, "rgba(0,18,28,1)");
        globeGrad.addColorStop(0.7,  "rgba(0,8,16,1)");
        globeGrad.addColorStop(1,    "rgba(0,4,10,1)");
        ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2);
        ctx.fillStyle = globeGrad; ctx.fill();

        // Hex surface grid
        const hexAlpha = clamp(1-(scale-1)/7, 0, 1);
        if (hexAlpha > 0.01) {
          const hexR = clamp(R/10, 8, 26);
          const hexW = hexR * Math.sqrt(3);
          const hexH = hexR * 2;
          const cols = Math.ceil((R*2)/hexW)+2;
          const rows = Math.ceil((R*2)/(hexH*0.75))+2;
          ctx.save();
          ctx.beginPath(); ctx.arc(cx,cy,R-1,0,Math.PI*2); ctx.clip();
          for (let row=-2; row<rows; row++) {
            for (let col=-2; col<cols; col++) {
              const hx = (cx-R)+col*hexW+(row%2===0?0:hexW/2);
              const hy = (cy-R)+row*hexH*0.75;
              const d  = Math.hypot(hx-cx, hy-cy);
              if (d > R) continue;
              const nd = d/R;
              const pulse = 0.5+0.5*Math.sin(ts/3000+row*0.4+col*0.3);
              // Cyan-teal color throughout
              const rr = Math.round(lerp(0, 0, nd));
              const gg = Math.round(lerp(180, 255, nd));
              const bb = Math.round(lerp(180, 220, nd));
              const a  = hexAlpha*(0.05+Math.pow(nd,2.5)*0.2+pulse*0.02);
              hexPath(ctx, hx, hy, hexR*0.88);
              ctx.strokeStyle = `rgba(${rr},${gg},${bb},${a})`;
              ctx.lineWidth = 0.6; ctx.stroke();
              if ((row*17+col*31)%19===0) {
                hexPath(ctx,hx,hy,hexR*0.88);
                ctx.fillStyle=`rgba(0,255,200,${hexAlpha*0.05*pulse})`;
                ctx.fill();
              }
            }
          }
          ctx.restore();
        }

        // Internal cyan glow
        const coreGrad = ctx.createRadialGradient(cx,cy,0,cx,cy,R*0.6);
        coreGrad.addColorStop(0, `rgba(0,180,160,${0.1+0.04*Math.sin(ts/2000)})`);
        coreGrad.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2);
        ctx.fillStyle=coreGrad; ctx.fill();

        // Specular
        const spec = ctx.createRadialGradient(cx-R*0.32,cy-R*0.32,0,cx-R*0.32,cy-R*0.32,R*0.5);
        spec.addColorStop(0, "rgba(100,255,240,0.10)");
        spec.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2);
        ctx.fillStyle=spec; ctx.fill();

        // Lat/lon lines
        const lineA = clamp(1-(scale-1)/7,0,1)*0.16;
        if (lineA>0.005) {
          for (let lat=-75; lat<=75; lat+=15) {
            const phi=(90-lat)*(Math.PI/180);
            const r2=R*Math.sin(phi), yOff=R*Math.cos(phi);
            if(r2<2)continue;
            ctx.beginPath(); ctx.ellipse(cx,cy-yOff,r2,r2*0.18,0,0,Math.PI*2);
            ctx.strokeStyle=`rgba(0,220,200,${lineA})`; ctx.lineWidth=0.7; ctx.stroke();
          }
          for(let lon=0;lon<180;lon+=20){
            const a=((lon+rotRef.current)*Math.PI)/180;
            ctx.beginPath();
            ctx.ellipse(cx,cy,R*Math.abs(Math.cos(a)),R,Math.sin(a)>0?0:Math.PI,0,Math.PI*2);
            ctx.strokeStyle=`rgba(0,220,200,${lineA})`; ctx.lineWidth=0.7; ctx.stroke();
          }
        }

        // Atmosphere layers — cyan/teal theme
        for(let l=0;l<4;l++){
          const lR=R*(1.02+l*0.028), lA=(0.10-l*0.02)*starAlpha;
          if(lA<0.005)continue;
          const atm=ctx.createRadialGradient(cx,cy,R*0.9,cx,cy,lR);
          atm.addColorStop(0,"transparent");
          atm.addColorStop(0.6,`rgba(0,255,200,${lA})`);
          atm.addColorStop(1,"transparent");
          ctx.beginPath(); ctx.arc(cx,cy,lR,0,Math.PI*2);
          ctx.fillStyle=atm; ctx.fill();
        }

        // Bright cyan rim
        const rim=ctx.createRadialGradient(cx,cy,R*0.95,cx,cy,R*1.04);
        rim.addColorStop(0,"transparent");
        rim.addColorStop(0.5,`rgba(0,255,220,${0.18*starAlpha})`);
        rim.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(cx,cy,R*1.05,0,Math.PI*2);
        ctx.fillStyle=rim; ctx.fill();

        // Flight route arcs (city zoom)
        if(cityAlpha>0.01){
          ROUTES.forEach(([ai,bi],ri)=>{
            const a=CITIES[ai], b=CITIES[bi];
            const pa=latLonToXY(a.lat,a.lon,cx,cy,R,rotRef.current);
            const pb=latLonToXY(b.lat,b.lon,cx,cy,R,rotRef.current);
            if(pa.z<0||pb.z<0)return;
            const off=(ts/700+ri*3.5)%20;
            ctx.save();
            ctx.setLineDash([5,12]); ctx.lineDashOffset=-off;
            ctx.beginPath();
            const mx=(pa.px+pb.px)/2, my=(pa.py+pb.py)/2;
            const dist=Math.hypot(pb.px-pa.px,pb.py-pa.py);
            ctx.moveTo(pa.px,pa.py);
            ctx.quadraticCurveTo(mx+(cy-my)*0.2,my-dist*0.2,pb.px,pb.py);
            ctx.strokeStyle=`rgba(0,255,200,${cityAlpha*0.5})`;
            ctx.lineWidth=1.2; ctx.stroke(); ctx.restore();
          });
        }

        // City dots
        if(cityAlpha>0.01){
          CITIES.forEach((city,ci)=>{
            const{px,py,z}=latLonToXY(city.lat,city.lon,cx,cy,R,rotRef.current);
            if(z<0)return;
            const vis=z/R;
            const pulse=0.5+0.5*Math.sin(ts/800+ci*1.3);
            const isBali = city.name==="DPS";

            // Rings
            [isBali?20:12, isBali?10:6].forEach((rr,ri)=>{
              ctx.beginPath();
              ctx.arc(px,py,rr*(1+pulse*0.3),0,Math.PI*2);
              ctx.strokeStyle = isBali
                ? `rgba(255,180,50,${cityAlpha*vis*(ri===0?0.2:0.4)})`
                : `rgba(0,255,200,${cityAlpha*vis*(ri===0?0.15:0.3)})`;
              ctx.lineWidth=0.9; ctx.stroke();
            });

            // Core dot — Bali is gold/orange, others cyan
            const dg=ctx.createRadialGradient(px,py,0,px,py,isBali?7:5);
            if(isBali){
              dg.addColorStop(0,`rgba(255,220,80,${cityAlpha*vis})`);
              dg.addColorStop(1,"transparent");
            } else {
              dg.addColorStop(0,`rgba(0,255,200,${cityAlpha*vis})`);
              dg.addColorStop(1,"transparent");
            }
            ctx.beginPath(); ctx.arc(px,py,isBali?7:4,0,Math.PI*2);
            ctx.fillStyle=dg;
            ctx.shadowColor=isBali?"#ffcc00":"#00ffcc";
            ctx.shadowBlur=isBali?20:12*cityAlpha*vis;
            ctx.fill(); ctx.shadowBlur=0;

            if(cityAlpha>0.5&&vis>0.35){
              ctx.font=`bold ${isBali?10:8}px 'Share Tech Mono', monospace`;
              ctx.fillStyle=isBali?`rgba(255,220,80,${cityAlpha*vis*0.95})`:`rgba(0,255,200,${cityAlpha*vis*0.8})`;
              ctx.fillText(city.name,px+9,py+3);
            }
          });
        }

        // Globe border
        ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2);
        ctx.strokeStyle=`rgba(0,255,200,${0.3*starAlpha+0.07})`;
        ctx.lineWidth=1.5;
        ctx.shadowColor="rgba(0,255,200,0.5)"; ctx.shadowBlur=10;
        ctx.stroke(); ctx.shadowBlur=0;
      }

      ctx.restore(); // end globe clip

      // ── Zoomed hex grid overlay ─────────────────────────────────────────────
      if(gridAlpha>0.01){
        const hs=clamp(60/(scale/4),10,38);
        const hw=hs*Math.sqrt(3), hh=hs*2;
        const c2=Math.ceil(W/hw)+2, r2=Math.ceil(H/(hh*0.75))+2;
        ctx.save();
        for(let row=-1;row<r2;row++){
          for(let col=-1;col<c2;col++){
            const hx=col*hw+(row%2===0?0:hw/2);
            const hy=row*hh*0.75;
            const dc=Math.hypot(hx-cx,hy-cy);
            const fade=clamp((dc-60)/320,0,1);
            hexPath(ctx,hx,hy,hs*0.88);
            ctx.strokeStyle=`rgba(0,220,200,${gridAlpha*0.18*fade})`;
            ctx.lineWidth=0.6; ctx.stroke();
          }
        }
        // Coord labels
        if(gridAlpha>0.4){
          ctx.font="8px 'Share Tech Mono',monospace";
          ctx.fillStyle=`rgba(0,220,200,${gridAlpha*0.35})`;
          let xi=0;
          for(let x=hw/2;x<W;x+=hw,xi++){
            ctx.fillText(`${xi*2}°E`,x+2,14);
          }
        }
        ctx.restore();
      }

      // ── Street level ────────────────────────────────────────────────────────
      if(streetAlpha>0.01){
        ctx.save();
        const fs=30;
        ctx.strokeStyle=`rgba(0,255,200,${streetAlpha*0.10})`; ctx.lineWidth=0.5;
        for(let x=0;x<W;x+=fs){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
        for(let y=0;y<H;y+=fs){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
        const bs=60,bg=10;
        for(let bx=bg;bx<W-bs;bx+=bs+bg){
          for(let by=bg;by<H-bs;by+=bs+bg){
            const dc=Math.hypot(bx+bs/2-cx,by+bs/2-cy);
            if(dc<180)continue;
            const fade=clamp((dc-180)/200,0,1);
            ctx.fillStyle=`rgba(0,255,200,${streetAlpha*fade*0.05})`;
            ctx.strokeStyle=`rgba(0,255,200,${streetAlpha*fade*0.20})`;
            ctx.lineWidth=0.7;
            ctx.fillRect(bx,by,bs-bg,bs-bg); ctx.strokeRect(bx,by,bs-bg,bs-bg);
          }
        }
        // Traveler dot
        const tt=(ts/3200)%1;
        const tx=cx+Math.cos(tt*Math.PI*2)*110, ty=cy+Math.sin(tt*Math.PI*2)*65;
        ctx.beginPath(); ctx.arc(tx,ty,5,0,Math.PI*2);
        ctx.fillStyle="#00ffcc"; ctx.shadowColor="#00ffcc"; ctx.shadowBlur=18;
        ctx.fill(); ctx.shadowBlur=0;
        for(let tr=1;tr<=10;tr++){
          const ttr=((ts/3200)-tr*0.01+10)%1;
          const trx=cx+Math.cos(ttr*Math.PI*2)*110, try_=cy+Math.sin(ttr*Math.PI*2)*65;
          ctx.beginPath(); ctx.arc(trx,try_,2.5,0,Math.PI*2);
          ctx.fillStyle=`rgba(0,255,200,${streetAlpha*(1-tr/11)*0.45})`; ctx.fill();
        }
        ctx.restore();
      }

      // Vignette
      const vig=ctx.createRadialGradient(cx,cy,H*0.22,cx,cy,H*0.9);
      vig.addColorStop(0,"rgba(0,0,0,0)");
      vig.addColorStop(1,"rgba(3,0,15,0.72)");
      ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);

      rotRef.current += 0.035;
      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const currentLevel = ZOOM_LEVELS[levelIndex];
  const story = currentLevel.story;
  const show = cardVisible;

  return (
    <>
      <style>{CSS}</style>
      <div className="ze-wrapper" ref={wrapperRef}>
        <div className="ze-sticky">
          <canvas ref={canvasRef} className="ze-canvas" />

          <div className="ze-hud">
            <div className="ze-scanlines" />
            <div className="ze-corner tl"/><div className="ze-corner tr"/>
            <div className="ze-corner bl"/><div className="ze-corner br"/>

            {/* Altitude */}
            <div className="ze-altitude">
              <span className="ze-altitude-label">SoWeGo · Navigation</span>
              <div className="ze-altitude-bar"/>
              <span className="ze-altitude-value">{currentLevel.sublabel}</span>
            </div>

            {/* Progress track */}
            <div className="ze-progress-track">
              {ZOOM_LEVELS.map((lvl,i)=>(
                <div key={lvl.id} className="ze-step-row">
                  <div className={`ze-progress-dot ${i===levelIndex?"active":i<levelIndex?"done":""}`}>
                    <span className="ze-step-label">{lvl.label}</span>
                  </div>
                  {i<ZOOM_LEVELS.length-1&&<div className="ze-progress-line"/>}
                </div>
              ))}
            </div>

            {/* Story card — bottom center */}
            <div className="ze-story">
              {story.tag && (
                <div className={`ze-story-tag ${show?"show":""}`}>{story.tag}</div>
              )}
              <div className={`ze-story-question ${show?"show":""}`}>
                {story.question}
              </div>
              {story.detail && (
                <>
                  <div className="ze-story-divider show" />
                  <div className={`ze-story-detail ${show?"show":""}`}>
                    {story.detail}
                  </div>
                </>
              )}
              {story.sub && (
                <div className={`ze-story-sub ${show?"show":""}`}>{story.sub}</div>
              )}
            </div>

            {/* Targeting rings at city+ */}
            <div className={`ze-target-ring ${levelIndex>=2?"visible":""}`}/>
            <div className={`ze-target-ring ze-target-ring-2 ${levelIndex>=2?"visible":""}`}/>
            <div className={`ze-crosshair ${levelIndex>=2?"visible":""}`}/>

            {/* Scroll hint */}
            {!atEnd&&(
              <div className="ze-scroll-hint">
                <span>scroll to zoom</span>
                <div className="ze-scroll-arrow"/>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}