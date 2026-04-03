// Jiayu
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";

// services
import { getCourse, updateCourse } from "../services/courseService";
import { getSessionsByCourse, deleteSession } from "../services/sessionService";
import { addItemToCart } from "../services/cartService";

// course components
import SessionList from "../components/Course/SessionList.jsx";
// staff management table
import SessionTable from "../components/Course/SessionTable.jsx";

// auth utils
import { getUserIdFromToken, getToken, getRoleFromToken } from "../utils/auth";

// money formatter
const money = (n) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "AUD",
  }).format(Number(n || 0));

const normPrice = (p) => {
  if (p && typeof p === "object" && p.$numberDecimal != null)
    return Number(p.$numberDecimal);
  return Number(p ?? 0);
};
const getCoursePrice = (c) => normPrice(c?.defaultPrice ?? c?.price);
// predefined options
const CATEGORY_OPTIONS = ["Dance", "Yoga", "Workshop", "Music"];
const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];

function CourseDetail() {
  // route params and navigation
  const { id } = useParams();
  const nav = useNavigate();
  const location = useLocation();
  const [tip, setTip] = useState(""); // path message for empty keyword submit
  const [vErr, setVErr] = useState({}); // validation errors for edit modal

  // course state
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [course, setCourse] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  // sessions state
  const [sessionsAll, setSessionsAll] = useState([]);
  const [sessionsUpcoming, setSessionsUpcoming] = useState([]);

  // edit course (staff only) modal state
  const [openEdit, setOpenEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    level: "",
  });
  // user role
  const role = (getRoleFromToken?.() || "").toLowerCase();
  const isStaff = role === "staff";
  // normalize courseId type
  const courseIdNum = useMemo(() => {
    const num = Number(id);
    return Number.isFinite(num) ? num : id;
  }, [id]);
  // determine if session is bookable
  function canBook(session) {
    if (!session) return false;
    const now = new Date();
    const start = new Date(session.startTime);
    const schedulable = (session.status ?? "Scheduled") === "Scheduled";
    const notStarted = start > now;
    const cap = Number(session.capacity ?? 0);
    const booked = Number(session.seatsBooked ?? 0);
    const hasSeats = cap > 0 ? booked < cap : true;
    return schedulable && notStarted && hasSeats;
  }
  // refresh course details
  const refreshCourse = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const r = await getCourse(id);
      setCourse(r.data || r);
    } catch (e) {
      setErr(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [id]);
  // refresh sessions for this course
  const refreshSessions = useCallback(async (cid) => {
    try {
      const list = await getSessionsByCourse(cid);
      const normalized = (list || []).map((s) => ({
        ...s,
        price:
          typeof s.price === "object" && s.price?.$numberDecimal
            ? parseFloat(s.price.$numberDecimal)
            : Number(s.price),
      }));
      setSessionsAll(normalized);

      const now = Date.now();
      setSessionsUpcoming(
        normalized.filter((s) => new Date(s.endTime).getTime() > now)
      );
    } catch (e) {
      console.error("load sessions failed:", e);
      setSessionsAll([]);
      setSessionsUpcoming([]);
    }
  }, []);
  // initial load
  useEffect(() => {
    refreshCourse();
  }, [refreshCourse]);
  // load sessions when course or id changes
  useEffect(() => {
    const cid = course?.courseId ?? courseIdNum;
    if (!cid) return;
    refreshSessions(cid);
  }, [course?.courseId, courseIdNum, refreshSessions]);

  // open course edit modal (staff)
  function openEditModal() {
    if (!course) return;
    setForm({
      name: course.name || course.title || "",
      description: course.description || "",
      price: String(getCoursePrice(course)),
      category: course.category || "",
      level: course.level || "",
    });
    setOpenEdit(true);
  }

  // save course edits (staff)
  async function onSaveCourse() {
    try {
      setSaving(true);

      // validation
      const errs = {};
      if (!form.name.trim()) errs.name = "Name is required.";
      const priceNum = Number(form.price);
      if (!Number.isFinite(priceNum) || priceNum < 0)
        errs.price = "Default price must be a non-negative number.";

      if (Object.keys(errs).length) {
        setVErr(errs);
        return; // stop saving
      } else {
        setVErr({});
      }

      if (!isStaff) {
        alert("Only staff can edit courses.");
        return;
      }

      await updateCourse(course.courseId, {
        name: form.name,
        description: form.description,
        defaultPrice: Number(form.price),
        category: form.category,
        level: form.level,
      });

      setOpenEdit(false);
      await refreshCourse();
    } catch (e) {
      alert(e.message || "Failed to update course");
    } finally {
      setSaving(false);
    }
  }

  // add session to cart (customer)
  async function onAddToCart(session) {
    const uid = getUserIdFromToken?.();
    if (!uid) {
      setTip("Please log in to add sessions to your cart.");
      nav("/login", { state: { from: location } });
      return;
    }
    if (role !== "customer") {
      setTip(`Booking is available to customers. Your role is “${role}”.`);
      alert("Only customers can add items to the cart.");
      return;
    }

    try {
      const res = await addItemToCart({
        userId: uid,
        productType: "Course",
        productId: course.courseId,
        occurrenceId: session.sessionId,
        qty: 1,
      });

      if (res.success) {
        setSuccessMsg("✅ Added to cart successfully!");
        setTimeout(() => setSuccessMsg(""), 3000); 
      }
    } catch (err) {
      alert(err.message || "Add to cart failed");
    }
  }

  // delete session (staff)
  async function handleDeleteSession(sessionId) {
    try {
      if (!isStaff) {
        alert("Only staff can delete sessions.");
        return;
      }
      if (!confirm(`Delete session ${sessionId}? This cannot be undone.`))
        return;

      await deleteSession(sessionId);

      const cid = course?.courseId ?? courseIdNum;
      await refreshSessions(cid);
      alert("Deleted.");
    } catch (e) {
      console.error(e);
      alert(e?.message || "Delete failed");
    }
  }
  // go to create session page with return back to this detail page
  function goCreateSession() {
    const ret = encodeURIComponent(location.pathname);
    const cid = course?.courseId ?? courseIdNum;
    nav(`/admin/sessions/new?courseId=${cid}&return=${ret}`);
  }

  // go to instructors admin with return back to this detail page
  function goManageInstructors() {
    const ret = encodeURIComponent(location.pathname + location.search);
    nav(`/admin/instructors?return=${ret}`);
  }

  if (loading) return <div className="p-20 text-center animate-pulse font-display text-2xl text-neutral-400">Curating details...</div>;

  if (err)
    return (
      <div className="p-20 text-center space-y-4">
        <p className="text-red-600 font-medium">{err}</p>
        <button
          className="px-6 py-2 rounded-full border border-neutral-200 text-sm hover:bg-neutral-50"
          onClick={() => nav(-1)}
        >
          Return to Library
        </button>
      </div>
    );

  if (!course) return <div className="p-20 text-center italic text-neutral-400">The requested course has moved on.</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 pt-32 space-y-16">
      {/* Breadcrumb / Back */}
      <div className="reveal-up">
        <button
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-blue-600 transition-colors"
          onClick={() => nav("/courses")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Library
        </button>
      </div>

      {/* Hero Content */}
      <div className="grid lg:grid-cols-2 gap-16 items-start reveal-up" style={{ animationDelay: "100ms" }}>
        {/* Left: Visual / Info */}
        <div className="space-y-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {course.category}
              </span>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 border border-neutral-200 px-3 py-1 rounded-full">
                {course.level}
              </span>
            </div>
            <h1 className="text-6xl font-display font-light leading-tight text-neutral-900">
              {course.name || course.title}
            </h1>
          </div>

          <div className="prose prose-neutral max-w-none">
            <p className="text-xl text-neutral-500 font-light leading-relaxed">
              {course.description}
            </p>
          </div>

          <div className="flex items-center gap-12 py-8 border-y border-neutral-100">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Investment</span>
              <div className="text-3xl font-medium text-neutral-900">{money(getCoursePrice(course))}</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Duration</span>
              <div className="text-3xl font-medium text-neutral-900">Multi-session</div>
            </div>
          </div>

          {/* Action Messages */}
          <div className="space-y-4">
            {tip && (
              <div className="rounded-2xl border border-red-100 bg-red-50 text-red-700 text-sm px-6 py-4 flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                {tip}
              </div>
            )}
            {successMsg && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 text-blue-700 text-sm px-6 py-4 flex items-center gap-4 animate-slide-down">
                <span className="font-medium">{successMsg}</span>
                <Link to="/cart" className="ml-auto text-blue-600 font-bold hover:underline">
                  View Shopping Cart &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right: Sessions / Management */}
        <div className="space-y-8 h-fit lg:sticky lg:top-32">
          {/* Staff Tools Card */}
          {isStaff && (
            <div className="glass rounded-[2rem] p-8 space-y-6 shadow-xl shadow-neutral-900/5 border-amber-100">
              <div className="flex items-center gap-3 text-amber-800">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 12 10z"></path></svg>
                <h3 className="font-bold uppercase tracking-widest text-xs">Curator Controls</h3>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button
                  className="flex-1 px-6 py-3 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-all shadow-sm"
                  onClick={openEditModal}
                >
                  Edit Collection
                </button>
                <button
                  className="flex-1 px-6 py-3 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-all shadow-sm"
                  onClick={goManageInstructors}
                >
                  Instructors
                </button>
              </div>
              <button
                className="w-full px-6 py-3 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-blue-600 transition-all shadow-lg"
                onClick={goCreateSession}
              >
                + New Masterclass Session
              </button>
            </div>
          )}

          {/* Sessions List */}
          <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-neutral-900/5 border border-neutral-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-display font-medium text-neutral-900">Available Sessions</h2>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                {sessionsUpcoming.length} Upcoming
              </span>
            </div>

            <div className="space-y-6">
              {isStaff ? (
                <SessionTable
                  sessions={sessionsAll}
                  onDelete={handleDeleteSession}
                />
              ) : (
                <SessionList
                  sessions={sessionsUpcoming}
                  onAddToCart={onAddToCart}
                  canBook={canBook}
                  role={role || null}
                />
              )}
              
              {!isStaff && sessionsUpcoming.length === 0 && (
                <div className="py-12 text-center text-neutral-400 italic">
                  No upcoming dates for this curation.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Course Modal */}
      {openEdit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setOpenEdit(false)} />
          
          <div className="relative w-full max-w-2xl bg-white rounded-[3rem] p-10 shadow-2xl animate-zoom-in">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-display">Edit <span className="italic">Collection</span></h3>
              <button
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                onClick={() => setOpenEdit(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-4">Title</label>
                <input
                  className="w-full rounded-2xl border border-neutral-200 px-6 py-3 text-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
                {vErr.name && <div className="text-[10px] text-red-500 font-bold ml-4 uppercase">{vErr.name}</div>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-4">Description</label>
                <textarea
                  className="w-full rounded-2xl border border-neutral-200 px-6 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-4">Rate (AUD)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-2xl border border-neutral-200 px-6 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  />
                  {vErr.price && <div className="text-[10px] text-red-500 font-bold ml-4 uppercase">{vErr.price}</div>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-4">Discipline</label>
                  <select
                    className="w-full rounded-2xl border border-neutral-200 px-6 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none bg-white"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  >
                    <option value="">-- Select Category --</option>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-4">Proficiency</label>
                <select
                  className="w-full rounded-2xl border border-neutral-200 px-6 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none bg-white"
                  value={form.level}
                  onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
                >
                  <option value="">-- Select Level --</option>
                  {LEVEL_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-10 flex gap-4">
              <button
                className="flex-1 px-8 py-4 rounded-full border border-neutral-200 text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-all"
                onClick={() => setOpenEdit(false)}
              >
                Discard
              </button>
              <button
                className="flex-[2] px-8 py-4 rounded-full bg-neutral-900 text-white text-sm font-bold hover:bg-blue-600 transition-all shadow-lg disabled:opacity-50"
                onClick={onSaveCourse}
                disabled={saving}
              >
                {saving ? "Preserving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { CourseDetail };
export default CourseDetail;
