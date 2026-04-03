// Jiayu
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listInstructors } from "../services/instructorService";

export default function Instructors() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    listInstructors({ page: 1, pageSize: 50 })
      .then((res) => {
        const result = res.data || res;
        const list = Array.isArray(result) ? result : result.items || [];
        setInstructors(list.filter(i => i.status === "active"));
      })
      .catch((e) => setErr(e.message || "Failed to load curators"))
      .finally(() => setLoading(false));
  }, []);

  if (err) return <div className="p-20 text-center text-red-600 pt-32">{err}</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 pt-32 pb-24 space-y-16">
      {/* Header Section */}
      <div className="reveal-up text-center space-y-4">
        <h1 className="text-7xl font-display font-light">The <span className="italic text-blue-600">Curators</span></h1>
        <p className="text-xl text-neutral-500 font-light max-w-2xl mx-auto">Master artists and visionary instructors dedicated to guiding your creative evolution.</p>
      </div>

      <div className="min-h-screen">
        {loading ? (
          <div className="py-20 text-center animate-pulse font-display text-2xl text-neutral-400">Assembling the collective...</div>
        ) : instructors.length === 0 ? (
          <div className="py-20 text-center text-neutral-400 italic reveal-up">Our roster of curators is currently in transition.</div>
        ) : (
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 reveal-up" style={{ animationDelay: "200ms" }}>
            {instructors.map((instructor) => (
              <Link 
                key={instructor._id || instructor.instructorId} 
                to={`/instructors/${instructor.instructorId || instructor._id}`}
                className="group space-y-6 block"
              >
                <div className="aspect-[3/4] overflow-hidden rounded-[3rem] bg-neutral-100 shadow-2xl shadow-neutral-900/5 transition-all duration-700 group-hover:shadow-blue-600/10 group-hover:-translate-y-2">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${instructor.name}`} 
                    alt={instructor.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                </div>
                
                <div className="space-y-2 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">Master Instructor</span>
                  <h3 className="text-3xl font-display font-medium text-neutral-900">{instructor.name}</h3>
                  <p className="text-neutral-500 font-light text-sm max-w-xs mx-auto leading-relaxed italic">
                    "{instructor.bio || "Dedicated to the pursuit of artistic excellence and the discovery of inner rhythm."}"
                  </p>
                </div>

                <div className="flex justify-center gap-4 pt-2">
                  <div className="w-8 h-px bg-neutral-200 self-center" />
                  <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-300">Curator</div>
                  <div className="w-8 h-px bg-neutral-200 self-center" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
