"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowUp, ArrowDown, ArrowRight, Bug, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

// Define maze cell types
type CellType = "wall" | "path" | "start" | "end" | "bug" | "visited"

// Define player position
type Position = {
  row: number
  col: number
}

export default function DebugMaze() {
  const router = useRouter()
  const { toast } = useToast()

  // Initial maze layout (0 = wall, 1 = path, 2 = start, 3 = end, 4 = bug)
  const initialMaze = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 2, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0],
    [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
    [0, 1, 1, 1, 1, 4, 0, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 3, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ]

  // Convert numeric maze to cell types
  const convertMaze = (numericMaze: number[][]) => {
    return numericMaze.map((row) =>
      row.map((cell) => {
        switch (cell) {
          case 0:
            return "wall" as CellType
          case 1:
            return "path" as CellType
          case 2:
            return "start" as CellType
          case 3:
            return "end" as CellType
          case 4:
            return "bug" as CellType
          default:
            return "path" as CellType
        }
      }),
    )
  }

  const [maze, setMaze] = useState<CellType[][]>(convertMaze(initialMaze))
  const [playerPosition, setPlayerPosition] = useState<Position>({ row: 1, col: 1 }) // Start position
  const [bugsFixed, setBugsFixed] = useState(0)
  const [totalBugs] = useState(2) // Total bugs in the maze
  const [moves, setMoves] = useState(0)
  const [gameWon, setGameWon] = useState(false)
  const [showHint, setShowHint] = useState(false)

  // Handle keyboard movement
  useEffect(() => {
    if (gameWon) return

    const handleKeyDown = (e: KeyboardEvent) => {
      let newRow = playerPosition.row
      let newCol = playerPosition.col

      switch (e.key) {
        case "ArrowUp":
          newRow--
          break
        case "ArrowDown":
          newRow++
          break
        case "ArrowLeft":
          newCol--
          break
        case "ArrowRight":
          newCol++
          break
        default:
          return
      }

      movePlayer(newRow, newCol)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [playerPosition, gameWon])

  // Move player if valid move
  const movePlayer = (newRow: number, newCol: number) => {
    // Check if position is within bounds
    if (newRow < 0 || newRow >= maze.length || newCol < 0 || newCol >= maze[0].length) {
      return
    }

    const targetCell = maze[newRow][newCol]

    // Check if the move is valid
    if (targetCell === "wall") {
      return
    }

    // Handle bug fixing
    if (targetCell === "bug") {
      toast({
        title: "Bug Fixed!",
        description: "You've debugged a part of the code!",
      })

      // Update maze to mark bug as fixed
      const newMaze = [...maze]
      newMaze[newRow][newCol] = "path"
      setMaze(newMaze)

      // Increment bug count
      setBugsFixed((prev) => {
        const newCount = prev + 1
        if (newCount >= totalBugs) {
          toast({
            title: "All Bugs Fixed!",
            description: "Now find the exit to complete the debug process!",
          })
        }
        return newCount
      })
    }

    // Handle reaching the end
    if (targetCell === "end") {
      if (bugsFixed >= totalBugs) {
        setGameWon(true)
        toast({
          title: "Debug Complete!",
          description: "You've successfully fixed all bugs and found the exit!",
        })
      } else {
        toast({
          title: "Not so fast!",
          description: `You need to fix all ${totalBugs} bugs before exiting!`,
          variant: "destructive",
        })
        return
      }
    }

    // Mark the cell as visited
    const newMaze = [...maze]
    if (
      newMaze[playerPosition.row][playerPosition.col] !== "start" &&
      newMaze[playerPosition.row][playerPosition.col] !== "end"
    ) {
      newMaze[playerPosition.row][playerPosition.col] = "visited"
    }
    setMaze(newMaze)

    // Update player position
    setPlayerPosition({ row: newRow, col: newCol })
    setMoves((prev) => prev + 1)
  }

  // Handle button movement
  const handleMove = (direction: "up" | "down" | "left" | "right") => {
    let newRow = playerPosition.row
    let newCol = playerPosition.col

    switch (direction) {
      case "up":
        newRow--
        break
      case "down":
        newRow++
        break
      case "left":
        newCol--
        break
      case "right":
        newCol++
        break
    }

    movePlayer(newRow, newCol)
  }

  // Reset the game
  const resetGame = () => {
    setMaze(convertMaze(initialMaze))
    setPlayerPosition({ row: 1, col: 1 })
    setBugsFixed(0)
    setMoves(0)
    setGameWon(false)
  }

  // Get cell color based on type
  const getCellColor = (cell: CellType) => {
    switch (cell) {
      case "wall":
        return "bg-gray-800"
      case "path":
        return "bg-[#e6d7c3]"
      case "start":
        return "bg-green-500"
      case "end":
        return "bg-blue-500"
      case "bug":
        return "bg-red-500"
      case "visited":
        return "bg-[#d4c3a3]"
      default:
        return "bg-[#e6d7c3]"
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-8 bg-[#f5f0e8] text-[#3a2c1d]">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Code className="h-8 w-8 text-[#8B4513]" />
            <h1 className="text-3xl font-bold">Debug Maze</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Café
          </Button>
        </div>

        {gameWon ? (
          <Card className="p-8 bg-[#fff8ee] border-[#d4c3a3] text-center">
            <h2 className="text-2xl font-bold mb-4">🎉 Debug Complete! 🎉</h2>
            <p className="mb-6">You've successfully fixed all bugs and found the exit!</p>

            <div className="p-4 bg-[#e6d7c3] rounded-md mb-6">
              <p className="font-bold mb-2">Debug Stats:</p>
              <p>
                Bugs Fixed: {bugsFixed}/{totalBugs}
              </p>
              <p>Moves Made: {moves}</p>
            </div>

            <div className="p-4 border border-dashed border-[#8B4513] rounded-md mb-6">
              <h3 className="text-lg font-bold mb-2">🎁 Secret Unlocked!</h3>
              <p className="mb-2">
                Try visiting <span className="font-mono font-bold">/secret-terminal</span> in the URL
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <Button onClick={resetGame}>Play Again</Button>
              <Button variant="outline" onClick={() => router.push("/")}>
                Return to Café
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card className="p-4 bg-[#fff8ee] border-[#d4c3a3]">
                  <div className="grid grid-cols-12 gap-1">
                    {maze.map((row, rowIndex) =>
                      row.map((cell, colIndex) => (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={`aspect-square ${getCellColor(cell)} rounded-sm flex items-center justify-center`}
                        >
                          {playerPosition.row === rowIndex && playerPosition.col === colIndex && (
                            <div className="w-3/4 h-3/4 bg-yellow-500 rounded-full animate-pulse shadow-lg"></div>
                          )}
                          {cell === "bug" && <Bug className="h-4 w-4 text-white" />}
                          {cell === "start" && rowIndex === 1 && colIndex === 1 && (
                            <span className="text-xs text-white">S</span>
                          )}
                          {cell === "end" && <span className="text-xs text-white">E</span>}
                        </div>
                      )),
                    )}
                  </div>
                </Card>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div></div>
                  <Button onClick={() => handleMove("up")} className="flex items-center justify-center">
                    <ArrowUp className="h-5 w-5" />
                  </Button>
                  <div></div>
                  <Button onClick={() => handleMove("left")} className="flex items-center justify-center">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <Button onClick={() => handleMove("down")} className="flex items-center justify-center">
                    <ArrowDown className="h-5 w-5" />
                  </Button>
                  <Button onClick={() => handleMove("right")} className="flex items-center justify-center">
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <Card className="p-4 bg-[#fff8ee] border-[#d4c3a3]">
                  <h2 className="text-lg font-bold mb-2">Debug Status</h2>
                  <div className="space-y-2">
                    <p>
                      Bugs Fixed: {bugsFixed}/{totalBugs}
                    </p>
                    <p>Moves: {moves}</p>
                  </div>
                </Card>

                <Card className="p-4 bg-[#fff8ee] border-[#d4c3a3]">
                  <h2 className="text-lg font-bold mb-2">Instructions</h2>
                  <div className="space-y-2 text-sm">
                    <p>Navigate the maze using arrow keys or buttons</p>
                    <p>Find and fix all bugs (red cells)</p>
                    <p>Reach the exit (E) after fixing all bugs</p>
                  </div>
                </Card>

                <div className="flex flex-col gap-2">
                  <Button variant="outline" onClick={resetGame}>
                    Reset Maze
                  </Button>
                  <Button variant="ghost" onClick={() => setShowHint(!showHint)}>
                    {showHint ? "Hide Hint" : "Show Hint"}
                  </Button>
                </div>

                {showHint && (
                  <Card className="p-4 bg-[#fff8ee] border-[#d4c3a3]">
                    <h3 className="text-md font-bold mb-2">Hint</h3>
                    <p className="text-sm">
                      There are two bugs in the maze. One is in the middle section, and another is near the bottom
                      right. Fix both before heading to the exit!
                    </p>
                  </Card>
                )}
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Use arrow keys or the buttons to navigate the maze.</p>
              <p className="mt-1">Find and fix all bugs to debug the system!</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

