import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalAi } from '../constants/calAiTheme';
import { Meal, useNutrition } from '../context/NutritionContext';
import { estimateNutritionFromImage, GeminiScanError } from '../utils/gemini';

const { width } = Dimensions.get('window');

type ScanMode = 'scan-food' | 'barcode' | 'food-label' | 'library';

interface ScanModalProps {
  visible: boolean;
  onClose: () => void;
}

const SCAN_MODES: { id: ScanMode; label: string; icon: string }[] = [
  { id: 'scan-food', label: 'Scan Food', icon: '📷' },
  { id: 'barcode', label: 'Barcode', icon: '▮▮' },
  { id: 'food-label', label: 'Food Label', icon: '📋' },
  { id: 'library', label: 'Library', icon: '🖼️' },
];

/** Decorative positions for ingredient callouts on the photo */
const TAG_POSITIONS = [
  { top: '18%', left: '8%' },
  { top: '12%', right: '6%' },
  { top: '42%', left: '4%' },
  { top: '38%', right: '5%' },
  { top: '62%', left: '12%' },
  { top: '58%', right: '10%' },
];

export const ScanModal: React.FC<ScanModalProps> = ({ visible, onClose }) => {
  const { persona, addMeal } = useNutrition();
  const cameraRef = useRef<CameraView>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const [activeMode, setActiveMode] = useState<ScanMode>('scan-food');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<Omit<Meal, 'id' | 'timestamp' | 'date'> | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isEditing, setIsEditing] = useState(false);

  const [editedName, setEditedName] = useState('');
  const [editedCalories, setEditedCalories] = useState('');
  const [editedProtein, setEditedProtein] = useState('');
  const [editedCarbs, setEditedCarbs] = useState('');
  const [editedFats, setEditedFats] = useState('');

  const resetState = () => {
    setActiveMode('scan-food');
    setImageUri(null);
    setBase64Data(null);
    setScanning(false);
    setScannedResult(null);
    setScanError(null);
    setShowResults(false);
    setQuantity(1);
    setIsEditing(false);
    setEditedName('');
    setEditedCalories('');
    setEditedProtein('');
    setEditedCarbs('');
    setEditedFats('');
  };

  useEffect(() => {
    if (!visible) resetState();
  }, [visible]);

  useEffect(() => {
    if (visible && !showResults) {
      requestCameraPermission();
    }
  }, [visible, showResults, requestCameraPermission]);

  const requestLibraryPermission = async () => {
    const library = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!library.granted) {
      Alert.alert('Permissions Needed', 'Photo library access is required to upload food photos.');
      return false;
    }
    return true;
  };

  const captureFromLiveCamera = async () => {
    if (!cameraRef.current) {
      Alert.alert('Camera Error', 'Camera is not ready. Please try again.');
      return;
    }
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
      });
      if (!photo?.uri) return;

      setImageUri(photo.uri);
      setBase64Data(photo.base64 ?? null);
      setScanError(null);
      setShowResults(false);
      triggerScanning(photo.base64 ?? null);
    } catch {
      Alert.alert('Error', 'Could not capture photo. Please try again.');
    }
  };

  const applyScanResult = (result: Omit<Meal, 'id' | 'timestamp' | 'date'>) => {
    setScannedResult(result);
    setEditedName(result.name);
    setEditedCalories(String(result.calories));
    setEditedProtein(String(result.protein));
    setEditedCarbs(String(result.carbs));
    setEditedFats(String(result.fats));
    setShowResults(true);
  };

  const triggerScanning = async (b64: string | null) => {
    if (!b64) {
      Alert.alert('Scan Failed', 'Could not process the selected image.');
      return;
    }
    setScanning(true);
    setScanError(null);
    setScannedResult(null);
    setShowResults(false);
    try {
      const result = await estimateNutritionFromImage(b64, persona);
      applyScanResult(result);
    } catch (error) {
      const message =
        error instanceof GeminiScanError
          ? error.message
          : 'Could not analyze this image. Please try again.';
      setScanError(message);
    } finally {
      setScanning(false);
    }
  };

  const pickFromLibrary = async () => {
    const ok = await requestLibraryPermission();
    if (!ok) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        setImageUri(result.assets[0].uri);
        setBase64Data(result.assets[0].base64 ?? null);
        setScanError(null);
        setShowResults(false);
        triggerScanning(result.assets[0].base64 ?? null);
      }
    } catch {
      Alert.alert('Error', 'Could not open the gallery.');
    }
  };

  const handleShutter = async () => {
    if (scanning) return;

    if (activeMode === 'library') {
      pickFromLibrary();
      return;
    }
    if (activeMode === 'barcode' || activeMode === 'food-label') {
      Alert.alert(
        'Coming Soon',
        `${activeMode === 'barcode' ? 'Barcode' : 'Food Label'} scanning will be available in a future update.`
      );
      return;
    }

    if (Platform.OS === 'web') {
      pickFromLibrary();
      return;
    }

    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert('Camera Required', 'Enable camera access in settings to scan food.');
      }
      return;
    }

    if (imageUri) {
      setImageUri(null);
      setBase64Data(null);
      setScanError(null);
      return;
    }

    await captureFromLiveCamera();
  };

  const handleModePress = (mode: ScanMode) => {
    setActiveMode(mode);
    if (mode === 'library') pickFromLibrary();
  };

  const handleLogMeal = () => {
    if (!scannedResult) return;
    const mult = quantity;

    addMeal({
      name: editedName,
      category: scannedResult.category,
      calories: Math.round((Number(editedCalories) || scannedResult.calories) * mult),
      protein: Math.round((Number(editedProtein) || scannedResult.protein) * mult),
      carbs: Math.round((Number(editedCarbs) || scannedResult.carbs) * mult),
      fats: Math.round((Number(editedFats) || scannedResult.fats) * mult),
      imageUri: imageUri ?? undefined,
      ingredients: scannedResult.ingredients,
      healthAdvice: scannedResult.healthAdvice,
    });

    Alert.alert('Logged!', `${editedName} added to your daily intake.`, [
      { text: 'Done', onPress: () => { resetState(); onClose(); } },
    ]);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleBackFromResults = () => {
    setShowResults(false);
    setIsEditing(false);
    setImageUri(null);
    setBase64Data(null);
    setScannedResult(null);
    setScanError(null);
  };

  const timeLabel = useMemo(
    () =>
      new Date().toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      }).toLowerCase(),
    [showResults]
  );

  const ingredientTags = scannedResult?.ingredients?.slice(0, 6) ?? [];

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <StatusBar barStyle={showResults ? 'dark-content' : 'light-content'} />

      {showResults && scannedResult ? (
        <NutritionResultsView
          imageUri={imageUri}
          timeLabel={timeLabel}
          quantity={quantity}
          setQuantity={setQuantity}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          editedName={editedName}
          setEditedName={setEditedName}
          editedCalories={editedCalories}
          setEditedCalories={setEditedCalories}
          editedProtein={editedProtein}
          setEditedProtein={setEditedProtein}
          editedCarbs={editedCarbs}
          setEditedCarbs={setEditedCarbs}
          editedFats={editedFats}
          setEditedFats={setEditedFats}
          scannedResult={scannedResult}
          onBack={handleBackFromResults}
          onDone={handleLogMeal}
          onRetry={() => base64Data && triggerScanning(base64Data)}
        />
      ) : (
        <View style={styles.cameraRoot}>
          <SafeAreaView style={styles.cameraSafe} edges={['top', 'bottom']}>
            <View style={styles.cameraHeader}>
              <TouchableOpacity style={styles.headerCircleBtn} onPress={handleClose}>
                <Text style={styles.headerBtnText}>✕</Text>
              </TouchableOpacity>
              <View style={styles.brandCenter}>
                <Text style={styles.brandApple}>🍎</Text>
                <Text style={styles.brandTitle}>Cal AI</Text>
              </View>
              <TouchableOpacity
                style={styles.headerCircleBtn}
                onPress={() => Alert.alert('Help', 'Point your camera at food and tap the shutter. Cal AI will estimate calories and macros.')}
              >
                <Text style={styles.headerBtnText}>?</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.viewfinder}>
              {imageUri ? (
                <>
                  <Image source={{ uri: imageUri }} style={styles.viewfinderImage} />
                  {scanning && (
                    <View style={styles.scanningOverlay}>
                      <ActivityIndicator size="large" color="#FFFFFF" />
                      <Text style={styles.scanningLabel}>Analyzing your meal...</Text>
                    </View>
                  )}
                  {!scanning &&
                    ingredientTags.map((ing, i) => {
                      const pos = TAG_POSITIONS[i % TAG_POSITIONS.length];
                      return (
                        <View
                          key={`${ing.name}-${i}`}
                          style={[styles.tagAnchor, pos as object]}
                        >
                          <View style={styles.tagLine} />
                          <View style={styles.tagBubble}>
                            <Text style={styles.tagText}>{ing.name}</Text>
                          </View>
                        </View>
                      );
                    })}
                  {!scanning && (
                    <TouchableOpacity style={styles.retakeBtn} onPress={handleBackFromResults}>
                      <Text style={styles.retakeBtnText}>↻ Retake</Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : cameraPermission?.granted ? (
                <CameraView ref={cameraRef} style={styles.viewfinderImage} facing="back" />
              ) : cameraPermission === null ? (
                <View style={styles.viewfinderPlaceholder}>
                  <ActivityIndicator size="large" color="#FFFFFF" />
                  <Text style={styles.placeholderText}>Starting camera...</Text>
                </View>
              ) : (
                <View style={styles.viewfinderPlaceholder}>
                  <Text style={styles.placeholderIcon}>📷</Text>
                  <Text style={styles.placeholderText}>Camera access needed</Text>
                  <TouchableOpacity
                    style={styles.permissionBtn}
                    onPress={requestCameraPermission}
                  >
                    <Text style={styles.permissionBtnText}>Enable Camera</Text>
                  </TouchableOpacity>
                </View>
              )}

              {scanError && !scanning && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText} numberOfLines={2}>{scanError}</Text>
                  <TouchableOpacity
                    style={styles.errorRetry}
                    onPress={() => base64Data && triggerScanning(base64Data)}
                  >
                    <Text style={styles.errorRetryText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.cameraControls}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.modeRow}
              >
                {SCAN_MODES.map((mode) => {
                  const active = activeMode === mode.id;
                  return (
                    <TouchableOpacity
                      key={mode.id}
                      style={[styles.modeChip, active && styles.modeChipActive]}
                      onPress={() => handleModePress(mode.id)}
                    >
                      <Text style={[styles.modeIcon, active && styles.modeIconActive]}>
                        {mode.icon}
                      </Text>
                      <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>
                        {mode.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.shutterRow}>
                <TouchableOpacity style={styles.flashBtn}>
                  <Text style={styles.flashIcon}>⚡</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.shutterBtn}
                  onPress={handleShutter}
                  disabled={scanning}
                >
                  {scanning ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <View style={styles.shutterInner} />
                  )}
                </TouchableOpacity>
                <View style={styles.flashBtn} />
              </View>
            </View>
          </SafeAreaView>
        </View>
      )}
    </Modal>
  );
};

interface NutritionResultsViewProps {
  imageUri: string | null;
  timeLabel: string;
  quantity: number;
  setQuantity: (n: number) => void;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  editedName: string;
  setEditedName: (s: string) => void;
  editedCalories: string;
  setEditedCalories: (s: string) => void;
  editedProtein: string;
  setEditedProtein: (s: string) => void;
  editedCarbs: string;
  setEditedCarbs: (s: string) => void;
  editedFats: string;
  setEditedFats: (s: string) => void;
  scannedResult: Omit<Meal, 'id' | 'timestamp' | 'date'>;
  onBack: () => void;
  onDone: () => void;
  onRetry: () => void;
}

function NutritionResultsView({
  imageUri,
  timeLabel,
  quantity,
  setQuantity,
  isEditing,
  setIsEditing,
  editedName,
  setEditedName,
  editedCalories,
  setEditedCalories,
  editedProtein,
  setEditedProtein,
  editedCarbs,
  setEditedCarbs,
  editedFats,
  setEditedFats,
  scannedResult,
  onBack,
  onDone,
  onRetry,
}: NutritionResultsViewProps) {
  return (
    <View style={styles.resultsRoot}>
      <SafeAreaView style={styles.resultsSafe} edges={['top']}>
        <View style={styles.resultsNav}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.resultsNavTitle}>Nutrition</Text>
          <View style={styles.navActions}>
            <TouchableOpacity style={styles.navIconBtn}>
              <Text style={styles.navIcon}>↗</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navIconBtn}>
              <Text style={styles.navIcon}>⋯</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.resultsScroll}
        contentContainerStyle={styles.resultsScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroImageWrap}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <Text style={{ fontSize: 48 }}>🍽️</Text>
            </View>
          )}
        </View>

        <View style={[styles.resultsCard, CalAi.shadow]}>
          <View style={styles.metaRow}>
            <Text style={styles.bookmark}>🔖</Text>
            <Text style={styles.timeText}>{timeLabel}</Text>
          </View>

          <View style={styles.titleRow}>
            {isEditing ? (
              <TextInput
                style={styles.nameInput}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Food name"
              />
            ) : (
              <Text style={styles.foodTitle} numberOfLines={2}>
                {editedName}
              </Text>
            )}
            <View style={styles.qtyStepper}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.caloriesHero, CalAi.shadow]}>
            <View style={styles.caloriesIconBox}>
              <Text style={styles.caloriesIcon}>🔥</Text>
            </View>
            <View>
              <Text style={styles.caloriesLabel}>Calories</Text>
              {isEditing ? (
                <TextInput
                  style={styles.caloriesBigInput}
                  value={editedCalories}
                  onChangeText={setEditedCalories}
                  keyboardType="numeric"
                />
              ) : (
                <Text style={styles.caloriesBig}>{editedCalories}</Text>
              )}
            </View>
          </View>

          <View style={styles.macroRow}>
            <MacroPill
              label="Protein"
              value={editedProtein}
              unit="g"
              color={CalAi.protein}
              icon="🍗"
              editing={isEditing}
              onChange={setEditedProtein}
            />
            <MacroPill
              label="Carbs"
              value={editedCarbs}
              unit="g"
              color={CalAi.carbs}
              icon="🌾"
              editing={isEditing}
              onChange={setEditedCarbs}
            />
            <MacroPill
              label="Fats"
              value={editedFats}
              unit="g"
              color={CalAi.fat}
              icon="🥑"
              editing={isEditing}
              onChange={setEditedFats}
            />
          </View>

          <View style={styles.ingredientsHeader}>
            <Text style={styles.ingredientsTitle}>Ingredients</Text>
            <Text style={styles.addMore}>+ Add more</Text>
          </View>

          {scannedResult.ingredients && scannedResult.ingredients.length > 0 ? (
            scannedResult.ingredients.map((ing, idx) => (
              <View key={idx} style={styles.ingredientItem}>
                <Text style={styles.ingredientName}>
                  {ing.name} · {ing.calories} cal
                </Text>
                <Text style={styles.ingredientSize}>{ing.size}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noIngredients}>No ingredients detected</Text>
          )}

          {scannedResult.healthAdvice ? (
            <View style={styles.adviceBox}>
              <Text style={styles.adviceTitle}>AI Coach</Text>
              <Text style={styles.adviceBody}>{scannedResult.healthAdvice}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.resultsFooter}>
        <TouchableOpacity
          style={styles.fixBtn}
          onPress={() => {
            if (isEditing) {
              onBack();
              onRetry();
            } else {
              setIsEditing(true);
            }
          }}
        >
          <Text style={styles.fixIcon}>✨</Text>
          <Text style={styles.fixText}>{isEditing ? 'Rescan' : 'Fix Results'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.doneBtn} onPress={onDone}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

function MacroPill({
  label,
  value,
  unit,
  color,
  icon,
  editing,
  onChange,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
  icon: string;
  editing: boolean;
  onChange: (s: string) => void;
}) {
  return (
    <View style={styles.macroPill}>
      <Text style={styles.macroPillIcon}>{icon}</Text>
      <Text style={styles.macroPillLabel}>{label}</Text>
      {editing ? (
        <TextInput
          style={[styles.macroPillInput, { color }]}
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
        />
      ) : (
        <Text style={[styles.macroPillValue, { color }]}>
          {value}
          {unit}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cameraRoot: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  cameraSafe: {
    flex: 1,
  },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  brandCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandApple: {
    fontSize: 18,
    marginRight: 6,
  },
  brandTitle: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
  },
  viewfinder: {
    flex: 1,
    marginHorizontal: 0,
    position: 'relative',
    backgroundColor: '#111',
  },
  viewfinderImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  viewfinderPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
  },
  placeholderIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  placeholderText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  permissionBtn: {
    marginTop: 16,
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  permissionBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
  },
  retakeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retakeBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanningLabel: {
    color: '#FFF',
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  tagAnchor: {
    position: 'absolute',
    alignItems: 'center',
  },
  tagLine: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  tagBubble: {
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 2,
  },
  tagText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '700',
  },
  errorBanner: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(220,38,38,0.92)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorBannerText: {
    flex: 1,
    color: '#FFF',
    fontSize: 12,
    marginRight: 8,
  },
  errorRetry: {
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  errorRetryText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 12,
  },
  cameraControls: {
    backgroundColor: '#0A0A0A',
    paddingTop: 12,
    paddingBottom: 8,
  },
  modeRow: {
    paddingHorizontal: 12,
    gap: 8,
    paddingBottom: 16,
  },
  modeChip: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 72,
  },
  modeChipActive: {
    backgroundColor: '#FFF',
  },
  modeIcon: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 4,
  },
  modeIconActive: {
    color: '#000',
  },
  modeLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  modeLabelActive: {
    color: '#000',
    fontWeight: '700',
  },
  shutterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
  },
  flashBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashIcon: {
    fontSize: 20,
    opacity: 0.5,
  },
  shutterBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 32,
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: '#E5E5EA',
  },
  resultsRoot: {
    flex: 1,
    backgroundColor: CalAi.bg,
  },
  resultsSafe: {
    backgroundColor: CalAi.card,
  },
  resultsNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: CalAi.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 22,
    color: CalAi.text,
  },
  resultsNavTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: CalAi.text,
  },
  navActions: {
    flexDirection: 'row',
    gap: 4,
  },
  navIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CalAi.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 16,
    color: CalAi.text,
  },
  resultsScroll: {
    flex: 1,
  },
  resultsScrollContent: {
    paddingBottom: 24,
  },
  heroImageWrap: {
    alignItems: 'center',
    marginTop: -40,
    marginBottom: -60,
    zIndex: 1,
  },
  heroImage: {
    width: width * 0.72,
    height: width * 0.72,
    borderRadius: width * 0.36,
    backgroundColor: CalAi.border,
  },
  heroPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsCard: {
    backgroundColor: CalAi.card,
    marginHorizontal: 16,
    marginTop: 0,
    borderRadius: 28,
    padding: 20,
    paddingTop: 72,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookmark: {
    fontSize: 14,
    marginRight: 6,
  },
  timeText: {
    fontSize: 13,
    color: CalAi.textSecondary,
    fontWeight: '500',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  foodTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: CalAi.text,
    letterSpacing: -0.3,
  },
  nameInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: CalAi.text,
    borderBottomWidth: 1,
    borderBottomColor: CalAi.border,
    paddingVertical: 4,
  },
  qtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CalAi.bg,
    borderRadius: 12,
    padding: 4,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: CalAi.text,
  },
  qtyValue: {
    fontSize: 16,
    fontWeight: '800',
    minWidth: 24,
    textAlign: 'center',
    color: CalAi.text,
  },
  caloriesHero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CalAi.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: CalAi.border,
  },
  caloriesIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: CalAi.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  caloriesIcon: {
    fontSize: 22,
  },
  caloriesLabel: {
    fontSize: 13,
    color: CalAi.textSecondary,
    marginBottom: 2,
  },
  caloriesBig: {
    fontSize: 36,
    fontWeight: '900',
    color: CalAi.text,
    letterSpacing: -1,
  },
  caloriesBigInput: {
    fontSize: 32,
    fontWeight: '900',
    color: CalAi.text,
    minWidth: 100,
    padding: 0,
  },
  macroRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  macroPill: {
    flex: 1,
    backgroundColor: CalAi.bg,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  macroPillIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  macroPillLabel: {
    fontSize: 11,
    color: CalAi.textSecondary,
    marginBottom: 4,
  },
  macroPillValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  macroPillInput: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    minWidth: 48,
    padding: 0,
  },
  ingredientsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ingredientsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: CalAi.text,
  },
  addMore: {
    fontSize: 14,
    color: CalAi.textSecondary,
    fontWeight: '600',
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: CalAi.bg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  ingredientName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: CalAi.text,
  },
  ingredientSize: {
    fontSize: 13,
    color: CalAi.textSecondary,
    marginLeft: 8,
  },
  noIngredients: {
    fontSize: 13,
    color: CalAi.textMuted,
    marginBottom: 12,
  },
  adviceBox: {
    backgroundColor: CalAi.bg,
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
  },
  adviceTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: CalAi.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  adviceBody: {
    fontSize: 13,
    color: CalAi.text,
    lineHeight: 19,
  },
  resultsFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: CalAi.card,
    borderTopWidth: 1,
    borderTopColor: CalAi.border,
  },
  fixBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: CalAi.border,
    backgroundColor: CalAi.card,
    gap: 6,
  },
  fixIcon: {
    fontSize: 14,
  },
  fixText: {
    fontSize: 15,
    fontWeight: '700',
    color: CalAi.text,
  },
  doneBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 28,
    backgroundColor: CalAi.accent,
  },
  doneText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
  },
});
