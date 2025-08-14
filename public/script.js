const socket = io();
const peers = {};
const localVideo = document.createElement("video");
localVideo.muted = true;
let localStream;

async function joinRoom() {
  const roomId = document.getElementById("room-input").value;
  const userId = uuidv4();
  document.getElementById("room-input").style.display = "none";
  document.querySelector("button").style.display = "none";

  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  addVideoStream(userId, localStream);

  socket.emit("join-room", roomId, userId);

  socket.on("user-connected", (userIdRemote) => {
    const peerConnection = createPeerConnection(userIdRemote);
    peers[userIdRemote] = peerConnection;

    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    peerConnection.createOffer().then((offer) => {
      peerConnection.setLocalDescription(offer);
      socket.emit("offer", { to: userIdRemote, from: userId, offer });
    });
  });

  socket.on("offer", async ({ from, offer }) => {
    const peerConnection = createPeerConnection(from);
    peers[from] = peerConnection;

    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit("answer", { to: from, from: userId, answer });
  });

  socket.on("answer", ({ from, answer }) => {
    const peerConnection = peers[from];
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  });

  socket.on("ice-candidate", ({ from, candidate }) => {
    const peerConnection = peers[from];
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  });

  socket.on("user-disconnected", (id) => {
    if (peers[id]) {
      peers[id].close();
      delete peers[id];
      const video = document.getElementById(id);
      if (video) video.remove();
    }
  });

  function createPeerConnection(remoteId) {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    peer.ontrack = (event) => {
      const remoteStream = new MediaStream(event.streams[0]);
      addVideoStream(remoteId, remoteStream);
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { to: remoteId, from: userId, candidate: event.candidate });
      }
    };

    return peer;
  }

  function addVideoStream(id, stream) {
    let video = document.getElementById(id);
    if (!video) {
      video = document.createElement("video");
      video.id = id;
      video.autoplay = true;
      document.getElementById("videos").appendChild(video);
    }
    video.srcObject = stream;
  }
}
