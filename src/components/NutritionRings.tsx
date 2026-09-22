import React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { useNutrition } from '../context/NutritionContext';

const { width } = Dimensions.get('window');

export const NutritionRings: React.FC = () => {
  const { meals, goals } = useNutrition();

  // Calculate totals
  const totalCalories = meals.reduce((acc, m) => acc + m.calories, 0);
  const totalProtein = meals.reduce((acc, m) => acc + m.protein, 0);
  const totalCarbs = meals.reduce((acc, m) => acc + m.carbs, 0);
  const totalFats = meals.reduce((acc, m) => acc + m.fats, 0);

  // Percentages for macros
  const caloriePercent = Math.min((totalCalories / goals.calories) * 100, 100);
  const proteinPercent = Math.min((totalProtein / goals.protein) * 100, 100);
  const carbsPercent = Math.min((totalCarbs / goals.carbs) * 100, 100);
  const fatsPercent = Math.min((totalFats / goals.fats) * 100, 100);

  const remainingCalories = Math.max(goals.calories - totalCalories, 0);
  const isOverCalorie = totalCalories > goals.calories;

  return (
    <View style={styles.container}>
      {/* Central Circular Calorie Counter */}
      <View style={styles.ringWrapper}>
        <View style={[
          styles.outerRing,
          { borderColor: isOverCalorie ? '#EF4444' : 'rgba(255,255,255,0.06)' }
        ]}>
          <View style={[
            styles.progressRingIndicator,
            { 
              borderColor: isOverCalorie ? '#EF4444' : '#10B981',
              transform: [{ rotate: `${(caloriePercent * 3.6) - 90}deg` }] // Mock rotation visual
            }
          ]} />
          
          <View style={styles.innerCircle}>
            <Text style={styles.remainingText}>
              {isOverCalorie ? 'Over Limit' : 'Remaining'}
            </Text>
            <Text style={[styles.calorieCount, isOverCalorie && styles.overCalorieText]}>
              {isOverCalorie ? totalCalories - goals.calories : remainingCalories}
            </Text>
            <Text style={styles.kcalUnit}>kcal</Text>
            
            <View style={styles.budgetRow}>
              <Text style={styles.budgetValue}>{totalCalories}</Text>
              <Text style={styles.budgetSlash}> / </Text>
              <Text style={styles.budgetGoal}>{goals.calories}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Macro Progress Bars */}
      <View style={styles.macrosContainer}>
        {/* Protein */}
        <View style={styles.macroRow}>
          <View style={styles.macroHeader}>
            <View style={styles.macroLabelContainer}>
              <View style={[styles.macroDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.macroName}>Protein</Text>
            </View>
            <Text style={styles.macroValue}>
              {totalProtein}g<Text style={styles.macroGoal}> / {goals.protein}g</Text>
            </Text>
          </View>
          <View style={styles.barBackground}>
            <View style={[styles.barFill, { backgroundColor: '#EF4444', width: `${proteinPercent}%` }]} />
          </View>
        </View>

        {/* Carbs */}
        <View style={styles.macroRow}>
          <View style={styles.macroHeader}>
            <View style={styles.macroLabelContainer}>
              <View style={[styles.macroDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.macroName}>Carbs</Text>
            </View>
            <Text style={styles.macroValue}>
              {totalCarbs}g<Text style={styles.macroGoal}> / {goals.carbs}g</Text>
            </Text>
          </View>
          <View style={styles.barBackground}>
            <View style={[styles.barFill, { backgroundColor: '#3B82F6', width: `${carbsPercent}%` }]} />
          </View>
        </View>

        {/* Fats */}
        <View style={styles.macroRow}>
          <View style={styles.macroHeader}>
            <View style={styles.macroLabelContainer}>
              <View style={[styles.macroDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.macroName}>Fats</Text>
            </View>
            <Text style={styles.macroValue}>
              {totalFats}g<Text style={styles.macroGoal}> / {goals.fats}g</Text>
            </Text>
          </View>
          <View style={styles.barBackground}>
            <View style={[styles.barFill, { backgroundColor: '#F59E0B', width: `${fatsPercent}%` }]} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E293B', // Slate 800
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 20,
  },
  ringWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  outerRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressRingIndicator: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    borderColor: 'transparent',
    borderTopColor: '#10B981', // Neon emerald indicator
  },
  innerCircle: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: '#0F172A', // Slate 900
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  remainingText: {
    fontSize: 10,
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  calorieCount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  overCalorieText: {
    color: '#EF4444',
  },
  kcalUnit: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetValue: {
    fontSize: 11,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  budgetSlash: {
    fontSize: 11,
    color: '#475569',
  },
  budgetGoal: {
    fontSize: 11,
    color: '#64748B',
  },
  macrosContainer: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  macroRow: {
    marginBottom: 12,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  macroLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  macroName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  macroValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  macroGoal: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  barBackground: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0F172A',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
});
