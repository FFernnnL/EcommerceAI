export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  functionCall?: {
    name: string;
    status: "calling" | "done";
  };
}

export type IntentType = "SALES" | "SUPPORT" | "GENERAL";

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}
