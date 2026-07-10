"use client";

import { useState } from "react";
import Link from "next/link";

const SKILLS = ["All", "#Python", "#Java", "#JavaScript", "#React", "#Django"];

const SALARY_DATA = [
  { skill: "Python", salary: 135000 },
  { skill: "Java", salary: 115000 },
  { skill: "JavaScript", salary: 115000 },
  { skill: "React", salary: 120000 },
  { skill: "Django", salary: 110000 },
];

const DEMAND_LINES = [
  { label: "Python", color: "#0d3880", points: "0,88 40,72 80,52 120,32 160,16 200,6" },
  { label: "Java", color: "#9ca3af", points: "0,82 40,76 80,68 120,60 160,52 200,44" },
  { label: "JavaScript", color: "#f59e0b", points: "0,80 40,68 80,58 120,46 160,34 200,24" },
  { label: "React", color: "#06b6d4", points: "0,85 40,74 80,60 120,45 160,30 200,18" },
  { label: "Django", color: "#10b981", points: "0,90 40,82 80,74 120,66 160,58 200,50" },
];

function Sidebar() {
  return (
    <aside className="w-[220px] min-h-screen bg-surface border-r border-line flex flex-col shrink-0">
      <div className="px-[18px] py-5 border-b border-line">
        <div className="font-bold text-[17px] text-accent tracking-tight">CFC Project</div>
        <div className="text-[11px] text-muted mt-[1px]">Job market insights</div>
      </div>
      <nav className="flex-1 p-2">
        <Link href="/Market-Overview" className="flex items-center gap-[10px] px-[10px] py-[9px] rounded-lg text-sm bg-accent-soft text-accent font-medium">
          <span className="text-base w-5 text-center">📈</span> Market overview
        </Link>
        <Link href="/" className="flex items-center gap-[10px] px-[10px] py-[9px] rounded-lg text-sm text-muted hover:bg-surface-2 hover:text-text">
          <span className="text-base w-5 text-center">🔍</span> Job listings
        </Link>
        <Link href="/me" className="flex items-center gap-[10px] px-[10px] py-[9px] rounded-lg text-sm text-muted hover:bg-surface-2 hover:text-text">
          <span className="text-base w-5 text-center">👤</span> Me
        </Link>
      </nav>
      <div className="p-2 border-t border-line">
        <Link href="/login" className="flex items-center gap-[10px] px-[10px] py-[9px] rounded-lg text-sm text-muted hover:bg-surface-2 hover:text-text">
          <span className="text-base w-5 text-center">→</span> Login / Register
        </Link>
        <button className="flex items-center gap-[10px] px-[10px] py-[9px] rounded-lg text-sm text-muted hover:bg-surface-2 hover:text-text w-full text-left">
          <span className="text-base w-5 text-center">↩</span> Log off
        </button>
      </div>
    </aside>
  );
}

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

function SalaryChart({ data }: { data: typeof SALARY_DATA }) {
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
          <div key={skill} className="flex flex-col items-center gap-1" style={{ width: 64 }}>
            <span className="text-[10px] text-muted leading-none">
              ${salary.toLocaleString()}
            </span>
            <div
              className="w-full rounded-t bg-accent"
              style={{ height: Math.round((salary / max) * 80) }}
            />
            <span className="text-[11px] text-muted text-center">{skill}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DemandChart({ lines }: { lines: typeof DEMAND_LINES }) {
  if (lines.length === 0) {
    return (
      <div className="bg-surface rounded-2xl p-5">
        <p className="text-sm font-semibold mb-4">Demand trend</p>
        <div className="h-32 flex items-center justify-center text-muted text-sm">
          No trend data for this filter
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl p-5">
      <p className="text-sm font-semibold mb-3">Demand trend</p>
      <svg viewBox="0 0 200 100" className="w-full h-32" preserveAspectRatio="none">
        {lines.map((line) => (
          <polyline
            key={line.label}
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
          <div key={line.label} className="flex items-center gap-1.5 text-xs text-muted">
            <span
              className="inline-block w-4 rounded"
              style={{ height: 2, backgroundColor: line.color }}
            />
            {line.label}
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

  const salaryToShow =
    activeSkill === "All"
      ? SALARY_DATA.slice(0, 3)
      : SALARY_DATA.filter((d) => `#${d.skill}` === activeSkill);

  const linesToShow =
    activeSkill === "All"
      ? DEMAND_LINES.filter((l) => l.label === "Python" || l.label === "Java")
      : DEMAND_LINES.filter((l) => `#${l.label}` === activeSkill);

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-8">
        <h1 className="text-3xl font-bold text-text">Market overview</h1>
        <p className="text-muted mt-1 mb-8 text-sm">
          Insights into salary trends, skill demand, and job locations
        </p>

        <div className="mb-6">
          <SkillFilter active={activeSkill} onSelect={setActiveSkill} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SalaryChart data={salaryToShow} />
          <DemandChart lines={linesToShow} />
          <JobLocations />
        </div>
      </main>
    </div>
  );
}
