"use client"

import Marquee from "./marquee"

export default function QuotesMarquee() {
  const quotes = [
    "Every voice deserves to be heard.",
    "Learning is a right, not a privilege.",
    "Together, we communicate. Together, we grow.",
    "Technology as a companion, not just a tool.",
    "Breaking barriers, one connection at a time.",
  ]

  return (
    <section className="py-8 bg-muted/30">
      <Marquee className="text-lg font-body text-muted-foreground">
        <div className="flex items-center space-x-12">
          {quotes.map((quote, index) => (
            <span key={index} className="flex items-center space-x-4">
              <span className="text-primary">✨</span>
              <span className="italic">{quote}</span>
              <span className="text-primary">✨</span>
            </span>
          ))}
        </div>
      </Marquee>
    </section>
  )
}
