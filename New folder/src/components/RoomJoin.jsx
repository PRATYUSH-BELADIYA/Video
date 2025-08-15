// import React from 'react'

// export default function RoomJoin({ roomId, setRoomId, onJoin }) {
//   return (
//     <div className="flex flex-col items-center gap-4">
//       <h2 className="text-xl sm:text-2xl font-medium">Join a Room</h2>
//       <p className="text-white/60 text-sm">
//         Enter a Room ID and start your call.
//       </p>

//       <div className="flex w-full max-w-md gap-2">
//         <input
//           className="flex-1 rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-brand/60"
//           placeholder="e.g. team-standup"
//           value={roomId}
//           onChange={(e) => setRoomId(e.target.value.trim())}
//         />
//         <button
//           onClick={onJoin}
//           className="rounded-xl px-4 py-3 bg-brand hover:bg-brand/90 active:scale-[0.98] transition shadow-glow"
//         >
//           Join
//         </button>
//       </div>
//     </div>
//   )
// }


import React from 'react'

export default function RoomJoin({ roomId, setRoomId, name, setName, onJoin }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-xl sm:text-2xl font-medium">Join a Room</h2>
      <p className="text-white/60 text-sm">Enter your name and room ID to start your call.</p>

      <input
        className="w-full max-w-md rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-brand/60"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div className="flex w-full max-w-md gap-2">
        <input
          className="flex-1 rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-brand/60"
          placeholder="e.g. team-standup"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value.trim())}
        />
        <button
          onClick={onJoin}
          className="rounded-xl px-4 py-3 bg-brand hover:bg-brand/90 active:scale-[0.98] transition shadow-glow"
        >
          Join
        </button>
      </div>
    </div>
  )
}
