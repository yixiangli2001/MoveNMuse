// Marina
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
const SignUp = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNo: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const { firstName, lastName, email, phoneNo, password } = form;

    if (!firstName || !lastName || !email || !phoneNo || !password) {
      return setError("All fields are required.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return setError("Please enter a valid email address.");
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNo)) {
      return setError("Phone number must be exactly 10 digits.");
    }

    setLoading(true);
    try {
      await registerUser(form);
      alert("Account created! You can now log in.");
      navigate("/login");
    } catch (err) {
      // err.message might not contain backend message, try err.response.data.message or err.message fallback
      const serverMessage =
        err.message || "Failed to create account.";
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
    };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold mb-6 text-center">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-600 text-center">{error}</p>}

          <input
            name="firstName"
            type="text"
            placeholder="First Name"
            className="w-full p-3 border border-gray-300 rounded-md"
            onChange={handleChange}
            required
          />
          <input
            name="lastName"
            type="text"
            placeholder="Last Name"
            className="w-full p-3 border border-gray-300 rounded-md"
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-md"
            onChange={handleChange}
            required
          />
          <input
            name="phoneNo"
            type="text"
            placeholder="Phone Number"
            className="w-full p-3 border border-gray-300 rounded-md"
            onChange={handleChange}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded-md"
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 transition"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
