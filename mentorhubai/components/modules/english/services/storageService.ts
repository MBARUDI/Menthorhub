import { User, UserProgress, LeaderboardEntry, LessonHistory, FullBackup } from '../types';

const USERS_KEY = 'gemini_users';
const PROGRESS_KEY_PREFIX = 'gemini_progress_';
const BOT_SCORES_KEY = 'gemini_bot_scores';
const HISTORY_KEY_PREFIX = 'gemini_history_';

const MOCK_NAMES = [
  "Mario Rossi", "Ana Silva", "John Smith", "Elena Weber", "Yuki Tanaka",
  "Carlos Ruiz", "Fatima Al-Sayed", "Liam O'Connor", "Sofia Kowalski", "Jean Dupont"
];

interface BotData {
    name: string;
    score: number;
    avatarSeed: string;
}

export const storageService = {
  getAllUsers: (): User[] => {
    try {
        const usersStr = localStorage.getItem(USERS_KEY);
        return usersStr ? JSON.parse(usersStr) : [];
    } catch (e) {
        return [];
    }
  },

  register: (user: User): User => {
    const usersStr = localStorage.getItem(USERS_KEY);
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];

    const existing = users.find(u => u.email === user.email);
    if (existing) {
        const updatedUsers = users.map(u => u.email === user.email ? user : u);
        localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
        return user;
    }

    const newUser = { ...user };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return newUser;
  },

  getUser: (email: string): User | undefined => {
    const usersStr = localStorage.getItem(USERS_KEY);
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];
    return users.find(u => u.email === email);
  },

  saveProgress: (email: string, progress: UserProgress) => {
    try {
      localStorage.setItem(`${PROGRESS_KEY_PREFIX}${email}`, JSON.stringify(progress));
    } catch (error) {
      console.error("Failed to save progress", error);
    }
  },

  loadProgress: (email: string): UserProgress => {
    try {
      const data = localStorage.getItem(`${PROGRESS_KEY_PREFIX}${email}`);
      const progress = data ? JSON.parse(data) : { totalScore: 0 };
      if (typeof progress.totalScore === 'undefined') {
          progress.totalScore = 0;
      }
      return progress;
    } catch (error) {
      console.error("Failed to load progress", error);
      return { totalScore: 0 };
    }
  },

  saveHistory: (email: string, historyLog: LessonHistory) => {
      try {
          const key = `${HISTORY_KEY_PREFIX}${email}`;
          const existingData = localStorage.getItem(key);
          const historyList: LessonHistory[] = existingData ? JSON.parse(existingData) : [];
          
          historyList.push(historyLog);
          localStorage.setItem(key, JSON.stringify(historyList));
      } catch (error) {
          console.error("Failed to save history log", error);
      }
  },

  getHistory: (email: string): LessonHistory[] => {
      try {
          const data = localStorage.getItem(`${HISTORY_KEY_PREFIX}${email}`);
          return data ? JSON.parse(data) : [];
      } catch (error) {
          return [];
      }
  },

  importData: (jsonData: string): User | null => {
      try {
          const data = JSON.parse(jsonData);
          
          if (data.user && data.progress) {
              const rawUser = data.user;
              
              const name = rawUser.username || rawUser.userName || rawUser.name || '';
              
              const email = rawUser.email || (name ? name.toLowerCase().replace(/\s+/g, '') + '@imported.com' : `user_${Date.now()}@imported.com`);
              const phone = rawUser.phone || '';

              const user: User = { name, email, phone };
              const progress = data.progress as UserProgress;
              
              if (name) {
                storageService.register(user);
                storageService.saveProgress(user.email, progress);
                
                if (data.history && Array.isArray(data.history)) {
                    localStorage.setItem(`${HISTORY_KEY_PREFIX}${user.email}`, JSON.stringify(data.history));
                }
              }

              return user;
          }
          
          return null;
      } catch (e) {
          console.error("Error importing data", e);
          throw new Error("Formato de arquivo inválido.");
      }
  },

  getBots: (): BotData[] => {
      const stored = localStorage.getItem(BOT_SCORES_KEY);
      if (stored) {
          return JSON.parse(stored);
      }

      const seed = new Date().getDate();
      const bots: BotData[] = MOCK_NAMES.map((name, index) => {
          const randomScore = Math.floor(((seed * (index + 1) * 9301) % 200)); 
          return {
              name,
              score: randomScore,
              avatarSeed: name
          };
      });
      
      localStorage.setItem(BOT_SCORES_KEY, JSON.stringify(bots));
      return bots;
  },

  updateBotScores: () => {
      const bots = storageService.getBots();
      const updatedBots = bots.map(bot => {
          if (Math.random() > 0.7) {
             return { ...bot, score: bot.score + Math.floor(Math.random() * 15) + 5 };
          }
          return bot;
      });
      localStorage.setItem(BOT_SCORES_KEY, JSON.stringify(updatedBots));
  },

  getLeaderboard: (currentUser: User, currentScore: number): LeaderboardEntry[] => {
      const bots = storageService.getBots();
      
      const botEntries: LeaderboardEntry[] = bots.map(bot => ({
          name: bot.name,
          score: bot.score,
          isCurrentUser: false,
          avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${bot.avatarSeed}`
      }));

      const userEntry: LeaderboardEntry = {
          name: currentUser.name,
          score: currentScore,
          isCurrentUser: true,
          avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${currentUser.name}`
      };

      const allEntries = [...botEntries, userEntry].sort((a, b) => b.score - a.score);

      const top10 = allEntries.slice(0, 10);
      const userInTop10 = top10.some(e => e.isCurrentUser);

      if (!userInTop10) {
          return [...top10, userEntry];
      }

      return top10;
  }
};
