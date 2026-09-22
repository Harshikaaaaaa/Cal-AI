import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CalAi } from '../constants/calAiTheme';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface WeekCalendarProps {
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
}

function toDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function WeekCalendar({ selectedDate, onSelectDate }: WeekCalendarProps) {
  const today = new Date();
  const days: { label: string; dateNum: number; dateKey: string; isToday: boolean }[] = [];

  for (let i = -3; i <= 3; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateKey = toDateKey(d);
    days.push({
      label: DAY_LABELS[d.getDay()],
      dateNum: d.getDate(),
      dateKey,
      isToday: i === 0,
    });
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {days.map((day) => {
        const isSelected = day.dateKey === selectedDate;
        return (
          <TouchableOpacity
            key={day.dateKey}
            style={styles.dayCol}
            onPress={() => onSelectDate(day.dateKey)}
            activeOpacity={0.7}
          >
            <Text style={[styles.dayLabel, isSelected && styles.dayLabelActive]}>
              {day.label}
            </Text>
            <View
              style={[
                styles.dateCircle,
                isSelected && styles.dateCircleSelected,
                day.isToday && !isSelected && styles.dateCircleToday,
              ]}
            >
              <Text
                style={[
                  styles.dateNum,
                  isSelected && styles.dateNumSelected,
                ]}
              >
                {day.dateNum}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    gap: 4,
    paddingVertical: 8,
  },
  dayCol: {
    alignItems: 'center',
    width: 48,
  },
  dayLabel: {
    fontSize: 11,
    color: CalAi.textMuted,
    fontWeight: '600',
    marginBottom: 8,
  },
  dayLabelActive: {
    color: CalAi.text,
    fontWeight: '700',
  },
  dateCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCircleSelected: {
    backgroundColor: CalAi.accent,
  },
  dateCircleToday: {
    borderWidth: 2,
    borderColor: CalAi.success,
  },
  dateNum: {
    fontSize: 15,
    fontWeight: '700',
    color: CalAi.textSecondary,
  },
  dateNumSelected: {
    color: '#FFFFFF',
  },
});
