'use client';

import { MessageCircle } from 'lucide-react';

interface AskAIButtonProps {
  productName: string;
}

export default function AskAIButton({ productName }: AskAIButtonProps) {
  const handleClick = () => {
    const event = new CustomEvent('open-chat', {
      detail: { message: `Tell me more about the ${productName}` },
    });
    window.dispatchEvent(event);
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
    >
      <MessageCircle className="h-5 w-5" />
      Ask AI About This Product
    </button>
  );
}
