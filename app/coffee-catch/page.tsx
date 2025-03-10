"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Coffee, Bug, ArrowLeft, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

type GameObject = {
  id: number
  x: number
  y: number
  type: "coffee" | "bug"
  speed: number
}

export default function CoffeeCatch() {
  const router = useRouter()
  const { toast } = useToast()
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [timeLeft, setTimeLeft] = useState(30)
  const [playerPosition, setPlayerPosition] = useState(50) // percentage
  const [objects, setObjects] = useState<GameObject[]>([])
  const [highScore, setHighScore] = useState(0)
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const requestRef = useRef<number | null>(null)
  const lastSpawnTimeRef = useRef<number>(0)

  // Initialize game
  useEffect(() => {
    // Try to load high score from localStorage
    try {
      const savedHighScore = localStorage.getItem("coffeeCatchHighScore")
      if (savedHighScore) {
        setHighScore(Number.parseInt(savedHighScore))
      }
    } catch (e) {
      console.error("Could not load high score", e)
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [])

  // Game timer
  useEffect(() => {
    if (!gameStarted || gameOver) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameStarted, gameOver])

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return

    const gameLoop = (timestamp: number) => {
      // Spawn new objects
      if (timestamp - lastSpawnTimeRef.current > Math.random() * 500 + 500) {
        lastSpawnTimeRef.current = timestamp

        const newObject: GameObject = {
          id: Date.now(),
          x: Math.random() * 90 + 5, // 5% to 95% of width
          y: 0,
          type: Math.random() > 0.3 ? "coffee" : "bug", // 70% coffee, 30% bugs
          speed: Math.random() * 2 + 1, // Speed between 1-3
        }

        setObjects((prev) => [...prev, newObject])
      }

      // Move objects down
      setObjects((prev) => {
        const updatedObjects = prev.map((obj) => ({
          ...obj,
          y: obj.y + obj.speed,
        }))

        // Check for collisions with player
        const playerRect = {
          left: playerPosition - 5,
          right: playerPosition + 5,
          top: 85,
          bottom: 95,
        }

        let scoreChange = 0
        let livesChange = 0

        const remainingObjects = updatedObjects.filter((obj) => {
          // Remove objects that have gone off screen
          if (obj.y > 100) return false

          // Check for collision with player
          if (obj.y > 80 && obj.y < 95) {
            const objRect = {
              left: obj.x - 2,
              right: obj.x + 2,
              top: obj.y - 2,
              bottom: obj.y + 2,
            }

            if (objRect.left < playerRect.right && objRect.right > playerRect.left) {
              // Collision detected
              if (obj.type === "coffee") {
                scoreChange += 1
                toast({
                  title: "Coffee caught!",
                  description: "+1 point",
                  variant: "default",
                })
                return false
              } else {
                livesChange -= 1
                toast({
                  title: "Bug caught!",
                  description: "Lost a life!",
                  variant: "destructive",
                })
                return false
              }
            }
          }

          return true
        })

        if (scoreChange > 0) {
          setScore((prev) => prev + scoreChange)
        }

        if (livesChange < 0) {
          setLives((prev) => {
            const newLives = prev + livesChange
            if (newLives <= 0) {
              endGame()
              return 0
            }
            return newLives
          })
        }

        return remainingObjects
      })

      requestRef.current = requestAnimationFrame(gameLoop)
    }

    requestRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [gameStarted, gameOver, playerPosition, toast])

  // Handle mouse/touch movement
  useEffect(() => {
    if (!gameStarted || gameOver) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!gameAreaRef.current) return

      const rect = gameAreaRef.current.getBoundingClientRect()
      const relativeX = e.clientX - rect.left
      const percentage = (relativeX / rect.width) * 100
      setPlayerPosition(Math.max(5, Math.min(95, percentage)))
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!gameAreaRef.current || !e.touches[0]) return

      const rect = gameAreaRef.current.getBoundingClientRect()
      const relativeX = e.touches[0].clientX - rect.left
      const percentage = (relativeX / rect.width) * 100
      setPlayerPosition(Math.max(5, Math.min(95, percentage)))
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("touchmove", handleTouchMove)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("touchmove", handleTouchMove)
    }
  }, [gameStarted, gameOver])

  const startGame = () => {
    setGameStarted(true)
    setGameOver(false)
    setScore(0)
    setLives(3)
    setTimeLeft(30)
    setObjects([])
    lastSpawnTimeRef.current = 0
  }

  const endGame = () => {
    setGameOver(true)

    // Update high score if needed
    if (score > highScore) {
      setHighScore(score)
      try {
        localStorage.setItem("coffeeCatchHighScore", score.toString())
      } catch (e) {
        console.error("Could not save high score", e)
      }
    }

    // Easter egg for high scores
    if (score >= 20) {
      toast({
        title: "Amazing Score!",
        description: "You've unlocked a hint: Try /pixel-art in the URL!",
      })
    }
  }

  if (!gameStarted || gameOver) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-[#f5f0e8] text-[#3a2c1d]">
        <Card className="w-full max-w-2xl p-8 bg-[#fff8ee] border-[#d4c3a3] shadow-lg">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-2">
              <Coffee className="h-8 w-8 text-[#8B4513]" />
              <h1 className="text-3xl font-bold">Coffee Catch</h1>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Back to Café
            </Button>
          </div>

          <div className="space-y-6">
            {gameOver ? (
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">Game Over!</h2>
                <div className="p-4 bg-[#e6d7c3] rounded-md">
                  <p className="text-xl mb-2">Your Score: {score}</p>
                  <p className="font-bold">High Score: {highScore}</p>
                </div>

                {score >= highScore && score > 0 && (
                  <div className="flex items-center justify-center gap-2 text-amber-600">
                    <Trophy className="h-5 w-5" />
                    <p className="font-bold">New High Score!</p>
                  </div>
                )}

                <Button onClick={startGame} size="lg" className="mt-4">
                  Play Again
                </Button>
              </div>
            ) : (
              <>
                <div className="p-4 bg-[#e6d7c3] rounded-md">
                  <h2 className="text-xl font-bold mb-2">☕ Konami Code Activated!</h2>
                  <p className="mb-4">Catch the falling coffee beans while avoiding the bugs!</p>
                  <p>Use your mouse or touch to move the cup left and right.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold">🎮 Game Rules:</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Catch coffee beans for points</li>
                    <li>Avoid bugs or lose lives</li>
                    <li>You have 30 seconds and 3 lives</li>
                    <li>High scores might reveal secrets!</li>
                  </ul>
                </div>

                <div className="flex justify-center">
                  <Button size="lg" onClick={startGame} className="px-8">
                    Start Game
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-8 bg-[#f5f0e8] text-[#3a2c1d]">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Coffee className="h-8 w-8 text-[#8B4513]" />
            <h1 className="text-3xl font-bold">Coffee Catch</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Café
          </Button>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-1">Score</h3>
            <p className="text-2xl font-bold">{score}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-1">Lives</h3>
            <div className="flex gap-1 mt-1">
              {[...Array(3)].map((_, i) => (
                <Coffee key={i} className={`h-6 w-6 ${i < lives ? "text-[#8B4513]" : "text-[#d4c3a3]"}`} />
              ))}
            </div>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-1">Time</h3>
            <Progress value={(timeLeft / 30) * 100} className="h-2 mt-2" />
            <p className="text-sm mt-1">{timeLeft}s</p>
          </Card>
        </div>

        {/* Game Area */}
        <div
          ref={gameAreaRef}
          className="relative w-full h-[70vh] bg-[#e6d7c3] rounded-lg overflow-hidden border-2 border-[#d4c3a3]"
        >
          {/* Game Objects */}
          {objects.map((obj) => (
            <div
              key={obj.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ease-in-out animate-bounce"
              style={{
                left: `${obj.x}%`,
                top: `${obj.y}%`,
              }}
            >
              {obj.type === "coffee" ? (
                <Coffee className="h-8 w-8 text-[#8B4513]" />
              ) : (
                <Bug className="h-8 w-8 text-black" />
              )}
            </div>
          ))}

          {/* Player */}
          <div className="absolute bottom-0 transform -translate-x-1/2 transition-transform duration-100 ease-out" style={{ left: `${playerPosition}%` }}>
            <div className="relative">
              <div className="w-16 h-12 bg-white rounded-t-3xl border-2 border-b-0 border-[#d4c3a3] shadow-lg"></div>
              <div className="absolute -right-2 top-2 w-6 h-8 border-2 rounded-full border-[#d4c3a3]"></div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          Move your mouse or finger to catch coffee beans and avoid bugs!
        </div>
      </div>
    </div>
  )
}

