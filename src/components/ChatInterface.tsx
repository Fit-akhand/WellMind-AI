import React, { useEffect, useRef, useState } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { AlertCircle, HeartHandshake, RefreshCw, Send, Sparkles, Sun, X } from 'lucide-react';
import { Message } from '../types';
import { ChatReply, fetchChatHistory, sendChatMessage } from '../api/chat';
import { ApiError } from '../api/client';
import { SUPPORT_LIMITATION } from '../lib/supportCopy';

const STARTERS = [
  { label: 'I feel nervous', prompt: 'I’m feeling nervous and I’d like some help calming down.', emoji: '🌿' },
  { label: 'Quick breathing', prompt: 'Can you guide me through a quick breathing exercise?', emoji: '🌬️' },
  { label: 'Racing thoughts', prompt: 'How do I handle racing thoughts before going to sleep?', emoji: '🌙' },
  { label: 'Low motivation', prompt: 'I feel like I’m in a slump and have low motivation.', emoji: '🌱' },
];

const FOLLOW_UPS = [
  'Guide me through it step by step',
  'Give me another idea',
  'I’m feeling a bit better',
];

function dayLabel(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEEE, d MMMM');
}

const DISCLAIMER_START = 'I\u2019m an AI support tool';
const DISCLAIMER_START_ASCII = "I'm an AI support tool";

/** Splits the model's trailing disclaimer from the reply so it can be shown as a quiet footnote. */
function splitDisclaimer(text: string): { body: string; note?: string } {
  const blocks = text.split(/\n{2,}/);
  const last = blocks[blocks.length - 1] || '';
  if (blocks.length > 1 && (last.startsWith(DISCLAIMER_START) || last.startsWith(DISCLAIMER_START_ASCII))) {
    return { body: blocks.slice(0, -1).join('\n\n'), note: last };
  }
  return { body: text };
}

const LIST_LINE = /^\s*(?:[-*\u2022]|\d+[.)])\s+/;

const MessageBody: React.FC<{ text: string; inverted: boolean }> = ({ text, inverted }) => {
  const blocks = text.split(/\n{2,}/).filter((b) => b.trim());
  return (
    <div className="space-y-2.5">
      {blocks.map((block, i) => {
        const lines = block.split('\n').filter((l) => l.trim());
        if (lines.length > 0 && lines.every((l) => LIST_LINE.test(l))) {
          return (
            <ul key={i} className={`space-y-1.5 pl-1 ${inverted ? '' : 'text-ink-soft'}`}>
              {lines.map((l, j) => (
                <li key={j} className="flex gap-2">
                  <span className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${inverted ? 'bg-white/80' : 'bg-lavender'}`} aria-hidden />
                  <span>{l.replace(LIST_LINE, '')}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="whitespace-pre-wrap">
            {block}
          </p>
        );
      })}
    </div>
  );
};

const GREETING =
  'Hi, I’m glad you’re here. There’s no rush and no right way to start. Tell me what’s on your mind, or pick a starting point below.';

function noticeFor(reply: ChatReply): string | undefined {
  if (reply.is_safety_response) return 'Safety message. This is not a clinical assessment.';
  if (reply.generationAvailable === false) {
    return 'Retrieval only. Generative inference is not configured, so this is not a composed counseling answer.';
  }
  return undefined;
}

interface ChatInterfaceProps {
  /** Text to place in the message box; a new `n` re-applies it. */
  prefill?: { text: string; n: number };
  onClose?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ prefill, onClose }) => {
  const [input, setInput] = useState('');

  useEffect(() => {
    if (prefill?.text) setInput(prefill.text);
  }, [prefill]);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'greeting', text: GREETING, sender: 'bot', timestamp: new Date() },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
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
        // Keep anything the user already sent while history was loading.
        setMessages((prev) => (prev.length <= 1 ? restored : [...restored, ...prev.filter((m) => m.id !== 'greeting')]));
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
    // Scroll only the message list, never the whole page.
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
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

  const showStarters = messages.length <= 1 && !isTyping;
  const lastMessage = messages[messages.length - 1];
  const canFollowUp =
    !isTyping &&
    !lastFailedMessage &&
    messages.length > 1 &&
    lastMessage?.sender === 'bot' &&
    !lastMessage.notice;

  return (
    <div className="card !rounded-3xl flex flex-col h-full min-h-0 overflow-hidden">
      <header className="px-5 sm:px-6 py-4 border-b border-line bg-surface flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-lavender to-mist flex items-center justify-center text-white shadow-sm shrink-0">
            <Sun className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 className="font-display font-semibold text-lg text-ink truncate">WellMind Companion</h2>
            <p className="text-xs text-ink-mute flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sage" aria-hidden /> Here to listen, at your pace
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('wellmind:open-help'))}
          className="btn-ghost !py-1.5 !px-3 text-xs shrink-0"
        >
          <HeartHandshake className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Need urgent help?</span><span className="sm:hidden">Help</span>
        </button>
        {onClose && (
          <button type="button" onClick={onClose} className="icon-btn shrink-0" aria-label="Close chat">
            <X className="h-4 w-4" />
          </button>
        )}
      </header>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6 space-y-5 chat-surface" aria-live="polite">
        {historyError && (
          <p className="text-sm text-coral bg-coral-soft rounded-xl px-3 py-2" role="status">
            {historyError}
          </p>
        )}

        {messages.map((message, index) => {
          const isUser = message.sender === 'user';
          const { body, note } = isUser ? { body: message.text, note: undefined } : splitDisclaimer(message.text);
          const previous = messages[index - 1];
          const newDay = !previous || dayLabel(previous.timestamp) !== dayLabel(message.timestamp);
          return (
            <React.Fragment key={message.id}>
              {newDay && index > 0 && (
                <div className="flex items-center gap-3 text-[11px] text-ink-mute uppercase tracking-wider" role="separator">
                  <span className="flex-1 h-px bg-line" />
                  {dayLabel(message.timestamp)}
                  <span className="flex-1 h-px bg-line" />
                </div>
              )}
            <div className={`flex items-end gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-lavender-soft text-lavender-deep flex items-center justify-center shrink-0">
                  <Sun className="h-4 w-4" aria-hidden />
                </div>
              )}
              <div className={`max-w-[85%] sm:max-w-[34rem] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`px-4 py-3 text-[15px] leading-relaxed shadow-sm ${isUser ? 'bubble-user' : 'bubble-bot'}`}>
                  <MessageBody text={body} inverted={isUser} />
                </div>
                {message.notice && (
                  <p className="text-[11px] mt-1.5 px-1 text-ink-mute">{message.notice}</p>
                )}
                {note && <p className="text-[11px] mt-1.5 px-1 text-ink-mute italic">{note}</p>}
                <span className="text-[10px] mt-1 px-1 text-ink-mute">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            </React.Fragment>
          );
        })}

        {isTyping && (
          <div className="flex items-end gap-2.5" role="status" aria-label="The companion is writing a reply">
            <div className="w-8 h-8 rounded-full bg-lavender-soft text-lavender-deep flex items-center justify-center shrink-0">
              <Sun className="h-4 w-4" aria-hidden />
            </div>
            <div className="bubble-bot px-4 py-3.5 flex gap-1.5 shadow-sm">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        {canFollowUp && (
          <div className="flex flex-wrap gap-2 pl-10">
            {FOLLOW_UPS.map((text) => (
              <button
                key={text}
                type="button"
                onClick={() => void handleSend(text)}
                className="prompt-pill !bg-surface"
              >
                {text}
              </button>
            ))}
          </div>
        )}

        {showStarters && (
          <div className="pt-2">
            <p className="text-xs font-semibold text-ink-mute uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-lavender" aria-hidden /> Start with
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STARTERS.map((starter) => (
                <button
                  key={starter.label}
                  type="button"
                  onClick={() => void handleSend(starter.prompt)}
                  className="text-left rounded-2xl bg-surface border border-line hover:border-lavender hover:shadow-md transition-all duration-base px-4 py-3 flex items-center gap-3"
                >
                  <span className="text-xl" aria-hidden>{starter.emoji}</span>
                  <span className="text-sm font-medium text-ink">{starter.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {lastFailedMessage && (
        <div className="px-5 sm:px-6 py-2 bg-coral-soft border-t border-coral/30 flex items-center justify-between text-xs text-coral shrink-0">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" aria-hidden /> That message didn’t get a reply.
          </span>
          <button type="button" onClick={() => void handleSend(lastFailedMessage, true)} className="font-semibold underline flex items-center gap-1">
            <RefreshCw className="h-3 w-3" aria-hidden /> Try again
          </button>
        </div>
      )}

      <footer className="px-4 sm:px-6 py-4 border-t border-line bg-surface shrink-0">
        <form
          className="flex items-end gap-2 rounded-3xl border border-line bg-surface-2 pl-4 pr-2 py-2 focus-within:border-lavender focus-within:shadow-[0_0_0_3px_var(--color-lavender-soft)] transition"
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
            placeholder="Share what’s on your mind…"
            className="flex-1 bg-transparent !outline-none resize-none py-2 text-[15px] text-ink placeholder:text-ink-mute max-h-32"
            rows={1}
            maxLength={2000}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-lavender to-mist text-white flex items-center justify-center shrink-0 disabled:opacity-50 hover:shadow-md transition"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        <p className="text-[11px] text-ink-mute mt-2.5 text-center hidden sm:block">
          Enter to send, Shift+Enter for a new line. {SUPPORT_LIMITATION}
        </p>
        <p className="text-[11px] text-ink-mute mt-2 text-center sm:hidden">
          Support tool, not emergency care. Tap Help for crisis lines.
        </p>
      </footer>
    </div>
  );
};

export default ChatInterface;
