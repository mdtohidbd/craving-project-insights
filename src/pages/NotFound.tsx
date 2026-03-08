import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary relative overflow-hidden">
      {/* Heavy atmospheric glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none" 
           style={{ background: "radial-gradient(circle, hsl(43 60% 50% / 0.04), transparent 70%)" }} />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(40 20% 96%) 1px, transparent 1px), linear-gradient(90deg, hsl(40 20% 96%) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="relative inline-block mb-12">
          {/* Oversized ghost text */}
          <h1 className="text-[12rem] md:text-[20rem] font-serif font-bold text-primary-foreground/5 leading-none select-none"
              style={{ letterSpacing: "-0.05em" }}>
            404
          </h1>
          
          {/* Foreground content overlapping the numbers */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary-foreground mb-6"
                style={{ letterSpacing: "-0.03em" }}>
              Lost <span className="italic" style={{ color: "hsl(43 74% 48%)" }}>Appetite</span>
            </h2>
          </div>
        </div>

        <p className="text-primary-foreground/40 text-[18px] max-w-md mx-auto mb-16 leading-[1.8]">
          The page you are looking for seems to have been removed from our menu. 
          Let's guide you back to our delectable offerings.
        </p>

        <Link
          to="/"
          className="btn-gold inline-flex items-center gap-4 px-10 py-4 group"
        >
          <ArrowLeft className="w-5 h-5 transition-transform duration-500 group-hover:-translate-x-1" />
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
