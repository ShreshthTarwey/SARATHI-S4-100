"use client";

import { useVoice } from "@/context/VoiceControlContext";
import { Mic, MicOff } from "lucide-react";

export default function GlobalVoiceControl() {
  const { isListening, startListening, stopListening, status } = useVoice();

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <button
      onClick={handleClick}
      title={status}
      // This CSS makes it a floating button at the bottom-center
      style={{
        position: 'fixed',
        bottom: '20px',
        // --- UPDATED STYLES START HERE ---
        left: '50%',
        transform: 'translateX(-50%)',
        // --- UPDATED STYLES END HERE ---
        zIndex: 1000,
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: isListening ? '#ef4444' : '#3b82f6', // red when listening, blue when not
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
      }}
    >
      {isListening ? <MicOff size={28} /> : <Mic size={28} />}
    </button>
  );
}

