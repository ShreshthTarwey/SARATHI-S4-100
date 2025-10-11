"use client"

export default function ProgressChart({ data, title }) {
  const maxValue = Math.max(...data.map((item) => item.value))

  return (
    <div className="bg-card rounded-lg p-6 border-2 border-border hover:border-primary/50 transition-colors duration-300">
      <h3 className="font-heading text-lg font-bold text-foreground mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-20 font-body text-sm text-muted-foreground">{item.label}</div>
            <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  animationDelay: `${index * 0.2}s`,
                }}
              ></div>
            </div>
            <div className="w-12 font-body text-sm font-bold text-primary text-right">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
