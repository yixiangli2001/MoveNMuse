// Shirley
import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { CheckoutBtn } from "../utils/index.jsx";
import { Link } from "react-router-dom";
import {
  getCartById,
  removeCartItem,
  removeMultipleCartItems,
  updateCartItem,
} from "../services/cartService";

export default function CartPage() {
  const user = useSelector((state) => state.auth.userData);
  const [cart, setCart] = useState(null);
  const [products, setProducts] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [loading, setLoading] = useState(false);

  const userId = user?.userId;

  // Load Cart
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        setLoading(true);
        const res = await getCartById(userId);
        const data = res.data || res;
        setCart(data);
        setProducts(
          (data.cartItems || []).map((i) => ({ ...i, isSelected: true }))
        );
      } catch (e) {
        console.error("Failed to fetch cart", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, userId]);

  const priceOf = (p) =>
    Number(p?.occurrence?.price?.$numberDecimal ?? p?.occurrence?.price ?? 0);

  const subtotal = useMemo(() => {
    const items = Array.isArray(products) ? products : [];
    return items
      .filter((p) => p.isSelected)
      .reduce((sum, p) => sum + priceOf(p), 0);
  }, [products]);

  const toggleOne = (itemId) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.itemId === itemId ? { ...p, isSelected: !p.isSelected } : p
      )
    );
  };

  const removeItem = async (itemId) => {
    try {
      setLoading(true);
      const res = await removeCartItem({ cartId: cart.cartId, itemId });
      const data = res.data || res;
      setCart(data);
      setProducts((prev) => prev.filter((p) => p.itemId !== itemId));
    } catch (e) {
      console.error("Failed to remove item", e);
    } finally {
      setConfirmId(null);
      setLoading(false);
    }
  };

  const updateOccurrence = async (itemId, occurrenceId) => {
    try {
      const res = await updateCartItem({
        cartId: cart.cartId,
        itemId,
        occurrenceId: occurrenceId,
      });
      const data = res.data || res;
      setCart(data);
      setProducts(data.cartItems.map(item => ({
        ...item,
        isSelected: products.find(p => p.itemId === item.itemId)?.isSelected ?? true
      })));
    } catch (e) {
      console.error("Failed to update occurrence", e);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto p-6 pt-32 text-center space-y-8">
        <h1 className="text-6xl font-display font-light">Your <span className="italic">Collection</span></h1>
        <div className="glass rounded-3xl p-12 max-w-xl mx-auto">
          <p className="text-xl text-neutral-500 font-light mb-8">Please sign in to view your artistic selections.</p>
          <Link to="/login" className="px-8 py-3 bg-neutral-900 text-white rounded-full font-medium hover:bg-blue-600 transition-all">
            Sign In to Muse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 pt-32 pb-24 space-y-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 reveal-up">
        <div className="space-y-4">
          <h1 className="text-6xl font-display font-light">Your <span className="italic text-blue-600">Curations</span></h1>
          <p className="text-xl text-neutral-500 font-light max-w-xl">Finalize your artistic journey. Every selection is a step toward your next inspiration.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-16 items-start">
        {/* Gallery List */}
        <div className="lg:col-span-2 space-y-8">
          {loading || products === null ? (
            <div className="py-20 text-center animate-pulse font-display text-2xl text-neutral-400">Loading collection...</div>
          ) : !products.length ? (
            <div className="py-20 text-center space-y-6 reveal-up">
              <p className="text-2xl font-display italic text-neutral-400">Your gallery is empty.</p>
              <Link to="/courses" className="inline-block text-blue-600 font-semibold hover:underline">
                Explore Discoveries &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 reveal-up" style={{ animationDelay: "100ms" }}>
              {products.map((p) => (
                <div key={p.itemId} className={`group relative flex flex-col md:flex-row gap-8 p-6 rounded-4xl transition-all duration-500 border ${p.isSelected ? "bg-white border-neutral-100 shadow-xl shadow-neutral-900/5" : "bg-neutral-50/50 border-transparent opacity-60"}`}>
                  {/* Checkbox Overlay */}
                  <button 
                    onClick={() => toggleOne(p.itemId)}
                    className={`absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 ${p.isSelected ? "bg-blue-600 text-white shadow-lg" : "bg-white border border-neutral-200 text-transparent hover:border-blue-400"}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </button>

                  {/* Visual */}
                  <div className="w-full md:w-48 aspect-[4/3] rounded-3xl overflow-hidden bg-neutral-100">
                    <img 
                      src={p.product?.images?.[0] || p.product?.image || (p.productType === "Course" ? "/danceClass.jpg" : "/room.jpg")} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      alt={p.product?.name}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1 block">
                            {p.productType} · {p.product?.category || p.product?.type}
                          </span>
                          <h3 className="text-2xl font-display font-medium text-neutral-900 leading-none">
                            {p.product?.courseName || p.product?.name}
                          </h3>
                        </div>
                        <button 
                          onClick={() => setConfirmId(p.itemId)}
                          className="p-2 text-neutral-300 hover:text-red-500 transition-colors"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Date & Time</label>
                          <select
                            className="w-full bg-neutral-50 rounded-xl border-none px-3 py-1.5 text-xs font-medium text-neutral-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                            value={String(p.occurrenceId)}
                            onChange={(e) => updateOccurrence(p.itemId, e.target.value)}
                          >
                            {(p.occurrences || []).map((o) => (
                              <option key={String(o.sessionId || o.roomSlotId)} value={String(o.sessionId || o.roomSlotId)}>
                                {new Date(o.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {new Date(o.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Duration</label>
                          <div className="text-sm font-medium text-neutral-700 py-1.5">{p.occurrence?.duration || 0} minutes</div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 flex items-end justify-between">
                      <div className="text-2xl font-medium text-neutral-900">
                        ${priceOf(p).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Side Panel */}
        <aside className="lg:sticky lg:top-32 reveal-up" style={{ animationDelay: "200ms" }}>
          <div className="bg-neutral-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-neutral-900/20 space-y-10">
            <h2 className="text-3xl font-display">Summary</h2>
            
            <div className="space-y-6">
              <div className="flex justify-between items-baseline">
                <span className="text-neutral-400 text-sm font-light">Subtotal</span>
                <span className="text-2xl font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-baseline border-t border-white/10 pt-6">
                <span className="text-neutral-400 text-sm font-light">Service Fee</span>
                <span className="text-sm font-medium italic text-blue-400">Included</span>
              </div>
              <div className="flex justify-between items-end border-t border-white/10 pt-6">
                <span className="text-lg font-display">Total Investment</span>
                <span className="text-4xl font-display text-blue-400">${subtotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-4">
              <CheckoutBtn
                selectedItems={products?.filter((p) => p.isSelected) || []}
                subtotal={subtotal}
                userId={userId}
              />
              <p className="mt-6 text-[10px] text-neutral-500 text-center leading-relaxed">
                Secure artistic booking. By proceeding, you agree to our studio terms and cancellation policy.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Confirm Remove Modal */}
      {confirmId != null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setConfirmId(null)} />
          <div className="relative bg-white rounded-[3rem] p-10 shadow-2xl max-w-sm w-full text-center space-y-8 animate-zoom-in">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-display">Remove Item?</h3>
              <p className="text-neutral-500 font-light">This selection will be removed from your collection.</p>
            </div>
            <div className="flex gap-4">
              <button
                className="flex-1 px-6 py-3 rounded-full border border-neutral-200 text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-all"
                onClick={() => setConfirmId(null)}
              >
                Keep it
              </button>
              <button
                className="flex-1 px-6 py-3 rounded-full bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                onClick={() => removeItem(confirmId)}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
