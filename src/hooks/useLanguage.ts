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
    mainTagline: "Learn Anywhere. Focus Everywhere.",
    subTagline: "Internet optional. Learning uninterrupted.",
    offlineFirstLearning: "Offline-First & Focus-First Learning",
    heroDescription: "Shiksha Setu empowers students across rural and urban India to study without distractions. Even with good internet, students can switch to offline mode and focus on learning — no social media, no notifications, no interruptions.",
    secondaryValueStatement: "Designed for low-connectivity regions and high-distraction environments alike.",
    focusModeExplanation: "Students can download content once, turn off the internet, and study peacefully.",
    uninterruptedLearning: "uninterrupted learning",
    evenWithoutInternet: " even without internet connectivity",
    studentLogin: "Student Login",
    teacherLogin: "Teacher Login",
    whyShikshaSetu: "Why",
    worksOffline: "Works Offline",
    worksOfflineDesc: "Download lessons once and access them anytime, anywhere — no internet required. Perfect for remote areas.",
    focusMode: "Focus Mode",
    focusModeDesc: "Turn off distractions. Study in peace without social media notifications or interruptions.",
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
    footerTagline: "Shiksha Setu — Not just offline, but distraction-free learning",
    builtForStudents: "Built for every student in India 🇮🇳",

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
    totalEbooks: "Total E-Books",
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

    // E-Book Management
    ebooks: "E-Books",
    myEbooks: "My E-Books",
    myEbooksDesc: "Download your textbooks and read offline",
    manageEbooksDesc: "Manage curriculum E-Books and chapters",
    addEbook: "Add E-Book",
    addNewEbook: "Add New E-Book",
    editEbook: "Edit E-Book",
    updateEbook: "Update E-Book",
    deleteEbook: "Delete E-Book",
    deleteEbookConfirm: "Are you sure you want to delete this E-Book? All chapters will also be deleted.",
    createEbookMaterial: "Create curriculum material for students",
    bookTitle: "Book Title",
    enterBookTitle: "Enter the book title",
    enterDescription: "Enter description",
    offlineDownloadEnabled: "Offline Download Enabled",
    offlineEnabled: "Offline Enabled",
    ebookAdded: "E-Book Added!",
    ebookAddedDesc: "The E-Book has been added successfully.",
    ebookUpdated: "E-Book Updated!",
    ebookUpdatedDesc: "The E-Book has been updated successfully.",
    ebookDeleted: "E-Book Deleted",
    ebookDeletedDesc: "The E-Book has been deleted successfully.",
    noEbooksDesc: "No E-Books have been added yet.",
    noEbooksAvailable: "No E-Books available.",
    saving: "Saving...",

    // Chapter Management
    chapters: "chapters",
    addChapter: "Add Chapter",
    addNewChapter: "Add New Chapter",
    editChapter: "Edit Chapter",
    updateChapter: "Update Chapter",
    deleteChapter: "Delete Chapter",
    deleteChapterConfirm: "Are you sure you want to delete this chapter?",
    chapterTitle: "Chapter Title",
    enterChapterTitle: "Enter chapter title",
    chapterContent: "Chapter Content",
    enterChapterContent: "Enter chapter content (HTML/Markdown/Plain text)",
    activitiesQuestions: "Activities / Practice Questions",
    enterActivities: "Enter activities or practice questions",
    onePerLine: "One activity per line",
    supportsMarkdown: "Supports HTML, Markdown, and plain text",
    chapterOfflineNote: "Chapters are automatically offline-ready",
    chapterAdded: "Chapter Added!",
    chapterAddedDesc: "The chapter has been added successfully.",
    chapterUpdated: "Chapter Updated!",
    chapterUpdatedDesc: "The chapter has been updated successfully.",
    chapterDeleted: "Chapter Deleted",
    chapterDeletedDesc: "The chapter has been deleted successfully.",
    noChaptersYet: "No chapters added yet",
    noChaptersAvailable: "No chapters available in this E-Book.",
    activities: "activities",
    edit: "Edit",

    // E-Book Viewer
    download: "Download",
    downloadOnceUseAnytime: "Download once, use anytime",
    ebookDownloaded: "E-Book Downloaded!",
    ebookAvailableOffline: "This E-Book is now available offline.",
    availableOffline: "Available Offline",
    back: "Back",
    markComplete: "Mark Complete",
    chapterCompleted: "Chapter Completed!",
    practiceActivities: "Practice Activities",
    progress: "Progress",

    // Learning Content Section
    learningResources: "Learning Resources",
    learningResourcesDesc: "Videos, PDFs, Notes and more",
    linkToChapter: "Link to Chapter",
    selectChapter: "Select Chapter (Optional)",
    noChapterLink: "No Link",
    relatedContent: "Related Content",

    // Student Learning Hub
    chooseLearningPath: "Choose Your Learning Path",
    hubEbooks: "E-Books",
    hubEbooksDesc: "Read chapters offline",
    hubContent: "Learning Content",
    hubContentDesc: "Videos, notes & PDFs",
    hubQuizzes: "Quizzes",
    hubQuizzesDesc: "Practice & self-evaluate",
    hubCareer: "Career Guidance",
    hubCareerDesc: "Explore future paths",
    downloadFirst: "Download First",

    // Offline/Online Status
    syncing: "Syncing...",
    syncingData: "Syncing your data...",
    onlineFull: "Online – Full Features",
    offlineLimited: "Offline – Limited",
    offlineBannerMessage: "Offline Mode – Your progress will sync when internet returns",
    syncedSuccessfully: "Synced Successfully",

    // Chatbot
    offlineAssistant: "Offline Assistant (Limited)",
    aiAssistant: "Shiksha AI Assistant",
    typeQuestion: "Type your question...",

    // Offline Utilities
    bookmarks: "Bookmarks",
    doubtNotes: "Doubt Notes",
    flashcards: "Flashcards",
    dailyTip: "Daily Tip",
    addBookmark: "Add Bookmark",
    removeBookmark: "Remove Bookmark",
    addDoubt: "Add Doubt",
    resolveDoubt: "Resolve Doubt",
    addFlashcard: "Add Flashcard",
    noBookmarks: "No bookmarks yet",
    noDoubts: "No doubts saved",
    noFlashcards: "No flashcards created",
  },
  hi: {
    // Home Page
    selectLanguage: "भाषा चुनें",
    mainTagline: "कहीं भी सीखें। हर जगह ध्यान दें।",
    subTagline: "इंटरनेट वैकल्पिक। शिक्षा निर्बाध।",
    offlineFirstLearning: "ऑफलाइन-फर्स्ट और फोकस-फर्स्ट लर्निंग",
    heroDescription: "शिक्षा सेतु ग्रामीण और शहरी भारत के छात्रों को बिना विकर्षण के पढ़ाई करने में सक्षम बनाता है। अच्छे इंटरनेट के साथ भी, छात्र ऑफलाइन मोड में जाकर पढ़ाई पर ध्यान दे सकते हैं — कोई सोशल मीडिया नहीं, कोई नोटिफिकेशन नहीं, कोई बाधा नहीं।",
    secondaryValueStatement: "कम कनेक्टिविटी वाले क्षेत्रों और उच्च-विकर्षण वातावरण दोनों के लिए डिज़ाइन किया गया।",
    focusModeExplanation: "छात्र एक बार सामग्री डाउनलोड कर सकते हैं, इंटरनेट बंद कर सकते हैं, और शांति से पढ़ाई कर सकते हैं।",
    uninterruptedLearning: "निर्बाध शिक्षा",
    evenWithoutInternet: " इंटरनेट कनेक्टिविटी के बिना भी",
    studentLogin: "छात्र लॉगिन",
    teacherLogin: "शिक्षक लॉगिन",
    whyShikshaSetu: "क्यों",
    worksOffline: "ऑफलाइन काम करता है",
    worksOfflineDesc: "एक बार पाठ डाउनलोड करें और कभी भी, कहीं भी एक्सेस करें — इंटरनेट की आवश्यकता नहीं। दूरदराज के इलाकों के लिए उपयुक्त।",
    focusMode: "फोकस मोड",
    focusModeDesc: "विकर्षण बंद करें। सोशल मीडिया नोटिफिकेशन या बाधाओं के बिना शांति से पढ़ें।",
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
    footerTagline: "शिक्षा सेतु — सिर्फ ऑफलाइन नहीं, बल्कि विकर्षण-मुक्त शिक्षा",
    builtForStudents: "भारत के हर छात्र के लिए निर्मित 🇮🇳",

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
    totalEbooks: "कुल ई-पुस्तकें",
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

    // E-Book Management (Hindi)
    ebooks: "ई-पुस्तकें",
    myEbooks: "मेरी ई-पुस्तकें",
    myEbooksDesc: "अपनी पाठ्यपुस्तकें डाउनलोड करें और ऑफलाइन पढ़ें",
    manageEbooksDesc: "पाठ्यक्रम ई-पुस्तकें और अध्याय प्रबंधित करें",
    addEbook: "ई-पुस्तक जोड़ें",
    addNewEbook: "नई ई-पुस्तक जोड़ें",
    editEbook: "ई-पुस्तक संपादित करें",
    updateEbook: "ई-पुस्तक अपडेट करें",
    deleteEbook: "ई-पुस्तक हटाएं",
    deleteEbookConfirm: "क्या आप वाकई इस ई-पुस्तक को हटाना चाहते हैं? सभी अध्याय भी हटा दिए जाएंगे।",
    createEbookMaterial: "छात्रों के लिए पाठ्यक्रम सामग्री बनाएं",
    bookTitle: "पुस्तक शीर्षक",
    enterBookTitle: "पुस्तक का शीर्षक दर्ज करें",
    enterDescription: "विवरण दर्ज करें",
    offlineDownloadEnabled: "ऑफलाइन डाउनलोड सक्षम",
    offlineEnabled: "ऑफलाइन सक्षम",
    ebookAdded: "ई-पुस्तक जोड़ी गई!",
    ebookAddedDesc: "ई-पुस्तक सफलतापूर्वक जोड़ी गई है।",
    ebookUpdated: "ई-पुस्तक अपडेट की गई!",
    ebookUpdatedDesc: "ई-पुस्तक सफलतापूर्वक अपडेट की गई है।",
    ebookDeleted: "ई-पुस्तक हटाई गई",
    ebookDeletedDesc: "ई-पुस्तक सफलतापूर्वक हटाई गई है।",
    noEbooksDesc: "अभी तक कोई ई-पुस्तक नहीं जोड़ी गई है।",
    noEbooksAvailable: "कोई ई-पुस्तक उपलब्ध नहीं है।",
    saving: "सहेज रहे हैं...",

    // Chapter Management (Hindi)
    chapters: "अध्याय",
    addChapter: "अध्याय जोड़ें",
    addNewChapter: "नया अध्याय जोड़ें",
    editChapter: "अध्याय संपादित करें",
    updateChapter: "अध्याय अपडेट करें",
    deleteChapter: "अध्याय हटाएं",
    deleteChapterConfirm: "क्या आप वाकई इस अध्याय को हटाना चाहते हैं?",
    chapterTitle: "अध्याय शीर्षक",
    enterChapterTitle: "अध्याय का शीर्षक दर्ज करें",
    chapterContent: "अध्याय सामग्री",
    enterChapterContent: "अध्याय सामग्री दर्ज करें (HTML/Markdown/सादा पाठ)",
    activitiesQuestions: "गतिविधियां / अभ्यास प्रश्न",
    enterActivities: "गतिविधियां या अभ्यास प्रश्न दर्ज करें",
    onePerLine: "प्रति पंक्ति एक गतिविधि",
    supportsMarkdown: "HTML, Markdown और सादा पाठ का समर्थन करता है",
    chapterOfflineNote: "अध्याय स्वचालित रूप से ऑफलाइन-तैयार होते हैं",
    chapterAdded: "अध्याय जोड़ा गया!",
    chapterAddedDesc: "अध्याय सफलतापूर्वक जोड़ा गया है।",
    chapterUpdated: "अध्याय अपडेट किया गया!",
    chapterUpdatedDesc: "अध्याय सफलतापूर्वक अपडेट किया गया है।",
    chapterDeleted: "अध्याय हटाया गया",
    chapterDeletedDesc: "अध्याय सफलतापूर्वक हटाया गया है।",
    noChaptersYet: "अभी तक कोई अध्याय नहीं जोड़ा गया",
    noChaptersAvailable: "इस ई-पुस्तक में कोई अध्याय उपलब्ध नहीं है।",
    activities: "गतिविधियां",
    edit: "संपादित करें",

    // E-Book Viewer (Hindi)
    download: "डाउनलोड करें",
    downloadOnceUseAnytime: "एक बार डाउनलोड करें, कभी भी उपयोग करें",
    ebookDownloaded: "ई-पुस्तक डाउनलोड की गई!",
    ebookAvailableOffline: "यह ई-पुस्तक अब ऑफलाइन उपलब्ध है।",
    availableOffline: "ऑफलाइन उपलब्ध",
    back: "वापस",
    markComplete: "पूर्ण चिह्नित करें",
    chapterCompleted: "अध्याय पूर्ण!",
    practiceActivities: "अभ्यास गतिविधियां",
    progress: "प्रगति",

    // Learning Content Section (Hindi)
    learningResources: "शिक्षण संसाधन",
    learningResourcesDesc: "वीडियो, PDF, नोट्स और अधिक",
    linkToChapter: "अध्याय से लिंक करें",
    selectChapter: "अध्याय चुनें (वैकल्पिक)",
    noChapterLink: "कोई लिंक नहीं",
    relatedContent: "संबंधित सामग्री",

    // Student Learning Hub (Hindi)
    chooseLearningPath: "अपना सीखने का मार्ग चुनें",
    hubEbooks: "ई-पुस्तकें",
    hubEbooksDesc: "अध्याय ऑफलाइन पढ़ें",
    hubContent: "शिक्षण सामग्री",
    hubContentDesc: "वीडियो, नोट्स और PDF",
    hubQuizzes: "क्विज़",
    hubQuizzesDesc: "अभ्यास और आत्म-मूल्यांकन",
    hubCareer: "करियर मार्गदर्शन",
    hubCareerDesc: "भविष्य के मार्ग जानें",
    downloadFirst: "पहले डाउनलोड करें",

    // Offline/Online Status (Hindi)
    syncing: "सिंक हो रहा है...",
    syncingData: "आपका डेटा सिंक हो रहा है...",
    onlineFull: "ऑनलाइन – पूर्ण सुविधाएं",
    offlineLimited: "ऑफलाइन – सीमित",
    offlineBannerMessage: "ऑफलाइन मोड – इंटरनेट वापस आने पर प्रगति सिंक होगी",
    syncedSuccessfully: "सफलतापूर्वक सिंक हो गया",

    // Chatbot (Hindi)
    offlineAssistant: "ऑफलाइन असिस्टेंट (सीमित)",
    aiAssistant: "शिक्षा AI असिस्टेंट",
    typeQuestion: "अपना प्रश्न लिखें...",

    // Offline Utilities (Hindi)
    bookmarks: "बुकमार्क",
    doubtNotes: "संदेह नोट्स",
    flashcards: "फ्लैशकार्ड",
    dailyTip: "दैनिक सुझाव",
    addBookmark: "बुकमार्क जोड़ें",
    removeBookmark: "बुकमार्क हटाएं",
    addDoubt: "संदेह जोड़ें",
    resolveDoubt: "संदेह हल करें",
    addFlashcard: "फ्लैशकार्ड जोड़ें",
    noBookmarks: "अभी तक कोई बुकमार्क नहीं",
    noDoubts: "कोई संदेह सहेजा नहीं गया",
    noFlashcards: "कोई फ्लैशकार्ड नहीं बनाया गया",
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
