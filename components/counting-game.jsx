"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Confetti from "./confetti"

export default function CountingGame() {
  const [currentLevel, setCurrentLevel] = useState(1)
  const [targetNumber, setTargetNumber] = useState(3)
  const [userCount, setUserCount] = useState(0)
  const [objects, setObjects] = useState([])
  const [feedback, setFeedback] = useState("")
  const [showConfetti, setShowConfetti] = useState(false)
  const [score, setScore] = useState(0)

  const objectEmojis = ["🍎", "🌟", "🎈", "🐱", "🌸", "🚗", "🎁", "🦋"]

  useEffect(() => {
    generateLevel()
  }, [currentLevel])

  const generateLevel = () => {
    const number = Math.floor(Math.random() * 10) + 1
    setTargetNumber(number)
    setUserCount(0)

    const emoji = objectEmojis[Math.floor(Math.random() * objectEmojis.length)]
    const newObjects = Array.from({ length: number }, (_, i) => ({
      id: i,
      emoji,
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
      counted: false,
    }))
    setObjects(newObjects)
    setFeedback("")

    // Announce the level
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(`Count the ${emoji} objects!`)
      utterance.rate = 0.8
      utterance.pitch = 1.1
      speechSynthesis.speak(utterance)
    }
  }

  const handleObjectClick = (objectId) => {
    setObjects((prev) => prev.map((obj) => (obj.id === objectId ? { ...obj, counted: true } : obj)))
    setUserCount((prev) => prev + 1)
  }

  const checkAnswer = () => {
    if (userCount === targetNumber) {
      setScore(score + 1)
      setFeedback(`Perfect! There are ${targetNumber} objects! ⭐`)
      setShowConfetti(true)

      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(`Excellent! You counted ${targetNumber} correctly!`)
        utterance.rate = 0.9
        utterance.pitch = 1.2
        speechSynthesis.speak(utterance)
      }

      setTimeout(() => {
        setCurrentLevel(currentLevel + 1)
      }, 3000)
    } else {
      setFeedback(`Try again! Count carefully. 💪`)

      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance("Try again! Count each object carefully.")
        utterance.rate = 0.8
        utterance.pitch = 1.1
        speechSynthesis.speak(utterance)
      }

      // Reset counting
      setTimeout(() => {
        setObjects((prev) => prev.map((obj) => ({ ...obj, counted: false })))
        setUserCount(0)
        setFeedback("")
      }, 2000)
    }
  }

  const resetCount = () => {
    setObjects((prev) => prev.map((obj) => ({ ...obj, counted: false })))
    setUserCount(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl font-bold text-foreground mb-4">Counting Game</h1>
          <div className="flex justify-center items-center space-x-6">
            <div className="bg-white rounded-full px-4 py-2 shadow-md">
              <span className="font-body text-sm text-muted-foreground">Level {currentLevel}</span>
            </div>
            <div className="bg-white rounded-full px-4 py-2 shadow-md">
              <span className="font-body text-sm text-muted-foreground">Score: {score}</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Instructions */}
          <Card className="hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="font-heading text-xl text-center">Instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-center p-6">
              <div className="text-4xl mb-4">👆</div>
              <p className="font-body text-lg text-muted-foreground mb-4">Click on each object to count them!</p>
              <div className="bg-primary/10 rounded-lg p-4 mb-4">
                <p className="font-heading text-2xl font-bold text-primary">Count: {userCount}</p>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={checkAnswer}
                  className="w-full font-heading bg-green-500 hover:bg-green-600"
                  disabled={userCount === 0}
                >
                  Check Answer
                </Button>
                <Button onClick={resetCount} variant="outline" className="w-full font-heading bg-transparent">
                  Reset Count
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Game Area */}
          <div className="lg:col-span-2">
            <Card className="hover:shadow-xl transition-all duration-300 h-96">
              <CardContent className="p-0 h-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-pink-100">
                  {objects.map((obj) => (
                    <button
                      key={obj.id}
                      onClick={() => !obj.counted && handleObjectClick(obj.id)}
                      className={`absolute text-4xl transition-all duration-300 hover:scale-110 ${
                        obj.counted ? "opacity-50 scale-75 cursor-not-allowed" : "hover:animate-bounce cursor-pointer"
                      }`}
                      style={{
                        left: `${obj.x}%`,
                        top: `${obj.y}%`,
                        transform: obj.counted ? "scale(0.75)" : "scale(1)",
                      }}
                    >
                      {obj.emoji}
                      {obj.counted && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
            <Card className="bg-primary text-primary-foreground animate-bounce">
              <CardContent className="p-4">
                <p className="font-heading text-lg font-bold text-center">{feedback}</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
      </div>
    </div>
  )
}
