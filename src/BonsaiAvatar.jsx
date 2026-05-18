import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BonsaiAvatar = ({ plantStatus = "perfect", temperature = 20, isWatering = false, size = 200 }) => {
  
  // Expressions mapping
  const getExpression = () => {
    if (isWatering) return { eyes: "happy", mouth: "D", cheeks: true };
    switch (plantStatus) {
      case "perfect": return { eyes: "happy", mouth: "smile", cheeks: true };
      case "thirsty": return { eyes: "sad", mouth: "wobbly", cheeks: false };
      case "overwatered": return { eyes: "dizzy", mouth: "squiggly", cheeks: false };
      case "resting": return { eyes: "sleep", mouth: "small", cheeks: true };
      default: return { eyes: "normal", mouth: "smile", cheeks: true };
    }
  };

  const expr = getExpression();

  // Climate effects
  const isHot = temperature > 30;
  const isCold = temperature < 10;

  // Animations
  const breatheAnimation = {
    scale: [1, 1.02, 1],
    transition: { repeat: Infinity, duration: expr.eyes === "sleep" ? 5 : 3, ease: "easeInOut" }
  };

  const shiverAnimation = isCold ? {
    x: [-2, 2, -2, 2, 0],
    transition: { repeat: Infinity, duration: 0.5 }
  } : {};

  // Face elements based on expression
  const renderEyes = () => {
    switch (expr.eyes) {
      case "happy":
        return (
          <g>
            <path d="M 75 80 Q 80 70 85 80" stroke="#1A252C" strokeWidth="4" fill="none" strokeLinecap="round"/>
            <path d="M 115 80 Q 120 70 125 80" stroke="#1A252C" strokeWidth="4" fill="none" strokeLinecap="round"/>
          </g>
        );
      case "sad":
        return (
          <g>
            <path d="M 75 75 Q 80 85 85 75" stroke="#1A252C" strokeWidth="4" fill="none" strokeLinecap="round"/>
            <path d="M 115 75 Q 120 85 125 75" stroke="#1A252C" strokeWidth="4" fill="none" strokeLinecap="round"/>
          </g>
        );
      case "dizzy":
        return (
          <g>
            <text x="70" y="85" fontSize="18" fill="#1A252C" fontWeight="bold">X</text>
            <text x="110" y="85" fontSize="18" fill="#1A252C" fontWeight="bold">X</text>
          </g>
        );
      case "sleep":
        return (
          <g>
            <line x1="75" y1="80" x2="85" y2="80" stroke="#1A252C" strokeWidth="4" strokeLinecap="round"/>
            <line x1="115" y1="80" x2="125" y2="80" stroke="#1A252C" strokeWidth="4" strokeLinecap="round"/>
          </g>
        );
      case "normal":
      default:
        return (
          <g>
            {/* Blinking eyes */}
            <motion.ellipse cx="80" cy="80" rx="5" ry="6" fill="#1A252C" 
              animate={{ scaleY: [1, 1, 0.1, 1] }} 
              transition={{ repeat: Infinity, duration: 4, times: [0, 0.9, 0.95, 1] }} 
            />
            <motion.ellipse cx="120" cy="80" rx="5" ry="6" fill="#1A252C" 
              animate={{ scaleY: [1, 1, 0.1, 1] }} 
              transition={{ repeat: Infinity, duration: 4, times: [0, 0.9, 0.95, 1] }} 
            />
          </g>
        );
    }
  };

  const renderMouth = () => {
    switch (expr.mouth) {
      case "smile":
        return <path d="M 92 90 Q 100 100 108 90" stroke="#1A252C" strokeWidth="3.5" fill="none" strokeLinecap="round"/>;
      case "wobbly":
        return <path d="M 92 95 Q 96 90 100 95 T 108 95" stroke="#1A252C" strokeWidth="3" fill="none" strokeLinecap="round"/>;
      case "squiggly":
        return <path d="M 90 95 L 95 90 L 100 95 L 105 90 L 110 95" stroke="#1A252C" strokeWidth="3" fill="none" strokeLinecap="round"/>;
      case "small":
        return <circle cx="100" cy="95" r="3" fill="#1A252C"/>;
      case "D":
        return <path d="M 92 90 Q 100 105 108 90 Z" fill="#1A252C" />;
      default:
        return <path d="M 92 90 Q 100 100 108 90" stroke="#1A252C" strokeWidth="3.5" fill="none" strokeLinecap="round"/>;
    }
  };

  return (
    <div style={{ width: size, height: size, position: 'relative', margin: '0 auto' }}>
      
      {/* Container to handle watering jump */}
      <motion.div animate={isWatering ? { y: [0, -20, 0] } : {}} transition={{ duration: 0.5 }} style={{ width: '100%', height: '100%' }}>
        <motion.svg viewBox="0 0 200 200" width="100%" height="100%" animate={shiverAnimation}>
          
          {/* Shadow */}
          <ellipse cx="100" cy="190" rx="45" ry="5" fill="rgba(0,0,0,0.15)" />

          {/* Pot */}
          <path d="M 60 170 L 140 170 L 130 190 L 70 190 Z" fill="#607D8B" />
          <path d="M 55 160 L 145 160 L 145 170 L 55 170 Z" fill="#455A64" />
          
          {/* Trunk */}
          <path d="M 95 160 Q 90 120 80 90 L 100 90 Q 105 120 105 160 Z" fill="#8D6E63" />
          <path d="M 95 130 Q 120 110 135 100 L 140 105 Q 120 120 105 140 Z" fill="#8D6E63" />
          
          {/* Canopy (Breathing) */}
          <motion.g animate={breatheAnimation} style={{ transformOrigin: '100px 100px' }}>
            {/* Back leaves */}
            <circle cx="70" cy="80" r="35" fill="#388E3C" />
            <circle cx="130" cy="80" r="35" fill="#388E3C" />
            <circle cx="100" cy="50" r="45" fill="#388E3C" />
            <circle cx="135" cy="100" r="25" fill="#388E3C" />
            
            {/* Front leaves */}
            <circle cx="85" cy="90" r="30" fill="#4CAF50" />
            <circle cx="115" cy="90" r="30" fill="#4CAF50" />
            <circle cx="100" cy="70" r="40" fill="#4CAF50" />
            
            {/* Face */}
            {renderEyes()}
            {renderMouth()}
            
            {/* Cheeks */}
            {expr.cheeks && (
              <g opacity="0.4">
                <ellipse cx="70" cy="88" rx="6" ry="4" fill="#FF5252" />
                <ellipse cx="130" cy="88" rx="6" ry="4" fill="#FF5252" />
              </g>
            )}

            {/* Sweat drop (Hot) */}
            {isHot && (
              <motion.path d="M 135 50 Q 145 65 135 75 Q 125 65 135 50 Z" fill="#81D4FA" opacity="0.8"
                animate={{ y: [0, 5, 0], opacity: [0.8, 0, 0.8] }} transition={{ repeat: Infinity, duration: 2 }} />
            )}

            {/* Zzz (Resting) */}
            {expr.eyes === "sleep" && (
              <motion.text x="130" y="40" fontSize="24" fill="#B0BEC5" fontWeight="bold"
                animate={{ y: [0, -10], opacity: [0, 1, 0], x: [0, 5] }} transition={{ repeat: Infinity, duration: 3 }}>
                Z
              </motion.text>
            )}
          </motion.g>

        </motion.svg>
      </motion.div>

      {/* Water/Happy particles */}
      <AnimatePresence>
        {isWatering && (
          <motion.div initial={{ opacity: 0, y: 0, scale: 0.5 }} animate={{ opacity: 1, y: -60, scale: 1.5 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', top: 50, left: '40%', fontSize: '30px' }}>
            ✨❤️
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BonsaiAvatar;
