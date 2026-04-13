import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Phone, Copy } from "lucide-react";
import { toast } from "sonner";

interface SignalPayload {
  type: "offer" | "answer" | "ice-candidate";
  data: any;
  from: string;
  room: string;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const VideoChat = () => {
  const [roomId, setRoomId] = useState("");
  const [inputRoom, setInputRoom] = useState("");
  const [inCall, setInCall] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [remoteConnected, setRemoteConnected] = useState(false);

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
            room: roomId || inputRoom,
          } as SignalPayload,
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

  const createRoom = async () => {
    const id = Math.random().toString(36).slice(2, 8).toUpperCase();
    setRoomId(id);
    setInCall(true);

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    const pc = setupPeerConnection(stream);

    const channel = supabase.channel(`video-${id}`);
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "signal" }, async ({ payload }: { payload: SignalPayload }) => {
        if (payload.from === myIdRef.current) return;

        if (payload.type === "offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.data));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          channel.send({
            type: "broadcast",
            event: "signal",
            payload: { type: "answer", data: answer, from: myIdRef.current, room: id } as SignalPayload,
          });
        } else if (payload.type === "ice-candidate") {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(payload.data));
          } catch {}
        }
      })
      .subscribe();

    toast.success(`Room created: ${id}`);
  };

  const joinRoom = async () => {
    const id = inputRoom.trim().toUpperCase();
    if (!id) return;
    setRoomId(id);
    setInCall(true);

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    const pc = setupPeerConnection(stream);

    const channel = supabase.channel(`video-${id}`);
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "signal" }, async ({ payload }: { payload: SignalPayload }) => {
        if (payload.from === myIdRef.current) return;

        if (payload.type === "answer") {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.data));
        } else if (payload.type === "ice-candidate") {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(payload.data));
          } catch {}
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          channel.send({
            type: "broadcast",
            event: "signal",
            payload: { type: "offer", data: offer, from: myIdRef.current, room: id } as SignalPayload,
          });
        }
      });
  };

  const endCall = () => {
    cleanup();
    setInCall(false);
    setRoomId("");
    setInputRoom("");
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

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast.success("Room code copied!");
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
            Create a room or join one with a code
          </p>
        </div>

        <div className="flex w-full max-w-xs flex-col gap-3">
          <Button
            onClick={createRoom}
            className="h-12 rounded-full bg-primary text-primary-foreground shadow-[0_0_18px_hsl(var(--primary)/0.32)] hover:bg-primary/90"
          >
            <Phone className="mr-2 h-5 w-5" />
            Create Room
          </Button>

          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="flex gap-2">
            <Input
              value={inputRoom}
              onChange={(e) => setInputRoom(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && joinRoom()}
              placeholder="Enter room code"
              className="h-12 rounded-full border-primary/20 bg-secondary/80 text-center text-sm uppercase tracking-[0.15em]"
            />
            <Button
              onClick={joinRoom}
              disabled={!inputRoom.trim()}
              className="h-12 shrink-0 rounded-full bg-primary text-primary-foreground shadow-[0_0_18px_hsl(var(--primary)/0.32)] hover:bg-primary/90"
            >
              Join
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Room info bar */}
      <div className="flex items-center justify-center gap-2 px-4 py-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-foreground">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              remoteConnected
                ? "bg-[hsl(var(--glow-green))] shadow-[0_0_14px_hsl(var(--glow-green)/0.65)]"
                : "bg-primary shadow-[0_0_14px_hsl(var(--primary)/0.65)] animate-pulse"
            }`}
          />
          Room: {roomId}
        </span>
        <Button size="sm" variant="ghost" onClick={copyRoomId} className="h-8 rounded-full px-3">
          <Copy className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Video area */}
      <div className="relative flex-1 overflow-hidden rounded-xl bg-background/40 border border-primary/8">
        {/* Remote video (full) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="h-full w-full object-cover"
        />
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
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover mirror"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 py-4">
        <Button
          size="icon"
          variant={videoEnabled ? "secondary" : "destructive"}
          onClick={toggleVideo}
          className="h-12 w-12 rounded-full"
        >
          {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>
        <Button
          size="icon"
          variant={audioEnabled ? "secondary" : "destructive"}
          onClick={toggleAudio}
          className="h-12 w-12 rounded-full"
        >
          {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>
        <Button
          size="icon"
          variant="destructive"
          onClick={endCall}
          className="h-14 w-14 rounded-full shadow-[0_0_20px_hsl(var(--destructive)/0.4)]"
        >
          <PhoneOff className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default VideoChat;
