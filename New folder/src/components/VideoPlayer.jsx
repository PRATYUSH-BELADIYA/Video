// import React, { useEffect, useRef } from 'react'

// export default function VideoPlayer({ localStream, remoteStream }) {
//   const localRef = useRef(null)
//   const remoteRef = useRef(null)

//   useEffect(() => {
//     if (localRef.current && localStream) {
//       localRef.current.srcObject = localStream
//     }
//   }, [localStream])

//   useEffect(() => {
//     if (remoteRef.current && remoteStream) {
//       remoteRef.current.srcObject = remoteStream
//     }
//   }, [remoteStream])

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//       {/* Local video */}
//       <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40">
//         <video
//           ref={localRef}
//           className="w-full aspect-video"
//           autoPlay
//           muted
//           playsInline
//         ></video>
//         <div className="absolute left-2 bottom-2 text-xs px-2 py-1 rounded bg-black/60">
//           You
//         </div>
//       </div>

//       {/* Remote video */}
//       <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40">
//         <video
//           ref={remoteRef}
//           className="w-full aspect-video"
//           autoPlay
//           playsInline
//         ></video>
//         <div className="absolute left-2 bottom-2 text-xs px-2 py-1 rounded bg-black/60">
//           Peer
//         </div>
//       </div>
//     </div>
//   )
// }


import React, { useEffect, useRef } from 'react'

export default function VideoPlayer({ localStream, remoteStream, localName, remoteName }) {
  const localRef = useRef(null)
  const remoteRef = useRef(null)

  useEffect(() => {
    if (localRef.current && localStream) {
      localRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    if (remoteRef.current && remoteStream) {
      remoteRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* Local video */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40">
        <video
          ref={localRef}
          className="w-full aspect-video"
          autoPlay
          muted
          playsInline
        ></video>
        <div className="absolute left-2 bottom-2 text-xs px-2 py-1 rounded bg-black/60 text-white">
          {localName || 'You'}
        </div>
      </div>

      {/* Remote video */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40">
        <video
          ref={remoteRef}
          className="w-full aspect-video"
          autoPlay
          playsInline
        ></video>
        <div className="absolute left-2 bottom-2 text-xs px-2 py-1 rounded bg-black/60 text-white">
          {remoteName || 'Peer'}
        </div>
      </div>
    </div>
  )
}
