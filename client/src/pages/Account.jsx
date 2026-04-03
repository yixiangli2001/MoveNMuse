// Marina
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../store/authSlice";
import { Link } from "react-router-dom";
import { getAccount, updateAccount } from "../services/userService";
import { listBookingsByUser } from "../services/bookingService";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Account = () => {
  const user = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNo: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const [bookings, setBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [sortOption, setSortOption] = useState("newest");
  const limit = 4;

  useEffect(() => {
    if (user && !editMode) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNo: user.phoneNo || "",
      });
    }
  }, [user, editMode]);

  const fetchUserProfileAndBookings = async () => {
    try {
      const res = await getAccount();
      const user = res.data;
      if (!user?.userId) return;

      dispatch(updateUser(user));
      const userId = user.userId;

      const resBookings = await listBookingsByUser(userId, {
        page: currentPage,
        limit: limit,
        sortBy: sortOption
      });
      const data = resBookings.data;

      setBookings(data.bookings || []);
      setTotalBookings(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch profile/bookings:", err.message);
    }
  };

  useEffect(() => {
    fetchUserProfileAndBookings();
  }, [currentPage, sortOption]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    
    try {
      const res = await updateAccount(formData);
      dispatch(updateUser(res.data));
      setMessage("Account details preserved.");
      setEditMode(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto p-6 pt-32 text-center space-y-8">
        <h1 className="text-6xl font-display font-light">Your <span className="italic">Sanctuary</span></h1>
        <div className="glass rounded-3xl p-12 max-w-xl mx-auto">
          <p className="text-xl text-neutral-500 font-light mb-8">Please sign in to view your profile and history.</p>
          <Link to="/login" className="px-8 py-3 bg-neutral-900 text-white rounded-full font-medium hover:bg-blue-600 transition-all">
            Sign In to Muse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 pt-32 pb-24 space-y-24">
      {/* Dashboard Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 reveal-up">
        <div className="space-y-4">
          <span className="text-sm font-semibold tracking-[0.2em] uppercase text-blue-600">Personal Gallery</span>
          <h1 className="text-7xl font-display font-light leading-none">
            Welcome, <span className="italic text-blue-600">{user.firstName}</span>
          </h1>
          <p className="text-xl text-neutral-500 font-light max-w-xl">Manage your artistic presence and track your journey through classes and spaces.</p>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/paymentHistory")}
            className="px-6 py-2.5 rounded-full border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-all"
          >
            History
          </button>
          <button
            onClick={() => navigate("/managePaymentMethods")}
            className="px-6 py-2.5 rounded-full border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-all"
          >
            Payments
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-24 items-start">
        {/* Profile Details - Sticky Column */}
        <aside className="lg:sticky lg:top-32 space-y-12 reveal-up" style={{ animationDelay: "100ms" }}>
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-display">Profile <span className="italic">Identity</span></h2>
              {!editMode && (
                <button 
                  onClick={() => setEditMode(true)}
                  className="text-xs font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Edit
                </button>
              )}
            </div>

            {message && (
              <div className="text-xs font-bold uppercase tracking-tight text-blue-600 animate-fade-in">{message}</div>
            )}

            <div className="space-y-10">
              {[
                { label: "First Name", name: "firstName", value: formData.firstName },
                { label: "Last Name", name: "lastName", value: formData.lastName },
                { label: "Email Address", name: "email", value: formData.email },
                { label: "Phone Number", name: "phoneNo", value: formData.phoneNo },
              ].map((field) => (
                <div key={field.name} className="space-y-2 group">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 group-focus-within:text-blue-600 transition-colors">
                    {field.label}
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      name={field.name}
                      value={field.value}
                      onChange={handleChange}
                      className="w-full bg-transparent border-b border-neutral-200 py-2 text-lg outline-none focus:border-blue-600 transition-colors"
                    />
                  ) : (
                    <p className="text-lg text-neutral-900 font-light">{field.value || "—"}</p>
                  )}
                </div>
              ))}
            </div>

            {editMode && (
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setEditMode(false)}
                  className="flex-1 px-6 py-3 rounded-full border border-neutral-200 text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-all"
                >
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-[2] px-6 py-3 rounded-full bg-neutral-900 text-white text-sm font-bold hover:bg-blue-600 transition-all shadow-lg shadow-neutral-900/10 disabled:opacity-50"
                >
                  {loading ? "Preserving..." : "Save Details"}
                </button>
              </div>
            )}
          </div>

          {/* Artistic Quote / Decoration */}
          <div className="pt-12 border-t border-neutral-100">
            <p className="font-display italic text-2xl text-neutral-300 leading-relaxed">
              "To dance is to be out of yourself. Larger, more beautiful, more powerful."
            </p>
          </div>
        </aside>

        {/* Booking History - Main Column */}
        <div className="lg:col-span-2 space-y-12 reveal-up" style={{ animationDelay: "200ms" }}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-neutral-100">
            <h2 className="text-4xl font-display">Booking <span className="italic">Archive</span></h2>
            
            <div className="flex items-center gap-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Order by</label>
              <select
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-sm font-semibold text-neutral-900 outline-none cursor-pointer hover:text-blue-600 transition-colors"
              >
                <option value="newest">Latest First</option>
                <option value="oldest">Earliest First</option>
                <option value="priceHigh">Highest Investment</option>
                <option value="priceLow">Lowest Investment</option>
              </select>
            </div>
          </div>

          {bookings.length === 0 ? (
            <div className="py-20 text-center space-y-6">
              <p className="text-2xl font-display italic text-neutral-400">Your archive is empty.</p>
              <Link to="/courses" className="inline-block text-blue-600 font-semibold hover:underline">
                Begin your collection &rarr;
              </Link>
            </div>
          ) : (
            <div className="space-y-12">
              {bookings.map((booking) => (
                <div key={booking._id} className="group relative grid md:grid-cols-4 gap-8 items-start hover:-translate-y-1 transition-transform duration-500">
                  <div className="md:col-span-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-4 inline-block">
                      {booking.status}
                    </span>
                    <div className="text-3xl font-display font-light text-neutral-900">
                      {new Date(booking.orderDate).toLocaleDateString("en-AU", { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="text-sm text-neutral-400 font-light mt-1">
                      {new Date(booking.orderDate).getFullYear()}
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Reference #{booking.orderId || booking._id.slice(-6)}</div>
                    <h3 className="text-2xl font-display font-medium text-neutral-900">
                      Masterclass Collection
                    </h3>
                    <p className="text-sm text-neutral-500 font-light line-clamp-2">
                      A curated selection of artistic sessions and premium studio spaces.
                    </p>
                    <div className="pt-4">
                      <Link
                        to={`/account/bookings/${booking._id}`}
                        className="text-sm font-semibold text-neutral-900 hover:text-blue-600 flex items-center gap-2 transition-colors"
                      >
                        Explore Details
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                      </Link>
                    </div>
                  </div>

                  <div className="md:col-span-1 text-right">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Total Investment</div>
                    <div className="text-2xl font-medium text-neutral-900">${booking.orderTotal.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalBookings > limit && (
            <div className="flex items-center justify-between pt-12 border-t border-neutral-100">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="text-sm font-bold uppercase tracking-widest text-neutral-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-neutral-400 transition-all flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Previous
              </button>
              
              <div className="flex items-center gap-3">
                <span className="text-lg font-display font-medium text-neutral-900">{currentPage}</span>
                <span className="text-neutral-200">/</span>
                <span className="text-sm text-neutral-400">{Math.ceil(totalBookings / limit)}</span>
              </div>

              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={bookings.length < limit || (currentPage * limit >= totalBookings)}
                className="text-sm font-bold uppercase tracking-widest text-neutral-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-neutral-400 transition-all flex items-center gap-2"
              >
                Next
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;
