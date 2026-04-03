// Marina
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getBookingDetails } from "../services/bookingService";
import { getCourseSession } from "../services/sessionService";
import { getCourse } from "../services/courseService";
import { getRoomSlotById } from "../services/roomService";

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookingWithDetails = async () => {
      try {
        const res = await getBookingDetails(bookingId);
        const bookingData = res.data;

        const itemsWithDetails = await Promise.all(
          bookingData.items.map(async (item) => {
            if (!item.occurrenceId) return item;

            try {
              if (item.productType === "Course") {
                const sessionRes = await getCourseSession(item.occurrenceId);
                const session = sessionRes.data;
                let courseName = "Unknown Course";

                if (session?.courseId) {
                  try {
                    const courseRes = await getCourse(session.courseId);
                    const course = courseRes.data;
                    courseName = course?.name || "Unknown Course";
                  } catch (err) {
                    console.warn("Failed to fetch course name:", err);
                  }
                }

                return {
                  ...item,
                  details: {
                    name: courseName,
                    startTime: session?.startTime,
                    endTime: session?.endTime,
                    instructorId: session?.instructorId,
                    location: session?.location,
                    price: session?.price?.$numberDecimal || "N/A",
                  }
                };
              } else if (item.productType === "Room") {
                const resRoom = await getRoomSlotById(item.occurrenceId);
                const slotData = resRoom.data.slot;
                const roomData = resRoom.data.room;

                return {
                  ...item,
                  details: {
                    name: roomData?.name || "Unknown Room",
                    startTime: slotData?.startTime ? new Date(slotData.startTime) : null,
                    endTime: slotData?.endTime ? new Date(slotData.endTime) : null,
                    price: slotData?.price?.$numberDecimal || roomData?.defaultPrice?.$numberDecimal || "N/A",
                    location: roomData?.location || "N/A",
                    type: roomData?.type || "N/A",
                  },
                };
              } else {
                return item;
              }
            } catch (err) {
              console.warn("Failed to fetch details for item:", err);
              return { ...item, details: null };
            }
          })
        );

        setBooking({ ...bookingData, items: itemsWithDetails });
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingWithDetails();
  }, [bookingId]);

  if (loading) return <div className="max-w-7xl mx-auto p-6 pt-32 text-center animate-pulse font-display text-2xl text-neutral-400">Opening the archive...</div>;
  
  if (error) return (
    <div className="max-w-7xl mx-auto p-6 pt-32 text-center space-y-6">
      <p className="text-red-600 font-medium">{error}</p>
      <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline">Return to Sanctuary</button>
    </div>
  );

  if (!booking) return null;

  return (
    <div className="max-w-7xl mx-auto p-6 pt-32 pb-24 space-y-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 reveal-up">
        <div className="space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-blue-600 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to Archive
          </button>
          <h1 className="text-6xl font-display font-light">Booking <span className="italic text-blue-600">Specifics</span></h1>
          <p className="text-xl text-neutral-500 font-light max-w-xl">Detailed insights into your curated artistic engagement.</p>
        </div>
        
        <div className="text-right">
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-2 inline-block">
            {booking.status}
          </span>
          <div className="text-sm text-neutral-400 font-light italic">Order #{booking.orderId || booking._id?.slice(-6)}</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-24 items-start">
        {/* Main Content: Booked Items */}
        <div className="lg:col-span-2 space-y-12 reveal-up" style={{ animationDelay: "100ms" }}>
          <h2 className="text-3xl font-display border-b border-neutral-100 pb-6">Engagement <span className="italic">Manifest</span></h2>
          
          <div className="space-y-16">
            {booking.items.map((item, index) => (
              <div key={index} className="group flex flex-col md:flex-row gap-10 items-start">
                <div className="w-full md:w-48 aspect-[4/3] rounded-3xl overflow-hidden bg-neutral-50 flex-shrink-0">
                  <img 
                    src={item.productType === "Course" ? "/danceClass.jpg" : "/room.jpg"} 
                    className="w-full h-full object-cover" 
                    alt={item.details?.name}
                  />
                </div>
                
                <div className="flex-1 space-y-6">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                      {item.productType} · {item.details?.type || "General"}
                    </span>
                    <h3 className="text-3xl font-display font-medium text-neutral-900">{item.details?.name || "Artistic Session"}</h3>
                  </div>

                  {item.details ? (
                    <div className="grid sm:grid-cols-2 gap-8 pt-4 border-t border-neutral-50">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Date & Time</label>
                        <div className="text-sm font-medium text-neutral-900 leading-relaxed">
                          {new Date(item.details.startTime).toLocaleDateString("en-AU", { day: 'numeric', month: 'long', year: 'numeric' })}
                          <br />
                          <span className="text-neutral-500 font-light">at {new Date(item.details.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Sanctuary Location</label>
                        <div className="text-sm font-medium text-neutral-900">{item.details.location}</div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Individual Investment</label>
                        <div className="text-sm font-medium text-neutral-900">${item.details.price}</div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm italic text-neutral-400">Manifest details currently unavailable.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Summary & Support */}
        <aside className="lg:sticky lg:top-32 reveal-up space-y-12" style={{ animationDelay: "200ms" }}>
          <div className="bg-neutral-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-neutral-900/20 space-y-8">
            <h2 className="text-3xl font-display">Investment <span className="italic text-blue-400 text-2xl block">Recap</span></h2>
            
            <div className="space-y-6">
              <div className="flex justify-between items-baseline">
                <span className="text-neutral-400 text-sm font-light">Order Date</span>
                <span className="text-sm font-medium">{new Date(booking.orderDate).toLocaleDateString("en-AU", { dateStyle: 'medium' })}</span>
              </div>
              <div className="flex justify-between items-baseline border-t border-white/10 pt-6">
                <span className="text-neutral-400 text-sm font-light">Status</span>
                <span className="text-sm font-medium text-blue-400 italic">{booking.status}</span>
              </div>
              <div className="flex justify-between items-end border-t border-white/10 pt-6">
                <span className="text-lg font-display">Total</span>
                <span className="text-4xl font-display text-blue-400">${booking.orderTotal?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="px-8 space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Artistic Support</h4>
            <p className="text-xs text-neutral-500 font-light leading-relaxed">
              If you need to adjust your booking or have questions about your session, please contact the studio curator directly.
            </p>
            <Link to="/courses" className="inline-block text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest">
              Continue Exploration &rarr;
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BookingDetails;
