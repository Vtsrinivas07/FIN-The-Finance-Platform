import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, HelpCircle } from 'lucide-react';
import api from '../../services/api';

const FAQ_CHIPS = [
  "How does KYC verification work?",
  "What is my CIBIL score?",
  "Fixed Deposit 7.25% interest rates?",
  "Pre-approved instant loan limit?",
  "How to pay via UPI phone number?",
  "How do I transfer money?",
  "How do I reset my password?",
  "Where can I find my statement?"
];

const SupportChatModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'BOT',
      text: "Hello! Welcome to FIN Support. How can we assist you with your banking needs today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText) => {
    const text = (queryText || input).trim();
    if (!text || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'USER',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/support/chat', {
        sessionId: sessionId,
        message: text
      });

      if (res.data?.success) {
        const botData = res.data.data;
        setMessages(prev => [
          ...prev,
          {
            id: botData.id || Date.now() + 1,
            sender: 'BOT',
            text: botData.message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'BOT',
          text: "I couldn't reach the support service right now. Please check our FAQ knowledge base or try again shortly.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-3 md:right-6 z-40 flex items-center space-x-2 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-xl shadow-brand-600/30 hover:scale-105 active:scale-95 transition-all duration-200 group"
          aria-label="Open support chat"
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-brand-600 animate-pulse" />
          </div>
          <span className="text-xs font-bold tracking-wide hidden sm:inline">24/7 Support</span>
        </button>
      )}

      {/* Floating Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 md:bottom-6 left-2 right-2 sm:left-auto sm:right-6 z-50 sm:w-96 h-[480px] max-h-[75vh] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-900 px-5 py-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-brand-500/30 border border-brand-400/40 flex items-center justify-center text-brand-300">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight leading-tight">FIN Support</h3>
                <p className="text-[11px] text-brand-300 flex items-center mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5 inline-block" />
                  24/7 Digital Banking Assistant
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition"
              aria-label="Close support chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/60">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-end space-x-2 ${m.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'BOT' && (
                  <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mb-1">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                    m.sender === 'USER'
                      ? 'bg-brand-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/70 rounded-bl-xs'
                  }`}
                >
                  <p>{m.text}</p>
                  <span className={`text-[9px] mt-1 block text-right ${m.sender === 'USER' ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {m.time}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-slate-400 text-xs pl-8">
                <span className="animate-spin rounded-full h-3 w-3 border-2 border-brand-600 border-t-transparent" />
                <span>FIN Assistant is replying...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ Chips */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 overflow-x-auto no-scrollbar flex items-center space-x-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 flex items-center">
              <HelpCircle className="w-3 h-3 mr-1" /> Quick:
            </span>
            {FAQ_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-600 border border-slate-200 transition font-medium flex-shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200/80 flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 text-xs px-3 py-2 rounded-xl bg-slate-100 border border-transparent focus:border-brand-500 focus:bg-white focus:outline-none transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white transition flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default SupportChatModal;
