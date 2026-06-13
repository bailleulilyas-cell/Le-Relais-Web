"use client";

import { useEffect, useRef, useState } from "react";

export default function PerfPanel() {
  const fillRef = useRef<SVGCircleElement>(null);
  const [num, setNum] = useState(0);

  useEffect(() => {
    const C = 226.2;
    const target = 99;
    const t = setTimeout(() => {
      if (fillRef.current) {
        fillRef.current.style.strokeDashoffset = String(C - (target / 100) * C);
      }
      const dur = 1700;
      let start: number | null = null;
      const step = (ts: number) => {
        if (start === null) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        setNum(Math.round(e * target));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="perf-panel">
      <div className="pp-head">
        <span className="pp-tag">Notre site, noté par Google</span>
        <span className="pp-live">
          <span className="dot" />
          en direct
        </span>
      </div>
      <div className="pp-gauge-row">
        <div className="pp-ring">
          <svg viewBox="0 0 92 92">
            <circle className="track" cx="46" cy="46" r="36" />
            <circle ref={fillRef} className="fill" cx="46" cy="46" r="36" />
          </svg>
          <div className="pp-ring-val">
            <span className="pp-ring-num">{num}</span>
            <span className="pp-ring-lbl">vitesse</span>
          </div>
        </div>
        <div className="pp-rows">
          <div className="r">
            <span className="k">Accessibilité</span>
            <span className="v">100</span>
          </div>
          <div className="r">
            <span className="k">Référencement</span>
            <span className="v">100</span>
          </div>
          <div className="r">
            <span className="k">Chargement</span>
            <span className="v">0,4 s</span>
          </div>
        </div>
      </div>
      <div className="pp-foot">
        <div className="pp-foot-txt">
          Votre site actuel&nbsp;?
          <br />
          <b>souvent ~40 / 100</b>
        </div>
        <a
          href="https://pagespeed.web.dev/report?url=https://www.lerelaisweb.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="pp-test"
        >
          <span className="pl">▶</span> Tester
        </a>
      </div>
    </div>
  );
}
