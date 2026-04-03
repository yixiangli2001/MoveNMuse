// Shirley
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-white pt-24 pb-12 overflow-hidden relative">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -z-0 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-8">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-8">
            <div className="text-3xl font-display font-bold tracking-tight">
              Move <span className="italic font-light text-blue-400">n</span> Muse
            </div>
            <p className="text-neutral-400 font-light text-lg max-w-sm leading-relaxed">
              A sanctuary for the arts. Discovery through movement, sound, and the pursuit of artistic excellence.
            </p>
            <div className="flex gap-6">
              {['Instagram', 'Vimeo', 'Pinterest'].map((social) => (
                <a 
                  key={social} 
                  href="#" 
                  className="text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-blue-400 transition-colors"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">Discoveries</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/courses" className="text-neutral-300 hover:text-white transition-colors font-light">Class Library</Link>
              </li>
              <li>
                <Link to="/rooms" className="text-neutral-300 hover:text-white transition-colors font-light">Artistic Spaces</Link>
              </li>
              <li>
                <Link to="/instructors" className="text-neutral-300 hover:text-white transition-colors font-light">The Curators</Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">Sanctuary</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/account" className="text-neutral-300 hover:text-white transition-colors font-light">Personal Gallery</Link>
              </li>
              <li>
                <Link to="/cart" className="text-neutral-300 hover:text-white transition-colors font-light">Current Selections</Link>
              </li>
              <li>
                <Link to="/managePaymentMethods" className="text-neutral-300 hover:text-white transition-colors font-light">Financial Vault</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-600">
            &copy; {currentYear} Move n Muse Sanctuary. All rights preserved.
          </p>
          <div className="flex gap-8">
            <Link to="/privacy" className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
