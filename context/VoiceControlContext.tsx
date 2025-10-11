// context/VoiceControlContext.tsx
"use client";

import React, { createContext, useContext } from 'react';
import { useVoiceControl } from '@/hooks/useVoiceControl';

// Create a type for the context value to make TypeScript happy
type VoiceControlType = ReturnType<typeof useVoiceControl>;

const VoiceControlContext = createContext<VoiceControlType | null>(null);

export const VoiceControlProvider = ({ children }: { children: React.ReactNode }) => {
  const voiceControl = useVoiceControl();
  return (
    <VoiceControlContext.Provider value={voiceControl}>
      {children}
    </VoiceControlContext.Provider>
  );
};

// A helper hook to make it easy to use the context in other components
export const useVoice = () => {
  const context = useContext(VoiceControlContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceControlProvider');
  }
  return context;
};