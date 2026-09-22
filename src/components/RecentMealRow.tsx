import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { CalAi } from '../constants/calAiTheme';
import { Meal } from '../context/NutritionContext';

interface RecentMealRowProps {
  meal: Meal;
}

export function RecentMealRow({ meal }: RecentMealRowProps) {
  return (
    <View style={[styles.row, CalAi.shadow]}>
      {meal.imageUri ? (
        <Image source={{ uri: meal.imageUri }} style={styles.thumb} />
      ) : (
        <View style={styles.thumbPlaceholder}>
          <Text style={styles.placeholderIcon}>🍽️</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {meal.name}
        </Text>
        <Text style={styles.time}>{meal.timestamp}</Text>
      </View>
      <View style={styles.macros}>
        <Text style={styles.calories}>{meal.calories} Calories</Text>
        <View style={styles.macroRow}>
          <Text style={[styles.macro, { color: CalAi.protein }]}>🍗 {meal.protein}g</Text>
          <Text style={[styles.macro, { color: CalAi.carbs }]}>🌾 {meal.carbs}g</Text>
          <Text style={[styles.macro, { color: CalAi.fat }]}>🥑 {meal.fats}g</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CalAi.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  thumbPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: CalAi.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: CalAi.text,
  },
  time: {
    fontSize: 12,
    color: CalAi.textSecondary,
    marginTop: 2,
  },
  macros: {
    alignItems: 'flex-end',
  },
  calories: {
    fontSize: 13,
    fontWeight: '800',
    color: CalAi.text,
  },
  macroRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  macro: {
    fontSize: 10,
    fontWeight: '600',
  },
});
