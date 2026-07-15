const STORAGE_KEY = 'streak_data';

interface StreakData {
  currentStreak: number;
  lastLoginDate: string | null;
}

function readData(): StreakData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { currentStreak: 0, lastLoginDate: null };
}

function writeData(data: StreakData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export class StreakService {
  static getStreak(): StreakData {
    return readData();
  }

  static recordLogin(): StreakData {
    const data = readData();
    const today = new Date().toDateString();

    if (data.lastLoginDate === today) return data;

    if (data.lastLoginDate) {
      const last = new Date(data.lastLoginDate);
      const diff = Math.floor(
        (new Date(today).getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
      );
      data.currentStreak = diff === 1 ? data.currentStreak + 1 : 1;
    } else {
      data.currentStreak = 1;
    }

    data.lastLoginDate = today;
    writeData(data);
    return data;
  }
}
