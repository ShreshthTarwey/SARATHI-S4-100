"use client"

import { Card, CardContent } from "@/components/ui/card"

export default function AchievementBadge({ achievement, isEarned = false }) {
  return (
    <Card
      className={`transition-all duration-300 hover:scale-105 ${
        isEarned
          ? "bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-300 hover:shadow-lg"
          : "bg-gray-100 border-gray-200 opacity-60"
      }`}
    >
      <CardContent className="p-4 text-center">
        <div className={`text-4xl mb-2 ${isEarned ? "animate-pulse-glow" : "grayscale"}`}>{achievement.icon}</div>
        <h4 className="font-heading text-sm font-bold text-foreground mb-1">{achievement.title}</h4>
        <p className="font-body text-xs text-muted-foreground">{achievement.description}</p>
        {isEarned && (
          <div className="mt-2">
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-heading">Earned!</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
