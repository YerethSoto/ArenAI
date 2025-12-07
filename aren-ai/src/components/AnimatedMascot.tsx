import React, { useState, useEffect, useRef } from "react";

interface AnimatedMascotProps {
  openSrc: string;
  closedSrc: string;
  winkSrc: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const AnimatedMascot: React.FC<AnimatedMascotProps> = ({
  openSrc,
  closedSrc,
  winkSrc,
  className,
  style,
  onClick,
}) => {
  const [eyeState, setEyeState] = useState<"open" | "closed" | "winking">(
    "open"
  );
  const isWinkingRef = useRef(false);

  // Blinking Logic
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (isWinkingRef.current) return;

      setEyeState("closed");

      // Open eyes after 200ms
      setTimeout(() => {
        if (!isWinkingRef.current) {
          setEyeState("open");
        }
      }, 200);
    }, 4000 + Math.random() * 2000); // Randomize slightly: 4-6s

    return () => clearInterval(blinkInterval);
  }, []);

  const handleInteraction = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();

    isWinkingRef.current = true;
    setEyeState("winking");

    // Reset after 2 seconds
    setTimeout(() => {
      isWinkingRef.current = false;
      setEyeState("open");
    }, 2000);

    if (onClick) onClick();
  };

  // Helper to get display style for each image
  const getDisplay = (state: "open" | "closed" | "winking") => {
    return eyeState === state ? "block" : "none";
  };

  return (
    <div
      className={className}
      style={{
        position: "relative",
        cursor: "pointer",
        ...style,
        // Ensure container has dimensions if images are absolute
        display: "inline-block",
      }}
      onMouseEnter={(e) => handleInteraction(e)}
      onClick={(e) => handleInteraction(e)}
      onTouchStart={(e) => handleInteraction(e)}
    >
      {/* Render all images stacked, toggle display */}
      <img
        src={openSrc}
        alt="Mascot Open"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          position: "absolute",
          top: 0,
          left: 0,
          display: getDisplay("open"),
        }}
      />
      <img
        src={closedSrc}
        alt="Mascot Closed"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          position: "absolute",
          top: 0,
          left: 0,
          display: getDisplay("closed"),
        }}
      />
      <img
        src={winkSrc}
        alt="Mascot Wink"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          position: "absolute",
          top: 0,
          left: 0,
          display: getDisplay("winking"),
        }}
      />
      {/* Invisible spacer to maintain aspect ratio if needed, or rely on container size */}
      <img
        src={openSrc}
        style={{
          visibility: "hidden",
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
        alt=""
      />
    </div>
  );
};

export default AnimatedMascot;
