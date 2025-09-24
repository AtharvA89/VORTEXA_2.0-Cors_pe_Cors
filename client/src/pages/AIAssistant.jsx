import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPaperPlane, faSpinner, faRobot, faLeaf,
  faSeedling, faWheatAwn, faCloudSunRain, faChartLine,
  faSun, faCloudRain, faDroplet, faIndianRupeeSign
} from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../context/AppContext';
import { fetchFieldData } from '../services/dataService';

// Add custom CSS for typing indicator and responsive design
import './AIAssistant.css';

// Groq API Configuration - Using environment variables for secure key storage
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = import.meta.env.VITE_GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";

// Log availability of API key (not the actual key) for debugging
console.log("Groq API key available:", !!GROQ_API_KEY);

const AIAssistant = () => {
  const { selectedField, fields } = useAppContext();
  const [fieldData, setFieldData] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'नमस्ते, किसान मित्र! 👋 I am Fasal AI, your smart farming companion. How can I assist your fields today?',
      timestamp: new Date().toISOString(),
      isIntroduction: true
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // AI prompt instruction for general farming assistance
  const aiPrompt = `You are Fasal AI, a comprehensive agricultural assistant for Indian farmers.
    Your expertise covers weather predictions, crop management, market trends, field analytics, and general farming advice.
    Provide practical, actionable advice that considers local agricultural conditions in India.
    Focus exclusively on agricultural topics. If asked about non-farming topics, politely redirect
    the conversation to agricultural subjects you can assist with.
    Keep responses concise, respectful, and tailored for farmers who may have varying levels of technical knowledge.
    Always prioritize sustainable farming practices and techniques that are accessible to small and medium-scale farmers.
    Current date: September 24, 2025.`;

  // Load field data when selected field changes
  useEffect(() => {
    const loadFieldData = async () => {
      if (selectedField) {
        try {
          const data = await fetchFieldData(selectedField);
          setFieldData(data);
        } catch (error) {
          console.error('Error loading field data for AI assistant:', error);
        }
      } else {
        setFieldData(null);
      }
    };
    
    loadFieldData();
  }, [selectedField]);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  
  // Function to call Groq API
  const callGroqAPI = async (userPrompt) => {
    try {
      // Create a field data summary for context
      let contextPrompt = aiPrompt;
      if (fieldData) {
        const fieldDataSummary = `
          Current Field Context:
          Selected Field: ${fieldData.name}
          Location: ${fieldData.location}
          Size: ${fieldData.size} acres
          Crop: ${fieldData.crop || fieldData.mainCrop || 'None'}
          Soil Type: ${fieldData.soilType || 'Unknown'}
          Coordinates: ${JSON.stringify(fieldData.coordinates)}
        `;
        contextPrompt += `\n\n${fieldDataSummary}`;
      }
      
      // Previous messages for context (limited to last 5 exchanges)
      const recentMessages = messages
        .filter(msg => !msg.isIntroduction)
        .slice(-10)
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));
        
      // Prepare the request payload
      const payload = {
        model: "llama-3.3-70b-versatile",  // Updated to currently available model (Sep 2025)
        messages: [
          { role: "system", content: contextPrompt },
          ...recentMessages,
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 800
      };
      
      // Call the Groq API
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        // Try to parse error response as JSON
        let errorMessage = 'Error calling Groq API';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorData.message || errorMessage;
        } catch (e) {
          // If not JSON, get text
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        console.error("API Error Response:", errorMessage);
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      // Validate response format
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Unexpected response format from Groq API');
      }
      
      return {
        text: data.choices[0].message.content,
        icon: faRobot
      };
    } catch (error) {
      console.error("Error calling Groq API:", error);
      
      // Provide more specific error message if possible
      let errorMsg = "I'm having trouble connecting to my knowledge base at the moment. Please try again later or ask another question.";
      
      // Handle specific known errors
      if (error.message.includes("decommissioned") || error.message.includes("deprecated")) {
        errorMsg += " (Error: The AI model being used is no longer available. Our team has been notified.)";
      } else if (error.message.includes("API key")) {
        errorMsg += " (Error: There seems to be an issue with API authentication. Our team has been notified.)";
      } else if (error.message.includes("rate limit")) {
        errorMsg += " (Error: We've reached our usage limit. Please try again in a few minutes.)";
      }
      
      return {
        text: errorMsg,
        icon: faRobot
      };
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    
    if (!message.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: message,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const messageCopy = message;
    setMessage('');
    setIsLoading(true);
    
    try {
      // Call Groq API
      const response = await callGroqAPI(messageCopy);
      
      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.text,
        timestamp: new Date().toISOString(),
        icon: response.icon
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Fallback error message
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'I apologize, but I encountered an issue processing your request. Please try again later.',
        timestamp: new Date().toISOString(),
        icon: faRobot
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };


  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-gradient-to-br from-white to-blue-50">
      {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-3 md:p-4 shadow-md sticky top-0 z-10">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center">
          <div className="bg-white p-1.5 md:p-2 rounded-full shadow-md mr-3 md:mr-4 flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=96&h=96&facepad=2"
              alt=""
              className="w-8 h-8 md:w-10 md:h-10 object-cover rounded-full"
              onError={(e) => {
            e.target.onerror = null; 
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM0QTkwRTIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjAgMjFWMTlDMjAgMTYuNzkwOSAxOC4yMDkxIDE1IDE2IDE1SDggQzUuNzkwODYgMTUgNCAxNi43OTA5IDQgMTlWMjEiPjwvcGF0aD48Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiPjwvY2lyY2xlPjwvc3ZnPg==';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-xl font-bold text-white flex items-center truncate">
              Fasal AI
            </h1>
            <p className="text-xs md:text-sm text-blue-50 truncate">Smart farming, personalized insights</p>
          </div>
            </div>
          </div>
        </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-3 md:p-6">
          {/* Messages */}
          <div className="space-y-4 md:space-y-6 max-w-3xl mx-auto px-1 chat-container">
            {messages.filter(msg => !msg.isIntroduction).map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-md md:max-w-xl rounded-xl md:rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-none py-2 px-3 md:py-3 md:px-4'
                      : 'bg-white shadow-sm md:shadow-md border-l-3 md:border-l-4 border-blue-400 text-gray-800 rounded-tl-none py-2 px-3 md:py-3 md:px-4'
                  }`}
                >
                  {msg.icon && msg.sender === 'bot' && (
                    <div className="flex items-center mb-1.5 md:mb-2 text-blue-600">
                      <FontAwesomeIcon icon={msg.icon} className="text-xs md:text-sm mr-2" />
                      <div className="h-px flex-grow bg-gray-200"></div>
                    </div>
                  )}
                  <div className="text-xs md:text-base break-words">{msg.text}</div>
                  <div
                    className={`text-[10px] md:text-xs mt-1.5 md:mt-2 text-right ${
                      msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isLoading && (
              <div className="flex justify-start px-1">
                <div className="bg-white shadow-sm md:shadow-md border-l-3 md:border-l-4 border-blue-400 rounded-xl md:rounded-2xl py-3 px-3 md:px-4 rounded-tl-none max-w-[85%] sm:max-w-md">
                  <div className="flex items-center">
                    <div className="w-5 h-5 md:w-7 md:h-7 bg-blue-100 rounded-full flex items-center justify-center mr-2 md:mr-3">
                      <FontAwesomeIcon icon={faSpinner} className="text-blue-600 text-xs md:text-sm animate-spin" />
                    </div>
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
      
      {/* Suggested questions section - commented out */}
      
      {/* Input area */}
      <div className="p-3 md:p-4 lg:p-5 pb-18 bg-white border-t border-gray-200 shadow-inner sticky bottom-0 z-10">
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
          <div className="flex items-center gap-1 md:gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about farming, crops, weather..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl text-sm py-2.5 md:py-3 px-3 md:px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              aria-label="Send message"
              className={`bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg md:rounded-xl p-2.5 md:p-3 min-w-[42px] min-h-[42px] flex items-center justify-center transition-all hover:shadow-lg disabled:opacity-50 disabled:hover:shadow-none`}
            >
              <FontAwesomeIcon icon={faPaperPlane} className="text-sm md:text-base" />
            </button>
          </div>
          {/* <div className="flex items-center justify-center mt-2 md:mt-3 gap-1">
            <FontAwesomeIcon icon={faLeaf} className="text-green-500 text-[10px] md:text-xs" />
            <span className="text-[10px] md:text-xs text-gray-500">Powered by SmartAgri | Farming Intelligence</span>
          </div> */}
        </form>
      </div>
    </div>
  );
};

export default AIAssistant;
