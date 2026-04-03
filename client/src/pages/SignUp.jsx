// Marina
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/authService";

const SignUp = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNo: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.phoneNo) {
      return setError("All artistic fields are required.");
    }

    if (form.phoneNo.length !== 10) {
      return setError("Phone number must be exactly 10 digits.");
    }

    setLoading(true);
    try {
      await registerUser(form);
      alert("Account created! Welcome to the sanctuary.");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 pt-32 pb-24 flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-2xl space-y-12 reveal-up">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-display font-light">Join the <span className="italic text-blue-600">Collection</span></h1>
          <p className="text-xl text-neutral-500 font-light">Create your account to begin curating your artistic journey.</p>
        </div>

        <div className="glass rounded-[3rem] p-12 shadow-2xl shadow-neutral-900/5 space-y-10">
          {error && (
            <div className="text-xs font-bold uppercase tracking-tight text-red-500 text-center animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="space-y-2 group">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 group-focus-within:text-blue-600 transition-colors ml-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  className="w-full bg-transparent border-b border-neutral-200 py-3 text-lg outline-none focus:border-blue-600 transition-colors"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2 group">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 group-focus-within:text-blue-600 transition-colors ml-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  className="w-full bg-transparent border-b border-neutral-200 py-3 text-lg outline-none focus:border-blue-600 transition-colors"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2 group md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 group-focus-within:text-blue-600 transition-colors ml-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="w-full bg-transparent border-b border-neutral-200 py-3 text-lg outline-none focus:border-blue-600 transition-colors"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2 group">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 group-focus-within:text-blue-600 transition-colors ml-1">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNo"
                  placeholder="10 digits"
                  className="w-full bg-transparent border-b border-neutral-200 py-3 text-lg outline-none focus:border-blue-600 transition-colors"
                  value={form.phoneNo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2 group">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 group-focus-within:text-blue-600 transition-colors ml-1">Secure Password</label>
                <input
                  type="password"
                  name="password"
                  className="w-full bg-transparent border-b border-neutral-200 py-3 text-lg outline-none focus:border-blue-600 transition-colors"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-8 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-neutral-900 text-white py-5 rounded-full font-bold shadow-xl shadow-neutral-900/20 hover:bg-blue-600 transition-all disabled:opacity-50"
              >
                {loading ? "Registering..." : "Create My Sanctuary Account"}
              </button>

              <div className="text-center text-sm font-light text-neutral-500">
                Already part of the muse?{" "}
                <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in instead</Link>
              </div>
            </div>
          </form>
        </div>
        
        {/* Artistic Note */}
        <p className="text-center text-[10px] font-bold uppercase tracking-widest text-neutral-300 max-w-sm mx-auto leading-relaxed">
          By registering, you agree to join our community of creators and students in the pursuit of artistic excellence.
        </p>
      </div>
    </div>
  );
};

export default SignUp;
