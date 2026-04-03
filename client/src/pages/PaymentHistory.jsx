// Shirley
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { getPaymentHistoryById, getAllPaymentHistory } from "../services/paymentService";

export default function PaymentHistory() {
  const user = useSelector((state) => state.auth.userData);
  const [paymentHistory, setPaymentHistory] = useState(null);
  const [loading, setLoading] = useState(false);

  const userId = user?.userId;
  useEffect(() => {
    // Fetch payment history data here when component mounts
    if (!user) return;
    setLoading(true);
    (async () => {
      try {
        if (user.role == "customer") {
          const res = await getPaymentHistoryById(userId);
          setPaymentHistory(res.data || res);
        }
        if (user.role == "staff" || user.role == "admin") {
          const res = await getAllPaymentHistory();
          setPaymentHistory(res.data || res);
        }
      } catch (e) {
        console.error("Failed to fetch payment history", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // Helper
  function toNumberMaybeDecimal(v) {
  if (v && typeof v === "object" && "$numberDecimal" in v) {
    return Number(v.$numberDecimal);
  }
  return Number(v);
}

// Format money values to 2 decimal places
  function formatMoney(v) {
  const n = toNumberMaybeDecimal(v);
  if (!isFinite(n)) return "—";
  return n.toFixed(2);
}
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Payment History</h1>
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white shadow-md rounded-lg p-6">
          {/* payment history table */}
          {loading || paymentHistory === null ? (
            <div className="bg-white shadow-md rounded-lg p-6">
              <p className="text-center text-gray-600 animate-pulse">
                Loading your payment history...
              </p>
            </div>
          ) : !paymentHistory.length ? (
            <div className="bg-white shadow-md rounded-lg p-6">
              <p className="text-center text-gray-600">
                No payment history found.
              </p>
            </div>
          ) : (
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-200">
                <tr>
                  {/* one more userID role for staff View */}
                  {user.role == "staff" && (
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                      User ID
                    </th>
                  )}

                  <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                    Payment ID
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                    Order ID
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                    Amount
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                    Date
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                    Status
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                    Payment Detail
                  </th>
                </tr>
              </thead>
              <tbody>
                
                {paymentHistory && paymentHistory.length > 0 ? (
                  paymentHistory.map((payment) => (

                    <tr key={payment.paymentId}>
                  {/* one more userID role for staff View */}

                      {user.role == "staff"&& (
                        <td className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                          {payment.userId}
                        </td>
                      )}
                      <td className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                        {payment.paymentId}
                      </td>
                      <td className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                        {payment.orderId}
                      </td>
                      <td className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                        ${formatMoney(payment.amount)}
                      </td>
                      <td className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                        {new Date(payment.paymentDate)
                          .toISOString()
                          .slice(0, 19)
                          .replace("T", " ")}
                      </td>
                      <td className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                        {payment.status}
                      </td>
                      <td className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                        {payment.paymentDetail.cardBrand} ****
                        {payment.paymentDetail.last4}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-3 px-6 text-left text-sm font-medium text-gray-700"
                    >
                      No payment history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
