"use client";

import Link from "next/link";
import { Sparkles, Menu, X, User, Settings, Bell, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const navLinks = [
    { href: "/communication", label: "Communication", icon: "💬" },
    { href: "/education", label: "Education", icon: "🎮" },
    { href: "/stories", label: "Stories", icon: "📚" },
    { href: "/mission", label: "Mission", icon: "🎯" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b-2 border-sunny-yellow/30 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="animate-sparkle-dance">
              <Sparkles className="w-8 h-8 text-sunny-yellow sarathi-icon" />
            </div>
            <span className="font-heading text-3xl font-bold bg-gradient-to-r from-sky-blue via-mint-green to-coral-pink bg-clip-text text-transparent group-hover:animate-rainbow-glow">
              SARATHI
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-body text-gray-700 hover:text-blue-500 transition-all duration-300 hover:scale-105 flex items-center space-x-1 group"
                prefetch={true}
              >
                <span className="group-hover:animate-bounce-gentle text-xl">
                  {link.icon}
                </span>
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}
          </div>

          <div className="hidden md:block relative">
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={logout}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          <button
            className="md:hidden p-2 rounded-full bg-mint-green/20 hover:bg-mint-green/30 transition-colors sarathi-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-700 sarathi-icon" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700 sarathi-icon" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-sunny-yellow/30 bg-gradient-to-r from-sky-blue/5 via-mint-green/5 to-coral-pink/5">
            <div className="space-y-3">
              {navLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-sunny-yellow/20 rounded-lg transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-2xl">{link.icon}</span>
                  <span className="font-body font-medium">{link.label}</span>
                </Link>
              ))}

              <hr className="mx-4 border-gray-200" />

              <div className="px-4 space-y-2">
                {user ? (
                  <>
                    <Link
                      href="/profile"
                      className="flex items-center space-x-3 px-2 py-2 text-gray-700 hover:bg-blue-100 rounded-lg transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-5 h-5 text-blue-500" />
                      <span className="font-body font-medium">My Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 px-2 py-2 text-gray-700 hover:bg-red-100 rounded-lg transition-all duration-300 w-full text-left"
                    >
                      <LogOut className="w-5 h-5 text-red-500" />
                      <span className="font-body font-medium">Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="flex items-center space-x-3 px-2 py-2 text-gray-700 hover:bg-blue-100 rounded-lg transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-5 h-5 text-blue-500" />
                      <span className="font-body font-medium">Login</span>
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="flex items-center space-x-3 px-2 py-2 text-gray-700 hover:bg-green-100 rounded-lg transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="w-5 h-5 text-green-500" />
                      <span className="font-body font-medium">Sign Up</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
