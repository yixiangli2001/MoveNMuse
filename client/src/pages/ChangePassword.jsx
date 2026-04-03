// Marina
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../services/authService";

const ChangePassword = () => {
  const [form, setForm] = useState({ email: "", newPassword: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const { email, newPassword } = form;

    if (!email || !newPassword) {
        return setError("Email and new password are required.");
    }

    setLoading(true);
    try {
        await changePassword(form);
        setMessage("Password updated successfully! Redirecting to login...");
        setForm({ email: "", newPassword: "" });

        // Wait a moment before redirecting
        setTimeout(() => {
        navigate("/login");
        }, 2000); // 2 second delay
    } catch (err) {
        setError(err.message || "Something went wrong. Try again.");
    } finally {
        setLoading(false);
    }
    };


  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Change Password</h2>

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}
        {message && <p className="text-green-600 text-center mb-4">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-md"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            name="newPassword"
            type="password"
            placeholder="New Password"
            className="w-full p-3 border border-gray-300 rounded-md"
            value={form.newPassword}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition"
          >
            {loading ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
