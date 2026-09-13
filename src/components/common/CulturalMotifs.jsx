import React from 'react';

/**
 * CulturalMotifs - Authentic North Eastern India visual motifs and illustrations
 * Includes:
 * - GamosaRibbon: Traditional Assamese Gamosa red-and-white woven geometric "phulam" ribbon
 * - RegionalTextileBorder: Traditional North Eastern diamond weave geometric border
 * - MountainTeaLandscape / CinematicMountainHero: Multi-plane Himalayan peaks, morning sunrise, Brahmaputra river bend, and lush rolling tea plantation terraces
 * - TeaGardenTerraceCard: Organic container with terraced tea rows & mist backdrop
 * - NorthEastJourneyTrail: Visual cognitive journey landscape map with waypoints
 * - TeaLeafSprig: Iconic "two leaves and a bud" (দুটি পাত এটি কলি) tea sprig
 * - JaapiHat: Traditional Assamese conical woven bamboo sunshade hat
 * - BambooFrame: Cane and bamboo framed card with corner ties
 * - NorthEastBadge & SevenSistersBadge: Cultural seals
 * - GentleRiverMist & SubtleMistyMountains: Atmospheric depth overlays
 */

// 1. Traditional Assamese Gamosa Woven Ribbon (Refined, subtle, and understated)
export function GamosaRibbon({ className = '', height = 3 }) {
  return (
    <div className={`w-full overflow-hidden bg-transparent ${className}`} style={{ height: `${height}px` }}>
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="repeat-x"
        viewBox="0 0 60 4"
      >
        <defs>
          <pattern id="gamosa-subtle-pattern" width="24" height="4" patternUnits="userSpaceOnUse">
            {/* Top and Bottom Fine Woven Red Thread */}
            <line x1="0" y1="0.5" x2="24" y2="0.5" stroke="#BA1A1A" strokeWidth="0.75" />
            <line x1="0" y1="3.5" x2="24" y2="3.5" stroke="#BA1A1A" strokeWidth="0.75" />
            {/* Subtle Diamond Thread Motif */}
            <polygon points="6,0.8 9,2 6,3.2 3,2" fill="#BA1A1A" opacity="0.85" />
            <polygon points="18,0.8 21,2 18,3.2 15,2" fill="#BA1A1A" opacity="0.85" />
            <circle cx="12" cy="2" r="0.6" fill="#BA1A1A" opacity="0.7" />
          </pattern>
        </defs>
        <rect width="100%" height="4" fill="url(#gamosa-subtle-pattern)" />
      </svg>
    </div>
  );
}

// 2. Regional Woven Textile Geometric Border (Assamese Phulam / Manipuri Temple Geometric Inspiration)
export function RegionalTextileBorder({ className = '', height = 6 }) {
  return (
    <div className={`w-full overflow-hidden ${className}`} style={{ height: `${height}px` }}>
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="repeat-x"
        viewBox="0 0 48 6"
      >
        <defs>
          <pattern id="ne-textile-pattern" width="24" height="6" patternUnits="userSpaceOnUse">
            {/* Top & Bottom Golden Silk lines */}
            <line x1="0" y1="0.5" x2="24" y2="0.5" stroke="#C68215" strokeWidth="0.8" opacity="0.7" />
            <line x1="0" y1="5.5" x2="24" y2="5.5" stroke="#C68215" strokeWidth="0.8" opacity="0.7" />
            {/* Diamond Weave */}
            <polygon points="6,1 9,3 6,5 3,3" fill="#1E5E3A" opacity="0.85" />
            <polygon points="18,1 21,3 18,5 15,3" fill="#1E5E3A" opacity="0.85" />
            {/* Center Ruby Accent */}
            <circle cx="12" cy="3" r="0.9" fill="#BA1A1A" opacity="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="6" fill="url(#ne-textile-pattern)" />
      </svg>
    </div>
  );
}

// 3. Cinematic Mountain and Tea Garden Landscape Hero
export function CinematicMountainHero({
  className = '',
  children,
  height = 'auto',
  minHeight = 220,
  showSun = true,
  timeOfDay = 'morning',
}) {
  return (
    <div
      className={`relative w-full overflow-hidden select-none ${className}`}
      style={{ minHeight: `${minHeight}px`, height }}
    >
      {/* Layered Scenic SVG Backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 800 280"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Sky Gradient: Morning Dawn in the Eastern Himalayas */}
            <linearGradient id="sky-dawn-cinematic" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#CDE2EE" />
              <stop offset="35%" stopColor="#E6F0F5" />
              <stop offset="65%" stopColor="#FFF1D6" />
              <stop offset="90%" stopColor="#F9ECE1" />
              <stop offset="100%" stopColor="#EBF5EE" />
            </linearGradient>

            {/* Golden Sun Glow */}
            <radialGradient id="sun-glow-cinematic" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF4B8" stopOpacity="1" />
              <stop offset="45%" stopColor="#F8C846" stopOpacity="0.85" />
              <stop offset="85%" stopColor="#F59E0B" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </radialGradient>

            {/* Himalayan Peaks (Distant Snow Crests) */}
            <linearGradient id="far-peaks-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#87A1B5" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#B3CAD7" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#D9E7EF" stopOpacity="0.5" />
            </linearGradient>

            {/* Mid-range Hills */}
            <linearGradient id="mid-hills-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3E6B7A" />
              <stop offset="100%" stopColor="#7FA7B4" />
            </linearGradient>

            {/* Forest Foothills */}
            <linearGradient id="fore-hills-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#24583F" />
              <stop offset="100%" stopColor="#3A825F" />
            </linearGradient>

            {/* Tea Plantation Terraces */}
            <linearGradient id="tea-row-1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1B4332" />
              <stop offset="100%" stopColor="#2D6A4F" />
            </linearGradient>

            <linearGradient id="tea-row-2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#245A42" />
              <stop offset="100%" stopColor="#43956F" />
            </linearGradient>

            <linearGradient id="tea-row-3" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#317855" />
              <stop offset="100%" stopColor="#5BBF8E" />
            </linearGradient>

            {/* Brahmaputra River Curve Glow */}
            <linearGradient id="river-curve-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#B9D5E2" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#EAF5FA" stopOpacity="0.98" />
              <stop offset="100%" stopColor="#C4DEEA" stopOpacity="0.85" />
            </linearGradient>

            {/* Morning Mist Gradient */}
            <linearGradient id="morning-mist-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.65" />
            </linearGradient>
          </defs>

          {/* Sky Canvas */}
          <rect width="800" height="280" fill="url(#sky-dawn-cinematic)" />

          {/* Morning Sun over the Eastern Hills */}
          {showSun && (
            <g>
              <circle cx="560" cy="72" r="56" fill="url(#sun-glow-cinematic)" />
              <circle cx="560" cy="72" r="24" fill="#FFFBE8" />
            </g>
          )}

          {/* Distant Snow-Capped Himalayan Crests */}
          <path
            d="M0,118 L45,86 L95,108 L160,65 L215,96 L280,56 L350,105 L420,68 L480,108 L550,60 L610,98 L690,58 L760,94 L800,74 L800,280 L0,280 Z"
            fill="url(#far-peaks-grad)"
          />

          {/* Snow Caps */}
          <polygon points="160,65 148,77 172,79" fill="#FFFFFF" opacity="0.9" />
          <polygon points="280,56 266,69 294,72" fill="#FFFFFF" opacity="0.9" />
          <polygon points="420,68 408,79 432,81" fill="#FFFFFF" opacity="0.85" />
          <polygon points="550,60 536,73 564,75" fill="#FFFFFF" opacity="0.9" />
          <polygon points="690,58 676,71 704,74" fill="#FFFFFF" opacity="0.9" />

          {/* Floating Atmospheric Mist Layer 1 */}
          <path
            d="M0,135 Q200,120 400,138 T800,128 L800,165 Q600,150 400,162 T0,152 Z"
            fill="url(#morning-mist-grad)"
            opacity="0.6"
          />

          {/* Mid-range Pine Ridges & Valleys */}
          <path
            d="M0,140 Q130,108 260,132 T520,118 T800,126 L800,280 L0,280 Z"
            fill="url(#mid-hills-grad)"
            opacity="0.9"
          />

          {/* Brahmaputra River Curved Ribbon in Valley */}
          <path
            d="M0,160 Q200,144 400,164 T800,154 L800,178 Q600,166 400,180 T0,172 Z"
            fill="url(#river-curve-grad)"
          />

          {/* Near Forested Hills */}
          <path
            d="M0,170 Q160,148 350,172 T700,158 T800,166 L800,280 L0,280 Z"
            fill="url(#fore-hills-grad)"
          />

          {/* Tea Garden Terraces - Layer 1 (Upper contour) */}
          <path
            d="M0,190 Q180,168 390,194 T740,178 T800,184 L800,280 L0,280 Z"
            fill="url(#tea-row-1)"
          />

          {/* Tea Garden Terraces - Layer 2 (Middle rolling slope) */}
          <path
            d="M0,214 Q210,188 460,216 T790,202 T800,206 L800,280 L0,280 Z"
            fill="url(#tea-row-2)"
          />

          {/* Tea Garden Terraces - Layer 3 (Foreground lush bushes) */}
          <path
            d="M0,238 Q240,212 500,240 T800,228 L800,280 L0,280 Z"
            fill="url(#tea-row-3)"
          />

          {/* Terraced Contour Dash Lines (Contour bush hedging) */}
          <g stroke="#143B2A" strokeWidth="1.75" opacity="0.45" strokeDasharray="5,6">
            <path d="M-10,182 Q170,160 380,186 T730,172 T810,178" fill="none" />
            <path d="M-10,204 Q200,178 450,206 T780,194 T810,198" fill="none" />
            <path d="M-10,228 Q230,202 490,230 T790,218 T810,222" fill="none" />
            <path d="M-10,252 Q260,226 530,254 T800,242 T810,246" fill="none" />
          </g>

          {/* Foreground Tea Leaves Patterns (Two Leaves and a Bud) */}
          <g fill="#74C69D" opacity="0.85">
            <ellipse cx="70" cy="245" rx="7" ry="3.5" transform="rotate(-30 70 245)" />
            <ellipse cx="79" cy="243" rx="7" ry="3.5" transform="rotate(30 79 243)" />
            <circle cx="74" cy="238" r="2.5" fill="#B7E4C7" />

            <ellipse cx="250" cy="254" rx="8" ry="4" transform="rotate(-25 250 254)" />
            <ellipse cx="261" cy="252" rx="8" ry="4" transform="rotate(25 261 252)" />
            <circle cx="255" cy="247" r="2.5" fill="#B7E4C7" />

            <ellipse cx="530" cy="248" rx="8" ry="4" transform="rotate(-30 530 248)" />
            <ellipse cx="541" cy="246" rx="8" ry="4" transform="rotate(25 541 246)" />
            <circle cx="535" cy="241" r="2.5" fill="#B7E4C7" />

            <ellipse cx="730" cy="252" rx="7" ry="3.5" transform="rotate(-25 730 252)" />
            <ellipse cx="740" cy="250" rx="7" ry="3.5" transform="rotate(30 740 250)" />
            <circle cx="735" cy="245" r="2.5" fill="#B7E4C7" />
          </g>

          {/* Gentle Soft Atmospheric Fog Gradient (bottom overlay for text readability) */}
          <rect y="160" width="800" height="120" fill="url(#morning-mist-grad)" opacity="0.75" />
        </svg>
      </div>

      {/* Foreground Content Container (if provided) */}
      {children && (
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      )}
    </div>
  );
}

// Retain alias for existing callers
export const MountainTeaLandscape = CinematicMountainHero;

// 4. Tea Garden Terraced Card Container
export function TeaGardenTerraceCard({ children, className = '', highlight = false }) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-5 sm:p-6 transition-all duration-200 border-2 ${
        highlight
          ? 'bg-gradient-to-br from-[#FFF9EE] via-[#FAF6ED] to-[#EBF5EE] border-[#C68215]/50 shadow-tea'
          : 'bg-gradient-to-br from-white via-[#F7FAF7] to-[#EBF5EE] border-[#C3E2CD] shadow-sm'
      } ${className}`}
    >
      {/* Subtle background tea contour curves */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#EBF5EE] rounded-full blur-2xl pointer-events-none opacity-60" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#FFF6E5] rounded-full blur-2xl pointer-events-none opacity-40" />

      {/* Decorative top corner leaf sprig */}
      <div className="absolute top-3 right-3 opacity-15 pointer-events-none">
        <TeaLeafSprig className="w-16 h-16 text-[#1E5E3A]" />
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// 5. North East Cognitive Journey Landscape Map (Waypoints Trail)
export function NorthEastJourneyTrail({
  games = [],
  onSelectGame,
  currentLevel = 1,
  activeGameId = null,
}) {
  const waypoints = [
    {
      id: 'memory-twin',
      milestone: 'Station 1',
      title: 'Tea Garden Recall',
      subtitle: 'Memory Match',
      elevation: '420m',
      icon: '🌿',
      theme: 'from-[#1E5E3A] to-[#143B28]',
      accentColor: '#1E5E3A',
      locationName: 'Assam Tea Valley',
    },
    {
      id: 'picture-memory',
      milestone: 'Station 2',
      title: 'Garden Memories',
      subtitle: 'Scene Observation',
      elevation: '780m',
      icon: '🌸',
      theme: 'from-[#2D6A4F] to-[#1B4332]',
      accentColor: '#2D6A4F',
      locationName: 'Hill Orchid Sanctuary',
    },
    {
      id: 'pattern-memory',
      milestone: 'Station 3',
      title: 'River Journey',
      subtitle: 'Pattern Memory',
      elevation: '1,120m',
      icon: '🏞️',
      theme: 'from-[#1A535C] to-[#0F353C]',
      accentColor: '#1A535C',
      locationName: 'Brahmaputra Waters',
    },
    {
      id: 'odd-one-out',
      milestone: 'Station 4',
      title: 'Forest Canopy',
      subtitle: 'Attention & Focus',
      elevation: '1,540m',
      icon: '🦜',
      theme: 'from-[#40916C] to-[#2D6A4F]',
      accentColor: '#40916C',
      locationName: 'Pine Ridge Trail',
    },
    {
      id: 'memory-basket',
      milestone: 'Station 5',
      title: 'Harvest Basket',
      subtitle: 'Everyday Recall',
      elevation: '1,890m',
      icon: '🧺',
      theme: 'from-[#D98A1E] to-[#92540B]',
      accentColor: '#D98A1E',
      locationName: 'Muga Silk Courtyard',
    },
    {
      id: 'daily-routine',
      milestone: 'Station 6',
      title: 'Village Rhythm',
      subtitle: 'Routine Sequencing',
      elevation: '2,200m',
      icon: '🏡',
      theme: 'from-[#1E5E3A] to-[#164E30]',
      accentColor: '#1E5E3A',
      locationName: 'Sub-Himalayan Village',
    },
    {
      id: 'family-memory',
      milestone: 'Station 7',
      title: 'Mountain Hearth',
      subtitle: 'Loved Ones Memory',
      elevation: '2,600m',
      icon: '❤️',
      theme: 'from-[#BA1A1A] to-[#801010]',
      accentColor: '#BA1A1A',
      locationName: 'Family Hearth Home',
    },
  ];

  return (
    <div className="relative py-2 space-y-4">
      {/* Visual Trail Node Cards */}
      <div className="relative space-y-3.5">
        {waypoints.map((wp, idx) => {
          const matchedGame = games.find(g => g.id === wp.id) || {
            id: wp.id,
            name: wp.title,
            description: wp.subtitle,
            target: 'Cognitive exercise',
            category: 'memory',
          };

          return (
            <div
              key={wp.id}
              onClick={() => onSelectGame && onSelectGame(matchedGame)}
              className="relative group p-4 sm:p-5 rounded-3xl bg-white border-2 border-[#D8E2D9] hover:border-[#1E5E3A] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden active:scale-[0.99] touch-target"
            >
              {/* Subtle top landscape strip indicator */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: wp.accentColor }}
              />

              <div className="flex items-center justify-between gap-3 pt-1">
                {/* Left: Station Node & Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Visual Stepping Stone / Station Badge */}
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${wp.theme} text-white flex flex-col items-center justify-center shadow-md flex-shrink-0 group-hover:scale-105 transition-transform border border-white/20`}
                  >
                    <span className="text-2xl">{wp.icon}</span>
                    <span className="text-[9px] font-black text-amber-200 tracking-wider">
                      {wp.elevation}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C68215]">
                        {wp.milestone} • {wp.locationName}
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-[#EBF5EE] text-[#1E5E3A] border border-[#C3E2CD]">
                        Level {currentLevel}
                      </span>
                    </div>

                    <h4 className="text-base sm:text-lg font-black text-[#162832] truncate mt-0.5 group-hover:text-[#1E5E3A] transition-colors">
                      {wp.title}
                    </h4>

                    <p className="text-xs text-slate-500 font-semibold truncate">
                      {wp.subtitle} — {matchedGame.target || 'Gentle cognitive walk'}
                    </p>
                  </div>
                </div>

                {/* Right Action Button */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-10 h-10 rounded-2xl bg-[#EBF5EE] text-[#1E5E3A] group-hover:bg-[#1E5E3A] group-hover:text-white transition-all flex items-center justify-center font-black shadow-2xs border border-[#C3E2CD]">
                    <span className="text-sm">▶</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 6. Tactile Bamboo / Cane Framing for Memories and Portraits
export function BambooFrame({ children, className = '', label = null }) {
  return (
    <div className={`relative p-3 sm:p-4 rounded-3xl bg-[#FAF7F2] border-2 border-[#E5DFD3] shadow-sm ${className}`}>
      {/* Corner Bamboo Knot Accents */}
      <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-[#C68215] opacity-60" />
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#C68215] opacity-60" />
      <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-[#C68215] opacity-60" />
      <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-[#C68215] opacity-60" />

      {label && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-[#E5DFD3] text-[#92540B] text-[11px] font-extrabold mb-2">
          <span>🎋</span>
          <span>{label}</span>
        </div>
      )}

      {children}
    </div>
  );
}

// 7. Tea Leaf Sprig ("Two Leaves and a Bud" / দুটি পাত এটি কলি)
export function TeaLeafSprig({ className = 'w-5 h-5', color = '#1E5E3A' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Central Stem */}
      <path
        d="M12 21C12 17 12.5 12 12 7"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Tender Bud (Center Top) */}
      <path
        d="M12 7C11.5 5 12 3 12 2C12.5 3 13 5 12 7Z"
        fill={color}
      />
      {/* Left Leaf */}
      <path
        d="M12 13C8.5 12 4.5 7.5 5 4C8.5 4.5 11.5 8.5 12 13Z"
        fill={color}
        fillOpacity="0.9"
      />
      {/* Left Leaf Vein */}
      <path
        d="M12 13C9 10 7 7 5 4"
        stroke="#FFFFFF"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Right Leaf */}
      <path
        d="M12 11C15.5 10 19.5 5.5 19 2C15.5 2.5 12.5 6.5 12 11Z"
        fill={color}
      />
      {/* Right Leaf Vein */}
      <path
        d="M12 11C15 8 17 5 19 2"
        stroke="#FFFFFF"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}

// 8. Traditional Assamese Jaapi Hat (জাপি - Conical Bamboo Woven Sun Hat with Red Phulam)
export function JaapiHat({ className = 'w-7 h-7' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Woven Rim */}
      <circle cx="20" cy="20" r="18" fill="#FBF5E8" stroke="#D18F26" strokeWidth="1.5" />
      <circle cx="20" cy="20" r="15.5" stroke="#C92A2A" strokeWidth="1" strokeDasharray="1.5,1.5" />

      {/* Red Woven Decorative Rays (Traditional 8-pointed Phulam Pattern) */}
      <polygon points="20,4 22,14 18,14" fill="#C92A2A" />
      <polygon points="20,36 22,26 18,26" fill="#C92A2A" />
      <polygon points="4,20 14,22 14,18" fill="#C92A2A" />
      <polygon points="36,20 26,22 26,18" fill="#C92A2A" />

      <polygon points="9,9 18,16 15,19" fill="#C92A2A" />
      <polygon points="31,31 22,24 25,21" fill="#C92A2A" />
      <polygon points="31,9 22,16 25,19" fill="#C92A2A" />
      <polygon points="9,31 18,24 15,21" fill="#C92A2A" />

      {/* Center Bamboo Cone / Knot */}
      <circle cx="20" cy="20" r="5" fill="#C92A2A" />
      <circle cx="20" cy="20" r="2.5" fill="#FBF5E8" />
      <circle cx="20" cy="20" r="1.2" fill="#D18F26" />
    </svg>
  );
}

// 9. Cultural Companion Badge
export function NorthEastBadge({ label = 'North East India', className = '' }) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF5EE] border border-[#C3E2CD] text-[#1E5E3A] text-xs font-extrabold tracking-wide shadow-2xs ${className}`}>
      <TeaLeafSprig className="w-4 h-4 text-[#1E5E3A]" />
      <span>{label}</span>
    </div>
  );
}

// 10. Bamboo / Cane Decorative Border
export function BambooBorder({ className = '' }) {
  return (
    <div className={`w-full h-1 bg-gradient-to-r from-[#D98A1E]/40 via-[#F4D396]/60 to-[#D98A1E]/40 ${className}`} />
  );
}

// 11. Seven Sisters Regional Badge
export function SevenSistersBadge({ className = '' }) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFF6E5] border border-[#F7D59A] text-[#92540B] text-[11px] font-extrabold ${className}`}>
      <span className="text-[10px]">✨</span>
      <span>Seven Sisters Region</span>
    </div>
  );
}

// 12. Subtle Misty Mountains Silhouette Background
export function SubtleMistyMountains({ className = '', opacity = 'opacity-10' }) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${opacity} select-none ${className}`}>
      <svg
        className="w-full h-full object-cover"
        viewBox="0 0 1000 300"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,150 Q200,80 450,130 T850,90 T1000,120 L1000,300 L0,300 Z"
          fill="#3D6B82"
        />
        <path
          d="M0,190 Q250,130 550,180 T900,140 T1000,170 L1000,300 L0,300 Z"
          fill="#1B4D3E"
        />
        <path
          d="M0,230 Q300,180 650,220 T950,190 T1000,210 L1000,300 L0,300 Z"
          fill="#164E30"
        />
      </svg>
    </div>
  );
}

// 13. Authentic Traditional Assamese Gamcha / Gamosa (গামোচা) Border
// Features crisp white cotton ground, terracotta red woven pari borders, stepped-pyramid phulam floral motifs, and fringe accents
export function TraditionalGamchaBorder({ className = '', height = 12, showFringes = false }) {
  return (
    <div className={`w-full overflow-hidden select-none bg-white relative ${className}`} style={{ height: `${height}px` }}>
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="repeat-x"
        viewBox="0 0 80 12"
      >
        <defs>
          <pattern id="gamcha-authentic-pattern" width="80" height="12" patternUnits="userSpaceOnUse">
            {/* Crisp Pure White Cotton Background */}
            <rect width="80" height="12" fill="#FFFFFF" />

            {/* Top & Bottom Terracotta Red Longitudinal Borders (Pari) */}
            <line x1="0" y1="1" x2="80" y2="1" stroke="#BA1A1A" strokeWidth="1.2" />
            <line x1="0" y1="2.5" x2="80" y2="2.5" stroke="#BA1A1A" strokeWidth="0.5" strokeDasharray="1,1" />

            <line x1="0" y1="9.5" x2="80" y2="9.5" stroke="#BA1A1A" strokeWidth="0.5" strokeDasharray="1,1" />
            <line x1="0" y1="11" x2="80" y2="11" stroke="#BA1A1A" strokeWidth="1.2" />

            {/* Traditional Phulam Geometric Stepped Flowers (Diamond Trellis with Center Blossom) */}
            {/* Motif 1 at x=20 */}
            <g fill="#BA1A1A">
              {/* Stepped Diamond Outer */}
              <polygon points="20,3.5 24,6 20,8.5 16,6" fill="none" stroke="#BA1A1A" strokeWidth="0.8" />
              {/* Inner Center Flower Point */}
              <polygon points="20,4.5 22,6 20,7.5 18,6" />
              <circle cx="20" cy="6" r="0.8" fill="#F8FAFC" />
              {/* Flanking Floral Buds */}
              <polygon points="13,5 14.5,6 13,7 11.5,6" />
              <polygon points="27,5 28.5,6 27,7 25.5,6" />
              {/* Micro Corner Crosses */}
              <rect x="19.5" y="2.5" width="1" height="1" />
              <rect x="19.5" y="8.5" width="1" height="1" />
            </g>

            {/* Motif 2 at x=60 */}
            <g fill="#BA1A1A">
              <polygon points="60,3.5 64,6 60,8.5 56,6" fill="none" stroke="#BA1A1A" strokeWidth="0.8" />
              <polygon points="60,4.5 62,6 60,7.5 58,6" />
              <circle cx="60" cy="6" r="0.8" fill="#F8FAFC" />
              <polygon points="53,5 54.5,6 53,7 51.5,6" />
              <polygon points="67,5 68.5,6 67,7 65.5,6" />
              <rect x="59.5" y="2.5" width="1" height="1" />
              <rect x="59.5" y="8.5" width="1" height="1" />
            </g>

            {/* Subtle Chevron Weave Spacers */}
            <path d="M38,4 L40,6 L38,8" fill="none" stroke="#BA1A1A" strokeWidth="0.8" strokeLinecap="round" />
            <path d="M42,4 L44,6 L42,8" fill="none" stroke="#BA1A1A" strokeWidth="0.8" strokeLinecap="round" />
            <path d="M78,4 L80,6 L78,8" fill="none" stroke="#BA1A1A" strokeWidth="0.8" strokeLinecap="round" />
            <path d="M-2,4 L0,6 L-2,8" fill="none" stroke="#BA1A1A" strokeWidth="0.8" strokeLinecap="round" />
          </pattern>
        </defs>
        <rect width="100%" height="12" fill="url(#gamcha-authentic-pattern)" />
      </svg>
      {showFringes && (
        <div className="flex justify-between w-full h-1 overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <span key={i} className="w-0.5 h-full bg-[#BA1A1A] opacity-70" />
          ))}
        </div>
      )}
    </div>
  );
}

// 14. North-Eastern Tribal Geometric Textile Divider (Naga, Mizo & Manipuri Inspired)
export function TribalGeometricDivider({ className = '', height = 8 }) {
  return (
    <div className={`w-full overflow-hidden select-none ${className}`} style={{ height: `${height}px` }}>
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="repeat-x"
        viewBox="0 0 40 8"
      >
        <defs>
          <pattern id="tribal-chevron-pattern" width="40" height="8" patternUnits="userSpaceOnUse">
            {/* Background */}
            <rect width="40" height="8" fill="#FFFDF9" />
            {/* Top & Bottom Accent Lines */}
            <line x1="0" y1="0.5" x2="40" y2="0.5" stroke="#BA1A1A" strokeWidth="0.8" />
            <line x1="0" y1="7.5" x2="40" y2="7.5" stroke="#BA1A1A" strokeWidth="0.8" />

            {/* Vibrant Terracotta Red Chevron */}
            <polygon points="0,1 10,7 20,1 17,1 10,5 3,1" fill="#BA1A1A" />
            <polygon points="20,1 30,7 40,1 37,1 30,5 23,1" fill="#BA1A1A" />

            {/* Turmeric Muga Yellow Inverted Triangle */}
            <polygon points="10,1 15,4 20,1" fill="#D98A1E" />
            <polygon points="30,1 35,4 40,1" fill="#D98A1E" />
            <polygon points="0,1 5,4 10,1" fill="#D98A1E" />

            {/* Center Turquoise / Emerald Bead */}
            <circle cx="10" cy="4" r="0.9" fill="#1E5E3A" />
            <circle cx="30" cy="4" r="0.9" fill="#1E5E3A" />
          </pattern>
        </defs>
        <rect width="100%" height="8" fill="url(#tribal-chevron-pattern)" />
      </svg>
    </div>
  );
}

// 15. Bamboo / Cane Weave Subtle Divider Line
export function BambooWeaveDivider({ className = '', height = 6 }) {
  return (
    <div className={`w-full overflow-hidden select-none ${className}`} style={{ height: `${height}px` }}>
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="repeat-x"
        viewBox="0 0 24 6"
      >
        <defs>
          <pattern id="bamboo-mat-pattern" width="24" height="6" patternUnits="userSpaceOnUse">
            <rect width="24" height="6" fill="#FBF7EE" />
            {/* Alternating Woven Bamboo Strips */}
            <rect x="0" y="0.5" width="5.5" height="5" fill="#E8D5B5" stroke="#C69E65" strokeWidth="0.5" rx="0.5" />
            <rect x="6" y="0.5" width="5.5" height="5" fill="#DFCA9D" stroke="#B88A4C" strokeWidth="0.5" rx="0.5" />
            <rect x="12" y="0.5" width="5.5" height="5" fill="#E8D5B5" stroke="#C69E65" strokeWidth="0.5" rx="0.5" />
            <rect x="18" y="0.5" width="5.5" height="5" fill="#DFCA9D" stroke="#B88A4C" strokeWidth="0.5" rx="0.5" />
            {/* Interlacing Cross Grain Line */}
            <line x1="0" y1="3" x2="24" y2="3" stroke="#92540B" strokeWidth="0.5" opacity="0.4" strokeDasharray="3,3" />
          </pattern>
        </defs>
        <rect width="100%" height="6" fill="url(#bamboo-mat-pattern)" />
      </svg>
    </div>
  );
}

// 16. Kopou Phool (কপৌ ফুল / Foxtail Orchid) - Beloved State Flower of Assam
export function OrchidFloraIcon({ className = 'w-6 h-6', color = '#D946EF' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Arching Floral Spire Stem */}
      <path
        d="M6 21C7 16 9 10 17 5"
        stroke="#1E5E3A"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Flower 1 (Base) */}
      <circle cx="8" cy="17" r="2.5" fill="#E879F9" opacity="0.95" />
      <circle cx="8" cy="17" r="1.2" fill="#FDE047" />
      {/* Flower 2 */}
      <circle cx="10" cy="14" r="2.8" fill="#D946EF" opacity="0.95" />
      <circle cx="10" cy="14" r="1.3" fill="#FDE047" />
      {/* Flower 3 */}
      <circle cx="13" cy="11" r="2.8" fill="#C026D3" opacity="0.95" />
      <circle cx="13" cy="11" r="1.3" fill="#FDE047" />
      {/* Flower 4 */}
      <circle cx="15" cy="8" r="2.5" fill="#D946EF" opacity="0.95" />
      <circle cx="15" cy="8" r="1.1" fill="#FDE047" />
      {/* Flower 5 (Tip Bud) */}
      <circle cx="17.5" cy="5" r="2" fill="#F0ABFC" />
      <circle cx="19" cy="3" r="1.2" fill="#F5D0FE" />
      {/* Delicate Orchid Leaf */}
      <path
        d="M6 21C4 18 3 15 5 13C6.5 15 6 18 6 21Z"
        fill="#2D6A4F"
      />
    </svg>
  );
}

// 17. LANDMARK 1: MAJULI ISLAND ON THE BRAHMAPUTRA (Patient Dashboard Header)
// Full-bleed artwork showcasing Majuli: world's largest river island, morning sunrise over the Brahmaputra, traditional wooden country boat, water lilies, river mist, and authentic traditional gamcha trim
export function MajuliIslandHeader({ className = '', children }) {
  return (
    <div className={`relative w-full overflow-hidden bg-gradient-to-b from-[#FFF5E6] via-[#FFF9EE] to-[#F5FAF6] border-b border-[#D8E2D9] ${className}`}>
      {/* Scenic SVG Canvas */}
      <div className="absolute inset-0 pointer-events-none">
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 1000 240"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Sunrise on Brahmaputra Gradient */}
            <linearGradient id="majuli-sky-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.8" />
              <stop offset="30%" stopColor="#FED7AA" stopOpacity="0.7" />
              <stop offset="65%" stopColor="#FEE2E2" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#EBF5EE" stopOpacity="0.9" />
            </linearGradient>

            {/* Sun Glow */}
            <radialGradient id="majuli-sun-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FEF08A" stopOpacity="1" />
              <stop offset="40%" stopColor="#F59E0B" stopOpacity="0.85" />
              <stop offset="80%" stopColor="#EA580C" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
            </radialGradient>

            {/* River Waters Gradient */}
            <linearGradient id="brahmaputra-water-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.6" />
              <stop offset="40%" stopColor="#E2E8F0" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#FEF3C7" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#F1F5F9" stopOpacity="0.95" />
            </linearGradient>

            {/* Morning River Mist */}
            <linearGradient id="river-mist-soft" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.85" />
            </linearGradient>
          </defs>

          {/* Sky Canvas */}
          <rect width="1000" height="240" fill="url(#majuli-sky-grad)" />

          {/* Rising Morning Sun behind Majuli Sandbars */}
          <circle cx="760" cy="55" r="48" fill="url(#majuli-sun-glow)" />
          <circle cx="760" cy="55" r="18" fill="#FFFBEB" />

          {/* Distant Migratory Cranes Flying in V-formation */}
          <g fill="#92540B" opacity="0.65">
            <path d="M680,32 Q683,28 686,32 Q689,28 692,32 Q689,34 686,32 Q683,34 680,32 Z" />
            <path d="M700,26 Q703,22 706,26 Q709,22 712,26 Q709,28 706,26 Q703,28 700,26 Z" />
            <path d="M720,22 Q723,18 726,22 Q729,18 732,22 Q729,24 726,22 Q723,24 720,22 Z" />
            <path d="M738,28 Q741,24 744,28 Q747,24 750,28 Q747,30 744,28 Q741,30 738,28 Z" />
          </g>

          {/* Distant Majuli Chapori (River Sandbanks & Silhouetted Satra Hermitage Trees) */}
          <path
            d="M0,95 Q180,82 380,92 T720,86 T1000,90 L1000,140 L0,140 Z"
            fill="#8BA79B"
            opacity="0.55"
          />

          {/* Silhouetted Riverbank Palms & Bamboo Groves */}
          <g fill="#43765F" opacity="0.6">
            <path d="M120,95 Q125,70 120,55 Q130,65 135,95 Z" />
            <circle cx="123" cy="56" r="8" />
            <path d="M136,95 Q140,75 138,62 Q146,72 148,95 Z" />
            <circle cx="139" cy="63" r="6.5" />
            {/* Satra Temple Shikhara Silhouette on Island */}
            <polygon points="340,94 345,68 350,94" />
            <line x1="345" y1="68" x2="345" y2="62" stroke="#43765F" strokeWidth="1.5" />
            <polygon points="353,94 356,76 359,94" />
          </g>

          {/* Mid-river Sandbank */}
          <path
            d="M0,115 Q240,102 520,116 T880,110 T1000,118 L1000,240 L0,240 Z"
            fill="url(#brahmaputra-water-grad)"
          />

          {/* Traditional Majuli Country Boat (Nao) with Boatman */}
          <g transform="translate(620, 108)" opacity="0.85">
            {/* Wooden Boat Hull */}
            <path d="M0,14 Q35,20 85,14 Q92,11 96,6 Q80,16 12,16 Q-4,11 0,14 Z" fill="#4B382A" />
            {/* Curved Prow and Stern */}
            <path d="M-5,7 Q-2,14 12,16" stroke="#2B1D0C" strokeWidth="2.5" fill="none" />
            <path d="M96,6 Q90,14 75,16" stroke="#2B1D0C" strokeWidth="2" fill="none" />
            {/* Thatched Bamboo Hood (Chhoi) */}
            <path d="M22,14 Q38,2 58,14 Z" fill="#C69E65" stroke="#92540B" strokeWidth="0.8" />
            {/* Boatman with Oar (Dand) */}
            <circle cx="78" cy="4" r="3.5" fill="#4B382A" />
            <path d="M75,7 L82,14 L73,14 Z" fill="#4B382A" />
            <line x1="77" y1="6" x2="90" y2="24" stroke="#4B382A" strokeWidth="1.5" strokeLinecap="round" />
            {/* Water Ripple around boat */}
            <ellipse cx="48" cy="18" rx="55" ry="2.5" fill="#FEF3C7" opacity="0.7" />
          </g>

          {/* Foreground River Reeds & Floating Water Hyacinths (Koli / Bhet Phul) */}
          <g fill="#2D6A4F" opacity="0.75">
            <path d="M20,240 Q25,185 18,160 Q28,180 32,240 Z" />
            <path d="M35,240 Q40,175 35,150 Q45,170 48,240 Z" />
            <path d="M50,240 Q62,190 70,170 Q66,195 62,240 Z" />
          </g>

          {/* Blooming Water Lilies (Bhet Phul) */}
          <g transform="translate(65, 205)">
            <ellipse cx="0" cy="0" rx="14" ry="4.5" fill="#1E5E3A" opacity="0.85" />
            {/* Pink Blossom */}
            <circle cx="-1" cy="-3" r="4.5" fill="#F472B6" />
            <circle cx="2" cy="-4" r="3.5" fill="#FBCFE8" />
            <circle cx="0" cy="-3" r="1.5" fill="#FEF08A" />
          </g>

          {/* Soft River Fog Veil at Bottom for High Contrast Content */}
          <rect y="120" width="1000" height="120" fill="url(#river-mist-soft)" />
        </svg>
      </div>

      {/* Traditional Assamese Gamcha Border at Very Top of Header */}
      <TraditionalGamchaBorder height={8} />

      {/* Embedded Header Content */}
      <div className="relative z-10 p-4 sm:p-6">
        {children}
      </div>

      {/* Subtle Bottom Gamcha Border */}
      <TraditionalGamchaBorder height={6} />
    </div>
  );
}

// 18. LANDMARK 2: LIVING ROOT BRIDGES OF MEGHALAYA (Caregiver Dashboard Header)
// Full-bleed artwork showcasing the iconic living ficus root bridges of Meghalaya spanning a crystalline jungle river gorge, with sunbeams, mossy rocks, and traditional gamcha trim
export function LivingRootBridgeHeader({ className = '', children }) {
  return (
    <div className={`relative w-full overflow-hidden bg-gradient-to-b from-[#0F2D1F] via-[#164E30] to-[#1E5E3A] text-white shadow-md border-b-2 border-[#D98A1E]/40 ${className}`}>
      {/* Scenic SVG Backdrop */}
      <div className="absolute inset-0 pointer-events-none opacity-45">
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 1000 240"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Crepuscular Sunbeams (Sun rays through misty rainforest) */}
            <linearGradient id="sunbeam-grad" x1="0%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#FEF08A" stopOpacity="0" />
            </linearGradient>

            {/* Clear Turquoise Mountain River */}
            <linearGradient id="root-river-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0E7490" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#065F46" stopOpacity="0.95" />
            </linearGradient>
          </defs>

          {/* Deep Forest Canopy */}
          <rect width="1000" height="240" fill="#0A2117" />

          {/* Sunbeams Piercing Mist */}
          <polygon points="350,0 480,240 400,240 330,0" fill="url(#sunbeam-grad)" />
          <polygon points="520,0 680,240 590,240 490,0" fill="url(#sunbeam-grad)" />
          <polygon points="700,0 860,240 780,240 670,0" fill="url(#sunbeam-grad)" />

          {/* Rushing Crystalline River at Bottom of Gorge */}
          <path d="M0,175 Q250,160 500,178 T1000,168 L1000,240 L0,240 Z" fill="url(#root-river-grad)" />

          {/* Mossy River Boulders & Stepping Stones */}
          <g fill="#1F3D2E">
            <ellipse cx="140" cy="210" rx="45" ry="22" />
            <ellipse cx="280" cy="225" rx="55" ry="26" />
            <ellipse cx="510" cy="215" rx="65" ry="28" fill="#143122" />
            <ellipse cx="780" cy="220" rx="75" ry="30" />
            <ellipse cx="920" cy="210" rx="50" ry="24" />
          </g>

          {/* THE ICONIC LIVING ROOT BRIDGE (Jingkieng Jri) */}
          {/* Main Structural Living Root Trunks (Spanning Gorge) */}
          <g stroke="#3D2614" strokeLinecap="round">
            {/* Primary lower root trunk walkway */}
            <path d="M-10,135 Q180,165 480,158 T1010,130" strokeWidth="18" fill="none" />
            <path d="M-10,133 Q180,162 480,156 T1010,128" stroke="#52361D" strokeWidth="12" fill="none" />
            <path d="M-10,131 Q180,160 480,154 T1010,126" stroke="#2D6A4F" strokeWidth="4" strokeDasharray="6,8" fill="none" opacity="0.85" />

            {/* Handrail Roots (Living upper railings) */}
            <path d="M-10,105 Q190,130 490,122 T1010,95" strokeWidth="8" fill="none" />
            <path d="M-10,103 Q190,128 490,120 T1010,93" stroke="#634224" strokeWidth="5" fill="none" />

            {/* Second Upper Tier (Double-Decker impression) */}
            <path d="M220,78 Q480,98 750,72" stroke="#452A16" strokeWidth="9" fill="none" opacity="0.9" />
            <path d="M220,58 Q480,76 750,52" stroke="#452A16" strokeWidth="5" fill="none" opacity="0.8" />

            {/* Vertical Intertwined Living Root Struts & Vines */}
            <g stroke="#3D2614" strokeWidth="3.5">
              <path d="M120,118 L125,148" />
              <path d="M200,127 L205,160" />
              <path d="M290,128 L293,163" />
              <path d="M380,125 L382,160" />
              <path d="M470,122 L474,158" />
              <path d="M570,118 L572,152" />
              <path d="M680,112 L683,145" />
              <path d="M790,104 L792,136" />
              <path d="M890,98 L892,132" />
            </g>

            {/* Hanging Aerial Root Tendrils Dropping to the River */}
            <g stroke="#26160A" strokeWidth="1.75" opacity="0.75">
              <path d="M240,160 Q245,185 242,210" />
              <path d="M360,162 Q358,190 365,220" />
              <path d="M450,158 Q455,188 450,215" />
              <path d="M640,150 Q642,180 638,212" />
              <path d="M720,144 Q725,175 722,205" />
            </g>
          </g>

          {/* Dense Rainforest Leaf Clusters on Living Roots */}
          <g fill="#2D6A4F" opacity="0.9">
            <circle cx="80" cy="115" r="14" />
            <circle cx="95" cy="110" r="16" fill="#40916C" />
            <circle cx="320" cy="85" r="18" fill="#52B788" />
            <circle cx="480" cy="98" r="22" fill="#2D6A4F" />
            <circle cx="650" cy="82" r="20" fill="#40916C" />
            <circle cx="880" cy="95" r="24" fill="#1B4332" />
          </g>

          {/* Crisp Rising River Mist Veil */}
          <rect y="160" width="1000" height="80" fill="url(#sunbeam-grad)" opacity="0.4" />
        </svg>
      </div>

      {/* Traditional Assamese Gamcha Border at Top */}
      <TraditionalGamchaBorder height={7} />

      {/* Embedded Caregiver Header Content */}
      <div className="relative z-10 p-4 sm:p-6">
        {children}
      </div>

      {/* Traditional Tribal Geometric Divider at Bottom */}
      <TribalGeometricDivider height={6} />
    </div>
  );
}

// 19. LANDMARK 3: BIHU & CHERAW DANCE CELEBRATION (Family Member Dashboard Header)
// Full-bleed artwork showcasing dynamic North-Eastern dance traditions: Assamese Bihu (dhol, pepa, gamosa) and Mizo Cheraw (crossed bamboo rhythm dance), terracotta red and turmeric Muga gold energy
export function BihuCherawDanceHeader({ className = '', children }) {
  return (
    <div className={`relative w-full overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FFF9EE] to-[#FAF5EB] border-b-2 border-[#D98A1E]/30 shadow-md ${className}`}>
      {/* Festive SVG Background */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 1000 220"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Festival Muga Silk & Terracotta Glow */}
            <linearGradient id="bihu-glow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#BA1A1A" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#D98A1E" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#BA1A1A" stopOpacity="0.15" />
            </linearGradient>
          </defs>

          <rect width="1000" height="220" fill="url(#bihu-glow-grad)" />

          {/* Cheraw Crossed Bamboo Dance Poles (Mizoram) */}
          <g stroke="#92540B" strokeWidth="7" strokeLinecap="round" opacity="0.45">
            {/* Horizontal Poles */}
            <line x1="80" y1="170" x2="920" y2="170" />
            <line x1="80" y1="190" x2="920" y2="190" />
            {/* Crossed Rhythm Poles */}
            <line x1="220" y1="140" x2="220" y2="215" stroke="#BA1A1A" strokeWidth="6" />
            <line x1="260" y1="140" x2="260" y2="215" stroke="#BA1A1A" strokeWidth="6" />

            <line x1="480" y1="140" x2="480" y2="215" stroke="#BA1A1A" strokeWidth="6" />
            <line x1="520" y1="140" x2="520" y2="215" stroke="#BA1A1A" strokeWidth="6" />

            <line x1="740" y1="140" x2="740" y2="215" stroke="#BA1A1A" strokeWidth="6" />
            <line x1="780" y1="140" x2="780" y2="215" stroke="#BA1A1A" strokeWidth="6" />
          </g>

          {/* Assamese Bihu Dhol (Two-headed drum) */}
          <g transform="translate(130, 45)" opacity="0.65">
            {/* Barrel drum body */}
            <ellipse cx="40" cy="40" rx="36" ry="24" fill="#C68215" stroke="#78350F" strokeWidth="2" />
            {/* Left & Right Drum Heads with Red Pari Straps */}
            <ellipse cx="6" cy="40" rx="6" ry="22" fill="#FBF7EE" stroke="#BA1A1A" strokeWidth="2.5" />
            <ellipse cx="74" cy="40" rx="6" ry="22" fill="#FBF7EE" stroke="#BA1A1A" strokeWidth="2.5" />
            {/* Zigzag Leather Tuning Cords */}
            <path d="M6,22 L40,32 L74,22 L40,48 L6,58 L40,40 L74,58" stroke="#BA1A1A" strokeWidth="1.5" fill="none" />
            {/* Gamosa Wrapped Around the Dhol */}
            <path d="M22,30 Q40,36 58,30 L60,48 Q40,54 20,48 Z" fill="#FFFFFF" stroke="#BA1A1A" strokeWidth="1.2" />
            <line x1="26" y1="34" x2="54" y2="34" stroke="#BA1A1A" strokeWidth="1" strokeDasharray="1.5,1.5" />
            <line x1="26" y1="44" x2="54" y2="44" stroke="#BA1A1A" strokeWidth="1" strokeDasharray="1.5,1.5" />
          </g>

          {/* Assamese Bihu Pepa (Buffalo Horn Flute with Brass Rings) */}
          <g transform="translate(790, 50)" opacity="0.65">
            {/* Curved Buffalo Horn */}
            <path d="M10,65 Q35,45 85,25 Q95,45 75,68 Q35,78 10,65 Z" fill="#1F2937" stroke="#C68215" strokeWidth="1.8" />
            {/* Flute Pipe & Reed Mouthpiece */}
            <line x1="5" y1="68" x2="-25" y2="82" stroke="#D97706" strokeWidth="4.5" strokeLinecap="round" />
            {/* Brass Binding Rings */}
            <line x1="28" y1="56" x2="22" y2="72" stroke="#F59E0B" strokeWidth="2.5" />
            <line x1="52" y1="44" x2="44" y2="72" stroke="#F59E0B" strokeWidth="2.5" />
            <line x1="72" y1="32" x2="68" y2="70" stroke="#F59E0B" strokeWidth="2.5" />
          </g>

          {/* Festive Kopou Phool (Orchids) and Flying Gamosa Ribbons in the Air */}
          <path
            d="M320,35 Q440,10 560,40 T780,25"
            stroke="#BA1A1A"
            strokeWidth="3.5"
            fill="none"
            opacity="0.4"
            strokeDasharray="8,6"
          />
        </svg>
      </div>

      {/* Traditional Assamese Gamcha Border at Top */}
      <TraditionalGamchaBorder height={7} />

      {/* Embedded Family Header Content */}
      <div className="relative z-10 p-4 sm:p-6">
        {children}
      </div>

      {/* Subtle Bamboo Weave Divider at Bottom */}
      <BambooWeaveDivider height={6} />
    </div>
  );
}

