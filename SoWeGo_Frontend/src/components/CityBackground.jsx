const CITIES = [
  { name: "Tokyo", country: "Japan", pop: "13.96M" },
  { name: "New York", country: "USA", pop: "8.34M" },
  { name: "London", country: "UK", pop: "9.54M" },
  { name: "Paris", country: "France", pop: "2.16M" },
  { name: "Dubai", country: "UAE", pop: "3.48M" },
  { name: "Singapore", country: "Singapore", pop: "5.92M" },
  { name: "Sydney", country: "Australia", pop: "5.31M" },
  { name: "Mumbai", country: "India", pop: "20.67M" },
  { name: "São Paulo", country: "Brazil", pop: "12.33M" },
  { name: "Shanghai", country: "China", pop: "26.32M" },
  { name: "Cairo", country: "Egypt", pop: "21.32M" },
  { name: "Moscow", country: "Russia", pop: "12.51M" },
  { name: "Seoul", country: "South Korea", pop: "9.73M" },
  { name: "Mexico City", country: "Mexico", pop: "9.21M" },
  { name: "Istanbul", country: "Turkey", pop: "15.46M" },
  { name: "Lagos", country: "Nigeria", pop: "15.95M" },
  { name: "Buenos Aires", country: "Argentina", pop: "3.07M" },
  { name: "Bangkok", country: "Thailand", pop: "10.72M" },
  { name: "Toronto", country: "Canada", pop: "2.93M" },
  { name: "Berlin", country: "Germany", pop: "3.77M" },
  { name: "Nairobi", country: "Kenya", pop: "4.92M" },
  { name: "Jakarta", country: "Indonesia", pop: "10.56M" },
  { name: "Rome", country: "Italy", pop: "2.87M" },
  { name: "Riyadh", country: "Saudi Arabia", pop: "7.68M" },
  { name: "Karachi", country: "Pakistan", pop: "14.91M" },
  { name: "Dhaka", country: "Bangladesh", pop: "21.74M" },
  { name: "Manila", country: "Philippines", pop: "13.92M" },
  { name: "Kinshasa", country: "DR Congo", pop: "14.34M" },
  { name: "Lima", country: "Peru", pop: "10.75M" },
  { name: "Osaka", country: "Japan", pop: "19.06M" },
  { name: "Chicago", country: "USA", pop: "2.70M" },
  { name: "Bogotá", country: "Colombia", pop: "7.41M" },
  { name: "Hong Kong", country: "China", pop: "7.50M" },
  { name: "Johannesburg", country: "South Africa", pop: "5.78M" },
  { name: "Madrid", country: "Spain", pop: "3.33M" },
  { name: "Amsterdam", country: "Netherlands", pop: "0.87M" },
  { name: "Kuala Lumpur", country: "Malaysia", pop: "7.78M" },
  { name: "Taipei", country: "Taiwan", pop: "2.65M" },
  { name: "Casablanca", country: "Morocco", pop: "3.75M" },
  { name: "Athens", country: "Greece", pop: "3.15M" },
];

// 10 fixed horizontal lanes spread evenly across full height (4% – 94%)
// Each lane gets exactly 4 cards with staggered delays so they never overlap
const LANE_COUNT = 10;
const CARDS_PER_LANE = 4;

function buildCards() {
  const result = [];
  let id = 0;
  let cityIndex = 0;

  for (let lane = 0; lane < LANE_COUNT; lane++) {
    // Evenly space lanes from 4% to 94%
    const top = 4 + lane * (90 / (LANE_COUNT - 1));

    // Vary speed per lane slightly for organic feel
    const laneSpeed = 28 + (lane % 3) * 6; // 28s, 34s, or 40s

    for (let card = 0; card < CARDS_PER_LANE; card++) {
      // Space 4 cards evenly across the cycle so they never bunch
      // Each card is offset by 1/4 of the animation duration
      const delay = -(card * laneSpeed / CARDS_PER_LANE);

      result.push({
        id: id++,
        city: CITIES[cityIndex % CITIES.length],
        top,
        size: 0.82 + (lane % 3) * 0.08, // subtle size variation by lane
        speed: laneSpeed,
        delay,
        opacity: 0.45 + (lane % 2) * 0.15, // alternate 0.38 / 0.53
        glowHigh: lane % 3 === 0,
      });
      cityIndex++;
    }
  }

  return result;
}

const cards = buildCards();

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700&family=Share+Tech+Mono&display=swap');

  .city-background-root {
    position: absolute;
    inset: 0;
    overflow: hidden;
    z-index: 0;
    pointer-events: none;
  }

  .city-bg-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(0,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,255,0.03) 1px, transparent 1px);
    background-size: 60px 60px;
    z-index: 0;
  }

  .city-bg-scanlines {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg, transparent, transparent 2px,
      rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px
    );
    z-index: 1;
    pointer-events: none;
  }

  .city-bg-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
    z-index: 0;
  }
  .city-bg-orb-1 {
    width: 600px; height: 600px; top: -200px; left: -150px;
    background: radial-gradient(circle, rgba(0,255,255,0.07) 0%, transparent 70%);
    animation: city-bg-orb-drift 18s ease-in-out infinite alternate;
  }
  .city-bg-orb-2 {
    width: 500px; height: 500px; bottom: -100px; right: -100px;
    background: radial-gradient(circle, rgba(0,200,255,0.06) 0%, transparent 70%);
    animation: city-bg-orb-drift 24s ease-in-out infinite alternate-reverse;
  }
  .city-bg-orb-3 {
    width: 300px; height: 300px; top: 40%; left: 55%;
    background: radial-gradient(circle, rgba(0,255,230,0.05) 0%, transparent 70%);
    animation: city-bg-orb-drift 14s ease-in-out infinite alternate;
  }

  @keyframes city-bg-orb-drift {
    from { transform: translate(0, 0) scale(1); }
    to   { transform: translate(40px, 30px) scale(1.1); }
  }

  .city-bg-track {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    overflow: hidden;
    mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
    -webkit-mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
  }

  .city-bg-card {
    position: absolute;
    left: 110%;
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 9px 14px;
    border: 1px solid rgba(0,255,255,0.4);
    border-radius: 4px;
    backdrop-filter: blur(6px);
    background: rgba(0,20,28,0.52);
    white-space: nowrap;
    animation: city-bg-drift-left linear infinite;
    transform-origin: left center;
  }

  .city-bg-card.glow-high {
    border-color: rgba(0,255,255,0.7);
    box-shadow: 0 0 16px rgba(0,255,255,0.25), inset 0 0 10px rgba(0,255,255,0.08);
  }
  .city-bg-card.glow-low {
    box-shadow: 0 0 8px rgba(0,255,255,0.12);
  }

  .city-bg-name {
    font-family: 'Orbitron', monospace;
    font-size: 12px;
    font-weight: 600;
    color: #00ffff;
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }

  .city-bg-meta {
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px;
    color: rgba(0,220,255,0.6);
    letter-spacing: 0.8px;
  }

  .city-bg-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: #00ffff;
    box-shadow: 0 0 6px #00ffff;
    display: inline-block;
    margin-right: 6px;
    flex-shrink: 0;
    animation: city-bg-pulse-dot 2s ease-in-out infinite;
  }

  @keyframes city-bg-pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.4; transform: scale(0.7); }
  }

  @keyframes city-bg-drift-left {
    from { transform: translateX(0); }
    to   { transform: translateX(-130vw); }
  }
`;

export default function CityBackground() {
  return (
    <>
      <style>{styles}</style>
      <div className="city-background-root">
        <div className="city-bg-grid" />
        <div className="city-bg-scanlines" />
        <div className="city-bg-orb city-bg-orb-1" />
        <div className="city-bg-orb city-bg-orb-2" />
        <div className="city-bg-orb city-bg-orb-3" />

        <div className="city-bg-track">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`city-bg-card ${card.glowHigh ? "glow-high" : "glow-low"}`}
              style={{
                top: `${card.top}%`,
                opacity: card.opacity,
                transform: `scale(${card.size})`,
                animationDuration: `${card.speed}s`,
                animationDelay: `${card.delay}s`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <span className="city-bg-dot" />
                <span className="city-bg-name">{card.city.name}</span>
              </div>
              <div className="city-bg-meta">
                {card.city.country} &nbsp;·&nbsp; POP {card.city.pop}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}