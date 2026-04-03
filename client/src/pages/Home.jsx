// Shirley, Marina
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Home = () => {
  const navigate = useNavigate();

  // Get user data from Redux store
  const user = useSelector((state) => state.auth.userData);

  const sections = [
    {
      title: "Dance & Movement",
      subtitle: "The language of the soul",
      description: "Discover courses that challenge your limits and express your inner muse through rhythm and grace.",
      buttonText: "Browse Courses",
      route: "/courses",
      image: "/danceClass.jpg",
      align: "left",
    },
    {
      title: "Artistic Spaces",
      subtitle: "Your canvas for creation",
      description: "Premium studio rooms designed for practice, teaching, and the pursuit of artistic excellence.",
      buttonText: "Explore Rooms",
      route: "/rooms",
      image: "/room.jpg",
      align: "right",
    },
  ];

  return (
    <div className="bg-[#fdfdfd] min-h-screen overflow-x-hidden pt-32">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 mb-32 relative">
        <div className="max-w-3xl reveal-up">
          <h1 className="text-[clamp(3rem,8vw,6rem)] font-display font-light leading-[0.9] mb-8">
            Discovery through <span className="italic font-normal text-blue-600">movement</span> and sound.
          </h1>
          <p className="text-xl text-neutral-500 max-w-xl font-light leading-relaxed">
            Move n Muse is a sanctuary for the arts. Whether you're here to learn a new rhythm or hire a space to create your own, we provide the canvas for your journey.
          </p>
        </div>
        
        {/* Decorative Fluid Shape */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl -z-10" />
      </section>

      {/* Feature Grid: Asymmetric Layout */}
      <section className="max-w-7xl mx-auto px-6 space-y-48">
        {sections.map((section, index) => (
          <div
            key={index}
            className={`flex flex-col md:flex-row items-center gap-16 ${
              section.align === "right" ? "md:flex-row-reverse" : ""
            }`}
          >
            {/* Image Container with Dynamic Edge */}
            <div className="flex-1 w-full reveal-up" style={{ animationDelay: "200ms" }}>
              <div className="relative group">
                <div className="aspect-[4/5] overflow-hidden rounded-[2rem] md:rounded-[4rem] shadow-2xl shadow-neutral-900/10">
                  <img 
                    src={section.image} 
                    alt={section.title} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  />
                </div>
                {/* Floating Decorative Element */}
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-amber-100 rounded-full mix-blend-multiply blur-xl opacity-70 animate-pulse" />
              </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 space-y-8 reveal-up" style={{ animationDelay: "400ms" }}>
              <div className="space-y-2">
                <span className="text-sm font-semibold tracking-[0.2em] uppercase text-blue-600">
                  {section.subtitle}
                </span>
                <h2 className="text-5xl font-display font-medium text-neutral-900">
                  {section.title}
                </h2>
              </div>
              
              <p className="text-lg text-neutral-500 font-light leading-relaxed max-w-md">
                {section.description}
              </p>
              
              <button
                onClick={() => navigate(section.route)}
                className="group flex items-center gap-4 text-lg font-medium text-neutral-900 hover:text-blue-600 transition-colors"
              >
                <span className="relative pb-1 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-neutral-900 after:transition-all group-hover:after:bg-blue-600">
                  {section.buttonText}
                </span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="transition-transform group-hover:translate-x-2">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Quote / Inspiration Section */}
      <section className="mt-48 py-32 bg-neutral-900 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 relative z-10 reveal-up">
          <span className="text-blue-400 font-display italic text-2xl mb-6 block">Our philosophy</span>
          <h3 className="text-4xl md:text-6xl font-display font-light leading-tight">
            "Art is not what you see, but what you make others see."
          </h3>
          <p className="mt-8 text-neutral-400 uppercase tracking-widest text-sm">— Edgar Degas</p>
        </div>
        
        {/* Background Texture/Noise could go here */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
      </section>
    </div>
  );
};

export default Home;
