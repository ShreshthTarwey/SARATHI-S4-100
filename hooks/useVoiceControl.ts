// "use client";

// import { useState, useRef, useCallback } from 'react';

// // Define the structure for the payload of a website command
// interface WebsiteCommandPayload {
//   action: 'scroll' | 'navigate' | 'read' | 'unknown';
//   target: string | null;
//   direction: 'up' | 'down' | 'top' | 'bottom' | null;
// }
// interface GeneralAnswerPayload {
//     text_to_speak: string;
// }
// // NEW: Define payload for the help action
// interface HelpActionPayload {
//     status: 'success' | 'failed';
// }
// // Define the overall structure of the API response
// interface ApiResponse {
//     type: 'WEBSITE_COMMAND' | 'GENERAL_ANSWER' | 'HELP_ACTION';
//     payload: WebsiteCommandPayload | GeneralAnswerPayload | HelpActionPayload;
// }
// declare global {
//     interface Window {
//       webkitSpeechRecognition: any;
//     }
// }
// const speakFeedback = (text: string) => {
//   if ('speechSynthesis' in window) {
//     speechSynthesis.cancel();
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.rate = 0.9;
//     utterance.pitch = 1.1;
//     speechSynthesis.speak(utterance);
//   }
// };

// // NEW: Function to get user's location
// const getUserLocation = (): Promise<{ latitude: number; longitude: number } | null> => {
//     return new Promise((resolve) => {
//         if (!navigator.geolocation) {
//             console.error("Geolocation is not supported by this browser.");
//             resolve(null);
//         }
//         navigator.geolocation.getCurrentPosition(
//             (position) => {
//                 resolve({
//                     latitude: position.coords.latitude,
//                     longitude: position.coords.longitude,
//                 });
//             },
//             () => {
//                 // User denied permission or an error occurred
//                 console.error("Failed to get user location or permission denied.");
//                 resolve(null);
//             }
//         );
//     });
// };

// export const useVoiceControl = () => {
//   const [isListening, setIsListening] = useState(false);
//   const [status, setStatus] = useState('Click the mic to start');

//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const isProcessingRef = useRef(false);
//   const pageSpecificCommandsRef = useRef<string[]>([]);
//   const API_URL = process.env.NEXT_PUBLIC_API_URL;

//   // UPDATED: This function now handles all three response types
//   const handleApiResponse = (response: ApiResponse) => {
//     console.log("Handling API Response:", response);

//     if (response.type === 'WEBSITE_COMMAND') {
//         const command = response.payload as WebsiteCommandPayload;
//         setStatus(`Command: ${command.action}`);
//         switch (command.action) {
//             case 'scroll':
//                 if (command.direction === 'down') { window.scrollBy({ top: 500, behavior: 'smooth' }); speakFeedback("Scrolling down."); }
//                 else if (command.direction === 'up') { window.scrollBy({ top: -500, behavior: 'smooth' }); speakFeedback("Scrolling up."); }
//                 else if (command.direction === 'top') { window.scrollTo({ top: 0, behavior: 'smooth' }); speakFeedback("Scrolling to top."); }
//                 else if (command.direction === 'bottom') { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); speakFeedback("Scrolling to bottom."); }
//                 break;
//             case 'navigate':
//                 if (command.target) {
//                     const element = document.getElementById(command.target);
//                     if (element) { element.scrollIntoView({ behavior: 'smooth', block: 'start' }); speakFeedback(`Navigating to ${command.target}.`); }
//                     else { speakFeedback(`Sorry, I could not find the ${command.target} section.`); }
//                 }
//                 break;
//             case 'read':
//                 if (command.target) {
//                     const element = document.getElementById(command.target);
//                     if (element) {
//                         speakFeedback(`Reading the ${command.target} section.`);
//                         setTimeout(() => speakFeedback(element.innerText || element.textContent || "This section is empty."), 1500);
//                     } else { speakFeedback(`Sorry, I could not find the ${command.target} section to read.`); }
//                 }
//                 break;
//             case 'unknown':
//                 speakFeedback("Sorry, I didn't understand that command.");
//                 break;
//         }
//     } else if (response.type === 'GENERAL_ANSWER') {
//         const answer = response.payload as GeneralAnswerPayload;
//         setStatus('Answering question...');
//         speakFeedback(answer.text_to_speak);
//     } 
//     // NEW: Handle the help action response
//     else if (response.type === 'HELP_ACTION') {
//         const helpAction = response.payload as HelpActionPayload;
//         if (helpAction.status === 'success') {
//             setStatus('Emergency email sent.');
//             speakFeedback('Emergency email has been sent with your location.');
//         } else {
//             setStatus('Failed to send email.');
//             speakFeedback('Sorry, there was a problem sending the emergency email.');
//         }
//     }
//   };

//   // UPDATED: This function now checks for "help" and gets location first
//   const processVoiceCommand = async (speechText: string) => {
//     if (isProcessingRef.current) return;
//     isProcessingRef.current = true;
//     setStatus('Processing...');

//     const isHelpCommand = speechText.toLowerCase().includes('help') || speechText.toLowerCase().includes('mayday');
//     let location = null;

//     if (isHelpCommand) {
//         speakFeedback("Sending emergency signal. Getting your location...");
//         location = await getUserLocation(); // Wait for location
//         if (!location) {
//             speakFeedback("Could not get your location. Please enable location permissions. Sending email without location.");
//         }
//     }

//     try {
//       const response = await fetch(`${API_URL}/process-command`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           text: speechText,
//           page_commands: pageSpecificCommandsRef.current,
//           location: location // Send location data (will be null if not a help command or denied)
//         })
//       });

//       const data: ApiResponse = await response.json();
//       handleApiResponse(data);

//     } catch (error) {
//       console.error('Error processing command:', error);
//       setStatus('Error connecting to backend.');
//       speakFeedback("I'm having trouble connecting to my brain right now.");
//     } finally {
//       setTimeout(() => {
//         isProcessingRef.current = false;
//         if(isListening) setStatus('Listening...');
//       }, 2000);
//     }
//   };

//   const startListening = useCallback(() => {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) { return; }
//     const recognition = new SpeechRecognition();
//     recognition.continuous = true;
//     recognition.interimResults = false;
//     recognition.lang = 'en-US';
//     recognition.onstart = () => { setIsListening(true); setStatus('Listening...'); };
//     recognition.onresult = (event: SpeechRecognitionEvent) => {
//       const transcript = event.results[event.results.length - 1][0].transcript.trim();
//       processVoiceCommand(transcript);
//     };
//     recognition.onend = () => { if (recognitionRef.current) { recognition.start(); }};
//     recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
//         console.error("Speech recognition error", event.error); setStatus(`Error: ${event.error}`);
//     };
//     recognition.start();
//     recognitionRef.current = recognition;
//   }, []);

//   const stopListening = useCallback(() => {
//     if (recognitionRef.current) {
//       speechSynthesis.cancel();
//       recognitionRef.current.stop();
//       recognitionRef.current = null;
//       setIsListening(false);
//       setStatus('Click the mic to start');
//     }
//   }, []);

//   const setPageSpecificCommands = useCallback((commands: string[]) => {
//       pageSpecificCommandsRef.current = commands;
//   }, []);

//   return { isListening, status, startListening, stopListening, setPageSpecificCommands };
// };

// "use client";

// import { useState, useRef, useCallback } from 'react';
// import { useRouter } from 'next/navigation'; // For navigating between pages

// // --- UPDATED: Interface definitions now include all possible actions ---
// interface WebsiteCommandPayload {
//   action: 'scroll' | 'navigate' | 'read' | 'unknown' | 'click' | 'goToPage' | 'fillInput';
//   target: string | null;
//   direction?: 'up' | 'down' | 'top' | 'bottom' | null;
//   value?: string; // The text to fill into an input
// }
// interface GeneralAnswerPayload {
//   text_to_speak: string;
// }
// interface HelpActionPayload {
//   status: 'success' | 'failed';
// }
// // For the "play game" voice command, which is a global command
// interface PlayGamePayload {
//   name: string;
//   url: string;
// }
// interface ApiResponse {
//   type: 'WEBSITE_COMMAND' | 'GENERAL_ANSWER' | 'HELP_ACTION' | 'PLAY_GAME';
//   payload: WebsiteCommandPayload | GeneralAnswerPayload | HelpActionPayload | PlayGamePayload;
// }
// declare global {
//   interface Window {
//     webkitSpeechRecognition: any;
//   }
// }
// const speakFeedback = (text: string) => {
//   if ('speechSynthesis' in window) {
//     speechSynthesis.cancel();
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.rate = 0.9;
//     utterance.pitch = 1.1;
//     speechSynthesis.speak(utterance);
//   }
// };

// // NEW: A smart helper function to find an input by its label text
// const findInputByLabelAndFill = (labelText: string, value: string): boolean => {
//   if (!labelText || value === undefined) return false;
//   const sanitizedLabel = labelText.trim().toLowerCase();

//   // Find all label elements on the page
//   const labels = document.querySelectorAll('label');
//   for (const label of Array.from(labels)) {
//     if (label.textContent?.trim().toLowerCase().includes(sanitizedLabel)) {
//       // Find the input associated with this label
//       const inputId = label.getAttribute('for');
//       const input = inputId ? document.getElementById(inputId) as HTMLInputElement | HTMLTextAreaElement : null;
//       if (input) {
//         input.value = value;
//         // Dispatch an 'input' event to make sure React's state updates
//         input.dispatchEvent(new Event('input', { bubbles: true }));
//         return true;
//       }
//     }
//   }
//   // Fallback: Check for aria-label or placeholder
//   const inputs = document.querySelectorAll('input, textarea');
//   for (const input of Array.from(inputs)) {
//     const ariaLabel = input.getAttribute('aria-label')?.toLowerCase();
//     const placeholder = input.getAttribute('placeholder')?.toLowerCase();
//     if (ariaLabel?.includes(sanitizedLabel) || placeholder?.includes(sanitizedLabel)) {
//       (input as HTMLInputElement).value = value;
//       input.dispatchEvent(new Event('input', { bubbles: true }));
//       return true;
//     }
//   }
//   return false;
// };

// const getUserLocation = (): Promise<{ latitude: number; longitude: number } | null> => {
//   return new Promise((resolve) => {
//     if (!navigator.geolocation) {
//       console.error("Geolocation is not supported by this browser.");
//       resolve(null);
//     }
//     navigator.geolocation.getCurrentPosition(
//       (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
//       () => { console.error("Failed to get user location."); resolve(null); }
//     );
//   });
// };

// // NEW: A helper function to find and click elements by their text content
// const findElementByTextAndClick = (text: string): boolean => {
//   if (!text) return false;
//   const sanitizedText = text.trim().toLowerCase();
//   // A broad selector to find any clickable element
//   const elements = document.querySelectorAll('a, button, [role="button"], [role="link"]');
//   for (const element of Array.from(elements)) {
//     if (element.textContent?.trim().toLowerCase() === sanitizedText) {
//       (element as HTMLElement).click();
//       return true;
//     }
//   }
//   return false;
// };

// export const useVoiceControl = () => {
//   const router = useRouter(); // Initialize the Next.js router
//   const [isListening, setIsListening] = useState(false);
//   const [status, setStatus] = useState('Click the mic to start');

//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const isProcessingRef = useRef(false);
//   const pageSpecificCommandsRef = useRef<string[]>([]);
//   const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

//   // UPDATED: This function now handles ALL response types, including the new ones
//   const handleApiResponse = (response: ApiResponse) => {
//     console.log("Handling API Response:", response);

//     if (response.type === 'WEBSITE_COMMAND') {
//       const command = response.payload as WebsiteCommandPayload;
//       setStatus(`Command: ${command.action}`);
//       switch (command.action) {
//         case 'scroll':
//           if (command.direction === 'down') { window.scrollBy({ top: 500, behavior: 'smooth' }); speakFeedback("Scrolling down."); }
//           else if (command.direction === 'up') { window.scrollBy({ top: -500, behavior: 'smooth' }); speakFeedback("Scrolling up."); }
//           else if (command.direction === 'top') { window.scrollTo({ top: 0, behavior: 'smooth' }); speakFeedback("Scrolling to top."); }
//           else if (command.direction === 'bottom') { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); speakFeedback("Scrolling to bottom."); }
//           break;
//         case 'navigate': // This handles scrolling to sections on the current page
//           if (command.target) {
//             const element = document.getElementById(command.target);
//             if (element) { element.scrollIntoView({ behavior: 'smooth', block: 'start' }); speakFeedback(`Navigating to ${command.target}.`); }
//             else { speakFeedback(`Sorry, I could not find the ${command.target} section.`); }
//           }
//           break;
//         case 'read':
//           if (command.target) {
//             const element = document.getElementById(command.target);
//             if (element) {
//               speakFeedback(`Reading the ${command.target} section.`);
//               setTimeout(() => speakFeedback(element.innerText || element.textContent || "This section is empty."), 1500);
//             } else { speakFeedback(`Sorry, I could not find the ${command.target} section to read.`); }
//           }
//           break;

//         // --- NEW ADVANCED ACTIONS ---
//         case 'goToPage':
//           if (command.target) {
//             speakFeedback(`Going to the ${command.target.replace('/', '')} page.`);
//             router.push(command.target); // Use the router to change pages
//           }
//           break;
//         case 'click':
//           if (command.target) {
//             const success = findElementByTextAndClick(command.target);
//             if (success) {
//               speakFeedback(`Clicked ${command.target}.`);
//             } else {
//               speakFeedback(`Sorry, I could not find an element to click with the text ${command.target}.`);
//             }
//           }
//           break;
//         case 'fillInput':
//           if (command.target && command.value !== undefined) {
//             const success = findInputByLabelAndFill(command.target, command.value);
//             if (success) {
//               speakFeedback(`Okay, I've filled the ${command.target} field.`);
//             } else {
//               speakFeedback(`Sorry, I could not find a form field for ${command.target}.`);
//             }
//           }
//           break;

//         case 'unknown':
//           speakFeedback("Sorry, I didn't understand that command.");
//           break;
//       }
//     } else if (response.type === 'GENERAL_ANSWER') {
//       const answer = response.payload as GeneralAnswerPayload;
//       setStatus('Answering question...');
//       speakFeedback(answer.text_to_speak);
//     }
//     else if (response.type === 'HELP_ACTION') {
//       const helpAction = response.payload as HelpActionPayload;
//       if (helpAction.status === 'success') {
//         setStatus('Emergency email sent.');
//         speakFeedback('Emergency email has been sent with your location.');
//       } else {
//         setStatus('Failed to send email.');
//         speakFeedback('Sorry, there was a problem sending the emergency email.');
//       }
//     }
//     // Note: The PLAY_GAME voice command is handled as a GENERAL_ANSWER for now, per the backend logic.
//   };

//   // This function remains the same as your previous working version
//   const processVoiceCommand = async (speechText: string) => {
//     if (isProcessingRef.current) return;
//     isProcessingRef.current = true;
//     setStatus('Processing...');

//     const isHelpCommand = speechText.toLowerCase().includes('help') || speechText.toLowerCase().includes('mayday');
//     let location = null;

//     if (isHelpCommand) {
//       speakFeedback("Sending emergency signal. Getting your location...");
//       location = await getUserLocation();
//       if (!location) {
//         speakFeedback("Could not get your location. Please enable location permissions. Sending email without location.");
//       }
//     }

//     try {
//       const response = await fetch(`${API_URL}/process-command`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           text: speechText,
//           page_commands: pageSpecificCommandsRef.current,
//           location: location
//         })
//       });

//       if (!response.ok) throw new Error(`Server error: ${response.status}`);

//       const data: ApiResponse = await response.json();
//       handleApiResponse(data);

//     } catch (error) {
//       console.error('Error processing command:', error);
//       setStatus('Error connecting to backend.');
//       speakFeedback("I'm having trouble connecting to my brain right now.");
//     } finally {
//       setTimeout(() => {
//         isProcessingRef.current = false;
//         if (isListening) setStatus('Listening...');
//       }, 2000);
//     }
//   };

//   // The rest of these functions are also unchanged
//   const startListening = useCallback(() => {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) { return; }
//     const recognition = new SpeechRecognition();
//     recognition.continuous = true;
//     recognition.interimResults = false;
//     recognition.lang = 'en-US';
//     recognition.onstart = () => { setIsListening(true); setStatus('Listening...'); };
//     recognition.onresult = (event: SpeechRecognitionEvent) => {
//       const transcript = event.results[event.results.length - 1][0].transcript.trim();
//       processVoiceCommand(transcript);
//     };
//     recognition.onend = () => { if (recognitionRef.current) { recognition.start(); } };
//     recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
//       console.error("Speech recognition error", event.error); setStatus(`Error: ${event.error}`);
//     };
//     recognition.start();
//     recognitionRef.current = recognition;
//   }, []);

//   const stopListening = useCallback(() => {
//     if (recognitionRef.current) {
//       speechSynthesis.cancel();
//       recognitionRef.current.stop();
//       recognitionRef.current = null;
//       setIsListening(false);
//       setStatus('Click the mic to start');
//     }
//   }, []);

//   const setPageSpecificCommands = useCallback((commands: string[]) => {
//     pageSpecificCommandsRef.current = commands;
//   }, []);

//   return { isListening, status, startListening, stopListening, setPageSpecificCommands };
// };

// "use client";

// import { useState, useRef, useCallback } from 'react';
// import { useRouter } from 'next/navigation';

// // --- Interface definitions ---
// interface WebsiteCommandPayload {
//   action: 'scroll' | 'navigate' | 'read' | 'unknown' | 'click' | 'goToPage' | 'fillInput';
//   target: string | null;
//   direction?: 'up' | 'down' | 'top' | 'bottom' | null;
//   value?: string;
// }
// interface GeneralAnswerPayload {
//   text_to_speak: string;
// }
// interface HelpActionPayload {
//   status: 'success' | 'failed';
// }
// interface PlayGamePayload {
//   name: string;
//   url: string;
// }
// interface ApiResponse {
//   type: 'WEBSITE_COMMAND' | 'GENERAL_ANSWER' | 'HELP_ACTION' | 'PLAY_GAME';
//   payload: WebsiteCommandPayload | GeneralAnswerPayload | HelpActionPayload | PlayGamePayload;
// }
// declare global {
//   interface Window {
//     webkitSpeechRecognition: any;
//   }
// }

// // --- Helper Functions (Unchanged) ---
// const speakFeedback = (text: string) => {
//   if ('speechSynthesis' in window) {
//     speechSynthesis.cancel();
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.rate = 0.9;
//     utterance.pitch = 1.1;
//     speechSynthesis.speak(utterance);
//   }
// };

// const getUserLocation = (): Promise<{ latitude: number; longitude: number } | null> => {
//   return new Promise((resolve) => {
//     if (!navigator.geolocation) {
//       console.error("Geolocation is not supported by this browser.");
//       resolve(null);
//     }
//     navigator.geolocation.getCurrentPosition(
//       (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
//       () => { console.error("Failed to get user location."); resolve(null); }
//     );
//   });
// };

// const findElementByTextAndClick = (text: string): boolean => {
//   if (!text) return false;
//   const sanitizedText = text.trim().toLowerCase();
//   const elements = document.querySelectorAll('a, button, [role="button"], [role="link"]');
//   for (const element of Array.from(elements)) {
//     if (element.textContent?.trim().toLowerCase() === sanitizedText) {
//       (element as HTMLElement).click();
//       return true;
//     }
//   }
//   return false;
// };

// const findInputByLabelAndFill = (labelText: string, value: string): boolean => {
//     if (!labelText || value === undefined) return false;
//     const sanitizedLabel = labelText.trim().toLowerCase();
//     const labels = document.querySelectorAll('label');
//     for (const label of Array.from(labels)) {
//         if (label.textContent?.trim().toLowerCase().includes(sanitizedLabel)) {
//             const inputId = label.getAttribute('for');
//             const input = inputId ? document.getElementById(inputId) as HTMLInputElement | HTMLTextAreaElement : null;
//             if (input) {
//                 input.value = value;
//                 input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
//                 return true;
//             }
//         }
//     }
//     const inputs = document.querySelectorAll('input, textarea');
//     for (const input of Array.from(inputs)) {
//         const ariaLabel = input.getAttribute('aria-label')?.toLowerCase();
//         const placeholder = input.getAttribute('placeholder')?.toLowerCase();
//         if (ariaLabel?.includes(sanitizedLabel) || placeholder?.includes(sanitizedLabel)) {
//             (input as HTMLInputElement).value = value;
//             input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
//             return true;
//         }
//     }
//     return false;
// };


// export const useVoiceControl = () => {
//   const router = useRouter();
//   const [isListening, setIsListening] = useState(false);
//   const [status, setStatus] = useState('Click the mic to start');

//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const isProcessingRef = useRef(false);
//   const pageSpecificCommandsRef = useRef<string[]>([]);
//   const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

//   // --- UPDATED: Core logic is wrapped in useCallback to prevent re-creation on re-renders ---
//   // This stabilizes the component and prevents the refresh bug.
//   const handleApiResponse = useCallback((response: ApiResponse) => {
//     console.log("Handling API Response:", response);
//     if (response.type === 'WEBSITE_COMMAND') {
//       const command = response.payload as WebsiteCommandPayload;
//       setStatus(`Command: ${command.action}`);
//       switch (command.action) {
//         case 'scroll':
//           if (command.direction === 'down') { window.scrollBy({ top: 500, behavior: 'smooth' }); speakFeedback("Scrolling down."); }
//           else if (command.direction === 'up') { window.scrollBy({ top: -500, behavior: 'smooth' }); speakFeedback("Scrolling up."); }
//           else if (command.direction === 'top') { window.scrollTo({ top: 0, behavior: 'smooth' }); speakFeedback("Scrolling to top."); }
//           else if (command.direction === 'bottom') { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); speakFeedback("Scrolling to bottom."); }
//           break;
//         case 'navigate':
//           if (command.target) {
//             const element = document.getElementById(command.target);
//             if (element) { element.scrollIntoView({ behavior: 'smooth', block: 'start' }); speakFeedback(`Navigating to ${command.target}.`); }
//             else { speakFeedback(`Sorry, I could not find the ${command.target} section.`); }
//           }
//           break;
//         case 'read':
//           if (command.target) {
//             const element = document.getElementById(command.target);
//             if (element) {
//               speakFeedback(`Reading the ${command.target} section.`);
//               setTimeout(() => speakFeedback(element.innerText || element.textContent || "This section is empty."), 1500);
//             } else { speakFeedback(`Sorry, I could not find the ${command.target} section to read.`); }
//           }
//           break;
//         case 'goToPage':
//           if (command.target) {
//             speakFeedback(`Going to the ${command.target.replace('/', '')} page.`);
//             router.push(command.target);
//           }
//           break;
//         case 'click':
//           if (command.target) {
//             const success = findElementByTextAndClick(command.target);
//             if (success) { speakFeedback(`Clicked ${command.target}.`); }
//             else { speakFeedback(`Sorry, I could not find an element to click with the text ${command.target}.`); }
//           }
//           break;
//         case 'fillInput':
//           if (command.target && command.value !== undefined) {
//             const success = findInputByLabelAndFill(command.target, command.value);
//             if (success) { speakFeedback(`Okay, I've filled the ${command.target} field.`); }
//             else { speakFeedback(`Sorry, I could not find a form field for ${command.target}.`); }
//           }
//           break;
//         case 'unknown':
//           speakFeedback("Sorry, I didn't understand that command.");
//           break;
//       }
//     } else if (response.type === 'GENERAL_ANSWER') {
//       const answer = response.payload as GeneralAnswerPayload;
//       setStatus('Answering question...');
//       speakFeedback(answer.text_to_speak);
//     } else if (response.type === 'HELP_ACTION') {
//       const helpAction = response.payload as HelpActionPayload;
//       if (helpAction.status === 'success') {
//         setStatus('Emergency email sent.');
//         speakFeedback('Emergency email has been sent with your location.');
//       } else {
//         setStatus('Failed to send email.');
//         speakFeedback('Sorry, there was a problem sending the emergency email.');
//       }
//     }
//   }, [router]); // Dependency on router is stable

//   const processVoiceCommand = useCallback(async (speechText: string) => {
//     if (isProcessingRef.current) return;
//     isProcessingRef.current = true;
//     setStatus('Processing...');
//     const isHelpCommand = speechText.toLowerCase().includes('help') || speechText.toLowerCase().includes('mayday');
//     let location = null;
//     if (isHelpCommand) {
//       speakFeedback("Sending emergency signal. Getting your location...");
//       location = await getUserLocation();
//       if (!location) {
//         speakFeedback("Could not get your location. Please enable location permissions. Sending email without location.");
//       }
//     }
//     try {
//       const response = await fetch(`${API_URL}/process-command`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ text: speechText, page_commands: pageSpecificCommandsRef.current, location: location })
//       });
//       if (!response.ok) throw new Error(`Server error: ${response.status}`);
//       const data: ApiResponse = await response.json();
//       handleApiResponse(data);
//     } catch (error) {
//       console.error('Error processing command:', error);
//       setStatus('Error connecting to backend.');
//       speakFeedback("I'm having trouble connecting to my brain right now.");
//     } finally {
//       setTimeout(() => {
//         isProcessingRef.current = false;
//         if (isListening) setStatus('Listening...');
//       }, 2000);
//     }
//   }, [handleApiResponse, isListening, API_URL]); // Stable dependencies

//   const startListening = useCallback(() => {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) { return; }
//     const recognition = new SpeechRecognition();
//     recognition.continuous = true;
//     recognition.interimResults = false;
//     recognition.lang = 'en-US';
//     recognition.onstart = () => setIsListening(true);
//     recognition.onresult = (event: SpeechRecognitionEvent) => {
//       const transcript = event.results[event.results.length - 1][0].transcript.trim();
//       processVoiceCommand(transcript);
//     };
//     recognition.onend = () => { if (recognitionRef.current) { recognition.start(); } };
//     recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
//       console.error("Speech recognition error", event.error);
//       setStatus(`Error: ${event.error}`);
//     };
//     recognition.start();
//     recognitionRef.current = recognition;
//   }, [processVoiceCommand]); // Stable dependency

//   const stopListening = useCallback(() => {
//     if (recognitionRef.current) {
//       speechSynthesis.cancel();
//       recognitionRef.current.stop();
//       recognitionRef.current = null;
//       setIsListening(false);
//       setStatus('Click the mic to start');
//     }
//   }, []);

//   const setPageSpecificCommands = useCallback((commands: string[]) => {
//     pageSpecificCommandsRef.current = commands;
//   }, []);

//   return { isListening, status, startListening, stopListening, setPageSpecificCommands };
// };

// "use client";

// import { useState, useRef, useCallback } from 'react';
// import { useRouter } from 'next/navigation';

// // --- Interface definitions ---
// interface WebsiteCommandPayload {
//   action: 'scroll' | 'navigate' | 'read' | 'unknown' | 'click' | 'goToPage' | 'fillInput';
//   target: string | null;
//   direction?: 'up' | 'down' | 'top' | 'bottom' | null;
//   value?: string;
// }
// interface GeneralAnswerPayload {
//   text_to_speak: string;
// }
// interface HelpActionPayload {
//   status: 'success' | 'failed';
// }
// interface PlayGamePayload {
//   name: string;
//   url: string;
// }
// interface ApiResponse {
//   type: 'WEBSITE_COMMAND' | 'GENERAL_ANSWER' | 'HELP_ACTION' | 'PLAY_GAME';
//   payload: WebsiteCommandPayload | GeneralAnswerPayload | HelpActionPayload | PlayGamePayload;
// }
// declare global {
//   interface Window {
//     webkitSpeechRecognition: any;
//   }
// }

// // --- Helper Functions (Unchanged) ---
// const speakFeedback = (text: string) => {
//   if ('speechSynthesis' in window) {
//     speechSynthesis.cancel();
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.rate = 0.9;
//     utterance.pitch = 1.1;
//     speechSynthesis.speak(utterance);
//   }
// };

// const getUserLocation = (): Promise<{ latitude: number; longitude: number } | null> => {
//   return new Promise((resolve) => {
//     if (!navigator.geolocation) {
//       console.error("Geolocation is not supported by this browser.");
//       resolve(null);
//     }
//     navigator.geolocation.getCurrentPosition(
//       (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
//       () => { console.error("Failed to get user location."); resolve(null); }
//     );
//   });
// };

// const findElementByTextAndClick = (text: string): boolean => {
//   if (!text) return false;
//   const sanitizedText = text.trim().toLowerCase();
//   const elements = document.querySelectorAll('a, button, [role="button"], [role="link"]');
//   for (const element of Array.from(elements)) {
//     if (element.textContent?.trim().toLowerCase() === sanitizedText) {
//       (element as HTMLElement).click();
//       return true;
//     }
//   }
//   return false;
// };

// const findInputByLabelAndFill = (labelText: string, value: string): boolean => {
//     if (!labelText || value === undefined) return false;
//     const sanitizedLabel = labelText.trim().toLowerCase();
    
//     const fillAndDispatch = (input: HTMLInputElement | HTMLTextAreaElement) => {
//         input.value = value;
//         input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
//     };

//     const labels = document.querySelectorAll('label');
//     for (const label of Array.from(labels)) {
//         if (label.textContent?.trim().toLowerCase().includes(sanitizedLabel)) {
//             const inputId = label.getAttribute('for');
//             const input = inputId ? document.getElementById(inputId) as HTMLInputElement | HTMLTextAreaElement : null;
//             if (input) {
//                 fillAndDispatch(input);
//                 return true;
//             }
//         }
//     }
//     const inputs = document.querySelectorAll('input, textarea');
//     for (const input of Array.from(inputs)) {
//         const ariaLabel = input.getAttribute('aria-label')?.toLowerCase();
//         const placeholder = input.getAttribute('placeholder')?.toLowerCase();
//         if (ariaLabel?.includes(sanitizedLabel) || placeholder?.includes(sanitizedLabel)) {
//             fillAndDispatch(input as HTMLInputElement);
//             return true;
//         }
//     }
//     return false;
// };


// export const useVoiceControl = () => {
//   const router = useRouter();
//   const [isListening, setIsListening] = useState(false);
//   const [status, setStatus] = useState('Click the mic to start');

//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const isProcessingRef = useRef(false);
//   const pageSpecificCommandsRef = useRef<string[]>([]);
//   const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

//   // --- Core logic is wrapped in useCallback to prevent re-creation on re-renders ---
//   // This stabilizes the component and prevents the refresh bug.
//   const handleApiResponse = useCallback((response: ApiResponse) => {
//     console.log("Handling API Response:", response);
//     if (response.type === 'WEBSITE_COMMAND') {
//       const command = response.payload as WebsiteCommandPayload;
//       setStatus(`Command: ${command.action}`);
//       switch (command.action) {
//         case 'scroll':
//           if (command.direction === 'down') { window.scrollBy({ top: 500, behavior: 'smooth' }); speakFeedback("Scrolling down."); }
//           else if (command.direction === 'up') { window.scrollBy({ top: -500, behavior: 'smooth' }); speakFeedback("Scrolling up."); }
//           else if (command.direction === 'top') { window.scrollTo({ top: 0, behavior: 'smooth' }); speakFeedback("Scrolling to top."); }
//           else if (command.direction === 'bottom') { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); speakFeedback("Scrolling to bottom."); }
//           break;
//         case 'navigate':
//           if (command.target) {
//             const element = document.getElementById(command.target);
//             if (element) { element.scrollIntoView({ behavior: 'smooth', block: 'start' }); speakFeedback(`Navigating to ${command.target}.`); }
//             else { speakFeedback(`Sorry, I could not find the ${command.target} section.`); }
//           }
//           break;
//         case 'read':
//           if (command.target) {
//             const element = document.getElementById(command.target);
//             if (element) {
//               speakFeedback(`Reading the ${command.target} section.`);
//               setTimeout(() => speakFeedback(element.innerText || element.textContent || "This section is empty."), 1500);
//             } else { speakFeedback(`Sorry, I could not find the ${command.target} section to read.`); }
//           }
//           break;
//         case 'goToPage':
//           if (command.target) {
//             speakFeedback(`Going to the ${command.target.replace('/', '')} page.`);
//             router.push(command.target);
//           }
//           break;
//         case 'click':
//           if (command.target) {
//             const success = findElementByTextAndClick(command.target);
//             if (success) { speakFeedback(`Clicked ${command.target}.`); }
//             else { speakFeedback(`Sorry, I could not find an element to click with the text ${command.target}.`); }
//           }
//           break;
//         case 'fillInput':
//           if (command.target && command.value !== undefined) {
//             const success = findInputByLabelAndFill(command.target, command.value);
//             if (success) { speakFeedback(`Okay, I've filled the ${command.target} field.`); }
//             else { speakFeedback(`Sorry, I could not find a form field for ${command.target}.`); }
//           }
//           break;
//         case 'unknown':
//           speakFeedback("Sorry, I didn't understand that command.");
//           break;
//       }
//     } else if (response.type === 'GENERAL_ANSWER') {
//       const answer = response.payload as GeneralAnswerPayload;
//       setStatus('Answering question...');
//       speakFeedback(answer.text_to_speak);
//     } else if (response.type === 'HELP_ACTION') {
//       const helpAction = response.payload as HelpActionPayload;
//       if (helpAction.status === 'success') {
//         setStatus('Emergency email sent.');
//         speakFeedback('Emergency email has been sent with your location.');
//       } else {
//         setStatus('Failed to send email.');
//         speakFeedback('Sorry, there was a problem sending the emergency email.');
//       }
//     }
//   }, [router]); // Dependency on router is stable

//   const processVoiceCommand = useCallback(async (speechText: string) => {
//     if (isProcessingRef.current) return;
//     isProcessingRef.current = true;
//     setStatus('Processing...');
//     const isHelpCommand = speechText.toLowerCase().includes('help') || speechText.toLowerCase().includes('mayday');
//     let location = null;
//     if (isHelpCommand) {
//       speakFeedback("Sending emergency signal. Getting your location...");
//       location = await getUserLocation();
//       if (!location) {
//         speakFeedback("Could not get your location. Please enable location permissions. Sending email without location.");
//       }
//     }
//     try {
//       const response = await fetch(`${API_URL}/process-command`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ text: speechText, page_commands: pageSpecificCommandsRef.current, location: location })
//       });
//       if (!response.ok) throw new Error(`Server error: ${response.status}`);
//       const data: ApiResponse = await response.json();
//       handleApiResponse(data);
//     } catch (error) {
//       console.error('Error processing command:', error);
//       setStatus('Error connecting to backend.');
//       speakFeedback("I'm having trouble connecting to my brain right now.");
//     } finally {
//       setTimeout(() => {
//         isProcessingRef.current = false;
//         if (isListening) setStatus('Listening...');
//       }, 2000);
//     }
//   }, [handleApiResponse, isListening, API_URL]); // Stable dependencies

//   const startListening = useCallback(() => {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) { return; }
//     const recognition = new SpeechRecognition();
//     recognition.continuous = true;
//     recognition.interimResults = false;
//     recognition.lang = 'en-US';
//     recognition.onstart = () => setIsListening(true);
//     recognition.onresult = (event: SpeechRecognitionEvent) => {
//       const transcript = event.results[event.results.length - 1][0].transcript.trim();
//       processVoiceCommand(transcript);
//     };
//     recognition.onend = () => { if (recognitionRef.current) { recognition.start(); } };
//     recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
//       console.error("Speech recognition error", event.error);
//       setStatus(`Error: ${event.error}`);
//     };
//     recognition.start();
//     recognitionRef.current = recognition;
//   }, [processVoiceCommand]); // Stable dependency

//   const stopListening = useCallback(() => {
//     if (recognitionRef.current) {
//       speechSynthesis.cancel();
//       recognitionRef.current.stop();
//       recognitionRef.current = null;
//       setIsListening(false);
//       setStatus('Click the mic to start');
//     }
//   }, []);

//   const setPageSpecificCommands = useCallback((commands: string[]) => {
//     pageSpecificCommandsRef.current = commands;
//   }, []);

//   return { isListening, status, startListening, stopListening, setPageSpecificCommands };
// };


// "use client";

// import { useState, useRef, useCallback } from 'react';
// import { useRouter } from 'next/navigation';

// // --- Interface definitions ---
// interface WebsiteCommandPayload {
//   action: 'scroll' | 'navigate' | 'read' | 'unknown' | 'click' | 'goToPage' | 'fillInput';
//   target: string | null;
//   direction?: 'up' | 'down' | 'top' | 'bottom' | null;
//   value?: string;
// }
// interface GeneralAnswerPayload {
//   text_to_speak: string;
// }
// interface HelpActionPayload {
//   status: 'success' | 'failed';
// }
// interface PlayGamePayload {
//   name: string;
//   url: string;
// }
// interface ApiResponse {
//   type: 'WEBSITE_COMMAND' | 'GENERAL_ANSWER' | 'HELP_ACTION' | 'PLAY_GAME';
//   payload: WebsiteCommandPayload | GeneralAnswerPayload | HelpActionPayload | PlayGamePayload;
// }
// declare global {
//   interface Window {
//     webkitSpeechRecognition: any;
//   }
// }

// // --- Helper Functions ---
// const speakFeedback = (text: string) => {
//   if ('speechSynthesis' in window) {
//     speechSynthesis.cancel();
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.rate = 0.9;
//     utterance.pitch = 1.1;
//     speechSynthesis.speak(utterance);
//   }
// };

// const getUserLocation = (): Promise<{ latitude: number; longitude: number } | null> => {
//   return new Promise((resolve) => {
//     if (!navigator.geolocation) {
//       console.error("Geolocation is not supported by this browser.");
//       resolve(null);
//     }
//     navigator.geolocation.getCurrentPosition(
//       (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
//       () => { console.error("Failed to get user location."); resolve(null); }
//     );
//   });
// };

// const findElementByTextAndClick = (text: string): boolean => {
//   if (!text) return false;
//   const sanitizedText = text.trim().toLowerCase();
//   const elements = document.querySelectorAll('a, button, [role="button"], [role="link"]');
//   for (const element of Array.from(elements)) {
//     if (element.textContent?.trim().toLowerCase() === sanitizedText) {
//       (element as HTMLElement).click();
//       return true;
//     }
//   }
//   return false;
// };

// // The most robust version of the input filler
// const findInputByLabelAndFill = (labelText: string, value: string): boolean => {
//     if (!labelText || value === undefined) return false;
//     const sanitizedLabel = labelText.trim().toLowerCase();
    
//     const fillAndDispatch = (input: HTMLInputElement | HTMLTextAreaElement) => {
//         // Use the native value setter to bypass React's virtual DOM comparison
//         const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
//             window.HTMLInputElement.prototype,
//             "value"
//         )?.set;
        
//         if (nativeInputValueSetter) {
//             nativeInputValueSetter.call(input, value);
//         } else {
//             // Fallback for older browsers or textareas
//             input.value = value;
//         }

//         // Dispatch both 'input' and 'change' events to ensure all libraries (React, Formik, etc.) are notified.
//         const inputEvent = new Event('input', { bubbles: true, cancelable: true });
//         const changeEvent = new Event('change', { bubbles: true, cancelable: true });
//         input.dispatchEvent(inputEvent);
//         input.dispatchEvent(changeEvent);
//     };

//     const labels = document.querySelectorAll('label');
//     for (const label of Array.from(labels)) {
//         if (label.textContent?.trim().toLowerCase().includes(sanitizedLabel)) {
//             const inputId = label.getAttribute('for');
//             const input = inputId ? document.getElementById(inputId) as HTMLInputElement | HTMLTextAreaElement : null;
//             if (input) {
//                 fillAndDispatch(input);
//                 return true;
//             }
//         }
//     }
//     const inputs = document.querySelectorAll('input, textarea');
//     for (const input of Array.from(inputs)) {
//         const ariaLabel = input.getAttribute('aria-label')?.toLowerCase();
//         const placeholder = input.getAttribute('placeholder')?.toLowerCase();
//         if (ariaLabel?.includes(sanitizedLabel) || placeholder?.includes(sanitizedLabel)) {
//             fillAndDispatch(input as HTMLInputElement);
//             return true;
//         }
//     }
//     return false;
// };


// export const useVoiceControl = () => {
//   const router = useRouter();
//   const [isListening, setIsListening] = useState(false);
//   const [status, setStatus] = useState('Click the mic to start');

//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const isProcessingRef = useRef(false);
//   const pageSpecificCommandsRef = useRef<string[]>([]);
//   const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

//   // --- Core logic is wrapped in useCallback to prevent re-creation on re-renders ---
//   const handleApiResponse = useCallback((response: ApiResponse) => {
//     if (response.type === 'WEBSITE_COMMAND') {
//       const command = response.payload as WebsiteCommandPayload;
//       setStatus(`Command: ${command.action}`);
//       switch (command.action) {
//         case 'scroll':
//           if (command.direction === 'down') { window.scrollBy({ top: 500, behavior: 'smooth' }); speakFeedback("Scrolling down."); }
//           else if (command.direction === 'up') { window.scrollBy({ top: -500, behavior: 'smooth' }); speakFeedback("Scrolling up."); }
//           else if (command.direction === 'top') { window.scrollTo({ top: 0, behavior: 'smooth' }); speakFeedback("Scrolling to top."); }
//           else if (command.direction === 'bottom') { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); speakFeedback("Scrolling to bottom."); }
//           break;
//         case 'navigate':
//           if (command.target) {
//             const element = document.getElementById(command.target);
//             if (element) { element.scrollIntoView({ behavior: 'smooth', block: 'start' }); speakFeedback(`Navigating to ${command.target}.`); }
//             else { speakFeedback(`Sorry, I could not find the ${command.target} section.`); }
//           }
//           break;
//         case 'read':
//           if (command.target) {
//             const element = document.getElementById(command.target);
//             if (element) {
//               speakFeedback(`Reading the ${command.target} section.`);
//               setTimeout(() => speakFeedback(element.innerText || element.textContent || "This section is empty."), 1500);
//             } else { speakFeedback(`Sorry, I could not find the ${command.target} section to read.`); }
//           }
//           break;
//         case 'goToPage':
//           if (command.target) {
//             speakFeedback(`Going to the ${command.target.replace('/', '')} page.`);
//             router.push(command.target);
//           }
//           break;
//         case 'click':
//           if (command.target) {
//             const success = findElementByTextAndClick(command.target);
//             if (success) { speakFeedback(`Clicked ${command.target}.`); }
//             else { speakFeedback(`Sorry, I could not find an element to click with the text ${command.target}.`); }
//           }
//           break;
//         case 'fillInput':
//           if (command.target && command.value !== undefined) {
//             const success = findInputByLabelAndFill(command.target, command.value);
//             if (success) { speakFeedback(`Okay, I've filled the ${command.target} field.`); }
//             else { speakFeedback(`Sorry, I could not find a form field for ${command.target}.`); }
//           }
//           break;
//         case 'unknown':
//           speakFeedback("Sorry, I didn't understand that command.");
//           break;
//       }
//     } else if (response.type === 'GENERAL_ANSWER') {
//       const answer = response.payload as GeneralAnswerPayload;
//       setStatus('Answering question...');
//       speakFeedback(answer.text_to_speak);
//     } else if (response.type === 'HELP_ACTION') {
//       const helpAction = response.payload as HelpActionPayload;
//       if (helpAction.status === 'success') {
//         setStatus('Emergency email sent.');
//         speakFeedback('Emergency email has been sent with your location.');
//       } else {
//         setStatus('Failed to send email.');
//         speakFeedback('Sorry, there was a problem sending the emergency email.');
//       }
//     }
//   }, [router]);

//   const processVoiceCommand = useCallback(async (speechText: string) => {
//     if (isProcessingRef.current) return;
//     isProcessingRef.current = true;
//     setStatus('Processing...');
//     const isHelpCommand = speechText.toLowerCase().includes('help') || speechText.toLowerCase().includes('mayday');
//     let location = null;
//     if (isHelpCommand) {
//       speakFeedback("Sending emergency signal. Getting your location...");
//       location = await getUserLocation();
//       if (!location) {
//         speakFeedback("Could not get your location. Sending email without location.");
//       }
//     }
//     try {
//       const response = await fetch(`${API_URL}/process-command`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ text: speechText, page_commands: pageSpecificCommandsRef.current, location: location })
//       });
//       if (!response.ok) throw new Error(`Server error: ${response.status}`);
//       const data: ApiResponse = await response.json();
//       handleApiResponse(data);
//     } catch (error) {
//       console.error('Error processing command:', error);
//       setStatus('Error connecting to backend.');
//       speakFeedback("I'm having trouble connecting to my brain right now.");
//     } finally {
//       setTimeout(() => {
//         isProcessingRef.current = false;
//         if (isListening) setStatus('Listening...');
//       }, 2000);
//     }
//   }, [handleApiResponse, isListening, API_URL]);

//   const startListening = useCallback(() => {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) { return; }
//     const recognition = new SpeechRecognition();
//     recognition.continuous = true;
//     recognition.interimResults = false;
//     recognition.lang = 'en-US';
//     recognition.onstart = () => setIsListening(true);
//     recognition.onresult = (event: SpeechRecognitionEvent) => {
//       const transcript = event.results[event.results.length - 1][0].transcript.trim();
//       processVoiceCommand(transcript);
//     };
//     recognition.onend = () => { if (recognitionRef.current) { recognition.start(); } };
//     recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
//       console.error("Speech recognition error", event.error);
//       setStatus(`Error: ${event.error}`);
//     };
//     recognition.start();
//     recognitionRef.current = recognition;
//   }, [processVoiceCommand]);

//   const stopListening = useCallback(() => {
//     if (recognitionRef.current) {
//       speechSynthesis.cancel();
//       recognitionRef.current.stop();
//       recognitionRef.current = null;
//       setIsListening(false);
//       setStatus('Click the mic to start');
//     }
//   }, []);

//   const setPageSpecificCommands = useCallback((commands: string[]) => {
//     pageSpecificCommandsRef.current = commands;
//   }, []);

//   return { isListening, status, startListening, stopListening, setPageSpecificCommands };
// };

// "use client";

// import { useState, useRef, useCallback } from 'react';
// import { useRouter } from 'next/navigation';

// // --- Interface definitions ---
// interface WebsiteCommandPayload {
//   action: 'scroll' | 'navigate' | 'read' | 'unknown' | 'click' | 'goToPage' | 'fillInput';
//   target: string | null;
//   direction?: 'up' | 'down' | 'top' | 'bottom' | null;
//   value?: string;
// }
// interface GeneralAnswerPayload {
//   text_to_speak: string;
// }
// interface HelpActionPayload {
//   status: 'success' | 'failed';
// }
// interface PlayGamePayload {
//   name: string;
//   url: string;
// }
// interface ApiResponse {
//   type: 'WEBSITE_COMMAND' | 'GENERAL_ANSWER' | 'HELP_ACTION' | 'PLAY_GAME';
//   payload: WebsiteCommandPayload | GeneralAnswerPayload | HelpActionPayload | PlayGamePayload;
// }
// declare global {
//   interface Window {
//     webkitSpeechRecognition: any;
//   }
// }

// // --- Helper Functions (Unchanged) ---
// const speakFeedback = (text: string) => {
//   if ('speechSynthesis' in window) {
//     speechSynthesis.cancel();
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.rate = 0.9;
//     utterance.pitch = 1.1;
//     speechSynthesis.speak(utterance);
//   }
// };

// const getUserLocation = (): Promise<{ latitude: number; longitude: number } | null> => {
//   return new Promise((resolve) => {
//     if (!navigator.geolocation) {
//       console.error("Geolocation is not supported by this browser.");
//       resolve(null);
//     }
//     navigator.geolocation.getCurrentPosition(
//       (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
//       () => { console.error("Failed to get user location."); resolve(null); }
//     );
//   });
// };

// const findElementByTextAndClick = (text: string): boolean => {
//   if (!text) return false;
//   const sanitizedText = text.trim().toLowerCase();
//   const elements = document.querySelectorAll('a, button, [role="button"], [role="link"]');
//   for (const element of Array.from(elements)) {
//     if (element.textContent?.trim().toLowerCase() === sanitizedText) {
//       (element as HTMLElement).click();
//       return true;
//     }
//   }
//   return false;
// };

// const findInputByLabelAndFill = (labelText: string, value: string): boolean => {
//     if (!labelText || value === undefined) return false;
//     const sanitizedLabel = labelText.trim().toLowerCase();
    
//     const fillAndDispatch = (input: HTMLInputElement | HTMLTextAreaElement) => {
//         const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
//             window.HTMLInputElement.prototype, "value"
//         )?.set;
//         if (nativeInputValueSetter) {
//             nativeInputValueSetter.call(input, value);
//         } else {
//             input.value = value;
//         }
//         const inputEvent = new Event('input', { bubbles: true, cancelable: true });
//         const changeEvent = new Event('change', { bubbles: true, cancelable: true });
//         input.dispatchEvent(inputEvent);
//         input.dispatchEvent(changeEvent);
//     };

//     const labels = document.querySelectorAll('label');
//     for (const label of Array.from(labels)) {
//         if (label.textContent?.trim().toLowerCase().includes(sanitizedLabel)) {
//             const inputId = label.getAttribute('for');
//             const input = inputId ? document.getElementById(inputId) as HTMLInputElement | HTMLTextAreaElement : null;
//             if (input) {
//                 fillAndDispatch(input);
//                 return true;
//             }
//         }
//     }
//     const inputs = document.querySelectorAll('input, textarea');
//     for (const input of Array.from(inputs)) {
//         const ariaLabel = input.getAttribute('aria-label')?.toLowerCase();
//         const placeholder = input.getAttribute('placeholder')?.toLowerCase();
//         if (ariaLabel?.includes(sanitizedLabel) || placeholder?.includes(sanitizedLabel)) {
//             fillAndDispatch(input as HTMLInputElement);
//             return true;
//         }
//     }
//     return false;
// };


// export const useVoiceControl = () => {
//   const router = useRouter();
//   const [isListening, setIsListening] = useState(false);
//   const [status, setStatus] = useState('Click the mic to start');

//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const isProcessingRef = useRef(false);
//   const pageSpecificCommandsRef = useRef<string[]>([]);
//   const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

//   const handleApiResponse = useCallback((response: ApiResponse) => {
//     // --- THIS IS THE FIX ---
//     // The console.log statement has been added back here.
//     console.log("Handling API Response:", response);
//     // ----------------------

//     if (response.type === 'WEBSITE_COMMAND') {
//       const command = response.payload as WebsiteCommandPayload;
//       setStatus(`Command: ${command.action}`);
//       switch (command.action) {
//         case 'scroll':
//           if (command.direction === 'down') { window.scrollBy({ top: 500, behavior: 'smooth' }); speakFeedback("Scrolling down."); }
//           else if (command.direction === 'up') { window.scrollBy({ top: -500, behavior: 'smooth' }); speakFeedback("Scrolling up."); }
//           else if (command.direction === 'top') { window.scrollTo({ top: 0, behavior: 'smooth' }); speakFeedback("Scrolling to top."); }
//           else if (command.direction === 'bottom') { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); speakFeedback("Scrolling to bottom."); }
//           break;
//         case 'navigate':
//           if (command.target) {
//             const element = document.getElementById(command.target);
//             if (element) { element.scrollIntoView({ behavior: 'smooth', block: 'start' }); speakFeedback(`Navigating to ${command.target}.`); }
//             else { speakFeedback(`Sorry, I could not find the ${command.target} section.`); }
//           }
//           break;
//         case 'read':
//           if (command.target) {
//             const element = document.getElementById(command.target);
//             if (element) {
//               speakFeedback(`Reading the ${command.target} section.`);
//               setTimeout(() => speakFeedback(element.innerText || element.textContent || "This section is empty."), 1500);
//             } else { speakFeedback(`Sorry, I could not find the ${command.target} section to read.`); }
//           }
//           break;
//         case 'goToPage':
//           if (command.target) {
//             speakFeedback(`Going to the ${command.target.replace('/', '')} page.`);
//             router.push(command.target);
//           }
//           break;
//         case 'click':
//           if (command.target) {
//             const success = findElementByTextAndClick(command.target);
//             if (success) { speakFeedback(`Clicked ${command.target}.`); }
//             else { speakFeedback(`Sorry, I could not find an element to click with the text ${command.target}.`); }
//           }
//           break;
//         case 'fillInput':
//           if (command.target && command.value !== undefined) {
//             const success = findInputByLabelAndFill(command.target, command.value);
//             if (success) { speakFeedback(`Okay, I've filled the ${command.target} field.`); }
//             else { speakFeedback(`Sorry, I could not find a form field for ${command.target}.`); }
//           }
//           break;
//         case 'unknown':
//           speakFeedback("Sorry, I didn't understand that command.");
//           break;
//       }
//     } else if (response.type === 'GENERAL_ANSWER') {
//       const answer = response.payload as GeneralAnswerPayload;
//       setStatus('Answering question...');
//       speakFeedback(answer.text_to_speak);
//     } else if (response.type === 'HELP_ACTION') {
//       const helpAction = response.payload as HelpActionPayload;
//       if (helpAction.status === 'success') {
//         setStatus('Emergency email sent.');
//         speakFeedback('Emergency email has been sent with your location.');
//       } else {
//         setStatus('Failed to send email.');
//         speakFeedback('Sorry, there was a problem sending the emergency email.');
//       }
//     }
//   }, [router]);

//   const processVoiceCommand = useCallback(async (speechText: string) => {
//     if (isProcessingRef.current) return;
//     isProcessingRef.current = true;
//     setStatus('Processing...');
//     const isHelpCommand = speechText.toLowerCase().includes('help') || speechText.toLowerCase().includes('mayday');
//     let location = null;
//     if (isHelpCommand) {
//       speakFeedback("Sending emergency signal. Getting your location...");
//       location = await getUserLocation();
//       if (!location) {
//         speakFeedback("Could not get your location. Please enable location permissions. Sending email without location.");
//       }
//     }
//     try {
//       const response = await fetch(`${API_URL}/process-command`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ text: speechText, page_commands: pageSpecificCommandsRef.current, location: location })
//       });
//       if (!response.ok) throw new Error(`Server error: ${response.status}`);
//       const data: ApiResponse = await response.json();
//       handleApiResponse(data);
//     } catch (error) {
//       console.error('Error processing command:', error);
//       setStatus('Error connecting to backend.');
//       speakFeedback("I'm having trouble connecting to my brain right now.");
//     } finally {
//       setTimeout(() => {
//         isProcessingRef.current = false;
//         if (isListening) setStatus('Listening...');
//       }, 2000);
//     }
//   }, [handleApiResponse, isListening, API_URL]);

//   const startListening = useCallback(() => {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) { return; }
//     const recognition = new SpeechRecognition();
//     recognition.continuous = true;
//     recognition.interimResults = false;
//     recognition.lang = 'en-US';
//     recognition.onstart = () => setIsListening(true);
//     recognition.onresult = (event: SpeechRecognitionEvent) => {
//       const transcript = event.results[event.results.length - 1][0].transcript.trim();
//       processVoiceCommand(transcript);
//     };
//     recognition.onend = () => { if (recognitionRef.current) { recognition.start(); } };
//     recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
//       console.error("Speech recognition error", event.error);
//       setStatus(`Error: ${event.error}`);
//     };
//     recognition.start();
//     recognitionRef.current = recognition;
//   }, [processVoiceCommand]);

//   const stopListening = useCallback(() => {
//     if (recognitionRef.current) {
//       speechSynthesis.cancel();
//       recognitionRef.current.stop();
//       recognitionRef.current = null;
//       setIsListening(false);
//       setStatus('Click the mic to start');
//     }
//   }, []);

//   const setPageSpecificCommands = useCallback((commands: string[]) => {
//     pageSpecificCommandsRef.current = commands;
//   }, []);

//   return { isListening, status, startListening, stopListening, setPageSpecificCommands };
// };

"use client";

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// --- Interface definitions ---
interface WebsiteCommandPayload {
  action: 'scroll' | 'navigate' | 'read' | 'unknown' | 'click' | 'goToPage' | 'fillInput';
  target: string | null;
  direction?: 'up' | 'down' | 'top' | 'bottom' | null;
  value?: string;
}
interface GeneralAnswerPayload {
  text_to_speak: string;
}
interface HelpActionPayload {
  status: 'success' | 'failed';
}
interface PlayGamePayload {
  name: string;
  url: string;
}
interface ApiResponse {
  type: 'WEBSITE_COMMAND' | 'GENERAL_ANSWER' | 'HELP_ACTION' | 'PLAY_GAME';
  payload: WebsiteCommandPayload | GeneralAnswerPayload | HelpActionPayload | PlayGamePayload;
}
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

// --- Helper Functions (Unchanged) ---
const speakFeedback = (text: string) => {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    speechSynthesis.speak(utterance);
  }
};

const getUserLocation = (): Promise<{ latitude: number; longitude: number } | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      resolve(null);
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => { console.error("Failed to get user location."); resolve(null); }
    );
  });
};

const findElementByTextAndClick = (text: string): boolean => {
  if (!text) return false;
  const sanitizedText = text.trim().toLowerCase();
  const elements = document.querySelectorAll('a, button, [role="button"], [role="link"]');
  for (const element of Array.from(elements)) {
    if (element.textContent?.trim().toLowerCase() === sanitizedText) {
      (element as HTMLElement).click();
      return true;
    }
  }
  return false;
};

const findInputByLabelAndFill = (labelText: string, value: string): boolean => {
    if (!labelText || value === undefined) return false;
    const sanitizedLabel = labelText.trim().toLowerCase();
    
    const fillAndDispatch = (input: HTMLInputElement | HTMLTextAreaElement) => {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, "value"
        )?.set;
        if (nativeInputValueSetter) {
            nativeInputValueSetter.call(input, value);
        } else {
            input.value = value;
        }
        const inputEvent = new Event('input', { bubbles: true, cancelable: true });
        const changeEvent = new Event('change', { bubbles: true, cancelable: true });
        input.dispatchEvent(inputEvent);
        input.dispatchEvent(changeEvent);
    };

    const labels = document.querySelectorAll('label');
    for (const label of Array.from(labels)) {
        if (label.textContent?.trim().toLowerCase().includes(sanitizedLabel)) {
            const inputId = label.getAttribute('for');
            const input = inputId ? document.getElementById(inputId) as HTMLInputElement | HTMLTextAreaElement : null;
            if (input) {
                fillAndDispatch(input);
                return true;
            }
        }
    }
    const inputs = document.querySelectorAll('input, textarea');
    for (const input of Array.from(inputs)) {
        const ariaLabel = input.getAttribute('aria-label')?.toLowerCase();
        const placeholder = input.getAttribute('placeholder')?.toLowerCase();
        if (ariaLabel?.includes(sanitizedLabel) || placeholder?.includes(sanitizedLabel)) {
            fillAndDispatch(input as HTMLInputElement);
            return true;
        }
    }
    return false;
};


export const useVoiceControl = () => {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('Click the mic to start');

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isProcessingRef = useRef(false);
  const pageSpecificCommandsRef = useRef<string[]>([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

  const handleApiResponse = useCallback((response: ApiResponse) => {
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
        case 'goToPage':
          if (command.target) {
            speakFeedback(`Going to the ${command.target.replace('/', '')} page.`);
            router.push(command.target);
          }
          break;
        case 'click':
          if (command.target) {
            const success = findElementByTextAndClick(command.target);
            if (success) { speakFeedback(`Clicked ${command.target}.`); }
            else { speakFeedback(`Sorry, I could not find an element to click with the text ${command.target}.`); }
          }
          break;
        case 'fillInput':
          if (command.target && command.value !== undefined) {
            const success = findInputByLabelAndFill(command.target, command.value);
            if (success) { speakFeedback(`Okay, I've filled the ${command.target} field.`); }
            else { speakFeedback(`Sorry, I could not find a form field for ${command.target}.`); }
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
    } else if (response.type === 'HELP_ACTION') {
      const helpAction = response.payload as HelpActionPayload;
      if (helpAction.status === 'success') {
        setStatus('Emergency alerts sent.');
        // --- UPDATED MESSAGE ---
        speakFeedback('Emergency alerts have been sent via email and SMS with your location.');
      } else {
        setStatus('Failed to send alerts.');
        // --- UPDATED MESSAGE ---
        speakFeedback('Sorry, there was a problem sending the emergency alerts.');
      }
    }
  }, [router]);

  const processVoiceCommand = useCallback(async (speechText: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setStatus('Processing...');
    const isHelpCommand = speechText.toLowerCase().includes('help') || speechText.toLowerCase().includes('mayday');
    let location = null;
    if (isHelpCommand) {
      // --- UPDATED MESSAGE ---
      speakFeedback("Sending emergency alerts. Getting your location...");
      location = await getUserLocation();
      if (!location) {
        speakFeedback("Could not get your location. Please enable location permissions. Sending alerts without location.");
      }
    }
    try {
      const response = await fetch(`${API_URL}/process-command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: speechText, page_commands: pageSpecificCommandsRef.current, location: location })
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data: ApiResponse = await response.json();
      handleApiResponse(data);
    } catch (error) {
      console.error('Error processing command:', error);
      setStatus('Error connecting to backend.');
      speakFeedback("I'm having trouble connecting to my brain right now.");
    } finally {
      setTimeout(() => {
        isProcessingRef.current = false;
        if (isListening) setStatus('Listening...');
      }, 2000);
    }
  }, [handleApiResponse, isListening, API_URL]);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { return; }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      processVoiceCommand(transcript);
    };
    recognition.onend = () => { if (recognitionRef.current) { recognition.start(); } };
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error", event.error);
      setStatus(`Error: ${event.error}`);
    };
    recognition.start();
    recognitionRef.current = recognition;
  }, [processVoiceCommand]);

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

