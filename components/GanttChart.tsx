'use client';

import React, { useEffect, useMemo, useState } from 'react';

type ProjectItem = {
  _id?: string;
  id?: string;
  title: string;
  status: string;
  startDate: string;
  dueDate: string;
};

type TaskItem = {
  _id: string;
  id?: string;
  projectId: string;
  task: string;
  startDate?: string;
  eta: string;
  status: string;
};

interface GanttChartProps {
  projects: ProjectItem[];
  tasks: TaskItem[];
}

const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export default function GanttChart({ projects, tasks }: GanttChartProps) {
  type ViewScale = 'day' | 'month';
  const [viewScale, setViewScale] = useState<ViewScale>('day');
  const [weekInfo, setWeekInfo] = useState<{
    label: string;
    start: Date;
    end: Date;
    left: string;
    width: string;
  } | null>(null);

  const tasksByProject = useMemo(() => {
    const map: Record<string, TaskItem[]> = {};
    (tasks || []).forEach((t) => {
      const pid = t.projectId;
      if (!pid) return;
      if (!map[pid]) map[pid] = [];
      map[pid].push(t);
    });
    return map;
  }, [tasks]);

  // Safe date parsing
  const parse = (s?: string) => {
    if (!s) return undefined;
    const d = new Date(s);
    return !isNaN(d.getTime()) ? d : undefined;
  };

  // Fixed timeline starting from Week 1: 8/8/2025
  const range = useMemo(() => {
    try {
      const week1Start = new Date(2025, 7, 8); // August 8, 2025
      let max: Date = new Date(week1Start);
      
      // Find the latest end date among all projects and tasks
      projects.forEach(p => {
        const e = parse(p.dueDate);
        if (e && e > max) max = e;
      });
      (tasks || []).forEach(t => {
        const e = parse(t.eta);
        if (e && e > max) max = e;
      });
      
      // Ensure we have at least 13 weeks of timeline
      const minWeeks = 13;
      const minEndDate = new Date(week1Start);
      minEndDate.setDate(week1Start.getDate() + (minWeeks * 7) - 1);
      
      if (max < minEndDate) max = minEndDate;
      
      return { start: week1Start, end: max };
    } catch (error) {
      console.error('Error calculating range:', error);
      const fallback = new Date(2025, 7, 8);
      return { start: fallback, end: new Date(2025, 10, 30) };
    }
  }, [projects, tasks]);

  const days: Date[] = useMemo(() => {
    try {
      const arr: Date[] = [];
      let cur = new Date(range.start);
      while (cur <= range.end && arr.length < 370) {
        arr.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
      }
      return arr;
    } catch (error) {
      console.error('Error calculating days:', error);
      return [];
    }
  }, [range]);

  const dayIndex = (d?: string) => {
    try {
      const dt = parse(d);
      if (!dt) return 0;
      const daysDiff = Math.floor((dt.getTime() - range.start.getTime()) / (24 * 3600 * 1000));
      return Math.max(0, Math.min(days.length - 1, daysDiff));
    } catch (error) {
      console.error('Error calculating dayIndex:', error);
      return 0;
    }
  };

  const percentFromDay = (idx: number) => `${(clamp(idx, 0, days.length) / days.length) * 100}%`;

  // Months scale for Month view
  const months: Date[] = useMemo(() => {
    try {
      const arr: Date[] = [];
      const start = new Date(range.start.getFullYear(), range.start.getMonth(), 1);
      const end = new Date(range.end.getFullYear(), range.end.getMonth(), 1);
      let cur = start;
      while (cur <= end && arr.length < 60) {
        arr.push(new Date(cur));
        cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
      }
      return arr;
    } catch (error) {
      console.error('Error calculating months:', error);
      return [];
    }
  }, [range]);

  const monthIndexFromDate = (dateStr?: string) => {
    try {
      const dt = parse(dateStr);
      if (!dt) return 0;
      const anchor = new Date(dt.getFullYear(), dt.getMonth(), 1);
      const idx = months.findIndex(m => m.getFullYear() === anchor.getFullYear() && m.getMonth() === anchor.getMonth());
      if (idx === -1) {
        return dt < range.start ? 0 : months.length - 1;
      }
      return idx;
    } catch (error) {
      console.error('Error calculating monthIndexFromDate:', error);
      return 0;
    }
  };

  // Unified units for sizing and positions
  const units = viewScale === 'day' ? days : months;
  const percentFromIndex = (idx: number) => `${(clamp(idx, 0, units.length) / units.length) * 100}%`;

  const indexFromDate = (dateStr?: string) => {
    return viewScale === 'day' ? dayIndex(dateStr) : monthIndexFromDate(dateStr);
  };

  const indexFromDateEnd = (dateStr?: string, startIdx?: number) => {
    try {
      if (viewScale === 'day') {
        const idx = dayIndex(dateStr) + 1;
        return Math.max(startIdx ?? 0, Math.min(idx, days.length - 1));
      }
      const idx = monthIndexFromDate(dateStr) + 1;
      return Math.max(startIdx ?? 0, Math.min(idx, months.length - 1));
    } catch (error) {
      console.error('Error calculating indexFromDateEnd:', error);
      return startIdx ?? 0;
    }
  };

  // For demo purposes, set "today" to a date that makes sense with the project dates
  const demoToday = new Date(2025, 7, 20); // August 20, 2025 (Week 2)
  const todayIdxDay = Math.floor((demoToday.getTime() - range.start.getTime()) / (24*3600*1000));
  const todayIdxMonthBase = months.findIndex(m => m.getFullYear() === demoToday.getFullYear() && m.getMonth() === demoToday.getMonth());
  const daysInCurMonth = new Date(demoToday.getFullYear(), demoToday.getMonth() + 1, 0).getDate();
  const todayFractionWithinMonth = demoToday.getDate() / daysInCurMonth;
  const todayIdxForScale = viewScale === 'day'
    ? todayIdxDay + 0.5
    : (todayIdxMonthBase < 0 ? (demoToday < range.start ? 0 : months.length) : todayIdxMonthBase) + todayFractionWithinMonth;
  const currentLeft = percentFromIndex(todayIdxForScale);

  // Week groups (day view only) - Fixed to align with actual week boundaries
  const weekGroups = useMemo(() => {
    if (viewScale !== 'day') return [] as { label: string; start: number; end: number; color: string }[];
    const groups: { label: string; start: number; end: number; color: string }[] = [];
    const colors = ['#2dd4bf', '#60a5fa', '#fb923c', '#a78bfa'];
    
    // Calculate weeks based on actual week boundaries starting from Monday
    let currentDate = new Date(range.start);
    let weekStart = 0;
    let weekNumber = 1;
    
    while (weekStart < days.length) {
      const weekEnd = Math.min(days.length, weekStart + 7);
      groups.push({ 
        label: `Week ${weekNumber}`, 
        start: weekStart, 
        end: weekEnd, 
        color: colors[(weekNumber - 1) % colors.length] 
      });
      weekStart = weekEnd;
      weekNumber++;
    }
    
    return groups;
  }, [days, viewScale, range.start]);

  // expand/collapse
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const first = projects[0];
    if (first) setExpanded(prev => ({ ...prev, [(first._id || first.id) as string]: true }));
  }, [projects]);
  const toggle = (pid: string) => setExpanded(prev => ({ ...prev, [pid]: !prev[pid] }));

  // Safety check
  if (!units.length) {
    return <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">Loading Gantt chart...</div>;
  }

  // Debug info
  console.log('Gantt Debug:', {
    rangeStart: range.start.toLocaleDateString(),
    rangeEnd: range.end.toLocaleDateString(),
    daysLength: days.length,
    projects: projects.map(p => ({
      title: p.title,
      start: p.startDate,
      startDate: new Date(p.startDate).toLocaleDateString(),
      dayIndex: dayIndex(p.startDate)
    }))
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Toolbar + Legend */}
      <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="text-lg font-semibold text-gray-900">Gantt Chart</div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 text-xs text-gray-700">
            <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500"></span> Completed (till today)</span>
            <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-300"></span> Remaining</span>
          </div>
          <div className="flex items-center bg-gray-100 rounded-full p-1">
            {(['day','month'] as ViewScale[]).map((v) => (
              <button
                key={v}
                onClick={() => setViewScale(v)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${viewScale===v ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {v === 'day' ? 'Day' : 'Month'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative overflow-x-auto">
        {/* Sticky header: weeks and days/months */}
        <div className="sticky top-0 z-10 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
          {/* Weeks */}
          <div className="relative">
            <div
              className="grid text-[10px] font-semibold text-white"
              style={{ gridTemplateColumns: `280px repeat(${units.length}, minmax(36px, 1fr))` }}
            >
              <div className="py-1 pl-6 bg-white"></div>
              {units.map((_, idx) => (
                <div key={`placeholder-${idx}`} className="py-1 bg-white"></div>
              ))}
              {/* Overlay week spans */}
              {viewScale==='day' && weekGroups.map((g, idx) => (
                <div
                  key={`week-${idx}`}
                  className="absolute top-0 left-0 h-6 flex items-center justify-center rounded-md text-[10px] cursor-pointer hover:opacity-90"
                  style={{
                    marginLeft: `280px`,
                    left: `calc(${percentFromIndex(g.start)})`,
                    width: `calc(${percentFromIndex(g.end)} - ${percentFromIndex(g.start)})`,
                    backgroundColor: g.color
                  }}
                  onMouseEnter={() => {
                    const s = days[g.start];
                    const e = days[Math.max(g.start, g.end - 1)];
                    setWeekInfo({
                      label: `Week ${idx + 1}`,
                      start: s,
                      end: e,
                      left: `calc(280px + ${percentFromIndex(g.start)})`,
                      width: `calc(${percentFromIndex(g.end)} - ${percentFromIndex(g.start)})`
                    });
                  }}
                  onMouseLeave={() => setWeekInfo(null)}
                >
                  Week {idx + 1}
                </div>
              ))}
            </div>
            {/* Days row */}
            {viewScale === 'day' ? (
              <div
                className="grid text-[10px] font-medium text-gray-700 border-b border-gray-200"
                style={{ gridTemplateColumns: `280px repeat(${units.length}, minmax(36px, 1fr))` }}
              >
                <div className="py-2 pl-6 bg-white">Project / Task</div>
                {days.map((d, i) => (
                  <div key={`d-${i}`} className="py-2 text-center">
                    {['S','M','T','W','T','F','S'][d.getDay()]}
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="grid text-[10px] font-medium text-gray-700 border-b border-gray-200"
                style={{ gridTemplateColumns: `280px repeat(${units.length}, minmax(60px, 1fr))` }}
              >
                <div className="py-2 pl-6 bg-white">Project / Task</div>
                {months.map((m, i) => (
                  <div key={`m-${i}`} className="py-2 text-center">
                    {monthLabels[m.getMonth()]} {m.getFullYear()}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Today indicator - spans the chart height */}
        <div className="pointer-events-none absolute inset-0 z-30">
          <div
            className="absolute top-0 bottom-0 border-r-2 border-sky-600"
            style={{ left: `calc(280px + ${currentLeft})` }}
          />
        </div>
        {/* Today label */}
        <div className="pointer-events-none absolute z-40" style={{ left: `calc(280px + ${currentLeft})`, top: 24 }}>
          <div className="translate-x-[-50%] text-[10px] bg-sky-600 text-white px-2 py-0.5 rounded-sm shadow">Today</div>
        </div>
        {/* Week info tooltip */}
        {weekInfo && (
          <div
            className="absolute z-20 mt-1 text-[11px] bg-white border border-gray-200 rounded-md shadow px-2 py-1"
            style={{ left: weekInfo.left, top: 28 }}
            onMouseLeave={() => setWeekInfo(null)}
          >
            <div className="font-semibold mb-0.5">{weekInfo.label}</div>
            <div className="text-gray-600">{weekInfo.start.toLocaleDateString()} – {weekInfo.end.toLocaleDateString()}</div>
          </div>
        )}

        {/* Rows */}
        <div className="divide-y divide-gray-100">
          {projects.map((p) => {
            const pid = (p._id || p.id) as string;
            const subtasks = tasksByProject[pid] || [];
            return (
              <div key={pid} className="px-6 py-4">
                {/* Project row */}
                <div
                  className="grid items-center"
                  style={{ gridTemplateColumns: `280px repeat(${units.length}, minmax(36px, 1fr))` }}
                >
                  <div className="pr-3">
                    <button onClick={() => toggle(pid)} className="flex items-center gap-2 text-left">
                      <span className={`transition-transform ${expanded[pid] ? 'rotate-90' : ''}`}>▶</span>
                      <span className="text-sm font-semibold text-gray-900">{p.title}</span>
                    </button>
                    <div className="text-xs text-gray-500">{new Date(p.startDate).toLocaleDateString()} – {new Date(p.dueDate).toLocaleDateString()}</div>
                  </div>
                  <div className="relative" style={{ gridColumn: '2 / -1' }}>
                    <div className="gantt-timeline h-6">
                      {(() => {
                        try {
                          const sIdx = indexFromDate(p.startDate);
                          const eIdx = indexFromDateEnd(p.dueDate, sIdx);
                          const split = clamp(todayIdxForScale, sIdx, eIdx);
                          const startLabel = new Date(p.startDate).toLocaleDateString();
                          const endLabel = new Date(p.dueDate).toLocaleDateString();
                          const title = `${p.title}: ${startLabel} – ${endLabel}`;
                          const segs = [] as { left: string; width: string; cls: string; title: string }[];
                          if (split > sIdx) {
                            segs.push({ left: percentFromIndex(sIdx), width: `calc(${percentFromIndex(split)} - ${percentFromIndex(sIdx)})`, cls: 'bg-green-500', title });
                          }
                          if (eIdx > split) {
                            segs.push({ left: percentFromIndex(split), width: `calc(${percentFromIndex(eIdx)} - ${percentFromIndex(split)})`, cls: 'bg-gray-300', title });
                          }
                          return segs.map((seg, i) => (
                            <div
                              key={i}
                              title={seg.title}
                              className={`absolute top-1/2 -translate-y-1/2 rounded-sm shadow-sm ${seg.cls}`}
                              style={{ left: seg.left, width: seg.width, height: '8px' }}
                            />
                          ));
                        } catch (error) {
                          console.error('Error rendering project bar:', error);
                          return null;
                        }
                      })()}
                    </div>
                  </div>
                </div>

                {/* Subtasks */}
                <div className={`mt-3 overflow-hidden transition-all duration-300 ${expanded[pid] ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="space-y-2">
                    {subtasks.map((t) => {
                      const sIdxRaw = indexFromDate(t.startDate || p.startDate);
                      const eIdx = indexFromDateEnd(t.eta, sIdxRaw);
                      const sIdx = sIdxRaw;
                      return (
                        <div key={t._id}
                          className="grid items-center"
                          style={{ gridTemplateColumns: `280px repeat(${units.length}, minmax(36px, 1fr))` }}
                        >
                          <div className="pl-4 pr-3">
                            <div className="text-xs text-gray-700">{t.task}</div>
                          </div>
                          <div className="relative" style={{ gridColumn: '2 / -1' }}>
                            <div className="gantt-timeline h-6">
                              {(() => {
                                try {
                                  const split = clamp(todayIdxForScale, sIdx, eIdx);
                                  const segs = [] as { left: string; width: string; cls: string }[];
                                  if (split > sIdx) {
                                    segs.push({ left: percentFromIndex(sIdx), width: `calc(${percentFromIndex(split)} - ${percentFromIndex(sIdx)})`, cls: 'bg-green-500' });
                                  }
                                  if (eIdx > split) {
                                    segs.push({ left: percentFromIndex(split), width: `calc(${percentFromIndex(eIdx)} - ${percentFromIndex(split)})`, cls: 'bg-gray-300' });
                                  }
                                  return segs.map((seg, i) => (
                                    <div
                                      key={i}
                                      title={`${t.task}: ${t.startDate ? new Date(t.startDate).toLocaleDateString() : ''} – ${new Date(t.eta).toLocaleDateString()} (${t.status})`}
                                      className={`absolute top-1/2 -translate-y-1/2 rounded-sm shadow-sm hover:shadow ${seg.cls}`}
                                      style={{ left: seg.left, width: seg.width, height: '6px' }}
                                    />
                                  ));
                                } catch (error) {
                                  console.error('Error rendering task bar:', error);
                                  return null;
                                }
                              })()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {subtasks.length === 0 && (
                      <div className="pl-4 text-xs text-gray-400">No tasks</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


