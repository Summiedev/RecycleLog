import { Trash2, Recycle, Leaf } from "lucide-react";
import { useState, useEffect } from "react";

const BinPulseLoader = ({
  size = "default",
  variant = "pulse",
  showText = true,
  text = "Loading Smart Bins...",
  className = "",
  color = "primary",
}) => {
  const [currentIcon, setCurrentIcon] = useState(0);
  const icons = [Trash2, Recycle, Leaf];

  // Size configurations
  const sizeConfig = {
    small: {
      container: "w-12 h-12",
      outerRing: "w-16 h-16",
      middleRing: "w-14 h-14",
      innerContainer: "w-12 h-12",
      iconSize: 16,
      textSize: "text-sm",
      dotSize: "w-1 h-1",
    },
    default: {
      container: "w-16 h-16",
      outerRing: "w-24 h-24",
      middleRing: "w-20 h-20",
      innerContainer: "w-16 h-16",
      iconSize: 24,
      textSize: "text-lg",
      dotSize: "w-2 h-2",
    },
    large: {
      container: "w-24 h-24",
      outerRing: "w-32 h-32",
      middleRing: "w-28 h-28",
      innerContainer: "w-24 h-24",
      iconSize: 32,
      textSize: "text-xl",
      dotSize: "w-3 h-3",
    },
  };

  // Color configurations
  const colorConfig = {
    primary: {
      gradient: "from-primary via-secondary to-forest",
      ring1: "bg-primary/20",
      ring2: "bg-secondary/30",
      glow: "bg-primary/40",
      text: "text-forest",
      dots: "bg-primary",
    },
    green: {
      gradient: "from-green-500 via-emerald-500 to-teal-600",
      ring1: "bg-green-500/20",
      ring2: "bg-emerald-500/30",
      glow: "bg-green-500/40",
      text: "text-green-800",
      dots: "bg-green-500",
    },
    blue: {
      gradient: "from-blue-500 via-cyan-500 to-indigo-600",
      ring1: "bg-blue-500/20",
      ring2: "bg-cyan-500/30",
      glow: "bg-blue-500/40",
      text: "text-blue-800",
      dots: "bg-blue-500",
    },
  };

  const config = sizeConfig[size];
  const colors = colorConfig[color];

  // Icon rotation effect
  useEffect(() => {
    if (variant === "rotating") {
      const interval = setInterval(() => {
        setCurrentIcon((prev) => (prev + 1) % icons.length);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [variant, icons.length]);

  // Render based on variant
  const renderLoader = () => {
    switch (variant) {
      case "pulse":
        return <PulseLoader config={config} colors={colors} />;
      case "spin":
        return <SpinLoader config={config} colors={colors} />;
      case "bounce":
        return <BounceLoader config={config} colors={colors} />;
      case "rotating":
        return (
          <RotatingLoader
            config={config}
            colors={colors}
            currentIcon={currentIcon}
            icons={icons}
          />
        );
      case "wave":
        return <WaveLoader config={config} colors={colors} />;
      default:
        return <PulseLoader config={config} colors={colors} />;
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center space-y-4 ${className}`}
    >
      {renderLoader()}

      {showText && (
        <div className="text-center">
          <p
            className={`${colors.text} font-semibold ${config.textSize} animate-pulse`}
          >
            {text}
          </p>
          <div className="flex space-x-1 justify-center mt-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${config.dotSize} ${colors.dots} rounded-full animate-bounce`}
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Pulse variant (enhanced version of original)
const PulseLoader = ({ config, colors }) => (
  <div className="relative flex items-center justify-center">
    <div
      className={`absolute ${config.outerRing} ${colors.ring1} rounded-full animate-ping`}
    ></div>
    <div
      className={`absolute ${config.middleRing} ${colors.ring2} rounded-full animate-ping`}
      style={{ animationDelay: "0.3s" }}
    ></div>
    <div
      className={`relative ${config.innerContainer} bg-gradient-to-br ${colors.gradient} rounded-full flex items-center justify-center animate-pulse shadow-2xl border-2 border-white/20`}
    >
      <Trash2
        size={config.iconSize}
        className="text-white drop-shadow-lg animate-pulse"
        strokeWidth={2.5}
      />
    </div>
    <div
      className={`absolute ${config.innerContainer} ${colors.glow} rounded-full blur-lg`}
    ></div>
  </div>
);

// Spinning loader
const SpinLoader = ({ config, colors }) => (
  <div className="relative flex items-center justify-center">
    <div
      className={`${config.outerRing} border-4 border-transparent border-t-primary border-r-secondary rounded-full animate-spin`}
    ></div>
    <div
      className={`absolute ${config.innerContainer} bg-gradient-to-br ${colors.gradient} rounded-full flex items-center justify-center shadow-2xl`}
    >
      <Trash2
        size={config.iconSize}
        className="text-white drop-shadow-lg"
        strokeWidth={2.5}
      />
    </div>
  </div>
);

// Bouncing loader
const BounceLoader = ({ config, colors }) => (
  <div className="relative flex items-center justify-center">
    <div
      className={`${config.innerContainer} bg-gradient-to-br ${colors.gradient} rounded-full flex items-center justify-center animate-bounce shadow-2xl transform-gpu`}
    >
      <Trash2
        size={config.iconSize}
        className="text-white drop-shadow-lg animate-pulse"
        strokeWidth={2.5}
      />
    </div>
    <div
      className={`absolute w-24 h-4 bg-black/10 rounded-full blur-sm animate-pulse`}
      style={{ top: "100%" }}
    ></div>
  </div>
);

// Rotating icons loader
const RotatingLoader = ({ config, colors, currentIcon, icons }) => {
  const CurrentIcon = icons[currentIcon];

  return (
    <div className="relative flex items-center justify-center">
      <div
        className={`absolute ${config.outerRing} ${colors.ring1} rounded-full animate-ping`}
      ></div>
      <div
        className={`${config.innerContainer} bg-gradient-to-br ${colors.gradient} rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 transform hover:scale-110`}
      >
        <CurrentIcon
          size={config.iconSize}
          className="text-white drop-shadow-lg transition-all duration-500 transform"
          strokeWidth={2.5}
        />
      </div>
    </div>
  );
};

// Wave effect loader
const WaveLoader = ({ config, colors }) => (
  <div className="relative flex items-center justify-center">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className={`absolute ${config.outerRing} ${colors.ring1} rounded-full animate-ping`}
        style={{ animationDelay: `${i * 0.5}s`, animationDuration: "2s" }}
      />
    ))}
    <div
      className={`relative ${config.innerContainer} bg-gradient-to-br ${colors.gradient} rounded-full flex items-center justify-center shadow-2xl`}
    >
      <Trash2
        size={config.iconSize}
        className="text-white drop-shadow-lg"
        strokeWidth={2.5}
      />
    </div>
  </div>
);

export default BinPulseLoader;
