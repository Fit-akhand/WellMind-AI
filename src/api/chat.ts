import { apiFetch } from './client';

export interface ChatReply {
  response: string;
  provider?: string;
  is_safety_response?: boolean;
  retrieved?: number;
  generationAvailable?: boolean;
}

export interface ChatHistoryItem {
  _id?: string;
  message: string;
  response: string;
  timestamp?: string;
}

export const sendChatMessage = async (message: string, signal?: AbortSignal) => {
  return apiFetch<ChatReply>('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
    signal,
  });
};

export const fetchChatHistory = async () => {
  return apiFetch<ChatHistoryItem[]>('/api/chat');
};
