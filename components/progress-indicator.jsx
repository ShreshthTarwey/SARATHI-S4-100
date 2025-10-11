"use client"

export default function ProgressIndicator({ completed, total, subject }) {
  const percentage = (completed / total) * 100

  return (
    <div className="bg-card rounded-lg p-4 border-2 border-border hover:border-primary/50 transition-colors duration-300">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-heading text-lg font-bold text-foreground">{subject}</h4>
        <span className="font-body text-sm text-muted-foreground">
          {completed}/{total}
        </span>
      </div>

      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <div className="mt-2 text-center">
        <span className="font-body text-sm font-bold text-primary">{Math.round(percentage)}% Complete</span>
      </div>
    </div>
  )
}
