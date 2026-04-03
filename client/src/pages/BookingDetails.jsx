// Marina
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getBookingDetails } from "../services/bookingService";
import { getCourseSession } from "../services/sessionService";
import { getCourse } from "../services/courseService";
import { getRoomSlotById } from "../services/roomService";

const BookingDetails = () => {
  const { bookingId } = useParams();
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
                    courseName,
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
                    roomName: roomData?.name || "Unknown Room",
                    startTime: slotData?.startTime ? new Date(slotData.startTime) : null,
                    endTime: slotData?.endTime ? new Date(slotData.endTime) : null,
                    isAvailable: slotData?.isAvailable ?? false,
                    price: slotData?.price?.$numberDecimal || roomData?.defaultPrice?.$numberDecimal || "N/A",
                    location: roomData?.location || "N/A",
                    capacity: roomData?.capacity || "N/A",
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

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Booking Details</h1>

      {/* Booking Info */}
      <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Booking Info</h2>
        <p><strong>Booking ID:</strong> {booking._id}</p>
        <p><strong>Status:</strong> {booking.status}</p>
        <p><strong>Order Date:</strong> {new Date(booking.orderDate).toLocaleString()}</p>
        <p><strong>Order Total:</strong> ${booking.orderTotal}</p>
      </div>

      {/* Booked Items */}
      <div className="bg-white shadow-md rounded-lg p-6 mt-6 space-y-4">
        <h2 className="text-xl font-semibold">Booked Items</h2>
        {booking.items && booking.items.length > 0 ? (
          booking.items.map((item, index) => (
            <div key={index} className="border-b pb-4 mb-4">
              <p><strong>Item ID:</strong> {item.itemId}</p>
              <p><strong>Type:</strong> {item.productType}</p>

              {item.details ? (
                <>
                  {item.productType === "Course" ? (
                    <>
                      <p><strong>Course Name:</strong> {item.details.courseName}</p>
                      <p><strong>Start Time:</strong> {new Date(item.details.startTime).toLocaleString()}</p>
                      <p><strong>End Time:</strong> {new Date(item.details.endTime).toLocaleString()}</p>
                      <p><strong>Instructor ID:</strong> {item.details.instructorId}</p>
                      <p><strong>Location:</strong> {item.details.location}</p>
                      <p><strong>Price:</strong> ${item.details.price}</p>
                    </>
                  ) : item.productType === "Room" ? (
                    <>
                      <p><strong>Room Name:</strong> {item.details.roomName}</p>
                      <p><strong>Start Time:</strong> {new Date(item.details.startTime).toLocaleString()}</p>
                      <p><strong>End Time:</strong> {new Date(item.details.endTime).toLocaleString()}</p>
                      <p><strong>Available:</strong> {item.details.isAvailable ? "Yes" : "No"}</p>
                      <p><strong>Price:</strong> ${item.details.price}</p>
                    </>
                  ) : null}
                </>
              ) : (
                <p className="text-red-600">Details not available</p>
              )}
            </div>
          ))
        ) : (
          <p>No items found in booking.</p>
        )}
      </div>

      <div className="mt-6">
        <Link to="/account" className="text-blue-600 hover:underline">
          ← Back to My Account
        </Link>
      </div>
    </div>
  );
};

export default BookingDetails;
