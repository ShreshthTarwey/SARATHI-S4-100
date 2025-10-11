"use client"

export default function Marquee({ children, className = "" }) {
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <div className="inline-block animate-marquee">{children}</div>
      <div className="inline-block animate-marquee" aria-hidden="true">
        {children}
      </div>
    </div>
  )
}
