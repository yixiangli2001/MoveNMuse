// Marina
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../store/authSlice";
import { Link } from "react-router-dom";
import { api } from "../api";
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
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNo: "",
  });

  const [bookings, setBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [sortOption, setSortOption] = useState("newest");
  const limit = 3; //set how many bookings you see at once

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

  // Fetch user and bookings
  useEffect(() => {
    const fetchUserProfileAndBookings = async () => {
      try {
        const res = await api.getAccount();
        const user = res.user;
        if (!user?.userId) return;

        dispatch(updateUser(user));
        const userId = user.userId;

        const bookingsRes = await fetch(
          `/api/bookings?userId=${userId}&page=${currentPage}&limit=${limit}&sortBy=${sortOption}`
        );
        const data = await bookingsRes.json();

        setBookings(data.bookings || []);
        setTotalBookings(data.total || 0);
      } catch (err) {
        console.error("Failed to fetch profile/bookings:", err.message);
      }
    };

    fetchUserProfileAndBookings();
  }, [currentPage, sortOption, dispatch]);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    let errorMessage = "";
    if (name === "phoneNo") {
      const onlyDigits = value.replace(/\D/g, "");
      if (onlyDigits.length !== 10) {
        errorMessage = "Phone number must be exactly 10 digits.";
      }
      setFormData((prev) => ({ ...prev, [name]: onlyDigits }));
    } else if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      errorMessage = emailRegex.test(value) ? "" : "Invalid email format.";
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      if (value.trim() === "") {
        errorMessage = `${name === "firstName" ? "First name" : "Last name"} is required.`;
      }
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setErrors((prev) => ({ ...prev, [name]: errorMessage }));
  };

  // Save form data to backend and update Redux
  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required.";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format.";
    }

    if (!formData.phoneNo.trim()) {
      newErrors.phoneNo = "Phone number is required.";
    } else if (formData.phoneNo.length !== 10) {
      newErrors.phoneNo = "Phone number must be exactly 10 digits.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const updatedUser = await api.updateAccount(formData);
      dispatch(updateUser(updatedUser.user));
      setMessage("Account updated successfully!");
      setEditMode(false);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    if (editMode) {
      await handleSave();
    } else {
      setEditMode(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">My Account</h1>

      <div className={`flex flex-col md:flex-row md:space-x-8 ${user?.role !== "customer" ? "items-center" : ""}`}>
        {!user ? (
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white shadow-md rounded-lg p-6">
              <p className="text-center text-gray-600">Please log in to view your account.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Account Details Section */}
            <div
              className={`bg-white rounded-lg shadow-md p-6 ${
                user.role !== "customer" ? "md:w-full mx-auto max-w-md" : "md:w-1/2"
              }`}
            >
              {message && (
                <div className="mb-4 text-center text-sm font-medium text-red-600">
                  {message}
                </div>
              )}
              <div className="space-y-4">
                {["firstName", "lastName", "email", "phoneNo"].map((field) => (
                  <div key={field} className="mb-4">
                    <label className="font-semibold capitalize block mb-1">
                      {field === "phoneNo"
                        ? "Phone Number"
                        : field === "email"
                        ? "Email"
                        : field.replace(/([A-Z])/g, " $1")}
                    </label>
                    {editMode ? (
                      <>
                        <input
                          type="text"
                          name={field}
                          value={formData[field]}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                        {errors[field] && (
                          <p className="text-red-600 text-sm mt-1">{errors[field]}</p>
                        )}
                      </>
                    ) : (
                      <p>{formData[field]}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-center mt-6">
                <button
                  onClick={handleToggle}
                  disabled={loading}
                  className={`w-full text-white py-2 px-4 rounded-lg text-md transition ${
                    editMode
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {loading ? "Saving..." : editMode ? "Save Changes" : "Edit Details"}
                </button>
                {!editMode && (
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => navigate("/paymentHistory")}
                      className="w-full bg-gray-800 text-white py-2 px-4 rounded-lg text-md hover:bg-gray-700 transition"
                    >
                      View Payment History
                    </button>

                    <button
                      onClick={() => navigate("/managePaymentMethods")}
                      className="w-full bg-gray-800 text-white py-2 px-4 rounded-lg text-md hover:bg-gray-700 transition"
                    >
                      Manage Payment Methods
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Booking History */}
            {user.role === "customer" && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-10 md:mt-0 md:w-1/2">
                <h2 className="text-2xl font-bold mb-4">Booking History</h2>
                <div className="mb-4">
                  <label className="mr-2 font-medium">Sort by:</label>
                  <select
                    value={sortOption}
                    onChange={(e) => {
                      setSortOption(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="border rounded px-2 py-1"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="priceHigh">Price: High → Low</option>
                    <option value="priceLow">Price: Low → High</option>
                  </select>
                </div>
                {bookings.length === 0 ? (
                  <p className="text-gray-500">No bookings yet.</p>
                ) : (
                  <ul className="space-y-4">
                    {[...bookings]
                      .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate))
                      .map((booking) => (
                        <li
                          key={booking._id}
                          className="border-b pb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center"
                        >
                          <div>
                            <p className="font-semibold text-blue-700">
                              Booking ID: #{booking._id}
                            </p>
                            <p className="text-sm text-gray-700">
                              Status: <span className="font-medium">{booking.status}</span>
                            </p>
                            <p className="text-sm text-gray-700">
                              Order Total: ${booking.orderTotal}
                            </p>
                            <p className="text-sm text-gray-700">
                              Order Date:{" "}
                              {new Date(booking.orderDate).toLocaleString("en-AU", { dateStyle: "medium" })}
                            </p>
                            <Link
                              to={`/account/bookings/${booking._id}`}
                              className="text-blue-600 hover:underline"
                            >
                              View Booking Details
                            </Link>
                          </div>
                        </li>
                      ))}
                  </ul>
                )}
                {bookings.length < totalBookings && (
                  <div className="flex justify-center mt-6 space-x-4">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-5 py-2 rounded ${
                        currentPage === 1
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={bookings.length < limit}
                      className={`px-5 py-2 rounded ${
                        bookings.length < limit
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Account;