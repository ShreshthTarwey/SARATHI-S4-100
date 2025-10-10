"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

export default function GameCard({ game, onSelect }) {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    // Play click sound effect (if available)
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(`Starting ${game.title}`)
      utterance.rate = 0.9
      utterance.pitch = 1.2
      speechSynthesis.speak(utterance)
    }
    onSelect(game)
  }

  return (
    <Card
      className={`group cursor-pointer transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl border-4 ${
        isHovered ? `border-${game.color}-400` : "border-transparent"
      } ${game.bgColor} hover:${game.hoverColor}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <CardContent className="p-8 text-center">
        <div className="relative mb-6">
          <div
            className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center group-hover:animate-pulse-glow transition-all duration-300 ${game.iconBg} group-hover:scale-110`}
          >
            <span className="text-4xl group-hover:animate-bounce">{game.icon}</span>
          </div>

          {/* Sparkle effects on hover */}
          {isHovered && (
            <>
              <div
                className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-sparkle"
                style={{ animationDelay: "0s" }}
              ></div>
              <div
                className="absolute -bottom-2 -left-2 w-3 h-3 bg-pink-400 rounded-full animate-sparkle"
                style={{ animationDelay: "0.3s" }}
              ></div>
              <div
                className="absolute top-1/2 -right-4 w-2 h-2 bg-blue-400 rounded-full animate-sparkle"
                style={{ animationDelay: "0.6s" }}
              ></div>
            </>
          )}
        </div>

        <h3 className="font-heading text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
          {game.title}
        </h3>

        <p className="font-body text-muted-foreground leading-relaxed mb-4">{game.description}</p>

        <div className="flex justify-center items-center space-x-2">
          <div className="flex space-x-1">
            {[...Array(game.difficulty)].map((_, i) => (
              <span key={i} className="text-yellow-400 text-lg">
                ⭐
              </span>
            ))}
          </div>
          <span className="font-body text-sm text-muted-foreground">Level {game.difficulty}</span>
        </div>

        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-primary/10 rounded-full px-4 py-2">
            <span className="font-heading text-sm font-bold text-primary">Click to Play!</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
