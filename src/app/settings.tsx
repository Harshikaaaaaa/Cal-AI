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
import { OnboardingModal } from '../components/OnboardingModal';
import { CalAi } from '../constants/calAiTheme';
import { useNutrition, UserPersona } from '../context/NutritionContext';

const PERSONAS: { key: UserPersona; label: string; emoji: string }[] = [
  { key: 'beginner', label: 'Beginner', emoji: '🌱' },
  { key: 'dieter', label: 'Dieter', emoji: '🥗' },
  { key: 'athlete', label: 'Athlete', emoji: '💪' },
  { key: 'busypro', label: 'Busy Pro', emoji: '🚀' },
];

export default function SettingsScreen() {
  const {
    persona,
    changePersona,
    goals,
    waterIntake,
    waterGoal,
    addWater,
    removeWater,
    clearAllLogs,
  } = useNutrition();
  const [onboardingVisible, setOnboardingVisible] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={CalAi.bg} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Text style={styles.title}>Settings</Text>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionLabel}>Your Profile</Text>
          <View style={[styles.card, CalAi.shadow]}>
            {PERSONAS.map((p) => (
              <TouchableOpacity
                key={p.key}
                style={[styles.personaRow, persona === p.key && styles.personaRowActive]}
                onPress={() => changePersona(p.key)}
              >
                <Text style={styles.personaEmoji}>{p.emoji}</Text>
                <Text style={[styles.personaLabel, persona === p.key && styles.personaLabelActive]}>
                  {p.label}
                </Text>
                {persona === p.key && <Text style={styles.check}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Daily Goals</Text>
          <View style={[styles.card, CalAi.shadow]}>
            <View style={styles.goalRow}>
              <Text style={styles.goalLabel}>Calories</Text>
              <Text style={styles.goalValue}>{goals.calories} kcal</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.goalRow}>
              <Text style={styles.goalLabel}>Protein</Text>
              <Text style={styles.goalValue}>{goals.protein}g</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.goalRow}>
              <Text style={styles.goalLabel}>Carbs</Text>
              <Text style={styles.goalValue}>{goals.carbs}g</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.goalRow}>
              <Text style={styles.goalLabel}>Fat</Text>
              <Text style={styles.goalValue}>{goals.fats}g</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Hydration</Text>
          <View style={[styles.card, CalAi.shadow]}>
            <View style={styles.hydrationRow}>
              <View>
                <Text style={styles.goalLabel}>Water intake</Text>
                <Text style={styles.hydrationValue}>
                  {waterIntake} / {waterGoal} ml
                </Text>
              </View>
              <View style={styles.hydrationBtns}>
                <TouchableOpacity style={styles.hBtn} onPress={removeWater}>
                  <Text style={styles.hBtnText}>−</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.hBtn} onPress={addWater}>
                  <Text style={styles.hBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.clearBtn} onPress={clearAllLogs}>
            <Text style={styles.clearBtnText}>Clear All Logs</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      <OnboardingModal visible={onboardingVisible} onClose={() => setOnboardingVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CalAi.bg },
  safeArea: { flex: 1 },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: CalAi.text,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    letterSpacing: -0.5,
  },
  scroll: { paddingHorizontal: 20, paddingBottom: 120 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: CalAi.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 8,
  },
  card: {
    backgroundColor: CalAi.card,
    borderRadius: 20,
    padding: 4,
    marginBottom: 16,
  },
  personaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
  },
  personaRowActive: {
    backgroundColor: CalAi.bg,
  },
  personaEmoji: { fontSize: 20, marginRight: 12 },
  personaLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: CalAi.textSecondary },
  personaLabelActive: { color: CalAi.text, fontWeight: '700' },
  check: { fontSize: 16, fontWeight: '800', color: CalAi.success },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  goalLabel: { fontSize: 15, color: CalAi.text, fontWeight: '600' },
  goalValue: { fontSize: 15, fontWeight: '800', color: CalAi.text },
  divider: { height: 1, backgroundColor: CalAi.border, marginHorizontal: 16 },
  hydrationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  hydrationValue: { fontSize: 13, color: CalAi.textSecondary, marginTop: 4 },
  hydrationBtns: { flexDirection: 'row', gap: 8 },
  hBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CalAi.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hBtnText: { fontSize: 20, fontWeight: '700', color: CalAi.text },
  clearBtn: {
    backgroundColor: CalAi.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  clearBtnText: { color: '#E53935', fontWeight: '700', fontSize: 15 },
});
