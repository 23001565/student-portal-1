import React, { useEffect, useMemo, useState } from "react";

// --- Mock catalog data -------------------------------------------------------
const CATALOG = [
  {
    id: "CS101",
    title: "Introduction to Programming",
    dept: "CS",
    instructor: "Nguyen T. Lan",
    credits: 3,
    days: ["Mon", "Wed"],
    start: "08:00",
    end: "09:15",
    room: "A1-201",
  },
  {
    id: "CS205",
    title: "Data Structures",
    dept: "CS",
    instructor: "Pham H. Minh",
    credits: 4,
    days: ["Tue", "Thu"],
    start: "10:00",
    end: "11:50",
    room: "A1-305",
  },
  {
    id: "MATH120",
    title: "Calculus I",
    dept: "MATH",
    instructor: "Tran K. Hoa",
    credits: 4,
    days: ["Mon", "Wed", "Fri"],
    start: "09:30",
    end: "10:20",
    room: "B2-102",
  },
  {
    id: "MATH250",
    title: "Linear Algebra",
    dept: "MATH",
    instructor: "Le Q. Son",
    credits: 3,
    days: ["Tue", "Thu"],
    start: "13:00",
    end: "14:15",
    room: "B2-210",
  },
  {
    id: "ART110",
    title: "Fundamentals of Drawing",
    dept: "ART",
    instructor: "Do T. Huyen",
    credits: 2,
    days: ["Wed"],
    start: "14:00",
    end: "16:30",
    room: "C1-010",
  },
  {
    id: "ENG210",
    title: "Academic Writing",
    dept: "ENG",
    instructor: "Vo M. Quynh",
    credits: 3,
    days: ["Mon", "Thu"],
    start: "15:00",
    end: "16:15",
    room: "D4-301",
  },
];

const ALL_DEPTS = ["All", ...Array.from(new Set(CATALOG.map((c) => c.dept)))];
const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// --- Utils -------------------------------------------------------------------
const t2m = (t) => {
  // "HH:MM" -> minutes from 00:00
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const clashes = (a, b) => {
  // time overlap if share a day and intervals overlap
  const shareDay = a.days.some((d) => b.days.includes(d));
  if (!shareDay) return false;
  return !(t2m(a.end) <= t2m(b.start) || t2m(b.end) <= t2m(a.start));
};

// --- Small UI helpers --------------------------------------------------------
const Badge = ({ children, tone = "default" }) => (
  <span
    className={
      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border " +
      (tone === "warn"
        ? "bg-yellow-50 text-yellow-800 border-yellow-200"
        : tone === "destructive"
        ? "bg-red-50 text-red-700 border-red-200"
        : "bg-gray-50 text-gray-700 border-gray-200")
    }
  >
    {children}
  </span>
);

const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl border border-gray-200 bg-white shadow-sm ${className}`}>{children}</div>
);

const SectionTitle = ({ children }) => (
  <h2 className="text-lg font-semibold tracking-tight text-gray-800">{children}</h2>
);

// --- Timetable grid ----------------------------------------------------------
const Timetable = ({ courses }) => {
  // hours from 8:00 to 18:00
  const START = 8 * 60;
  const END = 18 * 60;

  const blocksByDay = useMemo(() => {
    const byDay = Object.fromEntries(ALL_DAYS.map((d) => [d, []]));
    courses.forEach((c) => {
      c.days.forEach((d) => {
        byDay[d].push({ ...c });
      });
    });
    return byDay;
  }, [courses]);

  const pctFromMin = (min) => ((min - START) / (END - START)) * 100;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[720px]">
        <div className="grid grid-cols-7 gap-3">
          {ALL_DAYS.slice(0, 5).map((day) => (
            <div key={day} className="">
              <div className="sticky top-0 z-10 bg-white/70 backdrop-blur py-1 mb-2 text-center text-sm font-medium text-gray-700">
                {day}
              </div>
              <div className="relative h-[640px] border rounded-xl border-gray-200 bg-gray-50">
                {/* hour lines */}
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute left-0 right-0 border-t border-dashed border-gray-200 text-[10px] text-gray-400"
                    style={{ top: `${(i / 10) * 100}%` }}
                  >
                    <span className="absolute -top-2 left-1 bg-gray-50 px-1 rounded">
                      {8 + i}:00
                    </span>
                  </div>
                ))}
                {/* blocks */}
                {blocksByDay[day].map((c) => {
                  const top = pctFromMin(t2m(c.start));
                  const height = pctFromMin(t2m(c.end)) - pctFromMin(t2m(c.start));
                  return (
                    <div
                      key={`${day}-${c.id}`}
                      className="absolute left-2 right-2 rounded-xl bg-indigo-100 border border-indigo-200 p-2 text-xs shadow"
                      style={{ top: `${top}%`, height: `${height}%` }}
                      title={`${c.id} ${c.title} (${c.start}–${c.end})`}
                    >
                      <div className="font-semibold text-indigo-800">{c.id}</div>
                      <div className="text-indigo-900/80 line-clamp-2">{c.title}</div>
                      <div className="text-[10px] text-indigo-900/70 mt-1">
                        {c.start}–{c.end} • {c.room}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Main app ----------------------------------------------------------------
export default function CourseRegistrationApp() {
  const [term, setTerm] = useState("Fall 2025");
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("All");
  const [day, setDay] = useState("All");
  const [minCredits, setMinCredits] = useState(0);
  const [maxCredits, setMaxCredits] = useState(6);
  const [selected, setSelected] = useState(() => {
    try {
      const raw = localStorage.getItem("selectedCourses");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("selectedCourses", JSON.stringify(selected));
  }, [selected]);

  const filtered = useMemo(() => {
    return CATALOG.filter((c) => {
      const matchQ = `${c.id} ${c.title} ${c.instructor}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchDept = dept === "All" || c.dept === dept;
      const matchDay = day === "All" || c.days.includes(day);
      const matchCred = c.credits >= minCredits && c.credits <= maxCredits;
      return matchQ && matchDept && matchDay && matchCred;
    });
  }, [query, dept, day, minCredits, maxCredits]);

  const totalCredits = selected.reduce((acc, c) => acc + c.credits, 0);

  const conflictIds = useMemo(() => {
    const ids = new Set();
    for (let i = 0; i < selected.length; i++) {
      for (let j = i + 1; j < selected.length; j++) {
        if (clashes(selected[i], selected[j])) {
          ids.add(selected[i].id);
          ids.add(selected[j].id);
        }
      }
    }
    return ids;
  }, [selected]);

  const tryAdd = (course) => {
    if (selected.find((c) => c.id === course.id)) return; // already in cart
    // check conflict with existing
    const hasClash = selected.some((c) => clashes(c, course));
    if (hasClash) {
      alert(
        `⚠️ Time conflict detected for ${course.id}. Please adjust your selection.`
      );
    }
    setSelected((s) => [...s, course]);
  };

  const remove = (id) => setSelected((s) => s.filter((c) => c.id !== id));

  const submit = () => {
    if (selected.length === 0) {
      alert("Please select at least one course.");
      return;
    }
    if (totalCredits < 12) {
      if (!confirm("You have fewer than 12 credits. Submit anyway?")) return;
    }
    const payload = {
      term,
      courses: selected.map((c) => c.id),
      totalCredits,
      submittedAt: new Date().toISOString(),
    };
    // In real app, send to backend here
    console.log("SUBMIT", payload);
    alert("✅ Registration submitted! (check console for payload)");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur bg-white/70 border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Course Registration
            </h1>
            <p className="text-sm text-gray-600">Enroll in courses and check for schedule conflicts in real time.</p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="term" className="sr-only">Term</label>
            <select
              id="term"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>Fall 2025</option>
              <option>Spring 2026</option>
              <option>Summer 2026</option>
            </select>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Catalog & filters */}
        <section className="lg:col-span-2 space-y-4">
          <Card className="p-4">
            <div className="flex flex-col md:flex-row md:items-end gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700">Search</label>
                <input
                  type="text"
                  placeholder="Course ID, title, or instructor..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Department</label>
                <select
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {ALL_DEPTS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Day</label>
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option>All</option>
                  {ALL_DAYS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700">Credits</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={maxCredits}
                    value={minCredits}
                    onChange={(e) => setMinCredits(Number(e.target.value))}
                    className="w-20 rounded-xl border border-gray-300 px-2 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-500">to</span>
                  <input
                    type="number"
                    min={minCredits}
                    max={10}
                    value={maxCredits}
                    onChange={(e) => setMaxCredits(Number(e.target.value))}
                    className="w-20 rounded-xl border border-gray-300 px-2 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <SectionTitle>Course Catalog</SectionTitle>
            <p className="text-sm text-gray-500">{filtered.length} result(s)</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((c) => (
              <Card key={c.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold text-gray-900">{c.id} — {c.title}</h3>
                      <Badge>{c.dept}</Badge>
                      <Badge>{c.credits} cr</Badge>
                    </div>
                    <div className="text-sm text-gray-600">{c.instructor}</div>
                    <div className="text-sm text-gray-700">
                      {c.days.join(", ")} • {c.start}–{c.end} • {c.room}
                    </div>
                  </div>
                  <button
                    onClick={() => tryAdd(c)}
                    className="shrink-0 rounded-xl bg-indigo-600 px-3 py-2 text-white text-sm font-medium shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Add
                  </button>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <SectionTitle>Weekly Timetable</SectionTitle>
              <Badge>{selected.length} selected</Badge>
            </div>
            <Timetable courses={selected} />
          </Card>
        </section>

        {/* Cart / selection */}
        <aside className="space-y-4">
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <SectionTitle>Your Selection</SectionTitle>
              <Badge tone={conflictIds.size ? "warn" : "default"}>
                {totalCredits} total credits
              </Badge>
            </div>
            {selected.length === 0 ? (
              <p className="text-sm text-gray-600">No courses selected yet.</p>) : (
              <ul className="space-y-3">
                {selected.map((c) => (
                  <li key={c.id} className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{c.id}</span>
                        <span className="text-gray-700">{c.title}</span>
                        {conflictIds.has(c.id) && (
                          <Badge tone="destructive">Conflict</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {c.days.join(", ")} • {c.start}–{c.end} • {c.room} • {c.credits} cr
                      </div>
                    </div>
                    <button
                      onClick={() => remove(c.id)}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => setSelected([])}
                className="rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Clear All
              </button>
              <button
                onClick={submit}
                className="rounded-xl bg-green-600 px-4 py-2 text-white text-sm font-semibold shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Submit Registration
              </button>
            </div>
          </Card>

          <Card className="p-4">
            <SectionTitle>Notes</SectionTitle>
            <ul className="mt-2 list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>Selections are saved in your browser (localStorage).</li>
              <li>Conflicts are flagged when times overlap on the same day.</li>
              <li>You can adapt this to your API by replacing the submit() handler.</li>
            </ul>
          </Card>
        </aside>
      </main>

      <footer className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-xs text-gray-500">
        Built with React + Tailwind (single-file demo).
      </footer>
    </div>
  );
}
