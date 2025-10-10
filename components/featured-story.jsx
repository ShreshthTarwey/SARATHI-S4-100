"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function FeaturedStory() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <h2 className="font-heading text-4xl font-bold text-center mb-12 text-foreground">Featured Learner Story</h2>

        <Card className="max-w-4xl mx-auto overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
          <CardContent className="p-0">
            <div className="md:flex">
              <div className="md:w-1/2 bg-gradient-to-br from-primary/20 to-accent/20 p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 bg-primary/30 rounded-full flex items-center justify-center animate-pulse-glow">
                    <span className="text-4xl">🌟</span>
                  </div>
                  <p className="font-body text-sm text-muted-foreground">Aarav's Learning Journey</p>
                </div>
              </div>

              <div className="md:w-1/2 p-8">
                <h3 className="font-heading text-2xl font-bold mb-4 text-foreground">From Silence to Confidence</h3>
                <p className="font-body text-muted-foreground mb-6 leading-relaxed">
                  "Aarav, a 8-year-old with hearing difficulties, discovered his love for learning through Sarathi's
                  visual games. In just 3 months, he mastered shapes, colors, and basic counting while building
                  confidence in communication."
                </p>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className="text-secondary text-xl animate-sparkle"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span className="font-body text-sm text-muted-foreground">Progress: 95% Complete</span>
                </div>
                <Button className="font-heading bg-accent hover:bg-accent/90 transform hover:scale-105 transition-all duration-200">
                  Read Their Journey
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
