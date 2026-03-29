'use client';

interface QuickRepliesProps {
  onSelect: (message: string) => void;
}

const quickReplies = [
  { label: '📦 Track my order', message: 'I want to track my order. My order ID is ORD-2024-1001.' },
  { label: '💻 Product recommendations', message: 'Can you recommend a laptop for programming?' },
  { label: '🔧 Warranty check', message: 'I want to check my warranty status. Serial number: SN-LPX1-2024-001.' },
  { label: '↩️ Return an item', message: 'I need to return an item from order ORD-2024-1002.' },
];

export default function QuickReplies({ onSelect }: QuickRepliesProps) {
  return (
    <div className="px-4 pb-2">
      <p className="text-xs text-gray-400 mb-2">Quick actions:</p>
      <div className="flex flex-wrap gap-2">
        {quickReplies.map((reply) => (
          <button
            key={reply.label}
            onClick={() => onSelect(reply.message)}
            className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
          >
            {reply.label}
          </button>
        ))}
      </div>
    </div>
  );
}
