// Jiayu
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

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
const CATEGORY_OPTIONS = ["Dance", "Yoga", "Workshop"];
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

      if (!token || !isStaff) {
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
    const token = getToken?.();
    const uid = getUserIdFromToken?.();
    const role = (getRoleFromToken?.() || "").toLowerCase();
    if (!token || !uid) {
      setTip("Please log in to add sessions to your cart.");
      nav("/login");
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
        setTimeout(() => setSuccessMsg(""), 3000); // clear success message after 3s
      }
    } catch (err) {
      alert(err.message || "Add to cart failed");
    }
  }

  // delete session (staff)
  async function handleDeleteSession(sessionId) {
    try {
      const token = getToken?.();
      if (!token || !isStaff) {
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

  if (loading) return <div className="p-4 text-gray-600">Loading course…</div>;

  if (err)
    return (
      <div className="p-4 text-red-600">
        {err}
        <div>
          <button
            className="mt-2 rounded-lg border px-3 py-1 text-sm"
            onClick={() => nav(-1)}
          >
            Back
          </button>
        </div>
      </div>
    );

  if (!course) return <div className="p-4">Course not found</div>;

  return (
    <div className="mx-auto max-w-4xl p-4">
      <button
        className="mb-3 rounded-lg border px-3 py-1 text-sm"
        onClick={() => nav(-1)}
      >
        ← Back
      </button>
      {/* page-level tip message */}

      {tip && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
          {tip}
        </div>
      )}

      {/* success message */}
      {successMsg && (
        <div className="mb-3 rounded-lg border border-green-200 bg-green-50 text-green-800 text-sm px-3 py-2 flex items-center gap-3">
          <span>{successMsg}</span>
          <button
            className="ml-auto rounded border px-3 py-1 text-sm"
            onClick={() => nav("/cart")}
          >
            View cart
          </button>
        </div>
      )}

      {/* only visible for staff */}
      {isStaff && (
        <div className="mb-4 rounded-lg border p-3 bg-amber-50 text-amber-900">
          <div className="font-semibold mb-2">Staff Tools</div>
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded border px-3 py-1 text-sm"
              onClick={openEditModal}
            >
              ✏️ Edit Course Info
            </button>
            {/* NEW: Manage Instructors */}
            <button
              className="rounded border px-3 py-1 text-sm"
              onClick={goManageInstructors}
              title="Go to instructor admin"
            >
              👤 Manage Instructors
            </button>
          </div>
        </div>
      )}

      {/* course image */}
      <div className="flex items-start gap-4">
        <div className="w-44 h-44 rounded-xl bg-gray-100 grid place-items-center text-sm text-gray-400">
          No Image
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {course.name || course.title || `Course ${id}`}
          </h1>
          <p className="text-sm text-gray-700 mt-2 leading-relaxed">
            {course.description}
          </p>
          <div className="mt-3 text-xs text-gray-500 flex flex-wrap items-center gap-2">
            {course.category && (
              <span className="rounded-full border px-2 py-0.5">
                {course.category}
              </span>
            )}
            {course.level && <span>{course.level}</span>}
            <span>Price {money(getCoursePrice(course))}</span>
          </div>
        </div>
      </div>
      {/* customer hints */}
      {!isStaff && (
        <div className="mt-4">
          {!getToken?.() && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 text-blue-800 text-sm px-3 py-2">
              Please{" "}
              <button className="underline" onClick={() => nav("/login")}>
                log in
              </button>{" "}
              to book a session.
            </div>
          )}
          {getToken?.() && role !== "customer" && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 text-amber-900 text-sm px-3 py-2 mt-2">
              Booking is available to customers. Your role is “{role}”.
            </div>
          )}
          {Array.isArray(sessionsUpcoming) && sessionsUpcoming.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 text-gray-600 text-sm px-3 py-2 mt-2">
              No upcoming sessions yet. Please check back later.
            </div>
          )}
        </div>
      )}

      {/* customer view: only visible to non-staff */}
      {!isStaff && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold">Sessions</h2>
          <div className="mt-3">
            <SessionList
              sessions={sessionsUpcoming} // customer only sees upcoming
              onAddToCart={onAddToCart}
              canBook={canBook}
              role={role || null}
            />
          </div>
        </div>
      )}

      {/* Staff management area (only visible to staff): shows all sessions for this course */}
      {isStaff && (
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Manage Sessions (this course)
            </h2>
            <button
              className="rounded bg-black text-white px-3 py-1 text-sm"
              onClick={goCreateSession}
            >
              ＋ New Session
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Only visible to staff. All sessions (including past/cancelled) for
            this course.
          </p>

          {Array.isArray(sessionsAll) && sessionsAll.length === 0 && (
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900 text-sm px-3 py-2">
              No sessions found for this course. Click “＋ New Session” to
              create one.
            </div>
          )}

          <div className="mt-3">
            <SessionTable
              sessions={sessionsAll} // staff sees all
              onDelete={handleDeleteSession}
              // Edit button in SessionTable should navigate to /admin/sessions/:id/edit
            />
          </div>
        </section>
      )}

      {/* Edit Course Modal */}
      {openEdit && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
          <div className="w-full max-w-xl rounded-xl bg-white p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Edit Course</h3>
              <button
                className="text-sm opacity-70"
                onClick={() => setOpenEdit(false)}
              >
                ✕
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="col-span-2 text-sm">
                <span className="block mb-1">Name</span>
                <input
                  className="w-full rounded border px-2 py-1"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
                {vErr.name && (
                  <div className="mt-1 text-xs text-red-600">{vErr.name}</div>
                )}
              </label>

              <label className="col-span-2 text-sm">
                <span className="block mb-1">Description</span>
                <textarea
                  className="w-full rounded border px-2 py-1"
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </label>

              <label className="text-sm">
                <span className="block mb-1">Price (AUD)</span>
                <input
                  type="number"
                  min="0"
                  className="w-full rounded border px-2 py-1"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                />
                {vErr.price && (
                  <div className="mt-1 text-xs text-red-600">{vErr.price}</div>
                )}
              </label>

              <label className="text-sm">
                <span className="block mb-1">Category</span>
                <select
                  className="w-full rounded border px-2 py-1"
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  required
                >
                  <option value="">-- Select Category --</option>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm">
                <span className="block mb-1">Level</span>
                <select
                  className="w-full rounded border px-2 py-1"
                  value={form.level}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, level: e.target.value }))
                  }
                  required
                >
                  <option value="">-- Select Level --</option>
                  {LEVEL_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded border px-3 py-1 text-sm"
                onClick={() => setOpenEdit(false)}
              >
                Cancel
              </button>
              <button
                className="rounded bg-black text-white px-3 py-1 text-sm disabled:opacity-50"
                onClick={onSaveCourse}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save"}
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
