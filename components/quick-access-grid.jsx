"use client"

import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default function QuickAccessGrid() {
  const accessItems = [
    {
      title: "Communication Hub",
      description: "Enter communication tools",
      icon: "🗣️",
      color: "primary",
      href: "/communication",
    },
    {
      title: "Education Hub",
      description: "Enter fun learning games",
      icon: "🎮",
      color: "secondary",
      href: "/education",
    },
    {
      title: "Our Mission",
      description: "Learn why Sarathi exists",
      icon: "❤️",
      color: "accent",
      href: "/mission",
    },
  ]

  return (
    <section className="py-16 px-4 bg-muted/20">
      <div className="container mx-auto">
        <h2 className="font-heading text-4xl font-bold text-center mb-12 text-foreground">Quick Access</h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {accessItems.map((item, index) => (
            <Link key={item.title} href={item.href}>
              <Card
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 border-2 hover:border-primary/50"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardContent className="p-8 text-center">
                  <div
                    className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center group-hover:animate-pulse-glow transition-all duration-300 ${
                      item.color === "primary"
                        ? "bg-primary/20 group-hover:bg-primary/30"
                        : item.color === "secondary"
                          ? "bg-secondary/20 group-hover:bg-secondary/30"
                          : "bg-accent/20 group-hover:bg-accent/30"
                    }`}
                  >
                    <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                      {item.icon}
                    </span>
                  </div>

                  <h3 className="font-heading text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
