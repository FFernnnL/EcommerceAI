'use client';

import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import ChatPanel from './ChatPanel';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState<string | undefined>();

  useEffect(() => {
    const handleOpenChat = (e: Event) => {
      const customEvent = e as CustomEvent<{ message?: string }>;
      if (customEvent.detail?.message) {
        setInitialMessage(customEvent.detail.message);
      }
      setIsOpen(true);
    };

    window.addEventListener('open-chat', handleOpenChat);
    return () => window.removeEventListener('open-chat', handleOpenChat);
  }, []);

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 animate-pulse-ring"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <ChatPanel
          onClose={() => {
            setIsOpen(false);
            setInitialMessage(undefined);
          }}
          initialMessage={initialMessage}
        />
      )}
    </>
  );
}
