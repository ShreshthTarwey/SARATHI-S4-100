"use client";

import { useState, useRef, useCallback } from 'react';

// Define the structure for the payload of a website command
interface WebsiteCommandPayload {
  action: 'scroll' | 'navigate' | 'read' | 'unknown';
  target: string | null;
  direction: 'up' | 'down' | 'top' | 'bottom' | null;
}
interface GeneralAnswerPayload {
    text_to_speak: string;
}
// NEW: Define payload for the help action
interface HelpActionPayload {
    status: 'success' | 'failed';
}
// Define the overall structure of the API response
interface ApiResponse {
    type: 'WEBSITE_COMMAND' | 'GENERAL_ANSWER' | 'HELP_ACTION';
    payload: WebsiteCommandPayload | GeneralAnswerPayload | HelpActionPayload;
}
declare global {
    interface Window {
      webkitSpeechRecognition: any;
    }
}
const speakFeedback = (text: string) => {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    speechSynthesis.speak(utterance);
  }
};

// NEW: Function to get user's location
const getUserLocation = (): Promise<{ latitude: number; longitude: number } | null> => {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            console.error("Geolocation is not supported by this browser.");
            resolve(null);
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            () => {
                // User denied permission or an error occurred
                console.error("Failed to get user location or permission denied.");
                resolve(null);
            }
        );
    });
};

export const useVoiceControl = () => {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('Click the mic to start');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isProcessingRef = useRef(false);
  const pageSpecificCommandsRef = useRef<string[]>([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // UPDATED: This function now handles all three response types
  const handleApiResponse = (response: ApiResponse) => {
    console.log("Handling API Response:", response);

    if (response.type === 'WEBSITE_COMMAND') {
        const command = response.payload as WebsiteCommandPayload;
        setStatus(`Command: ${command.action}`);
        switch (command.action) {
            case 'scroll':
                if (command.direction === 'down') { window.scrollBy({ top: 500, behavior: 'smooth' }); speakFeedback("Scrolling down."); }
                else if (command.direction === 'up') { window.scrollBy({ top: -500, behavior: 'smooth' }); speakFeedback("Scrolling up."); }
                else if (command.direction === 'top') { window.scrollTo({ top: 0, behavior: 'smooth' }); speakFeedback("Scrolling to top."); }
                else if (command.direction === 'bottom') { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); speakFeedback("Scrolling to bottom."); }
                break;
            case 'navigate':
                if (command.target) {
                    const element = document.getElementById(command.target);
                    if (element) { element.scrollIntoView({ behavior: 'smooth', block: 'start' }); speakFeedback(`Navigating to ${command.target}.`); }
                    else { speakFeedback(`Sorry, I could not find the ${command.target} section.`); }
                }
                break;
            case 'read':
                if (command.target) {
                    const element = document.getElementById(command.target);
                    if (element) {
                        speakFeedback(`Reading the ${command.target} section.`);
                        setTimeout(() => speakFeedback(element.innerText || element.textContent || "This section is empty."), 1500);
                    } else { speakFeedback(`Sorry, I could not find the ${command.target} section to read.`); }
                }
                break;
            case 'unknown':
                speakFeedback("Sorry, I didn't understand that command.");
                break;
        }
    } else if (response.type === 'GENERAL_ANSWER') {
        const answer = response.payload as GeneralAnswerPayload;
        setStatus('Answering question...');
        speakFeedback(answer.text_to_speak);
    } 
    // NEW: Handle the help action response
    else if (response.type === 'HELP_ACTION') {
        const helpAction = response.payload as HelpActionPayload;
        if (helpAction.status === 'success') {
            setStatus('Emergency email sent.');
            speakFeedback('Emergency email has been sent with your location.');
        } else {
            setStatus('Failed to send email.');
            speakFeedback('Sorry, there was a problem sending the emergency email.');
        }
    }
  };
  
  // UPDATED: This function now checks for "help" and gets location first
  const processVoiceCommand = async (speechText: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setStatus('Processing...');

    const isHelpCommand = speechText.toLowerCase().includes('help') || speechText.toLowerCase().includes('mayday');
    let location = null;
    
    if (isHelpCommand) {
        speakFeedback("Sending emergency signal. Getting your location...");
        location = await getUserLocation(); // Wait for location
        if (!location) {
            speakFeedback("Could not get your location. Please enable location permissions. Sending email without location.");
        }
    }

    try {
      const response = await fetch(`${API_URL}/process-command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: speechText,
          page_commands: pageSpecificCommandsRef.current,
          location: location // Send location data (will be null if not a help command or denied)
        })
      });

      const data: ApiResponse = await response.json();
      handleApiResponse(data);

    } catch (error) {
      console.error('Error processing command:', error);
      setStatus('Error connecting to backend.');
      speakFeedback("I'm having trouble connecting to my brain right now.");
    } finally {
      setTimeout(() => {
        isProcessingRef.current = false;
        if(isListening) setStatus('Listening...');
      }, 2000);
    }
  };

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { return; }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onstart = () => { setIsListening(true); setStatus('Listening...'); };
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      processVoiceCommand(transcript);
    };
    recognition.onend = () => { if (recognitionRef.current) { recognition.start(); }};
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error", event.error); setStatus(`Error: ${event.error}`);
    };
    recognition.start();
    recognitionRef.current = recognition;
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      speechSynthesis.cancel();
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsListening(false);
      setStatus('Click the mic to start');
    }
  }, []);
  
  const setPageSpecificCommands = useCallback((commands: string[]) => {
      pageSpecificCommandsRef.current = commands;
  }, []);

  return { isListening, status, startListening, stopListening, setPageSpecificCommands };
};
