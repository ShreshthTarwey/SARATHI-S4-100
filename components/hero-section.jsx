"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HeroSection() {
  const [currentWord, setCurrentWord] = useState(0);
  const words = ["Breaking", "barriers,", "building", "connections."];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full animate-float"
          style={{ animationDelay: "0s" }}
        ></div>
        <div
          className="absolute top-3/4 right-1/4 w-24 h-24 bg-secondary/10 rounded-full animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-3/4 w-20 h-20 bg-accent/10 rounded-full animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="mb-8">
          <h1 className="font-heading text-5xl md:text-7xl font-bold text-foreground mb-4">
            {words.map((word, index) => (
              <span
                key={word}
                className={`inline-block mr-4 transition-all duration-500 ${
                  index <= currentWord
                    ? "opacity-100 transform translate-y-0"
                    : "opacity-0 transform translate-y-8"
                }`}
                style={{
                  transitionDelay: `${index * 200}ms`,
                  color:
                    index === 0
                      ? "var(--color-primary)"
                      : index === 1
                      ? "var(--color-secondary)"
                      : index === 2
                      ? "var(--color-accent)"
                      : "var(--color-foreground)",
                }}
              >
                {word}
              </span>
            ))}
          </h1>
          <p className="font-body text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Technology as a companion - bridging communication and learning gaps
            for people with disabilities through accessible, voice-enabled, and
            playful experiences.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link href="/communication">
            <Button
              size="lg"
              className="font-heading text-lg px-8 py-4 bg-primary hover:bg-primary/90 transform hover:scale-105 transition-all duration-200 hover:shadow-lg"
            >
              <span className="mr-2">🗣️</span>
              Start Communication
            </Button>
          </Link>
          <Link href="/education">
            <Button
              size="lg"
              variant="outline"
              className="font-heading text-lg px-8 py-4 border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground transform hover:scale-105 transition-all duration-200 hover:shadow-lg bg-transparent"
            >
              <span className="mr-2">🎮</span>
              Start Learning
            </Button>
          </Link>
        </div>

        <div className="relative">
          <div
            className="absolute -top-20 left-1/4 animate-float"
            style={{ animationDelay: "0s" }}
          >
            <div className="bg-primary/20 rounded-full p-3">
              <span className="text-2xl">💬</span>
            </div>
          </div>
          <div
            className="absolute -top-16 right-1/3 animate-float"
            style={{ animationDelay: "1s" }}
          >
            <div className="bg-accent/20 rounded-full p-3">
              <span className="text-2xl">🤝</span>
            </div>
          </div>
          <div
            className="absolute -top-12 left-1/3 animate-float"
            style={{ animationDelay: "2s" }}
          >
            <div className="bg-secondary/20 rounded-full p-3">
              <span className="text-2xl">✨</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
