export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  notice?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface MoodEntry {
  id: string;
  mood: 'verySad' | 'sad' | 'neutral' | 'happy' | 'veryHappy' | string;
  note?: string;
  notes?: string; // Backward compatibility with legacy component references
  date: string | Date;
}

export interface MoodStats {
  moodCounts: Record<string, number>;
  recentTrend: 'improving' | 'declining' | 'stable';
}

export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'scale' | 'multipleChoice' | 'text';
  options?: string[];
  minLabel?: string;
  maxLabel?: string;
}

export interface SurveyResponse {
  id: string;
  questionId: string;
  answer: string | number;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
}

export interface SurveyResult {
  id: string;
  surveyId: string;
  date: Date;
  responses: SurveyResponse[];
}

export interface MoodContextType {
  moodEntries: MoodEntry[];
  moodStats: MoodStats | null;
  addMoodEntry: (entry: Omit<MoodEntry, 'id'>) => Promise<void>;
  getMoodStats: () => MoodStats;
  loadError: string | null;
  syncToBackend?: () => Promise<void>;
}

export interface SurveyContextType {
  surveys: Survey[];
  surveyResults: SurveyResult[];
  getSurvey: (id: string) => Survey | undefined;
  submitSurveyResult: (surveyId: string, responses: SurveyResponse[]) => Promise<void>;
  getLatestSurveyResult: (surveyId: string) => SurveyResult | undefined;
}
