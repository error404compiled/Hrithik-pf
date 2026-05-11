import { useChat } from "ai/react";
import { apiUrl } from "@/lib/apiBase";
import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";

/**
 * Chat panel wired to the same contract as the former Next.js `/api/chat` route.
 */
const chatApiUrl =
  (import.meta.env.VITE_APPWRITE_CHAT_URL || "").trim() ||
  apiUrl("/api/chat");

export default function ChatPanel({ isExpanded }) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    isLoading,
    error,
  } = useChat({
    api: chatApiUrl,
    streamProtocol: "text",
  });

  if (!isExpanded) {
    return null;
  }

  return (
    <>
      <ChatMessages
        messages={messages}
        error={error}
        isLoading={isLoading}
        onPromptClick={(prompt) =>
          handleInputChange({
            target: { value: prompt },
          })
        }
      />
      <ChatInput
        input={input}
        handleSubmit={handleSubmit}
        handleInputChange={handleInputChange}
        setMessages={setMessages}
        onClearChat={() => {}}
        isLoading={isLoading}
        messages={messages}
      />
    </>
  );
}
