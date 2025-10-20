import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { supabase } from '../lib/supabase';
import type { ChatMessage as ChatMessageType, DmApiResponse, ActionResult } from '../types';
import ChatMessage from './ChatMessage';

interface ChatInterfaceProps {
  characterId: string;
  onStateChange: (changes: DmApiResponse['stateChanges']) => void;
  onNewJournalEntry: () => void;
}

export interface ChatInterfaceRef {
  sendMessage: (message: string) => Promise<void>;
}

type ExtendedChatMessage = ChatMessageType & { actionResults?: ActionResult[] };

const ChatInterface = forwardRef<ChatInterfaceRef, ChatInterfaceProps>(
  ({ characterId, onStateChange, onNewJournalEntry }, ref) => {
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!characterId) return;
      setIsLoading(true);
      const { data, error } = await supabase
        .from('dm_conversations')
        .select('role, content')
        .eq('character_id', characterId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('Error fetching chat history:', error);
      } else if (data) {
        setMessages(data as ChatMessageType[]);
      }
      setIsLoading(false);
    };
    fetchHistory();
  }, [characterId]);

  // Extracted message sending logic for reuse
  const sendMessageInternal = async (messageContent: string) => {
    if (!messageContent.trim() || isSending) return;

    const userMessage: ChatMessageType = { role: 'player', content: messageContent.trim() };

    // CRITICAL FIX: Capture conversation history BEFORE adding new message
    // This prevents race conditions with state updates
    const historySnapshot = messages.slice(-10);

    setMessages(prev => [...prev, userMessage]);
    setIsSending(true);

    // Refocus input after clearing
    inputRef.current?.focus();

    try {
      // Get current session for auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/chat/dm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          characterId,
          message: userMessage.content,
          conversationHistory: historySnapshot, // Use snapshot, not current state
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ChatInterface] API error:', response.status, errorText);
        throw new Error(`Failed to get response from The Chronicler (${response.status})`);
      }

      const data = (await response.json()) as DmApiResponse;

      // Store actionResults with the message for dice roll display
      const dmMessage: ExtendedChatMessage = {
        role: 'dm',
        content: data.response,
        actionResults: data.actionResults, // NEW: Include action results
      };

      setMessages(prev => [...prev, dmMessage]);

      if (data.stateChanges) onStateChange(data.stateChanges);
      if (data.journalEntry) onNewJournalEntry();

      // Log actionResults for debugging
      if (data.actionResults && data.actionResults.length > 0) {
        console.log('[ChatInterface] ActionResults received:', data.actionResults);
      }
    } catch (error) {
      console.error('[ChatInterface] Error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      const errorMessage: ChatMessageType = {
        role: 'dm',
        content: `The Chronicler's connection wavers... (${errorMsg})`,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  // Expose sendMessage method to parent via ref
  useImperativeHandle(ref, () => ({
    sendMessage: sendMessageInternal,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const message = input.trim();
    setInput('');
    await sendMessageInternal(message);
  };

  return (
    <div className="bg-nuaibria-surface border-2 border-nuaibria-gold/20 rounded-lg shadow-card-hover flex flex-col h-[70vh] max-h-[800px]">
      <div className="bg-gradient-to-r from-nuaibria-gold/20 via-nuaibria-ember/10 to-nuaibria-gold/20 px-6 py-4 border-b border-nuaibria-border">
        <h2 className="text-xl font-display font-bold text-nuaibria-gold">The Chronicler</h2>
      </div>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-nuaibria-text-muted">Loading conversation...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-nuaibria-text-secondary italic">
              The Chronicler awaits your first words...
            </p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))
        )}
        {isSending && messages.length > 0 && (
          <div className="self-start flex items-center space-x-2 p-3">
            <span className="text-nuaibria-arcane text-sm font-bold">The Chronicler is writing...</span>
            <div className="animate-pulse rounded-full bg-nuaibria-arcane/50 h-2 w-2"></div>
            <div className="animate-pulse delay-75 rounded-full bg-nuaibria-arcane/50 h-2 w-2"></div>
            <div className="animate-pulse delay-150 rounded-full bg-nuaibria-arcane/50 h-2 w-2"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-nuaibria-border">
        <div className="flex items-center bg-nuaibria-elevated rounded-lg border border-nuaibria-gold/30 focus-within:ring-2 focus-within:ring-nuaibria-gold">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="What do you do?"
            disabled={isSending}
            className="flex-1 bg-transparent text-nuaibria-text-primary placeholder-nuaibria-text-muted px-4 py-3 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className="font-bold text-nuaibria-gold bg-nuaibria-gold/20 hover:bg-nuaibria-gold/40 rounded-r-lg px-6 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
});

ChatInterface.displayName = 'ChatInterface';

export default ChatInterface;
