// marina
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

function LogoutBtn() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = () => {
  // Clear any stored auth data
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");

    // Update Redux state
    dispatch(logout());

    // Redirect to home page
    navigate("/");
  };

  return (
    <button
      onClick={logoutHandler}
      className="px-6 py-2 border border-neutral-200 text-neutral-600 text-sm font-medium rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all duration-300"
    >
      Sign Out
    </button>
  );
}

export default LogoutBtn;
