"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Confetti from "./confetti"

export default function ShapesColorsGame() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [gameComplete, setGameComplete] = useState(false)

  const shapes = [
    { name: "Circle", emoji: "🔴", color: "red" },
    { name: "Square", emoji: "🟦", color: "blue" },
    { name: "Triangle", emoji: "🔺", color: "red" },
    { name: "Star", emoji: "⭐", color: "yellow" },
    { name: "Heart", emoji: "❤️", color: "red" },
  ]

  const colors = [
    { name: "Red", hex: "#ff6b6b", emoji: "🔴" },
    { name: "Blue", hex: "#4ecdc4", emoji: "🔵" },
    { name: "Yellow", hex: "#f9ca24", emoji: "🟡" },
    { name: "Green", hex: "#2ed573", emoji: "🟢" },
    { name: "Purple", hex: "#a55eea", emoji: "🟣" },
  ]

  const questions = [
    {
      type: "shape",
      question: "What shape is this?",
      target: shapes[0],
      options: [shapes[0], shapes[1], shapes[2]],
    },
    {
      type: "color",
      question: "What color is this?",
      target: colors[0],
      options: [colors[0], colors[1], colors[2]],
    },
    {
      type: "shape",
      question: "Find the star!",
      target: shapes[3],
      options: [shapes[1], shapes[3], shapes[4]],
    },
  ]

  const handleAnswer = (selectedOption) => {
    const isCorrect = selectedOption.name === questions[currentQuestion].target.name

    if (isCorrect) {
      setScore(score + 1)
      setFeedback("Great job! ⭐")
      setShowConfetti(true)

      // Play success sound
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance("Excellent! You got it right!")
        utterance.rate = 0.9
        utterance.pitch = 1.2
        speechSynthesis.speak(utterance)
      }
    } else {
      setFeedback("Good try! Let's try again. 💪")

      // Play encouragement sound
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance("Good try! Let's try again!")
        utterance.rate = 0.8
        utterance.pitch = 1.1
        speechSynthesis.speak(utterance)
      }
    }

    setTimeout(() => {
      if (isCorrect) {
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1)
          setFeedback("")
        } else {
          setGameComplete(true)
          setFeedback("🎉 Amazing! You completed all questions!")
        }
      } else {
        setFeedback("")
      }
    }, 2000)
  }

  const resetGame = () => {
    setCurrentQuestion(0)
    setScore(0)
    setGameComplete(false)
    setFeedback("")
  }

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 flex items-center justify-center">
        <Card className="max-w-2xl mx-auto text-center">
          <CardContent className="p-12">
            <div className="text-6xl mb-6 animate-bounce">🏆</div>
            <h2 className="font-heading text-4xl font-bold text-foreground mb-4">Congratulations!</h2>
            <p className="font-body text-xl text-muted-foreground mb-6">
              You scored {score} out of {questions.length}!
            </p>
            <div className="flex justify-center space-x-4">
              <Button onClick={resetGame} className="font-heading text-lg px-8 py-4">
                Play Again
              </Button>
              <Button variant="outline" className="font-heading text-lg px-8 py-4 bg-transparent">
                Back to Games
              </Button>
            </div>
          </CardContent>
        </Card>
        <Confetti trigger={true} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl font-bold text-foreground mb-4">Shapes & Colors</h1>
          <div className="flex justify-center items-center space-x-6">
            <div className="bg-white rounded-full px-4 py-2 shadow-md">
              <span className="font-body text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {questions.length}
              </span>
            </div>
            <div className="bg-white rounded-full px-4 py-2 shadow-md">
              <span className="font-body text-sm text-muted-foreground">Score: {score}</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Question Area */}
          <Card className="hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-center">{questions[currentQuestion].question}</CardTitle>
            </CardHeader>
            <CardContent className="text-center p-12">
              <div className="text-8xl mb-6 animate-pulse-glow">
                {questions[currentQuestion].type === "shape" ? (
                  questions[currentQuestion].target.emoji
                ) : (
                  <div
                    className="w-24 h-24 mx-auto rounded-full"
                    style={{ backgroundColor: questions[currentQuestion].target.hex }}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Answer Options */}
          <Card className="hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="font-heading text-xl text-center">Choose your answer:</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 gap-4">
                {questions[currentQuestion].options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    className="font-heading text-lg p-6 h-auto hover:scale-105 transition-all duration-200"
                    variant="outline"
                    disabled={feedback !== ""}
                  >
                    <span className="mr-4 text-2xl">
                      {questions[currentQuestion].type === "shape" ? (
                        option.emoji
                      ) : (
                        <div className="w-6 h-6 rounded-full inline-block" style={{ backgroundColor: option.hex }} />
                      )}
                    </span>
                    {option.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
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
