"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import AchievementBadge from "./achievement-badge"
import ProgressChart from "./progress-chart"
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LearnerProfile() {
  const [activeTab, setActiveTab] = useState("overview")
  const { user, logout } = useAuth()

  // Show loading state if user data is not yet loaded
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="auth-loading mx-auto mb-4"></div>
          <p className="font-body text-lg text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const learnerData = {
    name: user.name,
    age: 8,
    joinDate: "March 2024",
    totalStars: 47,
    gamesCompleted: 23,
    streakDays: 12,
    favoriteGame: "Shapes & Colors",
    avatar: "🌟",
  }

  const achievements = [
    {
      id: 1,
      title: "First Steps",
      description: "Completed first game",
      icon: "👶",
      isEarned: true,
    },
    {
      id: 2,
      title: "Shape Master",
      description: "Perfect score in Shapes & Colors",
      icon: "🎨",
      isEarned: true,
    },
    {
      id: 3,
      title: "Counting Champion",
      description: "Completed 10 counting games",
      icon: "🔢",
      isEarned: true,
    },
    {
      id: 4,
      title: "Memory Wizard",
      description: "Perfect memory match game",
      icon: "🧠",
      isEarned: false,
    },
    {
      id: 5,
      title: "Pattern Pro",
      description: "Master of patterns",
      icon: "🌀",
      isEarned: false,
    },
    {
      id: 6,
      title: "Week Warrior",
      description: "7-day learning streak",
      icon: "🔥",
      isEarned: true,
    },
  ]

  const progressData = [
    { label: "Shapes", value: 8 },
    { label: "Colors", value: 10 },
    { label: "Numbers", value: 5 },
    { label: "Memory", value: 3 },
    { label: "Patterns", value: 2 },
  ]

  const weeklyActivity = [
    { label: "Mon", value: 3 },
    { label: "Tue", value: 5 },
    { label: "Wed", value: 2 },
    { label: "Thu", value: 7 },
    { label: "Fri", value: 4 },
    { label: "Sat", value: 6 },
    { label: "Sun", value: 1 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-gradient-to-br from-blue-400 to-green-500 rounded-full opacity-30 animate-float-delayed"></div>
        <div className="absolute bottom-40 left-20 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-25 animate-float-slow"></div>
        <div className="absolute bottom-20 right-10 w-14 h-14 bg-gradient-to-br from-green-400 to-teal-500 rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-30 animate-float-delayed"></div>
        <div className="absolute top-1/3 right-1/3 w-10 h-10 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full opacity-25 animate-float-slow"></div>
      </div>

      <div className="container mx-auto max-w-6xl p-4 relative z-10">
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="font-heading text-5xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-4">
            ✨ Learning Journey ✨
          </h1>
          <p className="font-body text-xl text-gray-600 italic max-w-2xl mx-auto">
            "Every child is gifted. They just unwrap their packages at different times."
            <span className="block text-sm mt-2 font-semibold">- Unknown</span>
          </p>
        </div>

        <Card className="mb-8 hover:shadow-2xl transition-all duration-500 animate-fade-in-up bg-gradient-to-r from-white via-pink-50 to-purple-50 border-2 border-pink-200 hover:border-purple-300">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-pink-300 via-purple-300 to-blue-300 rounded-full flex items-center justify-center animate-pulse-rainbow shadow-lg">
                  <span className="text-6xl animate-bounce-gentle">{learnerData.avatar}</span>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg animate-pulse">
                  <span className="text-sm font-bold">{learnerData.streakDays}</span>
                </div>
              </div>

              <div className="text-center md:text-left flex-1">
                <h1 className="font-heading text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  {learnerData.name}
                </h1>
                <p className="font-body text-lg text-gray-600 mb-4">
                  🌱 Growing since {learnerData.joinDate} • Age {learnerData.age} 🎂
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300 shadow-md">
                    <div className="text-3xl font-heading font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                      {learnerData.totalStars}
                    </div>
                    <div className="text-sm font-body text-gray-600">⭐ Stars Earned</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300 shadow-md">
                    <div className="text-3xl font-heading font-bold bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent">
                      {learnerData.gamesCompleted}
                    </div>
                    <div className="text-sm font-body text-gray-600">🎮 Games Won</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300 shadow-md">
                    <div className="text-3xl font-heading font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                      {learnerData.streakDays}
                    </div>
                    <div className="text-sm font-body text-gray-600">🔥 Day Streak</div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-100 to-orange-200 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300 shadow-md">
                    <div className="text-2xl font-heading font-bold">🎨</div>
                    <div className="text-sm font-body text-gray-600">Favorite Game</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 hover:border-purple-300 transition-all duration-500 hover:shadow-xl animate-fade-in-up">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <h3 className="font-heading text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                📊 Detailed Progress Tracking
              </h3>
              <p className="font-body text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Dear parents, witness your child's incredible journey! Our comprehensive progress dashboard shows
                detailed analytics, skill development patterns, and celebrates every milestone achieved by children with
                Autism and Down Syndrome.
              </p>
            </div>
            <Link
              href="https://68d28836301779fd7ee92684.heyboss.live/parent-enter-id"
              target="_blank" 
              rel="noopener noreferrer" 
            >
              <Button className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
                         hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 
                         text-white font-heading text-lg px-8 py-4 rounded-xl shadow-lg 
                         hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                🚀 View Detailed Progress Dashboard
              </Button>
            </Link>
            <p className="font-body text-sm text-gray-500 mt-3 italic">
              "Progress is impossible without change, and those who cannot change their minds cannot change anything." -
              George Bernard Shaw
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-center mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="bg-white rounded-xl p-2 shadow-lg border-2 border-pink-100">
            {[
              { key: "overview", label: "Overview", icon: "📊" },
              { key: "achievements", label: "Achievements", icon: "🏆" },
              { key: "progress", label: "Progress", icon: "📈" },
            ].map((tab) => (
              <Button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                variant={activeTab === tab.key ? "default" : "ghost"}
                className={`font-heading capitalize mx-1 px-6 py-3 rounded-lg transition-all duration-300 ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md transform scale-105"
                    : "hover:bg-pink-50 text-gray-600"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <ProgressChart data={progressData} title="Skills Progress" />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
              <ProgressChart data={weeklyActivity} title="This Week's Activity" />
            </div>
          </div>
        )}

        {activeTab === "achievements" && (
          <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <Card className="hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="font-heading text-2xl flex items-center">
                  <span className="mr-2">🏆</span>
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {achievements.map((achievement, index) => (
                    <div
                      key={achievement.id}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                    >
                      <AchievementBadge achievement={achievement} isEarned={achievement.isEarned} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "progress" && (
          <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <Card className="hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="font-heading text-2xl flex items-center">
                  <span className="mr-2">📈</span>
                  Learning Journey
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-6">
                    <h3 className="font-heading text-xl font-bold text-foreground mb-4">Recent Milestones</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">✓</span>
                        </div>
                        <div>
                          <p className="font-body font-bold text-foreground">Completed Shapes & Colors Level 5</p>
                          <p className="font-body text-sm text-muted-foreground">2 days ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">✓</span>
                        </div>
                        <div>
                          <p className="font-body font-bold text-foreground">Earned "Counting Champion" badge</p>
                          <p className="font-body text-sm text-muted-foreground">1 week ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">✓</span>
                        </div>
                        <div>
                          <p className="font-body font-bold text-foreground">Started learning journey</p>
                          <p className="font-body text-sm text-muted-foreground">{learnerData.joinDate}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="text-center mt-12 animate-fade-in-up" style={{ animationDelay: "0.8s" }}>
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 border-2 border-pink-200 hover:border-purple-300 transition-all duration-500 hover:shadow-xl">
            <CardContent className="p-8">
              <div className="mb-6">
                <h3 className="font-heading text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                  🌟 Keep Shining Bright, {learnerData.name}! 🌟
                </h3>
                <p className="font-body text-lg text-gray-600 leading-relaxed mb-6">
                  You're doing absolutely fantastic! Every game you play, every challenge you complete, and every smile
                  you share helps you grow stronger, smarter, and more confident. Your unique way of learning makes the
                  world more beautiful!
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl p-6 hover:scale-105 transition-transform duration-300">
                  <p className="font-body text-gray-700 italic text-center">
                    "Different, not less. Every child has their own unique way of learning and growing."
                  </p>
                  <p className="text-sm text-gray-500 text-center mt-2 font-semibold">- Temple Grandin</p>
                </div>
                <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-xl p-6 hover:scale-105 transition-transform duration-300">
                  <p className="font-body text-gray-700 italic text-center">
                    "The expert in anything was once a beginner. Keep learning, keep growing!"
                  </p>
                  <p className="text-sm text-gray-500 text-center mt-2 font-semibold">- Helen Hayes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
