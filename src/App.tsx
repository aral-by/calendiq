function App() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-foreground">
          Calendiq
        </h1>
        <p className="text-xl text-muted-foreground">
          Phase 1: Setup in progress...
        </p>
        <div className="flex gap-2 justify-center">
          <div className="w-3 h-3 rounded-full bg-brand-primary animate-pulse"></div>
          <div className="w-3 h-3 rounded-full bg-brand-primary animate-pulse delay-75"></div>
          <div className="w-3 h-3 rounded-full bg-brand-primary animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  )
}

export default App
