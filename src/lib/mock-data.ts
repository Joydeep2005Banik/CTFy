import { CTFEvent, Question, Submission, Profile, LeaderboardEntry } from "./types";

export const DEMO_USER: Profile = {
  id: "user-demo-1",
  username: "cypher_pilot",
  created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
};

export const DEMO_HOST: Profile = {
  id: "user-host-1",
  username: "root_admin",
  created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
};

const now = Date.now();
const oneHour = 3600 * 1000;

export const INITIAL_MOCK_EVENTS: CTFEvent[] = [
  {
    id: "event-active-1",
    title: "CyberSec Blitz 2026",
    pin_code: "482910",
    host_id: DEMO_HOST.id,
    start_time: new Date(now - oneHour).toISOString(), // started 1 hr ago
    end_time: new Date(now + 2 * oneHour).toISOString(), // ends in 2 hrs
    created_at: new Date(now - 86400000).toISOString(),
    host: DEMO_HOST,
    _count: {
      questions: 4,
      submissions: 12,
    },
  },
  {
    id: "event-upcoming-2",
    title: "Zero-Day Showdown",
    pin_code: "918234",
    host_id: DEMO_HOST.id,
    start_time: new Date(now + 3 * oneHour).toISOString(), // starts in 3 hrs
    end_time: new Date(now + 8 * oneHour).toISOString(),
    created_at: new Date(now - 43200000).toISOString(),
    host: DEMO_HOST,
    _count: {
      questions: 3,
      submissions: 0,
    },
  },
  {
    id: "event-ended-3",
    title: "Winter CTF Championship Finals",
    pin_code: "102938",
    host_id: DEMO_USER.id,
    start_time: new Date(now - 48 * oneHour).toISOString(),
    end_time: new Date(now - 24 * oneHour).toISOString(),
    created_at: new Date(now - 72 * oneHour).toISOString(),
    host: DEMO_USER,
    _count: {
      questions: 5,
      submissions: 34,
    },
  },
];

export const INITIAL_MOCK_QUESTIONS: Record<string, Question[]> = {
  "event-active-1": [
    {
      id: "q-101",
      event_id: "event-active-1",
      prompt: "Web Cryptography: Decode the following base64 string to extract the secret flag: Q1RGeXtiYXNlNjRfaXNfbm90X2VuY3J5cHRpb259",
      media_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
      correct_answer: "CTFy{base64_is_not_encryption}",
      points: 100,
      order_index: 0,
    },
    {
      id: "q-102",
      event_id: "event-active-1",
      prompt: "Network Security: What is the default standard TCP port used for secure encrypted HTTPS web traffic?",
      media_url: null,
      correct_answer: "443",
      points: 50,
      order_index: 1,
    },
    {
      id: "q-103",
      event_id: "event-active-1",
      prompt: "HTTP Headers: Which standard response header instructs modern web browsers that the site must only be accessed over secure HTTPS connections?",
      media_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80",
      correct_answer: "Strict-Transport-Security",
      points: 150,
      order_index: 2,
    },
    {
      id: "q-104",
      event_id: "event-active-1",
      prompt: "Linux Permissions: In numeric octal representation, what 3-digit mode grants Read, Write, and Execute to the owner, and Read-only to Group and Others?",
      media_url: null,
      correct_answer: "744",
      points: 100,
      order_index: 3,
    },
  ],
  "event-upcoming-2": [
    {
      id: "q-201",
      event_id: "event-upcoming-2",
      prompt: "Forensics: What is the magic byte header (in hex) for a PNG file?",
      media_url: null,
      correct_answer: "89504E47",
      points: 100,
      order_index: 0,
    },
  ],
  "event-ended-3": [
    {
      id: "q-301",
      event_id: "event-ended-3",
      prompt: "Reverse Engineering: What x86 instruction is represented by the opcode 0x90?",
      media_url: null,
      correct_answer: "NOP",
      points: 100,
      order_index: 0,
    },
  ],
};

export const INITIAL_MOCK_SUBMISSIONS: Record<string, Submission[]> = {
  "event-active-1": [
    {
      id: "sub-1",
      event_id: "event-active-1",
      question_id: "q-102",
      user_id: "user-p1",
      submitted_answer: "443",
      is_correct: true,
      points_awarded: 50,
      created_at: new Date(now - 45 * 60000).toISOString(),
      profiles: { id: "user-p1", username: "shadow_byte", created_at: "" },
    },
    {
      id: "sub-2",
      event_id: "event-active-1",
      question_id: "q-101",
      user_id: "user-p1",
      submitted_answer: "CTFy{base64_is_not_encryption}",
      is_correct: true,
      points_awarded: 100,
      created_at: new Date(now - 35 * 60000).toISOString(),
      profiles: { id: "user-p1", username: "shadow_byte", created_at: "" },
    },
    {
      id: "sub-3",
      event_id: "event-active-1",
      question_id: "q-102",
      user_id: "user-p2",
      submitted_answer: "80",
      is_correct: false,
      points_awarded: 0,
      created_at: new Date(now - 30 * 60000).toISOString(),
      profiles: { id: "user-p2", username: "kernel_panix", created_at: "" },
    },
    {
      id: "sub-4",
      event_id: "event-active-1",
      question_id: "q-102",
      user_id: "user-p2",
      submitted_answer: "443",
      is_correct: true,
      points_awarded: 50,
      created_at: new Date(now - 28 * 60000).toISOString(),
      profiles: { id: "user-p2", username: "kernel_panix", created_at: "" },
    },
    {
      id: "sub-5",
      event_id: "event-active-1",
      question_id: "q-103",
      user_id: "user-p3",
      submitted_answer: "Strict-Transport-Security",
      is_correct: true,
      points_awarded: 150,
      created_at: new Date(now - 15 * 60000).toISOString(),
      profiles: { id: "user-p3", username: "zero_day_ninja", created_at: "" },
    },
  ],
};

// Helper to compute leaderboard standings
export function computeLeaderboard(
  submissions: Submission[],
  knownUsers: Record<string, string> = {
    "user-p1": "shadow_byte",
    "user-p2": "kernel_panix",
    "user-p3": "zero_day_ninja",
    "user-demo-1": "cypher_pilot",
  }
): LeaderboardEntry[] {
  const userMap: Record<
    string,
    {
      user_id: string;
      username: string;
      total_points: number;
      solvedQuestions: Set<string>;
      last_submission_time: string | null;
    }
  > = {};

  submissions.forEach((sub) => {
    const uname =
      sub.profiles?.username || knownUsers[sub.user_id] || `user_${sub.user_id.slice(0, 6)}`;

    if (!userMap[sub.user_id]) {
      userMap[sub.user_id] = {
        user_id: sub.user_id,
        username: uname,
        total_points: 0,
        solvedQuestions: new Set(),
        last_submission_time: null,
      };
    }

    if (sub.is_correct && !userMap[sub.user_id].solvedQuestions.has(sub.question_id)) {
      userMap[sub.user_id].solvedQuestions.add(sub.question_id);
      userMap[sub.user_id].total_points += sub.points_awarded;
      if (
        !userMap[sub.user_id].last_submission_time ||
        new Date(sub.created_at) > new Date(userMap[sub.user_id].last_submission_time!)
      ) {
        userMap[sub.user_id].last_submission_time = sub.created_at;
      }
    }
  });

  return Object.values(userMap)
    .map((u) => ({
      user_id: u.user_id,
      username: u.username,
      total_points: u.total_points,
      solved_count: u.solvedQuestions.size,
      last_submission_time: u.last_submission_time,
    }))
    .sort((a, b) => {
      if (b.total_points !== a.total_points) {
        return b.total_points - a.total_points;
      }
      if (a.last_submission_time && b.last_submission_time) {
        return (
          new Date(a.last_submission_time).getTime() -
          new Date(b.last_submission_time).getTime()
        );
      }
      return 0;
    });
}
