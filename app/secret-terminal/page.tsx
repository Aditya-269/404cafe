"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Terminal, ArrowLeft, Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function SecretTerminal() {
  const router = useRouter()
  const { toast } = useToast()
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<string[]>([
    "Welcome to the 404 Café Terminal",
    "Type 'help' for available commands",
    "-----------------------------------",
  ])
  const [accessGranted, setAccessGranted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  // Available commands
  const commands = {
    help: "Shows available commands",
    clear: "Clears the terminal",
    about: "About this terminal",
    games: "Lists all hidden games",
    unlock: "Unlock secret content (requires password)",
    coffee: "Make a virtual coffee",
    exit: "Return to the café",
    
  }

  // Secret commands not shown in help
  const secretCommands = {
    sudo: "Nice try, but you don't have root access!",
    "rm -rf": "Please don't try to delete the café!",
    hack: "Hacking attempt detected! Just kidding...",
    matrix: "Wake up, Neo...",
    konami: "Up, Up, Down, Down, Left, Right, Left, Right, B, A",
    coffeebeans: "That's the image fix code!",
    
  }

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // Scroll to bottom when history changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  // Handle command execution
  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase()

    // Add command to history
    setHistory((prev) => [...prev, `> ${cmd}`])

    // Process command
    if (trimmedCmd === "") {
      return
    } 
   
    else if (trimmedCmd === "help") {
      setHistory((prev) => [
        ...prev,
        "Available commands:",
        ...Object.entries(commands).map(([cmd, desc]) => `  ${cmd} - ${desc}`),
      ])
    } else if (trimmedCmd === "clear") {
      setHistory(["Terminal cleared"])
    } else if (trimmedCmd === "about") {
      setHistory((prev) => [
        ...prev,
        "404 Café Terminal v1.0",
        "A secret terminal for bug hunters and coffee lovers",
        "Created by the 404 Café team",
      ])
    } else if (trimmedCmd === "games") {
      setHistory((prev) => [
        ...prev,
        "Hidden Games & Easter Eggs:",
        "1. Bug Hunter Barista - /404-game",
        "2. Coffee Catch - Activated by Konami code",
        "3. Debug Maze - Type 'debugMode()' in browser console",
        "4. Pixel Art - Need to fix the broken image",
        "5. Secret Terminal - You're here!",
        "6. ??? - Unlock with password",
        "7. ??? - Keep exploring!",
      ])
    } else if (trimmedCmd === "coffee") {
      setHistory((prev) => [
        ...prev,
        "☕ Brewing your virtual coffee...",
        "☕ Coffee ready! Enjoy your virtual caffeine boost!",
      ])
    } else if (trimmedCmd === "exit") {
      router.push("/")
    } else if (trimmedCmd === "unlock") {
      setHistory((prev) => [
        ...prev,
        "Password required to unlock secret content.",
        "Hint: What do you need to fix the broken image?",
      ])
    } else if (trimmedCmd === "matrix") {
      setHistory((prev) => [
        ...prev,
        "Entering the Matrix...",
        "...",
        "Wake up, Neo...",
        "Follow the white rabbit to /pixel-art",
      ])
    } else if (trimmedCmd.startsWith("unlock ")) {
      const password = trimmedCmd.split(" ")[1]
      if (password === "coffeebeans") {
        setHistory((prev) => [
          ...prev,
          "Access granted!",
          "Unlocking secret content...",
          "Visit /pixel-art to access the hidden pixel art creator!",
        ])
        setAccessGranted(true)
        toast({
          title: "Access Granted!",
          description: "Secret content unlocked!",
        })
      } else {
        setHistory((prev) => [...prev, "Incorrect password. Access denied."])
      }
    } else if (secretCommands[trimmedCmd as keyof typeof secretCommands]) {
      setHistory((prev) => [...prev, secretCommands[trimmedCmd as keyof typeof secretCommands]])
    } else {
      setHistory((prev) => [...prev, `Command not found: ${trimmedCmd}`, "Type 'help' for available commands"])
    }
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    executeCommand(input)
    setInput("")
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-8 bg-black text-green-500 font-mono">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Terminal className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Secret Terminal</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/")}
            className="flex items-center gap-1 border-green-500 text-green-500 hover:bg-green-900 hover:text-green-300"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Café
          </Button>
        </div>

        <Card className="bg-black border border-green-500 p-4 h-[70vh] flex flex-col text-green-500">
  <div ref={terminalRef} className="flex-1 overflow-y-auto mb-4 whitespace-pre-wrap text-green-400">
    {history.map((line, index) => (
      <div key={index} className="mb-1">{line}</div>
    ))}
  </div>

  <form onSubmit={handleSubmit} className="flex items-center">
    <span className="mr-2 text-green-500">$</span>
    <input
      ref={inputRef}
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      className="flex-1 bg-transparent border-none outline-none text-green-400 placeholder-green-600"
      autoComplete="off"
      spellCheck="false"
    />
  </form>
</Card>


        {accessGranted && (
          <div className="mt-6 p-4 border border-green-500 rounded-md text-center">
            <h2 className="text-xl mb-2">🎉 Secret Content Unlocked! 🎉</h2>
            <p className="mb-4">You've discovered the hidden pixel art creator!</p>
            <Button
              onClick={() => router.push("/pixel-art")}
              className="bg-green-800 hover:bg-green-700 text-green-100"
            >
              <Coffee className="mr-2 h-4 w-4" />
              Go to Pixel Art Creator
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

