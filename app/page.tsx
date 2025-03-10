"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Coffee, Bug, AlertTriangle, X, KeyRound, Code, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useToast } from "../hooks/use-toast";

export default function Home() {
  const [runawayPosition, setRunawayPosition] = useState({ top: 300, left: 300 })
  const [showConsoleHint, setShowConsoleHint] = useState(false)
  const [konamiIndex, setKonamiIndex] = useState(0)
  const [clickCount, setClickCount] = useState(0)
  const [showGlitchText, setShowGlitchText] = useState(false)
  const [secretCodeVisible, setSecretCodeVisible] = useState(false)
  const runawayButtonRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Konami code sequence: up, up, down, down, left, right, left, right, b, a
  const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]

  // Console Easter Egg
  useEffect(() => {
    console.error("Uncaught Error: CoffeeTooColdException ☕🔥")
    console.log("Fix it by typing 'heatCoffee()' in the console.")
    console.log(
      "%cThere are 7 hidden games/Easter eggs on this site. Can you find them all?",
      "color: green; font-size: 14px; font-weight: bold;",
    )

    // @ts-ignore - Intentionally adding to window for the Easter Egg
    window.heatCoffee = () => {
      router.push("/404-game")
    }

    // @ts-ignore - Another Easter Egg
    window.debugMode = () => {
      router.push("/debug-maze")
    }

    // @ts-ignore - Yet another Easter Egg
    window.fixAllBugs = () => {
      toast({
        title: "Nice try!",
        description: "Bugs can't be fixed that easily! Try clicking the coffee cup 10 times.",
      })
    }

    const timer = setTimeout(() => {
      setShowConsoleHint(true)
    }, 5000)

    return () => clearTimeout(timer)
  }, [router, toast])

  // Konami code detector
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.keyCode === konamiCode[konamiIndex]) {
        const nextIndex = konamiIndex + 1
        setKonamiIndex(nextIndex)

        if (nextIndex === konamiCode.length) {
          // Konami code completed!
          setKonamiIndex(0)
          router.push("/coffee-catch")
        }
      } else {
        setKonamiIndex(0)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [konamiIndex, router])

  // Mouse trail effect on certain clicks
  useEffect(() => {
    const createSparkle = (x: number, y: number) => {
      const sparkle = document.createElement("div")
      sparkle.className = "absolute pointer-events-none z-50 text-yellow-500 animate-ping"
      sparkle.innerHTML = "✨"
      sparkle.style.left = `${x}px`
      sparkle.style.top = `${y}px`
      document.body.appendChild(sparkle)

      setTimeout(() => {
        sparkle.remove()
      }, 700)
    }

    const handleSpecialClick = (e: MouseEvent) => {
      // Only create sparkles when clicking on specific elements
      const target = e.target as HTMLElement
      if (target.classList.contains("sparkle-trigger")) {
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            createSparkle(e.pageX - 10 + Math.random() * 20, e.pageY - 10 + Math.random() * 20)
          }, i * 100)
        }
      }
    }

    window.addEventListener("click", handleSpecialClick)
    return () => window.removeEventListener("click", handleSpecialClick)
  }, [])

  // Runaway button logic
  const handleAntiClick = () => {
    const maxWidth = window.innerWidth - 150
    const maxHeight = window.innerHeight - 150

    setRunawayPosition({
      top: Math.random() * maxHeight,
      left: Math.random() * maxWidth,
    })
  }

  const catchButton = () => {
    router.push("/404-game")
  }

  // Fake loading logic
  const [loading, setLoading] = useState(false)
  const handleMenuClick = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      alert("Error 418: I'm a teapot. Cannot brew coffee.")
    }, 2000)
  }

  // Coffee cup click counter for secret
  const handleCoffeeClick = () => {
    const newCount = clickCount + 1
    setClickCount(newCount)

    if (newCount === 5) {
      toast({
        title: "Hmm...",
        description: "The coffee cup seems to be reacting to your clicks...",
      })
    }

    if (newCount === 10) {
      toast({
        title: "Secret Unlocked!",
        description: "Type 'debugMode()' in the console to access the Debug Maze!",
      })
      setClickCount(0)
    }
  }

  // Glitch text effect
  const toggleGlitchText = () => {
    setShowGlitchText(!showGlitchText)
    if (!showGlitchText) {
      setTimeout(() => {
        setSecretCodeVisible(true)
        setTimeout(() => setSecretCodeVisible(false), 3000)
      }, 1000)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-[#f5f0e8] text-[#3a2c1d]">
      <header className="w-full max-w-5xl flex justify-between items-center mb-12">
        <div className="flex items-center gap-2">
          <Coffee className="h-8 w-8 text-[#8B4513] cursor-pointer sparkle-trigger" onClick={handleCoffeeClick} />
          <h1 className="text-4xl font-bold">404 Café</h1>
        </div>
        <nav className="flex gap-4">
          <Button variant="ghost" onClick={handleMenuClick} className="font-medium">
            {loading ? "Loading..." : "Menu"}
          </Button>
          <Button variant="ghost" className="font-medium" onClick={() => alert("Our location is undefined")}>
            Location
          </Button>
          <Button variant="ghost" className="font-medium" onClick={() => (window.location.href = window.location.href)}>
            Refresh Page
          </Button>
        </nav>
      </header>

      <div className="w-full max-w-5xl mb-12">
        <Card className="p-6 bg-[#fff8ee] border-[#d4c3a3] shadow-md">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-4">The Most Buggy Café on the Internet! ☕💀</h2>
              <p className="text-lg mb-4">A website so broken, even your coffee will crash!</p>
              <p className="mb-4 text-[#FF0000] flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Warning: Our website contains numerous bugs. Proceed with caution!</span>
              </p>
              <div className="flex gap-4 mt-6">
                <Button onClick={() => alert("Sorry, our ordering system is currently experiencing a stack overflow.")}>
                  Order Now
                </Button>
                <Button
                  variant="outline"
                  onClick={() => alert("Error: Connection to barista timed out after 30 seconds.")}
                >
                  Contact Us
                </Button>
              </div>
              <div className="mt-4 text-xs text-gray-500 cursor-pointer hover:text-gray-700" onClick={toggleGlitchText}>
                {showGlitchText ? (
                  <div className="glitch-text font-mono">
                    <span className="relative inline-block">
                      {secretCodeVisible ? (
                        <span className="text-green-600 font-bold">
                          Try pressing Up Up Down Down Left Right Left Right B A
                        </span>
                      ) : (
                        <>
                          <span className="absolute top-0 left-0 -ml-1 text-red-500 animate-pulse">ERROR_DETECTED</span>
                          <span className="absolute top-0 left-0 ml-1 text-blue-500 animate-pulse">ERROR_DETECTED</span>
                          <span>ERROR_DETECTED</span>
                        </>
                      )}
                    </span>
                  </div>
                ) : (
                  <span>Click here to view our terms of service</span>
                )}
              </div>
            </div>
            <div className="flex-1 relative min-h-[200px] bg-[#e6d7c3] rounded-md overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                <p className="text-lg font-medium">Image failed to load: CoffeeImageNotFound.jpg</p>
              </div>
              <div className="absolute bottom-2 right-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="sparkle-trigger"
                  onClick={() => {
                    const secretCode = prompt("Enter the secret code to fix the image:")
                    if (secretCode?.toLowerCase() === "coffeebeans") {
                      router.push("/pixel-art")
                    } else {
                      alert("Image debugging tool not responding")
                    }
                  }}
                >
                  <Bug className="h-4 w-4 mr-1" /> Fix Image
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Runaway Button */}
      <div className="w-full max-w-5xl mb-12 relative h-[200px] border border-dashed border-[#8B4513] rounded-lg p-4">
        <h3 className="text-xl font-bold mb-4 text-center">Bug Testing Area</h3>
        <Button
          ref={runawayButtonRef}
          variant="destructive"
          className="absolute transition-all duration-200 z-10"
          style={{ top: `${runawayPosition.top}px`, left: `${runawayPosition.left}px` }}
          onMouseOver={handleAntiClick}
          onClick={catchButton}
        >
          DO NOT CLICK
        </Button>
        <p className="text-center mt-4 text-sm text-muted-foreground">Try to catch the button if you can!</p>
      </div>

      {/* Hidden Puzzle */}
      <div className="w-full max-w-5xl mb-12">
        <Card className="p-6 bg-[#fff8ee] border-[#d4c3a3] shadow-md overflow-hidden">
          <h3 className="text-xl font-bold mb-4">Daily Special</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            {["C", "O", "F", "F", "E", "E", "B", "E", "A","N","E","S"].map((letter, index) => (
              <div
                key={index}
                className="w-12 h-12 mx-auto bg-[#e6d7c3] rounded-md flex items-center justify-center font-bold cursor-pointer sparkle-trigger hover:bg-[#d4c3a3] transition-colors"
                onClick={() => {
                  if (index === 8) {
                    // Last letter "A"
                    toast({
                      title: "You found a clue!",
                      description: "The image fix code might be related to these letters...",
                    })
                  }
                }}
              >
                {letter}
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">Today's special brew is a mystery!</p>
        </Card>
      </div>

      {/* Secret Message */}
      <div className="w-full max-w-5xl mb-12 relative">
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity duration-500">
          <div className="bg-black text-white text-xs p-2 rounded-md whitespace-nowrap">
            <code>Try /secret-terminal in the URL</code>
            <br />
            <code>Try /debug-maze in the URL</code>
          </div>
        </div>
      </div>

      {/* Console Hint */}
      {showConsoleHint && (
        <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-md shadow-lg max-w-xs animate-bounce">
          <div className="flex justify-between items-start">
            <p className="text-sm">
              <span className="font-bold">Hint:</span> Check your browser console (F12) for a secret message!
            </p>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowConsoleHint(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <footer className="w-full max-w-5xl mt-auto pt-8 border-t border-[#d4c3a3] text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} 404 Café | All rights reserved |
          <Link href="/404-game" className="ml-1 text-[#8B4513] hover:underline">
            Report a Bug
          </Link>
        </p>
        <div className="mt-2 flex justify-center gap-2">
          <KeyRound className="h-4 w-4 text-[#d4c3a3] cursor-pointer hover:text-[#8B4513] transition-colors" />
          <Code className="h-4 w-4 text-[#d4c3a3] cursor-pointer hover:text-[#8B4513] transition-colors" />
          <Sparkles className="h-4 w-4 text-[#d4c3a3] cursor-pointer hover:text-[#8B4513] transition-colors" />
        </div>
      </footer>
    </main>
  )
}

