"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function TextToSpeech({ text }) {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const speak = () => {
    if ("speechSynthesis" in window && text) {
      setIsSpeaking(true)
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      utterance.pitch = 1
      utterance.volume = 1

      utterance.onend = () => {
        setIsSpeaking(false)
      }

      speechSynthesis.speak(utterance)
    }
  }

  const stop = () => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  return (
    <Button
      onClick={isSpeaking ? stop : speak}
      variant="outline"
      size="sm"
      className={`font-heading transition-all duration-200 ${
        isSpeaking ? "bg-secondary text-secondary-foreground animate-pulse" : "hover:scale-105"
      }`}
      disabled={!text}
    >
      {isSpeaking ? (
        <>
          <span className="mr-2">⏸️</span>
          Stop
        </>
      ) : (
        <>
          <span className="mr-2">🔊</span>
          Read Aloud
        </>
      )}
    </Button>
  )
}
