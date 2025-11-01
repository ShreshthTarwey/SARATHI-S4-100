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
//         setStatus('Emergency alerts sent.');
//         // --- UPDATED MESSAGE ---
//         speakFeedback('Emergency alerts have been sent via email and SMS with your location.');
//       } else {
//         setStatus('Failed to send alerts.');
//         // --- UPDATED MESSAGE ---
//         speakFeedback('Sorry, there was a problem sending the emergency alerts.');
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
//       // --- UPDATED MESSAGE ---
//       speakFeedback("Sending emergency alerts. Getting your location...");
//       location = await getUserLocation();
//       if (!location) {
//         speakFeedback("Could not get your location. Please enable location permissions. Sending alerts without location.");
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

// // 1. ADDED: Import useRouter for "Fast Path" navigation
// import { useState, useRef, useCallback } from 'react';
// import { useRouter } from 'next/navigation';

// // --- Interface definitions are UNCHANGED ---
// interface WebsiteCommandPayload {
//   action: 'scroll' | 'navigate' | 'read' | 'unknown';
//   target: string | null;
//   direction: 'up' | 'down' | 'top' | 'bottom' | null;
// }
// interface GeneralAnswerPayload {
//     text_to_speak: string;
// }
// interface HelpActionPayload {
//     status: 'success' | 'failed';
// }
// interface ApiResponse {
//     type: 'WEBSITE_COMMAND' | 'GENERAL_ANSWER' | 'HELP_ACTION';
//     payload: WebsiteCommandPayload | GeneralAnswerPayload | HelpActionPayload;
// }
// declare global {
//     interface Window {
//       webkitSpeechRecognition: any;
//     }
// }

// // --- Helper functions are UNCHANGED ---
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
//                 console.error("Failed to get user location or permission denied.");
//                 resolve(null);
//             }
//         );
//     });
// };

// // 2. ADDED: Helper function to find and click elements by text
// // This is needed for our "Fast Path" click commands
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

// // 3. ADDED: Helper function to find and fill inputs by text
// // This is needed for our "Fast Path" form-filling commands
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
//   const [isListening, setIsListening] = useState(false);
//   const [status, setStatus] = useState('Click the mic to start');
  
//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const isProcessingRef = useRef(false);
//   const pageSpecificCommandsRef = useRef<string[]>([]);
//   const API_URL = process.env.NEXT_PUBLIC_API_URL;
  
//   // 4. ADDED: Initialize the Next.js router
//   const router = useRouter(); 

//   // --- handleApiResponse function is UNCHANGED ---
//   // This will still handle all responses from your AI backend (the "Smart Path")
//   const handleApiResponse = useCallback((response: ApiResponse) => {
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
//     else if (response.type === 'HELP_ACTION') {
//         const helpAction = response.payload as HelpActionPayload;
//         if (helpAction.status === 'success') {
//             setStatus('Emergency email sent.');
//             speakFeedback('Emergency alerts have been sent via email and SMS with your location.');
//         } else {
//             setStatus('Failed to send email.');
//             speakFeedback('Sorry, there was a problem sending the emergency alerts.');
//         }
//     }
//   }, []); // Removed router from dependencies as it's not used here

  
//   // --- 5. UPDATED: processVoiceCommand now contains the "Fast Path" logic ---
//   const processVoiceCommand = useCallback(async (speechText: string) => {
//     if (isProcessingRef.current) return;
//     isProcessingRef.current = true;
//     setStatus('Processing...');
    
//     const normalizedText = speechText.toLowerCase().trim();
//     let commandHandled = true; // Assume we will handle it on the fast path

//     // --- FAST PATH ---
//     // Try to match simple, high-speed commands locally first
    
//     if (normalizedText === "scroll down") {
//         window.scrollBy({ top: 500, behavior: 'smooth' });
//         speakFeedback("Scrolling down.");
//     } else if (normalizedText === "scroll up") {
//         window.scrollBy({ top: -500, behavior: 'smooth' });
//         speakFeedback("Scrolling up.");
//     } else if (normalizedText === "scroll to top" || normalizedText === "go to top") {
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//         speakFeedback("Scrolling to top.");
//     } else if (normalizedText === "scroll to bottom" || normalizedText === "go to bottom") {
//         window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
//         speakFeedback("Scrolling to bottom.");
//     } 
//     // Navigation
//     else if (normalizedText === "go to communication" || normalizedText === "go to communication page") {
//         router.push('/communication');
//         speakFeedback("Going to Communication.");
//     } else if (normalizedText === "go to education" || normalizedText === "go to education page") {
//         router.push('/education');
//         speakFeedback("Going to Education.");
//     } else if (normalizedText === "go to stories" || normalizedText === "go to stories page") {
//         router.push('/stories');
//         speakFeedback("Going to Stories.");
//     } else if (normalizedText === "go to mission" || normalizedText === "go to mission page") {
//         router.push('/mission');
//         speakFeedback("Going to Mission.");
//     }
//     // Clicks
//     else if (normalizedText === "click profile") {
//         findElementByTextAndClick("Profile");
//         speakFeedback("Clicked Profile.");
//     } else if (normalizedText === "click log out" || normalizedText === "click logout") {
//         findElementByTextAndClick("Logout");
//         speakFeedback("Clicked Logout.");
//     } else if (normalizedText === "click create account") {
//         findElementByTextAndClick("Create Account");
//         speakFeedback("Clicked Create Account.");
//     }
//     // Form Filling
//     else if (normalizedText.startsWith("my name is ")) {
//         const name = speechText.substring(11); // Get text after "my name is "
//         findInputByLabelAndFill("Full Name", name);
//         speakFeedback(`Setting name to ${name}.`);
//     } else if (normalizedText.startsWith("my email is ")) {
//         const email = speechText.substring(12).replace(/ at /g, '@').replace(/ dot /g, '.').replace(/\s/g, '');
//         findInputByLabelAndFill("Email Address", email);
//         speakFeedback(`Setting email.`);
//     } else if (normalizedText.startsWith("set password to ")) {
//         const password = speechText.substring(16);
//         findInputByLabelAndFill("Password", password);
//         speakFeedback("Setting password.");
//     } else if (normalizedText.startsWith("confirm password ") || normalizedText.startsWith("confirm password to ")) {
//         const password = speechText.substring(speechText.indexOf("to ") + 3);
//         findInputByLabelAndFill("Confirm Password", password);
//         speakFeedback("Confirming password.");
//     }
//     else {
//         // Command was not on the fast path
//         commandHandled = false;
//     }

//     // --- SMART PATH ---
//     // If no fast command was matched, we fall back to the AI backend.
//     if (!commandHandled) {
//         const isHelpCommand = normalizedText.includes('help') || normalizedText.includes('mayday');
//         let location = null;
        
//         if (isHelpCommand) {
//             speakFeedback("Sending emergency alerts. Getting your location...");
//             location = await getUserLocation();
//             if (!location) {
//                 speakFeedback("Could not get your location. Sending alerts without location.");
//             }
//         }

//         try {
//             const response = await fetch(`${API_URL}/process-command`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ 
//                     text: speechText,
//                     page_commands: pageSpecificCommandsRef.current,
//                     location: location
//                 })
//             });
//             if (!response.ok) throw new Error(`Server error: ${response.status}`);
//             const data: ApiResponse = await response.json();
//             handleApiResponse(data); // The AI's response is handled here
//         } catch (error) {
//             console.error('Error processing command:', error);
//             setStatus('Error connecting to backend.');
//             speakFeedback("I'm having trouble connecting to my brain right now.");
//         }
//     }

//     // This 'finally' block now runs after EITHER the fast path or smart path
//     setTimeout(() => {
//         isProcessingRef.current = false;
//         if(isListening) setStatus('Listening...');
//     }, 1000); // 1-second cooldown for all commands

//   }, [handleApiResponse, isListening, API_URL, router]); // Added router

  
//   // --- The rest of the functions are UNCHANGED ---

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
//       pageSpecificCommandsRef.current = commands;
//   }, []);

//   return { isListening, status, startListening, stopListening, setPageSpecificCommands };
// };

// "use client";

// import { useState, useRef, useCallback } from 'react';
// import { useRouter } from 'next/navigation';

// // --- Interface definitions are UNCHANGED ---
// interface WebsiteCommandPayload {
//   action: 'scroll' | 'navigate' | 'read' | 'unknown';
//   target: string | null;
//   direction: 'up' | 'down' | 'top' | 'bottom' | null;
// }
// interface GeneralAnswerPayload {
//     text_to_speak: string;
// }
// interface HelpActionPayload {
//     status: 'success' | 'failed';
// }
// interface ApiResponse {
//     type: 'WEBSITE_COMMAND' | 'GENERAL_ANSWER' | 'HELP_ACTION';
//     payload: WebsiteCommandPayload | GeneralAnswerPayload | HelpActionPayload;
// }
// declare global {
//     interface Window {
//       webkitSpeechRecognition: any;
//     }
// }

// // --- Helper functions are UNCHANGED ---
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
//                 console.error("Failed to get user location or permission denied.");
//                 resolve(null);
//             }
//         );
//     });
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
//   const [isListening, setIsListening] = useState(false);
//   const [status, setStatus] = useState('Click the mic to start');
  
//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const isProcessingRef = useRef(false);
//   const pageSpecificCommandsRef = useRef<string[]>([]);
//   const API_URL = process.env.NEXT_PUBLIC_API_URL;
  
//   const router = useRouter(); 

//   const handleApiResponse = useCallback((response: ApiResponse) => {
//     console.log("Handling API Response:", response); // This log is for the "Smart Path"

//     if (response.type === 'WEBSITE_COMMAND') {
//         // ... (rest of the function is unchanged)
//     } else if (response.type === 'GENERAL_ANSWER') {
//         // ... (unchanged)
//     } 
//     else if (response.type === 'HELP_ACTION') {
//         // ... (unchanged)
//     }
//   }, []);

  
//   const processVoiceCommand = useCallback(async (speechText: string) => {
//     if (isProcessingRef.current) return;
//     isProcessingRef.current = true;
//     setStatus('Processing...');
    
//     const normalizedText = speechText.toLowerCase().trim();
//     let commandHandled = true;

//     // --- 1. THIS IS THE NEW DEBUGGING LINE ---
//     console.log("User said (transcribed):", `"${normalizedText}"`);
//     // ----------------------------------------
    
//     // --- FAST PATH ---
//     if (normalizedText === "scroll down") {
//         window.scrollBy({ top: 500, behavior: 'smooth' });
//         speakFeedback("Scrolling down.");
//     } else if (normalizedText === "scroll up") {
//         window.scrollBy({ top: -500, behavior: 'smooth' });
//         speakFeedback("Scrolling up.");
//     } else if (normalizedText === "scroll to top" || normalizedText === "go to top") {
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//         speakFeedback("Scrolling to top.");
//     } else if (normalizedText === "scroll to bottom" || normalizedText === "go to bottom") {
//         window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
//         speakFeedback("Scrolling to bottom.");
//     } 
//     // Navigation
//     else if (normalizedText === "go to communication" || normalizedText === "go to communication page") {
//         router.push('/communication');
//         speakFeedback("Going to Communication.");
//     } else if (normalizedText === "go to education" || normalizedText === "go to education page") {
//         router.push('/education');
//         speakFeedback("Going to Education.");
//     } else if (normalizedText === "go to stories" || normalizedText === "go to stories page") {
//         router.push('/stories');
//         speakFeedback("Going to Stories.");
//     } else if (normalizedText === "go to mission" || normalizedText === "go to mission page") {
//         router.push('/mission');
//         speakFeedback("Going to Mission.");
//     }
//     // Clicks
//     else if (normalizedText === "click profile") {
//         findElementByTextAndClick("Profile");
//         speakFeedback("Clicked Profile.");
//     } else if (normalizedText === "click log out" || normalizedText === "click logout") {
//         findElementByTextAndClick("Logout");
//         speakFeedback("Clicked Logout.");
//     } else if (normalizedText === "click create account") {
//         findElementByTextAndClick("Create Account");
//         speakFeedback("Clicked Create Account.");
//     }
//     // Form Filling
//     else if (normalizedText.startsWith("my name is ")) {
//         const name = speechText.substring(11); // Get text after "my name is "
//         findInputByLabelAndFill("Full Name", name);
//         speakFeedback(`Setting name to ${name}.`);
//     } else if (normalizedText.startsWith("my email is ")) {
//         const email = speechText.substring(12).replace(/ at /g, '@').replace(/ dot /g, '.').replace(/\s/g, '');
//         findInputByLabelAndFill("Email Address", email);
//         speakFeedback(`Setting email.`);
//     } else if (normalizedText.startsWith("set password to ")) {
//         const password = speechText.substring(16);
//         findInputByLabelAndFill("Password", password);
//         speakFeedback("Setting password.");
//     } else if (normalizedText.startsWith("confirm password ") || normalizedText.startsWith("confirm password to ")) {
//         const password = speechText.substring(speechText.indexOf("to ") + 3);
//         findInputByLabelAndFill("Confirm Password", password);
//         speakFeedback("Confirming password.");
//     }
//     else {
//         commandHandled = false;
//     }

//     // --- SMART PATH ---
//     if (!commandHandled) {
//         // ... (rest of the smart path logic is unchanged)
//     }

//     setTimeout(() => {
//         isProcessingRef.current = false;
//         if(isListening) setStatus('Listening...');
//     }, 1000); 

//   }, [handleApiResponse, isListening, API_URL, router]); 

  
//   // --- The rest of the functions are UNCHANGED ---

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
//       processVoiceCommand(transcript); // This now calls our updated function
//     };
//     recognition.onend = () => { if (recognitionRef.current) { recognition.start(); }};
//     recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
//         console.error("Speech recognition error", event.error); setStatus(`Error: ${event.error}`);
//     };
//     recognition.start();
//     recognitionRef.current = recognition;
//   }, [processVoiceCommand]);

//   const stopListening = useCallback(() => {
//     // ... (unchanged)
//   }, []);
  
//   const setPageSpecificCommands = useCallback((commands: string[]) => {
//     // ... (unchanged)
//   }, []);

//   return { isListening, status, startListening, stopListening, setPageSpecificCommands };
// };

// "use client";

// import { useState, useRef, useCallback, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// // --- Interface definitions ---
// interface WebsiteCommandPayload {
//   action: 'scroll' | 'navigate' | 'read' | 'unknown' | 'click' | 'goToPage' | 'fillInput';
//   target: string | null;
//   direction?: 'up' | 'down' | 'top' | 'bottom' | null;
//   value?: string;
// }
// interface GeneralAnswerPayload { text_to_speak: string; }
// interface HelpActionPayload { status: 'success' | 'failed'; }
// interface PlayGamePayload { name: string; url: string; }
// interface ApiResponse {
//   type: 'WEBSITE_COMMAND' | 'GENERAL_ANSWER' | 'HELP_ACTION' | 'PLAY_GAME';
//   payload: WebsiteCommandPayload | GeneralAnswerPayload | HelpActionPayload | PlayGamePayload;
// }
// declare global { interface Window { webkitSpeechRecognition: any; } }

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

// const findInputByLabelAndFill = (labelText: string, value: string): boolean => {
//     if (!labelText || value === undefined) return false;
//     const sanitizedLabel = labelText.trim().toLowerCase();
//     const fillAndDispatch = (input: HTMLInputElement | HTMLTextAreaElement) => {
//         const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
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
//             if (input) { fillAndDispatch(input); return true; }
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


// // --- Main Hook ---
// export const useVoiceControl = () => {
//   const [isListening, setIsListening] = useState(false);
//   const [status, setStatus] = useState('Click the mic to start');
  
//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const isProcessingRef = useRef(false);
//   const pageSpecificCommandsRef = useRef<string[]>([]);
//   const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
//   const router = useRouter(); 

//   const handleApiResponse = useCallback((response: ApiResponse) => {
//     console.log("Handling API Response:", response);
//     // ... (logic for handling API responses is unchanged) ...
//   }, []);

//   const processVoiceCommand = useCallback(async (speechText: string) => {
//     if (isProcessingRef.current) return;
//     isProcessingRef.current = true;
//     setStatus('Processing...');
    
//     const normalizedText = speechText.toLowerCase().trim();
//     let commandHandled = true;

//     // This is your requested debug log
//     console.log("User said (transcribed):", `"${normalizedText}"`);
    
//     // --- FAST PATH ---
//     if (normalizedText === "scroll down") {
//         window.scrollBy({ top: 500, behavior: 'smooth' });
//         speakFeedback("Scrolling down.");
//     } else if (normalizedText === "scroll up") {
//         window.scrollBy({ top: -500, behavior: 'smooth' });
//         speakFeedback("Scrolling up.");
//     } else if (normalizedText === "scroll to top" || normalizedText === "go to top") {
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//         speakFeedback("Scrolling to top.");
//     } else if (normalizedText === "scroll to bottom" || normalizedText === "go to bottom") {
//         window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
//         speakFeedback("Scrolling to bottom.");
//     } 
//     // ... (other fast path commands: navigation, clicks, form filling) ...
//     else {
//         commandHandled = false;
//     }

//     // --- SMART PATH ---
//     if (!commandHandled) {
//       const isHelpCommand = normalizedText.includes('help') || normalizedText.includes('mayday');
//       let location = null;
//       if (isHelpCommand) {
//           speakFeedback("Sending emergency alerts. Getting your location...");
//           location = await getUserLocation();
//           if (!location) {
//               speakFeedback("Could not get your location. Sending alerts without location.");
//           }
//       }
//       try {
//           const response = await fetch(`${API_URL}/process-command`, {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({ text: speechText, page_commands: pageSpecificCommandsRef.current, location: location })
//           });
//           if (!response.ok) throw new Error(`Server error: ${response.status}`);
//           const data: ApiResponse = await response.json();
//           handleApiResponse(data);
//       } catch (error) {
//           console.error('Error processing command:', error);
//           setStatus('Error connecting to backend.');
//           speakFeedback("I'm having trouble connecting to my brain right now.");
//       }
//     }

//     setTimeout(() => {
//         isProcessingRef.current = false;
//         if (recognitionRef.current) { // Only set status if still listening
//             setStatus('Listening...');
//         }
//     }, 1000); 

//   }, [handleApiResponse, API_URL, router]); 

//   // --- REBUILT LISTENING LOGIC ---

//   const startListening = () => {
//     if (isProcessingRef.current || isListening) {
//       return;
//     }

//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       alert("Browser doesn't support speech recognition.");
//       return;
//     }

//     // Create a new recognition instance
//     const recognition = new SpeechRecognition();
//     recognition.continuous = true;
//     recognition.interimResults = false; // Only give us final results
//     recognition.lang = 'en-US';

//     recognition.onstart = () => {
//       setIsListening(true);
//       setStatus('Listening...');
//     };

//     // This event fires when speech is detected and transcribed
//     recognition.onresult = (event: SpeechRecognitionEvent) => {
//       // Get the latest transcript
//       const transcript = event.results[event.results.length - 1][0].transcript.trim();
//       processVoiceCommand(transcript);
//     };

//     // This event fires when the recognition service ends
//     recognition.onend = () => {
//       setIsListening(false);
//       setStatus('Click the mic to start');
//       // We no longer auto-restart. The user must click again.
//       // This solves the "stuck" bug.
//       recognitionRef.current = null;
//     };

//     // This event fires on error
//     recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
//       console.error("Speech recognition error", event.error);
//       if (event.error === 'no-speech') {
//         // This is fine, just let it end and wait for the next click.
//       } else {
//         setStatus(`Error: ${event.error}`);
//       }
//     };
    
//     // Start listening
//     recognition.start();
//     recognitionRef.current = recognition;
//   };

//   const stopListening = () => {
//     if (recognitionRef.current) {
//       recognitionRef.current.stop(); // This will trigger onend
//       // onend will handle setting isListening to false
//     }
//   };

//   const setPageSpecificCommands = useCallback((commands: string[]) => {
//       pageSpecificCommandsRef.current = commands;
//   }, []);

//   return { isListening, status, startListening, stopListening, setPageSpecificCommands };
// };


// "use client";

// import { useState, useRef, useCallback, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// // --- Interface definitions ---
// interface WebsiteCommandPayload {
//   action: 'scroll' | 'navigate' | 'read' | 'unknown' | 'click' | 'goToPage' | 'fillInput';
//   target: string | null;
//   direction?: 'up' | 'down' | 'top' | 'bottom' | null;
//   value?: string;
// }
// interface GeneralAnswerPayload { text_to_speak: string; }
// interface HelpActionPayload { status: 'success' | 'failed'; }
// interface PlayGamePayload { name: string; url: string; }
// interface ApiResponse {
//   type: 'WEBSITE_COMMAND' | 'GENERAL_ANSWER' | 'HELP_ACTION' | 'PLAY_GAME';
//   payload: WebsiteCommandPayload | GeneralAnswerPayload | HelpActionPayload | PlayGamePayload;
// }
// declare global { interface Window { webkitSpeechRecognition: any; } }

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
//         const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
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
//             if (input) { fillAndDispatch(input); return true; }
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

// // --- Main Hook ---
// export const useVoiceControl = () => {
//   const [isListening, setIsListening] = useState(false);
//   const [status, setStatus] = useState('Click the mic to start');
  
//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const isProcessingRef = useRef(false);
//   const pageSpecificCommandsRef = useRef<string[]>([]);
//   // This ref is the key to fixing the "stuck button" bug.
//   // It tells the 'onend' event if it should restart or stay off.
//   const shouldBeListeningRef = useRef(false);
  
//   const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
//   const router = useRouter(); 

//   const handleApiResponse = useCallback((response: ApiResponse) => {
//     console.log("Handling API Response:", response);
//     // ... (logic for handling API responses is unchanged) ...
//   }, []);

//   const processVoiceCommand = useCallback(async (speechText: string) => {
//     if (isProcessingRef.current) return;
//     isProcessingRef.current = true;
//     setStatus('Processing...');
    
//     const normalizedText = speechText.toLowerCase().trim();
//     let commandHandled = true;

//     // Your requested debug log
//     console.log("User said (transcribed):", `"${normalizedText}"`);
    
//     // --- FAST PATH ---
//     if (normalizedText === "scroll down") {
//         window.scrollBy({ top: 500, behavior: 'smooth' });
//         speakFeedback("Scrolling down.");
//     } else if (normalizedText === "scroll up") {
//         window.scrollBy({ top: -500, behavior: 'smooth' });
//         speakFeedback("Scrolling up.");
//     } else if (normalizedText === "scroll to top" || normalizedText === "go to top") {
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//         speakFeedback("Scrolling to top.");
//     } else if (normalizedText === "scroll to bottom" || normalizedText === "go to bottom") {
//         window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
//         speakFeedback("Scrolling to bottom.");
//     } 
//     // Navigation
//     else if (normalizedText === "go to communication" || normalizedText === "go to communication page") {
//         router.push('/communication');
//         speakFeedback("Going to Communication.");
//     } else if (normalizedText === "go to education" || normalizedText === "go to education page") {
//         router.push('/education');
//         speakFeedback("Going to Education.");
//     } else if (normalizedText === "go to stories" || normalizedText === "go to stories page") {
//         router.push('/stories');
//         speakFeedback("Going to Stories.");
//     } else if (normalizedText === "go to mission" || normalizedText === "go to mission page") {
//         router.push('/mission');
//         speakFeedback("Going to Mission.");
//     }
//     // Clicks
//     else if (normalizedText === "click profile") {
//         findElementByTextAndClick("Profile");
//         speakFeedback("Clicked Profile.");
//     } else if (normalizedText === "click log out" || normalizedText === "click logout") {
//         findElementByTextAndClick("Logout");
//         speakFeedback("Clicked Logout.");
//     } else if (normalizedText === "click create account") {
//         findElementByTextAndClick("Create Account");
//         speakFeedback("Clicked Create Account.");
//     }
//     // Form Filling
//     else if (normalizedText.startsWith("my name is ")) {
//         const name = speechText.substring(11); // Get text after "my name is "
//         findInputByLabelAndFill("Full Name", name);
//         speakFeedback(`Setting name to ${name}.`);
//     } else if (normalizedText.startsWith("my email is ")) {
//         const email = speechText.substring(12).replace(/ at /g, '@').replace(/ dot /g, '.').replace(/\s/g, '');
//         findInputByLabelAndFill("Email Address", email);
//         speakFeedback(`Setting email.`);
//     } else if (normalizedText.startsWith("set password to ")) {
//         const password = speechText.substring(16);
//         findInputByLabelAndFill("Password", password);
//         speakFeedback("Setting password.");
//     } else if (normalizedText.startsWith("confirm password ") || normalizedText.startsWith("confirm password to ")) {
//         const password = speechText.substring(speechText.indexOf("to ") + 3);
//         findInputByLabelAndFill("Confirm Password", password);
//         speakFeedback("Confirming password.");
//     }
//     else {
//         commandHandled = false;
//     }

//     // --- SMART PATH ---
//     if (!commandHandled) {
//       const isHelpCommand = normalizedText.includes('help') || normalizedText.includes('mayday');
//       let location = null;
//       if (isHelpCommand) {
//           speakFeedback("Sending emergency alerts. Getting your location...");
//           location = await getUserLocation();
//           if (!location) {
//               speakFeedback("Could not get your location. Sending alerts without location.");
//           }
//       }
//       try {
//           const response = await fetch(`${API_URL}/process-command`, {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({ text: speechText, page_commands: pageSpecificCommandsRef.current, location: location })
//           });
//           if (!response.ok) throw new Error(`Server error: ${response.status}`);
//           const data: ApiResponse = await response.json();
//           handleApiResponse(data);
//       } catch (error) {
//           console.error('Error processing command:', error);
//           setStatus('Error connecting to backend.');
//           speakFeedback("I'm having trouble connecting to my brain right now.");
//       }
//     }

//     setTimeout(() => {
//         isProcessingRef.current = false;
//         // Don't reset status to "Listening..." here, let the onend handler do it
//     }, 1000); 

//   }, [handleApiResponse, API_URL, router]); 

//   // --- REBUILT AND STABLE LISTENING LOGIC ---

//   const startListening = useCallback(() => {
//     if (isListening) return; // Already listening

//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       alert("Browser doesn't support speech recognition.");
//       return;
//     }

//     // Create a new instance *every time* we start
//     const recognition = new SpeechRecognition();
//     recognition.continuous = true; // Stay on even after a pause
//     recognition.interimResults = false; // Only give us final results
//     recognition.lang = 'en-US';

//     recognitionRef.current = recognition; // Store the instance
//     shouldBeListeningRef.current = true; // We *want* it to be on
    
//     recognition.onstart = () => {
//       setIsListening(true);
//       setStatus('Listening...');
//     };

//     recognition.onresult = (event: SpeechRecognitionEvent) => {
//       // Get the latest transcript
//       const transcript = event.results[event.results.length - 1][0].transcript.trim();
//       processVoiceCommand(transcript);
//     };

//     recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
//       console.error("Speech recognition error", event.error);
//       if (event.error === 'no-speech') {
//         // This is a common browser timeout, the onend handler will fix it.
//       } else {
//         setStatus(`Error: ${event.error}`);
//       }
//     };
    
//     recognition.onend = () => {
//       // This is the "always-on" magic.
//       // If we are *supposed* to be listening (i.e., user didn't click stop),
//       // then restart the recognition service immediately.
//       if (shouldBeListeningRef.current) {
//         recognition.start();
//       } else {
//         // This happens if stopListening() was called
//         setIsListening(false);
//         setStatus('Click the mic to start');
//       }
//     };
    
//     recognition.start();

//   }, [processVoiceCommand]);

//   const stopListening = useCallback(() => {
//     if (!recognitionRef.current) return; // Already stopped

//     // This is the fix for the "stuck button".
//     // We tell our 'onend' handler: "Do NOT restart."
//     shouldBeListeningRef.current = false; 
    
//     recognitionRef.current.stop(); // This will trigger the 'onend' event
//     recognitionRef.current = null;
//     speechSynthesis.cancel();
    
//   }, []);
  
//   const setPageSpecificCommands = useCallback((commands: string[]) => {
//       pageSpecificCommandsRef.current = commands;
//   }, []);

//   return { isListening, status, startListening, stopListening, setPageSpecificCommands };
// };

// "use client";

// import { useState, useRef, useCallback, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// // --- Interface definitions ---
// interface WebsiteCommandPayload {
//   action: 'scroll' | 'navigate' | 'read' | 'unknown' | 'click' | 'goToPage' | 'fillInput';
//   target: string | null;
//   direction?: 'up' | 'down' | 'top' | 'bottom' | null;
//   value?: string;
// }
// interface GeneralAnswerPayload { text_to_speak: string; }
// interface HelpActionPayload { status: 'success' | 'failed'; }
// interface PlayGamePayload { name: string; url: string; }
// interface ApiResponse {
//   type: 'WEBSITE_COMMAND' | 'GENERAL_ANSWER' | 'HELP_ACTION' | 'PLAY_GAME';
//   payload: WebsiteCommandPayload | GeneralAnswerPayload | HelpActionPayload | PlayGamePayload;
// }
// declare global { interface Window { webkitSpeechRecognition: any; } }

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
//         const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
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
//             if (input) { fillAndDispatch(input); return true; }
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

// // --- Main Hook ---
// export const useVoiceControl = () => {
//   const [isListening, setIsListening] = useState(false);
//   const [status, setStatus] = useState('Click the mic to start');
  
//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const isProcessingRef = useRef(false);
//   const pageSpecificCommandsRef = useRef<string[]>([]);
//   const shouldBeListeningRef = useRef(false);
  
//   const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
//   const router = useRouter(); 

//   // --- THIS IS THE CRITICAL FIX ---
//   // The dependency array is no longer empty. It now includes 'router'.
//   const handleApiResponse = useCallback((response: ApiResponse) => {
//     console.log("Handling API Response:", response);
//     if (response.type === 'WEBSITE_COMMAND') {
//       const command = response.payload as WebsiteCommandPayload;
//       setStatus(`Command: ${command.action}`);
//       switch (command.action) {
//         // ... (all other cases like 'scroll', 'navigate', 'read', 'click', 'fillInput')
//         case 'goToPage':
//           if (command.target) {
//             speakFeedback(`Going to the ${command.target.replace('/', '')} page.`);
//             router.push(command.target); // This will now work!
//           }
//           break;
//         // ... (rest of the cases)
//       }
//     }
//     // ... (rest of the function is unchanged)
//   }, [router]); // <-- BUG FIXED: Added 'router' to the dependency array

//   const processVoiceCommand = useCallback(async (speechText: string) => {
//     if (isProcessingRef.current) return;
//     isProcessingRef.current = true;
//     setStatus('Processing...');
    
//     const normalizedText = speechText.toLowerCase().trim();
//     let commandHandled = true;

//     console.log("User said (transcribed):", `"${normalizedText}"`);
    
//     // --- FAST PATH ---
//     if (normalizedText === "scroll down") {
//         window.scrollBy({ top: 500, behavior: 'smooth' });
//         speakFeedback("Scrolling down.");
//     } else if (normalizedText === "scroll up") {
//         window.scrollBy({ top: -500, behavior: 'smooth' });
//         speakFeedback("Scrolling up.");
//     } else if (normalizedText === "scroll to top" || normalizedText === "go to top") {
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//         speakFeedback("Scrolling to top.");
//     } else if (normalizedText === "scroll to bottom" || normalizedText === "go to bottom") {
//         window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
//         speakFeedback("Scrolling to bottom.");
//     } 
//     // Navigation
//     else if (normalizedText === "go to communication" || normalizedText === "go to communication page") {
//         router.push('/communication');
//         speakFeedback("Going to Communication.");
//     } else if (normalizedText === "go to education" || normalizedText === "go to education page") {
//         router.push('/education');
//         speakFeedback("Going to Education.");
//     } else if (normalizedText === "go to stories" || normalizedText === "go to stories page") {
//         router.push('/stories');
//         speakFeedback("Going to Stories.");
//     } else if (normalizedText === "go to mission" || normalizedText === "go to mission page") {
//         router.push('/mission');
//         speakFeedback("Going to Mission.");
//     }
//     // Clicks
//     else if (normalizedText === "click profile") {
//         findElementByTextAndClick("Profile");
//         speakFeedback("Clicked Profile.");
//     } else if (normalizedText === "click log out" || normalizedText === "click logout") {
//         findElementByTextAndClick("Logout");
//         speakFeedback("Clicked Logout.");
//     } else if (normalizedText === "click create account") {
//         findElementByTextAndClick("Create Account");
//         speakFeedback("Clicked Create Account.");
//     }
//     // Form Filling
//     else if (normalizedText.startsWith("my name is ")) {
//         const name = speechText.substring(11); // Get text after "my name is "
//         findInputByLabelAndFill("Full Name", name);
//         speakFeedback(`Setting name to ${name}.`);
//     } else if (normalizedText.startsWith("my email is ")) {
//         const email = speechText.substring(12).replace(/ at /g, '@').replace(/ dot /g, '.').replace(/\s/g, '');
//         findInputByLabelAndFill("Email Address", email);
//         speakFeedback(`Setting email.`);
//     } else if (normalizedText.startsWith("set password to ")) {
//         const password = speechText.substring(16);
//         findInputByLabelAndFill("Password", password);
//         speakFeedback("Setting password.");
//     } else if (normalizedText.startsWith("confirm password ") || normalizedText.startsWith("confirm password to ")) {
//         const password = speechText.substring(speechText.indexOf("to ") + 3);
//         findInputByLabelAndFill("Confirm Password", password);
//         speakFeedback("Confirming password.");
//     }
//     else {
//         commandHandled = false;
//     }

//     // --- SMART PATH ---
//     if (!commandHandled) {
//       const isHelpCommand = normalizedText.includes('help') || normalizedText.includes('mayday');
//       let location = null;
//       if (isHelpCommand) {
//           speakFeedback("Sending emergency alerts. Getting your location...");
//           location = await getUserLocation();
//           if (!location) {
//               speakFeedback("Could not get your location. Sending alerts without location.");
//           }
//       }
//       try {
//           const response = await fetch(`${API_URL}/process-command`, {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({ text: speechText, page_commands: pageSpecificCommandsRef.current, location: location })
//           });
//           if (!response.ok) throw new Error(`Server error: ${response.status}`);
//           const data: ApiResponse = await response.json();
//           handleApiResponse(data);
//       } catch (error) {
//           console.error('Error processing command:', error);
//           setStatus('Error connecting to backend.');
//           speakFeedback("I'm having trouble connecting to my brain right now.");
//       }
//     }

//     setTimeout(() => {
//         isProcessingRef.current = false;
//         // Don't reset status to "Listening..." here, let the onend handler do it
//     }, 1000); 

//   }, [handleApiResponse, API_URL, router]); 

//   // --- REBUILT AND STABLE LISTENING LOGIC (Unchanged from last version) ---

//   const startListening = useCallback(() => {
//     if (isListening) return; // Already listening

//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       alert("Browser doesn't support speech recognition.");
//       return;
//     }

//     const recognition = new SpeechRecognition();
//     recognition.continuous = true; // Stay on even after a pause
//     recognition.interimResults = false; // Only give us final results
//     recognition.lang = 'en-US';

//     recognitionRef.current = recognition; // Store the instance
//     shouldBeListeningRef.current = true; // We *want* it to be on
    
//     recognition.onstart = () => {
//       setIsListening(true);
//       setStatus('Listening...');
//     };

//     recognition.onresult = (event: SpeechRecognitionEvent) => {
//       const transcript = event.results[event.results.length - 1][0].transcript.trim();
//       processVoiceCommand(transcript);
//     };

//     recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
//       console.error("Speech recognition error", event.error);
//       if (event.error === 'no-speech') {
//         // This is a common browser timeout, the onend handler will fix it.
//       } else {
//         setStatus(`Error: ${event.error}`);
//       }
//     };
    
//     recognition.onend = () => {
//       if (shouldBeListeningRef.current) {
//         recognition.start();
//       } else {
//         setIsListening(false);
//         setStatus('Click the mic to start');
//       }
//     };
    
//     recognition.start();

//   }, [processVoiceCommand]);

//   const stopListening = useCallback(() => {
//     if (!recognitionRef.current) return; // Already stopped
//     shouldBeListeningRef.current = false; 
//     recognitionRef.current.stop(); // This will trigger the 'onend' event
//     recognitionRef.current = null;
//     speechSynthesis.cancel();
    
//   }, []);
  
//   const setPageSpecificCommands = useCallback((commands: string[]) => {
//       pageSpecificCommandsRef.current = commands;
//   }, []);

//   return { isListening, status, startListening, stopListening, setPageSpecificCommands };
// };

// "use client";

// import { useState, useRef, useCallback, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// // --- Interface definitions ---
// interface WebsiteCommandPayload {
//   action: 'scroll' | 'navigate' | 'read' | 'unknown' | 'click' | 'goToPage' | 'fillInput';
//   target: string | null;
//   direction?: 'up' | 'down' | 'top' | 'bottom' | null;
//   value?: string;
// }
// interface GeneralAnswerPayload { text_to_speak: string; }
// interface HelpActionPayload { status: 'success' | 'failed'; }
// interface PlayGamePayload { name: string; url: string; }
// interface ApiResponse {
//   type: 'WEBSITE_COMMAND' | 'GENERAL_ANSWER' | 'HELP_ACTION' | 'PLAY_GAME';
//   payload: WebsiteCommandPayload | GeneralAnswerPayload | HelpActionPayload | PlayGamePayload;
// }
// declare global { interface Window { webkitSpeechRecognition: any; } }

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
//         const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
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
//             if (input) { fillAndDispatch(input); return true; }
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

// // --- Main Hook ---
// export const useVoiceControl = () => {
//   const [isListening, setIsListening] = useState(false);
//   const [status, setStatus] = useState('Click the mic to start');
  
//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const isProcessingRef = useRef(false);
//   const pageSpecificCommandsRef = useRef<string[]>([]);
//   const shouldBeListeningRef = useRef(false);
  
//   const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
//   const router = useRouter(); 

//   const handleApiResponse = useCallback((response: ApiResponse) => {
//     console.log("Handling API Response:", response);
//     // This function now ONLY handles "Smart Path" responses (AI, SOS)
//     if (response.type === 'WEBSITE_COMMAND') {
//       const command = response.payload as WebsiteCommandPayload;
//       setStatus(`Command: ${command.action}`);
//       switch (command.action) {
//         // We leave 'scroll', 'navigate', 'click' etc. here as a fallback
//         // in case the AI needs to handle a complex one.
//         case 'scroll':
//           if (command.direction === 'down') { window.scrollBy({ top: 500, behavior: 'smooth' }); speakFeedback("Scrolling down."); }
//           else if (command.direction === 'up') { window.scrollBy({ top: -500, behavior: 'smooth' }); speakFeedback("Scrolling up."); }
//           else if (command.direction === 'top' || command.target === 'top') { window.scrollTo({ top: 0, behavior: 'smooth' }); speakFeedback("Scrolling to top."); }
//           else if (command.direction === 'bottom' || command.target === 'bottom') { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); speakFeedback("Scrolling to bottom."); }
//           break;
//         case 'navigate':
//           if (command.target) {
//             const element = document.getElementById(command.target);
//             if (element) { element.scrollIntoView({ behavior: 'smooth', block: 'start' }); speakFeedback(`Navigating to ${command.target}.`); }
//           }
//           break;
//         case 'goToPage':
//            if (command.target) {
//              speakFeedback(`Going to the ${command.target.replace('/', '')} page.`);
//              router.push(command.target);
//            }
//            break;
//         case 'click':
//            if (command.target) {
//              const success = findElementByTextAndClick(command.target);
//              if (success) { speakFeedback(`Clicked ${command.target}.`); }
//            }
//            break;
//         case 'fillInput':
//            if (command.target && command.value !== undefined) {
//              const success = findInputByLabelAndFill(command.target, command.value);
//              if (success) { speakFeedback(`Okay, I've filled the ${command.target} field.`); }
//            }
//            break;
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
//         setStatus('Emergency alerts sent.');
//         speakFeedback('Emergency alerts have been sent via email and SMS with your location.');
//       } else {
//         setStatus('Failed to send alerts.');
//         speakFeedback('Sorry, there was a problem sending the emergency alerts.');
//       }
//     }
//   }, [router]);

//   const processVoiceCommand = useCallback(async (speechText: string) => {
//     if (isProcessingRef.current) return;
//     isProcessingRef.current = true;
    
//     const normalizedText = speechText.toLowerCase().trim();
//     let commandHandled = true;

//     console.log("User said (transcribed):", `"${normalizedText}"`);
    
//     // --- FAST PATH ---
//     if (normalizedText === "scroll down") {
//         window.scrollBy({ top: 500, behavior: 'smooth' });
//         speakFeedback("Scrolling down.");
//     } else if (normalizedText === "scroll up") {
//         window.scrollBy({ top: -500, behavior: 'smooth' });
//         speakFeedback("Scrolling up.");
//     } else if (normalizedText === "scroll to top" || normalizedText === "go to top") {
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//         speakFeedback("Scrolling to top.");
//     } else if (normalizedText === "scroll to bottom" || normalizedText === "go to bottom") {
//         window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
//         speakFeedback("Scrolling to bottom.");
//     }
//     else if (normalizedText === "got to home page" || normalizedText === "go to home"){
//       router.push('/');
//       speakFeedback("Going to home page");
//     } 
//     else if (normalizedText === "go to communication" || normalizedText === "go to communication page") {
//         router.push('/communication');
//         speakFeedback("Going to Communication.");
//     } else if (normalizedText === "go to education" || normalizedText === "go to education page") {
//         router.push('/education');
//         speakFeedback("Going to Education.");
//     } else if (normalizedText === "go to stories" || normalizedText === "go to stories page") {
//         router.push('/stories');
//         speakFeedback("Going to Stories.");
//     } else if (normalizedText === "go to mission" || normalizedText === "go to mission page") {
//         router.push('/mission');
//         speakFeedback("Going to Mission.");
//     }
//     else if (normalizedText === "click profile") {
//         findElementByTextAndClick("Profile");
//         speakFeedback("Clicked Profile.");
//     } else if (normalizedText === "click log out" || normalizedText === "click logout") {
//         findElementByTextAndClick("Logout");
//         speakFeedback("Clicked Logout.");
//     } else if (normalizedText === "click create account") {
//         findElementByTextAndClick("Create Account");
//         speakFeedback("Clicked Create Account.");
//     }
//     else if (normalizedText.startsWith("my name is ")) {
//         const name = speechText.substring(11);
//         findInputByLabelAndFill("Full Name", name);
//         speakFeedback(`Setting name to ${name}.`);
//     } else if (normalizedText.startsWith("my email is ")) {
//         const email = speechText.substring(12).replace(/ at /g, '@').replace(/ dot /g, '.').replace(/\s/g, '');
//         findInputByLabelAndFill("Email Address", email);
//         speakFeedback(`Setting email.`);
//     } else if (normalizedText.startsWith("set password to ")) {
//         const password = speechText.substring(16);
//         findInputByLabelAndFill("Password", password);
//         speakFeedback("Setting password.");
//     } else if (normalizedText.startsWith("confirm password ") || normalizedText.startsWith("confirm password to ")) {
//         const password = speechText.substring(speechText.indexOf("to ") + 3);
//         findInputByLabelAndFill("Confirm Password", password);
//         speakFeedback("Confirming password.");
//     }
//     else {
//         commandHandled = false;
//     }

//     // --- SMART PATH ---
//     if (!commandHandled) {
//       const isHelpCommand = normalizedText.includes('help') || normalizedText.includes('mayday');
//       let location = null;
//       if (isHelpCommand) {
//           speakFeedback("Sending emergency alerts. Getting your location...");
//           location = await getUserLocation();
//           if (!location) {
//               speakFeedback("Could not get your location. Sending alerts without location.");
//           }
//       }
//       try {
//           const response = await fetch(`${API_URL}/process-command`, {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({ text: speechText, page_commands: pageSpecificCommandsRef.current, location: location })
//           });
//           if (!response.ok) throw new Error(`Server error: ${response.status}`);
//           const data: ApiResponse = await response.json();
//           handleApiResponse(data);
//       } catch (error) {
//           console.error('Error processing command:', error);
//           setStatus('Error connecting to backend.');
//           speakFeedback("I'm having trouble connecting to my brain right now.");
//       }
//     }

//     setTimeout(() => {
//         isProcessingRef.current = false;
//     }, 1000); 

//   }, [handleApiResponse, API_URL, router]); 

//   const startListening = useCallback(() => {
//     if (isListening) return;

//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       alert("Browser doesn't support speech recognition.");
//       return;
//     }

//     const recognition = new SpeechRecognition();
//     recognition.continuous = true;
//     recognition.interimResults = false;
//     recognition.lang = 'en-US';

//     recognitionRef.current = recognition;
//     shouldBeListeningRef.current = true;
    
//     recognition.onstart = () => {
//       setIsListening(true);
//       setStatus('Listening...');
//     };

//     recognition.onresult = (event: SpeechRecognitionEvent) => {
//       const transcript = event.results[event.results.length - 1][0].transcript.trim();
//       processVoiceCommand(transcript);
//     };

//     recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
//       console.error("Speech recognition error", event.error);
//       if (event.error === 'no-speech') {
//         // This is a common browser timeout, the onend handler will fix it.
//       } else {
//         setStatus(`Error: ${event.error}`);
//       }
//     };
    
//     recognition.onend = () => {
//       if (shouldBeListeningRef.current) {
//         recognition.start();
//       } else {
//         setIsListening(false);
//         setStatus('Click the mic to start');
//       }
//     };
    
//     recognition.start();

//   }, [isListening, processVoiceCommand]);

//   const stopListening = useCallback(() => {
//     if (!recognitionRef.current) return;
    
//     shouldBeListeningRef.current = false; 
//     recognitionRef.current.stop();
//     recognitionRef.current = null;
//     speechSynthesis.cancel();
    
//   }, []);
  
//   const setPageSpecificCommands = useCallback((commands: string[]) => {
//       pageSpecificCommandsRef.current = commands;
//   }, []);

//   return { isListening, status, startListening, stopListening, setPageSpecificCommands };
// };

// "use client";

// import { useState, useRef, useCallback, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// // --- Interface definitions (unchanged) ---
// interface WebsiteCommandPayload {
//   action: 'scroll' | 'navigate' | 'read' | 'unknown' | 'click' | 'goToPage' | 'fillInput';
//   target: string | null;
//   direction?: 'up' | 'down' | 'top' | 'bottom' | null;
//   value?: string;
// }
// interface GeneralAnswerPayload { text_to_speak: string; }
// interface HelpActionPayload { status: 'success' | 'failed'; }
// interface PlayGamePayload { name: string; url: string; }
// interface ApiResponse {
//   type: 'WEBSITE_COMMAND' | 'GENERAL_ANSWER' | 'HELP_ACTION' | 'PLAY_GAME';
//   payload: WebsiteCommandPayload | GeneralAnswerPayload | HelpActionPayload | PlayGamePayload;
// }
// declare global { interface Window { webkitSpeechRecognition: any; } }

// // --- Helper Functions (unchanged) ---
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
//         const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
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
//             if (input) { fillAndDispatch(input); return true; }
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

// // --- Main Hook ---
// export const useVoiceControl = () => {
//   const [isListening, setIsListening] = useState(false);
//   const [status, setStatus] = useState('Click the mic to start');
  
//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const isProcessingRef = useRef(false);
//   const pageSpecificCommandsRef = useRef<string[]>([]);
//   const shouldBeListeningRef = useRef(false);
  
//   const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
//   const router = useRouter(); 

//   const handleApiResponse = useCallback((response: ApiResponse) => {
//     console.log("Handling API Response:", response);
//     // This function now ONLY handles "Smart Path" responses (AI, SOS)
//     if (response.type === 'WEBSITE_COMMAND') {
//       const command = response.payload as WebsiteCommandPayload;
//       setStatus(`Command: ${command.action}`);
//       switch (command.action) {
//         // ... (Fallbacks for AI-driven commands)
//       }
//     } else if (response.type === 'GENERAL_ANSWER') {
//       const answer = response.payload as GeneralAnswerPayload;
//       setStatus('Answering question...');
//       speakFeedback(answer.text_to_speak);
//     } else if (response.type === 'HELP_ACTION') {
//       const helpAction = response.payload as HelpActionPayload;
//       if (helpAction.status === 'success') {
//         setStatus('Emergency alerts sent.');
//         speakFeedback('Emergency alerts have been sent via email and SMS with your location.');
//       } else {
//         setStatus('Failed to send alerts.');
//         speakFeedback('Sorry, there was a problem sending the emergency alerts.');
//       }
//     }
//   }, [router]);

//   const processVoiceCommand = useCallback(async (speechText: string) => {
//     if (isProcessingRef.current) return;
//     isProcessingRef.current = true;
    
//     const normalizedText = speechText.toLowerCase().trim();
//     let commandHandled = true;

//     console.log("User said (transcribed):", `"${normalizedText}"`);
    
//     // --- FAST PATH ---
//     // UPDATED: Changed from '===' to 'startsWith' to ignore punctuation
//     if (normalizedText.startsWith("scroll down")) {
//         window.scrollBy({ top: 500, behavior: 'smooth' });
//         speakFeedback("Scrolling down.");
//     } else if (normalizedText.startsWith("scroll up")) {
//         window.scrollBy({ top: -500, behavior: 'smooth' });
//         speakFeedback("Scrolling up.");
//     } else if (normalizedText.startsWith("scroll to top") || normalizedText.startsWith("go to top")) {
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//         speakFeedback("Scrolling to top.");
//     } else if (normalizedText.startsWith("scroll to bottom") || normalizedText.startsWith("go to bottom")) {
//         window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
//         speakFeedback("Scrolling to bottom.");
//     } 
//     // ADDED: Logic for "go to home page"
//     else if (normalizedText.startsWith("go to home page") || normalizedText.startsWith("go to home")) {
//         router.push('/');
//         speakFeedback("Going to Home Page.");
//     }
//     // Navigation (already using startsWith, but for consistency)
//     else if (normalizedText.startsWith("go to communication")) {
//         router.push('/communication');
//         speakFeedback("Going to Communication.");
//     } else if (normalizedText.startsWith("go to education")) {
//         router.push('/education');
//         speakFeedback("Going to Education.");
//     } else if (normalizedText.startsWith("go to stories")) {
//         router.push('/stories');
//         speakFeedback("Going to Stories.");
//     } else if (normalizedText.startsWith("go to mission")) {
//         router.push('/mission');
//         speakFeedback("Going to Mission.");
//     }
//     // Clicks (already robust)
//     else if (normalizedText === "click profile") {
//         findElementByTextAndClick("Profile");
//         speakFeedback("Clicked Profile.");
//     } else if (normalizedText === "click log out" || normalizedText === "click logout") {
//         findElementByTextAndClick("Logout");
//         speakFeedback("Clicked Logout.");
//     } else if (normalizedText === "click create account") {
//         findElementByTextAndClick("Create Account");
//         speakFeedback("Clicked Create Account.");
//     }
//     // Form Filling (already using startsWith)
//     else if (normalizedText.startsWith("my name is ")) {
//         const name = speechText.substring(11);
//         findInputByLabelAndFill("Full Name", name);
//         speakFeedback(`Setting name to ${name}.`);
//     } else if (normalizedText.startsWith("my email is ")) {
//         const email = speechText.substring(12).replace(/ at /g, '@').replace(/ dot /g, '.').replace(/\s/g, '');
//         findInputByLabelAndFill("Email Address", email);
//         speakFeedback(`Setting email.`);
//     } else if (normalizedText.startsWith("set password to ")) {
//         const password = speechText.substring(16);
//         findInputByLabelAndFill("Password", password);
//         speakFeedback("Setting password.");
//     } else if (normalizedText.startsWith("confirm password ") || normalizedText.startsWith("confirm password to ")) {
//         const password = speechText.substring(speechText.indexOf("to ") + 3);
//         findInputByLabelAndFill("Confirm Password", password);
//         speakFeedback("Confirming password.");
//     }
//     else {
//         commandHandled = false;
//     }

//     // --- SMART PATH ---
//     if (!commandHandled) {
//       const isHelpCommand = normalizedText.includes('help') || normalizedText.includes('mayday');
//       let location = null;
//       if (isHelpCommand) {
//           speakFeedback("Sending emergency alerts. Getting your location...");
//           location = await getUserLocation();
//           if (!location) {
//               speakFeedback("Could not get your location. Sending alerts without location.");
//           }
//       }
//       try {
//           const response = await fetch(`${API_URL}/process-command`, {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({ text: speechText, page_commands: pageSpecificCommandsRef.current, location: location })
//           });
//           if (!response.ok) throw new Error(`Server error: ${response.status}`);
//           const data: ApiResponse = await response.json();
//           handleApiResponse(data);
//       } catch (error) {
//           console.error('Error processing command:', error);
//           setStatus('Error connecting to backend.');
//           speakFeedback("I'm having trouble connecting to my brain right now.");
//       }
//     }

//     setTimeout(() => {
//         isProcessingRef.current = false;
//     }, 1000); 

//   }, [handleApiResponse, API_URL, router]); 

//   // --- STABLE LISTENING LOGIC (Unchanged) ---
//   const startListening = useCallback(() => {
//     if (isListening) return;

//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       alert("Browser doesn't support speech recognition.");
//       return;
//     }

//     const recognition = new SpeechRecognition();
//     recognition.continuous = true;
//     recognition.interimResults = false;
//     recognition.lang = 'en-US';

//     recognitionRef.current = recognition;
//     shouldBeListeningRef.current = true;
    
//     recognition.onstart = () => {
//       setIsListening(true);
//       setStatus('Listening...');
//     };

//     recognition.onresult = (event: SpeechRecognitionEvent) => {
//       const transcript = event.results[event.results.length - 1][0].transcript.trim();
//       processVoiceCommand(transcript);
//     };

//     recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
//       console.error("Speech recognition error", event.error);
//       if (event.error === 'no-speech') {
//         // This is a common browser timeout, the onend handler will fix it.
//       } else {
//         setStatus(`Error: ${event.error}`);
//       }
//     };
    
//     recognition.onend = () => {
//       if (shouldBeListeningRef.current) {
//         recognition.start();
//       } else {
//         setIsListening(false);
//         setStatus('Click the mic to start');
//       }
//     };
    
//     recognition.start();

//   }, [isListening, processVoiceCommand]);

//   const stopListening = useCallback(() => {
//     if (!recognitionRef.current) return;
    
//     shouldBeListeningRef.current = false; 
//     recognitionRef.current.stop();
//     recognitionRef.current = null;
//     speechSynthesis.cancel();
    
//   }, []);
  
//   const setPageSpecificCommands = useCallback((commands: string[]) => {
//       pageSpecificCommandsRef.current = commands;
//   }, []);

//   return { isListening, status, startListening, stopListening, setPageSpecificCommands };
// };

// "use client";

// import { useState, useRef, useCallback, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// // --- Interface definitions (unchanged) ---
// interface WebsiteCommandPayload {
//   action: 'scroll' | 'navigate' | 'read' | 'unknown' | 'click' | 'goToPage' | 'fillInput';
//   target: string | null;
//   direction?: 'up' | 'down' | 'top' | 'bottom' | null;
//   value?: string;
// }
// interface GeneralAnswerPayload { text_to_speak: string; }
// interface HelpActionPayload { status: 'success' | 'failed'; }
// interface PlayGamePayload { name: string; url: string; }
// interface ApiResponse {
//   type: 'WEBSITE_COMMAND' | 'GENERAL_ANSWER' | 'HELP_ACTION' | 'PLAY_GAME';
//   payload: WebsiteCommandPayload | GeneralAnswerPayload | HelpActionPayload | PlayGamePayload;
// }
// declare global { interface Window { webkitSpeechRecognition: any; } }

// // --- Helper Functions (unchanged) ---
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
//         const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
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
//             if (input) { fillAndDispatch(input); return true; }
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

// // --- Main Hook ---
// export const useVoiceControl = () => {
//   const [isListening, setIsListening] = useState(false);
//   const [status, setStatus] = useState('Click the mic to start');
  
//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const isProcessingRef = useRef(false);
//   const pageSpecificCommandsRef = useRef<string[]>([]);
//   const shouldBeListeningRef = useRef(false);
  
//   const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
//   const router = useRouter(); 

//   const handleApiResponse = useCallback((response: ApiResponse) => {
//     console.log("Handling API Response:", response);
//     // This function now ONLY handles "Smart Path" responses (AI, SOS)
//     if (response.type === 'WEBSITE_COMMAND') {
//       const command = response.payload as WebsiteCommandPayload;
//       setStatus(`Command: ${command.action}`);
//       // Fallbacks in case "Fast Path" fails or AI is needed
//       switch (command.action) {
//         case 'scroll':
//           if (command.direction === 'down') { window.scrollBy({ top: 500, behavior: 'smooth' }); speakFeedback("Scrolling down."); }
//           else if (command.direction === 'up') { window.scrollBy({ top: -500, behavior: 'smooth' }); speakFeedback("Scrolling up."); }
//           else if (command.direction === 'top' || command.target === 'top') { window.scrollTo({ top: 0, behavior: 'smooth' }); speakFeedback("Scrolling to top."); }
//           else if (command.direction === 'bottom' || command.target === 'bottom') { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); speakFeedback("Scrolling to bottom."); }
//           break;
//         case 'navigate':
//           if (command.target) {
//             const element = document.getElementById(command.target);
//             if (element) { element.scrollIntoView({ behavior: 'smooth', block: 'start' }); speakFeedback(`Navigating to ${command.target}.`); }
//           }
//           break;
//         case 'goToPage':
//            if (command.target) {
//              speakFeedback(`Going to the ${command.target.replace('/', '')} page.`);
//              router.push(command.target);
//            }
//            break;
//         case 'click':
//            if (command.target) {
//              const success = findElementByTextAndClick(command.target);
//              if (success) { speakFeedback(`Clicked ${command.target}.`); }
//            }
//            break;
//         case 'fillInput':
//            if (command.target && command.value !== undefined) {
//              const success = findInputByLabelAndFill(command.target, command.value);
//              if (success) { speakFeedback(`Okay, I've filled the ${command.target} field.`); }
//            }
//            break;
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
//         setStatus('Emergency alerts sent.');
//         speakFeedback('Emergency alerts have been sent via email and SMS with your location.');
//       } else {
//         setStatus('Failed to send alerts.');
//         speakFeedback('Sorry, there was a problem sending the emergency alerts.');
//       }
//     }
//   }, [router]);

//   const processVoiceCommand = useCallback(async (speechText: string) => {
//     if (isProcessingRef.current) return;
//     isProcessingRef.current = true;
    
//     // Remove punctuation from the end of the command
//     const normalizedText = speechText.toLowerCase().trim().replace(/[.,!?;]$/, '');
//     let commandHandled = true;

//     console.log("User said (transcribed):", `"${normalizedText}"`);
    
//     // --- FAST PATH ---
//     // UPDATED: All checks now use startsWith() to be robust against punctuation
//     if (normalizedText.startsWith("scroll down")) {
//         window.scrollBy({ top: 500, behavior: 'smooth' });
//         speakFeedback("Scrolling down.");
//     } else if (normalizedText.startsWith("scroll up")) {
//         window.scrollBy({ top: -500, behavior: 'smooth' });
//         speakFeedback("Scrolling up.");
//     } else if (normalizedText.startsWith("scroll to top") || normalizedText.startsWith("go to top")) {
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//         speakFeedback("Scrolling to top.");
//     } else if (normalizedText.startsWith("scroll to bottom") || normalizedText.startsWith("go to bottom")) {
//         window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
//         speakFeedback("Scrolling to bottom.");
//     } 
//     else if (normalizedText.startsWith("go to home page") || normalizedText.startsWith("go to home")) {
//         router.push('/');
//         speakFeedback("Going to Home Page.");
//     }
//     else if (normalizedText.startsWith("go to communication")) {
//         router.push('/communication');
//         speakFeedback("Going to Communication.");
//     } else if (normalizedText.startsWith("go to education")) {
//         router.push('/education');
//         speakFeedback("Going to Education.");
//     } else if (normalizedText.startsWith("go to stories")) {
//         router.push('/stories');
//         speakFeedback("Going to Stories.");
//     } else if (normalizedText.startsWith("go to mission")) {
//         router.push('/mission');
//         speakFeedback("Going to Mission.");
//     }
//     // Clicks
//     else if (normalizedText.startsWith("click profile")) {
//         findElementByTextAndClick("Profile");
//         speakFeedback("Clicked Profile.");
//     } else if (normalizedText.startsWith("click log out") || normalizedText.startsWith("click logout")) {
//         findElementByTextAndClick("Logout");
//         speakFeedback("Clicked Logout.");
//     } else if (normalizedText.startsWith("click create account")) {
//         findElementByTextAndClick("Create Account");
//         speakFeedback("Clicked Create Account.");
//     }
//     // Form Filling
//     else if (normalizedText.startsWith("my name is ")) {
//         const name = speechText.substring(11);
//         findInputByLabelAndFill("Full Name", name);
//         speakFeedback(`Setting name to ${name}.`);
//     } else if (normalizedText.startsWith("my email is ")) {
//         const email = speechText.substring(12).replace(/ at /g, '@').replace(/ dot /g, '.').replace(/\s/g, '');
//         findInputByLabelAndFill("Email Address", email);
//         speakFeedback(`Setting email.`);
//     } else if (normalizedText.startsWith("set password to ")) {
//         const password = speechText.substring(16);
//         findInputByLabelAndFill("Password", password);
//         speakFeedback("Setting password.");
//     } else if (normalizedText.startsWith("confirm password ") || normalizedText.startsWith("confirm password to ")) {
//         const password = speechText.substring(speechText.indexOf("to ") + 3);
//         findInputByLabelAndFill("Confirm Password", password);
//         speakFeedback("Confirming password.");
//     }
//     else {
//         commandHandled = false;
//     }

//     // --- SMART PATH ---
//     if (!commandHandled) {
//       const isHelpCommand = normalizedText.includes('help') || normalizedText.includes('mayday');
//       let location = null;
//       if (isHelpCommand) {
//           speakFeedback("Sending emergency alerts. Getting your location...");
//           location = await getUserLocation();
//           if (!location) {
//               speakFeedback("Could not get your location. Sending alerts without location.");
//           }
//       }
//       try {
//           const response = await fetch(`${API_URL}/process-command`, {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({ text: speechText, page_commands: pageSpecificCommandsRef.current, location: location })
//           });
//           if (!response.ok) throw new Error(`Server error: ${response.status}`);
//           const data: ApiResponse = await response.json();
//           handleApiResponse(data);
//       } catch (error) {
//           console.error('Error processing command:', error);
//           setStatus('Error connecting to backend.');
//           speakFeedback("I'm having trouble connecting to my brain right now.");
//       }
//     }

//     setTimeout(() => {
//         isProcessingRef.current = false;
//     }, 1000); 

//   }, [handleApiResponse, API_URL, router]); 

//   // --- STABLE LISTENING LOGIC (Unchanged) ---
//   const startListening = useCallback(() => {
//     if (isListening) return;

//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       alert("Browser doesn't support speech recognition.");
//       return;
//     }

//     const recognition = new SpeechRecognition();
//     recognition.continuous = true;
//     recognition.interimResults = false;
//     recognition.lang = 'en-US';

//     recognitionRef.current = recognition;
//     shouldBeListeningRef.current = true;
    
//     recognition.onstart = () => {
//       setIsListening(true);
//       setStatus('Listening...');
//     };

//     recognition.onresult = (event: SpeechRecognitionEvent) => {
//       const transcript = event.results[event.results.length - 1][0].transcript.trim();
//       processVoiceCommand(transcript);
//     };

//     recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
//       console.error("Speech recognition error", event.error);
//       if (event.error === 'no-speech') {
//         // This is a common browser timeout, the onend handler will fix it.
//       } else {
//         setStatus(`Error: ${event.error}`);
//       }
//     };
    
//     recognition.onend = () => {
//       if (shouldBeListeningRef.current) {
//         recognition.start();
//       } else {
//         setIsListening(false);
//         setStatus('Click the mic to start');
//       }
//     };
    
//     recognition.start();

//   }, [isListening, processVoiceCommand]);

//   const stopListening = useCallback(() => {
//     if (!recognitionRef.current) return;
    
//     shouldBeListeningRef.current = false; 
//     recognitionRef.current.stop();
//     recognitionRef.current = null;
//     speechSynthesis.cancel();
    
//   }, []);
  
//   const setPageSpecificCommands = useCallback((commands: string[]) => {
//       pageSpecificCommandsRef.current = commands;
//   }, []);

//   return { isListening, status, startListening, stopListening, setPageSpecificCommands };
// };

// "use client";

// import { useState, useRef, useCallback, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// // --- Interface definitions (unchanged) ---
// interface WebsiteCommandPayload {
//   action: 'scroll' | 'navigate' | 'read' | 'unknown' | 'click' | 'goToPage' | 'fillInput';
//   target: string | null;
//   direction?: 'up' | 'down' | 'top' | 'bottom' | null;
//   value?: string;
// }
// interface GeneralAnswerPayload { text_to_speak: string; }
// interface HelpActionPayload { status: 'success' | 'failed'; }
// interface PlayGamePayload { name: string; url: string; }
// interface ApiResponse {
//   type: 'WEBSITE_COMMAND' | 'GENERAL_ANSWER' | 'HELP_ACTION' | 'PLAY_GAME';
//   payload: WebsiteCommandPayload | GeneralAnswerPayload | HelpActionPayload | PlayGamePayload;
// }
// declare global { interface Window { webkitSpeechRecognition: any; } }

// // --- Helper Functions (unchanged) ---
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
//         const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
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
//             if (input) { fillAndDispatch(input); return true; }
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

// // --- Main Hook ---
// export const useVoiceControl = () => {
//   const [isListening, setIsListening] = useState(false);
//   const [status, setStatus] = useState('Click the mic to start');
  
//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const isProcessingRef = useRef(false);
//   const pageSpecificCommandsRef = useRef<string[]>([]);
//   const shouldBeListeningRef = useRef(false);
  
//   const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
//   const router = useRouter(); 

//   const handleApiResponse = useCallback((response: ApiResponse) => {
//     console.log("Handling API Response:", response);
//     if (response.type === 'WEBSITE_COMMAND') {
//       const command = response.payload as WebsiteCommandPayload;
//       setStatus(`Command: ${command.action}`);
//       // Fallbacks in case "Fast Path" fails or AI is needed
//       switch (command.action) {
//         case 'scroll':
//           if (command.direction === 'down') { window.scrollBy({ top: 500, behavior: 'smooth' }); speakFeedback("Scrolling down."); }
//           else if (command.direction === 'up') { window.scrollBy({ top: -500, behavior: 'smooth' }); speakFeedback("Scrolling up."); }
//           else if (command.direction === 'top' || command.target === 'top') { window.scrollTo({ top: 0, behavior: 'smooth' }); speakFeedback("Scrolling to top."); }
//           else if (command.direction === 'bottom' || command.target === 'bottom') { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); speakFeedback("Scrolling to bottom."); }
//           break;
//         case 'navigate':
//           if (command.target) {
//             const element = document.getElementById(command.target);
//             if (element) { element.scrollIntoView({ behavior: 'smooth', block: 'start' }); speakFeedback(`Navigating to ${command.target}.`); }
//           }
//           break;
//         case 'goToPage':
//            if (command.target) {
//              speakFeedback(`Going to the ${command.target.replace('/', '')} page.`);
//              router.push(command.target);
//            }
//            break;
//         case 'click':
//            if (command.target) {
//              const success = findElementByTextAndClick(command.target);
//              if (success) { speakFeedback(`Clicked ${command.target}.`); }
//            }
//            break;
//         case 'fillInput':
//            if (command.target && command.value !== undefined) {
//              const success = findInputByLabelAndFill(command.target, command.value);
//              if (success) { speakFeedback(`Okay, I've filled the ${command.target} field.`); }
//            }
//            break;
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
//         setStatus('Emergency alerts sent.');
//         speakFeedback('Emergency alerts have been sent via email and SMS with your location.');
//       } else {
//         setStatus('Failed to send alerts.');
//         speakFeedback('Sorry, there was a problem sending the emergency alerts.');
//       }
//     }
//   }, [router]);

//   const processVoiceCommand = useCallback(async (speechText: string) => {
//     if (isProcessingRef.current) return;
//     isProcessingRef.current = true;
    
//     const normalizedText = speechText.toLowerCase().trim().replace(/[.,!?;]$/, '');
//     let commandHandled = true;

//     console.log("User said (transcribed):", `"${normalizedText}"`);
    
//     // --- FAST PATH ---
    
//     // --- UPDATED: More robust "Fast Path" logic for form filling ---
//     const fillPatterns = [
//         /(?:fill|enter|set) (?:the |my )?(full name|name) (?:as|to|with) (.+)/i,
//         /(?:fill|enter|set) (?:the |my )?(email|email address) (?:as|to|with) (.+)/i,
//         /(?:fill|enter|set) (?:the |my )?(password) (?:as|to|with) (.+)/i,
//         /(?:fill|enter|set) (?:the |my )?(confirm password) (?:as|to|with) (.+)/i,
//         /my (name) is (.+)/i,
//         /my (email|email address) is (.+)/i,
//     ];

//     let formFilled = false;
//     for (const pattern of fillPatterns) {
//         const match = speechText.toLowerCase().trim().match(pattern); // Use original speechText for value
//         if (match) {
//             let field = match[1].toLowerCase().replace("email address", "email");
//             let value = match[2];

//             // Map field names to the labels on your form
//             let fieldLabel = "";
//             if (field.includes("name")) fieldLabel = "Full Name";
//             if (field.includes("email")) {
//                 fieldLabel = "Email Address";
//                 value = value.replace(/ at /g, '@').replace(/ dot /g, '.').replace(/\s/g, ''); // Sanitize email
//             }
//             if (field.includes("password")) fieldLabel = "Password";
//             if (field.includes("confirm password")) fieldLabel = "Confirm Password";
            
//             findInputByLabelAndFill(fieldLabel, value);
//             speakFeedback(`Setting ${fieldLabel}.`);
//             commandHandled = true;
//             formFilled = true;
//             break;
//         }
//     }
//     // --- End of new form filling logic ---


//     if (formFilled) {
//         // We already handled it and spoke, so just finish
//     } else if (normalizedText.startsWith("scroll down")) {
//         window.scrollBy({ top: 500, behavior: 'smooth' });
//         speakFeedback("Scrolling down.");
//     } else if (normalizedText.startsWith("scroll up")) {
//         window.scrollBy({ top: -500, behavior: 'smooth' });
//         speakFeedback("Scrolling up.");
//     } else if (normalizedText.startsWith("scroll to top") || normalizedText.startsWith("go to top")) {
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//         speakFeedback("Scrolling to top.");
//     } else if (normalizedText.startsWith("scroll to bottom") || normalizedText.startsWith("go to bottom")) {
//         window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
//         speakFeedback("Scrolling to bottom.");
//     } 
//     else if (normalizedText.startsWith("go to home page") || normalizedText.startsWith("go to home")) {
//         router.push('/');
//         speakFeedback("Going to Home Page.");
//     }
//     else if (normalizedText.startsWith("go to communication")) {
//         router.push('/communication');
//         speakFeedback("Going to Communication.");
//     } else if (normalizedText.startsWith("go to education")) {
//         router.push('/education');
//         speakFeedback("Going to Education.");
//     } else if (normalizedText.startsWith("go to stories")) {
//         router.push('/stories');
//         speakFeedback("Going to Stories.");
//     } else if (normalizedText.startsWith("go to mission")) {
//         router.push('/mission');
//         speakFeedback("Going to Mission.");
//     }
//     else if (normalizedText.startsWith("click profile")) {
//         findElementByTextAndClick("Profile");
//         speakFeedback("Clicked Profile.");
//     } else if (normalizedText.startsWith("click log out") || normalizedText.startsWith("click logout")) {
//         findElementByTextAndClick("Logout");
//         speakFeedback("Clicked Logout.");
//     } else if (normalizedText.startsWith("click create account")) {
//         findElementByTextAndClick("Create Account");
//         speakFeedback("Clicked Create Account.");
//     }
//     else {
//         commandHandled = false;
//     }

//     // --- SMART PATH ---
//     if (!commandHandled) {
//       const isHelpCommand = normalizedText.includes('help') || normalizedText.includes('mayday');
//       let location = null;
//       if (isHelpCommand) {
//           speakFeedback("Sending emergency alerts. Getting your location...");
//           location = await getUserLocation();
//           if (!location) {
//               speakFeedback("Could not get your location. Sending alerts without location.");
//           }
//       }
//       try {
//           const response = await fetch(`${API_URL}/process-command`, {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({ text: speechText, page_commands: pageSpecificCommandsRef.current, location: location })
//           });
//           if (!response.ok) throw new Error(`Server error: ${response.status}`);
//           const data: ApiResponse = await response.json();
//           handleApiResponse(data);
//       } catch (error) {
//           console.error('Error processing command:', error);
//           setStatus('Error connecting to backend.');
//           speakFeedback("I'm having trouble connecting to my brain right now.");
//       }
//     }

//     setTimeout(() => {
//         isProcessingRef.current = false;
//     }, 1000); 

//   }, [handleApiResponse, API_URL, router]); 

//   // --- STABLE LISTENING LOGIC (Unchanged) ---
//   const startListening = useCallback(() => {
//     if (isListening) return;

//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       alert("Browser doesn't support speech recognition.");
//       return;
//     }

//     const recognition = new SpeechRecognition();
//     recognition.continuous = true;
//     recognition.interimResults = false;
//     recognition.lang = 'en-US';

//     recognitionRef.current = recognition;
//     shouldBeListeningRef.current = true;
    
//     recognition.onstart = () => {
//       setIsListening(true);
//       setStatus('Listening...');
//     };

//     recognition.onresult = (event: SpeechRecognitionEvent) => {
//       const transcript = event.results[event.results.length - 1][0].transcript.trim();
//       processVoiceCommand(transcript);
//     };

//     recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
//       console.error("Speech recognition error", event.error);
//       if (event.error === 'no-speech') {
//         // This is a common browser timeout, the onend handler will fix it.
//       } else {
//         setStatus(`Error: ${event.error}`);
//       }
//     };
    
//     recognition.onend = () => {
//       if (shouldBeListeningRef.current) {
//         recognition.start();
//       } else {
//         setIsListening(false);
//         setStatus('Click the mic to start');
//       }
//     };
    
//     recognition.start();

//   }, [isListening, processVoiceCommand]);

//   const stopListening = useCallback(() => {
//     if (!recognitionRef.current) return;
    
//     shouldBeListeningRef.current = false; 
//     recognitionRef.current.stop();
//     recognitionRef.current = null;
//     speechSynthesis.cancel();
    
//   }, []);
  
//   const setPageSpecificCommands = useCallback((commands: string[]) => {
//       pageSpecificCommandsRef.current = commands;
//   }, []);

//   return { isListening, status, startListening, stopListening, setPageSpecificCommands };
// };

// "use client";

// import { useState, useRef, useCallback, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// // --- Interface definitions ---
// interface WebsiteCommandPayload {
//   action: 'scroll' | 'navigate' | 'read' | 'unknown' | 'click' | 'goToPage' | 'fillInput';
//   target: string | null;
//   direction?: 'up' | 'down' | 'top' | 'bottom' | null;
//   value?: string;
// }
// interface GeneralAnswerPayload { text_to_speak: string; }
// interface HelpActionPayload { status: 'success' | 'failed'; }
// interface PlayGamePayload { name: string; url: string; }
// interface ApiResponse {
//   type: 'WEBSITE_COMMAND' | 'GENERAL_ANSWER' | 'HELP_ACTION' | 'PLAY_GAME';
//   payload: WebsiteCommandPayload | GeneralAnswerPayload | HelpActionPayload | PlayGamePayload;
// }
// declare global { interface Window { webkitSpeechRecognition: any; } }

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
//         const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
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
//             if (input) { fillAndDispatch(input); return true; }
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

// // --- Main Hook ---
// export const useVoiceControl = () => {
//   const [isListening, setIsListening] = useState(false);
//   const [status, setStatus] = useState('Click the mic to start');
  
//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const isProcessingRef = useRef(false);
//   const pageSpecificCommandsRef = useRef<string[]>([]);
//   const shouldBeListeningRef = useRef(false);
  
//   const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
//   const router = useRouter(); 

//   const handleApiResponse = useCallback((response: ApiResponse) => {
//     console.log("Handling API Response:", response);
//     // This function now handles all "Smart Path" responses
//     if (response.type === 'WEBSITE_COMMAND') {
//       const command = response.payload as WebsiteCommandPayload;
//       setStatus(`Command: ${command.action}`);
//       switch (command.action) {
//         case 'scroll':
//           if (command.direction === 'down') { window.scrollBy({ top: 500, behavior: 'smooth' }); speakFeedback("Scrolling down."); }
//           else if (command.direction === 'up') { window.scrollBy({ top: -500, behavior: 'smooth' }); speakFeedback("Scrolling up."); }
//           else if (command.direction === 'top' || command.target === 'top') { window.scrollTo({ top: 0, behavior: 'smooth' }); speakFeedback("Scrolling to top."); }
//           else if (command.direction === 'bottom' || command.target === 'bottom') { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); speakFeedback("Scrolling to bottom."); }
//           break;
//         case 'navigate':
//           if (command.target) {
//             const element = document.getElementById(command.target);
//             if (element) { element.scrollIntoView({ behavior: 'smooth', block: 'start' }); speakFeedback(`Navigating to ${command.target}.`); }
//           }
//           break;
//         case 'goToPage':
//            if (command.target) {
//              speakFeedback(`Going to the ${command.target.replace('/', '')} page.`);
//              router.push(command.target);
//            }
//            break;
//         case 'click':
//            if (command.target) {
//              const success = findElementByTextAndClick(command.target);
//              if (success) { speakFeedback(`Clicked ${command.target}.`); }
//            }
//            break;
//         case 'fillInput':
//            if (command.target && command.value !== undefined) {
//              const success = findInputByLabelAndFill(command.target, command.value);
//              if (success) { speakFeedback(`Okay, I've filled the ${command.target} field.`); }
//            }
//            break;
//         case 'unknown':
//           speakFeedback("Sorry, I didn't understand that command.");
//           break;
//       }
//     } else if (response.type === 'GENERAL_ANSWER') {
//       const answer = response.payload as GeneralAnswerPayload;
//       setStatus('Answering question...');
//       speakFeedback(answer.text_to_speak);
//     } 
//     // This case is now handled by the 'callEmergencyApi' function,
//     // but we leave it here as a fallback in case the AI still sends it.
//     else if (response.type === 'HELP_ACTION') {
//       const helpAction = response.payload as HelpActionPayload;
//       if (helpAction.status === 'success') {
//         setStatus('Emergency alerts sent.');
//         speakFeedback('Emergency alerts have been sent via email and SMS with your location.');
//       } else {
//         setStatus('Failed to send alerts.');
//         speakFeedback('Sorry, there was a problem sending the emergency alerts.');
//       }
//     }
//   }, [router]);

//   // --- NEW: Dedicated function for the Emergency API call ---
//   const callEmergencyApi = useCallback(async (location: { latitude: number; longitude: number } | null) => {
//     speakFeedback("Sending emergency signal...");
//     if (!location) {
//         speakFeedback("Could not get your location. Please enable location permissions. Sending alert without location.");
//     }
    
//     try {
//         const response = await fetch(`${API_URL}/emergency-alert`, { // The new endpoint
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ location: location })
//         });
//         if (!response.ok) throw new Error('Server error');
        
//         const data = await response.json();
//         if (data.status === 'success') {
//             setStatus('Emergency alerts sent.');
//             speakFeedback('Emergency alerts have been sent via email and SMS with your location.');
//         } else {
//             throw new Error('Backend failed to send alert.');
//         }
//     } catch (error) {
//         console.error('Error calling emergency API:', error);
//         setStatus('Failed to send alerts.');
//         speakFeedback('Sorry, there was a problem sending the emergency alerts.');
//     }
//   }, [API_URL]);


//   const processVoiceCommand = useCallback(async (speechText: string) => {
//     if (isProcessingRef.current) return;
//     isProcessingRef.current = true;
    
//     const normalizedText = speechText.toLowerCase().trim().replace(/[.,!?;]$/, '');
//     let commandHandled = true;

//     console.log("User said (transcribed):", `"${normalizedText}"`);
    
//     // --- UPDATED: The new "Triage" Logic ---
    
//     // --- Path 1: Secure Path (SOS) ---
//     if (normalizedText.includes('help') || normalizedText.includes('mayday')) {
//         const location = await getUserLocation();
//         await callEmergencyApi(location);
//     } 
//     // --- Path 2: Fast Path (Local Commands) ---
//     else if (normalizedText.startsWith("scroll down")) {
//         window.scrollBy({ top: 500, behavior: 'smooth' });
//         speakFeedback("Scrolling down.");
//     } else if (normalizedText.startsWith("scroll up")) {
//         window.scrollBy({ top: -500, behavior: 'smooth' });
//         speakFeedback("Scrolling up.");
//     } else if (normalizedText.startsWith("scroll to top") || normalizedText.startsWith("go to top")) {
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//         speakFeedback("Scrolling to top.");
//     } else if (normalizedText.startsWith("scroll to bottom") || normalizedText.startsWith("go to bottom")) {
//         window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
//         speakFeedback("Scrolling to bottom.");
//     } 
//     else if (normalizedText.startsWith("go to home page") || normalizedText.startsWith("go to home")) {
//         router.push('/');
//         speakFeedback("Going to Home Page.");
//     }
//     else if (normalizedText.startsWith("go to communication")) {
//         router.push('/communication');
//         speakFeedback("Going to Communication.");
//     } else if (normalizedText.startsWith("go to education")) {
//         router.push('/education');
//         speakFeedback("Going to Education.");
//     } else if (normalizedText.startsWith("go to stories")) {
//         router.push('/stories');
//         speakFeedback("Going to Stories.");
//     } else if (normalizedText.startsWith("go to mission")) {
//         router.push('/mission');
//         speakFeedback("Going to Mission.");
//     }
//     else if (normalizedText.startsWith("click profile")) {
//         findElementByTextAndClick("Profile");
//         speakFeedback("Clicked Profile.");
//     } else if (normalizedText.startsWith("click log out") || normalizedText.startsWith("click logout")) {
//         findElementByTextAndClick("Logout");
//         speakFeedback("Clicked Logout.");
//     } else if (normalizedText.startsWith("click create account")) {
//         findElementByTextAndClick("Create Account");
//         speakFeedback("Clicked Create Account.");
//     }
//     // Form Filling
//     else if (normalizedText.startsWith("my name is ")) {
//         const name = speechText.substring(11);
//         findInputByLabelAndFill("Full Name", name);
//         speakFeedback(`Setting name to ${name}.`);
//     } else if (normalizedText.startsWith("my email is ")) {
//         const email = speechText.substring(12).replace(/ at /g, '@').replace(/ dot /g, '.').replace(/\s/g, '');
//         findInputByLabelAndFill("Email Address", email);
//         speakFeedback(`Setting email.`);
//     } else if (normalizedText.startsWith("set password to ")) {
//         const password = speechText.substring(16);
//         findInputByLabelAndFill("Password", password);
//         speakFeedback("Setting password.");
//     } else if (normalizedText.startsWith("confirm password ") || normalizedText.startsWith("confirm password to ")) {
//         const password = speechText.substring(speechText.indexOf("to ") + 3);
//         findInputByLabelAndFill("Confirm Password", password);
//         speakFeedback("Confirming password.");
//     }
//     else {
//         commandHandled = false;
//     }

//     // --- Path 3: Smart Path (AI Fallback) ---
//     if (!commandHandled) {
//       try {
//           const response = await fetch(`${API_URL}/process-command`, {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({ text: speechText, page_commands: pageSpecificCommandsRef.current, location: null })
//           });
//           if (!response.ok) throw new Error(`Server error: ${response.status}`);
//           const data: ApiResponse = await response.json();
//           handleApiResponse(data);
//       } catch (error) {
//           console.error('Error processing command:', error);
//           setStatus('Error connecting to backend.');
//           speakFeedback("I'm having trouble connecting to my brain right now.");
//       }
//     }

//     setTimeout(() => {
//         isProcessingRef.current = false;
//     }, 1000); 

//   }, [handleApiResponse, API_URL, router, callEmergencyApi]); // Added callEmergencyApi

//   // --- STABLE LISTENING LOGIC (Unchanged) ---
//   const startListening = useCallback(() => {
//     if (isListening) return;

//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       alert("Browser doesn't support speech recognition.");
//       return;
//     }

//     const recognition = new SpeechRecognition();
//     recognition.continuous = true;
//     recognition.interimResults = false;
//     recognition.lang = 'en-US';

//     recognitionRef.current = recognition;
//     shouldBeListeningRef.current = true;
    
//     recognition.onstart = () => {
//       setIsListening(true);
//       setStatus('Listening...');
//     };

//     recognition.onresult = (event: SpeechRecognitionEvent) => {
//       const transcript = event.results[event.results.length - 1][0].transcript.trim();
//       processVoiceCommand(transcript);
//     };

//     recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
//       console.error("Speech recognition error", event.error);
//       if (event.error === 'no-speech') {
//         // This is a common browser timeout, the onend handler will fix it.
//       } else {
//         setStatus(`Error: ${event.error}`);
//       }
//     };
    
//     recognition.onend = () => {
//       if (shouldBeListeningRef.current) {
//         recognition.start();
//       } else {
//         setIsListening(false);
//         setStatus('Click the mic to start');
//       }
//     };
    
//     recognition.start();

//   }, [isListening, processVoiceCommand]);

//   const stopListening = useCallback(() => {
//     if (!recognitionRef.current) return;
    
//     shouldBeListeningRef.current = false; 
//     recognitionRef.current.stop();
//     recognitionRef.current = null;
//     speechSynthesis.cancel();
    
//   }, []);
  
//   const setPageSpecificCommands = useCallback((commands: string[]) => {
//       pageSpecificCommandsRef.current = commands;
//   }, []);

//   return { isListening, status, startListening, stopListening, setPageSpecificCommands };
// };


// "use client";

// import { useState, useRef, useCallback, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// // --- Interface definitions (unchanged) ---
// interface WebsiteCommandPayload {
//   action: 'scroll' | 'navigate' | 'read' | 'unknown' | 'click' | 'goToPage' | 'fillInput';
//   target: string | null;
//   direction?: 'up' | 'down' | 'top' | 'bottom' | null;
//   value?: string;
// }
// interface GeneralAnswerPayload { text_to_speak: string; }
// interface HelpActionPayload { status: 'success' | 'failed'; }
// interface PlayGamePayload { name: string; url: string; }
// interface ApiResponse {
//   type: 'WEBSITE_COMMAND' | 'GENERAL_ANSWER' | 'HELP_ACTION' | 'PLAY_GAME';
//   payload: WebsiteCommandPayload | GeneralAnswerPayload | HelpActionPayload | PlayGamePayload;
// }
// declare global { interface Window { webkitSpeechRecognition: any; } }

// // --- Helper Functions (unchanged) ---
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
//         const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
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
//             if (input) { fillAndDispatch(input); return true; }
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

// // --- Main Hook ---
// export const useVoiceControl = () => {
//   const [isListening, setIsListening] = useState(false);
//   const [status, setStatus] = useState('Click the mic to start');
  
//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const isProcessingRef = useRef(false);
//   const pageSpecificCommandsRef = useRef<string[]>([]);
//   const shouldBeListeningRef = useRef(false);
  
//   const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
//   const router = useRouter(); 

//   const handleApiResponse = useCallback((response: ApiResponse) => {
//     console.log("Handling API Response:", response);
//     // This function now ONLY handles "Smart Path" responses (AI, SOS)
//     if (response.type === 'WEBSITE_COMMAND') {
//       const command = response.payload as WebsiteCommandPayload;
//       setStatus(`Command: ${command.action}`);
//       // Fallbacks in case "Fast Path" fails or AI is needed
//       switch (command.action) {
//         case 'scroll':
//           if (command.direction === 'down') { window.scrollBy({ top: 500, behavior: 'smooth' }); speakFeedback("Scrolling down."); }
//           else if (command.direction === 'up') { window.scrollBy({ top: -500, behavior: 'smooth' }); speakFeedback("Scrolling up."); }
//           else if (command.direction === 'top' || command.target === 'top') { window.scrollTo({ top: 0, behavior: 'smooth' }); speakFeedback("Scrolling to top."); }
//           else if (command.direction === 'bottom' || command.target === 'bottom') { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); speakFeedback("Scrolling to bottom."); }
//           break;
//         case 'navigate':
//           if (command.target) {
//             const element = document.getElementById(command.target);
//             if (element) { element.scrollIntoView({ behavior: 'smooth', block: 'start' }); speakFeedback(`Navigating to ${command.target}.`); }
//           }
//           break;
//         case 'goToPage':
//            if (command.target) {
//              speakFeedback(`Going to the ${command.target.replace('/', '')} page.`);
//              router.push(command.target);
//            }
//            break;
//         case 'click':
//            if (command.target) {
//              const success = findElementByTextAndClick(command.target);
//              if (success) { speakFeedback(`Clicked ${command.target}.`); }
//            }
//            break;
//         case 'fillInput':
//            if (command.target && command.value !== undefined) {
//              const success = findInputByLabelAndFill(command.target, command.value);
//              if (success) { speakFeedback(`Okay, I've filled the ${command.target} field.`); }
//            }
//            break;
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
//         setStatus('Emergency alerts sent.');
//         speakFeedback('Emergency alerts have been sent via email and SMS with your location.');
//       } else {
//         setStatus('Failed to send alerts.');
//         speakFeedback('Sorry, there was a problem sending the emergency alerts.');
//       }
//     }
//   }, [router]);

//   const processVoiceCommand = useCallback(async (speechText: string) => {
//     if (isProcessingRef.current) return;
//     isProcessingRef.current = true;
    
//     // Remove punctuation from the end of the command
//     const normalizedText = speechText.toLowerCase().trim().replace(/[.,!?;]$/, '');
//     let commandHandled = true;

//     console.log("User said (transcribed):", `"${normalizedText}"`);
    
//     // --- FAST PATH ---
    
//     // --- UPDATED: More robust "Fast Path" logic for form filling ---
//     const fillPatterns = [
//         /(?:fill|enter|set) (?:the |my )?(full name|name) (?:as|to|with) (.+)/i,
//         /(?:fill|enter|set) (?:the |my )?(email|email address) (?:as|to|with) (.+)/i,
//         /(?:fill|enter|set) (?:the |my )?(password) (?:as|to|with) (.+)/i,
//         /(?:fill|enter|set) (?:the |my )?(confirm password) (?:as|to|with) (.+)/i,
//         /my (name) is (.+)/i,
//         /my (email|email address) is (.+)/i,
//     ];

//     let formFilled = false;
//     for (const pattern of fillPatterns) {
//         const match = speechText.toLowerCase().trim().match(pattern); // Use original speechText for value
//         if (match) {
//             let field = match[1].toLowerCase().replace("email address", "email");
//             let value = match[2];

//             let fieldLabel = "";
//             if (field.includes("name")) fieldLabel = "Full Name";
//             if (field.includes("email")) {
//                 fieldLabel = "Email Address";
//                 value = value.replace(/ at /g, '@').replace(/ dot /g, '.').replace(/\s/g, '');
//             }
//             if (field.includes("password")) fieldLabel = "Password";
//             if (field.includes("confirm password")) fieldLabel = "Confirm Password";
            
//             findInputByLabelAndFill(fieldLabel, value);
//             speakFeedback(`Setting ${fieldLabel}.`);
//             commandHandled = true;
//             formFilled = true;
//             break;
//         }
//     }

//     if (formFilled) {
//         // Command was handled
//     } else if (normalizedText.startsWith("scroll down")) {
//         window.scrollBy({ top: 500, behavior: 'smooth' });
//         speakFeedback("Scrolling down.");
//     } else if (normalizedText.startsWith("scroll up")) {
//         window.scrollBy({ top: -500, behavior: 'smooth' });
//         speakFeedback("Scrolling up.");
//     } else if (normalizedText.startsWith("scroll to top") || normalizedText.startsWith("go to top")) {
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//         speakFeedback("Scrolling to top.");
//     } else if (normalizedText.startsWith("scroll to bottom") || normalizedText.startsWith("go to bottom")) {
//         window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
//         speakFeedback("Scrolling to bottom.");
//     } 
//     else if (normalizedText.startsWith("go to home page") || normalizedText.startsWith("go to home")) {
//         router.push('/');
//         speakFeedback("Going to Home Page.");
//     }
//     else if (normalizedText.startsWith("go to communication")) {
//         router.push('/communication');
//         speakFeedback("Going to Communication.");
//     } else if (normalizedText.startsWith("go to education")) {
//         router.push('/education');
//         speakFeedback("Going to Education.");
//     } else if (normalizedText.startsWith("go to stories")) {
//         router.push('/stories');
//         speakFeedback("Going to Stories.");
//     } else if (normalizedText.startsWith("go to mission")) {
//         router.push('/mission');
//         speakFeedback("Going to Mission.");
//     }
//     // --- THIS IS THE FIX ---
//     // Added "click on" to the "Fast Path" logic
//     else if (normalizedText.startsWith("click profile") || normalizedText.startsWith("click on profile")) {
//         findElementByTextAndClick("Profile");
//         speakFeedback("Clicked Profile.");
//     } else if (normalizedText.startsWith("click log out") || normalizedText.startsWith("click on log out") || normalizedText.startsWith("click logout")) {
//         findElementByTextAndClick("Logout");
//         speakFeedback("Clicked Logout.");
//     } else if (normalizedText.startsWith("click create account") || normalizedText.startsWith("click on create account")) {
//         findElementByTextAndClick("Create Account");
//         speakFeedback("Clicked Create Account.");
//     }
//     // --- END OF FIX ---
//     else {
//         commandHandled = false;
//     }

//     // --- SMART PATH ---
//     if (!commandHandled) {
//       const isHelpCommand = normalizedText.includes('help') || normalizedText.includes('mayday');
//       let location = null;
//       if (isHelpCommand) {
//           speakFeedback("Sending emergency alerts. Getting your location...");
//           location = await getUserLocation();
//           if (!location) {
//               speakFeedback("Could not get your location. Sending alerts without location.");
//           }
//       }
//       try {
//           const response = await fetch(`${API_URL}/process-command`, {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({ text: speechText, page_commands: pageSpecificCommandsRef.current, location: location })
//           });
//           if (!response.ok) throw new Error(`Server error: ${response.status}`);
//           const data: ApiResponse = await response.json();
//           handleApiResponse(data);
//       } catch (error) {
//           console.error('Error processing command:', error);
//           setStatus('Error connecting to backend.');
//           speakFeedback("I'm having trouble connecting to my brain right now.");
//       }
//     }

//     setTimeout(() => {
//         isProcessingRef.current = false;
//     }, 1000); 

//   }, [handleApiResponse, API_URL, router]); 

//   // --- STABLE LISTENING LOGIC (Unchanged) ---
//   const startListening = useCallback(() => {
//     if (isListening) return;

//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       alert("Browser doesn't support speech recognition.");
//       return;
//     }

//     const recognition = new SpeechRecognition();
//     recognition.continuous = true;
//     recognition.interimResults = false;
//     recognition.lang = 'en-US';

//     recognitionRef.current = recognition;
//     shouldBeListeningRef.current = true;
    
//     recognition.onstart = () => {
//       setIsListening(true);
//       setStatus('Listening...');
//     };

//     recognition.onresult = (event: SpeechRecognitionEvent) => {
//       const transcript = event.results[event.results.length - 1][0].transcript.trim();
//       processVoiceCommand(transcript);
//     };

//     recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
//       console.error("Speech recognition error", event.error);
//       if (event.error === 'no-speech') {
//         // This is a common browser timeout, the onend handler will fix it.
//       } else {
//         setStatus(`Error: ${event.error}`);
//       }
//     };
    
//     recognition.onend = () => {
//       if (shouldBeListeningRef.current) {
//         recognition.start();
//       } else {
//         setIsListening(false);
//         setStatus('Click the mic to start');
//       }
//     };
    
//     recognition.start();

//   }, [isListening, processVoiceCommand]);

//   const stopListening = useCallback(() => {
//     if (!recognitionRef.current) return;
    
//     shouldBeListeningRef.current = false; 
//     recognitionRef.current.stop();
//     recognitionRef.current = null;
//     speechSynthesis.cancel();
    
//   }, []);
  
//   const setPageSpecificCommands = useCallback((commands: string[]) => {
//       pageSpecificCommandsRef.current = commands;
//   }, []);

//   return { isListening, status, startListening, stopListening, setPageSpecificCommands };
// };

// "use client";

// import { useState, useRef, useCallback, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// // --- Interface definitions (unchanged) ---
// interface WebsiteCommandPayload {
//   action: 'scroll' | 'navigate' | 'read' | 'unknown' | 'click' | 'goToPage' | 'fillInput';
//   target: string | null;
//   direction?: 'up' | 'down' | 'top' | 'bottom' | null;
//   value?: string;
// }
// interface GeneralAnswerPayload { text_to_speak: string; }
// interface HelpActionPayload { status: 'success' | 'failed'; }
// interface PlayGamePayload { name: string; url: string; }
// interface ApiResponse {
//   type: 'WEBSITE_COMMAND' | 'GENERAL_ANSWER' | 'HELP_ACTION' | 'PLAY_GAME';
//   payload: WebsiteCommandPayload | GeneralAnswerPayload | HelpActionPayload | PlayGamePayload;
// }
// declare global { interface Window { webkitSpeechRecognition: any; } }

// // --- Helper Functions (unchanged) ---
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
//         const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
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
//             if (input) { fillAndDispatch(input); return true; }
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

// // --- Main Hook ---
// export const useVoiceControl = () => {
//   const [isListening, setIsListening] = useState(false);
//   const [status, setStatus] = useState('Click the mic to start');
  
//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const isProcessingRef = useRef(false);
//   const pageSpecificCommandsRef = useRef<string[]>([]);
//   const shouldBeListeningRef = useRef(false);
  
//   const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
//   const router = useRouter(); 

//   const handleApiResponse = useCallback((response: ApiResponse) => {
//     console.log("Handling API Response:", response);
//     // This function now ONLY handles "Smart Path" responses (AI, SOS)
//     if (response.type === 'WEBSITE_COMMAND') {
//       const command = response.payload as WebsiteCommandPayload;
//       setStatus(`Command: ${command.action}`);
//       // Fallbacks in case "Fast Path" fails or AI is needed
//       switch (command.action) {
//         case 'scroll':
//           if (command.direction === 'down') { window.scrollBy({ top: 500, behavior: 'smooth' }); speakFeedback("Scrolling down."); }
//           else if (command.direction === 'up') { window.scrollBy({ top: -500, behavior: 'smooth' }); speakFeedback("Scrolling up."); }
//           else if (command.direction === 'top' || command.target === 'top') { window.scrollTo({ top: 0, behavior: 'smooth' }); speakFeedback("Scrolling to top."); }
//           else if (command.direction === 'bottom' || command.target === 'bottom') { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); speakFeedback("Scrolling to bottom."); }
//           break;
//         case 'navigate':
//           if (command.target) {
//             const element = document.getElementById(command.target);
//             if (element) { element.scrollIntoView({ behavior: 'smooth', block: 'start' }); speakFeedback(`Navigating to ${command.target}.`); }
//           }
//           break;
//         case 'goToPage':
//            if (command.target) {
//              speakFeedback(`Going to the ${command.target.replace('/', '')} page.`);
//              router.push(command.target);
//            }
//            break;
//         case 'click':
//            if (command.target) {
//              const success = findElementByTextAndClick(command.target);
//              if (success) { speakFeedback(`Clicked ${command.target}.`); }
//            }
//            break;
//         case 'fillInput':
//            if (command.target && command.value !== undefined) {
//              const success = findInputByLabelAndFill(command.target, command.value);
//              if (success) { speakFeedback(`Okay, I've filled the ${command.target} field.`); }
//            }
//            break;
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
//         setStatus('Emergency alerts sent.');
//         speakFeedback('Emergency alerts have been sent via email and SMS with your location.');
//       } else {
//         setStatus('Failed to send alerts.');
//         speakFeedback('Sorry, there was a problem sending the emergency alerts.');
//       }
//     }
//   }, [router]);

//   const processVoiceCommand = useCallback(async (speechText: string) => {
//     if (isProcessingRef.current) return;
//     isProcessingRef.current = true;
    
//     // Remove punctuation from the end of the command
//     const normalizedText = speechText.toLowerCase().trim().replace(/[.,!?;]$/, '');
//     let commandHandled = true;

//     console.log("User said (transcribed):", `"${normalizedText}"`);
    
//     // --- FAST PATH ---
    
//     // --- 1. Form Filling (Most Specific) ---
//     const fillPatterns = [
//         /(?:fill|enter|set) (?:the |my )?(full name|name) (?:as|to|with) (.+)/i,
//         /(?:fill|enter|set) (?:the |my )?(email|email address) (?:as|to|with) (.+)/i,
//         /(?:fill|enter|set) (?:the |my )?(password) (?:as|to|with) (.+)/i,
//         /(?:fill|enter|set) (?:the |my )?(confirm password) (?:as|to|with) (.+)/i,
//         /my (name) is (.+)/i,
//         /my (email|email address) is (.+)/i,
//     ];

//     let formFilled = false;
//     for (const pattern of fillPatterns) {
//         const match = speechText.toLowerCase().trim().match(pattern);
//         if (match) {
//             let field = match[1].toLowerCase().replace("email address", "email");
//             let value = match[2];
//             let fieldLabel = "";
//             if (field.includes("name")) fieldLabel = "Full Name";
//             if (field.includes("email")) {
//                 fieldLabel = "Email Address";
//                 value = value.replace(/ at /g, '@').replace(/ dot /g, '.').replace(/\s/g, '');
//             }
//             if (field.includes("password")) fieldLabel = "Password";
//             if (field.includes("confirm password")) fieldLabel = "Confirm Password";
            
//             findInputByLabelAndFill(fieldLabel, value);
//             speakFeedback(`Setting ${fieldLabel}.`);
//             commandHandled = true;
//             formFilled = true;
//             break;
//         }
//     }

//     // --- 2. Scrolling, Navigation, and Clicks ---
//     if (!formFilled) {
//         if (normalizedText.startsWith("scroll down")) {
//             window.scrollBy({ top: 500, behavior: 'smooth' });
//             speakFeedback("Scrolling down.");
//         } else if (normalizedText.startsWith("scroll up")) {
//             window.scrollBy({ top: -500, behavior: 'smooth' });
//             speakFeedback("Scrolling up.");
//         } else if (normalizedText.startsWith("scroll to top") || normalizedText.startsWith("go to top")) {
//             window.scrollTo({ top: 0, behavior: 'smooth' });
//             speakFeedback("Scrolling to top.");
//         } else if (normalizedText.startsWith("scroll to bottom") || normalizedText.startsWith("go to bottom")) {
//             window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
//             speakFeedback("Scrolling to bottom.");
//         } 
//         else if (normalizedText.startsWith("go to home page") || normalizedText.startsWith("go to home")) {
//             router.push('/');
//             speakFeedback("Going to Home Page.");
//         }
//         else if (normalizedText.startsWith("go to communication")) {
//             router.push('/communication');
//             speakFeedback("Going to Communication.");
//         } else if (normalizedText.startsWith("go to education")) {
//             router.push('/education');
//             speakFeedback("Going to Education.");
//         } else if (normalizedText.startsWith("go to stories")) {
//             router.push('/stories');
//             speakFeedback("Going to Stories.");
//         } else if (normalizedText.startsWith("go to mission")) {
//             router.push('/mission');
//             speakFeedback("Going to Mission.");
//         }
        
//         // --- NEW, ROBUST CLICK LOGIC ---
//         else if (normalizedText.startsWith("click")) {
//             // Extracts "profile" from "click on profile" or "click profile"
//             const targetText = normalizedText.replace("click on ", "").replace("click ", "");
            
//             // Map spoken commands to the exact text on the button
//             let buttonText = "";
//             if (targetText === "profile") buttonText = "Profile";
//             else if (targetText === "log out" || targetText === "logout") buttonText = "Logout";
//             else if (targetText === "create account") buttonText = "Create Account";
//             else if (targetText === "sign in" || targetText === "sign in here") buttonText = "Sign in here";
//             else if (targetText === "sign up") buttonText = "Sign Up";
            
//             if (buttonText) {
//                 const success = findElementByTextAndClick(buttonText);
//                 if(success) {
//                     speakFeedback(`Clicked ${buttonText}.`);
//                 } else {
//                     // Fallback to API if we can't find it
//                     commandHandled = false;
//                 }
//             } else {
//                 commandHandled = false; // Not a click command we recognize
//             }
//         }
//         // --- END OF NEW CLICK LOGIC ---

//         else {
//             commandHandled = false;
//         }
//     }

//     // --- 3. SMART PATH (Unchanged) ---
//     if (!commandHandled) {
//       const isHelpCommand = normalizedText.includes('help') || normalizedText.includes('mayday');
//       let location = null;
//       if (isHelpCommand) {
//           speakFeedback("Sending emergency alerts. Getting your location...");
//           location = await getUserLocation();
//           if (!location) {
//               speakFeedback("Could not get your location. Sending alerts without location.");
//           }
//       }
//       try {
//           const response = await fetch(`${API_URL}/process-command`, {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({ text: speechText, page_commands: pageSpecificCommandsRef.current, location: location })
//           });
//           if (!response.ok) throw new Error(`Server error: ${response.status}`);
//           const data: ApiResponse = await response.json();
//           handleApiResponse(data);
//       } catch (error) {
//           console.error('Error processing command:', error);
//           setStatus('Error connecting to backend.');
//           speakFeedback("I'm having trouble connecting to my brain right now.");
//       }
//     }

//     setTimeout(() => {
//         isProcessingRef.current = false;
//     }, 1000); 

//   }, [handleApiResponse, API_URL, router]); 

//   // --- STABLE LISTENING LOGIC (Unchanged) ---
//   const startListening = useCallback(() => {
//     if (isListening) return;

//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       alert("Browser doesn't support speech recognition.");
//       return;
//     }

//     const recognition = new SpeechRecognition();
//     recognition.continuous = true;
//     recognition.interimResults = false;
//     recognition.lang = 'en-US';

//     recognitionRef.current = recognition;
//     shouldBeListeningRef.current = true;
    
//     recognition.onstart = () => {
//       setIsListening(true);
//       setStatus('Listening...');
//     };

//     recognition.onresult = (event: SpeechRecognitionEvent) => {
//       const transcript = event.results[event.results.length - 1][0].transcript.trim();
//       processVoiceCommand(transcript);
//     };

//     recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
//       console.error("Speech recognition error", event.error);
//       if (event.error === 'no-speech') {
//         // This is a common browser timeout, the onend handler will fix it.
//       } else {
//         setStatus(`Error: ${event.error}`);
//       }
//     };
    
//     recognition.onend = () => {
//       if (shouldBeListeningRef.current) {
//         recognition.start();
//       } else {
//         setIsListening(false);
//         setStatus('Click the mic to start');
//       }
//     };
    
//     recognition.start();

//   }, [isListening, processVoiceCommand]);

//   const stopListening = useCallback(() => {
//     if (!recognitionRef.current) return;
    
//     shouldBeListeningRef.current = false; 
//     recognitionRef.current.stop();
//     recognitionRef.current = null;
//     speechSynthesis.cancel();
    
//   }, []);
  
//   const setPageSpecificCommands = useCallback((commands: string[]) => {
//       pageSpecificCommandsRef.current = commands;
//   }, []);

//   return { isListening, status, startListening, stopListening, setPageSpecificCommands };
// };

// "use client";

// import { useState, useRef, useCallback, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// // --- Interface definitions (unchanged) ---
// interface WebsiteCommandPayload {
//   action: 'scroll' | 'navigate' | 'read' | 'unknown' | 'click' | 'goToPage' | 'fillInput';
//   target: string | null;
//   direction?: 'up' | 'down' | 'top' | 'bottom' | null;
//   value?: string;
// }
// interface GeneralAnswerPayload { text_to_speak: string; }
// interface HelpActionPayload { status: 'success' | 'failed'; }
// interface PlayGamePayload { name: string; url: string; }
// interface ApiResponse {
//   type: 'WEBSITE_COMMAND' | 'GENERAL_ANSWER' | 'HELP_ACTION' | 'PLAY_GAME';
//   payload: WebsiteCommandPayload | GeneralAnswerPayload | HelpActionPayload | PlayGamePayload;
// }
// declare global { interface Window { webkitSpeechRecognition: any; } }

// // --- Helper Functions (unchanged) ---
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
//         const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
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
//             if (input) { fillAndDispatch(input); return true; }
//         }
//     }
//     const inputs = document.querySelectorAll('input, textarea');
//     for (const input of Array.from(inputs)) {
//         const ariaLabel = input.getAttribute('aria-label')?.toLowerCase();
//         const placeholder = input.getAttribute('placeholder')?.toLowerCase();
//         // Check for placeholder text which is very common
//         if (ariaLabel?.includes(sanitizedLabel) || placeholder?.includes(sanitizedLabel)) {
//             fillAndDispatch(input as HTMLInputElement);
//             return true;
//         }
//     }
//     return false;
// };

// // --- Main Hook ---
// export const useVoiceControl = () => {
//   const [isListening, setIsListening] = useState(false);
//   const [status, setStatus] = useState('Click the mic to start');
  
//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const isProcessingRef = useRef(false);
//   const pageSpecificCommandsRef = useRef<string[]>([]);
//   const shouldBeListeningRef = useRef(false);
  
//   const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
//   const router = useRouter(); 

//   const handleApiResponse = useCallback((response: ApiResponse) => {
//     console.log("Handling API Response:", response);
//     // This function now ONLY handles "Smart Path" responses (AI, SOS)
//     if (response.type === 'WEBSITE_COMMAND') {
//       const command = response.payload as WebsiteCommandPayload;
//       setStatus(`Command: ${command.action}`);
//       // This is now just a fallback for any commands the "Fast Path" missed
//       switch (command.action) {
//         // ... (all cases remain as fallbacks)
//       }
//     } else if (response.type === 'GENERAL_ANSWER') {
//       const answer = response.payload as GeneralAnswerPayload;
//       setStatus('Answering question...');
//       speakFeedback(answer.text_to_speak);
//     } else if (response.type === 'HELP_ACTION') {
//       const helpAction = response.payload as HelpActionPayload;
//       if (helpAction.status === 'success') {
//         setStatus('Emergency alerts sent.');
//         speakFeedback('Emergency alerts have been sent via email and SMS with your location.');
//       } else {
//         setStatus('Failed to send alerts.');
//         speakFeedback('Sorry, there was a problem sending the emergency alerts.');
//       }
//     }
//   }, [router]);

//   const processVoiceCommand = useCallback(async (speechText: string) => {
//     if (isProcessingRef.current) return;
//     isProcessingRef.current = true;
    
//     // Remove punctuation from the end of the command
//     const normalizedText = speechText.toLowerCase().trim().replace(/[.,!?;]$/, '');
//     let commandHandled = true;

//     console.log("User said (transcribed):", `"${normalizedText}"`);
    
//     // --- FAST PATH ---
    
//     // --- 1. Form Filling (Most Specific) ---
//     // This regex now finds the field and the value
//     const fillPattern = /(?:fill|enter|set) (?:the |my )?(full name|name|email|email address|password|confirm password) (?:as|to|with) (.+)/i;
//     const simpleFillPattern = /my (name|email|email address) is (.+)/i;

//     let fillMatch = normalizedText.match(fillPattern);
//     if (!fillMatch) {
//       fillMatch = normalizedText.match(simpleFillPattern);
//     }

//     if (fillMatch) {
//         let field = fillMatch[1].toLowerCase().replace("email address", "email");
//         let value = fillMatch[2];
//         let fieldLabel = "";

//         if (field.includes("name")) fieldLabel = "Full Name";
//         else if (field.includes("email")) {
//             fieldLabel = "Email Address";
//             value = value.replace(/ at /g, '@').replace(/ dot /g, '.').replace(/\s/g, '');
//         }
//         else if (field === "password") fieldLabel = "Password"; // Use exact match for password
//         else if (field.includes("confirm password")) fieldLabel = "Confirm Password";
        
//         if (fieldLabel) {
//             findInputByLabelAndFill(fieldLabel, value);
//             speakFeedback(`Setting ${fieldLabel}.`);
//         } else {
//             commandHandled = false; // Let AI try
//         }
//     }
    
//     // --- 2. Scrolling, Navigation, and Clicks ---
//     else if (normalizedText.startsWith("scroll down")) {
//         window.scrollBy({ top: 500, behavior: 'smooth' });
//         speakFeedback("Scrolling down.");
//     } else if (normalizedText.startsWith("scroll up")) {
//         window.scrollBy({ top: -500, behavior: 'smooth' });
//         speakFeedback("Scrolling up.");
//     } else if (normalizedText.startsWith("scroll to top") || normalizedText.startsWith("go to top")) {
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//         speakFeedback("Scrolling to top.");
//     } else if (normalizedText.startsWith("scroll to bottom") || normalizedText.startsWith("go to bottom")) {
//         window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
//         speakFeedback("Scrolling to bottom.");
//     } 
//     else if (normalizedText.startsWith("go to home page") || normalizedText.startsWith("go to home")) {
//         router.push('/');
//         speakFeedback("Going to Home Page.");
//     }
//     else if (normalizedText.startsWith("go to communication")) {
//         router.push('/communication');
//         speakFeedback("Going to Communication.");
//     } else if (normalizedText.startsWith("go to education")) {
//         router.push('/education');
//         speakFeedback("Going to Education.");
//     } else if (normalizedText.startsWith("go to stories")) {
//         router.push('/stories');
//         speakFeedback("Going to Stories.");
//     } else if (normalizedText.startsWith("go to mission")) {
//         router.push('/mission');
//         speakFeedback("Going to Mission.");
//     }
    
//     // --- FINAL ROBUST CLICK LOGIC ---
//     else if (normalizedText.startsWith("click")) {
//         const targetText = normalizedText.replace("click on ", "").replace("click ", "");
        
//         // This is a map of *spoken* commands to the *exact text* on the button
//         const buttonMap: { [key: string]: string } = {
//             "profile": "Profile",
//             "log out": "Logout",
//             "logout": "Logout",
//             "create account": "Create Account",
//             "sign in": "Sign in here",
//             "sign in here": "Sign in here",
//             "sign up": "Sign Up",
//             "login": "Login"
//         };
        
//         const buttonText = buttonMap[targetText];
        
//         if (buttonText) {
//             const success = findElementByTextAndClick(buttonText);
//             if(success) {
//                 speakFeedback(`Clicked ${buttonText}.`);
//             } else {
//                 speakFeedback(`Sorry, I couldn't find the ${buttonText} button.`);
//             }
//         } else {
//             commandHandled = false; // Not a click command we recognize
//         }
//     }
//     // --- END OF CLICK LOGIC ---

//     else {
//         commandHandled = false;
//     }

//     // --- 3. SMART PATH (Unchanged) ---
//     if (!commandHandled) {
//       const isHelpCommand = normalizedText.includes('help') || normalizedText.includes('mayday');
//       let location = null;
//       if (isHelpCommand) {
//           speakFeedback("Sending emergency alerts. Getting your location...");
//           location = await getUserLocation();
//           if (!location) {
//               speakFeedback("Could not get your location. Sending alerts without location.");
//           }
//       }
//       try {
//           const response = await fetch(`${API_URL}/process-command`, {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({ text: speechText, page_commands: pageSpecificCommandsRef.current, location: location })
//           });
//           if (!response.ok) throw new Error(`Server error: ${response.status}`);
//           const data: ApiResponse = await response.json();
//           handleApiResponse(data);
//       } catch (error) {
//           console.error('Error processing command:', error);
//           setStatus('Error connecting to backend.');
//           speakFeedback("I'm having trouble connecting to my brain right now.");
//       }
//     }

//     setTimeout(() => {
//         isProcessingRef.current = false;
//     }, 1000); 

//   }, [handleApiResponse, API_URL, router]); 

//   // --- STABLE LISTENING LOGIC (Unchanged) ---
//   const startListening = useCallback(() => {
//     if (isListening) return;

//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       alert("Browser doesn't support speech recognition.");
//       return;
//     }

//     const recognition = new SpeechRecognition();
//     recognition.continuous = true;
//     recognition.interimResults = false;
//     recognition.lang = 'en-US';

//     recognitionRef.current = recognition;
//     shouldBeListeningRef.current = true;
    
//     recognition.onstart = () => {
//       setIsListening(true);
//       setStatus('Listening...');
//     };

//     recognition.onresult = (event: SpeechRecognitionEvent) => {
//       const transcript = event.results[event.results.length - 1][0].transcript.trim();
//       processVoiceCommand(transcript);
//     };

//     recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
//       console.error("Speech recognition error", event.error);
//       if (event.error === 'no-speech') {
//         // This is a common browser timeout, the onend handler will fix it.
//       } else {
//         setStatus(`Error: ${event.error}`);
//       }
//     };
    
//     recognition.onend = () => {
//       if (shouldBeListeningRef.current) {
//         recognition.start();
//       } else {
//         setIsListening(false);
//         setStatus('Click the mic to start');
//       }
//     };
    
//     recognition.start();

//   }, [isListening, processVoiceCommand]);

//   const stopListening = useCallback(() => {
//     if (!recognitionRef.current) return;
    
//     shouldBeListeningRef.current = false; 
//     recognitionRef.current.stop();
//     recognitionRef.current = null;
//     speechSynthesis.cancel();
    
//   }, []);
  
//   const setPageSpecificCommands = useCallback((commands: string[]) => {
//       pageSpecificCommandsRef.current = commands;
//   }, []);

//   return { isListening, status, startListening, stopListening, setPageSpecificCommands };
// };

// "use client";

// import { useState, useRef, useCallback, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// // --- Interface definitions (unchanged) ---
// interface WebsiteCommandPayload {
//   action: 'scroll' | 'navigate' | 'read' | 'unknown' | 'click' | 'goToPage' | 'fillInput';
//   target: string | null;
//   direction?: 'up' | 'down' | 'top' | 'bottom' | null;
//   value?: string;
// }
// interface GeneralAnswerPayload { text_to_speak: string; }
// interface HelpActionPayload { status: 'success' | 'failed'; }
// interface PlayGamePayload { name: string; url: string; }
// interface ApiResponse {
//   type: 'WEBSITE_COMMAND' | 'GENERAL_ANSWER' | 'HELP_ACTION' | 'PLAY_GAME';
//   payload: WebsiteCommandPayload | GeneralAnswerPayload | HelpActionPayload | PlayGamePayload;
// }
// declare global { interface Window { webkitSpeechRecognition: any; } }

// // --- Helper Functions (unchanged) ---
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

// // --- UPDATED findInputByLabelAndFill function ---
// const findInputByLabelAndFill = (labelText: string, value: string): boolean => {
//     if (!labelText || value === undefined) return false;
//     // This now also checks for "e-mail" and "email address"
//     const sanitizedLabel = labelText.trim().toLowerCase().replace("e-mail", "email").replace("email address", "email");
    
//     const fillAndDispatch = (input: HTMLInputElement | HTMLTextAreaElement) => {
//         const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
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
//         // Also check for "e-mail" and "email address" in the label
//         const labelTextContent = label.textContent?.trim().toLowerCase().replace("e-mail", "email").replace("email address", "email");
//         if (labelTextContent?.includes(sanitizedLabel)) {
//             const inputId = label.getAttribute('for');
//             const input = inputId ? document.getElementById(inputId) as HTMLInputElement | HTMLTextAreaElement : null;
//             if (input) { fillAndDispatch(input); return true; }
//         }
//     }
//     const inputs = document.querySelectorAll('input, textarea');
//     for (const input of Array.from(inputs)) {
//         const ariaLabel = input.getAttribute('aria-label')?.toLowerCase().replace("e-mail", "email").replace("email address", "email");
//         const placeholder = input.getAttribute('placeholder')?.toLowerCase().replace("e-mail", "email").replace("email address", "email");
//         if (ariaLabel?.includes(sanitizedLabel) || placeholder?.includes(sanitizedLabel)) {
//             fillAndDispatch(input as HTMLInputElement);
//             return true;
//         }
//     }
//     return false;
// };


// // --- Main Hook ---
// export const useVoiceControl = () => {
//   const [isListening, setIsListening] = useState(false);
//   const [status, setStatus] = useState('Click the mic to start');
  
//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const isProcessingRef = useRef(false);
//   const pageSpecificCommandsRef = useRef<string[]>([]);
//   const shouldBeListeningRef = useRef(false);
  
//   const API_URL = process.env.NEXT_PUBLIC_API_URL;
//   const router = useRouter(); 

//   const handleApiResponse = useCallback((response: ApiResponse) => {
//     console.log("Handling API Response:", response);
//     // This function now ONLY handles "Smart Path" responses (AI, SOS)
//     if (response.type === 'WEBSITE_COMMAND') {
//       const command = response.payload as WebsiteCommandPayload;
//       setStatus(`Command: ${command.action}`);
//       // Fallbacks in case "Fast Path" fails or AI is needed
//       switch (command.action) {
//         case 'scroll':
//           if (command.direction === 'down') { window.scrollBy({ top: 500, behavior: 'smooth' }); speakFeedback("Scrolling down."); }
//           else if (command.direction === 'up') { window.scrollBy({ top: -500, behavior: 'smooth' }); speakFeedback("Scrolling up."); }
//           else if (command.direction === 'top' || command.target === 'top') { window.scrollTo({ top: 0, behavior: 'smooth' }); speakFeedback("Scrolling to top."); }
//           else if (command.direction === 'bottom' || command.target === 'bottom') { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); speakFeedback("Scrolling to bottom."); }
//           break;
//         case 'navigate':
//           if (command.target) {
//             const element = document.getElementById(command.target);
//             if (element) { element.scrollIntoView({ behavior: 'smooth', block: 'start' }); speakFeedback(`Navigating to ${command.target}.`); }
//           }
//           break;
//         case 'goToPage':
//            if (command.target) {
//              speakFeedback(`Going to the ${command.target.replace('/', '')} page.`);
//              router.push(command.target);
//            }
//            break;
//         case 'click':
//            if (command.target) {
//              const success = findElementByTextAndClick(command.target);
//              if (success) { speakFeedback(`Clicked ${command.target}.`); }
//            }
//            break;
//         case 'fillInput':
//            if (command.target && command.value !== undefined) {
//              const success = findInputByLabelAndFill(command.target, command.value);
//              if (success) { speakFeedback(`Okay, I've filled the ${command.target} field.`); }
//            }
//            break;
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
//         setStatus('Emergency alerts sent.');
//         speakFeedback('Emergency alerts have been sent via email and SMS with your location.');
//       } else {
//         setStatus('Failed to send alerts.');
//         speakFeedback('Sorry, there was a problem sending the emergency alerts.');
//       }
//     }
//   }, [router]);

//   const processVoiceCommand = useCallback(async (speechText: string) => {
//     if (isProcessingRef.current) return;
//     isProcessingRef.current = true;
    
//     // Remove punctuation from the end of the command
//     const normalizedText = speechText.toLowerCase().trim().replace(/[.,!?;]$/, '');
//     let commandHandled = true;

//     console.log("User said (transcribed):", `"${normalizedText}"`);
    
//     // --- FAST PATH ---
    
//     // --- 1. Form Filling (Most Specific) ---
//     // UPDATED: Added "e-mail" to the regex
//     const fillPattern = /(?:fill|enter|set) (?:the |my )?(full name|name|email|e-mail|email address|password|confirm password) (?:as|to|with) (.+)/i;
//     const simpleFillPattern = /my (name|email|e-mail|email address) is (.+)/i;

//     // --- BUG FIX: We now match against normalizedText ---
//     let fillMatch = normalizedText.match(fillPattern);
//     if (!fillMatch) {
//       fillMatch = normalizedText.match(simpleFillPattern);
//     }

//     let formFilled = false;
//     if (fillMatch) {
//         // Use replace() to handle "e-mail" and "email address"
//         let field = fillMatch[1].toLowerCase().replace("e-mail", "email").replace("email address", "email");
//         let value = fillMatch[2];
//         let fieldLabel = "";

//         // --- BUG FIX: Swapped order of password and confirm password ---
//         if (field.includes("name")) fieldLabel = "Full Name";
//         else if (field.includes("email")) {
//             fieldLabel = "Email Address";
//             value = value.replace(/ at /g, '@').replace(/ dot /g, '.').replace(/\s/g, '');
//         }
//         else if (field.includes("confirm password")) fieldLabel = "Confirm Password";
//         else if (field.includes("password")) fieldLabel = "Password";
        
//         if (fieldLabel) {
//             findInputByLabelAndFill(fieldLabel, value);
//             speakFeedback(`Setting ${fieldLabel}.`);
//             commandHandled = true;
//             formFilled = true;
//         } else {
//             commandHandled = false; // Let AI try
//         }
//     }
    
//     // --- 2. Scrolling, Navigation, and Clicks ---
//     else if (normalizedText.startsWith("scroll down")) {
//         window.scrollBy({ top: 500, behavior: 'smooth' });
//         speakFeedback("Scrolling down.");
//     } else if (normalizedText.startsWith("scroll up")) {
//         window.scrollBy({ top: -500, behavior: 'smooth' });
//         speakFeedback("Scrolling up.");
//     } else if (normalizedText.startsWith("scroll to top") || normalizedText.startsWith("go to top")) {
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//         speakFeedback("Scrolling to top.");
//     } else if (normalizedText.startsWith("scroll to bottom") || normalizedText.startsWith("go to bottom")) {
//         window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
//         speakFeedback("Scrolling to bottom.");
//     } 
//     else if (normalizedText.startsWith("go to home page") || normalizedText.startsWith("go to home")) {
//         router.push('/');
//         speakFeedback("Going to Home Page.");
//     }
//     else if (normalizedText.startsWith("go to communication")) {
//         router.push('/communication');
//         speakFeedback("Going to Communication.");
//     } else if (normalizedText.startsWith("go to education")) {
//         router.push('/education');
//         speakFeedback("Going to Education.");
//     } else if (normalizedText.startsWith("go to stories")) {
//         router.push('/stories');
//         speakFeedback("Going to Stories.");
//     } else if (normalizedText.startsWith("go to mission")) {
//         router.push('/mission');
//         speakFeedback("Going to Mission.");
//     }
    
//     // --- UPDATED: Robust Click Logic ---
//     else if (normalizedText.startsWith("click")) {
//         // Extracts "profile" from "click on profile" or "click profile"
//         const targetText = normalizedText.replace("click on ", "").replace("click ", "");
        
//         // This is a map of *spoken* commands to the *exact text* on the button
//         const buttonMap: { [key: string]: string } = {
//             "profile": "Profile",
//             "log out": "Logout",
//             "logout": "Logout",
//             "create account": "Create Account",
//             "sign in": "Sign in",
//             "sign in here": "Sign in",
//             "sign up": "Sign Up",
//             "login": "Login"
//         };
        
//         const buttonText = buttonMap[targetText];
        
//         if (buttonText) {
//             const success = findElementByTextAndClick(buttonText);
//             if(success) {
//                 speakFeedback(`Clicked ${buttonText}.`);
//             } else {
//                 speakFeedback(`Sorry, I couldn't find the ${buttonText} button.`);
//             }
//         } else {
//             commandHandled = false; // Not a click command we recognize
//         }
//     }
//     // --- END OF CLICK LOGIC ---

//     else {
//         commandHandled = false;
//     }

//     // --- 3. SMART PATH (Unchanged) ---
//     if (!commandHandled) {
//       const isHelpCommand = normalizedText.includes('help') || normalizedText.includes('mayday');
//       let location = null;
//       if (isHelpCommand) {
//           speakFeedback("Sending emergency alerts. Getting your location...");
//           location = await getUserLocation();
//           if (!location) {
//               speakFeedback("Could not get your location. Sending alerts without location.");
//           }
//       }
//       try {
//           const response = await fetch(`${API_URL}/emergency-alert`, {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({ text: speechText, page_commands: pageSpecificCommandsRef.current, location: location })
//           });
//           if (!response.ok) throw new Error(`Server error: ${response.status}`);
//           const data: ApiResponse = await response.json();
//           handleApiResponse(data);
//       } catch (error) {
//           console.error('Error processing command:', error);
//           setStatus('Error connecting to backend.');
//           speakFeedback("I'm having trouble connecting to my brain right now.");
//       }
//     }

//     setTimeout(() => {
//         isProcessingRef.current = false;
//     }, 1000); 

//   }, [handleApiResponse, API_URL, router]); 

//   // --- STABLE LISTENING LOGIC (Unchanged) ---
//   const startListening = useCallback(() => {
//     if (isListening) return;

//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       alert("Browser doesn't support speech recognition.");
//       return;
//     }

//     const recognition = new SpeechRecognition();
//     recognition.continuous = true;
//     recognition.interimResults = false;
//     recognition.lang = 'en-US';

//     recognitionRef.current = recognition;
//     shouldBeListeningRef.current = true;
    
//     recognition.onstart = () => {
//       setIsListening(true);
//       setStatus('Listening...');
//     };

//     recognition.onresult = (event: SpeechRecognitionEvent) => {
//       const transcript = event.results[event.results.length - 1][0].transcript.trim();
//       processVoiceCommand(transcript);
//     };

//     recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
//       console.error("Speech recognition error", event.error);
//       if (event.error === 'no-speech') {
//         // This is a common browser timeout, the onend handler will fix it.
//       } else {
//         setStatus(`Error: ${event.error}`);
//       }
//     };
    
//     recognition.onend = () => {
//       if (shouldBeListeningRef.current) {
//         recognition.start();
//       } else {
//         setIsListening(false);
//         setStatus('Click the mic to start');
//       }
//     };
    
//     recognition.start();

//   }, [isListening, processVoiceCommand]);

//   const stopListening = useCallback(() => {
//     if (!recognitionRef.current) return;
    
//     shouldBeListeningRef.current = false; 
//     recognitionRef.current.stop();
//     recognitionRef.current = null;
//     speechSynthesis.cancel();
    
//   }, []);
  
//   const setPageSpecificCommands = useCallback((commands: string[]) => {
//       pageSpecificCommandsRef.current = commands;
//   }, []);

//   return { isListening, status, startListening, stopListening, setPageSpecificCommands };
// };

// "use client";

// import { useState, useRef, useCallback } from 'react';
// import { useRouter } from 'next/navigation';

// // --- Interface definitions (unchanged) ---
// interface WebsiteCommandPayload {
//   action: 'scroll' | 'navigate' | 'read' | 'unknown' | 'click' | 'goToPage' | 'fillInput';
//   target: string | null;
//   direction?: 'up' | 'down' | 'top' | 'bottom' | null;
//   value?: string;
// }
// interface GeneralAnswerPayload { text_to_speak: string; }
// interface HelpActionPayload { status: 'success' | 'failed'; }
// interface PlayGamePayload { name: string; url: string; }
// interface ApiResponse {
//   type: 'WEBSITE_COMMAND' | 'GENERAL_ANSWER' | 'HELP_ACTION' | 'PLAY_GAME';
//   payload: WebsiteCommandPayload | GeneralAnswerPayload | HelpActionPayload | PlayGamePayload;
// }
// declare global { interface Window { webkitSpeechRecognition: any; } }

// // --- Helper Functions (unchanged) ---
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
//   if (!labelText || value === undefined) return false;
//   const sanitizedLabel = labelText.trim().toLowerCase().replace("e-mail", "email").replace("email address", "email");

//   const fillAndDispatch = (input: HTMLInputElement | HTMLTextAreaElement) => {
//     const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
//     if (nativeInputValueSetter) {
//       nativeInputValueSetter.call(input, value);
//     } else {
//       input.value = value;
//     }
//     const inputEvent = new Event('input', { bubbles: true, cancelable: true });
//     const changeEvent = new Event('change', { bubbles: true, cancelable: true });
//     input.dispatchEvent(inputEvent);
//     input.dispatchEvent(changeEvent);
//   };

//   const labels = document.querySelectorAll('label');
//   for (const label of Array.from(labels)) {
//     const labelTextContent = label.textContent?.trim().toLowerCase().replace("e-mail", "email").replace("email address", "email");
//     if (labelTextContent?.includes(sanitizedLabel)) {
//       const inputId = label.getAttribute('for');
//       const input = inputId ? document.getElementById(inputId) as HTMLInputElement | HTMLTextAreaElement : null;
//       if (input) { fillAndDispatch(input); return true; }
//     }
//   }
//   const inputs = document.querySelectorAll('input, textarea');
//   for (const input of Array.from(inputs)) {
//     const ariaLabel = input.getAttribute('aria-label')?.toLowerCase().replace("e-mail", "email").replace("email address", "email");
//     const placeholder = input.getAttribute('placeholder')?.toLowerCase().replace("e-mail", "email").replace("email address", "email");
//     if (ariaLabel?.includes(sanitizedLabel) || placeholder?.includes(sanitizedLabel)) {
//       fillAndDispatch(input as HTMLInputElement);
//       return true;
//     }
//   }
//   return false;
// };

// // --- Main Hook ---
// export const useVoiceControl = () => {
//   const [isListening, setIsListening] = useState(false);
//   const [status, setStatus] = useState('Click the mic to start');
//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const isProcessingRef = useRef(false);
//   const shouldBeListeningRef = useRef(false);
//   const router = useRouter();
//   const API_URL = process.env.NEXT_PUBLIC_API_URL;

//   const processVoiceCommand = useCallback(async (speechText: string) => {
//     if (isProcessingRef.current) return;
//     isProcessingRef.current = true;

//     const normalizedText = speechText.toLowerCase().trim().replace(/[.,!?;]$/, '');
//     console.log("User said (transcribed):", `"${normalizedText}"`);

//     let commandHandled = true;

//     // --- 1. Form Filling ---
//     const fillPattern = /(?:fill|enter|set) (?:the |my )?(full name|name|email|e-mail|email address|password|confirm password) (?:as|to|with) (.+)/i;
//     const simpleFillPattern = /my (name|email|e-mail|email address) is (.+)/i;
//     let fillMatch = normalizedText.match(fillPattern) || normalizedText.match(simpleFillPattern);

//     if (fillMatch) {
//       let field = fillMatch[1].toLowerCase().replace("e-mail", "email").replace("email address", "email");
//       let value = fillMatch[2];
//       let fieldLabel = "";
//       if (field.includes("name")) fieldLabel = "Full Name";
//       else if (field.includes("email")) {
//         fieldLabel = "Email Address";
//         value = value.replace(/ at /g, '@').replace(/ dot /g, '.').replace(/\s/g, '');
//       }
//       else if (field.includes("confirm password")) fieldLabel = "Confirm Password";
//       else if (field.includes("password")) fieldLabel = "Password";
//       if (fieldLabel) {
//         findInputByLabelAndFill(fieldLabel, value);
//         speakFeedback(`Setting ${fieldLabel}.`);
//       }
//     }

//     // --- 2. Scroll Commands ---
//     else if (normalizedText.startsWith("scroll down")) {
//       window.scrollBy({ top: 500, behavior: 'smooth' });
//       speakFeedback("Scrolling down.");
//     } else if (normalizedText.startsWith("scroll up")) {
//       window.scrollBy({ top: -500, behavior: 'smooth' });
//       speakFeedback("Scrolling up.");
//     } else if (normalizedText.startsWith("scroll to top") || normalizedText.startsWith("go to top")) {
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//       speakFeedback("Scrolling to top.");
//     } else if (normalizedText.startsWith("scroll to bottom") || normalizedText.startsWith("go to bottom")) {
//       window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
//       speakFeedback("Scrolling to bottom.");
//     }

//     // --- 3. Navigation ---
//     else if (normalizedText.startsWith("go to home")) {
//       router.push('/');
//       speakFeedback("Going to Home Page.");
//     } else if (normalizedText.startsWith("go to communication")) {
//       router.push('/communication');
//       speakFeedback("Going to Communication Page.");
//     } else if (normalizedText.startsWith("go to education")) {
//       router.push('/education');
//       speakFeedback("Going to Education Page.");
//     } else if (normalizedText.startsWith("go to stories")) {
//       router.push('/stories');
//       speakFeedback("Going to Stories Page.");
//     } else if (normalizedText.startsWith("go to mission")) {
//       router.push('/mission');
//       speakFeedback("Going to Mission Page.");
//     }

//     // --- 4. Click Commands ---
//     else if (normalizedText.startsWith("click")) {
//       const targetText = normalizedText.replace("click on ", "").replace("click ", "");
//       const buttonMap: { [key: string]: string } = {
//         "profile": "Profile",
//         "log out": "Logout",
//         "logout": "Logout",
//         "create account": "Create Account",
//         "sign in": "Sign in",
//         "sign up": "Sign Up",
//         "login": "Login"
//       };
//       const buttonText = buttonMap[targetText];
//       if (buttonText) {
//         const success = findElementByTextAndClick(buttonText);
//         if (success) speakFeedback(`Clicked ${buttonText}.`);
//         else speakFeedback(`Sorry, I couldn't find the ${buttonText} button.`);
//       } else {
//         commandHandled = false;
//       }
//     }

//     // --- 5. Emergency Only ---
//     else if (normalizedText.includes('help help') || normalizedText.includes('mayday')) {
//       speakFeedback("Sending emergency alerts. Getting your location...");
//       const location = await getUserLocation();
//       try {
//         const response = await fetch(`${API_URL}/emergency-alert`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ text: speechText, location })
//         });
//         if (response.ok) {
//           speakFeedback("Emergency alerts have been sent with your location.");
//         } else {
//           speakFeedback("Sorry, there was a problem sending emergency alerts.");
//         }
//       } catch (err) {
//         console.error(err);
//         speakFeedback("Error contacting server for emergency alert.");
//       }
//     }

//     // --- 6. Unknown Command ---
//     else {
//       speakFeedback("Sorry, I didn’t understand that command.");
//       commandHandled = false;
//     }

//     setTimeout(() => { isProcessingRef.current = false; }, 1000);
//   }, [API_URL, router]);

//   // --- Stable Listening Logic (unchanged) ---
//   const startListening = useCallback(() => {
//     if (isListening) return;
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) { alert("Browser doesn't support speech recognition."); return; }

//     const recognition = new SpeechRecognition();
//     recognition.continuous = true;
//     recognition.interimResults = false;
//     recognition.lang = 'en-US';
//     recognitionRef.current = recognition;
//     shouldBeListeningRef.current = true;

//     recognition.onstart = () => { setIsListening(true); setStatus('Listening...'); };
//     recognition.onresult = (event: SpeechRecognitionEvent) => {
//       const transcript = event.results[event.results.length - 1][0].transcript.trim();
//       processVoiceCommand(transcript);
//     };
//     recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
//       console.error("Speech recognition error", event.error);
//       if (event.error !== 'no-speech') setStatus(`Error: ${event.error}`);
//     };
//     recognition.onend = () => {
//       if (shouldBeListeningRef.current) recognition.start();
//       else { setIsListening(false); setStatus('Click the mic to start'); }
//     };

//     recognition.start();
//   }, [isListening, processVoiceCommand]);

//   const stopListening = useCallback(() => {
//     if (!recognitionRef.current) return;
//     shouldBeListeningRef.current = false;
//     recognitionRef.current.stop();
//     recognitionRef.current = null;
//     speechSynthesis.cancel();
//   }, []);

//   return { isListening, status, startListening, stopListening };
// };


// "use client";

// import { useState, useRef, useCallback } from "react";
// import { useRouter } from "next/navigation";

// // --- Interface definitions ---
// interface WebsiteCommandPayload {
//   action:
//     | "scroll"
//     | "navigate"
//     | "read"
//     | "unknown"
//     | "click"
//     | "goToPage"
//     | "fillInput";
//   target: string | null;
//   direction?: "up" | "down" | "top" | "bottom" | null;
//   value?: string;
// }
// interface GeneralAnswerPayload {
//   text_to_speak: string;
// }
// interface HelpActionPayload {
//   status: "success" | "failed";
// }
// interface PlayGamePayload {
//   name: string;
//   url: string;
// }
// interface ApiResponse {
//   type:
//     | "WEBSITE_COMMAND"
//     | "GENERAL_ANSWER"
//     | "HELP_ACTION"
//     | "PLAY_GAME";
//   payload:
//     | WebsiteCommandPayload
//     | GeneralAnswerPayload
//     | HelpActionPayload
//     | PlayGamePayload;
// }
// declare global {
//   interface Window {
//     webkitSpeechRecognition: any;
//   }
// }

// // --- Helper Functions ---
// const speakFeedback = (text: string) => {
//   if ("speechSynthesis" in window) {
//     speechSynthesis.cancel();
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.rate = 0.9;
//     utterance.pitch = 1.1;
//     speechSynthesis.speak(utterance);
//   }
// };

// const getUserLocation = (): Promise<
//   { latitude: number; longitude: number } | null
// > => {
//   return new Promise((resolve) => {
//     if (!navigator.geolocation) {
//       console.error("Geolocation not supported by browser.");
//       resolve(null);
//     }
//     navigator.geolocation.getCurrentPosition(
//       (position) =>
//         resolve({
//           latitude: position.coords.latitude,
//           longitude: position.coords.longitude,
//         }),
//       () => {
//         console.error("Failed to get user location.");
//         resolve(null);
//       }
//     );
//   });
// };

// const findElementByTextAndClick = (text: string): boolean => {
//   if (!text) return false;
//   const sanitizedText = text.trim().toLowerCase();
//   const elements = document.querySelectorAll(
//     "a, button, [role='button'], [role='link']"
//   );
//   for (const element of Array.from(elements)) {
//     if (element.textContent?.trim().toLowerCase() === sanitizedText) {
//       (element as HTMLElement).click();
//       return true;
//     }
//   }
//   return false;
// };

// const findInputByLabelAndFill = (
//   labelText: string,
//   value: string
// ): boolean => {
//   if (!labelText || value === undefined) return false;
//   const sanitizedLabel = labelText
//     .trim()
//     .toLowerCase()
//     .replace("e-mail", "email")
//     .replace("email address", "email");

//   const fillAndDispatch = (input: HTMLInputElement | HTMLTextAreaElement) => {
//     const nativeSetter =
//       Object.getOwnPropertyDescriptor(
//         window.HTMLInputElement.prototype,
//         "value"
//       )?.set;
//     if (nativeSetter) nativeSetter.call(input, value);
//     else input.value = value;

//     const inputEvent = new Event("input", { bubbles: true });
//     const changeEvent = new Event("change", { bubbles: true });
//     input.dispatchEvent(inputEvent);
//     input.dispatchEvent(changeEvent);
//   };

//   // Try label tags
//   const labels = document.querySelectorAll("label");
//   for (const label of Array.from(labels)) {
//     const labelTextContent = label.textContent
//       ?.trim()
//       .toLowerCase()
//       .replace("e-mail", "email")
//       .replace("email address", "email");
//     if (labelTextContent?.includes(sanitizedLabel)) {
//       const inputId = label.getAttribute("for");
//       const input = inputId
//         ? (document.getElementById(inputId) as
//             | HTMLInputElement
//             | HTMLTextAreaElement)
//         : null;
//       if (input) {
//         fillAndDispatch(input);
//         return true;
//       }
//     }
//   }

//   // Try placeholder or aria-label
//   const inputs = document.querySelectorAll("input, textarea");
//   for (const input of Array.from(inputs)) {
//     const ariaLabel = input
//       .getAttribute("aria-label")
//       ?.toLowerCase()
//       .replace("e-mail", "email")
//       .replace("email address", "email");
//     const placeholder = input
//       .getAttribute("placeholder")
//       ?.toLowerCase()
//       .replace("e-mail", "email")
//       .replace("email address", "email");
//     if (
//       ariaLabel?.includes(sanitizedLabel) ||
//       placeholder?.includes(sanitizedLabel)
//     ) {
//       fillAndDispatch(input as HTMLInputElement);
//       return true;
//     }
//   }

//   return false;
// };

// // --- Main Hook ---
// export const useVoiceControl = () => {
//   const [isListening, setIsListening] = useState(false);
//   const [status, setStatus] = useState("Click the mic to start");
//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const isProcessingRef = useRef(false);
//   const shouldBeListeningRef = useRef(false);
//   const router = useRouter();
//   const API_URL = process.env.NEXT_PUBLIC_API_URL;

//   const processVoiceCommand = useCallback(
//     async (speechText: string) => {
//       if (isProcessingRef.current) return;
//       isProcessingRef.current = true;

//       const normalizedText = speechText
//         .toLowerCase()
//         .trim()
//         .replace(/[.,!?;]$/, "");
//       console.log("User said:", `"${normalizedText}"`);

//       let commandHandled = true;

//       // --- 1. Form Filling ---
//       const fillPattern =
//         /(?:fill|enter|set|type|write)(?: the)? (?:field |input |box |my )?(full name|name|email|e-mail|email address|password|confirm password)(?: as| to| with)? (.+)/i;
//       const altPattern =
//         /(?:my )?(name|email|e-mail|email address|password|confirm password)(?: is| equals| should be) (.+)/i;
//       let fillMatch = normalizedText.match(fillPattern) || normalizedText.match(altPattern);

//       if (fillMatch) {
//         let field = fillMatch[1]
//           .toLowerCase()
//           .replace("e-mail", "email")
//           .replace("email address", "email");
//         let value = fillMatch[2];

//         if (field.includes("email")) {
//           value = value
//             .replace(/ at /g, "@")
//             .replace(/ dot /g, ".")
//             .replace(/\s/g, "");
//         }

//         const success = findInputByLabelAndFill(field, value);
//         if (success) speakFeedback(`Entered ${field} as ${value}`);
//         else speakFeedback(`Sorry, I couldn't find the ${field} field.`);
//       }

//       // --- 2. Scroll Commands ---
//       else if (normalizedText.startsWith("scroll down")) {
//         window.scrollBy({ top: 500, behavior: "smooth" });
//         speakFeedback("Scrolling down.");
//       } else if (normalizedText.startsWith("scroll up")) {
//         window.scrollBy({ top: -500, behavior: "smooth" });
//         speakFeedback("Scrolling up.");
//       } else if (
//         normalizedText.startsWith("scroll to top") ||
//         normalizedText.startsWith("go to top")
//       ) {
//         window.scrollTo({ top: 0, behavior: "smooth" });
//         speakFeedback("Scrolling to top.");
//       } else if (
//         normalizedText.startsWith("scroll to bottom") ||
//         normalizedText.startsWith("go to bottom")
//       ) {
//         window.scrollTo({
//           top: document.body.scrollHeight,
//           behavior: "smooth",
//         });
//         speakFeedback("Scrolling to bottom.");
//       }

//       // --- 3. Navigation ---
//       else if (normalizedText.startsWith("go to home")) {
//         router.push("/");
//         speakFeedback("Going to Home Page.");
//       } else if (normalizedText.startsWith("go to communication")) {
//         router.push("/communication");
//         speakFeedback("Going to Communication Page.");
//       } else if (normalizedText.startsWith("go to education")) {
//         router.push("/education");
//         speakFeedback("Going to Education Page.");
//       } else if (normalizedText.startsWith("go to stories")) {
//         router.push("/stories");
//         speakFeedback("Going to Stories Page.");
//       } else if (normalizedText.startsWith("go to mission")) {
//         router.push("/mission");
//         speakFeedback("Going to Mission Page.");
//       }

//       // --- 4. Click Commands ---
//       else if (normalizedText.startsWith("click")) {
//         const targetText = normalizedText
//           .replace("click on ", "")
//           .replace("click ", "");
//         const buttonMap: { [key: string]: string } = {
//           profile: "Profile",
//           "log out": "Logout",
//           logout: "Logout",
//           "create account": "Create Account",
//           "sign in": "Sign in",
//           "sign up": "Sign Up",
//           login: "Login",
//         };
//         const buttonText = buttonMap[targetText];
//         if (buttonText) {
//           const success = findElementByTextAndClick(buttonText);
//           if (success) speakFeedback(`Clicked ${buttonText}.`);
//           else speakFeedback(`Sorry, I couldn't find ${buttonText}.`);
//         } else {
//           commandHandled = false;
//         }
//       }

//       // --- 5. Emergency Command ---
//       else if (
//         normalizedText.includes("help help") ||
//         normalizedText.includes("mayday")
//       ) {
//         speakFeedback("Sending emergency alerts. Getting your location...");
//         const location = await getUserLocation();
//         try {
//           const response = await fetch(`${API_URL}/emergency-alert`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ text: speechText, location }),
//           });
//           if (response.ok)
//             speakFeedback("Emergency alerts have been sent successfully.");
//           else
//             speakFeedback("Sorry, there was a problem sending the alerts.");
//         } catch (err) {
//           console.error(err);
//           speakFeedback("Error contacting the server for emergency alert.");
//         }
//       }

//       // --- 6. Unknown Command ---
//       else {
//         speakFeedback("Sorry, I didn’t understand that command.");
//         commandHandled = false;
//       }

//       setTimeout(() => {
//         isProcessingRef.current = false;
//       }, 1000);
//     },
//     [API_URL, router]
//   );

//   // --- Listening Logic ---
//   const startListening = useCallback(() => {
//     if (isListening) return;
//     const SpeechRecognition =
//       window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       alert("Browser doesn't support speech recognition.");
//       return;
//     }

//     const recognition = new SpeechRecognition();
//     recognition.continuous = true;
//     recognition.interimResults = false;
//     recognition.lang = "en-US";
//     recognitionRef.current = recognition;
//     shouldBeListeningRef.current = true;

//     recognition.onstart = () => {
//       setIsListening(true);
//       setStatus("Listening...");
//     };
//     recognition.onresult = (event: SpeechRecognitionEvent) => {
//       const transcript =
//         event.results[event.results.length - 1][0].transcript.trim();
//       processVoiceCommand(transcript);
//     };
//     recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
//       console.error("Speech recognition error:", event.error);
//       if (event.error !== "no-speech") setStatus(`Error: ${event.error}`);
//     };
//     recognition.onend = () => {
//       if (shouldBeListeningRef.current) recognition.start();
//       else {
//         setIsListening(false);
//         setStatus("Click the mic to start");
//       }
//     };

//     recognition.start();
//   }, [isListening, processVoiceCommand]);

//   const stopListening = useCallback(() => {
//     if (!recognitionRef.current) return;
//     shouldBeListeningRef.current = false;
//     recognitionRef.current.stop();
//     recognitionRef.current = null;
//     speechSynthesis.cancel();
//   }, []);

//   return { isListening, status, startListening, stopListening };
// };
// "use client";

// import { useState, useRef, useCallback, useEffect } from "react";
// import { useRouter } from "next/navigation";

// // --- Interface definitions ---
// interface WebsiteCommandPayload {
//   action:
//     | "scroll"
//     | "navigate"
//     | "read"
//     | "unknown"
//     | "click"
//     | "goToPage"
//     | "fillInput";
//   target: string | null;
//   direction?: "up" | "down" | "top" | "bottom" | null;
//   value?: string;
// }
// interface GeneralAnswerPayload {
//   text_to_speak: string;
// }
// interface HelpActionPayload {
//   status: "success" | "failed";
// }
// interface PlayGamePayload {
//   name: string;
//   url: string;
// }
// interface ApiResponse {
//   type: "WEBSITE_COMMAND" | "GENERAL_ANSWER" | "HELP_ACTION" | "PLAY_GAME";
//   payload:
//     | WebsiteCommandPayload
//     | GeneralAnswerPayload
//     | HelpActionPayload
//     | PlayGamePayload;
// }
// declare global {
//   interface Window {
//     webkitSpeechRecognition: any;
//   }
// }

// // --- Helper Functions ---
// const speakFeedback = (text: string) => {
//   if ("speechSynthesis" in window) {
//     speechSynthesis.cancel();
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.rate = 0.9;
//     utterance.pitch = 1.1;
//     speechSynthesis.speak(utterance);
//   }
// };

// const getUserLocation = (): Promise<
//   { latitude: number; longitude: number } | null
// > => {
//   return new Promise((resolve) => {
//     if (!navigator.geolocation) {
//       console.error("Geolocation not supported by browser.");
//       resolve(null);
//     }
//     navigator.geolocation.getCurrentPosition(
//       (position) =>
//         resolve({
//           latitude: position.coords.latitude,
//           longitude: position.coords.longitude,
//         }),
//       () => {
//         console.error("Failed to get user location.");
//         resolve(null);
//       }
//     );
//   });
// };

// const findElementByTextAndClick = (text: string): boolean => {
//   if (!text) return false;
//   const sanitizedText = text.trim().toLowerCase();
//   const elements = document.querySelectorAll(
//     "a, button, [role='button'], [role='link']"
//   );
//   for (const element of Array.from(elements)) {
//     if (element.textContent?.trim().toLowerCase() === sanitizedText) {
//       (element as HTMLElement).click();
//       return true;
//     }
//   }
//   return false;
// };

// const findInputByLabelAndFill = (
//   labelText: string,
//   value: string
// ): boolean => {
//   if (!labelText || value === undefined) return false;
//   const sanitizedLabel = labelText
//     .trim()
//     .toLowerCase()
//     .replace("e-mail", "email")
//     .replace("email address", "email");

//   const fillAndDispatch = (input: HTMLInputElement | HTMLTextAreaElement) => {
//     const nativeSetter =
//       Object.getOwnPropertyDescriptor(
//         window.HTMLInputElement.prototype,
//         "value"
//       )?.set;
//     if (nativeSetter) nativeSetter.call(input, value);
//     else input.value = value;

//     const inputEvent = new Event("input", { bubbles: true });
//     const changeEvent = new Event("change", { bubbles: true });
//     input.dispatchEvent(inputEvent);
//     input.dispatchEvent(changeEvent);
//   };

//   // Try label tags
//   const labels = document.querySelectorAll("label");
//   for (const label of Array.from(labels)) {
//     const labelTextContent = label.textContent
//       ?.trim()
//       .toLowerCase()
//       .replace("e-mail", "email")
//       .replace("email address", "email");
//     if (labelTextContent?.includes(sanitizedLabel)) {
//       const inputId = label.getAttribute("for");
//       const input = inputId
//         ? (document.getElementById(inputId) as
//             | HTMLInputElement
//             | HTMLTextAreaElement)
//         : null;
//       if (input) {
//         fillAndDispatch(input);
//         return true;
//       }
//     }
//   }

//   // Try placeholder or aria-label
//   const inputs = document.querySelectorAll("input, textarea");
//   for (const input of Array.from(inputs)) {
//     const ariaLabel = input
//       .getAttribute("aria-label")
//       ?.toLowerCase()
//       .replace("e-mail", "email")
//       .replace("email address", "email");
//     const placeholder = input
//       .getAttribute("placeholder")
//       ?.toLowerCase()
//       .replace("e-mail", "email")
//       .replace("email address", "email");
//     if (
//       ariaLabel?.includes(sanitizedLabel) ||
//       placeholder?.includes(sanitizedLabel)
//     ) {
//       fillAndDispatch(input as HTMLInputElement);
//       return true;
//     }
//   }

//   return false;
// };

// // --- Main Hook ---
// export const useVoiceControl = () => {
//   const [isListening, setIsListening] = useState(false);
//   const [status, setStatus] = useState("Click the mic to start");
//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const isProcessingRef = useRef(false);
//   const shouldBeListeningRef = useRef(false);
//   const router = useRouter();
//   const API_URL = process.env.NEXT_PUBLIC_API_URL;

//   const processVoiceCommand = useCallback(
//     async (speechText: string) => {
//       if (isProcessingRef.current) return;
//       isProcessingRef.current = true;

//       const normalizedText = speechText
//         .toLowerCase()
//         .trim()
//         .replace(/[.,!?;]$/, "");
//       console.log("User said:", `"${normalizedText}"`);

//       let commandHandled = true;

//       // --- 1. Form Filling ---
//       const fillPattern =
//         /(?:fill|enter|set|type|write)(?: the)? (?:field |input |box |my )?(full name|name|email|e-mail|email address|password|confirm password)(?: as| to| with)? (.+)/i;
//       const altPattern =
//         /(?:my )?(name|email|e-mail|email address|password|confirm password)(?: is| equals| should be) (.+)/i;
//       let fillMatch =
//         normalizedText.match(fillPattern) || normalizedText.match(altPattern);

//       if (fillMatch) {
//         let field = fillMatch[1]
//           .toLowerCase()
//           .replace("e-mail", "email")
//           .replace("email address", "email");
//         let value = fillMatch[2];

//         if (field.includes("email")) {
//           value = value
//             .replace(/ at /g, "@")
//             .replace(/ dot /g, ".")
//             .replace(/\s/g, "");
//         }

//         const success = findInputByLabelAndFill(field, value);
//         if (success) speakFeedback(`Entered ${field} as ${value}`);
//         else speakFeedback(`Sorry, I couldn't find the ${field} field.`);
//       }

//       // --- 2. Scroll Commands ---
//       else if (normalizedText.startsWith("scroll down")) {
//         window.scrollBy({ top: 500, behavior: "smooth" });
//         speakFeedback("Scrolling down.");
//       } else if (normalizedText.startsWith("scroll up")) {
//         window.scrollBy({ top: -500, behavior: "smooth" });
//         speakFeedback("Scrolling up.");
//       } else if (
//         normalizedText.startsWith("scroll to top") ||
//         normalizedText.startsWith("go to top")
//       ) {
//         window.scrollTo({ top: 0, behavior: "smooth" });
//         speakFeedback("Scrolling to top.");
//       } else if (
//         normalizedText.startsWith("scroll to bottom") ||
//         normalizedText.startsWith("go to bottom")
//       ) {
//         window.scrollTo({
//           top: document.body.scrollHeight,
//           behavior: "smooth",
//         });
//         speakFeedback("Scrolling to bottom.");
//       }

//       // --- 3. Navigation ---
//       else if (normalizedText.startsWith("go to home")) {
//         router.push("/");
//         speakFeedback("Going to Home Page.");
//       } else if (normalizedText.startsWith("go to communication")) {
//         router.push("/communication");
//         speakFeedback("Going to Communication Page.");
//       } else if (normalizedText.startsWith("go to education")) {
//         router.push("/education");
//         speakFeedback("Going to Education Page.");
//       } else if (normalizedText.startsWith("go to stories")) {
//         router.push("/stories");
//         speakFeedback("Going to Stories Page.");
//       } else if (normalizedText.startsWith("go to mission")) {
//         router.push("/mission");
//         speakFeedback("Going to Mission Page.");
//       }

//       // --- 4. Click Commands ---
//       else if (normalizedText.startsWith("click")) {
//         const targetText = normalizedText
//           .replace("click on ", "")
//           .replace("click ", "");
//         const buttonMap: { [key: string]: string } = {
//           profile: "Profile",
//           "log out": "Logout",
//           logout: "Logout",
//           "create account": "Create Account",
//           "sign in": "Sign in",
//           "sign up": "Sign Up",
//           login: "Login",
//         };
//         const buttonText = buttonMap[targetText];
//         if (buttonText) {
//           const success = findElementByTextAndClick(buttonText);
//           if (success) speakFeedback(`Clicked ${buttonText}.`);
//           else speakFeedback(`Sorry, I couldn't find ${buttonText}.`);
//         } else {
//           commandHandled = false;
//         }
//       }

//       // --- 5. Emergency Command ---
//       else if (
//         normalizedText.includes("help help") ||
//         normalizedText.includes("mayday")
//       ) {
//         speakFeedback("Sending emergency alerts. Getting your location...");
//         const location = await getUserLocation();
//         try {
//           const response = await fetch(`${API_URL}/emergency-alert`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ text: speechText, location }),
//           });
//           if (response.ok)
//             speakFeedback("Emergency alerts have been sent successfully.");
//           else
//             speakFeedback("Sorry, there was a problem sending the alerts.");
//         } catch (err) {
//           console.error(err);
//           speakFeedback("Error contacting the server for emergency alert.");
//         }
//       }

//       // --- 6. Unknown Command ---
//       else {
//         speakFeedback("Sorry, I didn’t understand that command.");
//         commandHandled = false;
//       }

//       setTimeout(() => {
//         isProcessingRef.current = false;
//       }, 1000);
//     },
//     [API_URL, router]
//   );

//   // --- Listening Logic ---
//   const startListening = useCallback(() => {
//     if (isListening) return;
//     const SpeechRecognition =
//       window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       alert("Browser doesn't support speech recognition.");
//       return;
//     }

//     const recognition = new SpeechRecognition();
//     recognition.continuous = true;
//     recognition.interimResults = false;
//     recognition.lang = "en-US";
//     recognitionRef.current = recognition;
//     shouldBeListeningRef.current = true;

//     recognition.onstart = () => {
//       setIsListening(true);
//       setStatus("Listening...");
//       speakFeedback("Voice control activated.");
//     };
//     recognition.onresult = (event: SpeechRecognitionEvent) => {
//       const transcript =
//         event.results[event.results.length - 1][0].transcript.trim();
//       processVoiceCommand(transcript);
//     };
//     recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
//       console.error("Speech recognition error:", event.error);
//       if (event.error !== "no-speech") setStatus(`Error: ${event.error}`);
//     };
//     recognition.onend = () => {
//       if (shouldBeListeningRef.current) recognition.start();
//       else {
//         setIsListening(false);
//         setStatus("Click the mic to start");
//         speakFeedback("Voice control stopped.");
//       }
//     };

//     recognition.start();
//   }, [isListening, processVoiceCommand]);

//   const stopListening = useCallback(() => {
//     if (!recognitionRef.current) return;
//     shouldBeListeningRef.current = false;
//     recognitionRef.current.stop();
//     recognitionRef.current = null;
//     speechSynthesis.cancel();
//   }, []);

//   // --- NEW: Hold SHIFT for 2 seconds to start/stop voice control ---
//   useEffect(() => {
//     let holdTimer: NodeJS.Timeout | null = null;
//     let holding = false;

//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Shift" && !holding) {
//         holding = true;
//         holdTimer = setTimeout(() => {
//           if (!isListening) startListening();
//         }, 2000); // 2-second hold
//       }
//     };

//     const handleKeyUp = (e: KeyboardEvent) => {
//       if (e.key === "Shift") {
//         holding = false;
//         if (holdTimer) clearTimeout(holdTimer);
//         if (isListening) stopListening();
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     window.addEventListener("keyup", handleKeyUp);

//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//       window.removeEventListener("keyup", handleKeyUp);
//     };
//   }, [isListening, startListening, stopListening]);

//   return { isListening, status, startListening, stopListening };
// };

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

// --- Interface definitions ---
interface WebsiteCommandPayload {
  action:
    | "scroll"
    | "navigate"
    | "read"
    | "unknown"
    | "click"
    | "goToPage"
    | "fillInput";
  target: string | null;
  direction?: "up" | "down" | "top" | "bottom" | null;
  value?: string;
}
interface GeneralAnswerPayload {
  text_to_speak: string;
}
interface HelpActionPayload {
  status: "success" | "failed";
}
interface PlayGamePayload {
  name: string;
  url: string;
}
interface ApiResponse {
  type:
    | "WEBSITE_COMMAND"
    | "GENERAL_ANSWER"
    | "HELP_ACTION"
    | "PLAY_GAME";
  payload:
    | WebsiteCommandPayload
    | GeneralAnswerPayload
    | HelpActionPayload
    | PlayGamePayload;
}
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

// --- Helper Functions ---
const speakFeedback = (text: string) => {
  if ("speechSynthesis" in window) {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    speechSynthesis.speak(utterance);
  }
};

const getUserLocation = (): Promise<
  { latitude: number; longitude: number } | null
> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.error("Geolocation not supported by browser.");
      resolve(null);
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      () => {
        console.error("Failed to get user location.");
        resolve(null);
      }
    );
  });
};

const findElementByTextAndClick = (text: string): boolean => {
  if (!text) return false;
  const sanitizedText = text.trim().toLowerCase();
  const elements = document.querySelectorAll(
    "a, button, [role='button'], [role='link']"
  );
  for (const element of Array.from(elements)) {
    if (element.textContent?.trim().toLowerCase() === sanitizedText) {
      (element as HTMLElement).click();
      return true;
    }
  }
  return false;
};

const findInputByLabelAndFill = (
  labelText: string,
  value: string
): boolean => {
  if (!labelText || value === undefined) return false;
  const sanitizedLabel = labelText
    .trim()
    .toLowerCase()
    .replace("e-mail", "email")
    .replace("email address", "email");

  const fillAndDispatch = (input: HTMLInputElement | HTMLTextAreaElement) => {
    const nativeSetter =
      Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      )?.set;
    if (nativeSetter) nativeSetter.call(input, value);
    else input.value = value;

    const inputEvent = new Event("input", { bubbles: true });
    const changeEvent = new Event("change", { bubbles: true });
    input.dispatchEvent(inputEvent);
    input.dispatchEvent(changeEvent);
  };

  // Try label tags
  const labels = document.querySelectorAll("label");
  for (const label of Array.from(labels)) {
    const labelTextContent = label.textContent
      ?.trim()
      .toLowerCase()
      .replace("e-mail", "email")
      .replace("email address", "email");
    if (labelTextContent?.includes(sanitizedLabel)) {
      const inputId = label.getAttribute("for");
      const input = inputId
        ? (document.getElementById(inputId) as
            | HTMLInputElement
            | HTMLTextAreaElement)
        : null;
      if (input) {
        fillAndDispatch(input);
        return true;
      }
    }
  }

  // Try placeholder or aria-label
  const inputs = document.querySelectorAll("input, textarea");
  for (const input of Array.from(inputs)) {
    const ariaLabel = input
      .getAttribute("aria-label")
      ?.toLowerCase()
      .replace("e-mail", "email")
      .replace("email address", "email");
    const placeholder = input
      .getAttribute("placeholder")
      ?.toLowerCase()
      .replace("e-mail", "email")
      .replace("email address", "email");
    if (
      ariaLabel?.includes(sanitizedLabel) ||
      placeholder?.includes(sanitizedLabel)
    ) {
      fillAndDispatch(input as HTMLInputElement);
      return true;
    }
  }

  return false;
};

// --- Main Hook ---
export const useVoiceControl = () => {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("Click the mic to start");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isProcessingRef = useRef(false);
  const shouldBeListeningRef = useRef(false);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const processVoiceCommand = useCallback(
    async (speechText: string) => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      const normalizedText = speechText
        .toLowerCase()
        .trim()
        .replace(/[.,!?;]$/, "");
      console.log("User said:", `"${normalizedText}"`);

      let commandHandled = true;

      // --- 1. Form Filling ---
      const fillPattern =
        /(?:fill|enter|set|type|write)(?: the)? (?:field |input |box |my )?(full name|name|email|e-mail|email address|password|confirm password)(?: as| to| with)? (.+)/i;
      const altPattern =
        /(?:my )?(name|email|e-mail|email address|password|confirm password)(?: is| equals| should be) (.+)/i;
      let fillMatch =
        normalizedText.match(fillPattern) || normalizedText.match(altPattern);

      if (fillMatch) {
        let field = fillMatch[1]
          .toLowerCase()
          .replace("e-mail", "email")
          .replace("email address", "email");
        let value = fillMatch[2];

        if (field.includes("email")) {
          value = value
            .replace(/ at /g, "@")
            .replace(/ dot /g, ".")
            .replace(/\s/g, "");
        }

        const success = findInputByLabelAndFill(field, value);
        if (success) speakFeedback(`Entered ${field} as ${value}`);
        else speakFeedback(`Sorry, I couldn't find the ${field} field.`);
      }

      // --- 2. Scroll Commands ---
      else if (normalizedText.startsWith("scroll down")) {
        window.scrollBy({ top: 500, behavior: "smooth" });
        speakFeedback("Scrolling down.");
      } else if (normalizedText.startsWith("scroll up")) {
        window.scrollBy({ top: -500, behavior: "smooth" });
        speakFeedback("Scrolling up.");
      } else if (
        normalizedText.startsWith("scroll to top") ||
        normalizedText.startsWith("go to top")
      ) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        speakFeedback("Scrolling to top.");
      } else if (
        normalizedText.startsWith("scroll to bottom") ||
        normalizedText.startsWith("go to bottom")
      ) {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
        speakFeedback("Scrolling to bottom.");
      }

      // --- 3. Navigation ---
      else if (normalizedText.startsWith("go to home")) {
        router.push("/");
        speakFeedback("Going to Home Page.");
      } else if (normalizedText.startsWith("go to communication")) {
        router.push("/communication");
        speakFeedback("Going to Communication Page.");
      } else if (normalizedText.startsWith("go to education")) {
        router.push("/education");
        speakFeedback("Going to Education Page.");
      } else if (normalizedText.startsWith("go to stories")) {
        router.push("/stories");
        speakFeedback("Going to Stories Page.");
      } else if (normalizedText.startsWith("go to mission")) {
        router.push("/mission");
        speakFeedback("Going to Mission Page.");
      }

      // --- 4. Click Commands ---
      else if (normalizedText.startsWith("click")) {
        const targetText = normalizedText
          .replace("click on ", "")
          .replace("click ", "");
        const buttonMap: { [key: string]: string } = {
          profile: "Profile",
          "log out": "Logout",
          logout: "Logout",
          "create account": "Create Account",
          "sign in": "Sign in",
          "sign up": "Sign Up",
          login: "Login",
        };
        const buttonText = buttonMap[targetText];
        if (buttonText) {
          const success = findElementByTextAndClick(buttonText);
          if (success) speakFeedback(`Clicked ${buttonText}.`);
          else speakFeedback(`Sorry, I couldn't find ${buttonText}.`);
        } else {
          commandHandled = false;
        }
      }

      // --- 5. Emergency Command ---
      else if (
        normalizedText.includes("help help") ||
        normalizedText.includes("mayday")
      ) {
        speakFeedback("Sending emergency alerts. Getting your location...");
        const location = await getUserLocation();
        try {
          const response = await fetch(`${API_URL}/emergency-alert`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: speechText, location }),
          });
          if (response.ok)
            speakFeedback("Emergency alerts have been sent successfully.");
          else
            speakFeedback("Sorry, there was a problem sending the alerts.");
        } catch (err) {
          console.error(err);
          speakFeedback("Error contacting the server for emergency alert.");
        }
      }

      // --- 6. Unknown Command ---
      else {
        speakFeedback("Sorry, I didn’t understand that command.");
        commandHandled = false;
      }

      setTimeout(() => {
        isProcessingRef.current = false;
      }, 1000);
    },
    [API_URL, router]
  );

  // --- Listening Logic ---
  const startListening = useCallback(() => {
    if (isListening) return;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser doesn't support speech recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;
    shouldBeListeningRef.current = true;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus("Listening...");
      speakFeedback("Voice control activated.");
    };
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript.trim();
      processVoiceCommand(transcript);
    };
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "no-speech") setStatus(`Error: ${event.error}`);
    };
    recognition.onend = () => {
      if (shouldBeListeningRef.current) recognition.start();
      else {
        setIsListening(false);
        setStatus("Click the mic to start");
        speakFeedback("Voice control stopped.");
      }
    };

    recognition.start();
  }, [isListening, processVoiceCommand]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    shouldBeListeningRef.current = false;
    recognitionRef.current.stop();
    recognitionRef.current = null;
    speechSynthesis.cancel();
  }, []);

  // --- 🔥 Control Key Hold Shortcut (Hold 2 sec to start, release to stop) ---
  useEffect(() => {
    let ctrlHoldTimer: NodeJS.Timeout | null = null;
    let isCtrlHeld = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Control" && !isCtrlHeld) {
        isCtrlHeld = true;
        ctrlHoldTimer = setTimeout(() => {
          if (!isListening) startListening();
        }, 2000);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Control") {
        isCtrlHeld = false;
        if (ctrlHoldTimer) clearTimeout(ctrlHoldTimer);
        if (isListening) stopListening();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isListening, startListening, stopListening]);

  return { isListening, status, startListening, stopListening };
};
