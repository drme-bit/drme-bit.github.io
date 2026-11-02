import styles from './SignalCable.module.scss';

export function SignalCable() {
  return (
    <div className={styles.scene} aria-hidden="true">
      <svg
        className={styles.art}
        viewBox="0 0 960 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="cable-body" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#45484B" />
            <stop offset=".38" stopColor="#303235" />
            <stop offset="1" stopColor="#1D1F21" />
          </linearGradient>
          <linearGradient id="socket-shell" x1="0" y1="0" x2="1" y2="0">
            <stop stopColor="#55585B" />
            <stop offset=".16" stopColor="#383A3D" />
            <stop offset="1" stopColor="#202224" />
          </linearGradient>
          <linearGradient id="plug-metal" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#989B9D" />
            <stop offset=".45" stopColor="#686B6E" />
            <stop offset="1" stopColor="#414346" />
          </linearGradient>
          <radialGradient id="ambient-glow">
            <stop stopColor="#82959A" stopOpacity=".16" />
            <stop offset="1" stopColor="#82959A" stopOpacity="0" />
          </radialGradient>
          <filter id="blur-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="13" />
          </filter>
          <filter id="plug-shadow" x="-30%" y="-30%" width="160%" height="180%">
            <feDropShadow dx="0" dy="5" stdDeviation="7" floodColor="#000" floodOpacity=".7" />
          </filter>
        </defs>

        <ellipse cx="480" cy="178" rx="180" ry="116" fill="url(#ambient-glow)" />

        <g className={styles.circuit}>
          <path d="M250 98h110v36h73M710 98H600v36h-73M286 252h78v-30h68M674 252h-78v-30h-68" />
          <circle cx="433" cy="134" r="2" />
          <circle cx="527" cy="134" r="2" />
          <circle cx="432" cy="222" r="2" />
          <circle cx="528" cy="222" r="2" />
        </g>

        <path
          className={styles.wire}
          d="M0 279C115 279 154 263 190 237C228 210 235 183 291 178C332 174 359 177 390 177"
        />
        <path
          className={styles.wireGlow}
          d="M0 279C115 279 154 263 190 237C228 210 235 183 291 178C332 174 359 177 390 177"
        />
        <path
          className={styles.wire}
          d="M960 279C845 279 806 263 770 237C732 210 725 183 669 178C628 174 601 177 570 177"
        />
        <path
          className={`${styles.wireGlow} ${styles.reverseFlow}`}
          d="M960 279C845 279 806 263 770 237C732 210 725 183 669 178C628 174 601 177 570 177"
        />

        <g className={styles.plugLeft} filter="url(#plug-shadow)">
          <path d="M390 164h-15v26h15" fill="#292B2D" stroke="#4E5154" strokeWidth="1.3" />
          <path d="M378 166v22m-4-20v18" stroke="#777A7D" strokeOpacity=".32" strokeWidth="1.4" />
          <rect
            x="389"
            y="148"
            width="64"
            height="58"
            rx="9"
            fill="url(#cable-body)"
            stroke="#55585B"
            strokeWidth="1.4"
          />
          <path d="M397 154h46" stroke="#A7AAAC" strokeOpacity=".2" strokeWidth="1.6" />
          <path
            d="M401 165v25m6-25v25m6-25v25"
            stroke="#85888B"
            strokeOpacity=".42"
            strokeWidth="1.5"
          />
          <path d="M447 163h8v28h-8" fill="#252729" stroke="#56595C" strokeWidth="1.2" />
          <path
            d="M455 169h39M455 187h39"
            stroke="url(#plug-metal)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M459 168.5h31M459 186.5h31"
            stroke="#C0C2C3"
            strokeOpacity=".14"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </g>

        <g className={styles.plugRight} filter="url(#plug-shadow)">
          <path d="M570 164h15v26h-15" fill="#292B2D" stroke="#4E5154" strokeWidth="1.3" />
          <path d="M582 166v22m4-20v18" stroke="#777A7D" strokeOpacity=".32" strokeWidth="1.4" />
          <path
            d="M570 148h-48q-14 0-14 14v30q0 14 14 14h48z"
            fill="url(#socket-shell)"
            stroke="#55585B"
            strokeWidth="1.4"
          />
          <path d="M561 154h-34" stroke="#A7AAAC" strokeOpacity=".2" strokeWidth="1.6" />
          <path
            d="M552 165v25m-6-25v25m-6-25v25"
            stroke="#85888B"
            strokeOpacity=".42"
            strokeWidth="1.5"
          />
          <path
            d="M513 160q-8 0-8 8v18q0 8 8 8z"
            fill="#777A7D"
            stroke="#999C9E"
            strokeWidth="1.3"
          />
          <path d="M513 161q-7 0-7 7v18q0 7 7 7z" fill="#26282A" />
          <rect x="508" y="166" width="3.5" height="6" rx="1.7" fill="#101112" />
          <rect x="508" y="181" width="3.5" height="6" rx="1.7" fill="#101112" />
        </g>
      </svg>
    </div>
  );
}
