import React, { createContext, useContext, useMemo, useState } from 'react';

export type UserPersona = 'beginner' | 'dieter' | 'athlete' | 'busypro';

export interface MacroGoals {
  calories: number;
  protein: number; // in grams
  carbs: number;   // in grams
  fats: number;    // in grams
}

export interface Meal {
  id: string;
  name: string;
  category: 'Home-cooked' | 'Restaurant' | 'Packaged' | 'Snacks & Drinks';
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  imageUri?: string;
  timestamp: string;
  /** YYYY-MM-DD for weekly analytics */
  date: string;
  ingredients?: Array<{ name: string; size: string; calories: number }>;
  healthAdvice?: string;
}

export interface ProgressPhoto {
  id: string;
  date: string;
  imageUri: string;
  weight?: number;
}

interface NutritionContextType {
  persona: UserPersona;
  goals: MacroGoals;
  meals: Meal[];
  waterIntake: number; // in ml (e.g. 250ml units)
  waterGoal: number; // in ml
  progressPhotos: ProgressPhoto[];
  selectedDate: string;
  weightGoal: number;
  setSelectedDate: (date: string) => void;
  getMealsForDate: (dateKey: string) => Meal[];
  getStreak: () => number;
  getDailyAverageCalories: () => number;
  changePersona: (newPersona: UserPersona) => void;
  updateGoals: (newGoals: Partial<MacroGoals>) => void;
  addMeal: (meal: Omit<Meal, 'id' | 'timestamp' | 'date'>) => void;
  deleteMeal: (id: string) => void;
  addWater: () => void;
  removeWater: () => void;
  addProgressPhoto: (imageUri: string, weight?: number) => void;
  clearAllLogs: () => void;
}

const DEFAULT_GOALS: Record<UserPersona, MacroGoals> = {
  beginner: { calories: 2000, protein: 75, carbs: 250, fats: 70 },
  dieter: { calories: 1500, protein: 120, carbs: 140, fats: 50 },
  athlete: { calories: 3000, protein: 180, carbs: 360, fats: 80 },
  busypro: { calories: 2200, protein: 90, carbs: 260, fats: 80 },
};

const NutritionContext = createContext<NutritionContextType | undefined>(undefined);

function toDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

export const NutritionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [persona, setPersona] = useState<UserPersona>('beginner');
  const [goals, setGoals] = useState<MacroGoals>(DEFAULT_GOALS.beginner);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [waterIntake, setWaterIntake] = useState<number>(0);
  const [waterGoal] = useState<number>(2000);
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() => toDateKey(new Date()));
  const [weightGoal] = useState<number>(70);

  const changePersona = (newPersona: UserPersona) => {
    setPersona(newPersona);
    setGoals(DEFAULT_GOALS[newPersona]);
  };

  const updateGoals = (newGoals: Partial<MacroGoals>) => {
    setGoals((prev) => ({ ...prev, ...newGoals }));
  };

  const addMeal = (newMeal: Omit<Meal, 'id' | 'timestamp' | 'date'>) => {
    const now = new Date();
    const meal: Meal = {
      ...newMeal,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: now.toISOString().split('T')[0],
    };
    setMeals((prev) => [meal, ...prev]);
  };

  const deleteMeal = (id: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== id));
  };

  const addWater = () => {
    setWaterIntake((prev) => Math.min(prev + 250, 4000));
  };

  const removeWater = () => {
    setWaterIntake((prev) => Math.max(prev - 250, 0));
  };

  const addProgressPhoto = (imageUri: string, weight?: number) => {
    const photo: ProgressPhoto = {
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      imageUri,
      weight,
    };
    setProgressPhotos((prev) => [photo, ...prev]);
  };

  const clearAllLogs = () => {
    setMeals([]);
    setWaterIntake(0);
  };

  const getMealsForDate = (dateKey: string) => meals.filter((m) => m.date === dateKey);

  const getStreak = () => {
    const dates = new Set(meals.map((m) => m.date));
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = toDateKey(d);
      if (dates.has(key)) streak++;
      else if (i > 0) break;
    }
    return streak;
  };

  const getDailyAverageCalories = () => {
    const byDate = new Map<string, number>();
    meals.forEach((m) => {
      byDate.set(m.date, (byDate.get(m.date) ?? 0) + m.calories);
    });
    if (byDate.size === 0) return 0;
    const total = [...byDate.values()].reduce((a, b) => a + b, 0);
    return Math.round(total / byDate.size);
  };

  const value = useMemo(
    () => ({
      persona,
      goals,
      meals,
      waterIntake,
      waterGoal,
      progressPhotos,
      selectedDate,
      weightGoal,
      changePersona,
      updateGoals,
      addMeal,
      deleteMeal,
      addWater,
      removeWater,
      addProgressPhoto,
      clearAllLogs,
      setSelectedDate,
      getMealsForDate,
      getStreak,
      getDailyAverageCalories,
    }),
    [persona, goals, meals, waterIntake, waterGoal, progressPhotos, selectedDate, weightGoal]
  );

  return (
    <NutritionContext.Provider value={value}>
      {children}
    </NutritionContext.Provider>
  );
};

export const useNutrition = () => {
  const context = useContext(NutritionContext);
  if (context === undefined) {
    throw new Error('useNutrition must be used within a NutritionProvider');
  }
  return context;
};
