import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Phone, Monitor, MonitorOff, VolumeX, Volume2 } from "lucide-react";
import { toast } from "sonner";

const ROOM_ID = "openchat-global";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

interface PeerState {
  pc: RTCPeerConnection;
  stream: MediaStream | null;
}

interface VideoChatProps {
  visible: boolean;
  username: string;
}

const VideoChat = ({ visible, username }: VideoChatProps) => {
  const [inCall, setInCall] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [peers, setPeers] = useState<Record<string, MediaStream | null>>({});
  const [mutedPeers, setMutedPeers] = useState<Set<string>>(new Set());

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const myIdRef = useRef(crypto.randomUUID().slice(0, 8));
  const peersRef = useRef<Record<string, PeerState>>({});

  const cleanup = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    Object.values(peersRef.current).forEach((p) => p.pc.close());
    peersRef.current = {};
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    setPeers({});
    setScreenSharing(false);
    setMutedPeers(new Set());
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const createPeer = (remoteId: string, stream: MediaStream): RTCPeerConnection => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.ontrack = (e) => {
      if (e.streams[0]) {
        peersRef.current[remoteId] = { ...peersRef.current[remoteId], stream: e.streams[0] };
        setPeers((prev) => ({ ...prev, [remoteId]: e.streams[0] }));
      }
    };

    pc.onicecandidate = (e) => {
      if (e.candidate && channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "signal",
          payload: { type: "ice-candidate", data: e.candidate.toJSON(), from: myIdRef.current, to: remoteId },
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
        pc.close();
        delete peersRef.current[remoteId];
        setPeers((prev) => {
          const n = { ...prev };
          delete n[remoteId];
          return n;
        });
      }
    };

    peersRef.current[remoteId] = { pc, stream: null };
    return pc;
  };

  const joinCall = async () => {
    setInCall(true);

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    const channel = supabase.channel(`video-${ROOM_ID}`);
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "signal" }, async ({ payload }: { payload: any }) => {
        if (payload.from === myIdRef.current) return;
        // Ignore messages not meant for us (if targeted)
        if (payload.to && payload.to !== myIdRef.current) return;

        const remoteId = payload.from;

        if (payload.type === "join") {
          // New peer joined — create a connection and send offer
          const pc = createPeer(remoteId, localStreamRef.current!);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          channel.send({
            type: "broadcast",
            event: "signal",
            payload: { type: "offer", data: offer, from: myIdRef.current, to: remoteId },
          });
        } else if (payload.type === "offer") {
          // Got an offer — create peer if needed and answer
          let peerState = peersRef.current[remoteId];
          if (!peerState) {
            createPeer(remoteId, localStreamRef.current!);
            peerState = peersRef.current[remoteId];
          }
          await peerState.pc.setRemoteDescription(new RTCSessionDescription(payload.data));
          const answer = await peerState.pc.createAnswer();
          await peerState.pc.setLocalDescription(answer);
          channel.send({
            type: "broadcast",
            event: "signal",
            payload: { type: "answer", data: answer, from: myIdRef.current, to: remoteId },
          });
        } else if (payload.type === "answer") {
          const peerState = peersRef.current[remoteId];
          if (peerState) {
            await peerState.pc.setRemoteDescription(new RTCSessionDescription(payload.data));
          }
        } else if (payload.type === "ice-candidate") {
          const peerState = peersRef.current[remoteId];
          if (peerState) {
            try { await peerState.pc.addIceCandidate(new RTCIceCandidate(payload.data)); } catch {}
          }
        } else if (payload.type === "leave") {
          const peerState = peersRef.current[remoteId];
          if (peerState) {
            peerState.pc.close();
            delete peersRef.current[remoteId];
            setPeers((prev) => {
              const n = { ...prev };
              delete n[remoteId];
              return n;
            });
          }
        }
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          channel.send({
            type: "broadcast",
            event: "signal",
            payload: { type: "join", from: myIdRef.current },
          });
        }
      });

    toast.success("Joined the call");
  };

  const endCall = () => {
    // Notify others
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "signal",
        payload: { type: "leave", from: myIdRef.current },
      });
    }
    cleanup();
    setInCall(false);
    setVideoEnabled(true);
    setAudioEnabled(true);
  };

  const toggleVideo = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setVideoEnabled(track.enabled);
    }
  };

  const toggleAudio = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setAudioEnabled(track.enabled);
    }
  };

  const toggleMutePeer = (peerId: string) => {
    setMutedPeers((prev) => {
      const next = new Set(prev);
      if (next.has(peerId)) next.delete(peerId);
      else next.add(peerId);
      return next;
    });
  };

  const toggleScreenShare = async () => {
    if (!localStreamRef.current) return;

    if (screenSharing) {
      try {
        const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const camTrack = camStream.getVideoTracks()[0];
        // Replace track on all peer connections
        Object.values(peersRef.current).forEach(({ pc }) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === "video");
          if (sender) sender.replaceTrack(camTrack);
        });
        const oldTrack = localStreamRef.current.getVideoTracks()[0];
        localStreamRef.current.removeTrack(oldTrack);
        oldTrack.stop();
        localStreamRef.current.addTrack(camTrack);
        if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
        setScreenSharing(false);
        setVideoEnabled(true);
      } catch {}
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        Object.values(peersRef.current).forEach(({ pc }) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === "video");
          if (sender) sender.replaceTrack(screenTrack);
        });
        const oldTrack = localStreamRef.current.getVideoTracks()[0];
        localStreamRef.current.removeTrack(oldTrack);
        oldTrack.stop();
        localStreamRef.current.addTrack(screenTrack);
        if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
        setScreenSharing(true);
        screenTrack.onended = () => toggleScreenShare();
      } catch {}
    }
  };

  const peerIds = Object.keys(peers);
  const peerCount = peerIds.length;

  // Grid layout based on peer count
  const getGridClass = () => {
    if (peerCount <= 1) return "grid-cols-1";
    if (peerCount <= 3) return "grid-cols-2";
    return "grid-cols-2 sm:grid-cols-3";
  };

  return (
    <div className={`flex h-full flex-col ${visible ? "" : "hidden"}`}>
      {!inCall ? (
        <div className="flex h-full flex-col items-center justify-center gap-8 p-6">
          <div className="text-center">
            <div className="mb-2 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 shadow-[0_0_30px_hsl(var(--primary)/0.2)]">
              <Video className="h-10 w-10 text-primary" />
            </div>
            <h2 className="mt-4 font-[var(--font-heading)] text-2xl font-bold uppercase tracking-[0.15em] text-foreground">
              FaceTime
            </h2>
            <p className="mt-1 text-sm tracking-wide text-muted-foreground">
              Jump into the global video call
            </p>
          </div>
          <Button onClick={joinCall} className="h-12 rounded-full bg-primary px-8 text-primary-foreground shadow-[0_0_18px_hsl(var(--primary)/0.32)] hover:bg-primary/90">
            <Phone className="mr-2 h-5 w-5" />
            Join Call
          </Button>
        </div>
      ) : (
        <>
          {/* Status bar */}
          <div className="flex items-center justify-center gap-2 px-4 py-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-foreground">
              <span className={`h-2.5 w-2.5 rounded-full ${peerCount > 0 ? "bg-[hsl(var(--glow-green))] shadow-[0_0_14px_hsl(var(--glow-green)/0.65)]" : "bg-primary shadow-[0_0_14px_hsl(var(--primary)/0.65)] animate-pulse"}`} />
              {peerCount > 0 ? `${peerCount} peer${peerCount > 1 ? "s" : ""} connected` : "Waiting for someone..."}
            </span>
          </div>

          {/* Video grid */}
          <div className={`relative flex-1 overflow-hidden rounded-xl bg-background/40 border border-primary/8`}>
            {peerCount === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-3 h-12 w-12 mx-auto rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
                  <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Waiting for someone to join...</p>
                </div>
              </div>
            ) : (
              <div className={`grid ${getGridClass()} h-full w-full gap-1 p-1`}>
                {peerIds.map((peerId) => (
                  <div key={peerId} className="relative overflow-hidden rounded-lg bg-background/60">
                    <video
                      autoPlay
                      playsInline
                      muted={mutedPeers.has(peerId)}
                      className="h-full w-full object-cover"
                      ref={(el) => {
                        if (el && peers[peerId]) el.srcObject = peers[peerId];
                      }}
                    />
                    <button
                      onClick={() => toggleMutePeer(peerId)}
                      className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/60 backdrop-blur-sm border border-primary/20 text-foreground transition-colors hover:bg-background/80"
                      title={mutedPeers.has(peerId) ? "Unmute" : "Mute"}
                    >
                      {mutedPeers.has(peerId) ? <VolumeX className="h-3.5 w-3.5 text-destructive" /> : <Volume2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Local video PiP */}
            <div className="absolute bottom-4 right-4 h-32 w-24 overflow-hidden rounded-xl border-2 border-primary/30 shadow-lg sm:h-44 sm:w-32 z-10">
              {videoEnabled ? (
                <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover mirror" />
              ) : (
                <>
                  <video ref={localVideoRef} autoPlay playsInline muted className="hidden" />
                  <div className="flex h-full w-full flex-col items-center justify-center bg-muted">
                    <VideoOff className="mb-1 h-5 w-5 text-muted-foreground" />
                    <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-muted-foreground">{username}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 py-4">
            <Button size="icon" variant={videoEnabled ? "secondary" : "destructive"} onClick={toggleVideo} className="h-12 w-12 rounded-full">
              {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
            <Button size="icon" variant={audioEnabled ? "secondary" : "destructive"} onClick={toggleAudio} className="h-12 w-12 rounded-full">
              {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
            <Button size="icon" variant={screenSharing ? "default" : "secondary"} onClick={toggleScreenShare} className="h-12 w-12 rounded-full">
              {screenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
            </Button>
            <Button size="icon" variant="destructive" onClick={endCall} className="h-14 w-14 rounded-full shadow-[0_0_20px_hsl(var(--destructive)/0.4)]">
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default VideoChat;
