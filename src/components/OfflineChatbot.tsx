/**
 * OfflineChatbot Component
 * 
 * A lightweight chatbot that works OFFLINE using teacher-provided summaries and keyword-based responses.
 * 
 * OFFLINE MODE: "Offline Assistant (Limited)"
 * - Chapter summaries (from teacher-provided data)
 * - Quiz hints (not answers)
 * - Career info
 * - App navigation help
 * - Uses cached responses only
 * 
 * ONLINE MODE: Would connect to AI (future enhancement)
 */

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User, WifiOff, Wifi, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useLanguage } from '@/hooks/useLanguage';
import { useChatbotSummarySync, ChapterSummary } from '@/hooks/useChatbotSummarySync';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

// Subject keyword mappings for matching
const SUBJECT_KEYWORDS: Record<string, string[]> = {
  mathematics: ['maths', 'math', 'algebra', 'geometry', 'गणित', 'बीजगणित', 'ज्यामिति', 'arithmetic', 'trigonometry'],
  science: ['science', 'physics', 'chemistry', 'biology', 'विज्ञान', 'भौतिकी', 'रसायन', 'जीव विज्ञान'],
  social_science: ['social', 'history', 'geography', 'civics', 'इतिहास', 'भूगोल', 'नागरिक शास्त्र', 'सामाजिक'],
  hindi: ['hindi', 'हिंदी', 'व्याकरण', 'grammar'],
  english: ['english', 'अंग्रेज़ी', 'अंग्रेजी'],
};

// Keyword-based response patterns for offline mode (fallback when no summary matches)
const OFFLINE_RESPONSES = {
  greetings: {
    keywords: ['hello', 'hi', 'hey', 'namaste', 'नमस्ते', 'हेलो'],
    en: "Hello! I'm your offline learning assistant. I can help you with chapter summaries, quiz hints, career info, and app navigation. How can I help you today?",
    hi: "नमस्ते! मैं आपका ऑफ़लाइन लर्निंग असिस्टेंट हूं। मैं अध्याय सारांश, क्विज़ संकेत, करियर जानकारी और ऐप नेविगेशन में मदद कर सकता हूं।",
  },
  quiz: {
    keywords: ['quiz', 'test', 'practice', 'क्विज़', 'परीक्षा', 'प्रश्न'],
    en: "📝 Quiz Tips:\n• Read each question carefully\n• Eliminate obviously wrong answers first\n• If stuck, move to next and come back later\n• Check your cached quizzes in the Quizzes section",
    hi: "📝 क्विज़ टिप्स:\n• प्रत्येक प्रश्न को ध्यान से पढ़ें\n• पहले स्पष्ट गलत उत्तरों को हटाएं\n• अगर फंस जाएं, तो आगे बढ़ें और बाद में वापस आएं",
  },
  ebook: {
    keywords: ['ebook', 'book', 'read', 'पढ़', 'किताब'],
    en: "📚 E-Book Navigation:\n• Go to E-Books section from the main menu\n• Downloaded chapters are available offline\n• Use bookmarks to save your progress\n• Each chapter has a summary for quick revision",
    hi: "📚 ई-बुक नेविगेशन:\n• मुख्य मेनू से ई-बुक्स सेक्शन में जाएं\n• डाउनलोड किए गए अध्याय ऑफ़लाइन उपलब्ध हैं\n• प्रगति सहेजने के लिए बुकमार्क का उपयोग करें",
  },
  career: {
    keywords: ['career', 'job', 'future', 'stream', 'करियर', 'नौकरी', 'भविष्य'],
    en: "🎓 Career Guidance:\n• Explore 4 streams: Mathematics, Biology, Arts, Commerce\n• Each stream shows competitive exams, courses, and job opportunities\n• All career data works offline!\n• Go to Career Guidance section to explore",
    hi: "🎓 करियर मार्गदर्शन:\n• 4 स्ट्रीम एक्सप्लोर करें: गणित, जीव विज्ञान, कला, वाणिज्य\n• प्रत्येक स्ट्रीम में प्रतियोगी परीक्षाएं, कोर्स और नौकरी के अवसर दिखाए गए हैं",
  },
  content: {
    keywords: ['content', 'video', 'pdf', 'notes', 'learn', 'वीडियो', 'नोट्स', 'सीखना'],
    en: "📂 Learning Content:\n• Videos, PDFs, and notes are in the Content section\n• Cached content works offline\n• Mark items as complete to track progress\n• Filter by class and language",
    hi: "📂 लर्निंग कंटेंट:\n• वीडियो, PDF और नोट्स कंटेंट सेक्शन में हैं\n• कैश्ड कंटेंट ऑफ़लाइन काम करता है\n• प्रगति ट्रैक करने के लिए आइटम को पूर्ण के रूप में चिह्नित करें",
  },
  help: {
    keywords: ['help', 'how', 'what', 'where', 'मदद', 'कैसे', 'क्या', 'कहां'],
    en: "🆘 I can help you with:\n• 📘 E-Books - Read chapters offline\n• 📂 Content - Videos, PDFs, notes\n• 📝 Quizzes - Practice questions\n• 🎓 Career - Explore career paths\n\nJust ask me about any of these topics!",
    hi: "🆘 मैं इनमें मदद कर सकता हूं:\n• 📘 ई-बुक्स - ऑफ़लाइन अध्याय पढ़ें\n• 📂 कंटेंट - वीडियो, PDF, नोट्स\n• 📝 क्विज़ - अभ्यास प्रश्न\n• 🎓 करियर - करियर पथ एक्सप्लोर करें",
  },
  offline: {
    keywords: ['offline', 'internet', 'connection', 'ऑफ़लाइन', 'इंटरनेट'],
    en: "📡 Offline Mode Info:\n• All downloaded content works without internet\n• Quiz attempts are saved locally\n• Progress syncs when you're back online\n• Look for green dots to see what's available offline",
    hi: "📡 ऑफ़लाइन मोड जानकारी:\n• सभी डाउनलोड किया गया कंटेंट बिना इंटरनेट के काम करता है\n• क्विज़ प्रयास स्थानीय रूप से सहेजे जाते हैं\n• ऑनलाइन होने पर प्रगति सिंक होती है",
  },
  default: {
    en: "I'm in offline mode with limited capabilities. I can help you with:\n• Chapter summaries\n• Quiz hints\n• Career information\n• App navigation\n\nTry asking about e-books, quizzes, career, or content!",
    hi: "मैं सीमित क्षमताओं के साथ ऑफ़लाइन मोड में हूं। मैं इनमें मदद कर सकता हूं:\n• अध्याय सारांश\n• क्विज़ संकेत\n• करियर जानकारी\n• ऐप नेविगेशन\n\nई-बुक्स, क्विज़, करियर, या कंटेंट के बारे में पूछें!",
  },
};

export function OfflineChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const isOnline = useOnlineStatus();
  const { isHindi } = useLanguage();
  const { searchSummaries, getSummaries } = useChatbotSummarySync();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const summaryCount = getSummaries().length;
      const welcomeText = isHindi
        ? `${OFFLINE_RESPONSES.greetings.hi}${summaryCount > 0 ? `\n\n📚 मेरे पास ${summaryCount} अध्याय सारांश उपलब्ध हैं।` : ''}`
        : `${OFFLINE_RESPONSES.greetings.en}${summaryCount > 0 ? `\n\n📚 I have ${summaryCount} chapter summaries available.` : ''}`;
      setMessages([
        {
          id: 'welcome',
          type: 'bot',
          text: welcomeText,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length, isHindi, getSummaries]);

  // Format summary response
  const formatSummaryResponse = (summary: ChapterSummary): string => {
    const lang = isHindi ? 'hi' : 'en';
    const header = isHindi 
      ? `📖 **${summary.chapter_id}** (${summary.subject})\n\n`
      : `📖 **${summary.chapter_id}** (${summary.subject})\n\n`;
    
    let response = header + summary.summary_text;

    if (summary.key_points && summary.key_points.length > 0) {
      const keyPointsHeader = isHindi ? '\n\n🔑 **मुख्य बिंदु:**' : '\n\n🔑 **Key Points:**';
      response += keyPointsHeader;
      summary.key_points.forEach(point => {
        response += `\n• ${point}`;
      });
    }

    return response;
  };

  // Detect subject from message
  const detectSubject = (message: string): string | null => {
    const lowerMessage = message.toLowerCase();
    for (const [subject, keywords] of Object.entries(SUBJECT_KEYWORDS)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()))) {
        return subject;
      }
    }
    return null;
  };

  // Generate response based on keywords and teacher summaries
  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // First, try to find matching chapter summaries
    const matchingSummaries = searchSummaries(userMessage, undefined, isHindi ? 'hindi' : 'english');
    
    if (matchingSummaries.length > 0) {
      // Return the most relevant summary
      return formatSummaryResponse(matchingSummaries[0]);
    }

    // Check if asking about a specific subject/chapter
    const detectedSubject = detectSubject(userMessage);
    if (detectedSubject) {
      const subjectSummaries = searchSummaries(detectedSubject, undefined, isHindi ? 'hindi' : 'english');
      if (subjectSummaries.length > 0) {
        return formatSummaryResponse(subjectSummaries[0]);
      }
    }

    // Fallback to keyword-based responses
    for (const [, response] of Object.entries(OFFLINE_RESPONSES)) {
      if ('keywords' in response && response.keywords) {
        for (const keyword of response.keywords) {
          if (lowerMessage.includes(keyword.toLowerCase())) {
            return isHindi ? response.hi : response.en;
          }
        }
      }
    }

    return isHindi ? OFFLINE_RESPONSES.default.hi : OFFLINE_RESPONSES.default.en;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      type: 'user',
      text: input,
      timestamp: new Date(),
    };

    // Generate bot response
    const botResponse: Message = {
      id: `bot_${Date.now()}`,
      type: 'bot',
      text: generateResponse(input),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage, botResponse]);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  if (isMinimized) {
    return (
      <Button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 left-4 z-50 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 left-4 z-50 w-80 sm:w-96 shadow-xl border-2">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <CardTitle className="text-sm font-medium">
            {isOnline ? 'Shiksha AI Assistant' : 'Offline Assistant'}
          </CardTitle>
          <Badge
            variant="outline"
            className={`text-xs ${
              isOnline
                ? 'bg-green-500/10 text-green-600 border-green-500/30'
                : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30'
            }`}
          >
            {isOnline ? (
              <><Wifi className="h-3 w-3 mr-1" /> Online</>
            ) : (
              <><WifiOff className="h-3 w-3 mr-1" /> Limited</>
            )}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsMinimized(true)}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Messages */}
        <ScrollArea className="h-72 p-3" ref={scrollRef}>
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${
                  msg.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.type === 'bot' && (
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`rounded-lg px-3 py-2 max-w-[80%] text-sm ${
                    msg.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
                {msg.type === 'user' && (
                  <div className="h-7 w-7 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-secondary" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-3 border-t flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isHindi ? 'अपना प्रश्न लिखें...' : 'Type your question...'}
            className="flex-1"
          />
          <Button onClick={handleSend} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
