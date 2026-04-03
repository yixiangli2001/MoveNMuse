import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getInstructor } from "../services/instructorService";
import { listSessions } from "../services/sessionService";
import { addItemToCart } from "../services/cartService";
import { getUserIdFromToken, getRoleFromToken } from "../utils/auth";

export default function InstructorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [instructor, setInstructor] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const role = (getRoleFromToken?.() || "").toLowerCase();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const [instRes, sessionsRes] = await Promise.all([
        getInstructor(id),
        listSessions({ instructorId: id, limit: 10, status: "Scheduled" })
      ]);

      setInstructor(instRes.data || instRes);
      
      const sData = sessionsRes.data || sessionsRes;
      setSessions(sData.items || []);
    } catch (e) {
      setErr(e.message || "Failed to load curator details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function onAddToCart(session) {
    const uid = getUserIdFromToken?.();
    if (!uid) {
      navigate("/login");
      return;
    }
    if (role !== "customer") {
      alert("Only customers can add items to the cart.");
      return;
    }

    try {
      const res = await addItemToCart({
        userId: uid,
        productType: "Course",
        productId: session.courseId,
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

  if (loading) return <div className="p-20 text-center animate-pulse font-display text-2xl text-neutral-400">Opening curator profile...</div>;
  if (err) return <div className="p-20 text-center text-red-600 pt-32">{err}</div>;
  if (!instructor) return <div className="p-20 text-center italic text-neutral-400 pt-32">Curator not found.</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 pt-32 pb-24 space-y-24">
      {/* Breadcrumb */}
      <div className="reveal-up">
        <Link to="/instructors" className="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-blue-600 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to The Curators
        </Link>
      </div>

      {/* Profile Section */}
      <div className="grid lg:grid-cols-2 gap-24 items-center">
        <div className="reveal-up">
          <div className="aspect-[3/4] overflow-hidden rounded-[4rem] bg-neutral-100 shadow-2xl shadow-neutral-900/5">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${instructor.name}`} 
              alt={instructor.name}
              className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
            />
          </div>
        </div>

        <div className="space-y-8 reveal-up" style={{ animationDelay: "200ms" }}>
          <div className="space-y-4">
            <span className="text-sm font-semibold tracking-[0.2em] uppercase text-blue-600">Master Instructor</span>
            <h1 className="text-7xl font-display font-light leading-none text-neutral-900">{instructor.name}</h1>
          </div>
          
          <div className="prose prose-neutral max-w-none">
            <p className="text-2xl font-display italic text-neutral-400 leading-relaxed">
              &ldquo;{instructor.bio || 'Dedicated to the pursuit of artistic excellence and the discovery of inner rhythm. Guiding students through the transformative power of movement and sound.'}&rdquo;
            </p>
          </div>

          <div className="pt-8 border-t border-neutral-100 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </div>
              <span className="text-lg font-light text-neutral-600">{instructor.email}</span>
            </div>
            {instructor.phone && (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.79 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
                <span className="text-lg font-light text-neutral-600">{instructor.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Sessions Section */}
      <div className="space-y-12 reveal-up" style={{ animationDelay: "400ms" }}>
        <div className="flex items-baseline justify-between border-b border-neutral-100 pb-6">
          <h2 className="text-4xl font-display">Upcoming <span className="italic">Sessions</span></h2>
          <span className="text-sm text-neutral-400 font-light italic">{sessions.length} matches found</span>
        </div>

        {successMsg && (
          <div className="rounded-2xl border border-blue-100 bg-blue-50 text-blue-700 text-sm px-6 py-4 flex items-center gap-4 animate-slide-down">
            <span className="font-medium">{successMsg}</span>
            <Link to="/cart" className="ml-auto text-blue-600 font-bold hover:underline">
              View Shopping Cart &rarr;
            </Link>
          </div>
        )}

        {sessions.length === 0 ? (
          <p className="py-20 text-center text-neutral-400 italic">No upcoming sessions with this curator at the moment.</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <div key={session.sessionId} className="dynamic-card p-8 space-y-6 group">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      Upcoming
                    </span>
                  </div>
                  <h3 className="text-2xl font-display font-medium text-neutral-900 group-hover:text-blue-600 transition-colors leading-tight">
                    Session #{session.sessionId}
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-neutral-500 font-light text-sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    {new Date(session.startTime).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-3 text-neutral-500 font-light text-sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {session.duration} min
                  </div>
                </div>

                <div className="pt-6 border-t border-neutral-100 flex items-center justify-between">
                  <div className="text-2xl font-medium text-neutral-900">${session.price?.$numberDecimal || session.price}</div>
                  <button
                    onClick={() => onAddToCart(session)}
                    className="px-6 py-2 bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-blue-600 transition-all shadow-lg shadow-neutral-900/10"
                  >
                    Reserve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
