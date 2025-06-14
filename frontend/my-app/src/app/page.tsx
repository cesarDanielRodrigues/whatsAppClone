"use client"

import { useEffect, useState } from "react"
import Messages from "./Messages"

interface Message {
  id: string | number
  message: string
  sender?: string
  datetime?: string
  id_conversation: string | number
}

interface Conversation {
  id: string | number
  conversation: string
  messages: Message[]
}

export default function Home() {
  const [conversation, setConversation] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<number>(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [allMessages, setAllMessages] = useState<Message[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("http://localhost:3333/")
      const data = await response.json()
      setConversation(data.conversations)
      setAllMessages(data.messages)
    }
    fetchData()
    const interval = setInterval(fetchData, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleSelect = (id: string | number) => {
    setSelectedId(id)
    const filtered = allMessages.filter((msg: Message) => String(msg.id_conversation) === String(id))
    setMessages(filtered)
  }

  return (
    <main className="flex">
      <aside className="w-80 h-screen bg-[#111b21] flex flex-col border-r border-[#222d34]">
        {/* Lista de conversas */}
        <nav className="flex-1 overflow-y-scroll">
          {conversation.map((conv) => {
            return (
              <button key={conv.id} type="button" onClick={() => handleSelect(conv.id)} className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2a3942] transition text-left border-b border-[#222d34] ${selectedId === conv.id ? "bg-[#2a3942]" : ""}`}>
                <div className="flex-1">
                  <div className="font-semibold text-[#e9edef]">{conv.conversation}</div>
                </div>
              </button>
            )
          })}
        </nav>
      </aside>
      <Messages messages={messages} conversationId={selectedId ?? undefined} />
    </main>
  )
}
