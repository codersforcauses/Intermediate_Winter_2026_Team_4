"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/app/components/Sidebar";

const SKILLS = ["All", "#Python", "#Java", "#JavaScript", "#React", "#Django"];

const LINE_COLORS = ["#0d3880", "#9ca3af", "#f59e0b", "#06b6d4", "#10b981"];

type SalaryItem = { skill: string; salary: number };
type DemandPoint = { date: string | null; count: number };
type DemandData = { [skill: string]: DemandPoint[] };

function SkillFilter({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (skill: string) => void;
}) {
  return (
    <div>
      <p className="text-[11px] tracking-widest uppercase text-muted font-semibold mb-3">
        Filter by skill
      </p>
      <div className="flex flex-wrap gap-2">
        {SKILLS.map((skill) => (
          <button
            key={skill}
            onClick={() => onSelect(skill)}
            className={`px-4 py-1 rounded-full text-sm border transition-colors ${
              active === skill
                ? "bg-accent text-white border-accent"
                : "bg-surface text-muted border-line hover:border-accent hover:text-accent"
            }`}
          >
            {skill}
          </button>
        ))}
      </div>
    </div>
  );
}

function SalaryChart({ data }: { data: SalaryItem[] }) {
  if (data.length === 0) {
    return (
      <div className="bg-surface rounded-2xl p-5">
        <p className="text-sm font-semibold mb-4">Average salary by skill</p>
        <div className="h-32 flex items-center justify-center text-muted text-sm">
          No data for this filter
        </div>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.salary));

  return (
    <div className="bg-surface rounded-2xl p-5">
      <p className="text-sm font-semibold mb-4">Average salary by skill</p>
      <div className="flex items-end justify-around" style={{ height: 120 }}>
        {data.map(({ skill, salary }) => (
          <div key={skill} className="flex flex-col items-center gap-1" style={{ width: 80 }}>
            <span className="text-[10px] text-muted leading-none">
              ${salary.toLocaleString()}
            </span>
            <div
              className="w-full rounded-t bg-accent"
              style={{ height: Math.round((salary / max) * 80) }}
            />
            <span className="text-[10px] text-muted text-center leading-tight">{skill}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DemandChart({ demand }: { demand: DemandData }) {
  const skills = Object.keys(demand);

  if (skills.length === 0) {
    return (
      <div className="bg-surface rounded-2xl p-5">
        <p className="text-sm font-semibold mb-4">Demand trend</p>
        <div className="h-32 flex items-center justify-center text-muted text-sm">
          No trend data for this filter
        </div>
      </div>
    );
  }

  // Find the highest count across all skills, so all lines share the same scale.
  let maxCount = 1;
  skills.forEach((skill) => {
    demand[skill].forEach((p) => {
      if (p.count > maxCount) maxCount = p.count;
    });
  });

  // Build an SVG polyline string for each skill.
  const lines = skills.map((skill, i) => {
    const points = demand[skill];
    const step = points.length > 1 ? 200 / (points.length - 1) : 0;
    const coords = points
      .map((p, idx) => {
        const x = idx * step;
        const y = 100 - (p.count / maxCount) * 90;
        return `${x},${y}`;
      })
      .join(" ");
    return { skill, color: LINE_COLORS[i % LINE_COLORS.length], points: coords };
  });

  return (
    <div className="bg-surface rounded-2xl p-5">
      <p className="text-sm font-semibold mb-3">Demand trend</p>
      <svg viewBox="0 0 200 100" className="w-full h-32" preserveAspectRatio="none">
        {lines.map((line) => (
          <polyline
            key={line.skill}
            points={line.points}
            fill="none"
            stroke={line.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
      <div className="flex flex-wrap gap-3 mt-2">
        {lines.map((line) => (
          <div key={line.skill} className="flex items-center gap-1.5 text-xs text-muted">
            <span
              className="inline-block w-4 rounded"
              style={{ height: 2, backgroundColor: line.color }}
            />
            {line.skill}
          </div>
        ))}
      </div>
    </div>
  );
}

function JobLocations() {
  return (
    <div className="bg-surface rounded-2xl p-5">
      <p className="text-sm font-semibold mb-4">Job locations</p>
      <div
        className="h-36 rounded-lg flex items-center justify-center text-xs text-muted"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #dcdfd8 0, #dcdfd8 1px, transparent 0, transparent 50%)",
          backgroundSize: "8px 8px",
          backgroundColor: "var(--color-surface-2)",
        }}
      >
        Map view — pins per posting + region heat
      </div>
    </div>
  );
}

export default function MarketOverviewPage() {
  const [activeSkill, setActiveSkill] = useState("All");

  // State to hold data fetched from the backend.
  const [salaryData, setSalaryData] = useState<SalaryItem[]>([]);
  const [demandData, setDemandData] = useState<DemandData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // useEffect runs once when the page loads. We fetch data from our Django API.
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/market-overview/")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load data");
        return res.json();
      })
      .then((data) => {
        setSalaryData(data.salary_by_skill || []);
        setDemandData(data.demand_by_skill || {});
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Filter salary data based on the selected skill pill.
  const salaryToShow =
    activeSkill === "All"
      ? salaryData.slice(0, 5)
      : salaryData.filter((d) => `#${d.skill}` === activeSkill);

  // Filter demand data based on the selected skill pill.
  const demandToShow: DemandData =
    activeSkill === "All"
      ? demandData
      : Object.fromEntries(
          Object.entries(demandData).filter(([skill]) => `#${skill}` === activeSkill)
        );

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-8 ml-[220px]">
        <h1 className="text-3xl font-bold text-text">Market overview</h1>
        <p className="text-muted mt-1 mb-8 text-sm">
          Insights into salary trends, skill demand, and job locations
        </p>

        {loading && <p className="text-muted text-sm">Loading data…</p>}
        {error && <p className="text-red-500 text-sm">Error: {error}</p>}

        {!loading && !error && (
          <>
            <div className="mb-6">
              <SkillFilter active={activeSkill} onSelect={setActiveSkill} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SalaryChart data={salaryToShow} />
              <DemandChart demand={demandToShow} />
              <JobLocations />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
