// Shirley
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { createNewBooking } from "../services/bookingService";

const ProceedToPaymentBtn = ({ bookingItems, subtotal, userId }) => {
  const navigate = useNavigate();

  const handleProceed = async () => {
    try {
      // create a new booking first
      const res = await createNewBooking({
        userId,
        items: bookingItems,
        orderDate: new Date().toISOString(),
        orderTotal: subtotal,
        status: "Confirmed",
      });

      // navigate to payment page with newly created booking
      navigate("/payment", { state: { userId, booking: res.data.booking } });
    } catch (e) {
      console.error("Failed to create booking:", e);
    }
  };

  return (
    <button
      type="button"
      onClick={handleProceed}
      className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-200"
    >
      Proceed to Payment
    </button>
  );
};

ProceedToPaymentBtn.propTypes = {
  bookingItems: PropTypes.array.isRequired,
  subtotal: PropTypes.number.isRequired,
  userId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

export default ProceedToPaymentBtn;
