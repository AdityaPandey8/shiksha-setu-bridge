import { useState, useEffect, useCallback } from 'react';

/**
 * LANGUAGE STORAGE KEY
 * Language preference is stored in localStorage for offline persistence.
 * Works without internet and persists across sessions.
 */
const LANGUAGE_STORAGE_KEY = 'preferredLanguage';

/**
 * SUPPORTED LANGUAGES
 * 'en' - English
 * 'hi' - Hindi (हिंदी)
 */
export type Language = 'en' | 'hi';

/**
 * TRANSLATIONS OBJECT
 * Central translation object for all UI text.
 * Add new translations here as the app grows.
 */
export const translations = {
  en: {
    // Home Page
    selectLanguage: "Select Language",
    bridgeToEducation: "Bridge to Education",
    offlineFirstLearning: "Offline-First Learning",
    heroDescription: "Ensuring uninterrupted learning for students in Kashmir, Ladakh, North-East, tribal areas, and border villages — even without internet connectivity.",
    uninterruptedLearning: "uninterrupted learning",
    evenWithoutInternet: " even without internet connectivity",
    studentLogin: "Student Login",
    teacherLogin: "Teacher Login",
    whyShikshaSetu: "Why",
    worksOffline: "Works Offline",
    worksOfflineDesc: "Download lessons once and access them anytime, anywhere — no internet required. Perfect for remote areas.",
    hindiEnglish: "Hindi & English",
    hindiEnglishDesc: "Content available in both Hindi and English to support students from diverse linguistic backgrounds.",
    classes6to10: "Classes 6-10",
    classes6to10Desc: "Curated educational content aligned with the curriculum for middle and high school students.",
    howItWorks: "How It",
    works: "Works",
    connectOnline: "Connect Online",
    connectOnlineDesc: "Download lessons and quizzes when you have internet access",
    learnOffline: "Learn Offline",
    learnOfflineDesc: "Study anytime, even without connectivity",
    syncProgress: "Sync Progress",
    syncProgressDesc: "Your progress syncs automatically when you're back online",
    footerTagline: "Shiksha Setu — Bridging the Digital Divide in Education",
    builtForStudents: "Built for students in remote India 🇮🇳",

    // Auth Page
    login: "Login",
    signUp: "Sign Up",
    createAccount: "Create Account",
    welcomeBack: "Welcome Back",
    email: "Email",
    password: "Password",
    fullName: "Full Name",
    selectClass: "Select Class",
    enterEmail: "Enter your email",
    enterPassword: "Enter your password",
    enterFullName: "Enter your full name",
    forgotPassword: "Forgot Password?",
    resetPassword: "Reset Password",
    sendResetLink: "Send Reset Link",
    backToLogin: "Back to Login",
    backToHome: "Back to Home",
    dontHaveAccount: "Don't have an account? Sign up",
    alreadyHaveAccount: "Already have an account? Login",
    useDemoCredentials: "Use Demo Credentials",
    student: "Student",
    teacher: "Teacher",
    loginToAccount: "Login to your {role} account",
    signUpAs: "Sign up as a {role}",
    enterEmailForReset: "Enter your email to receive a password reset link",
    class6: "Class 6",
    class7: "Class 7",
    class8: "Class 8",
    class9: "Class 9",
    class10: "Class 10",

    // Student Dashboard
    studentLearningApp: "Student Learning App",
    welcome: "Welcome",
    logout: "Logout",
    yourProgress: "Your Progress",
    completed: "completed",
    complete: "complete",
    filters: "Filters",
    allClasses: "All Classes",
    allLanguages: "All Languages",
    lessons: "Lessons",
    quizzes: "Quizzes",
    noContentAvailable: "No content available for the selected filters.",
    noQuizzesAvailable: "No quizzes available for the selected filters.",
    offlineMode: "Offline Mode",
    loadingCachedContent: "Loading cached content. Your progress will sync when online.",
    progressSaved: "Progress Saved!",
    progressRecorded: "Your progress has been recorded.",
    willSyncWhenOnline: "Will sync when online.",
    synced: "Synced!",
    offlineProgressSaved: "Your offline progress has been saved.",

    // Teacher Dashboard
    teacherDashboard: "Teacher Dashboard",
    manageContentQuizzesProgress: "Manage content, quizzes, and track student progress",
    totalContent: "Total Content",
    totalQuizzes: "Total Quizzes",
    totalStudents: "Total Students",
    content: "Content",
    students: "Students",
    learningContent: "Learning Content",
    addContent: "Add Content",
    addNewContent: "Add New Content",
    createLearningMaterial: "Create learning material for students",
    title: "Title",
    description: "Description",
    contentUrl: "Content URL",
    contentType: "Content Type",
    language: "Language",
    class: "Class",
    hindi: "Hindi",
    english: "English",
    video: "Video",
    article: "Article",
    pdf: "PDF",
    adding: "Adding...",
    addQuiz: "Add Quiz",
    addNewQuiz: "Add New Quiz",
    createQuiz: "Create a quiz for students",
    question: "Question",
    enterQuestion: "Enter the question",
    options: "Options",
    correctAnswer: "Correct Answer",
    selectCorrectOption: "Select correct option",
    contentAdded: "Content Added!",
    contentAddedDesc: "The content has been added successfully.",
    quizAdded: "Quiz Added!",
    quizAddedDesc: "The quiz has been added successfully.",
    deleteContent: "Delete Content",
    deleteContentConfirm: "Are you sure you want to delete this content?",
    deleteQuiz: "Delete Quiz",
    deleteQuizConfirm: "Are you sure you want to delete this quiz?",
    cancel: "Cancel",
    delete: "Delete",
    noContent: "No Content",
    noContentDesc: "No content has been added yet.",
    noQuizzes: "No Quizzes",
    noQuizzesDesc: "No quizzes have been added yet.",
    studentProgress: "Student Progress",
    noStudents: "No Students",
    noStudentsDesc: "No students have registered yet.",
    lessonsCompleted: "lessons completed",
    quizAccuracy: "quiz accuracy",
    completedLessons: "Completed Lessons",
    quizResponses: "Quiz Responses",
    noLessonsCompleted: "No lessons completed yet",
    noQuizAttempts: "No quiz attempts yet",
    correct: "Correct",
    incorrect: "Incorrect",

    // Career Guidance
    careerGuidance: "Career Guidance",
    exploreCareerPaths: "Explore your future career paths – works offline",
    offlineReady: "Offline Ready",
    offlineCareerMessage: "This career guidance works without internet. All data is stored locally on your device.",
    selectStream: "Select a stream to explore:",
    backToStreams: "← Back to streams",
    mathematics: "Mathematics",
    biology: "Biology",
    arts: "Arts",
    commerce: "Commerce",
    competitiveExams: "Competitive Exams",
    courses: "Courses",
    jobOpportunities: "Job Opportunities",
    popularExams: "Popular entrance exams for {stream} students",
    higherEducation: "Higher education options after {stream}",
    careerPaths: "Career paths for {stream} graduates",

    // Common
    online: "Online",
    offline: "Offline",
    offlineModeActive: "Offline Mode Active",
    loading: "Loading...",
    error: "Error",
    success: "Success",
  },
  hi: {
    // Home Page
    selectLanguage: "भाषा चुनें",
    bridgeToEducation: "शिक्षा का सेतु",
    offlineFirstLearning: "ऑफलाइन-प्राथमिक शिक्षा",
    heroDescription: "कश्मीर, लद्दाख, पूर्वोत्तर, आदिवासी क्षेत्रों और सीमावर्ती गांवों के छात्रों के लिए निर्बाध शिक्षा सुनिश्चित करना — इंटरनेट कनेक्टिविटी के बिना भी।",
    uninterruptedLearning: "निर्बाध शिक्षा",
    evenWithoutInternet: " इंटरनेट कनेक्टिविटी के बिना भी",
    studentLogin: "छात्र लॉगिन",
    teacherLogin: "शिक्षक लॉगिन",
    whyShikshaSetu: "क्यों",
    worksOffline: "ऑफलाइन काम करता है",
    worksOfflineDesc: "एक बार पाठ डाउनलोड करें और कभी भी, कहीं भी एक्सेस करें — इंटरनेट की आवश्यकता नहीं। दूरदराज के इलाकों के लिए उपयुक्त।",
    hindiEnglish: "हिंदी और अंग्रेज़ी",
    hindiEnglishDesc: "विविध भाषाई पृष्ठभूमि के छात्रों के लिए हिंदी और अंग्रेज़ी दोनों में सामग्री उपलब्ध।",
    classes6to10: "कक्षा 6-10",
    classes6to10Desc: "मध्य और उच्च विद्यालय के छात्रों के लिए पाठ्यक्रम के अनुसार शैक्षिक सामग्री।",
    howItWorks: "यह कैसे",
    works: "काम करता है",
    connectOnline: "ऑनलाइन जुड़ें",
    connectOnlineDesc: "जब इंटरनेट उपलब्ध हो तब पाठ और क्विज़ डाउनलोड करें",
    learnOffline: "ऑफलाइन पढ़ें",
    learnOfflineDesc: "बिना कनेक्टिविटी के भी कभी भी पढ़ाई करें",
    syncProgress: "प्रगति सिंक करें",
    syncProgressDesc: "जब आप वापस ऑनलाइन आते हैं तो आपकी प्रगति स्वचालित रूप से सिंक होती है",
    footerTagline: "शिक्षा सेतु — शिक्षा में डिजिटल विभाजन को पाटना",
    builtForStudents: "भारत के दूरस्थ छात्रों के लिए निर्मित 🇮🇳",

    // Auth Page
    login: "लॉगिन",
    signUp: "साइन अप",
    createAccount: "खाता बनाएं",
    welcomeBack: "वापसी पर स्वागत है",
    email: "ईमेल",
    password: "पासवर्ड",
    fullName: "पूरा नाम",
    selectClass: "कक्षा चुनें",
    enterEmail: "अपना ईमेल दर्ज करें",
    enterPassword: "अपना पासवर्ड दर्ज करें",
    enterFullName: "अपना पूरा नाम दर्ज करें",
    forgotPassword: "पासवर्ड भूल गए?",
    resetPassword: "पासवर्ड रीसेट करें",
    sendResetLink: "रीसेट लिंक भेजें",
    backToLogin: "लॉगिन पर वापस जाएं",
    backToHome: "होम पर वापस जाएं",
    dontHaveAccount: "खाता नहीं है? साइन अप करें",
    alreadyHaveAccount: "पहले से खाता है? लॉगिन करें",
    useDemoCredentials: "डेमो क्रेडेंशियल्स का उपयोग करें",
    student: "छात्र",
    teacher: "शिक्षक",
    loginToAccount: "अपने {role} खाते में लॉगिन करें",
    signUpAs: "{role} के रूप में साइन अप करें",
    enterEmailForReset: "पासवर्ड रीसेट लिंक प्राप्त करने के लिए अपना ईमेल दर्ज करें",
    class6: "कक्षा 6",
    class7: "कक्षा 7",
    class8: "कक्षा 8",
    class9: "कक्षा 9",
    class10: "कक्षा 10",

    // Student Dashboard
    studentLearningApp: "छात्र शिक्षण ऐप",
    welcome: "स्वागत है",
    logout: "लॉगआउट",
    yourProgress: "आपकी प्रगति",
    completed: "पूर्ण",
    complete: "पूर्ण",
    filters: "फ़िल्टर",
    allClasses: "सभी कक्षाएं",
    allLanguages: "सभी भाषाएं",
    lessons: "पाठ",
    quizzes: "क्विज़",
    noContentAvailable: "चयनित फ़िल्टर के लिए कोई सामग्री उपलब्ध नहीं है।",
    noQuizzesAvailable: "चयनित फ़िल्टर के लिए कोई क्विज़ उपलब्ध नहीं है।",
    offlineMode: "ऑफलाइन मोड",
    loadingCachedContent: "कैश्ड सामग्री लोड हो रही है। ऑनलाइन होने पर आपकी प्रगति सिंक होगी।",
    progressSaved: "प्रगति सहेजी गई!",
    progressRecorded: "आपकी प्रगति रिकॉर्ड की गई है।",
    willSyncWhenOnline: "ऑनलाइन होने पर सिंक होगी।",
    synced: "सिंक हो गया!",
    offlineProgressSaved: "आपकी ऑफलाइन प्रगति सहेज ली गई है।",

    // Teacher Dashboard
    teacherDashboard: "शिक्षक डैशबोर्ड",
    manageContentQuizzesProgress: "सामग्री, क्विज़ और छात्र प्रगति प्रबंधित करें",
    totalContent: "कुल सामग्री",
    totalQuizzes: "कुल क्विज़",
    totalStudents: "कुल छात्र",
    content: "सामग्री",
    students: "छात्र",
    learningContent: "शिक्षण सामग्री",
    addContent: "सामग्री जोड़ें",
    addNewContent: "नई सामग्री जोड़ें",
    createLearningMaterial: "छात्रों के लिए शिक्षण सामग्री बनाएं",
    title: "शीर्षक",
    description: "विवरण",
    contentUrl: "सामग्री URL",
    contentType: "सामग्री प्रकार",
    language: "भाषा",
    class: "कक्षा",
    hindi: "हिंदी",
    english: "अंग्रेज़ी",
    video: "वीडियो",
    article: "लेख",
    pdf: "PDF",
    adding: "जोड़ रहे हैं...",
    addQuiz: "क्विज़ जोड़ें",
    addNewQuiz: "नया क्विज़ जोड़ें",
    createQuiz: "छात्रों के लिए क्विज़ बनाएं",
    question: "प्रश्न",
    enterQuestion: "प्रश्न दर्ज करें",
    options: "विकल्प",
    correctAnswer: "सही उत्तर",
    selectCorrectOption: "सही विकल्प चुनें",
    contentAdded: "सामग्री जोड़ी गई!",
    contentAddedDesc: "सामग्री सफलतापूर्वक जोड़ी गई है।",
    quizAdded: "क्विज़ जोड़ा गया!",
    quizAddedDesc: "क्विज़ सफलतापूर्वक जोड़ा गया है।",
    deleteContent: "सामग्री हटाएं",
    deleteContentConfirm: "क्या आप वाकई इस सामग्री को हटाना चाहते हैं?",
    deleteQuiz: "क्विज़ हटाएं",
    deleteQuizConfirm: "क्या आप वाकई इस क्विज़ को हटाना चाहते हैं?",
    cancel: "रद्द करें",
    delete: "हटाएं",
    noContent: "कोई सामग्री नहीं",
    noContentDesc: "अभी तक कोई सामग्री नहीं जोड़ी गई है।",
    noQuizzes: "कोई क्विज़ नहीं",
    noQuizzesDesc: "अभी तक कोई क्विज़ नहीं जोड़ा गया है।",
    studentProgress: "छात्र प्रगति",
    noStudents: "कोई छात्र नहीं",
    noStudentsDesc: "अभी तक कोई छात्र पंजीकृत नहीं हुआ है।",
    lessonsCompleted: "पाठ पूर्ण",
    quizAccuracy: "क्विज़ सटीकता",
    completedLessons: "पूर्ण पाठ",
    quizResponses: "क्विज़ प्रतिक्रियाएं",
    noLessonsCompleted: "अभी तक कोई पाठ पूर्ण नहीं",
    noQuizAttempts: "अभी तक कोई क्विज़ प्रयास नहीं",
    correct: "सही",
    incorrect: "गलत",

    // Career Guidance
    careerGuidance: "करियर मार्गदर्शन",
    exploreCareerPaths: "अपने भविष्य के करियर पथों का अन्वेषण करें – ऑफलाइन काम करता है",
    offlineReady: "ऑफलाइन तैयार",
    offlineCareerMessage: "यह करियर मार्गदर्शन इंटरनेट के बिना काम करता है। सारा डेटा आपके डिवाइस पर स्थानीय रूप से संग्रहीत है।",
    selectStream: "अन्वेषण के लिए एक स्ट्रीम चुनें:",
    backToStreams: "← स्ट्रीम्स पर वापस जाएं",
    mathematics: "गणित",
    biology: "जीव विज्ञान",
    arts: "कला",
    commerce: "वाणिज्य",
    competitiveExams: "प्रतियोगी परीक्षाएं",
    courses: "पाठ्यक्रम",
    jobOpportunities: "नौकरी के अवसर",
    popularExams: "{stream} छात्रों के लिए लोकप्रिय प्रवेश परीक्षाएं",
    higherEducation: "{stream} के बाद उच्च शिक्षा विकल्प",
    careerPaths: "{stream} स्नातकों के लिए करियर पथ",

    // Common
    online: "ऑनलाइन",
    offline: "ऑफलाइन",
    offlineModeActive: "ऑफलाइन मोड सक्रिय",
    loading: "लोड हो रहा है...",
    error: "त्रुटि",
    success: "सफल",
  }
};

/**
 * GET CURRENT LANGUAGE
 * Utility function to retrieve the current language from localStorage.
 * Defaults to English if no language is set.
 */
export function getCurrentLanguage(): Language {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'en' || stored === 'hi') {
      return stored;
    }
    return 'en'; // Default to English
  } catch {
    return 'en';
  }
}

/**
 * SET LANGUAGE
 * Utility function to save language preference to localStorage.
 */
export function setStoredLanguage(lang: Language): void {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch (error) {
    console.error('Error saving language preference:', error);
  }
}

/**
 * USE LANGUAGE HOOK
 * React hook for managing language state across the application.
 * - Loads language from localStorage on mount
 * - Saves language to localStorage on change
 * - Works offline and persists across sessions
 */
export function useLanguage() {
  const [language, setLanguageState] = useState<Language>(() => getCurrentLanguage());

  // Apply language on mount
  useEffect(() => {
    /**
     * WHY THIS WORKS OFFLINE:
     * 1. Language preference is stored in localStorage
     * 2. On page load, we read from localStorage (no network call)
     * 3. Changes are saved immediately to localStorage
     * 4. Works in airplane mode
     */
    const storedLang = getCurrentLanguage();
    setLanguageState(storedLang);
  }, []);

  // Set language and save to localStorage
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    setStoredLanguage(lang);
  }, []);

  // Get translation for a key
  const t = useCallback((key: keyof typeof translations.en, replacements?: Record<string, string>): string => {
    let text = translations[language][key] || translations.en[key] || key;
    
    // Handle replacements like {role}
    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        text = text.replace(`{${placeholder}}`, value);
      });
    }
    
    return text;
  }, [language]);

  return {
    language,
    setLanguage,
    t,
    isHindi: language === 'hi',
    isEnglish: language === 'en',
  };
}

export type { Language as LanguageType };
