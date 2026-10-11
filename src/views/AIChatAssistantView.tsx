import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Plus,
  Trash2,
  Bot,
  User,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  AlertTriangle,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';

export const AIChatAssistantView: React.FC = () => {
  const {
    chatSessions,
    activeChatSessionId,
    setActiveChatSessionId,
    sendMessageToAI,
    createNewChatSession,
    clearChatHistory,
    navigate,
  } = useLedger();

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = chatSessions.find((s) => s.id === activeChatSessionId) || chatSessions[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isTyping) return;

    setInputMessage('');
    setIsTyping(true);

    try {
      await sendMessageToAI(text);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  const starterPrompts = [
    'Báo cáo doanh thu và lợi nhuận tháng 8/2026 của công ty thế nào?',
    'Tại sao chi phí lương tháng này lại tăng 35%?',
    'Kiểm tra xem có khoản chi nào bị trùng lặp hoặc bất thường không?',
    'Cách hạch toán chi phí thuê văn phòng 45 triệu theo TT 133?',
    'Dự báo dòng tiền tháng 9 có bị thiếu hụt không?',
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-4 pb-4">
      {/* Left Chat Sidebar: History & Quick Prompts */}
      <div className="w-full md:w-80 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between shrink-0">
        <div>
          {/* New Chat Button */}
          <button
            onClick={() => createNewChatSession()}
            className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 mb-4"
          >
            <Plus className="w-4 h-4" />
            <span>Cuộc Hội Thoại Mới</span>
          </button>

          {/* Session History List */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-1.5">
              Lịch sử trao đổi
            </span>
            <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
              {chatSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setActiveChatSessionId(session.id)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-center justify-between ${
                    session.id === activeSession?.id
                      ? 'bg-slate-100 font-bold text-slate-900'
                      : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="truncate">{session.title}</div>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {session.updatedAt.slice(0, 10)}
                    </span>
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Suggested Starter Topics */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Gợi ý câu hỏi kế toán</span>
            </span>
            <div className="space-y-1.5">
              {starterPrompts.slice(0, 3).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 text-[11px] text-slate-600 transition-colors line-clamp-2 leading-relaxed"
                >
                  💬 {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Clear History */}
        <div className="pt-3 border-t border-slate-100">
          <button
            onClick={() => {
              if (confirm('Bạn có chắc muốn xóa sạch lịch sử trò chuyện này?')) {
                clearChatHistory();
              }
            }}
            className="w-full py-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa lịch sử hội thoại</span>
          </button>
        </div>
      </div>

      {/* Main Chat Conversation Container */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  Trợ Lý Kế Toán AI Smart Ledger
                </h3>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Trực tuyến
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Tích hợp dữ liệu sổ cái thực tế, Chuẩn mực TT 133/TT 200 & Luật Thuế Doanh nghiệp Việt Nam
              </p>
            </div>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {activeSession?.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'USER' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.sender === 'USER'
                    ? 'bg-slate-900 text-white'
                    : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-xs'
                }`}
              >
                {msg.sender === 'USER' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Content Bubble */}
              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.sender === 'USER'
                    ? 'bg-emerald-600 text-white shadow-xs rounded-tr-none'
                    : 'bg-slate-100/90 text-slate-800 border border-slate-200/60 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Quick Action Shortcuts inside AI message if relevant */}
                {msg.sender === 'AI' && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center gap-2 flex-wrap text-[11px]">
                    <span className="text-slate-400 font-semibold">Tác vụ nhanh:</span>
                    <button
                      onClick={() => navigate('transactions')}
                      className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-semibold rounded-lg border border-slate-200 shadow-2xs transition-colors flex items-center gap-1"
                    >
                      <Receipt className="w-3 h-3 text-emerald-600" />
                      <span>Xem sổ giao dịch</span>
                    </button>
                    <button
                      onClick={() => navigate('reports')}
                      className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-semibold rounded-lg border border-slate-200 shadow-2xs transition-colors flex items-center gap-1"
                    >
                      <FileSpreadsheet className="w-3 h-3 text-indigo-600" />
                      <span>Xem Báo cáo P&L</span>
                    </button>
                  </div>
                )}

                <div
                  className={`text-[10px] mt-1.5 text-right ${
                    msg.sender === 'USER' ? 'text-emerald-100' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-100 rounded-2xl p-3.5 rounded-tl-none flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] font-medium text-slate-500 ml-2">AI đang phân tích sổ cái...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Đặt câu hỏi về sổ cái, phân tích chi phí, luật thuế, hạch toán định khoản..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
            >
              <span>Gửi</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
