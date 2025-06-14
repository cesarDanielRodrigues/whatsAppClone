import React, { useState } from "react";

interface Message {
  id: string | number;
  message: string;
  sender?: string;
  datetime?: string;
  id_conversation: string | number;
}

interface MessagesProps {
  messages: Message[];
}

const Messages: React.FC<MessagesProps> = ({ messages }) => {
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setInput("");
  };

  return (
    <section className="flex flex-col h-screen w-full">
      <div className="flex-1 p-4 overflow-y-auto bg-[#222d34]">
        {messages.length === 0 ? (
          <div className="text-[#aebac1]">Nenhuma mensagem nesta conversa.</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="mb-10">
              <div className="text-[#e9edef]">{msg.sender ? <b>{msg.sender}: </b> : null}{msg.message}</div>
              {msg.datetime && <div className="text-xs text-[#aebac1]">{msg.datetime}</div>}
            </div>
          ))
        )}
      </div>
      {/* Campo para inserir texto */}
      <form onSubmit={handleSend} className="flex items-center gap-2 p-3 bg-[#202c33] border-t border-[#222d34]">
        <input
          type="text"
          className="flex-1 rounded-full px-4 py-2 bg-[#2a3942] text-[#e9edef] outline-none"
          placeholder="Digite uma mensagem"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="bg-[#25d366] text-[#111b21] px-4 py-2 rounded-full font-bold hover:bg-[#20b358] transition"
        >
          Enviar
        </button>
      </form>
    </section>
  );
};

export default Messages;
