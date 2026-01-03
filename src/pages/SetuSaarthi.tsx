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

// Comprehensive FAQ Knowledge Base for Setu Saarthi
// Used for OFFLINE mode and as base knowledge for ONLINE mode
interface FAQItem {
  question: string;
  keywords: string[];
  en: string;
  hi: string;
}

const FAQ_KNOWLEDGE_BASE: FAQItem[] = [
  // === A. GENERAL LEARNING ===
  {
    question: "What is this chapter about?",
    keywords: ['chapter about', 'topic about', 'what is this', 'explain chapter', 'अध्याय क्या है', 'यह क्या है'],
    en: "📚 This chapter explains the main ideas of the topic in a simple way so that you can understand how it is used in real life.\n\nTo get the most from this chapter:\n• Read the introduction carefully\n• Focus on key concepts and definitions\n• Try to relate it to examples around you",
    hi: "📚 यह अध्याय विषय के मुख्य विचारों को सरल तरीके से समझाता है ताकि आप समझ सकें कि इसे वास्तविक जीवन में कैसे उपयोग किया जाता है।\n\nइस अध्याय से सबसे अधिक लाभ उठाने के लिए:\n• परिचय को ध्यान से पढ़ें\n• मुख्य अवधारणाओं पर ध्यान दें\n• इसे अपने आस-पास के उदाहरणों से जोड़ें",
  },
  {
    question: "Explain this topic in simple words",
    keywords: ['explain', 'simple words', 'easy', 'simplify', 'सरल', 'आसान', 'समझाओ', 'explain topic'],
    en: "💡 This topic helps you understand the basic concept step by step using easy examples and simple language.\n\nTips for understanding:\n• Break it into smaller parts\n• Use diagrams or drawings\n• Ask yourself 'why' and 'how'\n• Connect it to something you already know",
    hi: "💡 यह विषय आपको आसान उदाहरणों और सरल भाषा का उपयोग करके बुनियादी अवधारणा को चरण दर चरण समझने में मदद करता है।\n\nसमझने के लिए टिप्स:\n• इसे छोटे भागों में बांटें\n• आरेख या चित्र बनाएं\n• खुद से 'क्यों' और 'कैसे' पूछें\n• इसे किसी जानी हुई चीज़ से जोड़ें",
  },
  {
    question: "Why is this topic important?",
    keywords: ['why important', 'importance', 'why study', 'why learn', 'क्यों महत्वपूर्ण', 'क्यों पढ़ें'],
    en: "🎯 This topic is important because it builds your basic understanding and is useful for exams and higher classes.\n\nIt helps you:\n• Score better in exams\n• Understand advanced concepts later\n• Apply knowledge in real-world situations\n• Build a strong foundation",
    hi: "🎯 यह विषय महत्वपूर्ण है क्योंकि यह आपकी बुनियादी समझ बनाता है और परीक्षाओं और उच्च कक्षाओं के लिए उपयोगी है।\n\nयह आपकी मदद करता है:\n• परीक्षाओं में बेहतर स्कोर करें\n• बाद में उन्नत अवधारणाओं को समझें\n• वास्तविक स्थितियों में ज्ञान लागू करें\n• मजबूत नींव बनाएं",
  },
  {
    question: "Give a real-life example",
    keywords: ['real life', 'example', 'practical', 'daily life', 'वास्तविक', 'उदाहरण', 'जीवन में'],
    en: "🌍 A real-life example helps you connect this topic with things you see or use in your daily life.\n\nThink about:\n• How is this used at home?\n• Where do you see this in nature?\n• How does this help in your daily activities?\n• Can you find this in technology around you?",
    hi: "🌍 एक वास्तविक उदाहरण आपको इस विषय को उन चीज़ों से जोड़ने में मदद करता है जो आप अपने दैनिक जीवन में देखते या उपयोग करते हैं।\n\nसोचें:\n• घर पर यह कैसे उपयोग होता है?\n• प्रकृति में यह कहाँ दिखता है?\n• दैनिक गतिविधियों में यह कैसे मदद करता है?\n• क्या आप इसे अपने आस-पास की तकनीक में पा सकते हैं?",
  },
  {
    question: "Summarize this chapter",
    keywords: ['summarize', 'summary', 'key points', 'main points', 'सारांश', 'मुख्य बिंदु'],
    en: "📝 This chapter explains the key ideas, important terms, and basic concepts that you should remember.\n\nKey elements to note:\n• Main definitions and formulas\n• Important examples\n• Practice questions\n• Diagrams and charts",
    hi: "📝 यह अध्याय मुख्य विचारों, महत्वपूर्ण शब्दों और बुनियादी अवधारणाओं को समझाता है जो आपको याद रखनी चाहिए।\n\nध्यान देने योग्य मुख्य तत्व:\n• मुख्य परिभाषाएं और सूत्र\n• महत्वपूर्ण उदाहरण\n• अभ्यास प्रश्न\n• आरेख और चार्ट",
  },
  
  // === B. STUDY & EXAM PREPARATION ===
  {
    question: "How should I study this chapter?",
    keywords: ['how to study', 'study chapter', 'study method', 'कैसे पढ़ें', 'अध्ययन कैसे', 'पढ़ाई कैसे'],
    en: "📖 Here's how to study effectively:\n\n1. First read the chapter carefully\n2. Understand the examples given\n3. Revise key points and definitions\n4. Practice questions or quizzes\n5. Make short notes for revision\n\n💡 Tip: Don't just read - practice and test yourself!",
    hi: "📖 प्रभावी अध्ययन कैसे करें:\n\n1. पहले अध्याय को ध्यान से पढ़ें\n2. दिए गए उदाहरणों को समझें\n3. मुख्य बिंदुओं और परिभाषाओं को दोहराएं\n4. प्रश्नों या क्विज़ का अभ्यास करें\n5. रिवीजन के लिए छोटे नोट्स बनाएं\n\n💡 टिप: सिर्फ पढ़ें नहीं - अभ्यास करें और खुद को परखें!",
  },
  {
    question: "How can I score better in exams?",
    keywords: ['score better', 'better marks', 'good marks', 'exam score', 'अच्छे अंक', 'बेहतर स्कोर', 'परीक्षा में'],
    en: "🏆 Tips to score better in exams:\n\n• Study regularly, not just before exams\n• Revise daily for 30 minutes\n• Practice questions from each chapter\n• Focus on understanding, not memorizing\n• Solve previous year question papers\n• Take care of your health and sleep\n\n✨ Remember: Consistency is the key to success!",
    hi: "🏆 परीक्षा में बेहतर स्कोर के लिए टिप्स:\n\n• नियमित रूप से पढ़ें, सिर्फ परीक्षा से पहले नहीं\n• रोज़ाना 30 मिनट रिवीजन करें\n• हर अध्याय से प्रश्नों का अभ्यास करें\n• रटने की बजाय समझने पर ध्यान दें\n• पिछले साल के प्रश्न पत्र हल करें\n• स्वास्थ्य और नींद का ध्यान रखें\n\n✨ याद रखें: निरंतरता सफलता की कुंजी है!",
  },
  {
    question: "How much time should I study daily?",
    keywords: ['how much time', 'study time', 'hours study', 'daily study', 'कितना समय', 'कितने घंटे', 'रोज़ाना'],
    en: "⏰ Recommended study time for school students:\n\n• 2-4 hours daily with proper breaks\n• Use the Pomodoro technique: 25 min study, 5 min break\n• Quality matters more than quantity\n• Include time for all subjects\n• Don't forget physical activities and rest\n\n📅 Tip: Create a daily timetable and follow it consistently!",
    hi: "⏰ स्कूल के छात्रों के लिए अनुशंसित अध्ययन समय:\n\n• उचित ब्रेक के साथ रोज़ाना 2-4 घंटे\n• पोमोडोरो तकनीक: 25 मिनट पढ़ाई, 5 मिनट ब्रेक\n• मात्रा से ज़्यादा गुणवत्ता मायने रखती है\n• सभी विषयों के लिए समय शामिल करें\n• शारीरिक गतिविधियां और आराम न भूलें\n\n📅 टिप: दैनिक टाइमटेबल बनाएं और उसका पालन करें!",
  },
  {
    question: "How to revise before exams?",
    keywords: ['revise', 'revision', 'before exam', 'परीक्षा से पहले', 'रिवीजन', 'दोहराना'],
    en: "📚 Smart revision strategy:\n\n1. Start revision 2 weeks before exams\n2. Focus on important topics first\n3. Solve sample questions and previous papers\n4. Review your mistakes from practice tests\n5. Make quick revision notes or flashcards\n6. Teach concepts to a friend or family member\n\n💪 Stay calm and confident - you've got this!",
    hi: "📚 स्मार्ट रिवीजन रणनीति:\n\n1. परीक्षा से 2 हफ्ते पहले रिवीजन शुरू करें\n2. पहले महत्वपूर्ण विषयों पर ध्यान दें\n3. सैंपल प्रश्न और पिछले पेपर हल करें\n4. अभ्यास परीक्षणों से अपनी गलतियां देखें\n5. त्वरित रिवीजन नोट्स बनाएं\n6. किसी दोस्त या परिवार को अवधारणाएं सिखाएं\n\n💪 शांत और आत्मविश्वासी रहें - आप कर सकते हैं!",
  },
  {
    question: "How to reduce exam fear?",
    keywords: ['exam fear', 'anxiety', 'nervous', 'scared', 'tension', 'डर', 'तनाव', 'घबराहट', 'चिंता'],
    en: "🧘 Tips to overcome exam fear:\n\n• Prepare well - confidence comes from practice\n• Revise regularly, don't cram at last minute\n• Get enough sleep before exams\n• Do deep breathing exercises\n• Think positive - you can do this!\n• Remember: One exam doesn't define your future\n\n🌟 Believe in yourself. You've prepared well!",
    hi: "🧘 परीक्षा के डर को दूर करने के टिप्स:\n\n• अच्छी तैयारी करें - आत्मविश्वास अभ्यास से आता है\n• नियमित रिवीजन करें, आखिरी समय में न रटें\n• परीक्षा से पहले पर्याप्त नींद लें\n• गहरी सांस लेने के व्यायाम करें\n• सकारात्मक सोचें - आप कर सकते हैं!\n• याद रखें: एक परीक्षा आपका भविष्य तय नहीं करती\n\n🌟 खुद पर भरोसा रखें। आपने अच्छी तैयारी की है!",
  },

  // === C. QUIZ & PRACTICE ===
  {
    question: "Is my answer correct?",
    keywords: ['answer correct', 'right answer', 'check answer', 'सही जवाब', 'उत्तर सही'],
    en: "✅ Your answer is checked based on the correct option. You can see the result immediately after submission.\n\nAfter submitting:\n• Green indicates correct answers\n• Red indicates incorrect answers\n• Review explanations to learn from mistakes\n• Try again to improve your score!",
    hi: "✅ आपका उत्तर सही विकल्प के आधार पर जांचा जाता है। आप सबमिशन के तुरंत बाद परिणाम देख सकते हैं।\n\nसबमिट करने के बाद:\n• हरा रंग सही उत्तर दर्शाता है\n• लाल रंग गलत उत्तर दर्शाता है\n• गलतियों से सीखने के लिए स्पष्टीकरण देखें\n• स्कोर सुधारने के लिए फिर से प्रयास करें!",
  },
  {
    question: "Why is my answer wrong?",
    keywords: ['answer wrong', 'wrong answer', 'incorrect', 'mistake', 'गलत जवाब', 'गलत क्यों'],
    en: "❌ Your answer may be incorrect because the concept needs more understanding.\n\nTo improve:\n• Review the explanation provided\n• Go back to the chapter and re-read the topic\n• Try to understand the logic behind the correct answer\n• Practice similar questions\n• Don't worry - making mistakes is part of learning!",
    hi: "❌ आपका उत्तर गलत हो सकता है क्योंकि अवधारणा को और समझने की जरूरत है।\n\nसुधार के लिए:\n• दिए गए स्पष्टीकरण को देखें\n• अध्याय पर वापस जाएं और विषय फिर से पढ़ें\n• सही उत्तर के पीछे के तर्क को समझें\n• समान प्रश्नों का अभ्यास करें\n• चिंता न करें - गलतियां सीखने का हिस्सा हैं!",
  },
  {
    question: "Can I retry this quiz?",
    keywords: ['retry', 'again', 'retake', 'redo', 'फिर से', 'दोबारा', 'retry quiz'],
    en: "🔄 Yes, you can retry the quiz to improve your understanding and score!\n\n• Click on 'Retry Quiz' after viewing results\n• You can retry as many times as you want\n• Focus on questions you got wrong\n• Each attempt helps you learn better\n\n💡 Tip: Review your mistakes before retrying!",
    hi: "🔄 हां, आप अपनी समझ और स्कोर सुधारने के लिए क्विज़ फिर से ले सकते हैं!\n\n• परिणाम देखने के बाद 'Retry Quiz' पर क्लिक करें\n• आप जितनी बार चाहें उतनी बार रीट्राई कर सकते हैं\n• गलत हुए प्रश्नों पर ध्यान दें\n• हर प्रयास आपको बेहतर सीखने में मदद करता है\n\n💡 टिप: रीट्राई से पहले अपनी गलतियां देखें!",
  },
  {
    question: "How is my quiz score calculated?",
    keywords: ['score calculated', 'quiz score', 'scoring', 'marks', 'स्कोर कैसे', 'अंक कैसे'],
    en: "📊 Your score is calculated based on the number of correct answers you give.\n\nScoring system:\n• Each correct answer adds to your score\n• Score percentage = (Correct ÷ Total) × 100\n• 80-100% = Excellent 🟢\n• 50-79% = Needs Practice 🟡\n• Below 50% = Keep Trying 🔴",
    hi: "📊 आपका स्कोर आपके सही उत्तरों की संख्या के आधार पर गणना किया जाता है।\n\nस्कोरिंग प्रणाली:\n• प्रत्येक सही उत्तर आपके स्कोर में जुड़ता है\n• स्कोर प्रतिशत = (सही ÷ कुल) × 100\n• 80-100% = उत्कृष्ट 🟢\n• 50-79% = अभ्यास की जरूरत 🟡\n• 50% से कम = कोशिश जारी रखें 🔴",
  },

  // === D. CAREER GUIDANCE ===
  {
    question: "What can I do after Class 10?",
    keywords: ['after class 10', 'after 10th', 'class 10', '10वीं के बाद', 'दसवीं के बाद', 'streams'],
    en: "🎓 After Class 10, you can choose from 4 main streams based on your interest:\n\n🔢 **Mathematics** - For Engineering, IT, Data Science\n🔬 **Biology** - For Medicine, Research, Healthcare\n📊 **Commerce** - For Business, Finance, Accounting\n🎨 **Arts** - For Law, Journalism, Civil Services\n\nChoose based on your interests and career goals!",
    hi: "🎓 कक्षा 10 के बाद, आप अपनी रुचि के आधार पर 4 मुख्य स्ट्रीम में से चुन सकते हैं:\n\n🔢 **गणित** - इंजीनियरिंग, IT, डेटा साइंस के लिए\n🔬 **जीव विज्ञान** - मेडिसिन, रिसर्च, हेल्थकेयर के लिए\n📊 **वाणिज्य** - बिजनेस, फाइनेंस, अकाउंटिंग के लिए\n🎨 **कला** - कानून, पत्रकारिता, सिविल सेवा के लिए\n\nअपनी रुचि और करियर लक्ष्यों के आधार पर चुनें!",
  },
  {
    question: "What are career options after Maths?",
    keywords: ['career maths', 'maths career', 'after maths', 'maths stream', 'गणित करियर', 'मैथ्स के बाद'],
    en: "🔢 Career options after Mathematics stream:\n\n**Engineering & Tech:**\n• Software Engineer, Data Scientist\n• AI/ML Engineer, Architect\n\n**Defence & Research:**\n• Defence Services, Research Scientist\n\n**Competitive Exams:**\n• JEE Main/Advanced for IITs\n• NDA, CDS for Defence\n\n**Other Options:**\n• Actuarial Science, Statistics\n• Financial Analyst, Economist",
    hi: "🔢 गणित स्ट्रीम के बाद करियर विकल्प:\n\n**इंजीनियरिंग और टेक:**\n• सॉफ्टवेयर इंजीनियर, डेटा साइंटिस्ट\n• AI/ML इंजीनियर, आर्किटेक्ट\n\n**डिफेंस और रिसर्च:**\n• रक्षा सेवाएं, रिसर्च साइंटिस्ट\n\n**प्रतियोगी परीक्षाएं:**\n• IITs के लिए JEE Main/Advanced\n• NDA, CDS डिफेंस के लिए\n\n**अन्य विकल्प:**\n• एक्चुरियल साइंस, सांख्यिकी\n• फाइनेंशियल एनालिस्ट, अर्थशास्त्री",
  },
  {
    question: "What are career options after Biology?",
    keywords: ['career biology', 'biology career', 'after biology', 'medical', 'बायोलॉजी करियर', 'जीव विज्ञान के बाद', 'doctor'],
    en: "🔬 Career options after Biology stream:\n\n**Medical:**\n• Doctor (MBBS), Dentist (BDS)\n• Nurse, Pharmacist\n\n**Research & Science:**\n• Biologist, Medical Researcher\n• Biotechnologist, Geneticist\n\n**Competitive Exams:**\n• NEET for Medical colleges\n• AIIMS entrance\n\n**Other Options:**\n• Physiotherapist, Veterinary Doctor\n• Nutritionist, Lab Technician",
    hi: "🔬 जीव विज्ञान स्ट्रीम के बाद करियर विकल्प:\n\n**मेडिकल:**\n• डॉक्टर (MBBS), दंत चिकित्सक (BDS)\n• नर्स, फार्मासिस्ट\n\n**रिसर्च और साइंस:**\n• बायोलॉजिस्ट, मेडिकल रिसर्चर\n• बायोटेक्नोलॉजिस्ट, जेनेटिसिस्ट\n\n**प्रतियोगी परीक्षाएं:**\n• मेडिकल कॉलेजों के लिए NEET\n• AIIMS प्रवेश\n\n**अन्य विकल्प:**\n• फिजियोथेरेपिस्ट, पशु चिकित्सक\n• न्यूट्रिशनिस्ट, लैब टेक्नीशियन",
  },
  {
    question: "What are career options after Commerce?",
    keywords: ['career commerce', 'commerce career', 'after commerce', 'business', 'वाणिज्य करियर', 'कॉमर्स के बाद', 'ca'],
    en: "📊 Career options after Commerce stream:\n\n**Finance & Accounting:**\n• Chartered Accountant (CA)\n• Company Secretary (CS)\n• Cost Accountant (CMA)\n\n**Business & Management:**\n• MBA, Business Manager\n• Entrepreneur, Marketing\n\n**Banking & Finance:**\n• Bank PO, Financial Analyst\n• Investment Banking\n\n**Competitive Exams:**\n• CA Foundation, CS Foundation\n• Banking exams (IBPS, SBI)",
    hi: "📊 वाणिज्य स्ट्रीम के बाद करियर विकल्प:\n\n**फाइनेंस और अकाउंटिंग:**\n• चार्टर्ड अकाउंटेंट (CA)\n• कंपनी सेक्रेटरी (CS)\n• कॉस्ट अकाउंटेंट (CMA)\n\n**बिजनेस और मैनेजमेंट:**\n• MBA, बिजनेस मैनेजर\n• उद्यमी, मार्केटिंग\n\n**बैंकिंग और फाइनेंस:**\n• बैंक PO, फाइनेंशियल एनालिस्ट\n• इन्वेस्टमेंट बैंकिंग\n\n**प्रतियोगी परीक्षाएं:**\n• CA Foundation, CS Foundation\n• बैंकिंग परीक्षाएं (IBPS, SBI)",
  },
  {
    question: "What are career options after Arts?",
    keywords: ['career arts', 'arts career', 'after arts', 'humanities', 'कला करियर', 'आर्ट्स के बाद', 'upsc'],
    en: "🎨 Career options after Arts stream:\n\n**Civil Services:**\n• IAS, IPS, IFS (UPSC)\n• State Civil Services\n\n**Law & Journalism:**\n• Lawyer (CLAT for NLUs)\n• Journalist, Editor\n\n**Creative & Social:**\n• Teacher, Professor\n• Social Worker, Psychologist\n• Designer, Artist\n\n**Competitive Exams:**\n• UPSC for Civil Services\n• CLAT for Law schools\n• UGC NET for Teaching",
    hi: "🎨 कला स्ट्रीम के बाद करियर विकल्प:\n\n**सिविल सेवाएं:**\n• IAS, IPS, IFS (UPSC)\n• राज्य सिविल सेवाएं\n\n**कानून और पत्रकारिता:**\n• वकील (NLUs के लिए CLAT)\n• पत्रकार, संपादक\n\n**क्रिएटिव और सामाजिक:**\n• शिक्षक, प्रोफेसर\n• सामाजिक कार्यकर्ता, मनोवैज्ञानिक\n• डिज़ाइनर, कलाकार\n\n**प्रतियोगी परीक्षाएं:**\n• UPSC सिविल सेवाओं के लिए\n• CLAT लॉ स्कूलों के लिए\n• UGC NET शिक्षण के लिए",
  },

  // === E. MOTIVATION & STUDY HABITS ===
  {
    question: "I feel demotivated, what should I do?",
    keywords: ['demotivated', 'motivation', 'lazy', 'tired', 'unmotivated', 'प्रेरणा', 'आलस', 'थका', 'मन नहीं'],
    en: "🌟 It's okay to feel demotivated sometimes. Here's what can help:\n\n• Take short breaks - you deserve rest\n• Set small, achievable goals daily\n• Remember why learning is important for your future\n• Talk to friends, family, or teachers\n• Celebrate small wins\n• Do something you enjoy, then return to study\n\n💪 Remember: Every expert was once a beginner. Keep going!",
    hi: "🌟 कभी-कभी demotivated महसूस करना ठीक है। यह मदद कर सकता है:\n\n• छोटे ब्रेक लें - आपको आराम का हक है\n• रोज़ाना छोटे, प्राप्त करने योग्य लक्ष्य बनाएं\n• याद रखें कि सीखना आपके भविष्य के लिए क्यों महत्वपूर्ण है\n• दोस्तों, परिवार या शिक्षकों से बात करें\n• छोटी जीत का जश्न मनाएं\n• कुछ पसंदीदा करें, फिर पढ़ाई पर लौटें\n\n💪 याद रखें: हर विशेषज्ञ कभी शुरुआती था। जारी रखें!",
  },
  {
    question: "How can I stay focused while studying?",
    keywords: ['focus', 'concentrate', 'distraction', 'attention', 'ध्यान', 'एकाग्रता', 'फोकस'],
    en: "🎯 Tips to stay focused while studying:\n\n• Study in a quiet place without distractions\n• Keep your phone away or on silent\n• Take short breaks between study sessions\n• Use the Pomodoro technique (25 min study, 5 min break)\n• Keep water and snacks ready\n• Set a specific goal for each study session\n\n📱 Tip: Turn off notifications while studying!",
    hi: "🎯 पढ़ाई के दौरान ध्यान केंद्रित रखने के टिप्स:\n\n• बिना विकर्षण वाली शांत जगह पर पढ़ें\n• फोन दूर रखें या साइलेंट पर\n• पढ़ाई सत्रों के बीच छोटे ब्रेक लें\n• पोमोडोरो तकनीक (25 मिनट पढ़ाई, 5 मिनट ब्रेक)\n• पानी और स्नैक्स तैयार रखें\n• प्रत्येक सत्र के लिए विशिष्ट लक्ष्य निर्धारित करें\n\n📱 टिप: पढ़ाई के दौरान नोटिफिकेशन बंद करें!",
  },
  {
    question: "How to manage time for studies?",
    keywords: ['time management', 'manage time', 'timetable', 'schedule', 'समय प्रबंधन', 'टाइमटेबल'],
    en: "⏰ Time management tips for students:\n\n1. Make a simple daily timetable\n2. Prioritize difficult subjects first\n3. Allocate specific time for each subject\n4. Include breaks and relaxation time\n5. Follow the timetable with discipline\n6. Review and adjust weekly\n\n📅 Sample schedule:\n• Morning: Difficult subjects\n• Afternoon: Practice & revision\n• Evening: Light reading & hobbies",
    hi: "⏰ छात्रों के लिए समय प्रबंधन टिप्स:\n\n1. एक साधारण दैनिक टाइमटेबल बनाएं\n2. कठिन विषयों को पहले प्राथमिकता दें\n3. प्रत्येक विषय के लिए विशिष्ट समय आवंटित करें\n4. ब्रेक और आराम का समय शामिल करें\n5. अनुशासन के साथ टाइमटेबल का पालन करें\n6. साप्ताहिक समीक्षा और समायोजन करें\n\n📅 नमूना कार्यक्रम:\n• सुबह: कठिन विषय\n• दोपहर: अभ्यास और रिवीजन\n• शाम: हल्का पढ़ना और शौक",
  },

  // === F. APP & NAVIGATION HELP ===
  {
    question: "How does offline mode work?",
    keywords: ['offline mode', 'without internet', 'no internet', 'ऑफ़लाइन', 'बिना इंटरनेट'],
    en: "📴 Offline mode allows you to study without internet!\n\n**What works offline:**\n• Downloaded E-books and chapters\n• Previously loaded content\n• Quiz practice (if cached)\n• Setu Saarthi (limited help)\n\n**Your progress syncs when internet is available.**\n\n💡 Tip: Download content when you have internet for offline study!",
    hi: "📴 ऑफ़लाइन मोड आपको बिना इंटरनेट के पढ़ाई करने देता है!\n\n**ऑफ़लाइन क्या काम करता है:**\n• डाउनलोड की गई ई-बुक्स और अध्याय\n• पहले लोड की गई सामग्री\n• क्विज़ अभ्यास (अगर कैश किया गया)\n• सेतु सारथी (सीमित मदद)\n\n**इंटरनेट उपलब्ध होने पर आपकी प्रगति सिंक होती है।**\n\n💡 टिप: ऑफ़लाइन पढ़ाई के लिए इंटरनेट होने पर कंटेंट डाउनलोड करें!",
  },
  {
    question: "How do I download E-books?",
    keywords: ['download ebook', 'download book', 'save ebook', 'ईबुक डाउनलोड', 'किताब डाउनलोड'],
    en: "📥 How to download E-books:\n\n1. Go to E-Books section from the dashboard\n2. Make sure you have internet connection\n3. Select the book you want to download\n4. Click the download button\n5. Wait for download to complete\n6. Book is now available offline!\n\n📚 Downloaded books appear with a ✓ mark.",
    hi: "📥 ई-बुक्स कैसे डाउनलोड करें:\n\n1. डैशबोर्ड से ई-बुक्स सेक्शन में जाएं\n2. सुनिश्चित करें कि इंटरनेट कनेक्शन है\n3. जो किताब डाउनलोड करनी है उसे चुनें\n4. डाउनलोड बटन पर क्लिक करें\n5. डाउनलोड पूरा होने का इंतज़ार करें\n6. किताब अब ऑफ़लाइन उपलब्ध है!\n\n📚 डाउनलोड की गई किताबें ✓ चिह्न के साथ दिखती हैं।",
  },
  {
    question: "How do I attempt quizzes?",
    keywords: ['attempt quiz', 'take quiz', 'start quiz', 'क्विज़ कैसे', 'क्विज़ शुरू'],
    en: "📝 How to attempt quizzes:\n\n1. Go to Quizzes section from the dashboard\n2. Select a quiz for your class\n3. Read each question carefully\n4. Select your answer\n5. Move to next question\n6. Submit when done\n7. View your results and retry if needed!\n\n💡 Tip: You can retry quizzes to improve your score!",
    hi: "📝 क्विज़ कैसे करें:\n\n1. डैशबोर्ड से क्विज़ सेक्शन में जाएं\n2. अपनी कक्षा के लिए क्विज़ चुनें\n3. हर प्रश्न ध्यान से पढ़ें\n4. अपना उत्तर चुनें\n5. अगले प्रश्न पर जाएं\n6. पूरा होने पर सबमिट करें\n7. अपने परिणाम देखें और जरूरत हो तो रीट्राई करें!\n\n💡 टिप: स्कोर सुधारने के लिए क्विज़ रीट्राई कर सकते हैं!",
  },
  {
    question: "How do I use Setu Saarthi?",
    keywords: ['use setu saarthi', 'saarthi help', 'chatbot', 'सेतु सारथी कैसे', 'चैटबॉट'],
    en: "🤖 How to use Setu Saarthi:\n\n1. Open Setu Saarthi from the dashboard\n2. Type your question in the chat box\n3. Press send or hit Enter\n4. Get instant answers!\n\n**I can help with:**\n• Learning doubts & explanations\n• Study tips & techniques\n• Career guidance\n• App navigation\n\n🌐 Online = AI Tutor | 📴 Offline = Limited Help",
    hi: "🤖 सेतु सारथी का उपयोग कैसे करें:\n\n1. डैशबोर्ड से सेतु सारथी खोलें\n2. चैट बॉक्स में अपना प्रश्न टाइप करें\n3. सेंड दबाएं या Enter हिट करें\n4. तुरंत जवाब पाएं!\n\n**मैं इनमें मदद कर सकता हूं:**\n• पढ़ाई के संदेह और स्पष्टीकरण\n• पढ़ाई टिप्स और तकनीकें\n• करियर मार्गदर्शन\n• ऐप नेविगेशन\n\n🌐 ऑनलाइन = AI ट्यूटर | 📴 ऑफ़लाइन = सीमित मदद",
  },

  // === GREETINGS ===
  {
    question: "Hello / Greetings",
    keywords: ['hello', 'hi', 'hey', 'namaste', 'नमस्ते', 'हेलो', 'start', 'hii', 'good morning', 'good evening'],
    en: "🙏 Namaste! I'm **Setu Saarthi**, your learning companion.\n\nI can help you with:\n• 📚 Subject doubts & explanations\n• 💡 Study tips & techniques\n• 🎓 Career guidance\n• 📝 Quiz help\n• 🧭 App navigation\n\nWhat would you like to learn today?",
    hi: "🙏 नमस्ते! मैं **सेतु सारथी** हूं, आपका लर्निंग साथी।\n\nमैं इनमें मदद कर सकता हूं:\n• 📚 विषय संदेह और स्पष्टीकरण\n• 💡 पढ़ाई टिप्स और तकनीकें\n• 🎓 करियर मार्गदर्शन\n• 📝 क्विज़ मदद\n• 🧭 ऐप नेविगेशन\n\nआज आप क्या सीखना चाहते हैं?",
  },

  // === SAFETY - OUT OF SCOPE ===
  {
    question: "Out of scope questions",
    keywords: ['game', 'movie', 'song', 'boyfriend', 'girlfriend', 'love', 'dating', 'politics', 'religion', 'violence'],
    en: "🎓 I can help with learning and career guidance only.\n\nI'm designed to assist you with:\n• Educational topics\n• Study tips and exam preparation\n• Career guidance and planning\n• Learning app navigation\n\nPlease ask me about your studies or career!",
    hi: "🎓 मैं केवल पढ़ाई और करियर मार्गदर्शन में मदद कर सकता हूं।\n\nमैं इनमें सहायता के लिए डिज़ाइन किया गया हूं:\n• शैक्षिक विषय\n• पढ़ाई टिप्स और परीक्षा तैयारी\n• करियर मार्गदर्शन और योजना\n• लर्निंग ऐप नेविगेशन\n\nकृपया मुझसे अपनी पढ़ाई या करियर के बारे में पूछें!",
  },
];

// Legacy offline responses for backward compatibility
const OFFLINE_RESPONSES: Record<string, { keywords?: string[]; en: string; hi: string }> = {
  greetings: {
    keywords: ['hello', 'hi', 'hey', 'namaste', 'नमस्ते', 'हेलो', 'start'],
    en: FAQ_KNOWLEDGE_BASE.find(f => f.question === "Hello / Greetings")?.en || "Hello! I'm Setu Saarthi.",
    hi: FAQ_KNOWLEDGE_BASE.find(f => f.question === "Hello / Greetings")?.hi || "नमस्ते! मैं सेतु सारथी हूं।",
  },
  default: {
    en: "I can help with learning and career guidance.\n\nTry asking about:\n• Study tips\n• Career options\n• Quiz help\n• App navigation\n\n🌐 For detailed AI answers, connect to internet.",
    hi: "मैं पढ़ाई और करियर मार्गदर्शन में मदद कर सकता हूं।\n\nये पूछें:\n• पढ़ाई टिप्स\n• करियर विकल्प\n• क्विज़ मदद\n• ऐप नेविगेशन\n\n🌐 विस्तृत AI जवाबों के लिए इंटरनेट कनेक्ट करें।",
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

  // Generate offline response based on FAQ knowledge base with smart matching
  const generateOfflineResponse = useCallback((userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase().trim();
    
    // Score-based matching for better accuracy
    let bestMatch: FAQItem | null = null;
    let bestScore = 0;

    for (const faq of FAQ_KNOWLEDGE_BASE) {
      let score = 0;
      
      for (const keyword of faq.keywords) {
        const lowerKeyword = keyword.toLowerCase();
        
        // Exact word match gets higher score
        if (lowerMessage.includes(lowerKeyword)) {
          score += lowerKeyword.length; // Longer keywords get more weight
          
          // Bonus for exact word boundaries
          const regex = new RegExp(`\\b${lowerKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          if (regex.test(lowerMessage)) {
            score += 5;
          }
        }
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = faq;
      }
    }

    // If we found a good match, return it
    if (bestMatch && bestScore > 0) {
      return isHindi ? bestMatch.hi : bestMatch.en;
    }

    // Default response if no match found
    const defaultResponse = isHindi 
      ? "🔍 यह प्रश्न इंटरनेट या शिक्षक मार्गदर्शन की आवश्यकता है।\n\nमैं ऑफ़लाइन मोड में इनमें मदद कर सकता हूं:\n• पढ़ाई टिप्स\n• करियर मार्गदर्शन\n• क्विज़ मदद\n• ऐप नेविगेशन\n\n🌐 विस्तृत जवाबों के लिए इंटरनेट से कनेक्ट करें।"
      : "🔍 This question needs internet or teacher guidance.\n\nIn offline mode, I can help with:\n• Study tips\n• Career guidance\n• Quiz help\n• App navigation\n\n🌐 Connect to internet for detailed answers.";
    
    return defaultResponse;
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
