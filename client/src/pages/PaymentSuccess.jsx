// Shirley
import { Link, useLocation } from "react-router-dom";

export default function PaymentSuccess() {
  const { state } = useLocation();
  const booking = state?.booking;

  return (
    <div className="max-w-7xl mx-auto p-6 pt-32 pb-24 flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12">
      {/* Animated Success Icon */}
      <div className="reveal-up relative">
        <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600 animate-pulse">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
        {/* Floating sparkles/blobs */}
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-amber-100 rounded-full mix-blend-multiply blur-lg opacity-70" />
        <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-indigo-100 rounded-full mix-blend-multiply blur-lg opacity-70" />
      </div>

      <div className="space-y-6 reveal-up" style={{ animationDelay: "200ms" }}>
        <h1 className="text-7xl font-display font-light leading-tight">
          A Journey <span className="italic text-blue-600">Begins</span>
        </h1>
        <p className="text-xl text-neutral-500 font-light max-w-2xl mx-auto">
          Your artistic engagement has been successfully preserved. We've sent the details to your digital gallery.
        </p>
      </div>

      {booking && (
        <div className="glass rounded-[3rem] p-10 max-w-md w-full reveal-up shadow-2xl shadow-neutral-900/5" style={{ animationDelay: "400ms" }}>
          <div className="space-y-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Order Reference</div>
            <div className="text-3xl font-display font-medium text-neutral-900 leading-none">#{booking.orderId || booking._id?.slice(-6)}</div>
            <div className="pt-4 border-t border-neutral-100 mt-4">
              <div className="text-sm font-medium text-neutral-900">Amount Secured</div>
              <div className="text-xl text-blue-600 font-display">${booking.orderTotal?.toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-6 reveal-up pt-8" style={{ animationDelay: "600ms" }}>
        <Link 
          to="/account" 
          className="px-10 py-4 bg-neutral-900 text-white rounded-full font-bold shadow-xl shadow-neutral-900/20 hover:bg-blue-600 transition-all"
        >
          View My Sanctuary
        </Link>
        <Link 
          to="/courses" 
          className="px-10 py-4 border border-neutral-200 text-neutral-600 rounded-full font-bold hover:bg-neutral-50 transition-all"
        >
          Discover More
        </Link>
      </div>

      {/* Philosophy Quote */}
      <div className="pt-24 reveal-up" style={{ animationDelay: "800ms" }}>
        <p className="font-display italic text-2xl text-neutral-300">
          "Creativity takes courage." — Henri Matisse
        </p>
      </div>
    </div>
  );
}
