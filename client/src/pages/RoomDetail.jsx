// Xinyi
import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { fetchRoomById, fetchRoomSlots } from "../services/roomService";
import { addItemToCart } from "../services/cartService";
import { useNavigate } from "react-router-dom";

import { getToken, getUserIdFromToken } from "../utils/auth";

const fmtTime = (t) =>
  t ? new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

export default function RoomDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const location = useLocation();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  // Selected day for viewing slots
  const [day, setDay] = useState(new Date().toISOString().split("T")[0]);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Adding to cart state
  const [addingId, setAddingId] = useState(null);

  // Load room basic info
  useEffect(() => {
    fetchRoomById(id)
      .then((res) => setRoom(res.data || res))
      .catch((e) => console.error("Room load fail:", e))
      .finally(() => setLoading(false));
  }, [id]);

  // Load slots whenever day or room changes
  useEffect(() => {
    const roomKey = room?.roomId || id;
    if (!roomKey) return;

    // fetch slots for [day 00:00, day 23:59]
    const dayToLocalRange = (dateStr) => {
      const from = new Date(dateStr);
      from.setHours(0, 0, 0, 0);
      const to = new Date(dateStr);
      to.setHours(23, 59, 59, 999);
      return { from: from.toISOString(), to: to.toISOString() };
    };

    const { from, to } = dayToLocalRange(day);
    setLoadingSlots(true);
    fetchRoomSlots(roomKey, { from, to })
      .then((res) => setSlots(res.data || res))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [room, day]);

  //add to cart function
  async function onAddToCart(slot) {
    try {
      setAddingId(slot.roomSlotId);
      const userId = getUserIdFromToken();

      // require login
      if (!userId) {
        alert("Please log in to add items to your cart.");
        nav("/login", {
          replace: false,
          state: { redirectTo: location.pathname },
        });
        return;
      }

      //fetch add to cart api
      const res = await addItemToCart({
        userId: userId,
        productType: "Room",
        productId: room.roomId,
        occurrenceId: slot.roomSlotId,
      });

      if (res.success) {
        alert("Success! Room has been added to your cart.");
      }
    } catch (e) {
      console.error(e);
      alert("Oops! Failed to add the room to your cart. Please try again later.");
    } finally {
      setAddingId(null);
    }
  }

  // Pre-generate a list of next 7 days for the picker
  const dayOptions = useMemo(() => {
    const list = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      list.push(d.toISOString().split("T")[0]);
    }
    return list;
  }, []);

  if (!room) return <div className="p-10 text-center">Loading room...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 pt-32 pb-24 space-y-12">
      {/* Breadcrumb / Back */}
      <div className="reveal-up">
        <Link to="/rooms" className="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-blue-600 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Artistic Spaces
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-16 items-start reveal-up" style={{ animationDelay: "100ms" }}>
        {/* Left: Room Info */}
        <div className="space-y-10">
          <div className="aspect-video bg-neutral-100 rounded-[2rem] overflow-hidden shadow-2xl shadow-neutral-900/5">
            <img
              src={room.image || "/room.jpg"}
              alt={room.name}
              className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {room.type || "Studio Space"}
              </span>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 border border-neutral-200 px-3 py-1 rounded-full">
                Capacity {room.capacity || 20}
              </span>
            </div>
            <h1 className="text-6xl font-display font-light text-neutral-900 leading-tight">
              {room.name}
            </h1>
          </div>

          <div className="prose prose-neutral max-w-none">
            <h3 className="text-lg font-display font-medium text-neutral-800 border-b border-neutral-100 pb-2 mb-4">About this sanctuary</h3>
            <p className="text-xl text-neutral-500 font-light leading-relaxed">
              {room.description || "No description available for this artistic space."}
            </p>
          </div>

          <div className="glass p-8 rounded-[2rem] border border-neutral-100 shadow-xl shadow-neutral-900/5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Location</h3>
            <p className="text-sm font-medium text-neutral-700 italic">{room.location || "Main Campus, Building A"}</p>
          </div>
        </div>

        {/* Right: Booking / Availability */}
        <div className="space-y-8 h-fit lg:sticky lg:top-32 reveal-up" style={{ animationDelay: "200ms" }}>
          <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-neutral-900/5 border border-neutral-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-display">Availability</h2>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Secure your slot</span>
            </div>

            {/* Day Picker */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-4 scrollbar-hide">
              {dayOptions.map((d) => {
                const isActive = d === day;
                const dateObj = new Date(d);
                const labelDay = dateObj.toLocaleDateString([], { day: "numeric" });
                const labelWeek = dateObj.toLocaleDateString([], { weekday: "short" });
                return (
                  <button
                    key={d}
                    onClick={() => setDay(d)}
                    className={`flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center transition-all ${
                      isActive
                        ? "bg-neutral-900 text-white shadow-xl shadow-neutral-900/20"
                        : "bg-neutral-50 text-neutral-400 hover:bg-neutral-100"
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest mb-1">{labelWeek}</span>
                    <span className="text-xl font-display font-medium">{labelDay}</span>
                  </button>
                );
              })}
            </div>

            {/* Slots List */}
            <div className="space-y-4 min-h-[300px]">
              {loadingSlots ? (
                <div className="py-20 text-center animate-pulse font-display text-xl text-neutral-300">Consulting schedules...</div>
              ) : slots.length === 0 ? (
                <div className="py-20 text-center text-neutral-400 italic">No sessions available for this day.</div>
              ) : (
                <div className="space-y-3">
                  {slots.map((s) => (
                    <div
                      key={s.roomSlotId}
                      className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${
                        s.isAvailable
                          ? "border-neutral-100 bg-white hover:border-blue-200 hover:shadow-lg"
                          : "bg-neutral-50 opacity-40 grayscale border-transparent"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-lg font-display font-medium text-neutral-900">
                          {fmtTime(s.startTime)} — {fmtTime(s.endTime)}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 pt-1">
                          ${s.price?.$numberDecimal || room.defaultPrice?.$numberDecimal} · Single Engagement
                        </span>
                      </div>

                      <button
                        disabled={!s.isAvailable || addingId === s.roomSlotId}
                        onClick={() => onAddToCart(s)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                          s.isAvailable
                            ? "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
                            : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                        }`}
                      >
                        {addingId === s.roomSlotId ? "Adding..." : s.isAvailable ? "Reserve" : "Reserved"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-50 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-300">
                All facility fees and taxes are curated into the final rate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
