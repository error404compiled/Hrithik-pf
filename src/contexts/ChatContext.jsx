import { createContext, useContext, useState } from "react";

const ChatContext = createContext({
  isVisible: true,
  toggleChatbot: () => {},
});

export const useChatbot = () => useContext(ChatContext);

export function ChatProvider({ children }) {
  const [isVisible, setIsVisible] = useState(true);

  const toggleChatbot = () => {
    setIsVisible(!isVisible);
  };

  return (
    <ChatContext.Provider value={{ isVisible, toggleChatbot }}>
      {children}
    </ChatContext.Provider>
  );
}
