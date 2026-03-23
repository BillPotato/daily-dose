export type TaskCompletion = {
  timestamp: string;
  date: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  frequency: string;
  type: string;
  defaultTime?: string;
  times?: string[];
  completed: TaskCompletion[];
  createdAt: string;
  isActive: boolean;
  parsed: boolean;
  start?: string;
  end?: string;
  source?: string;
};

export type SurveyAnswers = {
  mood?: string;
  pain?: string;
  exercise?: string;
  sleep?: string;
  [key: string]: string | undefined;
};

export type Survey = {
  id: number | string;
  date: string;
  answers: SurveyAnswers;
};

export type User = {
  name: string;
  email: string;
};
