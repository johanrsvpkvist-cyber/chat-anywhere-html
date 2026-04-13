import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Phone, Monitor, MonitorOff } from "lucide-react";
import { toast } from "sonner";

const ROOM_ID = "openchat-global";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const VideoChat = () => {
  const [inCall, setInCall] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const myIdRef = useRef(crypto.randomUUID().slice(0, 8));

  const cleanup = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setRemoteConnected(false);
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const setupPeerConnection = (stream: MediaStream) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.ontrack = (e) => {
      if (remoteVideoRef.current && e.streams[0]) {
        remoteVideoRef.current.srcObject = e.streams[0];
        setRemoteConnected(true);
      }
    };

    pc.onicecandidate = (e) => {
      if (e.candidate && channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "signal",
          payload: {
            type: "ice-candidate",
            data: e.candidate.toJSON(),
            from: myIdRef.current,
          },
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
        toast.error("Peer disconnected");
        endCall();
      }
    };

    return pc;
  };

  const joinCall = async () => {
    setInCall(true);

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    const pc = setupPeerConnection(stream);

    const channel = supabase.channel(`video-${ROOM_ID}`);
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "signal" }, async ({ payload }: { payload: any }) => {
        if (payload.from === myIdRef.current) return;

        if (payload.type === "offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.data));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          channel.send({
            type: "broadcast",
            event: "signal",
            payload: { type: "answer", data: answer, from: myIdRef.current },
          });
        } else if (payload.type === "answer") {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.data));
        } else if (payload.type === "ice-candidate") {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(payload.data));
          } catch {}
        } else if (payload.type === "join") {
          // Someone new joined — send them an offer
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          channel.send({
            type: "broadcast",
            event: "signal",
            payload: { type: "offer", data: offer, from: myIdRef.current },
          });
        }
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          // Announce we joined so existing peers send offers
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
    cleanup();
    setInCall(false);
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

  const toggleScreenShare = async () => {
    if (!pcRef.current || !localStreamRef.current) return;

    if (screenSharing) {
      // Switch back to camera
      try {
        const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const camTrack = camStream.getVideoTracks()[0];
        const sender = pcRef.current.getSenders().find((s) => s.track?.kind === "video");
        if (sender) await sender.replaceTrack(camTrack);
        // Replace local preview
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
        const sender = pcRef.current.getSenders().find((s) => s.track?.kind === "video");
        if (sender) await sender.replaceTrack(screenTrack);
        const oldTrack = localStreamRef.current.getVideoTracks()[0];
        localStreamRef.current.removeTrack(oldTrack);
        oldTrack.stop();
        localStreamRef.current.addTrack(screenTrack);
        if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
        setScreenSharing(true);
        // When user stops sharing via browser UI
        screenTrack.onended = () => toggleScreenShare();
      } catch {}
    }
  };

  if (!inCall) {
    return (
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

        <Button
          onClick={joinCall}
          className="h-12 rounded-full bg-primary px-8 text-primary-foreground shadow-[0_0_18px_hsl(var(--primary)/0.32)] hover:bg-primary/90"
        >
          <Phone className="mr-2 h-5 w-5" />
          Join Call
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Status bar */}
      <div className="flex items-center justify-center gap-2 px-4 py-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-foreground">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              remoteConnected
                ? "bg-[hsl(var(--glow-green))] shadow-[0_0_14px_hsl(var(--glow-green)/0.65)]"
                : "bg-primary shadow-[0_0_14px_hsl(var(--primary)/0.65)] animate-pulse"
            }`}
          />
          {remoteConnected ? "Connected" : "Waiting for someone..."}
        </span>
      </div>

      {/* Video area */}
      <div className="relative flex-1 overflow-hidden rounded-xl bg-background/40 border border-primary/8">
        <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />
        {!remoteConnected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="mb-3 h-12 w-12 mx-auto rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
              <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                Waiting for someone to join...
              </p>
            </div>
          </div>
        )}

        {/* Local video (PiP) */}
        <div className="absolute bottom-4 right-4 h-32 w-24 overflow-hidden rounded-xl border-2 border-primary/30 shadow-lg sm:h-44 sm:w-32">
          <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover mirror" />
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
    </div>
  );
};

export default VideoChat;
