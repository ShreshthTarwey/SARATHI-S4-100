"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GameCard from "./game-card";
import ProgressIndicator from "./progress-indicator";

export default function EducationDashboard() {
  const [selectedGame, setSelectedGame] = useState(null);
  const [hasSpoken, setHasSpoken] = useState(false);

  const games = [
    {
      id: "shapes-colors",
      title: "Shapes & Colors",
      description:
        "Discover magical shapes and rainbow colors through fun adventures!",
      icon: "🎨",
      difficulty: 1,
      color: "coral-pink",
      bgColor: "bg-gradient-playful-pink",
      hoverColor:
        "hover:bg-gradient-to-r hover:from-coral-pink hover:to-sunny-yellow",
      iconBg: "bg-coral-pink/20",
      completed: 8,
      total: 10,
    },
    {
      id: "counting",
      title: "Number Friends",
      description:
        "Meet friendly numbers and learn to count with exciting games!",
      icon: "🔢",
      difficulty: 2,
      color: "mint-green",
      bgColor: "bg-gradient-happy-blue",
      hoverColor:
        "hover:bg-gradient-to-r hover:from-mint-green hover:to-sky-blue",
      iconBg: "bg-mint-green/20",
      completed: 5,
      total: 15,
    },
    {
      id: "memory",
      title: "Memory Magic",
      description:
        "Use your super memory powers to match cards and win prizes!",
      icon: "🧠",
      difficulty: 2,
      color: "soft-lavender",
      bgColor: "bg-gradient-magical-purple",
      hoverColor:
        "hover:bg-gradient-to-r hover:from-soft-lavender hover:to-coral-pink",
      iconBg: "bg-soft-lavender/20",
      completed: 3,
      total: 12,
    },
    {
      id: "patterns",
      title: "Pattern Party",
      description: "Join the pattern party and create beautiful sequences!",
      icon: "🌀",
      difficulty: 3,
      color: "bright-orange",
      bgColor: "bg-gradient-sunny-orange",
      hoverColor:
        "hover:bg-gradient-to-r hover:from-bright-orange hover:to-lime-green",
      iconBg: "bg-bright-orange/20",
      completed: 2,
      total: 8,
    },
  ];

  // Auto-play welcome message
  useEffect(() => {
    if (!hasSpoken && "speechSynthesis" in window) {
      const timer = setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(
          "Welcome to SARATHI Learning Hub! Choose a fun game and let's learn together! Every game helps your brain grow stronger!"
        );
        utterance.rate = 0.8;
        utterance.pitch = 1.1;
        speechSynthesis.speak(utterance);
        setHasSpoken(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [hasSpoken]);

  const handleGameSelect = (game) => {
    setSelectedGame(game);
    // Navigate to game (would be implemented with router)
    console.log(`Starting game: ${game.title}`);
  };

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="font-heading text-5xl font-bold text-foreground mb-4 animate-fade-in-up">
          <span className="text-6xl mr-3 animate-bounce-fun">🎯</span>
          Learning Adventures
          <span className="text-6xl ml-3 animate-bounce-fun">🌟</span>
        </h2>
        <p
          className="font-body text-xl text-muted-foreground animate-fade-in-up max-w-3xl mx-auto leading-relaxed"
          style={{ animationDelay: "0.2s" }}
        >
          Every game is a new adventure that helps your amazing brain grow
          stronger!
          <span className="text-coral-pink font-semibold">
            {" "}
            Pick your favorite and let's have fun learning together!
          </span>
        </p>

        {/* Audio indicator */}
        <div className="mt-6 flex justify-center">
          <div
            className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-full px-8 py-3 animate-fade-in-up border-2 border-primary/30"
            style={{ animationDelay: "0.4s" }}
          >
            <span className="font-body text-lg text-primary flex items-center font-semibold">
              <span className="mr-3 text-2xl animate-bounce-gentle">🔊</span>
              Audio guidance is here to help you!
              <span className="ml-3 text-2xl animate-sparkle-twinkle">✨</span>
            </span>
          </div>
        </div>
      </div>

      <Card
        className="hover:shadow-3xl transition-all duration-500 animate-fade-in-up bg-gradient-to-r from-background via-primary/5 to-accent/5 border-2 border-primary/20"
        style={{ animationDelay: "0.6s" }}
      >
        <CardHeader>
          <CardTitle className="font-heading text-3xl flex items-center justify-center">
            <span className="mr-3 text-4xl animate-wiggle-dance">📊</span>
            Your Amazing Progress Journey
            <span className="ml-3 text-4xl animate-wiggle-dance">🏆</span>
          </CardTitle>
          <p className="font-body text-lg text-muted-foreground text-center mt-2">
            Look how much you've learned! Every step makes you stronger! 💪
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {games.map((game, index) => (
              <div
                key={game.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${0.8 + index * 0.1}s` }}
              >
                <ProgressIndicator
                  completed={game.completed}
                  total={game.total}
                  subject={game.title}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {games.map((game, index) => (
          <div
            key={game.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${1.2 + index * 0.2}s` }}
          >
            <GameCard game={game} onSelect={handleGameSelect} />
          </div>
        ))}
      </div>

      <div
        className="text-center animate-fade-in-up"
        style={{ animationDelay: "2s" }}
      >
        <Card className="max-w-4xl mx-auto bg-gradient-rainbow border-2 border-primary/30 game-card-3d">
          <CardContent className="p-10">
            <h3 className="font-heading text-4xl font-bold text-white mb-6 flex items-center justify-center">
              <span className="text-5xl mr-4 animate-bounce-fun">🌟</span>
              You're Doing Amazing!
              <span className="text-5xl ml-4 animate-bounce-fun">🌟</span>
            </h3>
            <p className="font-body text-xl text-white/90 leading-relaxed mb-6">
              Every game you play helps your brain create new connections and
              grow stronger! You're building incredible skills like memory,
              attention, and problem-solving.
            </p>
            <p className="font-body text-lg text-white/80 leading-relaxed">
              Remember: There's no rush to be perfect. Take your time, have fun,
              and celebrate every small victory!
              <span className="font-semibold">
                You are capable of amazing things!
              </span>{" "}
              🚀
            </p>
            <div className="flex justify-center mt-6 space-x-4">
              {["🎉", "💪", "🧠", "❤️", "🌈"].map((emoji, i) => (
                <span
                  key={i}
                  className="text-4xl animate-bounce-gentle"
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  {emoji}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
