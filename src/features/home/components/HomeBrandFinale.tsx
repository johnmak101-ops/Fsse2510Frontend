/**
 * @file brand statement conclusion
 * @module features/home/components/HomeBrandFinale
 * 
 * renders a high-minimalism typography block that serves as the visual conclusion to the brand narrative.
 * emphasizes texture and philosophy through unified Serif Italic styles and high letter-spacing.
 */

/** emotional brand finale block. */
export default function HomeBrandFinale() {
  return (
    <section className="bg-white py-32 md:py-48 text-center relative overflow-hidden">
      <div className="container mx-auto max-w-4xl px-6 relative z-10">

        {/* Slogan: Unified Serif Italic, size up to 6xl (60px) */}
        <h2 className="font-serif text-[clamp(2.5rem,8vw,4rem)] italic text-brand-text tracking-tight mb-12 leading-tight">
          &quot;Grown-up Dessert&quot;
        </h2>

        {/* Content: Unified Sans Light, centered, with relaxed line height */}
        <div className="space-y-8 text-brand-text/70 max-w-2xl mx-auto font-sans font-light">
          <p className="text-base md:text-xl leading-relaxed tracking-wide">
            Gelato Pique is dedicated to the philosophy of <span className="font-medium text-brand-text">&quot;fashionable roomwear.&quot;</span>
          </p>
          <p className="text-[13px] md:text-base leading-loose italic opacity-80 tracking-wide">
            By crafting our pieces with our signature fluffy textures, we offer a unique sense of comfort that indulges your senses and elevates your everyday moments.
          </p>
        </div>

        {/* Footer Info: Very small 10px text, 50% letter spacing */}
        <div className="mt-20 flex flex-col items-center">
          <div className="h-[1px] bg-brand-text/10 mb-8 w-24" />
          <p className="font-sans text-[10px] md:text-[11px] font-bold uppercase tracking-[0.5em] text-brand-text/30 leading-none">
            Gelato Pique Official Online Store
          </p>
        </div>
      </div>
    </section>
  );
}
