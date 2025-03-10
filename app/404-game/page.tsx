"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Coffee, MouseIcon as Mug, Flame, User, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

type Customer = {
  id: number
  name: string
  order: string
  difficulty: number
  special?: string
}

type GameState = {
  customers: Customer[]
  currentCustomer: number
  machineState: "coffee" | "tea" | "soup" | "lava"
  score: number
  sanity: number
  timeLeft: number
  gameOver: boolean
  gameWon: boolean
  events: string[]
}

export default function BugHunterBarista() {
  const router = useRouter()
  const { toast } = useToast()
  const [gameStarted, setGameStarted] = useState(false)
  const [gameState, setGameState] = useState<GameState>({
    customers: [
      { id: 1, name: "Regular Joe", order: "coffee", difficulty: 1 },
      { id: 2, name: "Picky Patty", order: "coffee with extra milk", difficulty: 2, special: "Wants exact change" },
      { id: 3, name: "Developer Dan", order: "strong coffee", difficulty: 2, special: "Pays in Bitcoin" },
      {
        id: 4,
        name: "Manager Karen",
        order: "complicated order",
        difficulty: 3,
        special: "Will complain no matter what",
      },
      { id: 5, name: "Hacker Harry", order: "SQL injection coffee", difficulty: 3, special: "WiFi crashes" },
    ],
    currentCustomer: 0,
    machineState: "coffee",
    score: 0,
    sanity: 100,
    timeLeft: 60,
    gameOver: false,
    gameWon: false,
    events: [],
  })

  // Game timer
  useEffect(() => {
    if (!gameStarted || gameState.gameOver) return

    const timer = setInterval(() => {
      setGameState((prev) => {
        // Random machine state changes
        if (Math.random() < 0.1) {
          const states: ("coffee" | "tea" | "soup" | "lava")[] = ["coffee", "tea", "soup", "lava"]
          const newState = states[Math.floor(Math.random() * states.length)]

          toast({
            title: "Machine Malfunction!",
            description: `Your coffee machine is now making ${newState}!`,
            variant: "destructive",
          })

          return {
            ...prev,
            machineState: newState,
            events: [...prev.events, `Coffee machine switched to ${newState} mode`],
          }
        }

        // Random events
        if (Math.random() < 0.05 && prev.events.length < 5) {
          const events = [
            "The floor is lava! Jump on a chair!",
            "Cash register is speaking JavaScript!",
            "Customer wants a refund in Bitcoins!",
            "WiFi crashed! Write orders on napkins!",
            "Health inspector arrived!",
          ]
          const newEvent = events[Math.floor(Math.random() * events.length)]

          toast({
            title: "Random Event!",
            description: newEvent,
          })

          return {
            ...prev,
            sanity: Math.max(0, prev.sanity - 10),
            events: [...prev.events, newEvent],
          }
        }

        // Time running out
        if (prev.timeLeft <= 0) {
          return {
            ...prev,
            gameOver: true,
            gameWon: false,
          }
        }

        // Sanity check
        if (prev.sanity <= 0) {
          return {
            ...prev,
            gameOver: true,
            gameWon: false,
          }
        }

        return {
          ...prev,
          timeLeft: prev.timeLeft - 1,
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameStarted, gameState.gameOver, toast])

  const startGame = () => {
    setGameState({
      customers: [
        { id: 1, name: "Regular Joe", order: "coffee", difficulty: 1 },
        { id: 2, name: "Picky Patty", order: "coffee with extra milk", difficulty: 2, special: "Wants exact change" },
        { id: 3, name: "Developer Dan", order: "strong coffee", difficulty: 2, special: "Pays in Bitcoin" },
        {
          id: 4,
          name: "Manager Karen",
          order: "complicated order",
          difficulty: 3,
          special: "Will complain no matter what",
        },
        { id: 5, name: "Hacker Harry", order: "SQL injection coffee", difficulty: 3, special: "WiFi crashes" },
      ],
      currentCustomer: 0,
      machineState: "coffee",
      score: 0,
      sanity: 100,
      timeLeft: 60,
      gameOver: false,
      gameWon: false,
      events: [],
    })
    setGameStarted(true)
  }

  const serveCustomer = () => {
    setGameState((prev) => {
      const customer = prev.customers[prev.currentCustomer]
      let success = false
      let sanityChange = -5
      let message = ""

      // Check if we can serve this customer successfully
      if (prev.machineState === "coffee") {
        success = true
        sanityChange = 0
        message = `Successfully served ${customer.name}!`
      } else if (prev.machineState === "tea" && Math.random() > 0.5) {
        success = true
        sanityChange = -5
        message = `${customer.name} accepted tea instead of coffee!`
      } else {
        message = `${customer.name} is unhappy with their ${prev.machineState}!`
        sanityChange = -10 - customer.difficulty * 5
      }

      // Handle special customer requirements
      if (customer.special) {
        if (customer.special === "Pays in Bitcoin" && Math.random() < 0.3) {
          message += " They paid in Bitcoin but you can't figure out the wallet!"
          sanityChange -= 10
        } else if (customer.special === "Will complain no matter what") {
          message += " Karen wants to speak to your manager!"
          sanityChange -= 15
        }
      }

      toast({
        title: success ? "Customer Served!" : "Customer Unhappy!",
        description: message,
        variant: success ? "default" : "destructive",
      })

      const newScore = success ? prev.score + 1 : prev.score
      const newCustomerIndex = prev.currentCustomer + 1

      // Check win condition
      if (newScore >= 5) {
        return {
          ...prev,
          score: newScore,
          gameOver: true,
          gameWon: true,
          events: [...prev.events, message],
        }
      }

      // Check if we've run out of customers
      if (newCustomerIndex >= prev.customers.length) {
        return {
          ...prev,
          score: newScore,
          gameOver: true,
          gameWon: false,
          events: [...prev.events, message],
        }
      }

      return {
        ...prev,
        currentCustomer: newCustomerIndex,
        score: newScore,
        sanity: Math.max(0, prev.sanity + sanityChange),
        events: [...prev.events, message],
      }
    })
  }

  const throwMuffin = () => {
    setGameState((prev) => {
      const customer = prev.customers[prev.currentCustomer]
      let message = ""
      let sanityChange = 0

      if (customer.special === "Will complain no matter what") {
        message = "You threw a muffin at Karen! She's shocked and leaves!"
        sanityChange = 10

        toast({
          title: "Muffin Defense Activated!",
          description: message,
        })

        return {
          ...prev,
          currentCustomer: prev.currentCustomer + 1,
          score: prev.score + 1,
          sanity: Math.min(100, prev.sanity + sanityChange),
          events: [...prev.events, message],
        }
      } else {
        message = `You threw a muffin at ${customer.name}! They're offended and leave!`
        sanityChange = -20

        toast({
          title: "Customer Offended!",
          description: message,
          variant: "destructive",
        })

        return {
          ...prev,
          currentCustomer: prev.currentCustomer + 1,
          sanity: Math.max(0, prev.sanity + sanityChange),
          events: [...prev.events, message],
        }
      }
    })
  }

  const fixMachine = () => {
    setGameState((prev) => {
      if (Math.random() < 0.5) {
        toast({
          title: "Machine Fixed!",
          description: "You managed to fix the coffee machine!",
        })

        return {
          ...prev,
          machineState: "coffee",
          sanity: Math.min(100, prev.sanity + 10),
          events: [...prev.events, "Successfully fixed the coffee machine"],
        }
      } else {
        toast({
          title: "Fix Failed!",
          description: "Your attempt to fix the machine made it worse!",
          variant: "destructive",
        })

        const states: ("coffee" | "tea" | "soup" | "lava")[] = ["tea", "soup", "lava"]
        const newState = states[Math.floor(Math.random() * states.length)]

        return {
          ...prev,
          machineState: newState,
          sanity: Math.max(0, prev.sanity - 15),
          events: [...prev.events, `Failed to fix machine, now it's making ${newState}`],
        }
      }
    })
  }

  if (!gameStarted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-[#f5f0e8] text-[#3a2c1d]">
        <Card className="w-full max-w-2xl p-8 bg-[#fff8ee] border-[#d4c3a3] shadow-lg">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-2">
              <Coffee className="h-8 w-8 text-[#8B4513]" />
              <h1 className="text-3xl font-bold">Bug Hunter Barista</h1>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Back to Café
            </Button>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-[#e6d7c3] rounded-md">
              <h2 className="text-xl font-bold mb-2">🎮 Welcome to the Secret Mini-Game!</h2>
              <p className="mb-4">You've discovered the hidden game! Congratulations, bug hunter!</p>
              <p>Your job? Survive one shift in the world's most dysfunctional café!</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold">🔴 Game Rules:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Serve 5 customers to win</li>
                <li>Your coffee machine keeps switching between Tea, Soup, and Lava</li>
                <li>The cash register speaks in broken JavaScript</li>
                <li>Random events will test your sanity</li>
                <li>If your sanity reaches 0, you lose!</li>
              </ul>
            </div>

            <div className="flex justify-center">
              <Button size="lg" onClick={startGame} className="px-8">
                Start Shift
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (gameState.gameOver) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-[#f5f0e8] text-[#3a2c1d]">
        <Card className="w-full max-w-2xl p-8 bg-[#fff8ee] border-[#d4c3a3] shadow-lg">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-2">
              <Coffee className="h-8 w-8 text-[#8B4513]" />
              <h1 className="text-3xl font-bold">Bug Hunter Barista</h1>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Back to Café
            </Button>
          </div>

          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold">{gameState.gameWon ? "🎉 You Won! 🎉" : "😵 Game Over 😵"}</h2>

            <div className="p-6 bg-[#e6d7c3] rounded-md">
              <p className="text-xl mb-4">
                {gameState.gameWon
                  ? "You survived your shift at the world's buggiest café!"
                  : "You couldn't handle the chaos of the buggy café!"}
              </p>
              <p className="font-bold">Final Score: {gameState.score} / 5 customers served</p>
              <p>Remaining Sanity: {gameState.sanity}%</p>
            </div>

            {gameState.gameWon && (
              <div className="p-4 border border-dashed border-[#8B4513] rounded-md">
                <h3 className="text-lg font-bold mb-2">🎁 Your Reward</h3>
                <p className="mb-2">One Free Virtual Coffee Coupon</p>
                <p className="text-sm text-muted-foreground">(which, of course, does nothing)</p>
              </div>
            )}

            <div className="flex justify-center gap-4">
              <Button onClick={startGame}>Try Again</Button>
              <Button variant="outline" onClick={() => router.push("/")}>
                Return to Café
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  const currentCustomer = gameState.customers[gameState.currentCustomer]

  return (
    <div className="flex min-h-screen flex-col items-center p-8 bg-[#f5f0e8] text-[#3a2c1d]">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Coffee className="h-8 w-8 text-[#8B4513]" />
            <h1 className="text-3xl font-bold">Bug Hunter Barista</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Café
          </Button>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-1">Customers Served</h3>
            <p className="text-2xl font-bold">{gameState.score} / 5</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-1">Time Left</h3>
            <p className="text-2xl font-bold">{gameState.timeLeft}s</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-1">Sanity</h3>
            <Progress value={gameState.sanity} className="h-2 mt-2" />
            <p className="text-sm mt-1">{gameState.sanity}%</p>
          </Card>
        </div>

        {/* Game Area */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Side - Customer */}
          <Card className="p-6 bg-[#fff8ee] border-[#d4c3a3]">
            <div className="flex items-center gap-3 mb-4">
              <User className="h-10 w-10 p-2 bg-primary/10 rounded-full" />
              <div>
                <h2 className="text-xl font-bold">{currentCustomer.name}</h2>
                {currentCustomer.special && (
                  <Badge variant="outline" className="mt-1">
                    {currentCustomer.special}
                  </Badge>
                )}
              </div>
            </div>

            <div className="p-4 bg-[#e6d7c3] rounded-md mb-4">
              <p className="italic">"{currentCustomer.order}"</p>
            </div>

            <div className="flex gap-2">
              <Button onClick={serveCustomer} className="flex-1">
                Serve Customer
              </Button>
              <Button variant="outline" onClick={throwMuffin}>
                Throw Muffin
              </Button>
            </div>
          </Card>

          {/* Right Side - Coffee Machine */}
          <Card className="p-6 bg-[#fff8ee] border-[#d4c3a3]">
            <h2 className="text-xl font-bold mb-4">Coffee Machine</h2>

            <div className="flex items-center justify-center p-6 bg-[#e6d7c3] rounded-md mb-4">
              {gameState.machineState === "coffee" && <Coffee className="h-16 w-16 text-[#8B4513]" />}
              {gameState.machineState === "tea" && <Mug className="h-16 w-16 text-[#8B4513]" />}
              {gameState.machineState === "soup" && <Mug className="h-16 w-16 text-[#FF8C00]" />}
              {gameState.machineState === "lava" && <Flame className="h-16 w-16 text-[#FF4500]" />}
            </div>

            <div className="mb-4">
              <p className="text-center font-medium">
                Currently making: <span className="font-bold">{gameState.machineState}</span>
              </p>
              {gameState.machineState !== "coffee" && (
                <p className="text-center text-sm text-muted-foreground mt-1">
                  This is probably not what the customer ordered!
                </p>
              )}
            </div>

            <Button onClick={fixMachine} variant="outline" className="w-full">
              Try to Fix Machine
            </Button>
          </Card>
        </div>

        {/* Event Log */}
        <Card className="mt-6 p-4 bg-[#fff8ee] border-[#d4c3a3]">
          <h3 className="text-sm font-medium mb-2">Event Log:</h3>
          <div className="max-h-32 overflow-y-auto text-sm">
            {gameState.events.length === 0 ? (
              <p className="text-muted-foreground">No events yet...</p>
            ) : (
              <ul className="space-y-1">
                {gameState.events
                  .slice()
                  .reverse()
                  .map((event, index) => (
                    <li key={index} className="border-b border-[#e6d7c3] pb-1">
                      {event}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </Card>

        {/* Floor is Lava */}
        {gameState.events.includes("The floor is lava! Jump on a chair!") && (
          <div className="fixed bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#FF4500] to-transparent animate-pulse">
            <p className="text-white text-center text-xs">THE FLOOR IS LAVA!</p>
          </div>
        )}
      </div>
    </div>
  )
}

