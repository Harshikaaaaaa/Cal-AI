import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Trash2, ChevronDown, ChevronUp, Sparkles, Utensils, Award, Store, Package, Coffee } from 'lucide-react-native';
import { Meal, useNutrition } from '../context/NutritionContext';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface MealCardProps {
  meal: Meal;
}

export const MealCard: React.FC<MealCardProps> = ({ meal }) => {
  const { deleteMeal } = useNutrition();
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  // Get category icon and colors
  const getCategoryMeta = (cat: Meal['category']) => {
    switch (cat) {
      case 'Home-cooked':
        return { icon: Utensils, color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' };
      case 'Restaurant':
        return { icon: Store, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' };
      case 'Packaged':
        return { icon: Package, color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' };
      case 'Snacks & Drinks':
        default:
        return { icon: Coffee, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' };
    }
  };

  const meta = getCategoryMeta(meal.category);
  const CategoryIcon = meta.icon;

  return (
    <View style={styles.card}>
      {/* Primary Card View */}
      <TouchableOpacity 
        style={styles.mainContainer} 
        onPress={toggleExpand} 
        activeOpacity={0.9}
      >
        {/* Meal Photo / Placeholder */}
        {meal.imageUri ? (
          <Image source={{ uri: meal.imageUri }} style={styles.mealImage} />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: meta.bg }]}>
            <CategoryIcon size={24} color={meta.color} />
          </View>
        )}

        {/* Meal Details */}
        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.mealName} numberOfLines={1}>
              {meal.name}
            </Text>
            <TouchableOpacity 
              onPress={() => deleteMeal(meal.id)}
              style={styles.deleteButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Trash2 size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.metaRow}>
            <View style={[styles.categoryBadge, { backgroundColor: meta.bg }]}>
              <Text style={[styles.categoryText, { color: meta.color }]}>{meal.category}</Text>
            </View>
            <Text style={styles.timestamp}>{meal.timestamp}</Text>
          </View>

          {/* Calorie & Macro Pills */}
          <View style={styles.nutritionRow}>
            <View style={styles.calorieBadge}>
              <Text style={styles.calorieText}>{meal.calories} kcal</Text>
            </View>

            <View style={styles.macroPills}>
              <View style={[styles.macroPill, { borderColor: 'rgba(239, 68, 68, 0.2)' }]}>
                <Text style={[styles.macroPillText, { color: '#EF4444' }]}>P: {meal.protein}g</Text>
              </View>
              <View style={[styles.macroPill, { borderColor: 'rgba(59, 130, 246, 0.2)' }]}>
                <Text style={[styles.macroPillText, { color: '#3B82F6' }]}>C: {meal.carbs}g</Text>
              </View>
              <View style={[styles.macroPill, { borderColor: 'rgba(245, 158, 11, 0.2)' }]}>
                <Text style={[styles.macroPillText, { color: '#F59E0B' }]}>F: {meal.fats}g</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Expandable Details Drawer */}
      {expanded && (
        <View style={styles.detailsDrawer}>
          <View style={styles.divider} />
          
          {/* Ingredients List */}
          {meal.ingredients && meal.ingredients.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Identified Ingredients</Text>
              {meal.ingredients.map((ing, idx) => (
                <View key={idx} style={styles.ingredientRow}>
                  <View style={styles.ingDot} />
                  <Text style={styles.ingName}>{ing.name}</Text>
                  <Text style={styles.ingSize}>{ing.size}</Text>
                  <Text style={styles.ingCal}>{ing.calories} kcal</Text>
                </View>
              ))}
            </View>
          )}

          {/* Gemini AI Advice Box */}
          {meal.healthAdvice && (
            <View style={styles.adviceContainer}>
              <View style={styles.adviceHeader}>
                <Sparkles size={16} color="#A78BFA" fill="#A78BFA" style={styles.adviceIcon} />
                <Text style={styles.adviceTitle}>Gemini Coach Review</Text>
              </View>
              <Text style={styles.adviceText}>{meal.healthAdvice}</Text>
            </View>
          )}

          {/* Collapse Indicator Button */}
          <TouchableOpacity style={styles.collapseButton} onPress={toggleExpand}>
            <Text style={styles.collapseText}>Collapse Details</Text>
            <ChevronUp size={14} color="#64748B" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  mainContainer: {
    flexDirection: 'row',
    padding: 14,
    alignItems: 'center',
  },
  mealImage: {
    width: 76,
    height: 76,
    borderRadius: 14,
  },
  imagePlaceholder: {
    width: 76,
    height: 76,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 14,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    paddingRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
  },
  timestamp: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calorieBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  calorieText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10B981',
  },
  macroPills: {
    flexDirection: 'row',
  },
  macroPill: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 4,
  },
  macroPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  detailsDrawer: {
    backgroundColor: '#151D30', // Slightly darker slate for expand contrast
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 12,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#A78BFA',
    marginRight: 8,
  },
  ingName: {
    fontSize: 13,
    color: '#E2E8F0',
    flex: 2,
  },
  ingSize: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
    textAlign: 'right',
  },
  ingCal: {
    fontSize: 12,
    color: '#94A3B8',
    flex: 1,
    textAlign: 'right',
    fontWeight: '600',
  },
  adviceContainer: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  adviceIcon: {
    marginRight: 6,
  },
  adviceTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#C084FC',
    flex: 1,
  },
  adviceText: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
  },
  collapseButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  collapseText: {
    fontSize: 12,
    color: '#64748B',
    marginRight: 4,
    fontWeight: '600',
  },
});
