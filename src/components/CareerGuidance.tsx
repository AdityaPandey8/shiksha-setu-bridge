import { useState, useEffect } from 'react';
import { Target, BookOpen, GraduationCap, Briefcase, Wifi, Calculator, FlaskConical, Palette, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * CAREER GUIDANCE DATA STRUCTURE
 * This data is preloaded and stored in localStorage for offline access.
 * The feature works completely offline - no API calls required during usage.
 */
const CAREER_DATA = {
  careerGuidance: [
    {
      stream: "Mathematics",
      icon: "Calculator",
      exams: ["JEE (Joint Entrance Examination)", "NDA (National Defence Academy)", "CUET (Common University Entrance Test)", "Mathematical Olympiads", "ISI Entrance", "KVPY"],
      courses: ["B.Tech (Engineering)", "B.Sc Mathematics", "Data Science", "Statistics", "Actuarial Science", "B.Sc Physics"],
      jobs: ["Software Engineer", "Data Analyst", "Software Developer", "Research Scientist", "Actuary", "Financial Analyst", "Machine Learning Engineer"]
    },
    {
      stream: "Biology",
      icon: "FlaskConical",
      exams: ["NEET (National Eligibility Entrance Test)", "CUET", "AIIMS Entrance", "JIPMER", "AFMC", "BHU Medical Entrance"],
      courses: ["MBBS (Medicine)", "BDS (Dental)", "Biotechnology", "B.Sc Nursing", "BAMS (Ayurveda)", "Pharmacy", "Veterinary Science"],
      jobs: ["Doctor", "Dentist", "Lab Technician", "Research Scientist", "Pharmacist", "Nurse", "Medical Officer", "Biotechnologist"]
    },
    {
      stream: "Arts",
      icon: "Palette",
      exams: ["UPSC (Civil Services)", "CUET", "CLAT (Law)", "NIFT (Design)", "NID DAT", "Mass Communication Entrance"],
      courses: ["BA (Bachelor of Arts)", "LLB (Law)", "Journalism", "Psychology", "Fine Arts", "Political Science", "Sociology", "History"],
      jobs: ["Civil Servant (IAS/IPS)", "Lawyer", "Journalist", "Teacher", "Psychologist", "Social Worker", "Museum Curator", "NGO Worker"]
    },
    {
      stream: "Commerce",
      icon: "TrendingUp",
      exams: ["CA Foundation", "CS Foundation", "CMA Foundation", "Banking Exams (IBPS/SBI)", "SSC CGL", "CAT (MBA Entrance)"],
      courses: ["B.Com (Bachelor of Commerce)", "BBA (Business Administration)", "MBA", "Finance", "Chartered Accountancy", "Economics", "Banking & Insurance"],
      jobs: ["Chartered Accountant", "Bank Manager", "Business Analyst", "Entrepreneur", "Financial Advisor", "Stock Broker", "Tax Consultant", "HR Manager"]
    }
  ]
};

// Local storage key for career data
const CAREER_STORAGE_KEY = 'shiksha_setu_career_data';

/**
 * OFFLINE STORAGE LOGIC
 * - Data is loaded into localStorage on first render
 * - All subsequent reads are from localStorage
 * - This ensures the feature works without internet
 */
const initializeCareerData = () => {
  try {
    const stored = localStorage.getItem(CAREER_STORAGE_KEY);
    if (!stored) {
      // First time: Save career data to localStorage
      localStorage.setItem(CAREER_STORAGE_KEY, JSON.stringify(CAREER_DATA));
      return CAREER_DATA.careerGuidance;
    }
    // Return stored data for offline access
    return JSON.parse(stored).careerGuidance;
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    // Fallback to static data if localStorage fails
    return CAREER_DATA.careerGuidance;
  }
};

const getCareerData = () => {
  try {
    const stored = localStorage.getItem(CAREER_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored).careerGuidance;
    }
    return CAREER_DATA.careerGuidance;
  } catch {
    return CAREER_DATA.careerGuidance;
  }
};

// Stream icon mapping
const StreamIcon = ({ stream }: { stream: string }) => {
  const iconClass = "h-5 w-5";
  switch (stream) {
    case "Mathematics":
      return <Calculator className={iconClass} />;
    case "Biology":
      return <FlaskConical className={iconClass} />;
    case "Arts":
      return <Palette className={iconClass} />;
    case "Commerce":
      return <TrendingUp className={iconClass} />;
    default:
      return <BookOpen className={iconClass} />;
  }
};

export function CareerGuidance() {
  const [selectedStream, setSelectedStream] = useState<string | null>(null);
  const [careerData, setCareerData] = useState<typeof CAREER_DATA.careerGuidance>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize career data in localStorage on component mount
  useEffect(() => {
    /**
     * WHY THIS WORKS OFFLINE:
     * 1. On first load (online or offline), data is saved to localStorage
     * 2. All subsequent reads come from localStorage
     * 3. No network requests are made to display career information
     * 4. Works in airplane mode after first initialization
     */
    const data = initializeCareerData();
    setCareerData(data);
    setIsInitialized(true);
  }, []);

  const selectedData = careerData.find(item => item.stream === selectedStream);

  if (!isInitialized) {
    return null;
  }

  return (
    <Card className="mb-6 animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary/10">
              <Target className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                🎯 Career Guidance
              </CardTitle>
              <CardDescription>
                Explore your future career paths – works offline
              </CardDescription>
            </div>
          </div>
          {/* Offline Ready Badge */}
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 flex items-center gap-1.5">
            <Wifi className="h-3 w-3" />
            <span className="text-xs font-medium">🟢 Offline Ready</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Offline message */}
        <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
          ✨ This career guidance works without internet. All data is stored locally on your device.
        </p>

        {/* Stream Selection */}
        {!selectedStream ? (
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground">Select a stream to explore:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {careerData.map((item) => (
                <Button
                  key={item.stream}
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all"
                  onClick={() => setSelectedStream(item.stream)}
                >
                  <div className="p-2 rounded-full bg-primary/10">
                    <StreamIcon stream={item.stream} />
                  </div>
                  <span className="font-medium">{item.stream}</span>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Back button and stream header */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedStream(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ← Back to streams
              </Button>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-primary/10">
                  <StreamIcon stream={selectedStream} />
                </div>
                <span className="font-semibold">{selectedStream}</span>
              </div>
            </div>

            {/* Tabs for Exams, Courses, Jobs */}
            {selectedData && (
              <Tabs defaultValue="exams" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="exams" className="flex items-center gap-1.5 text-xs sm:text-sm">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">📘</span> Exams
                  </TabsTrigger>
                  <TabsTrigger value="courses" className="flex items-center gap-1.5 text-xs sm:text-sm">
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">🎓</span> Courses
                  </TabsTrigger>
                  <TabsTrigger value="jobs" className="flex items-center gap-1.5 text-xs sm:text-sm">
                    <Briefcase className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">💼</span> Jobs
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="exams" className="mt-4">
                  <Card className="bg-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">📘 Competitive Exams</CardTitle>
                      <CardDescription>
                        Popular entrance exams for {selectedStream} students
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedData.exams.map((exam, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-primary/10 text-primary border-primary/20 py-1.5 px-3"
                          >
                            {exam}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="courses" className="mt-4">
                  <Card className="bg-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">🎓 Courses</CardTitle>
                      <CardDescription>
                        Higher education options after {selectedStream}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedData.courses.map((course, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-accent/10 text-accent border-accent/20 py-1.5 px-3"
                          >
                            {course}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="jobs" className="mt-4">
                  <Card className="bg-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">💼 Job Opportunities</CardTitle>
                      <CardDescription>
                        Career paths for {selectedStream} graduates
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedData.jobs.map((job, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-secondary/10 text-secondary border-secondary/20 py-1.5 px-3"
                          >
                            {job}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
