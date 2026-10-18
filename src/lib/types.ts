export interface Profile {
  id: string;
  username: string;
  created_at: string;
}

export interface CTFEvent {
  id: string;
  title: string;
  pin_code?: string;
  host_id: string;
  start_time: string;
  end_time: string;
  created_at: string;
  host?: Profile;
  questions?: PublicQuestion[];
  _count?: {
    questions?: number;
    submissions?: number;
  };
}

export interface Question {
  id: string;
  event_id: string;
  prompt: string;
  media_url?: string | null;
  correct_answer?: string; // Kept private on server
  points: number;
  order_index: number;
}

export type PublicQuestion = Omit<Question, "correct_answer">;

export interface Submission {
  id: string;
  event_id: string;
  question_id: string;
  user_id: string;
  submitted_answer?: string;
  is_correct: boolean;
  points_awarded: number;
  created_at: string;
  profiles?: Profile;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  total_points: number;
  solved_count: number;
  last_submission_time: string | null;
}

export interface QuestionFormItem {
  prompt: string;
  media_url?: string;
  correct_answer: string;
  points: number;
  order_index: number;
}

export type EventStatus = "upcoming" | "active" | "ended";

export function getEventStatus(start_time: string, end_time: string): EventStatus {
  const now = new Date().getTime();
  const start = new Date(start_time).getTime();
  const end = new Date(end_time).getTime();

  if (now < start) return "upcoming";
  if (now > end) return "ended";
  return "active";
}
