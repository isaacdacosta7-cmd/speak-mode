export default function SpeakBuddy({ variant = 'study', compact = false }) {
  const isLocked = variant === 'locked';
  const isCelebrate = variant === 'celebrate';
  const isPhrases = variant === 'phrases';

  return (
    <div className={`buddy buddy-${variant} ${compact ? 'buddy-compact' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 260 220" role="img">
        <defs>
          <filter id={`shadow-${variant}`} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="8" stdDeviation="8" floodOpacity=".10" />
          </filter>
        </defs>

        <g filter={`url(#shadow-${variant})`}>
          <ellipse cx="130" cy="194" rx="72" ry="15" fill="#e8e8df" />

          <path
            d="M69 92c0-35 27-63 61-63s61 28 61 63v46c0 34-27 59-61 59s-61-25-61-59V92Z"
            fill="#fff"
            stroke="#111318"
            strokeWidth="6"
          />

          <path
            d="M74 92c4-38 28-63 58-63 28 0 52 20 59 53-18-14-36-19-55-16-20 3-38 12-62 26Z"
            fill="#6570ff"
          />

          <circle cx="105" cy="111" r="6" fill="#111318" />
          <circle cx="155" cy="111" r="6" fill="#111318" />

          {isCelebrate ? (
            <path d="M112 137c11 13 26 13 37 0" fill="none" stroke="#111318" strokeWidth="5" strokeLinecap="round" />
          ) : (
            <path d="M118 137c8 6 16 6 24 0" fill="none" stroke="#111318" strokeWidth="5" strokeLinecap="round" />
          )}

          <path d="M66 95c-16 1-23 12-23 28v19" fill="none" stroke="#111318" strokeWidth="7" strokeLinecap="round" />
          <path d="M194 95c16 1 23 12 23 28v19" fill="none" stroke="#111318" strokeWidth="7" strokeLinecap="round" />
          <rect x="34" y="132" width="24" height="43" rx="12" fill="#d8ff59" stroke="#111318" strokeWidth="5" />
          <rect x="202" y="132" width="24" height="43" rx="12" fill="#d8ff59" stroke="#111318" strokeWidth="5" />

          {isPhrases ? (
            <>
              <rect x="15" y="34" width="77" height="48" rx="14" fill="#d8ff59" stroke="#111318" strokeWidth="4" />
              <path d="M72 77l10 16 2-19" fill="#d8ff59" stroke="#111318" strokeWidth="4" strokeLinejoin="round" />
              <circle cx="37" cy="57" r="4" fill="#111318" />
              <circle cx="53" cy="57" r="4" fill="#111318" />
              <circle cx="69" cy="57" r="4" fill="#111318" />
            </>
          ) : null}

          {isLocked ? (
            <>
              <rect x="177" y="21" width="60" height="54" rx="16" fill="#111318" />
              <rect x="188" y="43" width="38" height="29" rx="8" fill="#d8ff59" />
              <path d="M196 43v-8c0-11 7-18 11-18s11 7 11 18v8" fill="none" stroke="#d8ff59" strokeWidth="7" strokeLinecap="round" />
              <circle cx="207" cy="57" r="4" fill="#111318" />
            </>
          ) : null}

          {isCelebrate ? (
            <>
              <path d="M30 36l7 13 14 2-10 10 3 14-14-7-13 7 3-14-10-10 14-2 6-13Z" fill="#d8ff59" stroke="#111318" strokeWidth="3" />
              <path d="M219 28l4 9 10 2-7 7 2 10-9-5-9 5 2-10-7-7 10-2 4-9Z" fill="#6570ff" stroke="#111318" strokeWidth="3" />
              <path d="M32 104c8 4 13 9 17 16" stroke="#6570ff" strokeWidth="5" strokeLinecap="round" />
              <path d="M219 96c-8 4-13 9-17 16" stroke="#6570ff" strokeWidth="5" strokeLinecap="round" />
            </>
          ) : null}

          {!isLocked && !isCelebrate && !isPhrases ? (
            <>
              <rect x="88" y="165" width="84" height="43" rx="13" fill="#111318" />
              <rect x="98" y="174" width="64" height="25" rx="7" fill="#f5f5ef" />
              <path d="M113 186h34" stroke="#6570ff" strokeWidth="5" strokeLinecap="round" />
            </>
          ) : null}
        </g>
      </svg>
    </div>
  );
}
