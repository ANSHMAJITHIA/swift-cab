import React, { useState } from 'react';
import { Send, X, MessageSquare } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const PRESET_MESSAGES = [
  "I'm at the pickup spot.",
  "I'll be there in 2 minutes.",
  "Wearing a black jacket.",
  "Traffic is heavy here.",
  "Thank you!",
];

const ChatDrawer = ({ ride, onClose }) => {
  const { chatMessages, sendChatMessage } = useSocket();
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');

  const handleSend = (text) => {
    const msg = text || inputText;
    if (!msg.trim()) return;
    sendChatMessage(ride._id, msg.trim());
    setInputText('');
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-black text-white">
        <div className="flex items-center space-x-2.5">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="font-bold text-sm">Trip Chat</h3>
            <p className="text-[11px] text-gray-400">
              {user.role === 'rider' ? `Driver: ${ride.driver?.name || 'Driver'}` : `Rider: ${ride.rider?.name || 'Rider'}`}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {chatMessages.length === 0 ? (
          <div className="text-center py-10 text-xs text-gray-400">
            No messages yet. Send a message to coordinate pickup!
          </div>
        ) : (
          chatMessages.map((msg, idx) => {
            const isMe = msg.sender === (user._id || user.id);
            return (
              <div
                key={idx}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs ${
                    isMe
                      ? 'bg-black text-white rounded-br-none'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="font-medium">{msg.text}</p>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Preset Fast Replies */}
      <div className="p-2 border-t border-gray-100 bg-white flex space-x-1.5 overflow-x-auto scrollbar-none">
        {PRESET_MESSAGES.map((preset, i) => (
          <button
            key={i}
            onClick={() => handleSend(preset)}
            className="text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full whitespace-nowrap transition"
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-white border-t border-gray-200 flex items-center space-x-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 text-xs px-4 py-2.5 rounded-xl bg-gray-100 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-black placeholder-gray-400"
        />
        <button
          type="submit"
          className="w-9 h-9 rounded-xl bg-black hover:bg-neutral-800 text-white flex items-center justify-center transition flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default ChatDrawer;
