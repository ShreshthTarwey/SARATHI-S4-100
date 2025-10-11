"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function VoiceRecorder({ onTranscript }) {
  const [isRecording, setIsRecording] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      recognitionRef.current = new window.webkitSpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript)
          onTranscript?.(finalTranscript)
        }
      }

      recognitionRef.current.onstart = () => {
        setIsListening(true)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
        setIsRecording(false)
      }
    }
  }, [onTranscript])

  const startRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(true)
      recognitionRef.current.start()
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  return (
    <div className="text-center">
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        size="lg"
        className={`w-24 h-24 rounded-full font-heading text-lg transition-all duration-300 ${
          isRecording
            ? "bg-red-500 hover:bg-red-600 animate-pulse-glow scale-110"
            : "bg-primary hover:bg-primary/90 hover:scale-105"
        }`}
      >
        {isRecording ? <span className="text-2xl">⏹️</span> : <span className="text-2xl">🎤</span>}
      </Button>

      <div className="mt-4">
        <p className="font-body text-sm text-muted-foreground">
          {isRecording ? "Listening..." : "Click to start speaking"}
        </p>
        {isListening && (
          <div className="flex justify-center mt-2 space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
