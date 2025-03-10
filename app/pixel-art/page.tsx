"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Coffee, ArrowLeft, Download, Trash2, Save, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

// Define color palette
const COLORS = [
  "#8B4513", // Coffee brown
  "#000000", // Black
  "#FFFFFF", // White
  "#FF0000", // Red
  "#00FF00", // Green
  "#0000FF", // Blue
  "#FFFF00", // Yellow
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#FFA500", // Orange
  "#800080", // Purple
  "#A52A2A", // Brown
]

export default function PixelArt() {
  const router = useRouter()
  const { toast } = useToast()
  const [grid, setGrid] = useState<string[][]>([])
  const [selectedColor, setSelectedColor] = useState(COLORS[0])
  const [gridSize, setGridSize] = useState(16)
  const [isDrawing, setIsDrawing] = useState(false)
  const [savedArt, setSavedArt] = useState<{ name: string; grid: string[][] }[]>([])

  // Initialize grid
  useEffect(() => {
    createNewGrid()

    // Try to load saved art from localStorage
    try {
      const saved = localStorage.getItem("pixelArt")
      if (saved) {
        setSavedArt(JSON.parse(saved))
      }
    } catch (e) {
      console.error("Could not load saved art", e)
    }
  }, [])

  // Create a new empty grid
  const createNewGrid = () => {
    const newGrid = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill("#FFFFFF"))
    setGrid(newGrid)
  }

  // Handle pixel click/drag
  const handlePixelInteraction = (rowIndex: number, colIndex: number) => {
    if (!isDrawing && grid[rowIndex][colIndex] === selectedColor) return

    const newGrid = [...grid]
    newGrid[rowIndex][colIndex] = selectedColor
    setGrid(newGrid)
  }

  // Save current art
  const saveArt = () => {
    const name = prompt("Enter a name for your pixel art:")
    if (!name) return

    const newSavedArt = [...savedArt, { name, grid }]
    setSavedArt(newSavedArt)

    try {
      localStorage.setItem("pixelArt", JSON.stringify(newSavedArt))
      toast({
        title: "Art Saved!",
        description: `"${name}" has been saved to your collection.`,
      })
    } catch (e) {
      toast({
        title: "Save Failed",
        description: "Could not save to local storage.",
        variant: "destructive",
      })
    }
  }

  // Load saved art
  const loadArt = (index: number) => {
    setGrid([...savedArt[index].grid])
    toast({
      title: "Art Loaded",
      description: `"${savedArt[index].name}" has been loaded.`,
    })
  }

  // Delete saved art
  const deleteArt = (index: number) => {
    const newSavedArt = [...savedArt]
    newSavedArt.splice(index, 1)
    setSavedArt(newSavedArt)

    try {
      localStorage.setItem("pixelArt", JSON.stringify(newSavedArt))
      toast({
        title: "Art Deleted",
        description: "The selected art has been removed from your collection.",
      })
    } catch (e) {
      console.error("Could not update localStorage", e)
    }
  }

  // Download art as PNG
  const downloadArt = () => {
    const canvas = document.createElement("canvas")
    const pixelSize = 20
    canvas.width = grid[0].length * pixelSize
    canvas.height = grid.length * pixelSize
    const ctx = canvas.getContext("2d")

    if (ctx) {
      // Draw pixels
      for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[0].length; col++) {
          ctx.fillStyle = grid[row][col]
          ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize)
        }
      }

      // Create download link
      const link = document.createElement("a")
      link.download = "404-cafe-pixel-art.png"
      link.href = canvas.toDataURL("image/png")
      link.click()

      toast({
        title: "Download Complete",
        description: "Your pixel art has been downloaded as a PNG file.",
      })
    }
  }

  // Change grid size
  const changeGridSize = (size: number) => {
    setGridSize(size)
    const newGrid = Array(size)
      .fill(null)
      .map(() => Array(size).fill("#FFFFFF"))
    setGrid(newGrid)
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-8 bg-[#f5f0e8] text-[#3a2c1d]">
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Coffee className="h-8 w-8 text-[#8B4513]" />
            <h1 className="text-3xl font-bold">Pixel Art Creator</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Café
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left sidebar - Tools */}
          <div className="space-y-4">
            <Card className="p-4 bg-[#fff8ee] border-[#d4c3a3]">
              <h2 className="text-lg font-bold mb-4">Tools</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Grid Size</h3>
                  <div className="flex gap-2">
                    <Button
                      variant={gridSize === 8 ? "default" : "outline"}
                      size="sm"
                      onClick={() => changeGridSize(8)}
                    >
                      8×8
                    </Button>
                    <Button
                      variant={gridSize === 16 ? "default" : "outline"}
                      size="sm"
                      onClick={() => changeGridSize(16)}
                    >
                      16×16
                    </Button>
                    <Button
                      variant={gridSize === 32 ? "default" : "outline"}
                      size="sm"
                      onClick={() => changeGridSize(32)}
                    >
                      32×32
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={createNewGrid} className="flex items-center gap-1">
                      <Trash2 className="h-4 w-4" /> Clear
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadArt} className="flex items-center gap-1">
                      <Download className="h-4 w-4" /> Export
                    </Button>
                    <Button variant="outline" size="sm" onClick={saveArt} className="flex items-center gap-1">
                      <Save className="h-4 w-4" /> Save
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-[#fff8ee] border-[#d4c3a3]">
              <h2 className="text-lg font-bold mb-4">Color Palette</h2>
              <div className="grid grid-cols-4 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-md ${selectedColor === color ? "ring-2 ring-offset-2 ring-black" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    aria-label={`Select ${color} color`}
                  />
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="font-medium text-sm">Selected:</div>
                <div className="w-6 h-6 rounded-md" style={{ backgroundColor: selectedColor }}></div>
                <div className="text-xs font-mono">{selectedColor}</div>
              </div>
            </Card>

            {savedArt.length > 0 && (
              <Card className="p-4 bg-[#fff8ee] border-[#d4c3a3]">
                <h2 className="text-lg font-bold mb-4">Saved Art</h2>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {savedArt.map((art, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <button
                        className="text-left text-sm hover:underline truncate max-w-[150px]"
                        onClick={() => loadArt(index)}
                      >
                        {art.name}
                      </button>
                      <Button variant="ghost" size="sm" onClick={() => deleteArt(index)} className="h-6 w-6 p-0">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Main canvas */}
          <div className="md:col-span-2">
            <Card className="p-4 bg-[#fff8ee] border-[#d4c3a3]">
              <div
                className="grid border border-gray-300 bg-white"
                style={{
                  gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                  aspectRatio: "1/1",
                }}
                onMouseDown={() => setIsDrawing(true)}
                onMouseUp={() => setIsDrawing(false)}
                onMouseLeave={() => setIsDrawing(false)}
              >
                {grid.map((row, rowIndex) =>
                  row.map((color, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className="border border-gray-100"
                      style={{ backgroundColor: color }}
                      onMouseDown={() => handlePixelInteraction(rowIndex, colIndex)}
                      onMouseOver={() => isDrawing && handlePixelInteraction(rowIndex, colIndex)}
                    />
                  )),
                )}
              </div>
            </Card>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>Click and drag to draw. Create your own coffee-themed pixel art!</p>
              <p className="mt-1">This is a hidden game you've discovered! There are more to find...</p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 border border-dashed border-[#d4c3a3] rounded-md text-center">
          <h2 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
            <Palette className="h-5 w-5" />
            Easter Egg Unlocked: Pixel Art Creator
          </h2>
          <p>Congratulations on finding this hidden feature! Create and save your own pixel art.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Hint: There are still more secrets to discover in the 404 Café...
          </p>
        </div>
      </div>
    </div>
  )
}

