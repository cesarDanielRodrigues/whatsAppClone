"use client"

import { useEffect, useState } from "react"

export default function Home() {
  const [conversation, setConversation] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("http://localhost:3333/")
      const data = await response.json()
      setConversation(data.conversations)
    }
    fetchData()
    const interval = setInterval(fetchData, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main>
      <aside className="w-80 h-screen bg-[#111b21] flex flex-col border-r border-[#222d34]">
        {/* Lista de conversas */}
        <nav className="flex-1 overflow-y-scroll">
          {conversation.map((conv) => {
            return (
              <button key={conv.id} type="button" className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2a3942] transition text-left border-b border-[#222d34]">
                <div className="flex-1">
                  <div className="font-semibold text-[#e9edef]">{conv.conversation}</div>
                </div>
              </button>
            )
          })}
        </nav>
      </aside>
    </main>
  )
}
