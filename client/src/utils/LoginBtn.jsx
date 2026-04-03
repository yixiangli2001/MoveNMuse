// Marina
import { useNavigate } from "react-router-dom";

const LoginButton = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <button
      onClick={handleLoginClick}
      className="px-8 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-full shadow-lg shadow-neutral-900/10 hover:bg-blue-600 hover:shadow-blue-600/20 transition-all duration-300"
    >
      Sign In
    </button>
  );
};

export default LoginButton;
