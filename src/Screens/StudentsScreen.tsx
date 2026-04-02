import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert,
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
  Plus,
  Trash2,
  X,
  User,
  Mail,
  Phone,
  BookOpen,
  GraduationCap,
  Sun,
  Moon,
  Search,
  Zap
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  class: string;
}

const StudentsScreen = ({ navigation }: any) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const currentUid = auth().currentUser?.uid;

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    class: '',
  });

  // 1. FETCH STUDENTS FROM STUDIO
  useEffect(() => {
    if (!currentUid) return;

    const unsubscribe = firestore()
      .collection('users')
      .doc(currentUid)
      .collection('students')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Student[];
        setStudents(list);
        setLoading(false);
      }, error => {
        console.error(error);
        setLoading(false);
      });

    return () => unsubscribe();
  }, [currentUid]);

  const handleAddStudent = async () => {
    if (!formData.name || !formData.email) {
      Alert.alert("Error", "Please fill in the required fields.");
      return;
    }

    try {
      await firestore()
        .collection('users')
        .doc(currentUid)
        .collection('students')
        .add({
          ...formData,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

      setFormData({ name: '', email: '', phone: '', subject: '', class: '' });
      setShowAddModal(false);
    } catch (error) {
      Alert.alert("Sync Error", "Could not add student to Studio.");
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Remove Student", `Remove ${name} from your directory?`, [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          await firestore().collection('users').doc(currentUid).collection('students').doc(id).delete();
        } 
      }
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} transparent translucent />

      {/* STUDIO HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={[styles.iconBtn, { backgroundColor: theme.colors.surface }]}
        >
          <ChevronLeft color={theme.colors.text} size={22} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Directory</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={toggleTheme} style={[styles.iconBtn, { backgroundColor: theme.colors.surface }]}>
            {isDark ? <Sun color={theme.colors.accent} size={18} /> : <Moon color={theme.colors.textSecondary} size={18} />}
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setShowAddModal(true)} 
            style={[styles.iconBtn, { backgroundColor: theme.colors.primary }]}
          >
            <Plus color={theme.colors.background} size={20} strokeWidth={3} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.scrollPadding, { paddingBottom: insets.bottom + 120 }]}
      >
        {/* HERO SECTION */}
        <View style={styles.heroWrapper}>
          <View style={styles.heroTextContent}>
             <Text style={[styles.heroHeading, { color: theme.colors.text }]}>My{'\n'}Students</Text>
             <View style={[styles.heroBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                <Text style={[styles.heroBadgeText, { color: theme.colors.primary }]}>
                    {students.length} Total Enrolled
                </Text>
             </View>
          </View>
          
          <View style={styles.visualContainer}>
            <View style={[styles.iconBox, { backgroundColor: theme.colors.surface }]}>
                <User color={theme.colors.primary} size={48} strokeWidth={1.5} />
            </View>
            <View style={[styles.dash, styles.dashTL, { borderColor: theme.colors.primary }]} />
            <View style={[styles.dash, styles.dashBR, { borderColor: theme.colors.primary }]} />
          </View>
        </View>

        {/* QUICK STATS */}
        <View style={styles.statsRow}>
          <StatMiniCard label="ACTIVE" value={students.length.toString()} theme={theme} />
          <StatMiniCard label="GROUPS" value="04" theme={theme} />
          <StatMiniCard label="NEW" value="+2" theme={theme} />
        </View>

        {/* SEARCH BAR (Visual only for now) */}
        <View style={[styles.searchBox, { backgroundColor: theme.colors.surface }]}>
            <Search color={theme.colors.textSecondary} size={18} />
            <Text style={{ color: theme.colors.textSecondary, marginLeft: 10, fontWeight: '600' }}>Search Directory...</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>All Records</Text>
        </View>

        {/* STUDENT LIST */}
        {loading ? (
            <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} />
        ) : (
            <View style={styles.taskList}>
                {students.map((item) => (
                    <TouchableOpacity 
                        key={item.id}
                        onPress={() => navigation.navigate('StudentDetails', { studentId: item.id })}
                        style={[styles.taskCard, { backgroundColor: theme.colors.surface }]}
                    >
                        <View style={[styles.taskIcon, { backgroundColor: theme.colors.primary }]}>
                            <Text style={styles.avatarInitial}>{item.name.charAt(0)}</Text>
                        </View>
                        <View style={styles.taskTextWrapper}>
                            <Text style={[styles.taskTitle, { color: theme.colors.text }]}>{item.name}</Text>
                            <Text style={[styles.taskSub, { color: theme.colors.textSecondary }]}>{item.class} • {item.subject}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={styles.trashBtn}>
                            <Trash2 color="#FF4757" size={18} />
                        </TouchableOpacity>
                    </TouchableOpacity>
                ))}
            </View>
        )}
      </ScrollView>

      {/* STUDIO ADD MODAL */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContentWrapper}>
                <View style={[styles.modalCard, { backgroundColor: theme.colors.surface }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Add Student</Text>
                        <TouchableOpacity onPress={() => setShowAddModal(false)}>
                            <X color={theme.colors.text} size={24} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 20 }}>
                        <FormInput label="Full Name" value={formData.name} onChange={(t) => setFormData({...formData, name: t})} theme={theme} />
                        <FormInput label="Email Address" value={formData.email} onChange={(t) => setFormData({...formData, email: t})} theme={theme} keyboardType="email-address" />
                        <FormInput label="Phone Number" value={formData.phone} onChange={(t) => setFormData({...formData, phone: t})} theme={theme} keyboardType="phone-pad" />
                        <FormInput label="Class/Grade" value={formData.class} onChange={(t) => setFormData({...formData, class: t})} theme={theme} />
                        <FormInput label="Preferred Subject" value={formData.subject} onChange={(t) => setFormData({...formData, subject: t})} theme={theme} />
                        
                        <TouchableOpacity 
                            onPress={handleAddStudent}
                            style={[styles.modalAddBtn, { backgroundColor: theme.colors.primary }]}
                        >
                            <Text style={[styles.modalAddBtnText, { color: theme.colors.background }]}>Initialize Student</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

// --- Sub Components ---
const StatMiniCard = ({ label, value, theme }: any) => (
    <View style={[styles.statMini, { backgroundColor: theme.colors.surface, borderLeftWidth: 3, borderLeftColor: theme.colors.primary }]}>
      <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.statMiniLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    </View>
);

const FormInput = ({ label, value, onChange, theme, ...props }: any) => (
    <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>{label.toUpperCase()}</Text>
        <TextInput 
            value={value}
            onChangeText={onChange}
            placeholderTextColor={theme.colors.textSecondary + '50'}
            style={[styles.textInput, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
            {...props}
        />
    </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 15 },
  headerLeft: { flex: 1, marginLeft: 15 },
  headerTitle: { fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  
  scrollPadding: { paddingHorizontal: 24 },
  heroWrapper: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 20, minHeight: 140 },
  heroTextContent: { flex: 1 },
  heroHeading: { fontSize: 44, fontWeight: 'bold', lineHeight: 48, letterSpacing: -2 },
  heroBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 10 },
  heroBadgeText: { fontSize: 11, fontWeight: 'bold' },
  visualContainer: { width: 100, height: 100, alignItems: 'center', justifyContent: 'center' },
  iconBox: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  dash: { position: 'absolute', width: 20, height: 20, borderStyle: 'dashed', borderWidth: 1.5, borderRadius: 6 },
  dashTL: { top: 0, left: 0, transform: [{ rotate: '-15deg' }] },
  dashBR: { bottom: 0, right: 0, transform: [{ rotate: '15deg' }] },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  statMini: { width: '31%', padding: 16, borderRadius: 16 },
  statValue: { fontSize: 20, fontWeight: '900' },
  statMiniLabel: { fontSize: 10, fontWeight: '800', marginTop: 2, opacity: 0.6 },

  searchBox: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 20, marginTop: 25 },
  sectionHeader: { marginTop: 32, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', letterSpacing: -0.5 },
  
  taskList: { gap: 12 },
  taskCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 24 },
  taskIcon: { width: 45, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { color: '#FFF', fontWeight: '900', fontSize: 18 },
  taskTextWrapper: { flex: 1, marginLeft: 15 },
  taskTitle: { fontSize: 16, fontWeight: '700' },
  taskSub: { fontSize: 12, marginTop: 2 },
  trashBtn: { padding: 10 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContentWrapper: { width: '100%' },
  modalCard: { borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -1 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 8, marginLeft: 5 },
  textInput: { height: 55, borderRadius: 18, paddingHorizontal: 15, fontSize: 16, fontWeight: '600' },
  modalAddBtn: { height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 20 },
  modalAddBtnText: { fontSize: 16, fontWeight: '800' }
});

export default StudentsScreen;