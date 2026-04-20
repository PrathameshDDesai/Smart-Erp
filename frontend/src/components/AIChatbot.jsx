import React, { useState, useEffect, useRef } from 'react';
import API from '../api/axios';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hello! I am your AI ERP Guide. I'm here to motivate you, answer questions about your courses, and recommend exciting extracurricular activities. How can I help you excel today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recog = SpeechRecognition ? new SpeechRecognition() : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.1; // Slightly enthusiastic
    window.speechSynthesis.speak(utterance);
  };

  const handleListen = () => {
    if (!recog) {
      alert("Your browser does not support Voice Recognition. Please use Chrome.");
      return;
    }
    if (isListening) {
      recog.stop();
      setIsListening(false);
      return;
    }

    recog.start();
    setIsListening(true);

    recog.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      // Auto send
      sendMessage(transcript);
    };

    recog.onerror = (e) => {
      console.error(e);
      setIsListening(false);
    };
  };

  const sendMessage = async (textToSubmit = input) => {
    if (!textToSubmit.trim()) return;
    const userMessage = { sender: 'user', text: textToSubmit };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await API.post('/ai/chat', { message: textToSubmit });
      const aiReply = res.data.reply;
      
      setMessages(prev => [...prev, { sender: 'ai', text: aiReply }]);
      speak(aiReply);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: "Oops, my circuits got tangled. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button 
        className="ai-fab" 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))',
          color: 'white',
          fontSize: '24px',
          border: 'none',
          boxShadow: '0 8px 32px rgba(0,210,255,0.3)',
          cursor: 'pointer',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '5.5rem',
          right: '2rem',
          width: '350px',
          height: '500px',
          background: 'rgba(20, 25, 45, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          zIndex: 9998,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease-out'
        }}>
          <div style={{
            padding: '1rem',
            background: 'rgba(255,255,255,0.05)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🤖</div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'white' }}>EduERP Guide</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Online | Ready to motivate</p>
            </div>
          </div>

          <div style={{
            flex: 1,
            padding: '1rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                background: m.sender === 'user' ? 'var(--accent-1)' : 'rgba(255,255,255,0.1)',
                padding: '0.8rem 1rem',
                borderRadius: m.sender === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                color: 'white',
                lineHeight: 1.4,
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                {m.text}
              </div>
            ))}
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                EduERP Guide is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{
            padding: '1rem',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-glass)',
            display: 'flex',
            gap: '0.5rem'
          }}>
            <button 
              onClick={handleListen}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: isListening ? '#f44336' : 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                transition: '0.3s'
              }}
              title="Click to speak"
            >
              🎤
            </button>
            <input 
              style={{
                flex: 1,
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: '20px',
                padding: '0 1rem',
                color: 'white',
                outline: 'none'
              }}
              placeholder={isListening ? "Listening..." : "Ask me anything..."}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            />
            <button 
              onClick={() => sendMessage(input)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--accent-1)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px'
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
