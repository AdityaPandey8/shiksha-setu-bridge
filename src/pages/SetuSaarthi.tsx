/**
 * SetuSaarthi Page
 * 
 * Full-screen AI learning and career assistant that works in both
 * OFFLINE and ONLINE modes.
 * 
 * OFFLINE MODE: Keyword-based responses using cached data
 * ONLINE MODE: ChatGPT-like AI conversation via Lovable AI
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Send, Bot, User, Wifi, WifiOff, 
  Loader2, Trash2, Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Offline response patterns - keyword-based matching
const OFFLINE_RESPONSES: Record<string, { keywords?: string[]; en: string; hi: string }> = {
  greetings: {
    keywords: ['hello', 'hi', 'hey', 'namaste', 'नमस्ते', 'हेलो', 'start'],
    en: "🙏 Namaste! I'm Setu Saarthi, your learning companion.\n\n📡 I'm currently in Offline Mode with limited features. I can help you with:\n\n• 📚 Chapter summaries\n• 💡 Quiz hints (not answers)\n• 🎓 Career information\n• 🧭 App navigation\n\nHow can I help you today?",
    hi: "🙏 नमस्ते! मैं सेतु सारथी हूं, आपका लर्निंग साथी।\n\n📡 मैं अभी ऑफ़लाइन मोड में हूं। मैं इनमें मदद कर सकता हूं:\n\n• 📚 अध्याय सारांश\n• 💡 क्विज़ संकेत\n• 🎓 करियर जानकारी\n• 🧭 ऐप नेविगेशन\n\nआज मैं आपकी कैसे मदद कर सकता हूं?",
  },
  quiz: {
    keywords: ['quiz', 'test', 'practice', 'question', 'क्विज़', 'परीक्षा', 'प्रश्न', 'answer'],
    en: "📝 Quiz Tips:\n\n• Read each question carefully before answering\n• Eliminate obviously wrong options first\n• If stuck, move to the next question and come back later\n• Don't guess randomly - think about what you learned\n• Check your attempts in the Quizzes section\n\n💡 Hint: Focus on understanding concepts, not just memorizing answers!",
    hi: "📝 क्विज़ टिप्स:\n\n• जवाब देने से पहले हर सवाल ध्यान से पढ़ें\n• पहले स्पष्ट गलत विकल्पों को हटाएं\n• अगर फंस जाएं, अगले सवाल पर जाएं और बाद में वापस आएं\n• बिना सोचे न चुनें - जो सीखा उसके बारे में सोचें\n\n💡 संकेत: सिर्फ रटने की जगह अवधारणाओं को समझने पर ध्यान दें!",
  },
  ebook: {
    keywords: ['ebook', 'book', 'chapter', 'read', 'पढ़', 'किताब', 'अध्याय', 'ncert'],
    en: "📚 E-Book Study Tips:\n\n• Go to E-Books section from the dashboard\n• Downloaded chapters work offline\n• Read summaries first for quick revision\n• Take notes as you read\n• Complete one chapter before moving to next\n\n✨ Pro tip: Review what you learned before sleeping - it helps memory!",
    hi: "📚 ई-बुक पढ़ाई टिप्स:\n\n• डैशबोर्ड से ई-बुक्स सेक्शन में जाएं\n• डाउनलोड किए गए अध्याय ऑफ़लाइन काम करते हैं\n• त्वरित रिवीजन के लिए पहले सारांश पढ़ें\n• पढ़ते समय नोट्स बनाएं\n\n✨ टिप: सोने से पहले जो सीखा उसे दोहराएं - याददाश्त में मदद करता है!",
  },
  career: {
    keywords: ['career', 'job', 'future', 'stream', 'करियर', 'नौकरी', 'भविष्य', 'exam', 'jee', 'neet'],
    en: "🎓 Career Guidance:\n\nExplore 4 main streams after Class 10:\n\n🔢 Mathematics: Engineering, IT, Data Science\n→ Exams: JEE Main, JEE Advanced\n\n🔬 Biology: Doctor, Research, Healthcare\n→ Exams: NEET, AIIMS\n\n📊 Commerce: Business, Finance, CA\n→ Exams: CA Foundation, CS\n\n🎨 Arts: Law, Journalism, Civil Services\n→ Exams: CLAT, UPSC\n\nVisit Career Guidance section for detailed info!",
    hi: "🎓 करियर मार्गदर्शन:\n\nकक्षा 10 के बाद 4 मुख्य स्ट्रीम:\n\n🔢 गणित: इंजीनियरिंग, IT, डेटा साइंस\n→ परीक्षाएं: JEE Main, JEE Advanced\n\n🔬 जीव विज्ञान: डॉक्टर, रिसर्च, हेल्थकेयर\n→ परीक्षाएं: NEET, AIIMS\n\n📊 वाणिज्य: बिजनेस, फाइनेंस, CA\n→ परीक्षाएं: CA Foundation, CS\n\n🎨 कला: कानून, पत्रकारिता, सिविल सेवा\n→ परीक्षाएं: CLAT, UPSC\n\nविस्तृत जानकारी के लिए Career Guidance सेक्शन देखें!",
  },
  maths: {
    keywords: ['maths', 'math', 'algebra', 'geometry', 'गणित', 'बीजगणित', 'number', 'calculate'],
    en: "🔢 Mathematics Study Tips:\n\n• Practice daily - at least 5 problems\n• Understand formulas, don't just memorize\n• Draw diagrams for geometry\n• Check answers by substituting back\n• Start with easy problems, then harder ones\n\n📌 Key topics: Algebra, Geometry, Trigonometry, Statistics\n\nKeep practicing! Math becomes easier with consistency. 💪",
    hi: "🔢 गणित पढ़ाई टिप्स:\n\n• रोज़ाना अभ्यास करें - कम से कम 5 सवाल\n• सूत्र समझें, सिर्फ रटें नहीं\n• ज्यामिति के लिए चित्र बनाएं\n• उत्तर वापस रखकर जांचें\n• आसान सवालों से शुरू करें, फिर कठिन\n\n📌 मुख्य विषय: बीजगणित, ज्यामिति, त्रिकोणमिति, सांख्यिकी\n\nअभ्यास जारी रखें! गणित निरंतरता से आसान होता है। 💪",
  },
  science: {
    keywords: ['science', 'physics', 'chemistry', 'biology', 'विज्ञान', 'भौतिकी', 'रसायन', 'experiment'],
    en: "🔬 Science Study Tips:\n\n• Focus on understanding concepts, not memorizing\n• Draw diagrams and flowcharts\n• Connect topics to real-world examples\n• Practice numerical problems (Physics, Chemistry)\n• Learn scientific terms and definitions\n\n📌 Key areas:\n• Physics: Motion, Force, Light, Electricity\n• Chemistry: Elements, Reactions, Acids-Bases\n• Biology: Cells, Body Systems, Environment\n\nScience is about curiosity - keep asking \"why\"! 🧪",
    hi: "🔬 विज्ञान पढ़ाई टिप्स:\n\n• अवधारणाओं को समझने पर ध्यान दें, रटने पर नहीं\n• आरेख और फ्लोचार्ट बनाएं\n• विषयों को वास्तविक उदाहरणों से जोड़ें\n• संख्यात्मक सवालों का अभ्यास करें\n\n📌 मुख्य क्षेत्र:\n• भौतिकी: गति, बल, प्रकाश, बिजली\n• रसायन: तत्व, प्रतिक्रियाएं, अम्ल-क्षार\n• जीव विज्ञान: कोशिकाएं, शरीर प्रणालियां\n\nविज्ञान जिज्ञासा के बारे में है - \"क्यों\" पूछते रहें! 🧪",
  },
  help: {
    keywords: ['help', 'how', 'what', 'where', 'मदद', 'कैसे', 'क्या', 'कहां', 'use', 'app'],
    en: "🆘 How I Can Help You:\n\n📘 **E-Books** - Read chapters offline\n📂 **Content** - Watch videos, read PDFs\n📝 **Quizzes** - Practice & test yourself\n🎓 **Career** - Explore future paths\n\n🔍 Just ask me about:\n• Any subject (Math, Science, Hindi, English)\n• Study tips and techniques\n• Career guidance\n• App navigation\n\nI'm here to make learning easier! What would you like to know?",
    hi: "🆘 मैं कैसे मदद कर सकता हूं:\n\n📘 **ई-बुक्स** - ऑफ़लाइन अध्याय पढ़ें\n📂 **कंटेंट** - वीडियो देखें, PDF पढ़ें\n📝 **क्विज़** - अभ्यास और परीक्षण करें\n🎓 **करियर** - भविष्य के रास्ते एक्सप्लोर करें\n\n🔍 बस मुझसे पूछें:\n• कोई भी विषय (गणित, विज्ञान, हिंदी, अंग्रेजी)\n• पढ़ाई के टिप्स\n• करियर मार्गदर्शन\n• ऐप नेविगेशन\n\nमैं सीखना आसान बनाने के लिए यहां हूं!",
  },
  study: {
    keywords: ['study', 'learn', 'tips', 'पढ़ाई', 'सीखना', 'prepare', 'exam'],
    en: "📖 Smart Study Tips:\n\n1. **Plan Your Day** - Make a simple timetable\n2. **Active Learning** - Don't just read, practice!\n3. **Take Breaks** - 25 min study, 5 min break\n4. **Teach Others** - Explain to friends or family\n5. **Sleep Well** - 8 hours for better memory\n\n🎯 Before Exams:\n• Start revision 2 weeks early\n• Focus on important chapters\n• Practice previous year questions\n• Stay calm and confident\n\nYou've got this! Believe in yourself. ⭐",
    hi: "📖 स्मार्ट पढ़ाई टिप्स:\n\n1. **दिन की योजना** - साधारण टाइमटेबल बनाएं\n2. **सक्रिय सीखना** - सिर्फ पढ़ें नहीं, अभ्यास करें!\n3. **ब्रेक लें** - 25 मिनट पढ़ाई, 5 मिनट आराम\n4. **दूसरों को सिखाएं** - दोस्तों या परिवार को समझाएं\n5. **अच्छी नींद** - बेहतर याददाश्त के लिए 8 घंटे\n\n🎯 परीक्षा से पहले:\n• 2 हफ्ते पहले रिवीजन शुरू करें\n• महत्वपूर्ण अध्यायों पर ध्यान दें\n• पिछले साल के प्रश्न हल करें\n\nआप यह कर सकते हैं! खुद पर भरोसा रखें। ⭐",
  },
  default: {
    en: "I'm currently in Offline Mode with limited features.\n\nI can help you with:\n• 📚 Chapter summaries\n• 💡 Quiz hints\n• 🎓 Career information\n• 🧭 App navigation\n• 📖 Study tips\n\n🌐 For detailed AI-powered answers, please connect to the internet.\n\nTry asking about: ebooks, quizzes, career, maths, science, or study tips!",
    hi: "मैं अभी ऑफ़लाइन मोड में सीमित फीचर्स के साथ हूं।\n\nमैं इनमें मदद कर सकता हूं:\n• 📚 अध्याय सारांश\n• 💡 क्विज़ संकेत\n• 🎓 करियर जानकारी\n• 🧭 ऐप नेविगेशन\n• 📖 पढ़ाई टिप्स\n\n🌐 विस्तृत AI जवाबों के लिए इंटरनेट से कनेक्ट करें।\n\nये पूछें: ebooks, quizzes, career, maths, science!",
  },
};

export default function SetuSaarthi() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isOnline = useOnlineStatus();
  const { isHindi } = useLanguage();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Student context for AI
  const [context] = useState(() => {
    try {
      const profile = localStorage.getItem('shiksha_setu_profile');
      if (profile) {
        const parsed = JSON.parse(profile);
        return {
          studentClass: parsed.class || undefined,
          stream: parsed.stream || undefined,
          language: isHindi ? 'hindi' : 'english',
        };
      }
    } catch {
      // Ignore parsing errors
    }
    return { language: isHindi ? 'hindi' : 'english' };
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: isOnline
          ? (isHindi 
              ? "🙏 नमस्ते! मैं **सेतु सारथी** हूं, आपका AI लर्निंग साथी।\n\n🌐 मैं ऑनलाइन मोड में हूं - मुझसे कुछ भी पूछें!\n\n• 📚 किसी भी विषय में मदद\n• 💡 सवालों के जवाब\n• 🎓 करियर मार्गदर्शन\n• 📖 पढ़ाई टिप्स\n\nआज मैं आपकी कैसे मदद कर सकता हूं?"
              : "🙏 Namaste! I'm **Setu Saarthi**, your AI learning companion.\n\n🌐 I'm in Online Mode - ask me anything!\n\n• 📚 Help with any subject\n• 💡 Answers to your doubts\n• 🎓 Career guidance\n• 📖 Study tips\n\nHow can I help you today?")
          : (isHindi 
              ? OFFLINE_RESPONSES.greetings.hi 
              : OFFLINE_RESPONSES.greetings.en),
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOnline, isHindi, messages.length]);

  // Generate offline response based on keywords
  const generateOfflineResponse = useCallback((userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

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
  }, [isHindi]);

  // Stream AI response for online mode
  const streamOnlineResponse = useCallback(async (
    userMessages: Array<{ role: string; content: string }>
  ): Promise<void> => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/setu-saarthi-chat`;

    const response = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ 
        messages: userMessages,
        context,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to get AI response');
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let assistantContent = '';

    // Create initial assistant message
    const assistantId = `assistant_${Date.now()}`;
    setMessages(prev => [
      ...prev,
      {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      },
    ]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      textBuffer += decoder.decode(value, { stream: true });

      // Process line-by-line
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
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantId ? { ...m, content: assistantContent } : m
              )
            );
          }
        } catch {
          // Incomplete JSON, put back and wait
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }
  }, [context]);

  // Handle send message
  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (isOnline) {
        // Online mode: Stream AI response
        const chatHistory = messages
          .filter(m => m.id !== 'welcome')
          .map(m => ({ role: m.role, content: m.content }));
        chatHistory.push({ role: 'user', content: userMessage.content });

        await streamOnlineResponse(chatHistory);
      } else {
        // Offline mode: Keyword-based response
        const botResponse: Message = {
          id: `assistant_${Date.now()}`,
          role: 'assistant',
          content: generateOfflineResponse(userMessage.content),
          timestamp: new Date(),
        };
        
        // Simulate slight delay for natural feel
        await new Promise(resolve => setTimeout(resolve, 300));
        setMessages(prev => [...prev, botResponse]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to get response',
        variant: 'destructive',
      });
      
      // Fallback to offline response on error
      const fallbackResponse: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: isHindi
          ? "माफ करें, कुछ गड़बड़ हो गई। कृपया दोबारा कोशिश करें या ऑफ़लाइन मोड में उपलब्ध जानकारी देखें।"
          : "Sorry, something went wrong. Please try again or check the information available in offline mode.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, isOnline, messages, streamOnlineResponse, generateOfflineResponse, toast, isHindi]);

  // Handle enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Clear chat
  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b bg-card shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/student')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-sm sm:text-base">Setu Saarthi</h1>
              <p className="text-xs text-muted-foreground">
                {isHindi ? 'आपका लर्निंग साथी' : 'Your Learning Companion'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <Badge
            variant="outline"
            className={`text-xs ${
              isOnline
                ? 'bg-green-500/10 text-green-600 border-green-500/30'
                : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">AI Tutor</span>
                <span className="sm:hidden">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Limited</span>
                <span className="sm:hidden">Offline</span>
              </>
            )}
          </Badge>
          
          {/* Clear Chat Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearChat}
            className="h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  {isOnline ? (
                    <Sparkles className="h-4 w-4 text-primary" />
                  ) : (
                    <Bot className="h-4 w-4 text-primary" />
                  )}
                </div>
              )}
              <div
                className={`rounded-2xl px-4 py-2.5 max-w-[85%] sm:max-w-[75%] ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm whitespace-pre-line leading-relaxed">
                  {msg.content || (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isHindi ? 'सोच रहा हूं...' : 'Thinking...'}
                    </span>
                  )}
                </p>
              </div>
              {msg.role === 'user' && (
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-secondary-foreground" />
                </div>
              )}
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-3 justify-start">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
              </div>
              <div className="rounded-2xl px-4 py-2.5 bg-muted">
                <p className="text-sm text-muted-foreground">
                  {isHindi ? 'जवाब तैयार कर रहा हूं...' : 'Preparing response...'}
                </p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-card p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isHindi
                ? 'अपना सवाल यहाँ लिखें...'
                : 'Type your question here...'
            }
            disabled={isLoading}
            className="flex-1 h-11"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-11 w-11 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          {isOnline
            ? (isHindi ? '🌐 AI मोड - विस्तृत जवाब उपलब्ध' : '🌐 AI Mode - Detailed answers available')
            : (isHindi ? '📡 ऑफ़लाइन - सीमित जवाब' : '📡 Offline - Limited responses')}
        </p>
      </div>
    </div>
  );
}
