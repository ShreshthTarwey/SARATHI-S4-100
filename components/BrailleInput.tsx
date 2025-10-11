"use client";

import { useState, useEffect } from 'react';
import { CornerDownLeft, Delete, XCircle, Speaker } from 'lucide-react';

const dotMap = [
    { id: 1, key: 'Numpad7' }, { id: 4, key: 'Numpad9' },
    { id: 2, key: 'Numpad4' }, { id: 5, key: 'Numpad6' },
    { id: 3, key: 'Numpad1' }, { id: 6, key: 'Numpad3' },
];

const brailleMap: { [key: string]: string } = {
    '1': 'a', '12': 'b', '14': 'c', '145': 'd', '15': 'e', '124': 'f', '1245': 'g', 
    '125': 'h', '24': 'i', '245': 'j', '13': 'k', '123': 'l', '134': 'm', '1345': 'n', 
    '135': 'o', '1234': 'p', '12345': 'q', '1235': 'r', '234': 's', '2345': 't', 
    '136': 'u', '1236': 'v', '2456': 'w', '1346': 'x', '13456': 'y', '1356': 'z',
};

const speak = (text: string) => {
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.2;
        speechSynthesis.speak(utterance);
    }
};

export default function BrailleInput() {
    const [activeDots, setActiveDots] = useState<Set<number>>(new Set());
    const [outputText, setOutputText] = useState("");

    const toggleDot = (dotId: number) => {
        setActiveDots(prevDots => {
            const newDots = new Set(prevDots);
            newDots.has(dotId) ? newDots.delete(dotId) : newDots.add(dotId);
            return newDots;
        });
    };

    const handleCharacterEntry = () => {
        if (activeDots.size === 0) {
            setOutputText(prev => prev + ' ');
            speak('space');
            return;
        }
        const brailleKey = Array.from(activeDots).sort((a, b) => a - b).join('');
        const character = brailleMap[brailleKey];

        if (character) {
            setOutputText(prev => prev + character);
            speak(character);
        } else {
            speak('unknown');
        }
        setActiveDots(new Set());
    };

    const handleBackspace = () => {
        if (outputText.length > 0) {
            setOutputText(prev => prev.slice(0, -1));
        }
    };

    const handleSpeakSentence = () => {
        if (outputText.trim().length > 0) {
            speak(outputText);
        }
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const dot = dotMap.find(d => d.key === event.code);
            if (dot) { event.preventDefault(); toggleDot(dot.id); }
            if (event.code === 'Space') { event.preventDefault(); handleCharacterEntry(); }
            if (event.code === 'Enter') { event.preventDefault(); handleSpeakSentence(); }
            if (event.code === 'Backspace') { event.preventDefault(); handleBackspace(); }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeDots, outputText]);

    return (
        // 1. MAIN CONTAINER: Now responsive with padding for mobile
        <div className="bg-slate-100 p-4 sm:p-8 rounded-2xl max-w-2xl mx-auto shadow-lg">
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Virtual Braille Keyboard</h1>
                <p className="text-slate-500 mt-1 px-2">Use the dots to form letters. Press "Enter Letter" to type.</p>
            </div>
            
            {/* 2. RESPONSIVE LAYOUT: On mobile (flex-col), it's a clean vertical stack. On desktop (sm:flex-row), it's side-by-side. */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-8">
                {/* BRAILLE DOTS: Larger touch targets and better spacing */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 p-6 bg-slate-200 rounded-2xl shadow-inner" aria-label="Braille input grid">
                    {dotMap.map(dot => {
                        const isActive = activeDots.has(dot.id);
                        return (
                            <div 
                                key={dot.id}
                                title={`Dot ${dot.id}`}
                                onClick={() => toggleDot(dot.id)}
                                // Responsive sizing: slightly smaller on mobile for a better fit
                                className={`h-16 w-16 sm:h-20 sm:w-20 rounded-full transition-all duration-150 flex items-center justify-center text-2xl font-bold cursor-pointer select-none
                                    ${isActive ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-slate-400 text-white opacity-50 hover:opacity-100'
                                    }`
                                }
                            >
                                {dot.id}
                            </div>
                        );
                    })}
                </div>

                {/* 3. ACTION BUTTONS: Full-width on mobile for easy thumb access, stacked vertically on desktop */}
                <div className="flex flex-col gap-4 w-full sm:w-auto">
                    <button onClick={handleCharacterEntry} className="w-full flex items-center justify-center gap-2 px-4 py-4 text-lg bg-green-500 text-white font-semibold rounded-xl shadow-md hover:bg-green-600 active:scale-95 transition-all">
                        <CornerDownLeft size={22} /> Enter Letter
                    </button>
                    <button onClick={handleSpeakSentence} className="w-full flex items-center justify-center gap-2 px-4 py-4 text-lg bg-blue-500 text-white font-semibold rounded-xl shadow-md hover:bg-blue-600 active:scale-95 transition-all">
                        <Speaker size={22} /> Speak Sentence
                    </button>
                    <button onClick={handleBackspace} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-lg bg-yellow-500 text-white font-semibold rounded-xl shadow-md hover:bg-yellow-600 active:scale-95 transition-all">
                        <Delete size={22} /> Backspace
                    </button>
                </div>
            </div>

            {/* 4. OUTPUT AREA: Placed below the main interactive elements */}
            <div className="mt-8">
                <div className="flex justify-between items-center mb-2">
                    <label htmlFor="braille-output" className="block text-lg font-semibold text-slate-700">
                        Translated Text
                    </label>
                    <button onClick={() => { setOutputText(""); speak("Text cleared."); }} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium transition-colors">
                        <XCircle size={16} /> Clear All
                    </button>
                </div>
                <textarea
                    id="braille-output"
                    readOnly
                    value={outputText}
                    className="w-full h-40 p-4 border-2 border-slate-300 rounded-lg text-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your text will appear here..."
                />
            </div>
        </div>
    );
}

