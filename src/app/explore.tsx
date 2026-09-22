import * as ImagePicker from 'expo-image-picker';
import { useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalAi } from '../constants/calAiTheme';
import { useNutrition } from '../context/NutritionContext';
import { getWeeklyCalorieData } from '../utils/weeklyCalories';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const {
    progressPhotos,
    addProgressPhoto,
    meals,
    goals,
    weightGoal,
    getStreak,
    getDailyAverageCalories,
  } = useNutrition();

  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [tempImageUri, setTempImageUri] = useState<string | null>(null);
  const [weightInput, setWeightInput] = useState('');
  const [hideWeight, setHideWeight] = useState(false);
  const [compareIndex, setCompareIndex] = useState(0);

  const streak = getStreak();
  const dailyAvg = getDailyAverageCalories();
  const latestWeight = progressPhotos.find((p) => p.weight)?.weight;
  const chartData = getWeeklyCalorieData(meals);
  const maxCalorieVal = Math.max(...chartData.map((d) => d.kcal), goals.calories, 1);

  const weekDays = useMemo(() => {
    const labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const today = new Date();
    return labels.map((label, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const key = d.toISOString().split('T')[0];
      const logged = meals.some((m) => m.date === key);
      return { label, logged };
    });
  }, [meals]);

  const requestPermissions = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return cameraPermission.granted && libraryPermission.granted;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert('Permissions Required', 'Please enable camera permissions.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      setTempImageUri(result.assets[0].uri);
      setPhotoModalVisible(true);
    }
  };

  const handleSaveProgressPhoto = () => {
    if (!tempImageUri) return;
    const parsedWeight = parseFloat(weightInput);
    addProgressPhoto(tempImageUri, isNaN(parsedWeight) ? undefined : parsedWeight);
    setTempImageUri(null);
    setWeightInput('');
    setPhotoModalVisible(false);
    Alert.alert('Logged!', 'Progress photo saved.');
  };

  const comparePhoto = progressPhotos[compareIndex];
  const comparePhotoB = progressPhotos[compareIndex + 1] ?? progressPhotos[0];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={CalAi.bg} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Text style={styles.pageTitle}>Progress</Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.topRow}>
            <View style={[styles.weightCard, CalAi.shadow]}>
              <Text style={styles.cardLabel}>Your Weight</Text>
              <Text style={styles.weightValue}>
                {latestWeight != null ? `${latestWeight} kg` : '—'}
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: latestWeight
                        ? `${Math.min((latestWeight / weightGoal) * 100, 100)}%`
                        : '0%',
                    },
                  ]}
                />
              </View>
              <Text style={styles.goalText}>Goal {weightGoal} kg</Text>
              <TouchableOpacity style={styles.logWeightBtn} onPress={handleTakePhoto}>
                <Text style={styles.logWeightText}>Log Weight</Text>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.streakCard, CalAi.shadow]}>
              <Text style={styles.streakBig}>🔥</Text>
              <Text style={styles.streakNum}>{streak}</Text>
              <Text style={styles.streakLabel}>Day Streak</Text>
              <View style={styles.weekDots}>
                {weekDays.map((d, i) => (
                  <View key={i} style={styles.dotCol}>
                    <View style={[styles.dot, d.logged && styles.dotActive]}>
                      {d.logged && <Text style={styles.dotCheck}>✓</Text>}
                    </View>
                    <Text style={styles.dotLabel}>{d.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={[styles.chartCard, CalAi.shadow]}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Weekly Calories</Text>
              <Text style={styles.chartTarget}>Target {goals.calories} kcal</Text>
            </View>
            <View style={styles.chartBars}>
              {chartData.map((d) => {
                const h = d.kcal > 0 ? Math.min((d.kcal / maxCalorieVal) * 100, 100) : 4;
                return (
                  <View key={d.dateKey} style={styles.chartCol}>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${h}%`,
                            backgroundColor: d.kcal > goals.calories ? CalAi.protein : CalAi.accent,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.barDay}>{d.day.slice(0, 3)}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {progressPhotos.length >= 2 && (
            <View style={[styles.compareCard, CalAi.shadow]}>
              <Text style={styles.compareTitle}>Compare</Text>
              <View style={styles.compareRow}>
                <View style={styles.compareImgWrap}>
                  <Image source={{ uri: comparePhotoB.imageUri }} style={styles.compareImg} />
                  {!hideWeight && comparePhotoB.weight != null && (
                    <View style={styles.compareOverlay}>
                      <Text style={styles.compareWeight}>{comparePhotoB.weight} kg</Text>
                      <Text style={styles.compareDate}>{comparePhotoB.date}</Text>
                    </View>
                  )}
                </View>
                <View style={[styles.compareImgWrap, styles.compareSelected]}>
                  <Image source={{ uri: comparePhoto.imageUri }} style={styles.compareImg} />
                  {!hideWeight && comparePhoto.weight != null && (
                    <View style={styles.compareOverlay}>
                      <Text style={styles.compareWeight}>{comparePhoto.weight} kg</Text>
                      <Text style={styles.compareDate}>{comparePhoto.date}</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.hideWeightRow}>
                <Text style={styles.hideWeightText}>Hide weight</Text>
                <Switch value={hideWeight} onValueChange={setHideWeight} />
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbs}>
                {progressPhotos.map((p, i) => (
                  <TouchableOpacity key={p.id} onPress={() => setCompareIndex(i)}>
                    <Image
                      source={{ uri: p.imageUri }}
                      style={[styles.thumb, compareIndex === i && styles.thumbSelected]}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={[styles.avgCard, CalAi.shadow]}>
            <Text style={styles.avgLabel}>Daily Average Calories</Text>
            <View style={styles.avgRow}>
              <Text style={styles.avgValue}>{dailyAvg} cal</Text>
              {dailyAvg > 0 && (
                <Text style={styles.avgTrend}>↑ {Math.min(100, Math.round((dailyAvg / goals.calories) * 100))}%</Text>
              )}
            </View>
          </View>

          {progressPhotos.length === 0 && (
            <TouchableOpacity style={[styles.emptyCta, CalAi.shadow]} onPress={handleTakePhoto}>
              <Text style={styles.emptyCtaText}>+ Log first progress photo</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>

      <Modal visible={photoModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, CalAi.shadow]}>
            <Text style={styles.modalTitle}>Log Progress</Text>
            {tempImageUri && (
              <Image source={{ uri: tempImageUri }} style={styles.modalPreview} />
            )}
            <TextInput
              style={styles.weightInput}
              placeholder="Weight (kg)"
              placeholderTextColor={CalAi.textMuted}
              value={weightInput}
              onChangeText={setWeightInput}
              keyboardType="numeric"
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => {
                  setTempImageUri(null);
                  setPhotoModalVisible(false);
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleSaveProgressPhoto}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CalAi.bg },
  safeArea: { flex: 1 },
  pageTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: CalAi.text,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    letterSpacing: -0.5,
  },
  scroll: { paddingHorizontal: 20, paddingBottom: 120 },
  topRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  weightCard: {
    flex: 1.2,
    backgroundColor: CalAi.card,
    borderRadius: 20,
    padding: 16,
  },
  cardLabel: { fontSize: 13, color: CalAi.textSecondary, fontWeight: '600' },
  weightValue: {
    fontSize: 28,
    fontWeight: '900',
    color: CalAi.text,
    marginVertical: 8,
    letterSpacing: -0.5,
  },
  progressTrack: {
    height: 6,
    backgroundColor: CalAi.ringTrack,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: { height: '100%', backgroundColor: CalAi.accent, borderRadius: 3 },
  goalText: { fontSize: 11, color: CalAi.textSecondary, marginBottom: 12 },
  logWeightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CalAi.accent,
    borderRadius: 20,
    paddingVertical: 10,
    gap: 4,
  },
  logWeightText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  arrow: { color: '#FFF', fontSize: 16 },
  streakCard: {
    flex: 1,
    backgroundColor: CalAi.card,
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
  },
  streakBig: { fontSize: 28 },
  streakNum: { fontSize: 28, fontWeight: '900', color: CalAi.text },
  streakLabel: { fontSize: 11, color: CalAi.textSecondary, marginBottom: 8 },
  weekDots: { flexDirection: 'row', gap: 4 },
  dotCol: { alignItems: 'center' },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: CalAi.ringTrack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: { backgroundColor: CalAi.streak },
  dotCheck: { fontSize: 10, color: '#FFF', fontWeight: '800' },
  dotLabel: { fontSize: 9, color: CalAi.textMuted, marginTop: 2 },
  chartCard: {
    backgroundColor: CalAi.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  chartTitle: { fontSize: 15, fontWeight: '800', color: CalAi.text },
  chartTarget: { fontSize: 11, color: CalAi.textSecondary },
  chartBars: {
    flexDirection: 'row',
    height: 120,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  chartCol: { flex: 1, alignItems: 'center' },
  barTrack: {
    width: 24,
    height: 100,
    backgroundColor: CalAi.bg,
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: { width: '100%', borderRadius: 8 },
  barDay: { fontSize: 10, color: CalAi.textMuted, marginTop: 6, fontWeight: '600' },
  compareCard: {
    backgroundColor: CalAi.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  compareTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12, color: CalAi.text },
  compareRow: { flexDirection: 'row', gap: 10, height: 200 },
  compareImgWrap: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  compareSelected: { borderWidth: 2, borderColor: CalAi.accent },
  compareImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  compareOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  compareWeight: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  compareDate: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
  hideWeightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  hideWeightText: { fontSize: 14, fontWeight: '600', color: CalAi.text },
  thumbs: { marginTop: 4 },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginRight: 8,
  },
  thumbSelected: { borderWidth: 2, borderColor: CalAi.accent },
  avgCard: {
    backgroundColor: CalAi.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  avgLabel: { fontSize: 14, color: CalAi.textSecondary, fontWeight: '600' },
  avgRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 6 },
  avgValue: { fontSize: 32, fontWeight: '900', color: CalAi.text },
  avgTrend: { fontSize: 14, color: CalAi.success, fontWeight: '700' },
  emptyCta: {
    backgroundColor: CalAi.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  emptyCtaText: { fontSize: 15, fontWeight: '700', color: CalAi.text },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: CalAi.card,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16, color: CalAi.text },
  modalPreview: { width: 160, height: 160, borderRadius: 16, marginBottom: 16 },
  weightInput: {
    width: '100%',
    backgroundColor: CalAi.bg,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: CalAi.text,
    marginBottom: 16,
  },
  modalBtns: { flexDirection: 'row', gap: 10, width: '100%' },
  modalCancel: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: CalAi.bg,
    alignItems: 'center',
  },
  modalCancelText: { color: CalAi.textSecondary, fontWeight: '700' },
  modalSave: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: CalAi.accent,
    alignItems: 'center',
  },
  modalSaveText: { color: '#FFF', fontWeight: '800' },
});
