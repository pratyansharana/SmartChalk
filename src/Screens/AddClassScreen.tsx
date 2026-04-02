import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../Context/ThemeContext';
import { 
  ChevronLeft, 
  Clock, 
  Link, 
  Layers,
  Sparkles,
  Check
} from 'lucide-react-native';
import firestore from '@react-native-firebase/firestore';
import firebaseAuth from '@react-native-firebase/auth';
import { AuthService } from '../Services/FirebaseAuthService';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const AddClassScreen = ({ navigation }: any) => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<any>(null);

  // Form State
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [time, setTime] = useState('');
  const [meetLink, setMeetLink] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Student State
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = firebaseAuth().onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser({
          uid: authUser.uid,
          email: authUser.email,
          name: authUser.displayName,
          photo: authUser.photoURL,
        });
      } else {
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);

  // 1. IMPROVED FETCHING LOGIC
  useEffect(() => {
    const fetchStudents = async () => {
      if (!user?.uid) {
        console.warn("AddClassScreen: No User UID found");
        return;
      }

      console.log("Fetching students for Teacher UID:", user.uid);

      try {
        // Path: users -> {uid} -> students
        const snapshot = await firestore()
          .collection('users')
          .doc(user.uid)
          .collection('students')
          .get();
        
        if (snapshot.empty) {
          console.log("No students found in teacher's sub-collection.");
          setAllStudents([]);
        } else {
          const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setAllStudents(list);
        }
      } catch (e) {
        console.error("Firestore Fetch Error:", e);
      }
    };

    fetchStudents();
  }, [user?.uid]);

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleStudent = (id: string) => {
    setSelectedStudents(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  // 2. VERIFIED UPLOAD LOGIC
const handleCreateClass = async () => {
  if (!user?.uid) {
    Alert.alert("Error", "User not authenticated");
    return;
  }

  setLoading(true);
  try {
    // This goes into: users -> {user.uid} -> classes -> (random_class_id)
    await firestore()
      .collection('users')
      .doc(user.uid) // Use the current authenticated user's UID
      .collection('classes')
      .add({
        className: className.trim(),
        subject: subject.trim(),
        time: time.trim(),
        meetLink: meetLink.trim(),
        scheduleDays: selectedDays,
        enrolledStudents: selectedStudents,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

    Alert.alert("Success", "Class added to YOUR studio.");
    navigation.goBack();
  } catch (error) {
    console.error(error);
    Alert.alert("Error", "Failed to create class");
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: theme.colors.surface }]}
        >
          <ChevronLeft color={theme.colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Class Setup</Text>
        <View style={{ width: 44 }} /> 
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.form}>
            <InputGroup label="CLASS NAME" placeholder="e.g. Grade 11-A" value={className} onChange={setClassName} icon={<Layers size={18} />} theme={theme} />
            <InputGroup label="SUBJECT" placeholder="e.g. Mathematics" value={subject} onChange={setSubject} icon={<Sparkles size={18} />} theme={theme} />

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>SCHEDULE DAYS</Text>
              <View style={styles.daysRow}>
                {DAYS.map(day => {
                  const isSelected = selectedDays.includes(day);
                  return (
                    <TouchableOpacity 
                      key={day} 
                      onPress={() => toggleDay(day)}
                      style={[styles.dayCircle, { backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface }]}
                    >
                      <Text style={[styles.dayText, { color: isSelected ? theme.colors.background : theme.colors.text }]}>{day[0]}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <InputGroup label="START TIME" placeholder="09:00 AM" value={time} onChange={setTime} icon={<Clock size={18} />} theme={theme} />
            <InputGroup label="GOOGLE MEET LINK" placeholder="meet.google.com/abc-defg-hij" value={meetLink} onChange={setMeetLink} icon={<Link size={18} />} theme={theme} />

            <View style={styles.inputGroup}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>ENROLL STUDENTS</Text>
                <Text style={[styles.count, { color: theme.colors.primary }]}>{selectedStudents.length} selected</Text>
              </View>
              
              <View style={[styles.studentList, { backgroundColor: theme.colors.surface }]}>
                {allStudents.length > 0 ? (
                  allStudents.map((student) => (
                    <TouchableOpacity 
                      key={student.id} 
                      style={styles.studentItem}
                      onPress={() => toggleStudent(student.id)}
                    >
                      <Text style={[styles.studentName, { color: theme.colors.text }]}>{student.name}</Text>
                      <View style={[styles.checkbox, { borderColor: theme.colors.primary, backgroundColor: selectedStudents.includes(student.id) ? theme.colors.primary : 'transparent' }]}>
                        {selectedStudents.includes(student.id) && <Check color={theme.colors.background} size={12} strokeWidth={4} />}
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No students in your directory yet.</Text>
                )}
              </View>
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleCreateClass}
            disabled={loading}
            style={[styles.createBtn, { backgroundColor: theme.colors.text }]}
          >
            <Text style={[styles.createBtnText, { color: theme.colors.background }]}>
              {loading ? "SYNCING..." : "INITIALIZE CLASS"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const InputGroup = ({ label, placeholder, value, onChange, icon, theme }: any) => (
  <View style={styles.inputGroup}>
    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
    <View style={[styles.inputWrapper, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.inputIcon}>{icon && React.cloneElement(icon, { color: theme.colors.primary })}</View>
      <TextInput placeholder={placeholder} placeholderTextColor={theme.colors.textSecondary + '70'} style={[styles.input, { color: theme.colors.text }]} value={value} onChangeText={onChange} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 15 },
  backBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  form: { gap: 24, marginTop: 20 },
  inputGroup: { gap: 10 },
  label: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginLeft: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 16, height: 60 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, fontWeight: '600' },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  dayText: { fontSize: 14, fontWeight: 'bold' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  count: { fontSize: 11, fontWeight: '800' },
  studentList: { borderRadius: 24, padding: 10, minHeight: 60 },
  studentItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.05)' },
  studentName: { fontSize: 15, fontWeight: '600' },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', padding: 20, opacity: 0.5, fontSize: 13 },
  createBtn: { height: 65, borderRadius: 20, marginTop: 40, justifyContent: 'center', alignItems: 'center', elevation: 8, marginBottom: 100 },
  createBtnText: { fontSize: 16, fontWeight: '900', letterSpacing: 1 }
});

export default AddClassScreen;