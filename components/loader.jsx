"use client";

import { useState, useEffect } from "react";
import { Sparkles, Heart, Star, Zap } from "lucide-react";

export default function Loader({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [sparkles, setSparkles] = useState([]);

  const phases = [
    "Preparing your magical journey...",
    "Loading learning adventures...",
    "Setting up communication tools...",
    "Almost ready to explore!",
  ];

  useEffect(() => {
    const newSparkles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }));
    setSparkles(newSparkles);

    const phaseTimer = setInterval(() => {
      setCurrentPhase((prev) => (prev + 1) % phases.length);
    }, 800);

    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 3500);

    return () => {
      clearInterval(phaseTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-sky-blue/20 via-mint-green/20 to-coral-pink/20 z-50 flex items-center justify-center overflow-hidden">
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute animate-sparkle-dance"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            animationDelay: `${sparkle.delay}s`,
          }}
        >
          <Sparkles className="w-6 h-6 text-sunny-yellow opacity-60" />
        </div>
      ))}

      <div className="absolute top-20 left-20 animate-float">
        <Heart className="w-12 h-12 text-coral-pink opacity-40" />
      </div>
      <div className="absolute top-32 right-24 animate-bounce-gentle">
        <Star className="w-10 h-10 text-soft-lavender opacity-50" />
      </div>
      <div className="absolute bottom-24 left-32 animate-wiggle">
        <Zap className="w-8 h-8 text-sunny-yellow opacity-45" />
      </div>

      <div className="text-center relative z-10">
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto relative">
            {/* Outer pulsing ring */}
            <div className="absolute inset-0 bg-gradient-to-r from-sky-blue via-mint-green to-coral-pink rounded-full animate-ping opacity-20"></div>
            {/* Middle ring */}
            <div className="absolute inset-2 bg-gradient-to-r from-coral-pink via-soft-lavender to-sky-blue rounded-full animate-pulse opacity-30"></div>
            {/* Inner content */}
            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-lg">
              <div className="text-4xl font-heading font-bold bg-gradient-to-r from-sky-blue via-mint-green to-coral-pink bg-clip-text text-transparent animate-rainbow-glow">
                S
              </div>
            </div>
          </div>

          <div
            className="absolute inset-0 animate-spin"
            style={{ animationDuration: "4s" }}
          >
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
              <div className="w-4 h-4 bg-sunny-yellow rounded-full animate-bounce-gentle"></div>
            </div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2">
              <div
                className="w-3 h-3 bg-mint-green rounded-full animate-bounce-gentle"
                style={{ animationDelay: "0.5s" }}
              ></div>
            </div>
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2">
              <div
                className="w-3 h-3 bg-coral-pink rounded-full animate-bounce-gentle"
                style={{ animationDelay: "1s" }}
              ></div>
            </div>
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2">
              <div
                className="w-4 h-4 bg-soft-lavender rounded-full animate-bounce-gentle"
                style={{ animationDelay: "1.5s" }}
              ></div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="font-heading text-5xl font-bold bg-gradient-to-r from-sky-blue via-mint-green to-coral-pink bg-clip-text text-transparent animate-rainbow-glow">
            SARATHI
          </h1>
          <p className="font-body text-xl text-gray-600 animate-fade-in-up">
            Your Learning Companion
          </p>

          <div className="mt-8">
            <p className="font-body text-lg text-gray-500 animate-pulse min-h-[1.5rem]">
              {phases[currentPhase]}
            </p>

            <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto mt-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-blue via-mint-green to-coral-pink rounded-full animate-pulse"
                style={{
                  width: `${((currentPhase + 1) / phases.length) * 100}%`,
                  transition: "width 0.8s ease-in-out",
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
