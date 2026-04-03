// Shirley
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import PaymentMethodForm from "../components/PaymentMethodForm.jsx";
import {
  getPaymentDetails,
  setDefaultPaymentDetail,
  deletePaymentDetail,
  addPaymentDetail
} from "../services/paymentService";

function CardSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-lg shadow-md p-6">
      <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
      <div className="h-4 w-64 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-48 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-28 bg-gray-200 rounded" />
    </div>
  );
}

export default function ManagePaymentMethods() {
  const user = useSelector((s) => s.auth.userData);
  const userId = user?.userId;

  const [paymentDetails, setPaymentDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [settingDefaultId, setSettingDefaultId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // load methods
  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        setLoading(true);
        setErrorMsg("");
        const res = await getPaymentDetails(userId);
        if (aborted) return;
        const data = res.data || res;
        const list = Array.isArray(data) ? data : data ? [data] : [];
        list.sort((a, b) => (b.isDefault === true) - (a.isDefault === true));
        setPaymentDetails(list);
      } catch (e) {
        if (!aborted) setErrorMsg(e.message || "Failed to load payment methods");
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, [userId, showAddForm]);

  // set default payment method
  const onSetDefault = async (id) => {
    try {
      setSettingDefaultId(id);
      setErrorMsg("");
      await setDefaultPaymentDetail({ userId, paymentDetailId: id });
      setPaymentDetails((prev) =>
        prev
          .map((p) => ({ ...p, isDefault: p.paymentDetailId === id }))
          .sort((a, b) => (b.isDefault === true) - (a.isDefault === true))
      );
    } catch (e) {
      setErrorMsg(e.message || "Failed to set default");
    } finally {
      setSettingDefaultId(null);
    }
  };
// delete payment method
  const onDelete = async (id) => {
    if (!confirm("Remove this payment method?")) return;
    try {
      setDeletingId(id);
      setErrorMsg("");
      await deletePaymentDetail(id);
      setPaymentDetails((prev) => prev.filter((p) => p.paymentDetailId !== id));
    } catch (e) {
      setErrorMsg(e.message || "Failed to delete card");
    } finally {
      setDeletingId(null);
    }
  };

  const maskLast4 = (n) =>
    typeof n === "string" && n.length >= 4 ? n.slice(-4) : "••••";

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Manage My Payment Methods</h1>

      {errorMsg && (
        <div className="mb-4 text-center text-sm font-medium text-red-600">
          {errorMsg}
        </div>
      )}

      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setShowAddForm((s) => !s)}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
        >
          {showAddForm ? "Hide form" : "Add new card"}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <PaymentMethodForm
            onSubmit={async (payload) => {
              try {
                const res = await addPaymentDetail({ ...payload, userId });
                const created = res.data;
                setPaymentDetails((prev) =>
                  [created, ...prev].sort(
                    (a, b) => (b.isDefault === true) - (a.isDefault === true)
                  )
                );
                setShowAddForm(false);
              } catch (e) {
                setErrorMsg(e.message || "Failed to add new card");
              }
            }}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : paymentDetails.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-600">
          You do not have any saved payment methods yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {paymentDetails.map((p) => (
            <div
              key={p.paymentDetailId}
              className={`bg-white rounded-lg shadow-md p-6 border ${
                p.isDefault ? "border-blue-400" : "border-gray-200"
              }`}
            >
              {/* Row 1: Brand & Last4 & Default badge */}
              <div className="flex items-center justify-between mb-2">
                <div className="text-lg font-semibold">
                  {String(p.cardBrand).toLowerCase().includes("visa")
                    ? "Visa"
                    : "Mastercard"}{" "}
                  •••• {maskLast4(p.cardNumber)}
                </div>
                {p.isDefault && (
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                    Default
                  </span>
                )}
              </div>

              {/* Row 2: View-only details */}
              <div className="space-y-1 text-sm text-gray-700">
                {p.nickname && <div>Nickname: {p.nickname}</div>}
                <div>Cardholder: {p.name}</div>
                <div>
                  Expires: {String(p.expiryMonth).padStart(2, "0")}/{p.expiryYear}
                </div>
              </div>

              {/* Row 3: Actions (no edit) */}
              <div className="mt-4 flex items-center gap-2">
                {!p.isDefault && (
                  <button
                    className="px-3 py-1 rounded bg-white border hover:bg-gray-50"
                    onClick={() => onSetDefault(p.paymentDetailId)}
                    disabled={settingDefaultId === p.paymentDetailId}
                    type="button"
                  >
                    {settingDefaultId === p.paymentDetailId ? "Setting..." : "Set default"}
                  </button>
                )}
                <button
                  className="ml-auto px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                  onClick={() => onDelete(p.paymentDetailId)}
                  disabled={deletingId === p.paymentDetailId}
                  type="button"
                >
                  {deletingId === p.paymentDetailId ? "Removing..." : "Remove"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
