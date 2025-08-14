import React from 'react'

export default function Controls({
  micOn,
  camOn,
  recording,
  onToggleMic,
  onToggleCam,
  onShareScreen,
  onRecord,
  downloadUrl
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Mic toggle */}
      <button
        onClick={onToggleMic}
        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10"
      >
        {micOn ? 'Mute Mic' : 'Unmute Mic'}
      </button>

      {/* Camera toggle */}
      <button
        onClick={onToggleCam}
        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10"
      >
        {camOn ? 'Turn Camera Off' : 'Turn Camera On'}
      </button>

      {/* Screen share */}
      <button
        onClick={onShareScreen}
        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10"
      >
        Share Screen
      </button>

      {/* Recording */}
      <button
        onClick={onRecord}
        className={`px-4 py-2 rounded-xl border ${
          recording
            ? 'bg-red-600/80 border-red-500'
            : 'bg-white/10 hover:bg-white/15 border-white/10'
        }`}
      >
        {recording ? 'Stop Recording' : 'Start Recording'}
      </button>

      {/* Download link if recording is available */}
      {downloadUrl && (
        <a
          href={downloadUrl}
          download="recording.webm"
          className="ml-auto px-4 py-2 rounded-xl bg-brand hover:bg-brand/90 shadow-glow"
        >
          Download Recording
        </a>
      )}
    </div>
  )
}
