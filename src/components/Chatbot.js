"use client"

import { useState, useRef, useEffect } from "react"
import { Send, X, MessageCircle } from "lucide-react"
import "../chatbot.css"

const BASE_URL = "http://185.234.247.196:8082"

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

  // Fetch chat history when chat is opened
  useEffect(() => {
    if (isOpen) {
      fetchChatHistory();
    } else {
      // Reset pagination when chat is closed
      setPage(0);
      setHasMoreMessages(true);
    }
  }, [isOpen]);

  const fetchChatHistory = async (pageToFetch = 0) => {
    try {
      setLoadingHistory(true);
      
      // Get customerId from localStorage
      const customerId = localStorage.getItem('customerId') || 1;
      const size = 20; // Messages per page
      
      const response = await fetch(`${BASE_URL}/chat/history/${customerId}?page=${pageToFetch}&size=${size}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch chat history');
      }
      
      const result = await response.json();
      
      if (result.status === 200) {
        // Convert API response to message format
        const historyMessages = result.data.items.map(item => ({
          id: item.id,
          text: item.message,
          sender: item.role === 'user' ? 'user' : 'bot',
          timestamp: new Date(item.createdAt),
          // Assume no recommended foods in history for now
          recommendedFoods: []
        }));
        
        // Sort messages by timestamp in ascending order (older to newer)
        historyMessages.sort((a, b) => a.timestamp - b.timestamp);
        
        if (pageToFetch === 0) {
          // First page, replace messages
          setMessages(historyMessages);
        } else {
          // Additional pages, prepend to existing messages
          setMessages(prev => [...historyMessages, ...prev]);
        }
        
        // Check if there are more messages to load
        setHasMoreMessages(pageToFetch < result.data.totalPage - 1);
        setPage(pageToFetch);
        
        // If no history and first load, add welcome message
        if (historyMessages.length === 0 && pageToFetch === 0) {
          setMessages([{ 
            id: 'welcome',
            text: "Xin chào, tôi là chatbot tư vấn, bạn cần hỗ trợ gì nào?",
            sender: "bot" 
          }]);
        }
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
      
      // Add default welcome message if history fails to load
      if (page === 0) {
        setMessages([{ 
          id: 'welcome',
          text: "Xin chào, tôi là chatbot tư vấn, bạn cần hỗ trợ gì nào?",
          sender: "bot" 
        }]);
      }
    } finally {
      setLoadingHistory(false);
    }
  };

  // Load more history when user scrolls to the top
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop } = messagesContainerRef.current;
      
      // If user scrolled to the top and there are more messages to load
      if (scrollTop === 0 && !loadingHistory && hasMoreMessages) {
        fetchChatHistory(page + 1);
      }
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (inputValue.trim() === "") return

    // Add user message
    const newUserMessage = {
      id: `temp-${Date.now()}`,
      text: inputValue,
      sender: "user",
    }
    setMessages(prev => [...prev, newUserMessage])
    setInputValue("")
    setLoading(true)

    try {
      // Get customerId from localStorage
      const customerId = localStorage.getItem('customerId') || 1 // Default to 1 if not found
      
      // Call the chat API
      const response = await fetch(`${BASE_URL}/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerId: parseInt(customerId),
          message: newUserMessage.text
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response from chatbot API')
      }

      const data = await response.json()
      
      // Add bot response with recommended foods if available
      const botResponse = {
        id: `resp-${Date.now()}`,
        text: data.textResponse,
        sender: "bot",
        recommendedFoods: data.recommendedFoods || []
      }

      setMessages(prevMessages => [...prevMessages, botResponse])
    } catch (error) {
      console.error("Error communicating with chatbot API:", error)
      
      // Add error message
      const errorMessage = {
        id: `error-${Date.now()}`,
        text: "Xin lỗi, đã xảy ra lỗi khi xử lý tin nhắn của bạn. Vui lòng thử lại sau.",
        sender: "bot"
      }
      
      setMessages(prevMessages => [...prevMessages, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    // Only auto-scroll if we're not loading history
    if (!loadingHistory) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, loadingHistory])

  // Helper function to format text with line breaks
  const formatTextWithLineBreaks = (text) => {
    if (!text) return '';
    // Replace \n with <br /> and render it safely
    return text.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index !== text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  // Helper component for food recommendations
  const FoodRecommendation = ({ food }) => {
    return (
      <div className="food-recommendation-card">
        <div className="food-info">
          <h4>{food.name}</h4>
          <p className="food-price">{food.price.toLocaleString('vi-VN')}đ</p>
          <p className="food-description">{food.description}</p>
        </div>
        {food.imageUrl && <img src={food.imageUrl} alt={food.name} className="food-image" />}
      </div>
    )
  }

  return (
    <div className="chatbot-container">
      {!isOpen && (
        <button className="chatbot-toggle" onClick={toggleChat}>
          <MessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>ChatBot Nhà hàng</h3>
            <button className="close-button" onClick={toggleChat}>
              <X size={18} />
            </button>
          </div>

          <div 
            className="chatbot-messages" 
            ref={messagesContainerRef}
            onScroll={handleScroll}
          >
            {loadingHistory && page > 0 && (
              <div className="history-loading-indicator">
                <div className="loading-spinner"></div>
              </div>
            )}
            
            {messages.map((message) => (
              <div key={message.id}>
                <div className={`message ${message.sender === "user" ? "user-message" : "bot-message"}`}>
                  {formatTextWithLineBreaks(message.text)}
                </div>
                {message.recommendedFoods && message.recommendedFoods.length > 0 && (
                  <div className="food-recommendations">
                    {message.recommendedFoods.map((food) => (
                      <FoodRecommendation key={food.id} food={food} />
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="message bot-message typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input-form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Nhập câu hỏi của bạn..."
              className="chatbot-input"
              disabled={loading}
            />
            <button type="submit" className="send-button" disabled={loading || inputValue.trim() === ""}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default Chatbot