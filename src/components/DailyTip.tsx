import { Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';

// Predefined tips in both English and Hindi
const DAILY_TIPS = {
  en: [
    "Education is the most powerful weapon to change the world. — Nelson Mandela",
    "The beautiful thing about learning is that no one can take it away from you.",
    "Success is the sum of small efforts repeated day in and day out.",
    "Don't watch the clock; do what it does. Keep going.",
    "The expert in anything was once a beginner.",
    "Your education is a dress rehearsal for a life that is yours to lead.",
    "Learning is a treasure that will follow its owner everywhere.",
    "The more you learn, the more places you'll go. — Dr. Seuss",
    "Education is not preparation for life; education is life itself.",
    "A reader lives a thousand lives before he dies.",
    "Knowledge is power. Information is liberating.",
    "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.",
    "Study hard, for the well is deep, and our brains are shallow.",
    "Today a reader, tomorrow a leader.",
    "Education is the passport to the future, for tomorrow belongs to those who prepare for it today."
  ],
  hi: [
    "शिक्षा दुनिया को बदलने का सबसे शक्तिशाली हथियार है। — नेल्सन मंडेला",
    "सीखने की खूबसूरत बात यह है कि कोई भी इसे आपसे छीन नहीं सकता।",
    "सफलता छोटे-छोटे प्रयासों का योग है जो हर दिन दोहराए जाते हैं।",
    "घड़ी को मत देखो; वह जो करती है वही करो। चलते रहो।",
    "किसी भी क्षेत्र का विशेषज्ञ कभी शुरुआत में नौसिखिया था।",
    "आपकी शिक्षा उस जीवन का पूर्वाभ्यास है जो आपका है।",
    "शिक्षा एक खजाना है जो अपने मालिक का हर जगह साथ देता है।",
    "जितना अधिक आप सीखेंगे, उतनी अधिक जगहों पर जाएंगे।",
    "शिक्षा जीवन की तैयारी नहीं है; शिक्षा ही जीवन है।",
    "एक पाठक मरने से पहले हजार जीवन जीता है।",
    "ज्ञान शक्ति है। जानकारी मुक्ति है।",
    "सीखने की क्षमता एक उपहार है; सीखने की योग्यता एक कौशल है; सीखने की इच्छा एक विकल्प है।",
    "कड़ी मेहनत करो, क्योंकि कुआँ गहरा है और हमारा दिमाग उथला।",
    "आज का पाठक, कल का नेता।",
    "शिक्षा भविष्य का पासपोर्ट है, क्योंकि कल उन्हीं का है जो आज तैयारी करते हैं।"
  ]
};

/**
 * Get the tip index for today based on date
 * Same tip shows for the entire day
 */
const getTodayTipIndex = (): number => {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  // Use day of year to get consistent tip for the day
  return dayOfYear % DAILY_TIPS.en.length;
};

export function DailyTip() {
  const { language } = useLanguage();
  
  const tipIndex = getTodayTipIndex();
  const tips = language === 'hi' ? DAILY_TIPS.hi : DAILY_TIPS.en;
  const todayTip = tips[tipIndex];

  return (
    <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-amber-200 dark:border-amber-800 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/50 shrink-0">
            <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-amber-800 dark:text-amber-200 text-sm mb-1">
              {language === 'hi' ? '💡 आज की टिप' : '💡 Daily Tip'}
            </h3>
            <p className="text-amber-700 dark:text-amber-300 text-sm leading-relaxed italic">
              "{todayTip}"
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
