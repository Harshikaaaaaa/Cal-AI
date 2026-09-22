import React, { useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CalAi } from '../constants/calAiTheme';
import { ProgressRing } from './ui/ProgressRing';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.38;

interface MacroCarouselProps {
  protein: { current: number; goal: number };
  carbs: { current: number; goal: number };
  fats: { current: number; goal: number };
}

function MacroCard({
  label,
  current,
  goal,
  color,
  icon,
}: {
  label: string;
  current: number;
  goal: number;
  color: string;
  icon: string;
}) {
  const progress = goal > 0 ? current / goal : 0;
  return (
    <View style={[styles.card, CalAi.shadow]}>
      <ProgressRing size={72} strokeWidth={6} progress={progress} color={color}>
        <Text style={styles.icon}>{icon}</Text>
      </ProgressRing>
      <Text style={styles.value}>
        {current}/{goal}g
      </Text>
      <Text style={styles.label}>{label} eaten</Text>
    </View>
  );
}

export function MacroCarousel({ protein, carbs, fats }: MacroCarouselProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 12));
    setPage(idx);
  };

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 12}
        decelerationRate="fast"
        contentContainerStyle={styles.scroll}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <MacroCard label="Protein" current={protein.current} goal={protein.goal} color={CalAi.protein} icon="🍗" />
        <MacroCard label="Carbs" current={carbs.current} goal={carbs.goal} color={CalAi.carbs} icon="🌾" />
        <MacroCard label="Fat" current={fats.current} goal={fats.goal} color={CalAi.fat} icon="🥑" />
      </ScrollView>
      <View style={styles.dots}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.dot, page === i && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    gap: 12,
    paddingVertical: 4,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: CalAi.card,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
  },
  icon: {
    fontSize: 22,
  },
  value: {
    fontSize: 13,
    fontWeight: '800',
    color: CalAi.text,
    marginTop: 10,
  },
  label: {
    fontSize: 11,
    color: CalAi.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CalAi.border,
  },
  dotActive: {
    backgroundColor: CalAi.accent,
    width: 8,
  },
});
