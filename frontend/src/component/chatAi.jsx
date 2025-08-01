import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '../utills/axiosClient'; // Or your axiosClient

// BotMessage helper component (no changes needed)
const BotMessage = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');
  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const intervalId = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(intervalId);
      }
    }, 20);
    return () => clearInterval(intervalId);
  }, [text]);
  return <div className="whitespace-pre-wrap">{displayedText}</div>;
};

// Main Chat Component
const ChatComponent = ({ problem }) => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    const messageText = userInput.trim();
    if (!messageText) return;

    const newUserMessage = { role: 'user', parts: [{ text: messageText }] };
    const updatedMessages = [...messages, newUserMessage];

    setMessages(updatedMessages);
    setUserInput('');
    setIsTyping(true);

    try {
      const response = await axiosClient.post("/ai/chat", {
        messages: updatedMessages,
        title: problem.title,
        description: problem.description,
        testCases: problem.visibleTestCases,
        startCode: problem.startCode
      });

      setMessages(prev => [...prev, {
        role: 'model',
        parts: [{ text: response.data.message }]
      }]);

    } catch (error) {
      console.error("API Error:", error);
      setMessages(prev => [...prev, {
        role: 'model',
        parts: [{ text: "Error from AI Chatbot. Please try again." }]
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isTyping) {
      handleSendMessage();
    }
  };

  return (
    // ⭐ --- CSS CLASSES UPDATED HERE --- ⭐
    // Removed w-screen, added max-width for responsiveness, and margins for spacing.
    <div data-theme="night" className="max-w-full lg:max-w-4xl mx-auto my-8 font-sans">
      <div className="chat-container w-full h-[75vh] bg-base-300 rounded-2xl shadow-xl flex flex-col overflow-hidden border border-base-content/10">
        
        <div className="header p-5 bg-base-200/50 text-center border-b border-base-content/10">
          <h1 className="text-xl font-bold text-primary">🤖 AI Assistant for: {problem.title}</h1>
          <p className="text-sm text-base-content/70 mt-1">Ask anything about this problem</p>
        </div>

        <div className="chat-box flex-1 p-5 overflow-y-auto flex flex-col gap-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat ${msg.role === 'user' ? 'chat-end' : 'chat-start'}`}
            >
              <div className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-primary' : 'chat-bubble-secondary'}`}>
                {msg.role === 'model' ? (
                  <BotMessage text={msg.parts[0].text} />
                ) : (
                  msg.parts[0].text
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="chat chat-start">
              <div className="chat-bubble chat-bubble-secondary">
                <span className="loading loading-dots loading-md"></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="input-area p-4 flex items-center bg-base-200/50 border-t border-base-content/10">
          <input
            type="text"
            placeholder="Ask me anything..."
            autoComplete="off"
            className="input input-bordered w-full rounded-full"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
          />
          <button
            className="btn btn-primary rounded-full ml-3"
            onClick={handleSendMessage}
            disabled={isTyping || !userInput.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;