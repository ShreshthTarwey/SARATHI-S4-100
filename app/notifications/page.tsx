"use client";

import React from "react";
import { Bell, CheckCircle, AlertCircle, Info, Star } from "lucide-react";

export default function Notifications() {
  const notifications = [
    {
      id: 1,
      type: "achievement",
      title: "Learning Streak!",
      message: "You've completed 7 days in a row! Keep it up!",
      time: "2 hours ago",
      icon: Star,
      color: "text-sunny-yellow"
    },
    {
      id: 2,
      type: "reminder",
      title: "Daily Learning",
      message: "Don't forget to complete your daily learning activities.",
      time: "5 hours ago",
      icon: Bell,
      color: "text-sky-blue"
    },
    {
      id: 3,
      type: "success",
      title: "Game Completed!",
      message: "Great job completing the Memory Match game!",
      time: "1 day ago",
      icon: CheckCircle,
      color: "text-mint-green"
    },
    {
      id: 4,
      type: "info",
      title: "New Feature",
      message: "Check out the new communication tools we've added!",
      time: "2 days ago",
      icon: Info,
      color: "text-coral-pink"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-blue/10 via-mint-green/10 to-coral-pink/10 p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-sunny-yellow/20 rounded-full flex items-center justify-center">
              <Bell className="w-6 h-6 text-sunny-yellow" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-gray-800">
              Notifications
            </h1>
          </div>

          <div className="space-y-4">
            {notifications.map((notification) => {
              const IconComponent = notification.icon;
              return (
                <div
                  key={notification.id}
                  className="bg-gradient-to-r from-white/50 to-white/30 rounded-2xl p-6 border border-white/20 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notification.color.replace('text-', 'bg-')}/20`}>
                      <IconComponent className={`w-5 h-5 ${notification.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <span className="text-sm text-gray-500">
                        {notification.time}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500">
              You're all caught up! 🎉
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
