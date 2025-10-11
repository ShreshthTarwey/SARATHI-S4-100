"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import BrailleInput from "@/components/BrailleInput";

export default function CommunicationInterface() {
  const [activeFeature, setActiveFeature] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [voiceInput, setVoiceInput] = useState("");
  const [selectedIcons, setSelectedIcons] = useState([]);

  const communicationFeatures = [
    {
      id: "accessible-communication",
      title: "Speech ↔ Text Assist",
      icon: "🗣️✍️",
      description:
        "Convert speech to text and text to speech for inclusive communication",
      longDescription:
        "High-quality text-to-speech for the visually impaired and accurate speech-to-text transcription for the hearing impaired.",
      color: "from-blue-500 via-purple-500 to-indigo-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-purple-50",
      iconBg: "bg-gradient-to-r from-blue-500 to-indigo-500",
      link: "https://sachinburnwal22.github.io/DeafBlind/",
    },
    {
      id: "picture-board",
      title: "Picture Communication",
      icon: "🖼️",
      description: "Tap pictures and symbols to build your message visually",
      longDescription:
        "Comprehensive symbol library with categories for emotions, needs, activities, and more. Ideal for non-verbal communication.",
      color: "from-emerald-400 via-teal-400 to-cyan-600",
      bgColor: "bg-gradient-to-br from-emerald-50 to-teal-50",
      iconBg: "bg-gradient-to-r from-emerald-400 to-teal-500",
      link: "https://picture-communication.vercel.app",
    },
    {
      id: "braille-keyboard",
      title: "Braille Keyboard",
      icon: "B", // Using a placeholder word, you can replace with an emoji or icon component
      description:
        "Type using a virtual Braille keyboard with tactile and audio feedback.",
      longDescription:
        "Practice and type in Braille using your keyboard or by tapping the screen. Instant audio and text feedback for each character.",
      color: "from-gray-400 via-gray-500 to-gray-600",
      bgColor: "bg-gradient-to-br from-gray-50 to-gray-100",
      iconBg: "bg-gradient-to-r from-gray-500 to-gray-700",
      link: "/braille", // This internal link is the key!
    },
    {
      id: "video-messaging",
      title: "Video Messages",
      icon: "📹",
      description:
        "Talk through your video messages with automatic captions and accessibility",
      longDescription:
        "Create expressive video messages with real-time captions, sign language support, and easy sharing options.",
      color: "from-orange-400 via-red-400 to-pink-600",
      bgColor: "bg-gradient-to-br from-orange-50 to-red-50",
      iconBg: "bg-gradient-to-r from-orange-400 to-red-500",
      link: "https://webrtc-8flx.onrender.com/",
    },
    {
      id: "live-chat",
      title: "Live Chat",
      icon: "💬",
      description:
        "Real-time conversation mode with friends, family, and caregivers",
      longDescription:
        "Interactive chat interface with emoji support, quick responses, and accessibility features for seamless conversations.",
      color: "from-violet-400 via-purple-400 to-indigo-600",
      bgColor: "bg-gradient-to-br from-violet-50 to-purple-50",
      iconBg: "bg-gradient-to-r from-violet-400 to-purple-500",
      link: "https://quickchat.greatstack.in/",
    },
    {
      id: "instant-translation",
      title: "Instant Translation",
      icon: "🌍",
      description: "Translate your messages instantly into different languages",
      longDescription:
        "Break language barriers with real-time translation supporting 100+ languages. Perfect for multicultural communication.",
      color: "from-rose-400 via-pink-400 to-red-600",
      bgColor: "bg-gradient-to-br from-rose-50 to-pink-50",
      iconBg: "bg-gradient-to-r from-rose-400 to-pink-500",
      link: "https://multi-language-translator-nine.vercel.app/",
    },
    {
      id: "symbol-to-speech",
      title: "Symbol to Speech",
      icon: "🔤",
      description: "Select symbols and hear them spoken as complete sentences",
      longDescription:
        "Advanced symbol recognition that converts visual symbols into natural speech patterns with contextual understanding.",
      color: "from-amber-400 via-yellow-400 to-orange-600",
      bgColor: "bg-gradient-to-br from-amber-50 to-yellow-50",
      iconBg: "bg-gradient-to-r from-amber-400 to-yellow-500",
    },
    {
      id: "speech-to-symbol",
      title: "Speech to Symbol",
      icon: "🗣️",
      description:
        "Speak naturally and see your words converted to visual symbols",
      longDescription:
        "Revolutionary technology that transforms spoken language into meaningful symbol sequences for visual learners.",
      color: "from-lime-400 via-green-400 to-emerald-600",
      bgColor: "bg-gradient-to-br from-lime-50 to-green-50",
      iconBg: "bg-gradient-to-r from-lime-400 to-green-500",
    },
  ];

  const communicationIcons = [
    { id: 1, emoji: "😊", label: "Happy", category: "emotions" },
    { id: 2, emoji: "😢", label: "Sad", category: "emotions" },
    { id: 3, emoji: "🍎", label: "Apple", category: "food" },
    { id: 4, emoji: "🚗", label: "Car", category: "transport" },
    { id: 5, emoji: "🏠", label: "Home", category: "places" },
    { id: 6, emoji: "👋", label: "Hello", category: "greetings" },
    { id: 7, emoji: "💧", label: "Water", category: "needs" },
    { id: 8, emoji: "🛏️", label: "Sleep", category: "needs" },
    { id: 9, emoji: "📚", label: "Book", category: "activities" },
    { id: 10, emoji: "🎵", label: "Music", category: "activities" },
    { id: 11, emoji: "❤️", label: "Love", category: "emotions" },
    { id: 12, emoji: "🙏", label: "Please", category: "greetings" },
  ];

  const communicationSymbols = [
    { id: 1, symbol: "🏃", word: "run", category: "actions" },
    { id: 2, symbol: "🍕", word: "pizza", category: "food" },
    { id: 3, symbol: "🎈", word: "party", category: "events" },
    { id: 4, symbol: "🌟", word: "star", category: "objects" },
    { id: 5, symbol: "🎯", word: "goal", category: "concepts" },
    { id: 6, symbol: "🔥", word: "hot", category: "descriptors" },
    { id: 7, symbol: "❄️", word: "cold", category: "descriptors" },
    { id: 8, symbol: "🎪", word: "fun", category: "emotions" },
  ];

  const handleFeatureClick = (featureId) => {
    setActiveFeature(activeFeature === featureId ? null : featureId);
  };

  const handleIconSelect = (icon) => {
    setSelectedIcons((prev) => [...prev, icon]);
  };

  const clearSelectedIcons = () => {
    setSelectedIcons([]);
  };

  const speakSelectedIcons = () => {
    const message = selectedIcons.map((icon) => icon.label).join(" ");
    if (message && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      speechSynthesis.speak(utterance);
    }
  };

  return (
    // <BrailleInput />

    <div className="min-h-screen bg-gradient-communication relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-float-object-1 opacity-20 blur-xl"></div>
        <div className="absolute top-40 left-16 w-24 h-24 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-3xl animate-float-object-2 opacity-25 blur-lg"></div>
        <div className="absolute bottom-32 right-32 w-28 h-28 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl animate-float-object-3 opacity-20 blur-xl"></div>
        <div className="absolute top-60 left-1/3 w-20 h-20 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-bounce-gentle opacity-30 blur-lg"></div>
        <div className="absolute bottom-20 left-20 w-36 h-36 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full animate-wiggle opacity-15 blur-2xl"></div>

        {/* Additional floating shapes */}
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-500 rounded-xl animate-spin-slow opacity-25"></div>
        <div className="absolute bottom-1/3 left-1/4 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse opacity-30"></div>

        <div className="absolute top-1/4 left-1/2 w-14 h-14 bg-gradient-to-r from-violet-400 to-purple-500 rounded-2xl animate-float-object-1 opacity-25 blur-lg"></div>
        <div className="absolute bottom-1/4 right-1/3 w-18 h-18 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full animate-bounce-gentle opacity-20 blur-xl"></div>
        <div className="absolute top-3/4 left-1/5 w-22 h-22 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-3xl animate-wiggle opacity-25 blur-lg"></div>
        <div className="absolute bottom-1/2 right-1/5 w-16 h-16 bg-gradient-to-r from-lime-400 to-green-500 rounded-xl animate-spin-slow opacity-30 blur-lg"></div>

        {/* Enhanced sparkle effects */}
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-sparkle-dance opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2}s`,
            }}
          >
            <div
              className={`w-3 h-3 rounded-full ${
                i % 8 === 0
                  ? "bg-purple-400"
                  : i % 8 === 1
                  ? "bg-cyan-400"
                  : i % 8 === 2
                  ? "bg-emerald-400"
                  : i % 8 === 3
                  ? "bg-orange-400"
                  : i % 8 === 4
                  ? "bg-violet-400"
                  : i % 8 === 5
                  ? "bg-rose-400"
                  : i % 8 === 6
                  ? "bg-amber-400"
                  : "bg-lime-400"
              }`}
            ></div>
          </div>
        ))}
      </div>

      <div className="container mx-auto max-w-7xl p-6 relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="font-heading text-7xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 bg-clip-text text-transparent mb-6 animate-rainbow-glow">
            Communication Hub
          </h1>
          <p className="font-body text-2xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
            Express yourself in your own unique way - through words, voice,
            pictures, symbols, or video
          </p>
          <div className="mt-8 flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
          {communicationFeatures.map((feature, index) => (
            <Card
              key={feature.id}
              className={`group cursor-pointer transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${
                activeFeature === feature.id
                  ? "ring-4 ring-purple-400/50 shadow-2xl"
                  : "hover:shadow-xl"
              } bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden animate-fade-in-up`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleFeatureClick(feature.id)}
            >
              <CardHeader className="relative pb-4">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div
                    className={`w-16 h-16 ${feature.iconBg} rounded-2xl flex items-center justify-center text-3xl animate-bounce-gentle group-hover:animate-wiggle`}
                  >
                    {feature.icon}
                  </div>
                  <div>
                    <CardTitle className="font-heading text-xl text-foreground group-hover:text-purple-600 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center transition-transform group-hover:rotate-180`}
                  >
                    <span className="text-white text-sm">→</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-body text-sm text-foreground/70 mb-4 leading-relaxed text-center">
                  {feature.description}
                </p>
                <div
                  className={`transition-all duration-500 overflow-hidden ${
                    activeFeature === feature.id
                      ? "max-h-40 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="pt-4 border-t border-white/20">
                    <p className="font-body text-xs text-foreground/60 leading-relaxed mb-3">
                      {feature.longDescription}
                    </p>

                    <a
                      href={feature.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        className={`w-full bg-gradient-to-r ${feature.color} hover:scale-105 transition-all duration-300 px-4 py-2 rounded-xl text-white font-medium text-sm`}
                      >
                        Try {feature.title}
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {activeFeature && (
          <div className="animate-slide-up-fade">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden">
              <CardHeader className="text-center pb-6 bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
                <CardTitle className="font-heading text-3xl text-gradient">
                  {
                    communicationFeatures.find((f) => f.id === activeFeature)
                      ?.title
                  }{" "}
                  Demo
                </CardTitle>
                <p className="font-body text-lg text-foreground/70 mt-2">
                  Interactive preview - Full functionality coming soon!
                </p>
              </CardHeader>
              <CardContent className="p-8">
                {activeFeature === "text-to-speech" && (
                  <div className="space-y-6">
                    <Textarea
                      placeholder="Type your message here and I'll read it aloud for you..."
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      className="min-h-32 font-body text-xl resize-none bg-white/20 border-white/30 rounded-2xl backdrop-blur-sm"
                    />
                    <div className="flex justify-center">
                      <Button className="bg-gradient-to-r from-purple-400 to-pink-500 hover:scale-105 transition-all duration-300 px-8 py-3 rounded-2xl text-lg">
                        <span className="mr-2">🔊</span>
                        Speak Message
                      </Button>
                    </div>
                  </div>
                )}

                {activeFeature === "speech-to-text" && (
                  <div className="text-center space-y-8">
                    <div className="w-32 h-32 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mx-auto flex items-center justify-center animate-pulse">
                      <span className="text-6xl">🎤</span>
                    </div>
                    <Button className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:scale-105 transition-all duration-300 px-8 py-3 rounded-2xl text-lg">
                      Start Recording
                    </Button>
                  </div>
                )}

                {activeFeature === "picture-board" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                      {communicationIcons.slice(0, 8).map((icon) => (
                        <button
                          key={icon.id}
                          className="flex flex-col items-center p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 hover:bg-white/30 hover:scale-110 transition-all duration-300"
                        >
                          <span className="text-4xl mb-2 animate-bounce-gentle">
                            {icon.emoji}
                          </span>
                          <span className="font-body text-sm text-foreground/80">
                            {icon.label}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="text-center">
                      <Button className="bg-gradient-to-r from-emerald-400 to-teal-500 hover:scale-105 transition-all duration-300 px-8 py-3 rounded-2xl text-lg">
                        <span className="mr-2">🔊</span>
                        Speak Selection
                      </Button>
                    </div>
                  </div>
                )}

                {activeFeature === "video-messaging" && (
                  <div className="text-center space-y-8">
                    <div className="w-48 h-32 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl mx-auto flex items-center justify-center">
                      <span className="text-6xl animate-pulse">📹</span>
                    </div>
                    <div className="space-y-4">
                      <p className="font-body text-lg text-foreground/70">
                        Video recording with automatic captions
                      </p>
                      <Button className="bg-gradient-to-r from-orange-400 to-red-500 hover:scale-105 transition-all duration-300 px-8 py-3 rounded-2xl text-lg">
                        <span className="mr-2">🎬</span>
                        Start Recording
                      </Button>
                    </div>
                  </div>
                )}

                {activeFeature === "live-chat" && (
                  <div className="space-y-6">
                    <div className="bg-white/10 rounded-2xl p-6 max-h-64 overflow-y-auto">
                      <div className="space-y-4">
                        <div className="flex justify-start">
                          <div className="bg-gradient-to-r from-violet-400 to-purple-500 text-white px-4 py-2 rounded-2xl rounded-bl-sm max-w-xs">
                            <p className="font-body">
                              Hello! How are you today?
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-2xl rounded-br-sm max-w-xs">
                            <p className="font-body">I'm doing great! 😊</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Textarea
                        placeholder="Type your message..."
                        className="flex-1 min-h-12 font-body resize-none bg-white/20 border-white/30 rounded-2xl backdrop-blur-sm"
                      />
                      <Button className="bg-gradient-to-r from-violet-400 to-purple-500 hover:scale-105 transition-all duration-300 px-6 py-3 rounded-2xl">
                        Send
                      </Button>
                    </div>
                  </div>
                )}

                {activeFeature === "instant-translation" && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="font-body text-sm text-foreground/70">
                          Original Text
                        </label>
                        <Textarea
                          placeholder="Enter text to translate..."
                          className="min-h-32 font-body resize-none bg-white/20 border-white/30 rounded-2xl backdrop-blur-sm"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="font-body text-sm text-foreground/70">
                          Translated Text
                        </label>
                        <div className="min-h-32 p-4 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-sm">
                          <p className="font-body text-foreground/60 italic">
                            Translation will appear here...
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center space-x-4">
                      <select className="bg-white/20 border border-white/30 rounded-xl px-4 py-2 font-body backdrop-blur-sm">
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                      </select>
                      <Button className="bg-gradient-to-r from-rose-400 to-pink-500 hover:scale-105 transition-all duration-300 px-8 py-2 rounded-2xl">
                        <span className="mr-2">🌍</span>
                        Translate
                      </Button>
                    </div>
                  </div>
                )}

                {activeFeature === "symbol-to-speech" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                      {communicationSymbols.map((symbol) => (
                        <button
                          key={symbol.id}
                          className="flex flex-col items-center p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 hover:bg-white/30 hover:scale-110 transition-all duration-300"
                        >
                          <span className="text-4xl mb-2 animate-bounce-gentle">
                            {symbol.symbol}
                          </span>
                          <span className="font-body text-sm text-foreground/80">
                            {symbol.word}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="text-center space-y-4">
                      <div className="bg-white/10 rounded-2xl p-4">
                        <p className="font-body text-lg text-foreground/70">
                          Selected: "I want pizza for the party"
                        </p>
                      </div>
                      <Button className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:scale-105 transition-all duration-300 px-8 py-3 rounded-2xl text-lg">
                        <span className="mr-2">🔊</span>
                        Speak Symbols
                      </Button>
                    </div>
                  </div>
                )}

                {activeFeature === "speech-to-symbol" && (
                  <div className="text-center space-y-8">
                    <div className="w-32 h-32 bg-gradient-to-r from-lime-400 to-green-500 rounded-full mx-auto flex items-center justify-center animate-pulse">
                      <span className="text-6xl">🗣️</span>
                    </div>
                    <div className="space-y-4">
                      <p className="font-body text-lg text-foreground/70">
                        Speak and watch your words become symbols
                      </p>
                      <div className="bg-white/10 rounded-2xl p-6">
                        <div className="flex justify-center space-x-2 flex-wrap gap-2">
                          <span className="text-3xl animate-bounce-gentle">
                            🏃
                          </span>
                          <span
                            className="text-3xl animate-bounce-gentle"
                            style={{ animationDelay: "0.1s" }}
                          >
                            🏠
                          </span>
                          <span
                            className="text-3xl animate-bounce-gentle"
                            style={{ animationDelay: "0.2s" }}
                          >
                            🍎
                          </span>
                        </div>
                        <p className="font-body text-sm text-foreground/60 mt-2">
                          Symbols will appear as you speak
                        </p>
                      </div>
                      <Button className="bg-gradient-to-r from-lime-400 to-green-500 hover:scale-105 transition-all duration-300 px-8 py-3 rounded-2xl text-lg">
                        <span className="mr-2">🎤</span>
                        Start Speaking
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="text-center mt-16 animate-fade-in-up">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8">
            <h3 className="font-heading text-3xl text-gradient mb-4">
              Ready to Start Communicating?
            </h3>
            <p className="font-body text-lg text-foreground/70 mb-6 max-w-2xl mx-auto">
              Choose any communication method above to begin expressing yourself
              in your own unique way.
            </p>
            <div className="flex justify-center space-x-4">
              <Button className="bg-gradient-to-r from-purple-400 to-pink-500 hover:scale-105 transition-all duration-300 px-8 py-3 rounded-2xl text-lg">
                Get Started
              </Button>
              <Button
                variant="outline"
                className="border-white/30 hover:bg-white/10 hover:scale-105 transition-all duration-300 px-8 py-3 rounded-2xl text-lg bg-transparent"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
