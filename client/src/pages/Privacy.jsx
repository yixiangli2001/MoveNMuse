// Shirley
export default function Privacy() {
  return (
    <div className="max-w-7xl mx-auto p-6 pt-32 pb-24 space-y-16">
      <div className="reveal-up space-y-4 max-w-3xl">
        <h1 className="text-7xl font-display font-light">Digital <span className="italic text-blue-600">Preservation</span></h1>
        <p className="text-xl text-neutral-500 font-light italic">How we protect your artistic identity and personal data.</p>
      </div>

      <div className="reveal-up grid lg:grid-cols-3 gap-16" style={{ animationDelay: "200ms" }}>
        <div className="lg:col-span-2 space-y-12">
          <section className="space-y-4">
            <h2 className="text-3xl font-display">Data Collection</h2>
            <p className="text-neutral-600 leading-relaxed font-light">
              We collect only the essential credentials required to preserve your artistic journey: your name, contact details, and booking history. This information is used solely to facilitate your engagements within the sanctuary.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-display">Secure Vaults</h2>
            <p className="text-neutral-600 leading-relaxed font-light">
              Your financial data is never stored directly within our sanctuary. We use industry-standard encryption and trusted third-party providers to secure your transaction methods and history.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-display">Artistic Privacy</h2>
            <p className="text-neutral-600 leading-relaxed font-light">
              We respect the privacy of your practice. Your booking history and personal gallery are visible only to you and the essential curators of the classes you attend.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-display">Your Rights</h2>
            <p className="text-neutral-600 leading-relaxed font-light">
              You maintain full authority over your digital presence. You may request the export or dissolution of your account and personal data at any time.
            </p>
          </section>
        </div>

        <aside className="space-y-8 h-fit lg:sticky lg:top-32">
          <div className="bg-blue-50 rounded-[2.5rem] p-10 border border-blue-100 space-y-6">
            <h3 className="text-xl font-display uppercase tracking-widest text-blue-600">Our Promise</h3>
            <p className="text-sm text-blue-800 font-light leading-relaxed">
              Move n Muse will never trade or sell your artistic identity. Your data serves only your creative evolution.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
