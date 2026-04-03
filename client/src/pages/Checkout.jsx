// Shirley
import { ProceedToPaymentBtn } from "../utils/index.jsx";
import { BackToCartBtn } from "../utils/index.jsx";
import { useLocation } from "react-router-dom";

function Checkout() {
  const { state } = useLocation();
  const userId = state?.userId;
  const items = state?.selectedItems || [];
  const bookingItems = items.map((p) => ({
    itemId: p.itemId,
    productID: p.productId,
    productType: p.productType,
    occurrenceId: p.occurrenceId,
  }));
  const subtotal = state?.subtotal || 0;

  const priceOf = (p) =>
    Number(p?.occurrence?.price?.$numberDecimal ?? p?.occurrence?.price ?? 0);

  return (
    <div className="max-w-7xl mx-auto p-6 pt-32 pb-24 space-y-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 reveal-up">
        <div className="space-y-4">
          <h1 className="text-6xl font-display font-light">Order <span className="italic text-blue-600">Review</span></h1>
          <p className="text-xl text-neutral-500 font-light max-w-xl">A final reflection on your curated selections. Confirm your journey into inspiration.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-24 items-start">
        {/* Item List */}
        <div className="lg:col-span-2 space-y-12 reveal-up" style={{ animationDelay: "100ms" }}>
          <div className="space-y-8">
            {items.map((p) => (
              <div key={p.itemId} className="flex gap-8 items-start border-b border-neutral-100 pb-8 last:border-0">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-neutral-100 flex-shrink-0">
                  <img 
                    src={p.product?.images?.[0] || p.product?.image || (p.productType === "Course" ? "/danceClass.jpg" : "/room.jpg")} 
                    className="w-full h-full object-cover" 
                    alt={p.product?.name}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                        {p.productType} · {p.product?.category || p.product?.type}
                      </span>
                      <h3 className="text-xl font-display font-medium text-neutral-900 leading-tight">
                        {p.product?.courseName || p.product?.name}
                      </h3>
                    </div>
                    <div className="text-lg font-medium text-neutral-900">
                      ${priceOf(p).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-neutral-400 font-light">
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      {new Date(p.occurrence.startTime).toLocaleDateString("en-AU", { day: 'numeric', month: 'short' })} at {new Date(p.occurrence.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>•</span>
                    <span>{p.occurrence.duration} min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Side Panel */}
        <aside className="lg:sticky lg:top-32 reveal-up" style={{ animationDelay: "200ms" }}>
          <div className="bg-neutral-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-neutral-900/20 space-y-10">
            <h2 className="text-3xl font-display">Summary</h2>
            
            <div className="space-y-6">
              <div className="flex justify-between items-baseline">
                <span className="text-neutral-400 text-sm font-light">Selections</span>
                <span className="text-sm font-medium">{items.length} items</span>
              </div>
              <div className="flex justify-between items-baseline border-t border-white/10 pt-6">
                <span className="text-neutral-400 text-sm font-light">Service & Facilities</span>
                <span className="text-sm font-medium italic text-blue-400">Included</span>
              </div>
              <div className="flex justify-between items-end border-t border-white/10 pt-6">
                <span className="text-lg font-display">Final Total</span>
                <span className="text-4xl font-display text-blue-400">${subtotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <ProceedToPaymentBtn bookingItems={bookingItems} subtotal={subtotal} userId={userId} />
              <div className="text-center">
                <BackToCartBtn />
              </div>
              <p className="mt-6 text-[10px] text-neutral-500 text-center leading-relaxed">
                By finalizing this order, you confirm the selected dates and times for your artistic engagement.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Checkout;
