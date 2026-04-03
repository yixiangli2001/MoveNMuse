// Marina
import { useState } from "react";
import { useDispatch } from "react-redux";
import { login as setUser } from "../../store/authSlice"; 
import { useNavigate, useLocation, Link } from "react-router-dom"; 
import { login } from "../../services/authService";
import { useAuth } from "../../components/auth/AuthContext.jsx";
import { jwtDecode } from "jwt-decode";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate(); 
  const dispatch = useDispatch();
  const location = useLocation();
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login({ email, password });
      const data = res.data || res;

      localStorage.setItem("token", data.token);
      authLogin(data.token);

      localStorage.setItem("user", JSON.stringify(data.user));
      dispatch(setUser(data.user));

      const role = data.user?.role || (() => {
        try { return jwtDecode(data.token)?.role; } catch { return undefined; }
      })();

      const isStaff = role === "staff" || role === "admin";
        
      const from = location.state?.from?.pathname;
      if (isStaff) {
        navigate("/admin/rooms", { replace: true });
      } else if (from) {
        navigate(from, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 pt-32 pb-24 flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md space-y-12 reveal-up">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-display font-light">Return to <span className="italic text-blue-600">Muse</span></h1>
          <p className="text-xl text-neutral-500 font-light">Welcome back to your creative sanctuary.</p>
        </div>

        <div className="glass rounded-[3rem] p-10 shadow-2xl shadow-neutral-900/5 space-y-8">
          {error && (
            <div className="text-xs font-bold uppercase tracking-tight text-red-500 text-center animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-8">
              <div className="space-y-2 group">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 group-focus-within:text-blue-600 transition-colors ml-1">Email Address</label>
                <input
                  type="email"
                  className="w-full bg-transparent border-b border-neutral-200 py-3 text-lg outline-none focus:border-blue-600 transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2 group">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 group-focus-within:text-blue-600 transition-colors ml-1">Secure Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full bg-transparent border-b border-neutral-200 py-3 text-lg outline-none focus:border-blue-600 transition-colors pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-neutral-300 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-neutral-900 text-white py-4 rounded-full font-bold shadow-xl shadow-neutral-900/20 hover:bg-blue-600 transition-all disabled:opacity-50"
              >
                {loading ? "Authenticating..." : "Sign In to Sanctuary"}
              </button>

              <div className="flex flex-col gap-4 text-center">
                <Link to="/changePassword" title="Reset your artistic credentials" className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-blue-600 transition-colors">
                  Forgotten Password?
                </Link>
                <div className="text-sm font-light text-neutral-500">
                  New to the gallery?{" "}
                  <Link to="/signUp" className="text-blue-600 font-semibold hover:underline">Create an account</Link>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
