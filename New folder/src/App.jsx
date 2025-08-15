// import React, { useCallback, useEffect, useRef, useState } from 'react'
// import io from 'socket.io-client'
// import RoomJoin from './components/RoomJoin.jsx'
// import VideoPlayer from './components/VideoPlayer.jsx'
// import Controls from './components/Controls.jsx'
// import ChatBox from './components/ChatBox.jsx'
// import AuthPage from './components/AuthPage.jsx'

// // Connect to your Node server
// const socket = io('http://localhost:2000', { transports: ['websocket'] })

// export default function App() {
//   const [roomId, setRoomId] = useState('')
//   const [joined, setJoined] = useState(false)
//   const [token, setToken] = useState(localStorage.getItem('token'))

//   const [localStream, setLocalStream] = useState(null)
//   const [remoteStream, setRemoteStream] = useState(null)
//   const [otherUserId, setOtherUserId] = useState(null)

//   const [micOn, setMicOn] = useState(true)
//   const [camOn, setCamOn] = useState(true)
//   const [recording, setRecording] = useState(false)
//   const [downloadUrl, setDownloadUrl] = useState('')
//   const [messages, setMessages] = useState([])

//   const peerRef = useRef(null)
//   const mediaRecorderRef = useRef(null)
//   const recordedChunksRef = useRef([])

//   const iceServers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }

//   const createPeerConnection = useCallback(() => {
//     const pc = new RTCPeerConnection(iceServers)
//     pc.ontrack = (event) => setRemoteStream(event.streams[0])
//     pc.onicecandidate = (event) => {
//       if (event.candidate && otherUserId) {
//         socket.emit('ice-candidate', {
//           target: otherUserId,
//           candidate: event.candidate,
//         })
//       }
//     }
//     return pc
//   }, [otherUserId])

//   const joinRoom = async () => {
//     if (!roomId) return
//     const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
//     setLocalStream(stream)
//     setJoined(true)
//     socket.emit('join', roomId)
//   }

//   const callUser = useCallback(async (targetId) => {
//     let stream = localStream
//     if (!stream) {
//       stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
//       setLocalStream(stream)
//     }
//     const pc = createPeerConnection()
//     peerRef.current = pc
//     stream.getTracks().forEach((t) => pc.addTrack(t, stream))
//     const offer = await pc.createOffer()
//     await pc.setLocalDescription(offer)
//     socket.emit('offer', {
//       target: targetId,
//       caller: socket.id,
//       sdp: pc.localDescription,
//     })
//   }, [createPeerConnection, localStream])

//   useEffect(() => {
//     socket.on('other-user', (userId) => {
//       setOtherUserId(userId)
//       callUser(userId)
//     })
//     socket.on('user-joined', (userId) => setOtherUserId(userId))
//     socket.on('offer', async (incoming) => {
//       let stream = localStream
//       if (!stream) {
//         stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
//         setLocalStream(stream)
//       }
//       const pc = createPeerConnection()
//       peerRef.current = pc
//       stream.getTracks().forEach((t) => pc.addTrack(t, stream))
//       await pc.setRemoteDescription(new RTCSessionDescription(incoming.sdp))
//       const answer = await pc.createAnswer()
//       await pc.setLocalDescription(answer)
//       socket.emit('answer', { target: incoming.caller, sdp: pc.localDescription })
//     })
//     socket.on('answer', async (message) => {
//       const pc = peerRef.current
//       if (pc) await pc.setRemoteDescription(new RTCSessionDescription(message.sdp))
//     })
//     socket.on('ice-candidate', async (incoming) => {
//       try {
//         const pc = peerRef.current
//         if (pc) await pc.addIceCandidate(new RTCIceCandidate(incoming))
//       } catch (e) {
//         console.error('Error adding ice candidate', e)
//       }
//     })
//     socket.on('chat-message', ({ message, sender }) => {
//       setMessages((prev) => [...prev, { from: sender === socket.id ? 'me' : 'peer', text: message }])
//     })
//     return () => {
//       socket.off('other-user')
//       socket.off('user-joined')
//       socket.off('offer')
//       socket.off('answer')
//       socket.off('ice-candidate')
//       socket.off('chat-message')
//     }
//   }, [callUser, createPeerConnection, localStream])

//   const toggleAudio = () => {
//     localStream?.getAudioTracks().forEach((t) => (t.enabled = !t.enabled))
//     setMicOn((v) => !v)
//   }
//   const toggleVideo = () => {
//     localStream?.getVideoTracks().forEach((t) => (t.enabled = !t.enabled))
//     setCamOn((v) => !v)
//   }
//   const shareScreen = async () => {
//     try {
//       const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
//       const screenTrack = screenStream.getVideoTracks()[0]
//       const sender = peerRef.current?.getSenders().find((s) => s.track?.kind === 'video')
//       if (sender) sender.replaceTrack(screenTrack)
//       screenTrack.onended = () => {
//         const camTrack = localStream?.getVideoTracks()[0]
//         if (camTrack && sender) sender.replaceTrack(camTrack)
//       }
//     } catch (e) {
//       console.error('Screen sharing failed:', e)
//     }
//   }
//   const toggleRecording = () => {
//     if (!localStream) return
//     if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
//       recordedChunksRef.current = []
//       const mr = new MediaRecorder(localStream)
//       mediaRecorderRef.current = mr
//       mr.ondataavailable = (e) => recordedChunksRef.current.push(e.data)
//       mr.onstop = () => {
//         const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
//         setDownloadUrl(URL.createObjectURL(blob))
//       }
//       mr.start()
//       setRecording(true)
//     } else {
//       mediaRecorderRef.current.stop()
//       setRecording(false)
//     }
//   }
//   const sendMessage = (text) => {
//     if (!text || !roomId) return
//     socket.emit('chat-message', { room: roomId, message: text, sender: socket.id })
//     setMessages((prev) => [...prev, { from: 'me', text }])
//   }

//   const handleLogout = () => {
//     localStorage.removeItem('token')
//     setToken(null)
//   }

//   // Show login/register page if not authenticated
//   if (!token) {
//     return <AuthPage onAuth={setToken} />
//   }

//   return (
//     <div className="min-h-screen w-full bg-gradient-to-b from-[#0e1116] to-[#0a0c10]">
//       <header className="sticky top-0 z-10 border-b border-white/10 backdrop-blur bg-black/30">
//         <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
//           <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
//             <span className="text-brand">●</span> WebRTC Call
//           </h1>
//           <div className="flex items-center gap-4">
//             <div className="text-sm text-white/70">
//               {joined ? `Room: ${roomId}` : 'Not joined'}
//             </div>
//             <button
//               onClick={handleLogout}
//               className="text-sm bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-6xl mx-auto px-4 py-6 grid gap-6 lg:grid-cols-3">
//         <section className="lg:col-span-2 space-y-4">
//           {!joined ? (
//             <div className="rounded-2xl p-6 bg-white/5 border border-white/10 shadow-glow">
//               <RoomJoin roomId={roomId} setRoomId={setRoomId} onJoin={joinRoom} />
//             </div>
//           ) : (
//             <div className="rounded-2xl p-3 sm:p-4 bg-white/5 border border-white/10 shadow-glow">
//               <VideoPlayer localStream={localStream} remoteStream={remoteStream} />
//               <div className="mt-3">
//                 <Controls
//                   micOn={micOn}
//                   camOn={camOn}
//                   recording={recording}
//                   onToggleMic={toggleAudio}
//                   onToggleCam={toggleVideo}
//                   onShareScreen={shareScreen}
//                   onRecord={toggleRecording}
//                   downloadUrl={downloadUrl}
//                 />
//               </div>
//             </div>
//           )}
//         </section>

//         <aside className="rounded-2xl p-4 bg-white/5 border border-white/10 shadow-glow">
//           <ChatBox messages={messages} onSend={sendMessage} />
//         </aside>
//       </main>

//       <footer className="max-w-6xl mx-auto px-4 py-8 text-center text-white/40 text-sm">
//         Built with React • Tailwind • WebRTC • Socket.IO
//       </footer>
//     </div>
//   )
// }


import React, { useCallback, useEffect, useRef, useState } from 'react'
import io from 'socket.io-client'
import RoomJoin from './components/RoomJoin.jsx'
import VideoPlayer from './components/VideoPlayer.jsx'
import Controls from './components/Controls.jsx'
import ChatBox from './components/ChatBox.jsx'
import AuthPage from './components/AuthPage.jsx'

const socket = io('http://localhost:2000', { transports: ['websocket'] })

export default function App() {
  const [roomId, setRoomId] = useState('')
  const [name, setName] = useState('')
  const [joined, setJoined] = useState(false)
  const [token, setToken] = useState(localStorage.getItem('token'))

  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [otherUserId, setOtherUserId] = useState(null)
  const [otherUserName, setOtherUserName] = useState('')

  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [recording, setRecording] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState('')
  const [messages, setMessages] = useState([])

  const peerRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const recordedChunksRef = useRef([])

  const iceServers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(iceServers)
    pc.ontrack = (event) => setRemoteStream(event.streams[0])
    pc.onicecandidate = (event) => {
      if (event.candidate && otherUserId) {
        socket.emit('ice-candidate', {
          target: otherUserId,
          candidate: event.candidate,
        })
      }
    }
    return pc
  }, [otherUserId])

  const joinRoom = async () => {
    if (!roomId || !name) return
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    setLocalStream(stream)
    setJoined(true)
    socket.emit('join', { roomId, name })
  }

  const leaveRoom = () => {
    socket.emit('leave-room', roomId)
    setJoined(false)
    setLocalStream(null)
    setRemoteStream(null)
    peerRef.current?.close()
    peerRef.current = null
  }

  const callUser = useCallback(async (targetId) => {
    let stream = localStream
    if (!stream) {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setLocalStream(stream)
    }
    const pc = createPeerConnection()
    peerRef.current = pc
    stream.getTracks().forEach((t) => pc.addTrack(t, stream))
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    socket.emit('offer', {
      target: targetId,
      caller: socket.id,
      sdp: pc.localDescription,
    })
  }, [createPeerConnection, localStream])

  useEffect(() => {
    socket.on('other-user', ({ userId, name }) => {
      setOtherUserId(userId)
      setOtherUserName(name)
      callUser(userId)
    })
    socket.on('user-joined', ({ userId, name }) => {
      setOtherUserId(userId)
      setOtherUserName(name)
    })
    socket.on('offer', async (incoming) => {
      let stream = localStream
      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        setLocalStream(stream)
      }
      const pc = createPeerConnection()
      peerRef.current = pc
      stream.getTracks().forEach((t) => pc.addTrack(t, stream))
      await pc.setRemoteDescription(new RTCSessionDescription(incoming.sdp))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      socket.emit('answer', { target: incoming.caller, sdp: pc.localDescription })
    })
    socket.on('answer', async (message) => {
      const pc = peerRef.current
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(message.sdp))
    })
    socket.on('ice-candidate', async (incoming) => {
      try {
        const pc = peerRef.current
        if (pc) await pc.addIceCandidate(new RTCIceCandidate(incoming))
      } catch (e) {
        console.error('Error adding ice candidate', e)
      }
    })
    socket.on('chat-message', ({ message, senderName }) => {
      setMessages((prev) => [...prev, { from: senderName, text: message }])
    })
    socket.on('user-left', () => {
      setRemoteStream(null)
      setOtherUserName('')
    })

    return () => {
      socket.off('other-user')
      socket.off('user-joined')
      socket.off('offer')
      socket.off('answer')
      socket.off('ice-candidate')
      socket.off('chat-message')
      socket.off('user-left')
    }
  }, [callUser, createPeerConnection, localStream])

  const sendMessage = (text) => {
    if (!text || !roomId) return
    socket.emit('chat-message', { room: roomId, message: text, senderName: name })
    setMessages((prev) => [...prev, { from: name, text }])
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
  }

  if (!token) {
    return <AuthPage onAuth={setToken} />
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0e1116] to-[#0a0c10]">
      <header className="sticky top-0 z-10 border-b border-white/10 backdrop-blur bg-black/30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
            <span className="text-brand">●</span> WebRTC Call
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-white/70">
              {joined ? `Room: ${roomId}` : 'Not joined'}
            </div>
            {joined && (
              <button
                onClick={leaveRoom}
                className="text-sm bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded-lg"
              >
                Leave Room
              </button>
            )}
            <button
              onClick={handleLogout}
              className="text-sm bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-4">
          {!joined ? (
            <div className="rounded-2xl p-6 bg-white/5 border border-white/10 shadow-glow">
              <RoomJoin roomId={roomId} setRoomId={setRoomId} name={name} setName={setName} onJoin={joinRoom} />
            </div>
          ) : (
            <div className="rounded-2xl p-3 sm:p-4 bg-white/5 border border-white/10 shadow-glow">
              <VideoPlayer localStream={localStream} remoteStream={remoteStream} localName={name} remoteName={otherUserName} />
              <div className="mt-3">
                <Controls
                  micOn={micOn}
                  camOn={camOn}
                  recording={recording}
                  onToggleMic={() => {
                    localStream?.getAudioTracks().forEach((t) => (t.enabled = !t.enabled))
                    setMicOn((v) => !v)
                  }}
                  onToggleCam={() => {
                    localStream?.getVideoTracks().forEach((t) => (t.enabled = !t.enabled))
                    setCamOn((v) => !v)
                  }}
                  onShareScreen={async () => {
                    try {
                      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
                      const screenTrack = screenStream.getVideoTracks()[0]
                      const sender = peerRef.current?.getSenders().find((s) => s.track?.kind === 'video')
                      if (sender) sender.replaceTrack(screenTrack)
                      screenTrack.onended = () => {
                        const camTrack = localStream?.getVideoTracks()[0]
                        if (camTrack && sender) sender.replaceTrack(camTrack)
                      }
                    } catch (e) {
                      console.error('Screen sharing failed:', e)
                    }
                  }}
                  onRecord={() => {
                    if (!localStream) return
                    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
                      recordedChunksRef.current = []
                      const mr = new MediaRecorder(localStream)
                      mediaRecorderRef.current = mr
                      mr.ondataavailable = (e) => recordedChunksRef.current.push(e.data)
                      mr.onstop = () => {
                        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
                        setDownloadUrl(URL.createObjectURL(blob))
                      }
                      mr.start()
                      setRecording(true)
                    } else {
                      mediaRecorderRef.current.stop()
                      setRecording(false)
                    }
                  }}
                  downloadUrl={downloadUrl}
                />
              </div>
            </div>
          )}
        </section>

        <aside className="rounded-2xl p-4 bg-white/5 border border-white/10 shadow-glow">
          <ChatBox messages={messages} onSend={sendMessage} />
        </aside>
      </main>

      <footer className="max-w-6xl mx-auto px-4 py-8 text-center text-white/40 text-sm">
        Built with React • Tailwind • WebRTC • Socket.IO
      </footer>
    </div>
  )
}

