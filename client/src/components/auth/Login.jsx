// Marina
import { useState } from "react";
import { useDispatch } from "react-redux";
import { login as setUser } from "../../store/authSlice"; 
import { useNavigate, useLocation } from "react-router-dom"; 
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

      // dispatch(login(data.user));
      // setLoading(false);
      // alert("Logged in successfully!");
      // navigate("/");
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
      // setLoading(false);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold mb-6 text-center">Sign In</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-600 text-center">{error}</p>}

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded-md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="showPassword"
              checked={showPassword}
              onChange={() => setShowPassword((prev) => !prev)}
              className="mr-2"
            />
            <label htmlFor="showPassword" className="text-sm text-gray-700">
              Show Password
            </label>
          </div>
          <br></br>
          <label className="text-sm text-gray-700">
            Forgot password? {" "}
            <span
              onClick={() => navigate("/changePassword")}
              className="text-blue-600 cursor-pointer hover:underline"
            >
              Reset
            </span>
          </label>
          <br></br>
          <label className="text-sm text-gray-700">
            Don&apos;t have an account yet? Sign up {" "}
            <span
              onClick={() => navigate("/signUp")}
              className="text-blue-600 cursor-pointer hover:underline"
            >
              here.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

// export default Login;
