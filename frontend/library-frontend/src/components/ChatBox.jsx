import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, User, X, MessageCircle } from "lucide-react";
import { aiService } from "../services/aiService";

const INITIAL_MESSAGES = [
  {
    role: "assistant",
    content: "Xin chào! Bạn cần tìm sách, kiểm tra sách còn sẵn, hay muốn tôi gợi ý theo sở thích?",
  },
];

export default function ChatBox() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const data = await aiService.sendMessage(text);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data?.response || "Tôi chưa nhận được phản hồi. Bạn thử hỏi lại nhé.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Hiện chatbot chưa phản hồi được. Bạn thử lại sau nhé.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[80] flex flex-col items-end">
      {open && (
        <div className="mb-3 w-[calc(100vw-2rem)] max-w-[340px] h-[480px] max-h-[calc(100vh-6rem)] bg-white border border-black/10 shadow-2xl flex flex-col overflow-hidden rounded-2xl">
          {/* Header */}
          <div className="h-12 px-3 border-b border-gray-100 flex items-center justify-between bg-gray-950 text-white flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-gray-950 flex items-center justify-center flex-shrink-0">
                <Bot size={15} />
              </div>
              <p className="text-sm font-bold leading-tight truncate">Trợ lý SáchHay</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Đóng chat"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 bg-gray-50">
            <div className="space-y-2.5">
              {messages.map((message, index) => {
                const isUser = message.role === "user";
                return (
                  <div key={`${message.role}-${index}`} className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
                    {!isUser && (
                      <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot size={13} />
                      </div>
                    )}
                    <div
                      className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-line ${
                        isUser
                          ? "bg-gray-950 text-white rounded-br-md"
                          : "bg-white text-gray-800 border border-gray-100 rounded-bl-md"
                      }`}
                    >
                      {message.content}
                    </div>
                    {isUser && (
                      <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User size={13} />
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="flex gap-2 justify-start">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={13} />
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-3 py-2 flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 size={13} className="animate-spin" />
                    <span>Đang trả lời...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="p-2.5 border-t border-gray-100 bg-white flex-shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Hỏi về sách..."
                className="flex-1 max-h-20 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                disabled={loading}
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-xl bg-gray-950 text-white flex items-center justify-center hover:bg-amber-500 hover:text-gray-950 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex-shrink-0"
                aria-label="Gửi tin nhắn"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trigger button - nhỏ hơn */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="w-11 h-11 rounded-full bg-gray-950 text-white shadow-xl shadow-black/25 flex items-center justify-center hover:bg-amber-500 hover:text-gray-950 transition-all"
        aria-label={open ? "Ẩn chat" : "Mở chat"}
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
      </button>
    </div>
  );
}