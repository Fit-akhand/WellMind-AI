import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Bot, RefreshCw, Send, Sparkles, User } from 'lucide-react';
import { Message } from '../types';
import { ChatReply, fetchChatHistory, sendChatMessage } from '../api/chat';
import { ApiError } from '../api/client';
import { CRISIS_GUIDANCE, SUPPORT_LIMITATION } from '../lib/supportCopy';

const SUGGESTED_PROMPTS = [
  'I’ve been feeling overwhelmed with work recently.',
  'Can you suggest a quick breathing exercise?',
  'How do I handle racing thoughts before going to sleep?',
  'I feel like I’m in a slump and have low motivation.',
];

const GREETING =
  'This is a supportive space. Share what is on your mind, and I will respond with what this server can actually provide.';

function noticeFor(reply: ChatReply): string | undefined {
  if (reply.is_safety_response) return 'Safety message. This is not a clinical assessment.';
  if (reply.generationAvailable === false) {
    return 'Retrieval only. Generative inference is not configured, so this is not a composed counseling answer.';
  }
  return undefined;
}

const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 'greeting', text: GREETING, sender: 'bot', timestamp: new Date() },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchChatHistory()
      .then((rows) => {
        if (cancelled || !Array.isArray(rows) || rows.length === 0) return;
        const restored: Message[] = [];
        rows.forEach((item, index) => {
          const timestamp = item.timestamp ? new Date(item.timestamp) : new Date();
          const id = item._id || `history-${index}`;
          restored.push({ id: `${id}-user`, text: item.message, sender: 'user', timestamp });
          restored.push({ id: `${id}-bot`, text: item.response, sender: 'bot', timestamp });
        });
        setMessages(restored);
      })
      .catch(() => {
        if (!cancelled) {
          setHistoryError('Earlier messages could not be loaded. You can still send a new message.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const deliver = async (text: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const timer = window.setTimeout(() => controller.abort(), 30000);
    try {
      const reply = await sendChatMessage(text, controller.signal);
      const botMessage: Message = {
        id: `${Date.now()}-bot`,
        text: reply.response || 'The server returned an empty response.',
        sender: 'bot',
        timestamp: new Date(),
        notice: noticeFor(reply),
      };
      setMessages((prev) => [...prev, botMessage]);
      setLastFailedMessage(null);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof DOMException && error.name === 'AbortError'
            ? 'The request was cancelled or took too long.'
            : 'The chatbot service could not be reached. Please try again.';
      setLastFailedMessage(text);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          text: message,
          sender: 'bot',
          timestamp: new Date(),
          notice: 'This message was not saved as a successful reply.',
        },
      ]);
    } finally {
      window.clearTimeout(timer);
      sendingRef.current = false;
      setIsTyping(false);
    }
  };

  const handleSend = async (textToSend?: string, retry = false) => {
    const text = (textToSend ?? input).trim();
    if (!text || sendingRef.current) return;
    sendingRef.current = true;
    setIsTyping(true);
    setLastFailedMessage(null);
    if (!retry) {
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-user`, text, sender: 'user', timestamp: new Date() },
      ]);
      setInput('');
    }
    await deliver(text);
  };

  return (
    <div className="card rounded-2xl flex flex-col h-[720px] max-h-[80vh] overflow-hidden">
      <header className="px-6 py-4 border-b border-line bg-surface flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lavender to-sage flex items-center justify-center text-white shadow-sm">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-lg text-ink">WellMind AI Companion</h2>
            <p className="text-xs text-ink-mute">Supportive conversation. Not a diagnosis or emergency service.</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-bg/50" aria-live="polite">
        {historyError && (
          <p className="text-sm text-coral bg-coral-soft rounded-lg px-3 py-2" role="status">
            {historyError}
          </p>
        )}
        {messages.map((message) => {
          const isUser = message.sender === 'user';
          return (
            <div key={message.id} className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isUser ? 'bg-lavender text-white' : 'bg-surface border border-line text-lavender-deep shadow-sm'
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div
                className={`max-w-[85%] sm:max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  isUser ? 'bg-lavender text-white rounded-tr-none' : 'bg-surface border border-line text-ink rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.text}</p>
                {message.notice && (
                  <p className={`text-[11px] mt-2 ${isUser ? 'text-white/80' : 'text-ink-mute'}`}>{message.notice}</p>
                )}
                <span className={`block text-[10px] mt-1.5 ${isUser ? 'text-white/70 text-right' : 'text-ink-mute'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <p className="text-xs text-ink-mute" role="status">
            Waiting for the support service…
          </p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 2 && !isTyping && (
        <div className="px-6 py-3 border-t border-line bg-surface/60 shrink-0">
          <p className="text-xs font-semibold text-ink-mute uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-lavender" /> Suggested prompts
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => void handleSend(prompt)}
                className="text-xs bg-surface border border-line hover:border-lavender text-ink-soft hover:text-ink px-3 py-1.5 rounded-full"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {lastFailedMessage && (
        <div className="px-6 py-2 bg-coral-soft border-t border-coral/30 flex items-center justify-between text-xs text-coral shrink-0">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" /> The last message did not get a reply.
          </span>
          <button type="button" onClick={() => void handleSend(lastFailedMessage, true)} className="font-semibold underline flex items-center gap-1">
            <RefreshCw className="h-3 w-3" /> Retry
          </button>
        </div>
      )}

      <footer className="p-4 border-t border-line bg-surface shrink-0">
        <form
          className="flex items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSend();
          }}
        >
          <label className="sr-only" htmlFor="chat-input">
            Message
          </label>
          <textarea
            id="chat-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void handleSend();
              }
            }}
            placeholder="Share what’s on your mind… (Shift+Enter for a new line)"
            className="input !rounded-xl resize-none min-h-[46px] max-h-32 text-sm flex-1"
            rows={1}
            maxLength={2000}
          />
          <button type="submit" disabled={!input.trim() || isTyping} className="btn-primary !p-3 !rounded-xl shrink-0" aria-label="Send message">
            <Send className="h-4 w-4" />
          </button>
        </form>
        <p className="text-[11px] text-ink-mute mt-2.5 leading-relaxed">{SUPPORT_LIMITATION} {CRISIS_GUIDANCE}</p>
      </footer>
    </div>
  );
};

export default ChatInterface;
