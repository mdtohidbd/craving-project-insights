import { useEffect, useRef } from "react";
import gsap from "gsap";

export const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hide default cursor and add custom one
    document.body.style.cursor = "none";

    const cursor = cursorRef.current;
    const follower = followerRef.current;

    // Movement using GSAP quickSetter for massive performance boost
    const setToX = gsap.quickSetter(cursor, "x", "px");
    const setToY = gsap.quickSetter(cursor, "y", "px");
    const setFollowerX = gsap.quickSetter(follower, "x", "px");
    const setFollowerY = gsap.quickSetter(follower, "y", "px");

    let mouseX = 0, mouseY = 0;
    
    gsap.set([cursor, follower], { xPercent: -50, yPercent: -50 });

    const mouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Immediate update for dot
      setToX(mouseX);
      setToY(mouseY);
    };

    window.addEventListener("mousemove", mouseMove);

    // Smooth follower calculation
    const updateFollower = () => {
      const dt = 1.0 - Math.pow(1.0 - 0.15, gsap.ticker.deltaRatio());
      
      const currentX = parseFloat(gsap.getProperty(follower, "x") as string) || mouseX;
      const currentY = parseFloat(gsap.getProperty(follower, "y") as string) || mouseY;

      const newX = currentX + (mouseX - currentX) * dt;
      const newY = currentY + (mouseY - currentY) * dt;
      
      setFollowerX(newX);
      setFollowerY(newY);
    };

    gsap.ticker.add(updateFollower);

    // Hover effects on links/buttons
    const hoverables = document.querySelectorAll("a, button, [role='button'], .hoverable");
    
    hoverables.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        gsap.to(follower, {
          scale: 2.5,
          backgroundColor: "transparent",
          border: "1px solid hsl(43, 74%, 48%)",
          duration: 0.3,
          ease: "power2.out"
        });
        gsap.to(cursor, { opacity: 0, duration: 0.3 });
      });
      
      el.addEventListener("mouseleave", () => {
        gsap.to(follower, {
          scale: 1,
          backgroundColor: "hsl(43, 74%, 48%)",
          border: "0px solid transparent",
          duration: 0.3,
          ease: "power2.out"
        });
        gsap.to(cursor, { opacity: 1, duration: 0.3 });
      });
    });

    return () => {
      window.removeEventListener("mousemove", mouseMove);
      gsap.ticker.remove(updateFollower);
      document.body.style.cursor = "auto";
    };
  }, []);

  return (
    <>
      {/* Dot */}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed top-0 left-0 w-2 h-2 rounded-full bg-[hsl(43,74%,48%)] z-[9999] mix-blend-difference"
      />
      {/* Follower */}
      <div
        ref={followerRef}
        className="pointer-events-none fixed top-0 left-0 w-8 h-8 rounded-full bg-[hsl(43,74%,48%)] opacity-30 z-[9998] mix-blend-difference"
      />
    </>
  );
};
