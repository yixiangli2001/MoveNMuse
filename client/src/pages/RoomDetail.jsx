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
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      {/* Breadcrumb / Back */}
      <div className="mb-6">
        <Link to="/rooms" className="text-blue-600 hover:underline">
          &larr; Back to Rooms
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Left: Room Info */}
        <div className="space-y-6">
          <div className="aspect-video bg-gray-200 rounded-2xl overflow-hidden shadow-inner">
            <img
              src={room.image || "/room.jpg"}
              alt={room.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">{room.name}</h1>
            <p className="text-gray-500 mt-1">{room.type || "Studio Space"}</p>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                Capacity: {room.capacity || 20}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                From ${room.defaultPrice?.$numberDecimal || 50}/hr
              </span>
            </div>
          </div>

          <div className="prose text-gray-600">
            <h3 className="text-lg font-semibold text-gray-800">About this room</h3>
            <p>{room.description || "No description available for this room."}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 className="font-semibold mb-2">Location</h3>
            <p className="text-sm text-gray-600">{room.location || "Main Campus, Building A"}</p>
          </div>
        </div>

        {/* Right: Booking / Availability */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 h-fit sticky top-8">
          <h2 className="text-xl font-bold mb-4">Availability</h2>

          {/* Day Picker */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {dayOptions.map((d) => {
              const isActive = d === day;
              const dateObj = new Date(d);
              const label = dateObj.toLocaleDateString([], { weekday: "short", day: "numeric" });
              return (
                <button
                  key={d}
                  onClick={() => setDay(d)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Slots List */}
          <div className="space-y-3 min-h-[300px]">
            {loadingSlots ? (
              <p className="text-center text-gray-400 py-10">Loading sessions...</p>
            ) : slots.length === 0 ? (
              <p className="text-center text-gray-400 py-10">No sessions available for this day.</p>
            ) : (
              slots.map((s) => (
                <div
                  key={s.roomSlotId}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition ${
                    s.isAvailable
                      ? "border-gray-100 bg-white hover:border-blue-200 hover:shadow-md"
                      : "bg-gray-50 opacity-60 grayscale border-transparent"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900">
                      {fmtTime(s.startTime)} - {fmtTime(s.endTime)}
                    </span>
                    <span className="text-xs text-gray-400">
                      ${s.price?.$numberDecimal || room.defaultPrice?.$numberDecimal} · Single Slot
                    </span>
                  </div>

                  <button
                    disabled={!s.isAvailable || addingId === s.roomSlotId}
                    onClick={() => onAddToCart(s)}
                    className={`px-5 py-2 rounded-xl text-sm font-bold transition ${
                      s.isAvailable
                        ? "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {addingId === s.roomSlotId ? "Adding..." : s.isAvailable ? "Add" : "Full"}
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-50 text-center">
            <p className="text-xs text-gray-400">
              Prices are inclusive of all taxes and facility fees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
