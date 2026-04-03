// Shirley
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPaymentDetails, addPaymentDetail, processPayment } from "../services/paymentService";
import PaymentMethodForm from "../components/PaymentMethodForm.jsx";

export default function Payment() {
  const { state } = useLocation();

  const booking = state?.booking || null;
  const subtotal = state?.booking.orderTotal || 0;
  const userId = state?.userId || 0;
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // load payment methods on mount
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        setLoading(true);
        const res = await getPaymentDetails(userId);
        const list = Array.isArray(res) ? res : res.data ? (Array.isArray(res.data) ? res.data : [res.data]) : [];
        setPaymentDetails(list);
        setSelectedPaymentId(
          list.find((p) => p.isDefault)?.paymentDetailId ??
            list[0]?.paymentDetailId ??
            null
        );
      } catch (e) {
        console.error("Failed to fetch payment methods", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const maskLast4 = (n) => String(n).slice(-4);

  // handle adding a new card
  async function onSaveCard(payload) {
    try {
      setSaving(true);
      setSaveError("");
      const res = await addPaymentDetail({ ...payload, userId });
      const created = res.data;
      setPaymentDetails((prev) => [created, ...prev]);
      setSelectedPaymentId(created.paymentDetailId);
      setShowAddForm(false);
    } catch (e) {
      setSaveError(e.message || "Failed to save card.");
    } finally {
      setSaving(false);
    }
  }

  // handle payment submission
  async function handlePayNow(e) {
    e.preventDefault();
    if (!selectedPaymentId) {
      alert("Please select or add a payment method.");
      return;
    }
    try {
      const res = await processPayment({
        orderId: booking.orderId,
        amount: booking.orderTotal,
        userId: userId,
        paymentDetailId: selectedPaymentId,
      });
      navigate("/paymentSuccess", {
        state: { booking, payment: res.data.payment },
      });
    } catch (e) {
      alert("Payment failed: " + (e.message || "Unknown error"));
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <h1 className="text-3xl font-bold text-center mb-6">Payment Methods</h1>
       <div className="max-w-4xl mx-auto px-4">
      {loading ? (
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="text-center text-gray-600 animate-pulse">
            Loading your payment methods…
          </p>
        </div>
      ): !paymentDetails.length && !showAddForm ? (
          <div className="bg-white shadow-md rounded-lg p-6">
            <p className="text-center text-gray-600">You do not have any saved card yet.</p>
          </div>
        ) : (
        <div className="max-w-4xl mx-auto px-4">
          {!showAddForm && (
            <div className="bg-white shadow-md rounded-lg p-6">
              <form onSubmit={handlePayNow}>
                <fieldset>
                  <legend className="sr-only">Choose a payment method</legend>
                  <div className="relative">
                    {paymentDetails.map((p) => (
                      <div className="mb-2" key={p.paymentDetailId}>
                        <input
                          type="radio"
                          name="paymentMethodId"
                          id={`pm-${p.paymentDetailId}`}
                          value={p.paymentDetailId}
                          className="hidden peer"
                          checked={selectedPaymentId === p.paymentDetailId}
                          onChange={() => setSelectedPaymentId(p.paymentDetailId)}
                        />
                        <label
                          htmlFor={`pm-${p.paymentDetailId}`}
                          className="inline-flex items-center justify-between w-full p-5 bg-white border-2 rounded-lg cursor-pointer group border-neutral-200/70 text-neutral-600 peer-checked:border-blue-400 peer-checked:text-neutral-900 peer-checked:bg-blue-200/50 hover:text-neutral-900 hover:border-neutral-300"
                        >
                          <div className="flex items-center space-x-5">
                            {String(p.cardBrand).toLowerCase().includes("visa") ? (
                              <img className="w-20" src="visa.svg" alt="Visa" />
                            ) : (
                              <img
                                className="w-20"
                                src="mastercard-logo.png"
                                alt="Mastercard"
                              />
                            )}
                            <div className="flex flex-col justify-start">
                              <div className="w-full text-lg font-semibold">
                                **** **** **** {maskLast4(p.cardNumber)}
                              </div>
                              <div className="w-full text-sm opacity-60">
                                Expires {String(p.expiryMonth).padStart(2, "0")}/{p.expiryYear}
                              </div>
                              {p.nickname && (
                                <div className="w-full text-xs opacity-60">
                                  {p.nickname}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="block">
                            <div className="w-full text-lg font-semibold">
                              {p.isDefault && (
                                <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </fieldset>
                <div className="mt-6 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(true)}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    + Add New Card
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                    disabled={!selectedPaymentId}
                  >
                    Pay ${subtotal} Now
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {showAddForm && (
        <div className="max-w-2xl mx-auto mt-6 bg-white shadow-md rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Add New Card</h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          {saveError && <p className="text-red-500 mb-4">{saveError}</p>}
          <PaymentMethodForm onSave={onSaveCard} loading={saving} />
        </div>
      )}

      <div className="max-w-4xl mx-auto mt-6 px-4">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:underline"
        >
          ← Back to Booking
        </button>
      </div>
      </div>
    </div>
  );
}
