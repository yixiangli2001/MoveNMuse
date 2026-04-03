// Jiayu
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { listCourses } from "../services/courseService";
import CourseCard from "../components/Course/CourseCard.jsx";
import { getRoleFromToken } from "../utils/auth";

export default function CourseList() {
  // manage URL search params
  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();

  // filter states
  const [kw, setKw] = useState(sp.get("kw") || "");
  const [category, setCategory] = useState(sp.get("category") || "");
  const [level, setLevel] = useState(sp.get("level") || "");
  const pageSize = 9;
  const [page, setPage] = useState(Math.max(1, Number(sp.get("page") || 1)));
  // data states
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState({ items: [], total: 0 });

  // tip message for empty keyword submit
  const [tip, setTip] = useState("");

  // role check
  const role = (getRoleFromToken?.() || "").toLowerCase();
  const isStaff = role === "staff";

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((data.total || 0) / pageSize)),
    [data.total]
  );
  // fetch data when filters or pagination change
  useEffect(() => {
    let dead = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const r = await listCourses({ kw, category, level, page, pageSize });
        if (!dead) {
          const result = r.data || r;
          setData({ 
            items: result.items || [], 
            total: Number(result.total) || 0 
          });
        }
      } catch (e) {
        if (!dead) setErr(e.message || "Failed to load");
      } finally {
        if (!dead) setLoading(false);
      }
    })();
    // sync URL search params
    setSp((old) => {
      const p = new URLSearchParams(old);
      kw ? p.set("kw", kw) : p.delete("kw");
      category ? p.set("category", category) : p.delete("category");
      level ? p.set("level", level) : p.delete("level");
      p.set("page", String(page));
      p.set("pageSize", String(pageSize));
      return p;
    });

    return () => {
      dead = true;
    };
  }, [kw, category, level, page, pageSize, setSp]);

  // render component
  return (
    <div className="max-w-7xl mx-auto p-6 pt-32 space-y-12">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 reveal-up">
        <div className="space-y-4">
          <h1 className="text-6xl font-display font-light">Class <span className="italic text-blue-600">Discoveries</span></h1>
          <p className="text-xl text-neutral-500 font-light max-w-xl">Master a new rhythm, find your flow, and discover your artistic potential.</p>
        </div>
        
        {isStaff && (
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/admin/courses")}
              className="px-6 py-2.5 rounded-full border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-all"
            >
              Manage Inventory
            </button>
            <button
              onClick={() => navigate("/admin/courses/new")}
              className="px-6 py-2.5 rounded-full bg-neutral-900 text-white text-sm font-medium hover:bg-blue-600 transition-all shadow-lg shadow-neutral-900/10"
            >
              + Create Course
            </button>
          </div>
        )}
      </div>

      {/* Filters Section */}
      <div className="glass rounded-3xl p-8 reveal-up shadow-xl shadow-neutral-900/5" style={{ animationDelay: "100ms" }}>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Search Library</label>
            <div className="relative group">
              <input
                className="w-full bg-white/50 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="Find your muse..."
                value={kw}
                onChange={(e) => {
                  setPage(1);
                  setKw(e.target.value);
                  if (tip) setTip(""); 
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (!kw.trim()) return setTip("Please enter a keyword.");
                    setTip("");
                    setPage(1);
                  }
                }}
              />
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-neutral-400 hover:text-blue-600 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  if (!kw.trim()) return setTip("Please enter a keyword.");
                  setTip("");
                  setPage(1);
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </button>
            </div>
            {tip && <div className="mt-2 text-[10px] text-red-500 font-bold uppercase tracking-tight">{tip}</div>}
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Discipline</label>
            <select
              className="w-full bg-white/50 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={category}
              onChange={(e) => {
                setPage(1);
                setCategory(e.target.value);
              }}
            >
              <option value="">All Disciplines</option>
              <option value="Dance">Dance</option>
              <option value="Workshop">Workshop</option>
              <option value="Music">Music</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Proficiency</label>
            <select
              className="w-full bg-white/50 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={level}
              onChange={(e) => {
                setPage(1);
                setLevel(e.target.value);
              }}
            >
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button 
              onClick={() => {
                setKw("");
                setCategory("");
                setLevel("");
                setPage(1);
              }}
              className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-all"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Area */}
      <div className="space-y-8">
        <div className="flex items-baseline justify-between reveal-up" style={{ animationDelay: "200ms" }}>
          <h2 className="text-3xl font-display">Featured Curations</h2>
          <span className="text-sm text-neutral-400 font-light italic">{data.total} collections found</span>
        </div>

        <div className="min-h-40">
          {loading ? (
            <div className="py-20 text-center animate-pulse font-display text-2xl text-neutral-400">Curating collection...</div>
          ) : err ? (
            <div className="py-20 text-center text-red-600 font-medium">{err}</div>
          ) : data.items.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 reveal-up" style={{ animationDelay: "300ms" }}>
              {data.items.map((c) => (
                <CourseCard key={c.courseId || c._id} c={c} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-neutral-400 italic">No courses found matching your criteria.</div>
          )}
        </div>
      </div>

      {/* Pagination Area */}
      {data.total > pageSize && (
        <div className="flex items-center justify-center gap-6 pt-12 border-t border-neutral-100 reveal-up">
          <button
            className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-neutral-600 transition-colors"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Previous
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-lg font-display font-medium text-neutral-900">{page}</span>
            <span className="text-neutral-300">/</span>
            <span className="text-sm text-neutral-400">{totalPages}</span>
          </div>
          
          <button
            className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-neutral-600 transition-colors"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
          >
            Next
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </div>
      )}
    </div>
  );
}
