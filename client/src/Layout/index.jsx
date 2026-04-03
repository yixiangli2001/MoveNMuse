// Shirley, Marina
import { Outlet, useLocation } from "react-router-dom";
import { Header, Footer } from "../components";
import ScrollToTop from "../components/ScrollToTop";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { login } from "../store/authSlice";
import { jwtDecode } from "jwt-decode";

const Layout = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (token && token.split(".").length === 3) {
      try {
        const decoded = jwtDecode(token);
        dispatch(
          login({
            userId: decoded.userId, 
            email: decoded.email,
            firstName: decoded.firstName || decoded.name,
            lastName: decoded.lastName || "",
            role: decoded.role || "customer",
          })
        );
      } catch (err) {
        console.error("Token decoding failed:", err);
      }
    }
  }, [dispatch]);

  return (
    <>
      <ScrollToTop />
      <Header />

      <main className="min-h-screen">
        <div key={location.pathname}>
          <Outlet />
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Layout;
