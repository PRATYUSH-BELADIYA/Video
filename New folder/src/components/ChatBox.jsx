import React, { useRef, useState, useEffect } from 'react'

export default function ChatBox({ messages, onSend }) {
  const [text, setText] = useState('')
  const boxRef = useRef(null)

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages])

  const handleSend = () => {
    if (!text.trim()) return
    onSend(text.trim())
    setText('')
  }

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-lg font-medium mb-3">Chat</h3>

      {/* Messages box */}
      <div
        ref={boxRef}
        className="flex-1 min-h-[260px] max-h-[420px] overflow-y-auto rounded-xl p-3 bg-black/30 border border-white/10 space-y-2"
      >
        {messages.length === 0 && (
          <div className="text-white/40 text-sm">No messages yet</div>
        )}

        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`max-w-[80%] text-sm px-3 py-2 rounded-xl ${
              m.from === 'me'
                ? 'ml-auto bg-brand/20 border border-brand/40'
                : 'bg-white/10 border border-white/10'
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      {/* Input + Send button */}
      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 rounded-xl bg-black/40 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-brand/60"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 rounded-xl bg-brand hover:bg-brand/90 shadow-glow"
        >
          Send
        </button>
      </div>
    </div>
  )
}

