// Shirley, Marina
import { useState, useEffect } from "react";
import HeaderData from "../../Data/HeaderData.jsx";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { LogoutBtn, LoginButton } from "../../utils";
import { useAuth } from "../../components/auth/AuthContext.jsx";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const authStatus = useSelector((state) => state.auth.status);
  const userData = useSelector((state) => state.auth.userData);
  const userName = userData?.firstName;

  const { topHeader, userHeader } = HeaderData;
  const { user } = useAuth();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isStaff = user?.role === "staff" || user?.role === "admin";

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 px-6 py-4 ${
        scrolled ? "mt-2" : "mt-0"
      }`}
    >
      <div 
        className={`max-w-7xl mx-auto flex justify-between items-center px-8 py-3 rounded-full transition-all duration-500 ${
          scrolled 
            ? "glass shadow-2xl shadow-neutral-900/10 py-4" 
            : "bg-transparent"
        }`}
      >
        {/* App Name / Logo */}
        <div
          className="flex items-center cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <div className="text-2xl font-display font-bold tracking-tight text-neutral-900 group-hover:text-blue-600 transition-colors">
            Move <span className="italic font-light text-blue-500">n</span> Muse
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {topHeader.navItems.map((item) => (
            item.active && (
              <Link
                key={item.name}
                to={item.slug}
                className={`text-sm font-medium tracking-wide transition-all hover:text-blue-600 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-blue-600 after:transition-all hover:after:w-full ${
                  location.pathname === item.slug ? "text-blue-600 after:w-full" : "text-neutral-600"
                }`}
              >
                {item.name}
              </Link>
            )
          ))}
          
          {/* Authenticated User Links */}
          {authStatus && userHeader.navItems.map((item) => (
            item.active && (
              <Link
                key={item.name}
                to={item.slug}
                className={`text-sm font-medium tracking-wide transition-all hover:text-blue-600 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-blue-600 after:transition-all hover:after:w-full ${
                  location.pathname === item.slug ? "text-blue-600 after:w-full" : "text-neutral-600"
                }`}
              >
                {item.name}
              </Link>
            )
          ))}
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-6">
          {authStatus ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-neutral-500 hidden lg:block">
                Artistic greetings, <span className="text-neutral-900">{userName}</span>
              </span>
              <LogoutBtn />
            </div>
          ) : (
            <LoginButton />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
