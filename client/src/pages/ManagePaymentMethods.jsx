// Shirley
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import PaymentMethodForm from "../components/PaymentMethodForm.jsx";
import {
  getPaymentDetails,
  setDefaultPaymentDetail,
  deletePaymentDetail,
} from "../services/paymentService";

export default function ManagePaymentMethods() {
  const user = useSelector((s) => s.auth.userData);
  const userId = user?.userId;

  const [paymentDetails, setPaymentDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [settingDefaultId, setSettingDefaultId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

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
    <div className="max-w-7xl mx-auto p-6 pt-32 pb-24 space-y-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 reveal-up">
        <div className="space-y-4">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-blue-600 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back
          </button>
          <h1 className="text-6xl font-display font-light text-neutral-900">Payment <span className="italic text-blue-600">Sanctuary</span></h1>
          <p className="text-xl text-neutral-500 font-light max-w-xl">Securely manage your artistic funding. Every card is a key to your next creative breakthrough.</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-8 py-3 bg-neutral-900 text-white rounded-full font-medium hover:bg-blue-600 transition-all shadow-lg shadow-neutral-900/10"
        >
          {showAddForm ? "Close Form" : "Add New Method"}
        </button>
      </div>

      {errorMsg && (
        <div className="rounded-2xl border border-red-100 bg-red-50 text-red-700 text-sm px-6 py-4 animate-fade-in">
          {errorMsg}
        </div>
      )}

      {showAddForm && (
        <div className="glass rounded-[3rem] p-12 max-w-2xl mx-auto reveal-up shadow-2xl shadow-neutral-900/5 animate-zoom-in">
          <h2 className="text-3xl font-display mb-10 text-center">Add artistic <span className="italic">funding</span></h2>
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

      <div className="min-h-[40vh]">
        {loading ? (
          <div className="py-20 text-center animate-pulse font-display text-2xl text-neutral-400">Authenticating vaults...</div>
        ) : paymentDetails.length === 0 ? (
          <div className="py-20 text-center space-y-6 reveal-up">
            <p className="text-2xl font-display italic text-neutral-400">No payment methods found.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 reveal-up" style={{ animationDelay: "100ms" }}>
            {paymentDetails.map((p) => (
              <div
                key={p.paymentDetailId}
                className={`group relative h-64 rounded-[2.5rem] p-10 transition-all duration-700 border ${
                  p.isDefault 
                    ? "bg-neutral-900 text-white border-neutral-800 shadow-2xl shadow-neutral-900/20" 
                    : "bg-white text-neutral-900 border-neutral-100 shadow-xl shadow-neutral-900/5 hover:border-blue-200"
                }`}
              >
                <div className="h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">
                        {String(p.cardBrand).toUpperCase()}
                      </div>
                      <div className="text-3xl font-display tracking-widest flex items-center gap-2">
                        <span className="opacity-30">••••</span>
                        <span>{maskLast4(p.cardNumber)}</span>
                      </div>
                    </div>
                    {p.isDefault && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 border border-blue-400/30 px-3 py-1 rounded-full">
                        Primary
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">Cardholder</div>
                        <div className="text-sm font-medium">{p.name}</div>
                      </div>
                      <div className="space-y-1 text-right">
                        <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">Expires</div>
                        <div className="text-sm font-medium">{String(p.expiryMonth).padStart(2, "0")}/{p.expiryYear}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t border-current opacity-10 group-hover:opacity-20 transition-opacity" />
                    
                    <div className="flex items-center justify-between gap-4">
                      {!p.isDefault && (
                        <button
                          onClick={() => onSetDefault(p.paymentDetailId)}
                          disabled={settingDefaultId === p.paymentDetailId}
                          className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700 disabled:opacity-30 transition-colors"
                        >
                          {settingDefaultId === p.paymentDetailId ? "Setting..." : "Set as Primary"}
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(p.paymentDetailId)}
                        disabled={deletingId === p.paymentDetailId}
                        className={`text-[10px] font-bold uppercase tracking-widest ml-auto transition-colors ${p.isDefault ? "text-white/40 hover:text-red-400" : "text-neutral-300 hover:text-red-500"}`}
                      >
                        {deletingId === p.paymentDetailId ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
