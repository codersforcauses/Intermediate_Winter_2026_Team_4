"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/app/components/Sidebar";

const ALL = "All";
const LINE_COLORS = ["#0d3880", "#f59e0b", "#06b6d4", "#10b981", "#9ca3af"];
const MAX_LINES_WHEN_ALL = 5;
const LOW_SAMPLE = 3;

type SalaryItem = { skill: string; salary: number; count: number };
type DemandPoint = { date: string | null; count: number };
type DemandData = { [skill: string]: DemandPoint[] };
type LocationItem = { location: string; count: number };
type MarketData = {
  skills: string[];
  salary_by_skill: SalaryItem[];
  demand_by_skill: DemandData;
  top_locations: LocationItem[];
  posting_count: number;
};

const money = (n: number) => `$${n.toLocaleString("en-AU")}`;

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

// Rounds a maximum up to a "nice" axis limit, e.g. 387 -> 400, 1240 -> 2000.
function niceMax(n: number): number {
  if (n <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(n));
  return Math.ceil(n / magnitude) * magnitude;
}

function Card({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface rounded-2xl p-5">
      <p className="text-sm font-semibold mb-4">{title}</p>
      {children}
      {note && <p className="text-[11px] text-muted mt-4">{note}</p>}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="h-32 flex items-center justify-center text-center text-muted text-sm px-4">{children}</div>;
}

// A row of "label | bar | value", used by the salary, snapshot and location charts.
function BarRow({ label, value, fraction, detail }: { label: string; value: string; fraction: number; detail?: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-32 shrink-0 truncate" title={label}>
        {label}
      </span>
      <div className="flex-1 h-3 bg-surface-2 rounded">
        <div className="h-3 rounded bg-accent" style={{ width: `${Math.max(2, Math.round(fraction * 100))}%` }} />
      </div>
      <span className="w-36 shrink-0 text-right text-xs">
        {value}
        {detail && <span className="text-muted"> {detail}</span>}
      </span>
    </div>
  );
}

function SkillFilter({ skills, active, onSelect }: { skills: string[]; active: string; onSelect: (skill: string) => void }) {
  return (
    <div>
      <p className="text-[11px] tracking-widest uppercase text-muted font-semibold mb-3">Filter by skill</p>
      <div className="flex flex-wrap gap-2">
        {[ALL, ...skills].map((skill) => (
          <button
            key={skill}
            onClick={() => onSelect(skill)}
            className={`px-4 py-1 rounded-full text-sm border transition-colors ${
              active === skill
                ? "bg-accent text-white border-accent"
                : "bg-surface text-muted border-line hover:border-accent hover:text-accent"
            }`}
          >
            {skill === ALL ? skill : `#${skill}`}
          </button>
        ))}
      </div>
    </div>
  );
}

function SalaryChart({ data, active }: { data: SalaryItem[]; active: string }) {
  const note =
    "Average of postings that list a salary (Adzuna doesn't show one on most). The number in brackets is how many postings each average is based on.";

  if (data.length === 0) {
    return (
      <Card title="Average salary by skill" note={note}>
        <Empty>
          {active === ALL
            ? "No salary data yet. Run fetch_jobs to collect some."
            : `No postings with a listed salary for #${active} yet.`}
        </Empty>
      </Card>
    );
  }

  const max = Math.max(...data.map((d) => d.salary));
  return (
    <Card title="Average salary by skill" note={note}>
      <div className="space-y-3">
        {data.map(({ skill, salary, count }) => (
          <BarRow
            key={skill}
            label={`#${skill}`}
            value={money(salary)}
            detail={`(${count}${count < LOW_SAMPLE ? ", low sample" : ""})`}
            fraction={salary / max}
          />
        ))}
      </div>
    </Card>
  );
}

function DemandChart({ demand, active }: { demand: DemandData; active: string }) {
  // Latest count per skill, highest first.
  const series = Object.entries(demand)
    .filter(([, points]) => points.length > 0)
    .map(([skill, points]) => ({ skill, points, latest: points[points.length - 1].count }))
    .sort((a, b) => b.latest - a.latest);

  if (series.length === 0) {
    return (
      <Card title="Demand trend">
        <Empty>{active === ALL ? "No demand data yet. Run fetch_jobs to record a snapshot." : `No demand data for #${active} yet.`}</Empty>
      </Card>
    );
  }

  const hasTrend = series.some((s) => s.points.length >= 2);

  // With a single day of data there is nothing to draw a line through, so show
  // the latest count per skill instead.
  if (!hasTrend) {
    const max = Math.max(...series.map((s) => s.latest));
    return (
      <Card
        title="Current demand (job postings)"
        note="Trend lines appear once snapshots from at least two different days exist. Run fetch_jobs once a day to build the history."
      >
        <div className="space-y-3">
          {series.map(({ skill, latest }) => (
            <BarRow key={skill} label={`#${skill}`} value={latest.toLocaleString("en-AU")} fraction={latest / max} />
          ))}
        </div>
      </Card>
    );
  }

  const shown = active === ALL ? series.slice(0, MAX_LINES_WHEN_ALL) : series;

  // Chart geometry (SVG user units).
  const W = 420, H = 210, L = 46, R = 14, T = 12, B = 30;
  const innerW = W - L - R;
  const innerH = H - T - B;

  const times = shown.flatMap((s) => s.points.map((p) => (p.date ? Date.parse(p.date) : NaN))).filter((t) => !Number.isNaN(t));
  const minT = Math.min(...times);
  const maxT = Math.max(...times);
  const yMax = niceMax(Math.max(...shown.flatMap((s) => s.points.map((p) => p.count))));
  const x = (t: number) => (maxT === minT ? L + innerW / 2 : L + ((t - minT) / (maxT - minT)) * innerW);
  const y = (count: number) => T + innerH - (count / yMax) * innerH;
  const ticks = [0, yMax / 2, yMax];

  return (
    <Card
      title="Demand trend (job postings)"
      note={active === ALL && series.length > MAX_LINES_WHEN_ALL ? `Showing the top ${MAX_LINES_WHEN_ALL} skills. Pick a skill above to see the others.` : undefined}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Job postings per skill over time">
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={L} x2={W - R} y1={y(tick)} y2={y(tick)} stroke="#dcdfd8" strokeWidth="1" />
            <text x={L - 6} y={y(tick) + 3} textAnchor="end" fontSize="10" fill="#6b7169">
              {tick.toLocaleString("en-AU")}
            </text>
          </g>
        ))}
        <text x={L} y={H - 8} textAnchor="start" fontSize="10" fill="#6b7169">
          {formatDate(new Date(minT).toISOString().slice(0, 10))}
        </text>
        {maxT !== minT && (
          <text x={W - R} y={H - 8} textAnchor="end" fontSize="10" fill="#6b7169">
            {formatDate(new Date(maxT).toISOString().slice(0, 10))}
          </text>
        )}
        {shown.map((s, i) => {
          const color = LINE_COLORS[i % LINE_COLORS.length];
          const pts = s.points.filter((p) => p.date).map((p) => ({ cx: x(Date.parse(p.date as string)), cy: y(p.count) }));
          return (
            <g key={s.skill}>
              <polyline
                points={pts.map((p) => `${p.cx},${p.cy}`).join(" ")}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {pts.map((p, j) => (
                <circle key={j} cx={p.cx} cy={p.cy} r="3" fill={color} />
              ))}
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-3 mt-2">
        {shown.map((s, i) => (
          <div key={s.skill} className="flex items-center gap-1.5 text-xs text-muted">
            <span className="inline-block w-4 rounded" style={{ height: 2, backgroundColor: LINE_COLORS[i % LINE_COLORS.length] }} />
            #{s.skill} · {s.latest.toLocaleString("en-AU")}
          </div>
        ))}
      </div>
    </Card>
  );
}

function TopLocations({ locations, total }: { locations: LocationItem[]; total: number }) {
  const note = `Based on the ${total.toLocaleString("en-AU")} job postings cached from searches, so it reflects what has been searched for, not every job in the market.`;

  if (locations.length === 0) {
    return (
      <Card title="Top job locations" note={note}>
        <Empty>No location data yet.</Empty>
      </Card>
    );
  }

  const max = Math.max(...locations.map((l) => l.count));
  return (
    <Card title="Top job locations" note={note}>
      <div className="space-y-3">
        {locations.map(({ location, count }) => (
          <BarRow
            key={location}
            label={location}
            value={count.toLocaleString("en-AU")}
            detail={total > 0 ? `(${Math.round((count / total) * 100)}%)` : undefined}
            fraction={count / max}
          />
        ))}
      </div>
    </Card>
  );
}

export default function MarketOverviewPage() {
  const [activeSkill, setActiveSkill] = useState(ALL);
  const [data, setData] = useState<MarketData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/django/market-overview")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load market data. Is the backend running?");
        return res.json();
      })
      .then((json: MarketData) => {
        if (!cancelled) setData(json);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const salaryToShow = data ? (activeSkill === ALL ? data.salary_by_skill : data.salary_by_skill.filter((d) => d.skill === activeSkill)) : [];
  const demandToShow: DemandData = data
    ? activeSkill === ALL
      ? data.demand_by_skill
      : Object.fromEntries(Object.entries(data.demand_by_skill).filter(([skill]) => skill === activeSkill))
    : {};

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-8 ml-[220px]">
        <h1 className="text-3xl font-bold text-text">Market overview</h1>
        <p className="text-muted mt-1 mb-8 text-sm">Insights into salary trends, skill demand, and job locations</p>

        {!data && !error && <p className="text-muted text-sm">Loading data…</p>}
        {error && <p className="text-red-500 text-sm">Error: {error}</p>}

        {data && (
          <>
            <div className="mb-6">
              <SkillFilter skills={data.skills} active={activeSkill} onSelect={setActiveSkill} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <SalaryChart data={salaryToShow} active={activeSkill} />
              <DemandChart demand={demandToShow} active={activeSkill} />
              <div className="xl:col-span-2">
                <TopLocations locations={data.top_locations} total={data.posting_count} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
