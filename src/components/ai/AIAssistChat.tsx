import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, ArrowUp, X, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIAssistChatProps {
  isOpen: boolean;
  onClose: () => void;
}

// Parse file references from AI response (format: [[filename]])
function parseFileReferences(content: string): { text: string; fileName?: string }[] {
  const regex = /\[\[([^\]]+)\]\]/g;
  const parts: { text: string; fileName?: string }[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: content.slice(lastIndex, match.index) });
    }
    parts.push({ text: match[1], fileName: match[1] });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push({ text: content.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ text: content }];
}

export function AIAssistChat({ isOpen, onClose }: AIAssistChatProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Click outside handler
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Delay adding listener to prevent immediate close
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleFileClick = useCallback(async (fileName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: files } = await supabase
        .from("files")
        .select("id, folder_id")
        .eq("user_id", user.id)
        .ilike("name", `%${fileName}%`)
        .is("deleted_at", null)
        .limit(1);

      if (files && files.length > 0) {
        const file = files[0];
        if (file.folder_id) {
          navigate(`/app/files?folder=${file.folder_id}&preview=${file.id}`);
        } else {
          navigate(`/app/files?preview=${file.id}`);
        }
        onClose();
      } else {
        toast.error("File not found");
      }
    } catch (err) {
      console.error("Error finding file:", err);
      toast.error("Failed to open file");
    }
  }, [navigate, onClose]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          message: userMessage,
          conversationHistory: messages.slice(-10),
        },
      });

      if (error) throw error;

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
    } catch (err: any) {
      console.error("AI chat error:", err);
      toast.error(err.message || t("ai.error", "Failed to get AI response"));
      setMessages((prev) => prev.slice(0, -1));
      setInput(userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>

          {/* Chat Window */}
          <motion.div
            ref={chatRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 w-[420px] max-w-[calc(100vw-3rem)] bg-background border border-border/50 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg border border-input bg-background flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-foreground" />
                </div>
                <span className="font-medium text-sm">AI Assistant</span>
              </div>
              <button
                onClick={onClose}
                className="h-7 w-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 h-[360px]" ref={scrollRef}>
              <div className="p-5">
                {messages.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-6"
                  >
                    <div className="text-center mb-6">
                      <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                        <Sparkles className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground max-w-[220px] mx-auto leading-relaxed">
                        {t("ai.welcome", "Ask me anything about your files")}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      {[
                        { icon: "📄", text: "Show my recent files" },
                        { icon: "🔍", text: "Find all PDFs" },
                        { icon: "⭐", text: "What files are starred?" },
                        { icon: "📊", text: "Summarize my storage" },
                      ].map((prompt, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => {
                            setInput(prompt.text);
                            inputRef.current?.focus();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm hover:bg-muted/80 transition-colors group"
                        >
                          <span className="text-base">{prompt.icon}</span>
                          <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                            {prompt.text}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-5">
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "flex",
                          message.role === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[85%] text-sm leading-relaxed",
                            message.role === "user"
                              ? "bg-foreground text-background rounded-2xl rounded-br-md px-4 py-2.5"
                              : "text-foreground"
                          )}
                        >
                          {message.role === "assistant" ? (
                            <p className="whitespace-pre-wrap">
                              {parseFileReferences(message.content).map((part, i) =>
                                part.fileName ? (
                                  <button
                                    key={i}
                                    onClick={() => handleFileClick(part.fileName!)}
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-muted hover:bg-muted/80 rounded-md text-primary transition-colors mx-0.5"
                                  >
                                    <FileText className="h-3 w-3" />
                                    <span>{part.text}</span>
                                  </button>
                                ) : (
                                  <span key={i}>{part.text}</span>
                                )
                              )}
                            </p>
                          ) : (
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="flex items-center gap-1.5 py-2">
                          <motion.span
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                            className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                          />
                          <motion.span
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                            className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                          />
                          <motion.span
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                            className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border/50">
              <div className="relative bg-muted/50 rounded-xl">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("ai.placeholder", "Ask about your files...")}
                  disabled={isLoading}
                  rows={1}
                  className="w-full resize-none bg-transparent px-4 py-3 pr-12 text-sm placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "absolute right-2 bottom-2 h-8 w-8 rounded-lg flex items-center justify-center transition-all",
                    input.trim() && !isLoading
                      ? "bg-foreground text-background hover:opacity-90"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground/60 text-center mt-2.5">
                AI can make mistakes. Verify important information.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
