import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Image, Settings, Download } from "lucide-react";
import { generateChatHTML } from "@/lib/generateHTML";

interface Message {
  id: string;
  username: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
}

const ChatRoom = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState(() => localStorage.getItem("chat-username") || "Anonymous");
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(username);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch existing messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(200);
      if (data) setMessages(data);
    };
    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    await supabase.from("messages").insert({ username, content: newMessage });
    setNewMessage("");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("chat-images")
      .upload(fileName, file);

    if (!error) {
      const { data: urlData } = supabase.storage
        .from("chat-images")
        .getPublicUrl(fileName);
      await supabase
        .from("messages")
        .insert({ username, image_url: urlData.publicUrl });
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const saveName = () => {
    const name = tempName.trim() || "Anonymous";
    setUsername(name);
    localStorage.setItem("chat-username", name);
    setEditingName(false);
  };

  const handleDownload = () => {
    const html = generateChatHTML();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chat.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <h1 className="text-lg font-bold tracking-tight text-primary">
          💬 OpenChat
        </h1>
        <div className="flex items-center gap-2">
          {editingName ? (
            <div className="flex items-center gap-1">
              <Input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                className="h-8 w-32 text-sm bg-muted"
                autoFocus
              />
              <Button size="sm" variant="ghost" onClick={saveName}>
                OK
              </Button>
            </div>
          ) : (
            <button
              onClick={() => {
                setTempName(username);
                setEditingName(true);
              }}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              {username}
            </button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            className="h-8 gap-1 text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            HTML
          </Button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 chat-scrollbar">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No messages yet. Say something!
          </div>
        )}
        {messages.map((msg) => {
          const isSelf = msg.username === username;
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}
            >
              <span className="text-xs text-muted-foreground mb-1 px-1">
                {msg.username} · {formatTime(msg.created_at)}
              </span>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isSelf
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-secondary text-secondary-foreground rounded-bl-md"
                }`}
              >
                {msg.content && <p className="text-sm break-words">{msg.content}</p>}
                {msg.image_url && (
                  <img
                    src={msg.image_url}
                    alt="shared"
                    className="max-w-full rounded-lg mt-1"
                    loading="lazy"
                  />
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border bg-card">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="shrink-0"
          >
            <Image className="w-5 h-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="bg-muted"
          />
          <Button
            size="icon"
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
