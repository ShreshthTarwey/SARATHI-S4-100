"use client"

import EducationDashboard from "@/components/education-dashboard"
import FlipbookViewer from "@/components/flipbook-viewer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link';
import ProtectedRoute from "@/components/ProtectedRoute";

export default function EducationPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[
          { icon: "🎨", delay: "0s", color: "text-coral-pink" },
          { icon: "🧠", delay: "1s", color: "text-sky-blue" },
          { icon: "🌟", delay: "2s", color: "text-sunny-yellow" },
          { icon: "🎯", delay: "3s", color: "text-mint-green" },
          { icon: "🚀", delay: "4s", color: "text-soft-lavender" },
          { icon: "💡", delay: "5s", color: "text-bright-orange" },
          { icon: "🎪", delay: "6s", color: "text-lime-green" },
        ].map((item, i) => (
          <div
            key={i}
            className={`absolute animate-float-object-${(i % 3) + 1} opacity-20`}
            style={{
              left: `${5 + i * 15}%`,
              top: `${10 + i * 12}%`,
              animationDelay: item.delay,
              animationDuration: `${6 + Math.random() * 4}s`,
            }}
          >
            <div className="bg-white/30 backdrop-blur-sm rounded-full p-4 shadow-lg">
              <span className={`text-4xl ${item.color}`}>{item.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="container mx-auto max-w-7xl relative z-10 p-4">
        <div className="text-center mb-16">
          <div className="animate-fade-in-up">
            <h1 className="font-heading text-6xl font-bold bg-gradient-rainbow bg-clip-text text-transparent mb-6 animate-rainbow-glow">
              🌈 SARATHI Learning Hub 🌈
            </h1>
            <p className="font-body text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
              Where every child's unique mind blossoms and grows!
              <span className="text-coral-pink font-semibold">
                {" "}
                Specially designed for children with Autism and Down Syndrome
              </span>
            </p>
          </div>

          <Card className="max-w-5xl mx-auto bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border-2 border-primary/30 mb-12 card-glow animate-slide-up-fade">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="text-left">
                  <h2 className="font-heading text-3xl font-bold text-foreground mb-4 flex items-center">
                    <span className="text-4xl mr-3 animate-bounce-fun">🧠</span>
                    Reshaping Young Minds
                  </h2>
                  <p className="font-body text-lg text-muted-foreground leading-relaxed mb-4">
                    Our interactive learning platform is scientifically designed to enhance cognitive development,
                    improve communication skills, and build confidence in children with special needs.
                  </p>
                  <p className="font-body text-lg text-muted-foreground leading-relaxed">
                    Through engaging games and activities, we help create new neural pathways, strengthen memory, and
                    develop essential life skills in a fun, supportive environment.
                  </p>
                </div>
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-48 h-48 bg-gradient-magical-purple rounded-full flex items-center justify-center animate-glow-pulse">
                      <span className="text-8xl animate-wiggle-dance">🎯</span>
                    </div>
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-sunny-yellow rounded-full flex items-center justify-center animate-bounce-gentle">
                      <span className="text-2xl">✨</span>
                    </div>
                    <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-mint-green rounded-full flex items-center justify-center animate-sparkle-twinkle">
                      <span className="text-xl">💫</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="max-w-4xl mx-auto bg-gradient-playful-pink border-2 border-primary/30 mb-12 game-card-3d animate-scale-in">
            <CardHeader>
              <CardTitle className="font-heading text-4xl text-white flex items-center justify-center">
                <span className="mr-3 text-5xl animate-wiggle-dance">🎮</span>
                Interactive Learning Games
                <span className="ml-3 text-5xl animate-wiggle-dance">🎮</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="font-body text-xl text-white/90 mb-8 leading-relaxed">
                Dive into our magical world of educational games designed to make learning fun and engaging! Each game
                is carefully crafted to support cognitive development and skill building.
              </p>
              <Link href="https://68d28836301779fd7ee92684.heyboss.live/start" target="_blank" 
              rel="noopener noreferrer" passHref>
                <Button className="games-button font-heading text-2xl px-12 py-6 rounded-2xl" size="lg">
                  <span className="mr-3 text-3xl animate-bounce-gentle">🚀</span>
                    Start Playing Games!
                  <span className="ml-3 text-3xl animate-bounce-gentle">🌟</span>
                </Button>
              </Link>
              <p className="font-body text-white/80 mt-4 text-sm">
                * Games will be available soon - this button is ready for your link!
              </p>
            </CardContent>
          </Card>

          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20 mb-8 animate-fade-in-up">
            <CardHeader>
              <CardTitle className="font-heading text-3xl flex items-center justify-center">
                <span className="mr-2">📚</span>
                Interactive Verified Syllabus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-body text-lg text-muted-foreground mb-6">
                Explore our comprehensive learning materials in an interactive flipbook format
              </p>
              <FlipbookViewer />
            </CardContent>
          </Card>
        </div>

        <EducationDashboard />
      </div>
    </div>
    </ProtectedRoute>
    
  )
}
