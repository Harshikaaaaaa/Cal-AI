import { Meal } from '../context/NutritionContext';

export interface DailyCalorieEntry {
  day: string;
  kcal: number;
  dateKey: string;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getMealDateKey(meal: Meal): string {
  return meal.date ?? toDateKey(new Date());
}

/** Last 7 days of calorie totals from logged meals (no mock data). */
export function getWeeklyCalorieData(meals: Meal[]): DailyCalorieEntry[] {
  const today = new Date();
  const entries: DailyCalorieEntry[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateKey = toDateKey(date);
    const kcal = meals
      .filter((meal) => getMealDateKey(meal) === dateKey)
      .reduce((sum, meal) => sum + meal.calories, 0);

    entries.push({
      day: i === 0 ? 'Today' : DAY_LABELS[date.getDay()],
      kcal,
      dateKey,
    });
  }

  return entries;
}
