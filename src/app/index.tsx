import { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MacroCarousel } from '../components/MacroCarousel';
import { OnboardingModal } from '../components/OnboardingModal';
import { RecentMealRow } from '../components/RecentMealRow';
import { WeekCalendar } from '../components/WeekCalendar';
import { ProgressRing } from '../components/ui/ProgressRing';
import { CalAi } from '../constants/calAiTheme';
import { useNutrition } from '../context/NutritionContext';

export default function HomeScreen() {
  const {
    goals,
    selectedDate,
    setSelectedDate,
    getMealsForDate,
    getStreak,
  } = useNutrition();

  const [onboardingVisible, setOnboardingVisible] = useState(false);
  const dayMeals = getMealsForDate(selectedDate);
  const streak = getStreak();

  const totalCalories = dayMeals.reduce((s, m) => s + m.calories, 0);
  const totalProtein = dayMeals.reduce((s, m) => s + m.protein, 0);
  const totalCarbs = dayMeals.reduce((s, m) => s + m.carbs, 0);
  const totalFats = dayMeals.reduce((s, m) => s + m.fats, 0);
  const calorieProgress = goals.calories > 0 ? totalCalories / goals.calories : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={CalAi.bg} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Text style={styles.appleIcon}>🍎</Text>
            <Text style={styles.logoText}>Cal AI</Text>
          </View>
          <TouchableOpacity style={styles.streakBadge} activeOpacity={0.8}>
            <Text style={styles.streakFlame}>🔥</Text>
            <Text style={styles.streakNum}>{streak}</Text>
          </TouchableOpacity>
        </View>

        <WeekCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={[styles.calorieCard, CalAi.shadow]}>
            <View style={styles.calorieLeft}>
              <Text style={styles.calorieValue}>
                {totalCalories}/{goals.calories}
              </Text>
              <Text style={styles.calorieLabel}>Calories eaten</Text>
            </View>
            <ProgressRing
              size={100}
              strokeWidth={8}
              progress={calorieProgress}
              color={CalAi.accent}
            >
              <Text style={styles.ringIcon}>🔥</Text>
            </ProgressRing>
          </View>

          <MacroCarousel
            protein={{ current: totalProtein, goal: goals.protein }}
            carbs={{ current: totalCarbs, goal: goals.carbs }}
            fats={{ current: totalFats, goal: goals.fats }}
          />

          <Text style={styles.sectionTitle}>Recently uploaded</Text>

          {dayMeals.length > 0 ? (
            dayMeals.map((meal) => <RecentMealRow key={meal.id} meal={meal} />)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📷</Text>
              <Text style={styles.emptyTitle}>No meals logged yet</Text>
              <Text style={styles.emptySub}>
                Tap the + button to scan your food and track calories.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <OnboardingModal
        visible={onboardingVisible}
        onClose={() => setOnboardingVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CalAi.bg,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appleIcon: {
    fontSize: 22,
    marginRight: 6,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: CalAi.text,
    letterSpacing: -0.5,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CalAi.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    ...CalAi.shadow,
  },
  streakFlame: {
    fontSize: 16,
    marginRight: 4,
  },
  streakNum: {
    fontSize: 15,
    fontWeight: '800',
    color: CalAi.text,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    paddingTop: 8,
  },
  calorieCard: {
    backgroundColor: CalAi.card,
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calorieLeft: {
    flex: 1,
  },
  calorieValue: {
    fontSize: 36,
    fontWeight: '900',
    color: CalAi.text,
    letterSpacing: -1,
  },
  calorieLabel: {
    fontSize: 14,
    color: CalAi.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  ringIcon: {
    fontSize: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: CalAi.text,
    marginTop: 20,
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: CalAi.card,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    ...CalAi.shadow,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: CalAi.text,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: CalAi.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
