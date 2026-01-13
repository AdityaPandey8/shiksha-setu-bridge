/**
 * GlobalSetuSaarthi Component
 * 
 * A global floating chatbot button that appears across all student pages.
 * Opens Setu Saarthi in full-screen modal (mobile) or sliding panel (desktop).
 * 
 * Features:
 * - Persistent across navigation (mounted at layout level)
 * - Swipe-to-dismiss gesture (session-only, reappears on refresh)
 * - Quick actions via long-press menu
 * - Lazy loads chat UI only when opened
 * - Works in both offline and online modes
 * - Accessible with keyboard and screen reader support
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Bot, Send, X, Wifi, WifiOff, Loader2, 
  Trash2, Sparkles, BookOpen, Brain, Target, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

// Storage keys - messages only, dismissal is session-based
const CHATBOT_MESSAGES_KEY = 'shiksha_setu_global_chat';

// Swipe threshold (40% of screen width)
const SWIPE_THRESHOLD_PERCENT = 0.4;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  labelEn: string;
  labelHi: string;
  promptEn: string;
  promptHi: string;
}

// Quick actions for fast help
const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'explain',
    icon: <BookOpen className="h-4 w-4" />,
    labelEn: 'Explain topic',
    labelHi: 'विषय समझाएं',
    promptEn: 'Please explain this topic to me in simple terms.',
    promptHi: 'कृपया इस विषय को सरल शब्दों में समझाएं।',
  },
  {
    id: 'doubt',
    icon: <Brain className="h-4 w-4" />,
    labelEn: 'Ask a doubt',
    labelHi: 'प्रश्न पूछें',
    promptEn: 'I have a doubt about my studies. Can you help?',
    promptHi: 'मुझे पढ़ाई में एक संदेह है। क्या आप मदद कर सकते हैं?',
  },
  {
    id: 'career',
    icon: <Target className="h-4 w-4" />,
    labelEn: 'Career guidance',
    labelHi: 'करियर मार्गदर्शन',
    promptEn: 'I need career guidance. What are my options after class 10/12?',
    promptHi: 'मुझे करियर मार्गदर्शन चाहिए। 10वीं/12वीं के बाद मेरे पास क्या विकल्प हैं?',
  },
  {
    id: 'quiz',
    icon: <HelpCircle className="h-4 w-4" />,
    labelEn: 'Quiz help',
    labelHi: 'क्विज़ मदद',
    promptEn: 'Help me prepare for quizzes. Give me some practice questions.',
    promptHi: 'क्विज़ की तैयारी में मदद करें। कुछ अभ्यास प्रश्न दें।',
  },
];

// FAQ Knowledge Base (subset for quick responses)
const FAQ_RESPONSES: Record<string, { keywords: string[]; en: string; hi: string }> = {
  greetings: {
    keywords: ['hello', 'hi', 'hey', 'namaste', 'नमस्ते', 'हेलो'],
    en: "Hello! I'm Setu Saarthi, your learning assistant. How can I help you today?",
    hi: "नमस्ते! मैं सेतु सारथी हूं, आपका लर्निंग असिस्टेंट। आज मैं आपकी कैसे मदद कर सकता हूं?",
  },
  help: {
    keywords: ['help', 'how', 'what', 'मदद', 'कैसे', 'क्या'],
    en: "🆘 I can help you with:\n• 📚 Subject doubts\n• 📝 Study tips\n• 🎓 Career guidance\n• 📖 Exam preparation\n\nJust ask me anything!",
    hi: "🆘 मैं इनमें मदद कर सकता हूं:\n• 📚 विषय संबंधी प्रश्न\n• 📝 पढ़ाई टिप्स\n• 🎓 करियर मार्गदर्शन\n• 📖 परीक्षा तैयारी\n\nकुछ भी पूछें!",
  },
  study: {
    keywords: ['study', 'exam', 'score', 'marks', 'पढ़ाई', 'परीक्षा', 'अंक'],
    en: "📖 Study Tips:\n• Study regularly, not just before exams\n• Take short breaks every 25-30 minutes\n• Practice questions and past papers\n• Make short notes for revision\n• Get enough sleep!",
    hi: "📖 पढ़ाई टिप्स:\n• नियमित रूप से पढ़ें, सिर्फ परीक्षा से पहले नहीं\n• हर 25-30 मिनट में छोटा ब्रेक लें\n• प्रश्नों और पिछले पेपर का अभ्यास करें\n• रिवीजन के लिए छोटे नोट्स बनाएं\n• पर्याप्त नींद लें!",
  },
  career: {
    keywords: ['career', 'job', 'future', 'stream', 'करियर', 'नौकरी', 'भविष्य'],
    en: "🎓 Career Guidance:\n• Explore streams: Science, Commerce, Arts\n• Check the Career section for detailed paths\n• Consider your interests and strengths\n• Talk to teachers and counselors",
    hi: "🎓 करियर मार्गदर्शन:\n• स्ट्रीम एक्सप्लोर करें: विज्ञान, वाणिज्य, कला\n• विस्तृत पथों के लिए करियर सेक्शन देखें\n• अपनी रुचियों और ताकतों पर विचार करें\n• शिक्षकों से बात करें",
  },
};

const DEFAULT_RESPONSE = {
  en: "I'm here to help! In offline mode, I can assist with study tips, career guidance, and app navigation. Connect to internet for detailed AI responses.",
  hi: "मैं मदद के लिए यहां हूं! ऑफ़लाइन मोड में, मैं पढ़ाई टिप्स, करियर मार्गदर्शन और ऐप नेविगेशन में मदद कर सकता हूं। विस्तृत AI जवाबों के लिए इंटरनेट से कनेक्ट करें।",
};

export function GlobalSetuSaarthi() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isOnline = useOnlineStatus();
  const { isHindi } = useLanguage();
  const isMobile = useIsMobile();
  
  // Session-only dismissal state (resets on refresh)
  const [isHidden, setIsHidden] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Quick actions menu state
  const [showQuickActions, setShowQuickActions] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Swipe gesture state
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const buttonRef = useRef<HTMLDivElement>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Only show on student routes
  const isStudentRoute = location.pathname.startsWith('/student') || location.pathname === '/settings';
  
  // Load messages from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CHATBOT_MESSAGES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHATBOT_MESSAGES_KEY, JSON.stringify(messages.slice(-50))); // Keep last 50
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: isOnline
          ? (isHindi 
              ? "🙏 नमस्ते! मैं **सेतु सारथी** हूं।\n\n🌐 ऑनलाइन मोड - मुझसे कुछ भी पूछें!"
              : "🙏 Namaste! I'm **Setu Saarthi**.\n\n🌐 Online Mode - Ask me anything!")
          : (isHindi 
              ? "🙏 नमस्ते! मैं सेतु सारथी हूं।\n\n📡 ऑफ़लाइन मोड - सीमित जवाब"
              : "🙏 Namaste! I'm Setu Saarthi.\n\n📡 Offline Mode - Limited Answers"),
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length, isOnline, isHindi]);

  // Close quick actions when clicking outside
  useEffect(() => {
    if (showQuickActions) {
      const handleClickOutside = () => setShowQuickActions(false);
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showQuickActions]);

  // Generate offline response
  const generateOfflineResponse = useCallback((userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    for (const [, response] of Object.entries(FAQ_RESPONSES)) {
      for (const keyword of response.keywords) {
        if (lowerMessage.includes(keyword.toLowerCase())) {
          return isHindi ? response.hi : response.en;
        }
      }
    }
    
    return isHindi ? DEFAULT_RESPONSE.hi : DEFAULT_RESPONSE.en;
  }, [isHindi]);

  // Stream online response
  const streamOnlineResponse = useCallback(async (userMessages: Array<{ role: string; content: string }>) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/setu-saarthi-chat`;

    const response = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ 
        messages: userMessages,
        context: { language: isHindi ? 'hindi' : 'english' },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to get AI response');
    }

    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let assistantContent = '';

    const assistantId = `assistant_${Date.now()}`;
    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            assistantContent += content;
            setMessages(prev => prev.map(m => 
              m.id === assistantId ? { ...m, content: assistantContent } : m
            ));
          }
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }
  }, [isHindi]);

  // Handle send message
  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (isOnline) {
        const conversationHistory = messages
          .filter(m => m.id !== 'welcome')
          .map(m => ({ role: m.role, content: m.content }));
        conversationHistory.push({ role: 'user', content: userMessage.content });
        
        await streamOnlineResponse(conversationHistory);
      } else {
        // Offline mode - instant response
        const response = generateOfflineResponse(userMessage.content);
        setMessages(prev => [...prev, {
          id: `assistant_${Date.now()}`,
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        }]);
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        variant: 'destructive',
        title: isHindi ? 'त्रुटि' : 'Error',
        description: error.message || (isHindi ? 'जवाब प्राप्त करने में विफल' : 'Failed to get response'),
      });
      // Add fallback offline response
      setMessages(prev => [...prev, {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: generateOfflineResponse(userMessage.content),
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quick action selection
  const handleQuickAction = (action: QuickAction) => {
    setShowQuickActions(false);
    setIsOpen(true);
    // Send the pre-filled prompt after a short delay
    setTimeout(() => {
      handleSend(isHindi ? action.promptHi : action.promptEn);
    }, 300);
  };

  // Clear chat history
  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(CHATBOT_MESSAGES_KEY);
  };

  // Open full Setu Saarthi page
  const openFullPage = () => {
    setIsOpen(false);
    navigate('/student/setu-saarthi');
  };

  // Hide chatbot for current session only (no localStorage)
  const hideChatbot = () => {
    setIsHidden(true);
    setIsOpen(false);
    setShowQuickActions(false);
    toast({
      title: isHindi ? 'चैटबॉट छिपाया गया' : 'Chatbot Hidden',
      description: isHindi 
        ? 'पेज रिफ्रेश करने पर वापस आ जाएगा' 
        : 'Will reappear on page refresh',
    });
  };

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    dragStartX.current = e.touches[0].clientX;
    setIsDragging(true);
    
    // Start long press timer for quick actions
    longPressTimer.current = setTimeout(() => {
      setShowQuickActions(true);
      setIsDragging(false);
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    // Cancel long press if moving
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - dragStartX.current;
    setDragX(deltaX);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    setIsDragging(false);
    
    // Check if swipe threshold exceeded
    const screenWidth = window.innerWidth;
    const threshold = screenWidth * SWIPE_THRESHOLD_PERCENT;
    
    if (Math.abs(dragX) > threshold) {
      // Animate off-screen and hide
      setDragX(dragX > 0 ? screenWidth : -screenWidth);
      setTimeout(hideChatbot, 200);
    } else {
      // Reset position
      setDragX(0);
    }
  };

  // Mouse events for desktop drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    dragStartX.current = e.clientX;
    setIsDragging(true);
    
    // Start long press timer for quick actions
    longPressTimer.current = setTimeout(() => {
      setShowQuickActions(true);
      setIsDragging(false);
    }, 500);
    
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    // Cancel long press if moving
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    const deltaX = e.clientX - dragStartX.current;
    setDragX(deltaX);
  };

  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    setIsDragging(false);
    
    // Check if swipe threshold exceeded
    const screenWidth = window.innerWidth;
    const threshold = screenWidth * SWIPE_THRESHOLD_PERCENT;
    
    if (Math.abs(dragX) > threshold) {
      setDragX(dragX > 0 ? screenWidth : -screenWidth);
      setTimeout(hideChatbot, 200);
    } else {
      setDragX(0);
    }
  };

  // Add/remove mouse listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragX]);

  // Handle button click (only if not dragging)
  const handleButtonClick = () => {
    if (Math.abs(dragX) < 5 && !showQuickActions) {
      setIsOpen(true);
    }
  };

  // Don't render if hidden or not on student route
  if (isHidden || !isStudentRoute) {
    return null;
  }

  // Chat content (shared between mobile and desktop)
  const ChatContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">Setu Saarthi</h2>
            <Badge
              variant="outline"
              className={`text-xs ${
                isOnline
                  ? 'bg-green-500/10 text-green-600 border-green-500/30'
                  : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
              }`}
            >
              {isOnline ? (
                <><Wifi className="h-3 w-3 mr-1" /> {isHindi ? 'ऑनलाइन' : 'Online'}</>
              ) : (
                <><WifiOff className="h-3 w-3 mr-1" /> {isHindi ? 'ऑफ़लाइन' : 'Offline - Limited'}</>
              )}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={openFullPage}>
                <Sparkles className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isHindi ? 'पूर्ण पृष्ठ खोलें' : 'Open Full Page'}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearChat}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isHindi ? 'चैट साफ करें' : 'Clear Chat'}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={`rounded-2xl px-4 py-2 max-w-[80%] ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm whitespace-pre-line">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={isHindi ? 'अपना प्रश्न लिखें...' : 'Ask your question...'}
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={() => handleSend()} disabled={isLoading || !input.trim()} size="icon">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );

  // Floating button with swipe and quick actions
  const FloatingButton = () => (
    <div 
      ref={buttonRef}
      className="fixed bottom-4 right-4 z-[9999] select-none"
      style={{
        transform: `translateX(${dragX}px)`,
        transition: isDragging ? 'none' : 'transform 0.2s ease-out',
      }}
    >
      {/* Quick Actions Menu */}
      {showQuickActions && (
        <div 
          className="absolute bottom-16 right-0 bg-background border rounded-lg shadow-xl p-2 min-w-[180px] animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-xs text-muted-foreground px-2 py-1 mb-1">
            {isHindi ? 'त्वरित कार्य' : 'Quick Actions'}
          </div>
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left"
            >
              {action.icon}
              <span>{isHindi ? action.labelHi : action.labelEn}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={`h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center relative cursor-grab active:cursor-grabbing touch-none ${
              isDragging ? 'scale-105' : ''
            }`}
            style={{ transition: isDragging ? 'none' : 'transform 0.1s ease-out' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onClick={handleButtonClick}
            aria-label={isHindi ? 'लर्निंग असिस्टेंट खोलें' : 'Open learning assistant'}
          >
            <Bot className="h-6 w-6" />
            {/* Close icon on hover */}
            <span 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
              onClick={(e) => { e.stopPropagation(); hideChatbot(); }}
            >
              <X className="h-3 w-3" />
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <div className="text-center">
            <div>{isHindi ? 'सेतु सारथी से पूछें' : 'Ask Setu Saarthi'}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {isHindi ? 'दबाकर रखें: त्वरित कार्य' : 'Hold: Quick actions'}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );

  // Mobile: Full-screen dialog
  if (isMobile) {
    return (
      <>
        <FloatingButton />
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-full h-[100dvh] p-0 gap-0 sm:rounded-none">
            <DialogHeader className="sr-only">
              <DialogTitle>Setu Saarthi</DialogTitle>
            </DialogHeader>
            <ChatContent />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Desktop: Sliding sheet from right
  return (
    <>
      <FloatingButton />
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[450px] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Setu Saarthi</SheetTitle>
          </SheetHeader>
          <ChatContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
