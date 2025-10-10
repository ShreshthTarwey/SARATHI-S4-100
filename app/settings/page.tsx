"use client";

import React from "react";
import { Settings as SettingsIcon, Bell, User, Shield, Palette, Globe } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-blue/10 via-mint-green/10 to-coral-pink/10 p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-mint-green/20 rounded-full flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-mint-green" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-gray-800">
              Settings
            </h1>
          </div>

          <div className="space-y-6">
            {/* Profile Settings */}
            <div className="bg-gradient-to-r from-sky-blue/10 to-mint-green/10 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <User className="w-5 h-5 text-sky-blue" />
                <h2 className="text-xl font-semibold text-gray-800">Profile Settings</h2>
              </div>
              <p className="text-gray-600">Manage your personal information and preferences.</p>
            </div>

            {/* Privacy Settings */}
            <div className="bg-gradient-to-r from-mint-green/10 to-coral-pink/10 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-5 h-5 text-mint-green" />
                <h2 className="text-xl font-semibold text-gray-800">Privacy & Security</h2>
              </div>
              <p className="text-gray-600">Control your privacy settings and account security.</p>
            </div>

            {/* Appearance */}
            <div className="bg-gradient-to-r from-coral-pink/10 to-sunny-yellow/10 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Palette className="w-5 h-5 text-coral-pink" />
                <h2 className="text-xl font-semibold text-gray-800">Appearance</h2>
              </div>
              <p className="text-gray-600">Customize the look and feel of your experience.</p>
            </div>

            {/* Language */}
            <div className="bg-gradient-to-r from-sunny-yellow/10 to-sky-blue/10 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Globe className="w-5 h-5 text-sunny-yellow" />
                <h2 className="text-xl font-semibold text-gray-800">Language & Region</h2>
              </div>
              <p className="text-gray-600">Set your preferred language and regional settings.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
