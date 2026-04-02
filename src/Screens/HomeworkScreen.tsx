import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../Context/ThemeContext';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {
  ChevronLeft,
  BookOpen,
  Sparkles,
  Zap,
  LayoutGrid,
  CheckCircle2,
  ArrowRight,
  Target,
  BarChart3,
  Hash
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface ClassItem {
  id: string;
  className: string;
  subject: string;
}

const HomeworkScreen = ({ navigation }: any) => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const currentUid = auth().currentUser?.uid;

  // States
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  
  // Form States
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState('10');
  const [difficulty, setDifficulty] = useState('Medium');

  const difficulties = ['Easy', 'Medium', 'Hard', 'Expert'];

  useEffect(() => {
    if (!currentUid) return;
    const unsubscribe = firestore()
      .collection('users')
      .doc(currentUid)
      .collection('classes')
      .onSnapshot(snap => {
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClassItem));
        setClasses(list);
        setLoading(false);
      });
    return () => unsubscribe();
  }, [currentUid]);

  const handleGenerate = () => {
    // Logic for AI Generation would go here
    console.log(`Generating ${questions} ${difficulty} questions for ${topic}`);
    navigation.navigate('Home'); // Placeholder navigation
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => selectedClass ? setSelectedClass(null) : navigation.goBack()}
          style={[styles.iconBtn, { backgroundColor: theme.colors.surface }]}
        >
          <ChevronLeft color={theme.colors.text} size={22} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {selectedClass ? "Configure Assignment" : "Select Class"}
        </Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
        
        {!selectedClass ? (
          <>
            {/* STEP 1: CLASS SELECTION */}
            <View style={styles.heroWrapper}>
              <View style={styles.heroTextContent}>
                <Text style={[styles.heroHeading, { color: theme.colors.text }]}>Homework{'\n'}Lab</Text>
                <View style={[styles.heroBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Text style={[styles.heroBadgeText, { color: theme.colors.primary }]}>AI Question Engine</Text>
                </View>
              </View>
              <View style={styles.visualContainer}>
                <View style={[styles.iconBox, { backgroundColor: theme.colors.surface }]}>
                  <Sparkles color={theme.colors.primary} size={48} strokeWidth={1.5} />
                </View>
                <View style={[styles.dash, styles.dashTL, { borderColor: theme.colors.primary }]} />
                <View style={[styles.dash, styles.dashBR, { borderColor: theme.colors.primary }]} />
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Your Active Classes</Text>
            </View>

            {loading ? <ActivityIndicator color={theme.colors.primary} /> : (
              <View style={styles.grid}>
                {classes.map(item => (
                  <TouchableOpacity 
                    key={item.id}
                    onPress={() => setSelectedClass(item)}
                    style={[styles.classCard, { backgroundColor: theme.colors.surface }]}
                  >
                    <View style={[styles.miniIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                      <BookOpen color={theme.colors.primary} size={20} />
                    </View>
                    <Text style={[styles.className, { color: theme.colors.text }]}>{item.className}</Text>
                    <Text style={[styles.classSub, { color: theme.colors.textSecondary }]}>{item.subject}</Text>
                    <ArrowRight color={theme.colors.textSecondary} size={16} style={styles.arrow} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        ) : (
          <>
            {/* STEP 2: CONFIGURATION FORM */}
            <View style={[styles.selectionPreview, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.previewLabel, { color: theme.colors.primary }]}>ASSIGNING TO</Text>
                <Text style={[styles.previewTitle, { color: theme.colors.text }]}>{selectedClass.className} • {selectedClass.subject}</Text>
            </View>

            <View style={styles.form}>
              <StudioInput 
                label="Assignment Topic" 
                icon={<Target size={18} />} 
                placeholder="e.g. Thermodynamics Laws"
                value={topic}
                onChange={setTopic}
                theme={theme}
              />

              <StudioInput 
                label="Number of Questions" 
                icon={<Hash size={18} />} 
                placeholder="10"
                keyboardType="numeric"
                value={questions}
                onChange={setQuestions}
                theme={theme}
              />

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>DIFFICULTY LEVEL</Text>
                <View style={styles.diffRow}>
                  {difficulties.map(d => (
                    <TouchableOpacity 
                      key={d} 
                      onPress={() => setDifficulty(d)}
                      style={[
                        styles.diffChip, 
                        { backgroundColor: difficulty === d ? theme.colors.primary : theme.colors.surface }
                      ]}
                    >
                      <Text style={[
                        styles.diffText, 
                        { color: difficulty === d ? theme.colors.background : theme.colors.text }
                      ]}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity 
                onPress={handleGenerate}
                style={[styles.generateBtn, { backgroundColor: theme.colors.text }]}
              >
                <Zap color={theme.colors.background} size={20} fill={theme.colors.background} />
                <Text style={[styles.generateBtnText, { color: theme.colors.background }]}>INITIALIZE AI GEN</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const StudioInput = ({ label, icon, theme, onChange, ...props }: any) => (
  <View style={styles.inputGroup}>
    <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>{label.toUpperCase()}</Text>
    <View style={[styles.inputWrapper, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.inputIcon}>{React.cloneElement(icon, { color: theme.colors.primary })}</View>
      <TextInput 
        style={[styles.textInput, { color: theme.colors.text }]}
        placeholderTextColor={theme.colors.textSecondary + '60'}
        onChangeText={onChange}
        {...props}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 15 },
  headerTitle: { fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  iconBtn: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  scrollPadding: { paddingHorizontal: 24, paddingBottom: 100 },
  
  heroWrapper: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 20 },
  heroTextContent: { flex: 1 },
  heroHeading: { fontSize: 44, fontWeight: 'bold', lineHeight: 48, letterSpacing: -2 },
  heroBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 10 },
  heroBadgeText: { fontSize: 11, fontWeight: 'bold' },
  visualContainer: { width: 100, height: 100, alignItems: 'center', justifyContent: 'center' },
  iconBox: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  dash: { position: 'absolute', width: 20, height: 20, borderStyle: 'dashed', borderWidth: 1.5, borderRadius: 6 },
  dashTL: { top: 0, left: 0, transform: [{ rotate: '-15deg' }] },
  dashBR: { bottom: 0, right: 0, transform: [{ rotate: '15deg' }] },

  sectionHeader: { marginTop: 30, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', letterSpacing: -0.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  classCard: { width: (width - 60) / 2, padding: 20, borderRadius: 28 },
  miniIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  className: { fontSize: 16, fontWeight: '800' },
  classSub: { fontSize: 12, marginTop: 4, fontWeight: '600', opacity: 0.7 },
  arrow: { marginTop: 15 },

  selectionPreview: { padding: 20, borderRadius: 24, marginTop: 10, marginBottom: 30 },
  previewLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  previewTitle: { fontSize: 16, fontWeight: '700', marginTop: 5 },

  form: { gap: 25 },
  inputGroup: { gap: 10 },
  inputLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginLeft: 5 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', height: 65, borderRadius: 20, paddingHorizontal: 18 },
  inputIcon: { marginRight: 15 },
  textInput: { flex: 1, fontSize: 16, fontWeight: '700' },

  diffRow: { flexDirection: 'row', justifyContent: 'space-between' },
  diffChip: { flex: 1, marginHorizontal: 4, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  diffText: { fontSize: 12, fontWeight: '800' },

  generateBtn: { 
    height: 70, 
    borderRadius: 24, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 12,
    marginTop: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 15
  },
  generateBtnText: { fontSize: 16, fontWeight: '900', letterSpacing: 1 }
});

export default HomeworkScreen;