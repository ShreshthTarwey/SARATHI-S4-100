"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Confetti from "./confetti"

export default function MemoryMatchGame() {
  const [cards, setCards] = useState([])
  const [flippedCards, setFlippedCards] = useState([])
  const [matchedPairs, setMatchedPairs] = useState([])
  const [moves, setMoves] = useState(0)
  const [gameComplete, setGameComplete] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const cardEmojis = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"]

  useEffect(() => {
    initializeGame()
  }, [])

  const initializeGame = () => {
    const gameCards = [...cardEmojis.slice(0, 6), ...cardEmojis.slice(0, 6)]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }))

    setCards(gameCards)
    setFlippedCards([])
    setMatchedPairs([])
    setMoves(0)
    setGameComplete(false)
  }

  const handleCardClick = (cardId) => {
    if (flippedCards.length === 2) return

    const card = cards.find((c) => c.id === cardId)
    if (card.isFlipped || card.isMatched) return

    const newFlippedCards = [...flippedCards, cardId]
    setFlippedCards(newFlippedCards)

    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c)))

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1)

      const [firstId, secondId] = newFlippedCards
      const firstCard = cards.find((c) => c.id === firstId)
      const secondCard = cards.find((c) => c.id === secondId)

      if (firstCard.emoji === secondCard.emoji) {
        // Match found!
        setTimeout(() => {
          setCards((prev) => prev.map((c) => (newFlippedCards.includes(c.id) ? { ...c, isMatched: true } : c)))
          setMatchedPairs([...matchedPairs, firstCard.emoji])
          setFlippedCards([])

          if (matchedPairs.length + 1 === 6) {
            setGameComplete(true)
            setShowConfetti(true)

            if ("speechSynthesis" in window) {
              const utterance = new SpeechSynthesisUtterance("Congratulations! You matched all pairs!")
              utterance.rate = 0.9
              utterance.pitch = 1.2
              speechSynthesis.speak(utterance)
            }
          } else {
            if ("speechSynthesis" in window) {
              const utterance = new SpeechSynthesisUtterance("Great match!")
              utterance.rate = 0.9
              utterance.pitch = 1.2
              speechSynthesis.speak(utterance)
            }
          }
        }, 1000)
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) => prev.map((c) => (newFlippedCards.includes(c.id) ? { ...c, isFlipped: false } : c)))
          setFlippedCards([])
        }, 1500)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl font-bold text-foreground mb-4">Memory Match</h1>
          <div className="flex justify-center items-center space-x-6">
            <div className="bg-white rounded-full px-4 py-2 shadow-md">
              <span className="font-body text-sm text-muted-foreground">Moves: {moves}</span>
            </div>
            <div className="bg-white rounded-full px-4 py-2 shadow-md">
              <span className="font-body text-sm text-muted-foreground">Pairs: {matchedPairs.length}/6</span>
            </div>
          </div>
        </div>

        {gameComplete ? (
          <Card className="max-w-2xl mx-auto text-center">
            <CardContent className="p-12">
              <div className="text-6xl mb-6 animate-bounce">🎉</div>
              <h2 className="font-heading text-4xl font-bold text-foreground mb-4">Amazing!</h2>
              <p className="font-body text-xl text-muted-foreground mb-6">You completed the game in {moves} moves!</p>
              <Button onClick={initializeGame} className="font-heading text-lg px-8 py-4">
                Play Again
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
            {cards.map((card) => (
              <Card
                key={card.id}
                className={`aspect-square cursor-pointer transition-all duration-300 hover:scale-105 ${
                  card.isMatched ? "bg-green-100 border-green-300" : "hover:shadow-lg"
                }`}
                onClick={() => handleCardClick(card.id)}
              >
                <CardContent className="p-0 h-full flex items-center justify-center">
                  <div className="text-4xl">
                    {card.isFlipped || card.isMatched ? (
                      <span className="animate-flip">{card.emoji}</span>
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                        <span className="text-white text-2xl">?</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
      </div>
    </div>
  )
}
