import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { User, Flame, Award, Briefcase, Zap, Check } from 'lucide-react-native';
import { useNutrition, UserPersona } from '../context/NutritionContext';

const { width } = Dimensions.get('window');

interface OnboardingModalProps {
  visible: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ visible, onClose }) => {
  const { persona, changePersona } = useNutrition();

  const personas = [
    {
      id: 'beginner' as UserPersona,
      title: 'Fitness Beginner',
      desc: 'Learn the basics of balanced nutrition. Simple tips, no stress.',
      icon: User,
      color: '#3B82F6', // Blue
      bg: 'rgba(59, 130, 246, 0.1)',
      border: 'rgba(59, 130, 246, 0.3)',
      activeBorder: '#3B82F6',
    },
    {
      id: 'dieter' as UserPersona,
      title: 'Dieter & Weight Loss',
      desc: 'Maximize satiety in a calorie deficit. Avoid hidden sugar traps.',
      icon: Flame,
      color: '#10B981', // Emerald Green
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.3)',
      activeBorder: '#10B981',
    },
    {
      id: 'athlete' as UserPersona,
      title: 'Athlete & Builder',
      desc: 'High protein and optimized carbs to power repair and recovery.',
      icon: Award,
      color: '#EF4444', // Red / Rose
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.3)',
      activeBorder: '#EF4444',
    },
    {
      id: 'busypro' as UserPersona,
      title: 'Busy Professional',
      desc: 'Quick, nutrient-dense meals. Keep cognitive focus sharp.',
      icon: Briefcase,
      color: '#F59E0B', // Amber / Gold
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.3)',
      activeBorder: '#F59E0B',
    },
  ];

  const handleSelect = (id: UserPersona) => {
    changePersona(id);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.headerIndicator} />
          
          <View style={styles.header}>
            <Text style={styles.title}>Tailor Your AI Experience</Text>
            <Text style={styles.subtitle}>
              Cal Ai uses Gemini AI to give you personalized health insights based on your fitness focus.
            </Text>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {personas.map((item) => {
              const Icon = item.icon;
              const isSelected = persona === item.id;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.card,
                    { backgroundColor: item.bg, borderColor: isSelected ? item.activeBorder : item.border },
                    isSelected && styles.selectedCard,
                  ]}
                  onPress={() => handleSelect(item.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardContent}>
                    <View style={[styles.iconContainer, { backgroundColor: isSelected ? item.color : 'rgba(255,255,255,0.05)' }]}>
                      <Icon size={22} color={isSelected ? '#FFFFFF' : item.color} />
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={[styles.cardTitle, isSelected && styles.selectedCardTitle]}>{item.title}</Text>
                      <Text style={styles.cardDesc}>{item.desc}</Text>
                    </View>
                  </View>
                  {isSelected && (
                    <View style={[styles.checkCircle, { backgroundColor: item.color }]}>
                      <Check size={12} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.9}>
            <Zap size={18} color="#000000" fill="#000000" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Activate Premium Scanning</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#0F172A', // Dark Slate
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  headerIndicator: {
    width: 48,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  scroll: {
    marginBottom: 24,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  selectedCard: {
    transform: [{ scale: 1.01 }],
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    paddingRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 4,
  },
  selectedCardTitle: {
    color: '#FFFFFF',
  },
  cardDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
});
