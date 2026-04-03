// Shirley
export default function Terms() {
  return (
    <div className="max-w-7xl mx-auto p-6 pt-32 pb-24 space-y-16">
      <div className="reveal-up space-y-4 max-w-3xl">
        <h1 className="text-7xl font-display font-light">Terms of <span className="italic text-blue-600">Sanctuary</span></h1>
        <p className="text-xl text-neutral-500 font-light italic">Agreement for artistic engagement at Move n Muse.</p>
      </div>

      <div className="reveal-up grid lg:grid-cols-3 gap-16" style={{ animationDelay: "200ms" }}>
        <div className="lg:col-span-2 space-y-12">
          <section className="space-y-4">
            <h2 className="text-3xl font-display">1. The Covenant</h2>
            <p className="text-neutral-600 leading-relaxed font-light">
              By accessing Move n Muse, you enter into a community dedicated to artistic excellence. You agree to respect the physical and creative spaces provided and to interact with curators and fellow students with dignity and grace.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-display">2. Engagement & Preservation</h2>
            <p className="text-neutral-600 leading-relaxed font-light">
              Bookings for classes and studio spaces are engagements between you and the sanctuary. Once a session is preserved through payment, it is committed to our schedule. Cancellations must be made at least 24 hours in advance to maintain the harmony of our collective calendar.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-display">3. Artistic Integrity</h2>
            <p className="text-neutral-600 leading-relaxed font-light">
              All content, choreography, and teaching methods provided by our curators remain their intellectual property. Recording or reproducing these sessions without explicit consent is considered a breach of the artistic covenant.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-display">4. Sanctuary Safety</h2>
            <p className="text-neutral-600 leading-relaxed font-light">
              Physical safety is paramount. You acknowledge that artistic movement involves inherent physical risks. Move n Muse is not liable for injuries sustained during the normal pursuit of artistic discovery within our spaces.
            </p>
          </section>
        </div>

        <aside className="space-y-8 h-fit lg:sticky lg:top-32">
          <div className="bg-neutral-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-neutral-900/20 space-y-6">
            <h3 className="text-xl font-display uppercase tracking-widest text-blue-400">Quick Summary</h3>
            <ul className="space-y-4 text-sm text-neutral-400 font-light">
              <li>• Respect the space and collective</li>
              <li>• 24-hour cancellation window</li>
              <li>• Respect intellectual property</li>
              <li>• Personal liability for movement</li>
            </ul>
          </div>
          <div className="px-8 italic text-neutral-400 text-sm">
            Last updated: April 2026
          </div>
        </aside>
      </div>
    </div>
  );
}
