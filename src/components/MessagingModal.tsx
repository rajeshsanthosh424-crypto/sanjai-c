import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Shield, MessageSquare, CheckCheck } from 'lucide-react';
import { Message } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface MessagingModalProps {
  threadId: string;
  recipientId: string;
  recipientName: string;
  onClose: () => void;
}

export const MessagingModal: React.FC<MessagingModalProps> = ({
  threadId,
  recipientId,
  recipientName,
  onClose,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputContent, setInputContent] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await api.getMessages(threadId);
      setMessages(res.messages || []);
    } catch (err) {
      console.warn('Failed to load thread messages:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [threadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim()) return;

    const text = inputContent.trim();
    setInputContent('');
    setLoading(true);

    try {
      const res = await api.sendMessage(threadId, recipientId, text);
      setMessages(prev => [...prev, res.message]);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div
        id="messaging-modal"
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/10 flex flex-col h-[560px]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-sm">
              {recipientName.charAt(0)}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{recipientName}</h3>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Private In-App Secure Chat
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Safety Notice Banner */}
        <div className="bg-amber-50 px-4 py-2 border-b border-amber-100/80 text-[11px] text-amber-800 flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <span>Never share sensitive passwords, financial codes, or meet in unpopulated areas.</span>
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {messages.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40 text-indigo-500" />
              <p>Start a secure conversation with {recipientName}.</p>
              <p className="text-[11px] text-slate-400 mt-1">Coordinate safe public drop-off or hand-over.</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.senderId === user?.id;
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-slate-400 mb-1 px-1">{m.senderName}</span>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-xs ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                    }`}
                  >
                    {m.content}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
          <input
            id="chat-message-input"
            type="text"
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            placeholder="Type a safe message..."
            className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <button
            id="btn-send-chat-message"
            type="submit"
            disabled={!inputContent.trim() || loading}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2.5 transition-colors shadow-xs"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
