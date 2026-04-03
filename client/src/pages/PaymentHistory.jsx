// Shirley
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getPaymentHistoryById, getAllPaymentHistory } from "../services/paymentService";
import { Link } from "react-router-dom";

export default function PaymentHistory() {
  const user = useSelector((state) => state.auth.userData);
  const [paymentHistory, setPaymentHistory] = useState(null);
  const [loading, setLoading] = useState(false);

  const userId = user?.userId;
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    (async () => {
      try {
        if (user.role === "customer") {
          const res = await getPaymentHistoryById(userId);
          setPaymentHistory(res.data || res);
        } else {
          const res = await getAllPaymentHistory();
          setPaymentHistory(res.data || res);
        }
      } catch (e) {
        console.error("Failed to fetch payment history", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, userId]);

  function formatMoney(v) {
    const n = v?.$numberDecimal ? Number(v.$numberDecimal) : Number(v || 0);
    return n.toFixed(2);
  }

  if (!user) return null;

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
          <h1 className="text-6xl font-display font-light">Transaction <span className="italic text-blue-600">Archive</span></h1>
          <p className="text-xl text-neutral-500 font-light max-w-xl">A complete record of your artistic investments and studio engagements.</p>
        </div>
      </div>

      <div className="min-h-screen">
        {loading || paymentHistory === null ? (
          <div className="py-20 text-center animate-pulse font-display text-2xl text-neutral-400">Consulting records...</div>
        ) : !paymentHistory.length ? (
          <div className="py-20 text-center space-y-6 reveal-up">
            <p className="text-2xl font-display italic text-neutral-400">No transactions recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-8 reveal-up" style={{ animationDelay: "100ms" }}>
            {/* List View instead of Table */}
            <div className="grid gap-6">
              {paymentHistory.map((payment) => (
                <div key={payment.paymentId} className="group glass rounded-3xl p-8 hover:shadow-2xl shadow-neutral-900/5 transition-all duration-500 border border-transparent hover:border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex flex-col md:flex-row md:items-center gap-8">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        {payment.status}
                      </span>
                      <div className="text-2xl font-display text-neutral-900 pt-2">
                        {new Date(payment.paymentDate).toLocaleDateString("en-AU", { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-neutral-400 font-light">
                        {new Date(payment.paymentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div className="h-px md:h-12 w-12 md:w-px bg-neutral-100 hidden md:block" />

                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Reference</div>
                      <div className="text-sm font-medium text-neutral-900">Payment #{payment.paymentId}</div>
                      <div className="text-xs text-neutral-500">Order #{payment.orderId}</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Source</div>
                      <div className="text-sm font-medium text-neutral-900 flex items-center gap-2">
                        {String(payment.paymentDetail?.cardBrand).toLowerCase().includes("visa") ? "Visa" : "Mastercard"}
                        <span className="text-neutral-300">••••</span>
                        {payment.paymentDetail?.last4 || "0000"}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Amount</div>
                    <div className="text-3xl font-display text-neutral-900">${formatMoney(payment.amount)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
