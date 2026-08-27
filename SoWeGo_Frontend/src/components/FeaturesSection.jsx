import { useEffect, useRef, useState } from "react";

const FEATURES = [
  {
    id: 0,
    icon: (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <path d="M11 6 C7 10,7 22,11 26" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M21 6 C25 10,25 22,21 26" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M11 10 H21" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M11 16 H21" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M11 22 H21" stroke="currentColor" strokeWidth="1.4"/>
    <circle cx="16" cy="16" r="2" fill="currentColor"/>
  </svg>
),
    number: "01",
    title: "Traveler DNA Engine",
    subtitle: "PERSONALIZED INTELLIGENCE",
    desc: "Through interactive and gamified profiling, SoWeGo learns your unique travel personality — from adventure preferences and budget habits to food interests and travel pace.",
    tag: "UNIQUELY YOURS",
    accentColor: "0,255,200",
  },
  {
    id: 1,
   icon: (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <path d="M6 8 H26 V24 H6 Z" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M10 13 H22" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M10 18 H18" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M22 8 V24" stroke="currentColor" strokeWidth="1.4" opacity="0.4"/>
  </svg>
),
    number: "02",
    title: "Agentic Trip Composer",
    subtitle: "AUTONOMOUS PLANNING",
    desc: "Simply enter your destination, dates, and budget. SoWeGo automatically creates a complete, personalized itinerary with attractions, food spots, and experiences.",
    tag: "PLANS IN MINUTES",
    accentColor: "0,220,255",
  },
  {
    id: 2,
    icon: (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <path d="M16 26 C16 26,8 18,8 12 A8 8 0 1 1 24 12 C24 18,16 26,16 26 Z"
      stroke="currentColor"
      strokeWidth="1.4"
    />
    <circle cx="16" cy="12" r="3" fill="currentColor"/>
  </svg>
),
    number: "03",
    title: "Hyper-Local Discovery",
    subtitle: "BEYOND TOURIST TRAPS",
    desc: "Powered by Agentic RAG and semantic search, SoWeGo uncovers authentic local gems, hidden attractions, cultural experiences, and lesser-known destinations.",
    tag: "DISCOVER THE UNSEEN",
    accentColor: "0,255,180",
  },
  {
    id: 3,
    icon: (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M12 16 L15 19 L21 13"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
),
    number: "04",
    title: "Decision-Free Recommendations",
    subtitle: "ZERO DECISION FATIGUE",
    desc: "Instead of overwhelming you with endless options, SoWeGo intelligently selects and explains the best choices based on your Traveler DNA.",
    tag: "SMARTER CHOICES",
    accentColor: "0,255,200",
  },
  {
    id: 4,
    icon: (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <rect x="8" y="8" width="16" height="12" rx="3"
      stroke="currentColor"
      strokeWidth="1.4"
    />
    <circle cx="13" cy="14" r="1.5" fill="currentColor"/>
    <circle cx="19" cy="14" r="1.5" fill="currentColor"/>
    <path d="M12 20 L10 24" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M20 20 L22 24" stroke="currentColor" strokeWidth="1.4"/>
  </svg>
),
    number: "05",
    title: "SoWeGo AI Companion",
    subtitle: "24/7 TRAVEL ASSISTANT",
    desc: "Your AI travel companion continuously answers questions, refines plans, provides recommendations, and adapts to changing travel needs.",
    tag: "ALWAYS BY YOUR SIDE",
    accentColor: "0,220,255",
  },
  {
    id: 5,
    icon: (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="11" cy="12" r="3" stroke="currentColor" strokeWidth="1.4"/>
    <circle cx="21" cy="12" r="3" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M7 23 C7 19 15 19 15 23"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path d="M17 23 C17 19 25 19 25 23"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
),
    number: "06",
    title: "GroupSync Planning",
    subtitle: "COLLABORATIVE TRAVEL",
    desc: "Plan trips effortlessly with friends and family through shared itineraries, preference matching, and voting-based decision making.",
    tag: "ONE PLAN FOR EVERYONE",
    accentColor: "0,255,180",
  },
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Exo+2:wght@300;400;500;600&display=swap');

  /* ── Section ── */
  .fs-section {
    background: #03000f;
    position: relative;
    overflow: hidden;
    padding: 130px 0 0;
  }

  .fs-section::before {
    content: '';
    position: absolute;
    top: 0; left: 8%; right: 8%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0,255,200,0.5), rgba(0,180,255,0.3), transparent);
  }

  /* Animated scanline sweep */
  .fs-section::after {
    content: '';
    position: absolute;
    top: -100%; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(0,255,200,0.6), transparent);
    animation: fs-scan 8s linear infinite;
    pointer-events: none;
    z-index: 1;
  }

  @keyframes fs-scan {
    0%   { top: -2%; }
    100% { top: 102%; }
  }

  /* Background */
  .fs-bg {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(0,255,200,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,200,0.025) 1px, transparent 1px);
    background-size: 52px 52px;
  }

  .fs-orb {
    position: absolute; border-radius: 50%;
    filter: blur(100px); pointer-events: none;
  }
  .fs-orb-1 {
    width: 600px; height: 600px; top: -120px; left: -100px;
    background: radial-gradient(circle, rgba(0,255,200,0.07) 0%, transparent 70%);
    animation: fs-orb-drift 20s ease-in-out infinite alternate;
  }
  .fs-orb-2 {
    width: 500px; height: 500px; bottom: 160px; right: -80px;
    background: radial-gradient(circle, rgba(0,180,255,0.06) 0%, transparent 70%);
    animation: fs-orb-drift 26s ease-in-out infinite alternate-reverse;
  }
  .fs-orb-3 {
    width: 300px; height: 300px; top: 45%; left: 50%;
    background: radial-gradient(circle, rgba(0,255,180,0.04) 0%, transparent 70%);
    animation: fs-orb-drift 15s ease-in-out infinite alternate;
  }
  @keyframes fs-orb-drift {
    from { transform: translate(0,0) scale(1); }
    to   { transform: translate(30px,20px) scale(1.1); }
  }

  /* ── Header ── */
  .fs-header {
    position: relative; z-index: 2;
    text-align: center; padding: 0 24px 90px;
  }

 .fs-eyebrow {
  font-family: 'Share Tech Mono', monospace;
  font-size: 13px;
  letter-spacing: 6px;
  color: rgba(0,255,200,0.6);
  text-transform: uppercase;
  display: block;
  margin-bottom: 20px;
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
  .fs-eyebrow.in { opacity: 1; transform: translateY(0); }

  .fs-headline {
    font-family: 'Orbitron', monospace;
    font-size: clamp(2rem, 4.5vw, 3.5rem);
    font-weight: 700; color: #e8fdff;
    line-height: 1.1; letter-spacing: -0.5px; margin: 0 0 22px;
    opacity: 0; transform: translateY(16px);
    transition: opacity 0.7s 0.1s ease, transform 0.7s 0.1s ease;
  }
  .fs-headline.in { opacity: 1; transform: translateY(0); }
  .fs-headline em {
    font-style: normal;
    background: linear-gradient(135deg, #00ffcc 0%, #00aaff 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 0 20px rgba(0,255,200,0.3));
  }

 .fs-subhead {
  font-family: 'Exo 2', sans-serif;
  font-size: 1.15rem;
  font-weight: 400;
  color: rgba(180,230,220,0.75);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.8;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.7s 0.2s ease, transform 0.7s 0.2s ease;
}
  .fs-subhead.in { opacity: 1; transform: translateY(0); }

  /* ── Grid ── */
  .fs-grid {
    position: relative; z-index: 2;
    display: grid; grid-template-columns: repeat(3,1fr);
    max-width: 1200px; margin: 0 auto;
    border-top: 1px solid rgba(0,255,200,0.1);
    border-left: 1px solid rgba(0,255,200,0.1);
  }
  @media (max-width: 900px) { .fs-grid { grid-template-columns: repeat(2,1fr); } }
  @media (max-width: 560px) { .fs-grid { grid-template-columns: 1fr; } }

  /* ── Card ── */
.fs-card {
  position: relative;
  padding: 44px 42px 40px;

  display: flex;
  flex-direction: column;

  border-right: 1px solid rgba(0,255,200,0.1);
  border-bottom: 1px solid rgba(0,255,200,0.1);
  overflow: hidden;
  cursor: default;

  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.65s ease,
              transform 0.65s cubic-bezier(0.16,1,0.3,1);

  background: rgba(0,8,14,0);
}
  .fs-card-desc {
  flex-grow: 1;
}
  .fs-card-tag {
  margin-top: auto;
  align-self: flex-start;
}
  .fs-grid {
  align-items: stretch;
}


  .fs-card.in { opacity: 1; transform: translateY(0); }

  /* Hover background sweep */
  .fs-card::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(0,255,200,0.04) 0%, rgba(0,180,255,0.02) 100%);
    opacity: 0; transition: opacity 0.4s ease;
  }
  .fs-card:hover::before { opacity: 1; }

  /* Glowing border on hover */
  .fs-card::after {
    content: '';
    position: absolute; inset: 0;
    border: 1px solid rgba(0,255,200,0);
    transition: border-color 0.4s ease, box-shadow 0.4s ease;
    pointer-events: none;
  }
  .fs-card:hover::after {
    border-color: rgba(0,255,200,0.25);
    box-shadow: inset 0 0 30px rgba(0,255,200,0.04);
  }

  /* Sliding top accent line */
  .fs-card-line {
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0,255,200,0.8), rgba(0,200,255,0.5), transparent);
    transform: scaleX(0); transform-origin: left;
    transition: transform 0.5s cubic-bezier(0.16,1,0.3,1);
  }
  .fs-card:hover .fs-card-line { transform: scaleX(1); }

  /* Corner brackets that appear on hover */
  .fs-card-corner {
    position: absolute; width: 12px; height: 12px;
    opacity: 0; transition: opacity 0.3s ease, transform 0.3s ease;
  }
  .fs-card-corner.tl { top: 8px; left: 8px; border-top: 1px solid rgba(0,255,200,0.6); border-left: 1px solid rgba(0,255,200,0.6); transform: translate(-4px,-4px); }
  .fs-card-corner.tr { top: 8px; right: 8px; border-top: 1px solid rgba(0,255,200,0.6); border-right: 1px solid rgba(0,255,200,0.6); transform: translate(4px,-4px); }
  .fs-card-corner.bl { bottom: 8px; left: 8px; border-bottom: 1px solid rgba(0,255,200,0.6); border-left: 1px solid rgba(0,255,200,0.6); transform: translate(-4px,4px); }
  .fs-card-corner.br { bottom: 8px; right: 8px; border-bottom: 1px solid rgba(0,255,200,0.6); border-right: 1px solid rgba(0,255,200,0.6); transform: translate(4px,4px); }
  .fs-card:hover .fs-card-corner { opacity: 1; transform: translate(0,0); }

  /* Particle trail on hover */
  .fs-card-particles {
    position: absolute; inset: 0; pointer-events: none; overflow: hidden;
  }
  .fs-card-particle {
    position: absolute; width: 2px; height: 2px; border-radius: 50%;
    background: rgba(0,255,200,0.6);
    opacity: 0;
  }
  .fs-card:hover .fs-card-particle {
    animation: fs-particle-float 1.8s ease-out infinite;
  }
  .fs-card-particle:nth-child(1) { left:20%; animation-delay:0s; }
  .fs-card-particle:nth-child(2) { left:40%; animation-delay:0.3s; }
  .fs-card-particle:nth-child(3) { left:60%; animation-delay:0.6s; }
  .fs-card-particle:nth-child(4) { left:80%; animation-delay:0.9s; }
  .fs-card-particle:nth-child(5) { left:50%; animation-delay:1.2s; }

  @keyframes fs-particle-float {
    0%   { bottom: 10%; opacity: 0; transform: translateX(0) scale(1); }
    30%  { opacity: 0.8; }
    100% { bottom: 90%; opacity: 0; transform: translateX(var(--drift,10px)) scale(0.3); }
  }
  .fs-card-particle:nth-child(1) { --drift: -15px; }
  .fs-card-particle:nth-child(2) { --drift: 10px; }
  .fs-card-particle:nth-child(3) { --drift: -8px; }
  .fs-card-particle:nth-child(4) { --drift: 12px; }
  .fs-card-particle:nth-child(5) { --drift: -5px; }

  /* Number */
.fs-card-num {
  font-family: 'Orbitron', monospace;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 5px;
  color: rgba(0,255,200,0.35);
  display: block;
  margin-bottom: 24px;
}
  .fs-card:hover .fs-card-num { color: rgba(0,255,200,0.6); }

  /* Icon */
 .fs-card-icon {
  color: rgba(0,200,180,0.55);
  margin-bottom: 28px;
  display: block;
  transition: color 0.35s ease, filter 0.35s ease, transform 0.35s ease;
}
  .fs-card-icon svg {
  width: 40px;
  height: 40px;
}
  .fs-card:hover .fs-card-icon {
    color: #00ffcc;
    filter: drop-shadow(0 0 10px rgba(0,255,200,0.7));
    transform: scale(1.12) rotate(-3deg);
  }

  /* Title */
  .fs-card-title {
  font-family: 'Orbitron', monospace;
  font-size: 1.15rem;
  font-weight: 700;
  color: rgba(220,245,240,0.92);
  letter-spacing: 0.5px;
  margin: 0 0 8px;
}

  .fs-card:hover .fs-card-title { color: #e8fdff; }

  /* Subtitle */
  .fs-card-subtitle {
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
  letter-spacing: 4px;
  color: rgba(0,220,190,0.65);
  text-transform: uppercase;
  display: block;
  margin-bottom: 20px;
}
  .fs-card:hover .fs-card-subtitle { color: rgba(0,255,200,0.6); }

  /* Divider */
  .fs-card-divider {
    height: 1px; margin-bottom: 18px;
    background: linear-gradient(90deg, rgba(0,255,200,0.2), transparent);
    width: 28px; transition: width 0.45s cubic-bezier(0.16,1,0.3,1);
  }
  .fs-card:hover .fs-card-divider { width: 64px; }

  /* Desc */
  .fs-card-desc {
  font-family: 'Exo 2', sans-serif;
  font-size: 0.95rem;
  font-weight: 400;
  color: rgba(180,220,210,0.78);
  line-height: 1.8;
  margin-bottom: 24px;
}
  .fs-card:hover .fs-card-desc { color: rgba(180,235,225,0.65); }

  /* Tag */
  .fs-card-tag {
  display: inline-block;
  font-family: 'Share Tech Mono', monospace;
  font-size: 10px;
  letter-spacing: 3px;
  color: rgba(0,255,200,0.8);
  border: 1px solid rgba(0,255,200,0.25);
  padding: 6px 14px;
  border-radius: 2px;
  text-transform: uppercase;
  background: rgba(0,255,200,0.05);
}
  .fs-card:hover .fs-card-tag {
    color: #00ffcc; border-color: rgba(0,255,200,0.5);
    background: rgba(0,255,200,0.08);
    box-shadow: 0 0 14px rgba(0,255,200,0.12);
  }

  /* ── CTA ── */
  .fs-cta {
    position: relative; z-index: 2;
    text-align: center; padding: 120px 24px 130px;
  }

  /* Horizontal rule above CTA */
  .fs-cta-rule {
    width: 1px; height: 60px;
    background: linear-gradient(180deg, rgba(0,255,200,0.4), transparent);
    margin: 0 auto 48px;
  }

.fs-cta-label {
  font-family: 'Share Tech Mono', monospace;
  font-size: 12px;
  letter-spacing: 6px;
  color: rgba(0,255,200,0.55);
  text-transform: uppercase;
  display: block;
  margin-bottom: 24px;
  opacity: 0;
  transition: opacity 0.7s ease;
}
  .fs-cta-label.in { opacity: 1; }

  .fs-cta-headline {
    font-family: 'Orbitron', monospace;
    font-size: clamp(1.9rem, 4.5vw, 3.2rem);
    font-weight: 700; color: #e8fdff; margin: 0 0 16px; line-height: 1.12;
    opacity: 0; transform: translateY(16px);
    transition: opacity 0.7s 0.1s ease, transform 0.7s 0.1s ease;
  }
  .fs-cta-headline.in { opacity: 1; transform: translateY(0); }
  .fs-cta-headline span {
    background: linear-gradient(135deg, #00ffcc 0%, #00aaff 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text; filter: drop-shadow(0 0 24px rgba(0,255,200,0.4));
  }

.fs-cta-sub {
  font-family: 'Exo 2', sans-serif;
  font-size: 1.1rem;
  font-weight: 400;
  color: rgba(190,230,220,0.75);
  margin-bottom: 52px;
  opacity: 0;
  transition: opacity 0.7s 0.2s ease;
}
  .fs-cta-sub.in { opacity: 1; }

  .fs-cta-buttons {
    display: flex; gap: 18px; justify-content: center; flex-wrap: wrap;
    opacity: 0; transform: translateY(12px);
    transition: opacity 0.7s 0.3s ease, transform 0.7s 0.3s ease;
  }
  .fs-cta-buttons.in { opacity: 1; transform: translateY(0); }

  /* Primary button */
  .fs-btn-wrap { position: relative; display: inline-block; }

  .fs-btn-primary {
    font-family: 'Orbitron', monospace; font-size: 11px; font-weight: 700;
    letter-spacing: 3px; text-transform: uppercase;
    padding: 18px 46px;
    background: rgba(0,20,24,0.8);
    border: 1px solid rgba(0,255,200,0.55);
    color: #00ffcc; border-radius: 3px; cursor: pointer;
    position: relative; overflow: hidden;
    transition: all 0.35s ease;
    text-shadow: 0 0 10px rgba(0,255,200,0.4);
  }

  /* Shimmer sweep */
  .fs-btn-primary::before {
    content: '';
    position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0,255,200,0.12), transparent);
    transition: left 0.6s ease;
  }
  .fs-btn-primary:hover::before { left: 150%; }

  .fs-btn-primary:hover {
    background: rgba(0,255,200,0.08);
    border-color: rgba(0,255,200,0.9);
    box-shadow: 0 0 30px rgba(0,255,200,0.2), 0 0 60px rgba(0,255,200,0.08), inset 0 0 20px rgba(0,255,200,0.05);
    transform: translateY(-3px);
    color: #ffffff;
    text-shadow: 0 0 16px rgba(0,255,200,0.8);
  }

  /* Orbiting rings */
  .fs-btn-ring {
    position: absolute; border-radius: 4px;
    border: 1px solid rgba(0,255,200,0.18);
    animation: fs-ring-pulse 3s ease-in-out infinite;
    pointer-events: none;
    inset: -10px;
  }
  .fs-btn-ring-2 {
    inset: -20px; border-radius: 6px;
    border-color: rgba(0,180,255,0.10);
    animation-delay: 1.2s; animation-duration: 4s;
  }
  .fs-btn-ring-3 {
    inset: -32px; border-radius: 8px;
    border-color: rgba(0,255,200,0.06);
    animation-delay: 0.6s; animation-duration: 5s;
  }
  @keyframes fs-ring-pulse {
    0%,100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.03); }
  }

  /* Secondary button */
  .fs-btn-secondary {
    font-family: 'Share Tech Mono', monospace; font-size: 12px; letter-spacing: 2px;
    padding: 18px 36px; background: transparent;
    border: 1px solid rgba(0,255,200,0.15); color: rgba(150,220,210,0.55);
    border-radius: 3px; cursor: pointer; transition: all 0.3s ease;
    text-transform: uppercase;
  }
  .fs-btn-secondary:hover {
    border-color: rgba(0,255,200,0.4); color: rgba(0,255,200,0.85);
    background: rgba(0,255,200,0.04);
    box-shadow: 0 0 20px rgba(0,255,200,0.06);
  }

  /* Stats */
  .fs-cta-stat {
    margin-top: 64px;
    display: flex; justify-content: center; gap: 56px; flex-wrap: wrap;
  }
  .fs-stat-item {
    display: flex; flex-direction: column; align-items: center; gap: 7px;
    opacity: 0; transition: opacity 0.6s ease;
    cursor: default;
  }
  .fs-stat-item.in { opacity: 1; }
.fs-stat-num {
  font-family: 'Orbitron', monospace;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #00ffcc 0%, #00aaff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 12px rgba(0,255,200,0.35));
}
  .fs-stat-item:hover .fs-stat-num { filter: drop-shadow(0 0 20px rgba(0,255,200,0.7)); }
.fs-stat-label {
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
  letter-spacing: 2px;
  color: rgba(0,220,190,0.65);
  text-transform: uppercase;
}

  /* ── Footer strip ── */
  .fs-footer-strip {
    border-top: 1px solid rgba(0,255,200,0.08);
    padding: 30px 40px;
    display: flex; justify-content: space-between; align-items: center;
    max-width: 1200px; margin: 0 auto;
    position: relative; z-index: 2;
  }
.fs-footer-brand {
  font-family: 'Orbitron', monospace;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 4px;
  background: linear-gradient(135deg, #00ffcc, #00aaff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
  .fs-footer-links { display: flex; gap: 32px; }
.fs-footer-links a {
  font-family: 'Share Tech Mono', monospace;
  font-size: 12px;
  letter-spacing: 2px;
  color: rgba(0,220,190,0.55);
  text-decoration: none;
  text-transform: uppercase;
}
  .fs-footer-links a:hover { color: rgba(0,255,200,0.75); }
.fs-footer-copy {
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
  letter-spacing: 2px;
  color: rgba(0,220,190,0.45);
}

  /* Blinking cursor on footer */
  .fs-footer-copy::after {
    content: ' ▌';
    animation: fs-blink 1.4s step-end infinite;
    color: rgba(0,255,200,0.4);
  }
  @keyframes fs-blink { 0%,100%{opacity:1} 50%{opacity:0} }
`;

export default function FeaturesSection() {
  const sectionRef = useRef(null);
  const ctaRef     = useRef(null);
  const [headerIn, setHeaderIn] = useState(false);
  const [cardsIn,  setCardsIn]  = useState([]);
  const [ctaIn,    setCtaIn]    = useState(false);

  useEffect(() => {
    const observers = [];

    // Header
    const hObs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setHeaderIn(true); },
      { threshold: 0.25 }
    );
    if (sectionRef.current) hObs.observe(sectionRef.current);
    observers.push(hObs);

    // Cards — staggered per column
    const cardEls = document.querySelectorAll(".fs-card");
    cardEls.forEach((el, i) => {
      const obs = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            setTimeout(() => {
              setCardsIn(prev => { const n=[...prev]; n[i]=true; return n; });
            }, (i % 3) * 110);
          }
        },
        { threshold: 0.12 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    // CTA
    const cObs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setCtaIn(true); },
      { threshold: 0.18 }
    );
    if (ctaRef.current) cObs.observe(ctaRef.current);
    observers.push(cObs);

    return () => observers.forEach(o => o.disconnect());
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <section className="fs-section" ref={sectionRef}>

        <div className="fs-bg" />
        <div className="fs-orb fs-orb-1" />
        <div className="fs-orb fs-orb-2" />
        <div className="fs-orb fs-orb-3" />

        {/* Header */}
        <div className="fs-header">
          <span className={`fs-eyebrow ${headerIn?"in":""}`}>Why SoWeGo</span>
          <h2 className={`fs-headline ${headerIn?"in":""}`}>
            Everything you need.<br/>
            <em>Nothing you don't.</em>
          </h2>
          <p className={`fs-subhead ${headerIn?"in":""}`}>
            Six tools. One platform. Built for people who move at the speed of intent.
          </p>
        </div>

        {/* Grid */}
        <div className="fs-grid">
          {FEATURES.map((f, i) => (
            <div
              key={f.id}
              className={`fs-card ${cardsIn[i]?"in":""}`}
              style={{ transitionDelay:`${(i%3)*90}ms` }}
            >
              {/* Hover effects */}
              <div className="fs-card-line" />
              <div className="fs-card-corner tl" />
              <div className="fs-card-corner tr" />
              <div className="fs-card-corner bl" />
              <div className="fs-card-corner br" />
              <div className="fs-card-particles">
                {[1,2,3,4,5].map(n=>(
                  <div key={n} className="fs-card-particle" />
                ))}
              </div>

              <span className="fs-card-num">{f.number}</span>
              <span className="fs-card-icon">{f.icon}</span>
              <h3 className="fs-card-title">{f.title}</h3>
              <span className="fs-card-subtitle">{f.subtitle}</span>
              <div className="fs-card-divider" />
              <p className="fs-card-desc">{f.desc}</p>
              <span className="fs-card-tag">{f.tag}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="fs-cta" ref={ctaRef}>
          <div className="fs-cta-rule" />
          <span className={`fs-cta-label ${ctaIn?"in":""}`}>Ready to move?</span>
          <h2 className={`fs-cta-headline ${ctaIn?"in":""}`}>
            Your next trip starts<br/>
            <span>right now.</span>
          </h2>
          <p className={`fs-cta-sub ${ctaIn?"in":""}`}>
            Join the shift from searching to experiencing.
          </p>

          <div className={`fs-cta-buttons ${ctaIn?"in":""}`}>
            <div className="fs-btn-wrap">
              <div className="fs-btn-ring" />
              <div className="fs-btn-ring fs-btn-ring-2" />
              <div className="fs-btn-ring fs-btn-ring-3" />
              <button className="fs-btn-primary">Execute Intent →</button>
            </div>
            <button className="fs-btn-secondary">Watch Demo</button>
          </div>

          <div className="fs-cta-stat">
            {[
  { num: "100+", label: "Local Experiences" },
  { num: "24/7", label: "AI Travel Companion" },
  { num: "<3 Min", label: "Trip Planning Time" },
  { num: "1", label: "Personalized Travel DNA" },
            ].map((s,i)=>(
              <div
                key={s.label}
                className={`fs-stat-item ${ctaIn?"in":""}`}
                style={{ transitionDelay:`${0.4+i*0.09}s` }}
              >
                <span className="fs-stat-num">{s.num}</span>
                <span className="fs-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="fs-footer-strip">
          <span className="fs-footer-brand">SOWEGO</span>
          <div className="fs-footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
          <span className="fs-footer-copy">© 2026 SoWeGo Inc.</span>
        </div>

      </section>
    </>
  );
}
