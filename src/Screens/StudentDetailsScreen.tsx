import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  Linking,
  Dimensions,
  ActivityIndicator,
  Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../Context/ThemeContext';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {
  ChevronLeft,
  Mail,
  Phone,
  BookOpen,
  GraduationCap,
  Trash2,
  Sun,
  Moon,
  Clock,
  Link as LinkIcon,
  Calendar,
  User as UserIcon,
  Zap
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface StudentDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  class: string;
}

interface ClassDetails {
  id: string;
  className: string;
  subject: string;
  time: string;
  meetLink: string;
  scheduleDays: string[];
  enrolledStudents: string[];
}

const StudentDetailsScreen = ({ navigation, route }: any) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [enrolledClasses, setEnrolledClasses] = useState<ClassDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const { studentId } = route.params;
  const currentUid = auth().currentUser?.uid;

  useEffect(() => {
    const loadStudioData = async () => {
      if (!currentUid || !studentId) return;
      setLoading(true);
      try {
        // 1. Fetch Student Profile from Teacher's directory
        const studentDoc = await firestore()
          .collection('users')
          .doc(currentUid)
          .collection('students')
          .doc(studentId)
          .get();

        if (studentDoc.exists) {
          setStudent({ id: studentDoc.id, ...studentDoc.data() } as StudentDetails);
          
          // 2. Fetch only classes where this specific student is enrolled
          const classSnapshot = await firestore()
            .collection('users')
            .doc(currentUid)
            .collection('classes')
            .where('enrolledStudents', 'array-contains', studentId)
            .get();

          const classesList = classSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as ClassDetails[];
          
          setEnrolledClasses(classesList);
        } else {
          Alert.alert("Error", "Student record not found in your studio.");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Studio Sync Error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadStudioData();
  }, [currentUid, studentId]);

  const handleDelete = () => {
    Alert.alert(
      "Remove Student",
      `Are you sure you want to remove ${student?.name} from your Studio?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              await firestore()
                .collection('users')
                .doc(currentUid)
                .collection('students')
                .doc(studentId)
                .delete();
              navigation.goBack();
            } catch (e) {
              Alert.alert("Error", "Failed to delete student.");
            }
          } 
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center' }]}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} transparent translucent />

      {/* 1. STUDIO HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={[styles.iconBtn, { backgroundColor: theme.colors.surface }]}
        >
          <ChevronLeft color={theme.colors.text} size={22} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={toggleTheme} 
            style={[styles.iconBtn, { backgroundColor: theme.colors.surface }]}
          >
            {isDark ? <Sun color={theme.colors.accent} size={18} /> : <Moon color={theme.colors.textSecondary} size={18} />}
          </TouchableOpacity>
          <View style={[styles.avatarFrame, { borderColor: theme.colors.primary }]}>
             <View style={[styles.miniAvatar, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.miniAvatarText}>{student?.name?.charAt(0)}</Text>
             </View>
          </View>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.scrollPadding, { paddingBottom: insets.bottom + 120 }]}
      >
        {/* 2. HERO SECTION (Matches Home Style) */}
        <View style={styles.heroWrapper}>
          <View style={styles.heroTextContent}>
             <Text style={[styles.heroHeading, { color: theme.colors.text }]}>
               {student?.name?.split(' ')[0]}{'\n'}{student?.name?.split(' ')[1] || 'Profile'}
             </Text>
             <View style={[styles.heroBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                <Text style={[styles.heroBadgeText, { color: theme.colors.primary }]}>
                  {student?.class || 'N/A'} • {student?.subject || 'General'}
                </Text>
             </View>
          </View>
          
          <View style={styles.visualContainer}>
            <View style={[styles.iconBox, { backgroundColor: theme.colors.surface }]}>
                <GraduationCap color={theme.colors.primary} size={48} strokeWidth={1.5} />
            </View>
            <View style={[styles.dash, styles.dashTL, { borderColor: theme.colors.primary }]} />
            <View style={[styles.dash, styles.dashBR, { borderColor: theme.colors.primary }]} />
          </View>
        </View>

        {/* 3. QUICK STATS (Bento Style) */}
        <View style={styles.statsRow}>
          <StatMiniCard label="EMAIL" value={student?.email ? "ACTIVE" : "NONE"} theme={theme} />
          <StatMiniCard label="PHONE" value={student?.phone ? "SAVED" : "NONE"} theme={theme} />
          <StatMiniCard label="CLASSES" value={enrolledClasses.length.toString()} theme={theme} />
        </View>

        {/* 4. CONTACT INFORMATION CARD */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Contact Details</Text>
        </View>
        <View style={[styles.detailsCard, { backgroundColor: theme.colors.surface }]}>
           <DetailRow icon={<Mail size={18} />} label="Email Address" value={student?.email} theme={theme} />
           <View style={[styles.divider, { backgroundColor: theme.colors.background }]} />
           <DetailRow icon={<Phone size={18} />} label="Contact Number" value={student?.phone} theme={theme} />
        </View>

        {/* 5. ENROLLED CLASSES (Match TaskItem Style) */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Enrolled Classes</Text>
        </View>

        <View style={styles.taskList}>
          {enrolledClasses.length > 0 ? enrolledClasses.map((cls) => (
            <TouchableOpacity 
                key={cls.id}
                onPress={() => cls.meetLink && Linking.openURL(cls.meetLink)}
                activeOpacity={0.7}
                style={[styles.taskCard, { backgroundColor: theme.colors.surface }]}
            >
                <View style={styles.taskIcon}>
                    <BookOpen color={theme.colors.primary} size={22} />
                </View>
                <View style={styles.taskTextWrapper}>
                    <Text style={[styles.taskTitle, { color: theme.colors.text }]}>{cls.className}</Text>
                    <Text style={[styles.taskSub, { color: theme.colors.textSecondary }]}>{cls.scheduleDays?.join(', ')}</Text>
                </View>
                <View style={styles.timeTag}>
                    <Clock size={12} color={theme.colors.textSecondary} />
                    <Text style={[styles.taskTime, { color: theme.colors.textSecondary }]}>{cls.time}</Text>
                </View>
            </TouchableOpacity>
          )) : (
            <View style={[styles.emptyBox, { borderColor: theme.colors.surface }]}>
                <Text style={{ color: theme.colors.textSecondary, fontWeight: '600' }}>No active enrollments found</Text>
            </View>
          )}
        </View>

        {/* 6. DANGER ZONE */}
        <TouchableOpacity 
            onPress={handleDelete}
            style={[styles.deleteBtn, { backgroundColor: '#FF4757' + '10' }]}
        >
            <Trash2 color="#FF4757" size={18} strokeWidth={2.5} />
            <Text style={styles.deleteText}>Delete Student from Studio</Text>
        </TouchableOpacity>

      </ScrollView>
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

const DetailRow = ({ icon, label, value, theme }: any) => (
    <View style={styles.detailRow}>
        <View style={[styles.detailIcon, { backgroundColor: theme.colors.primary + '10' }]}>
            {React.cloneElement(icon, { color: theme.colors.primary })}
        </View>
        <View>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>{value || 'Not provided'}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    paddingTop: 15,
    paddingBottom: 15 
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  avatarFrame: { width: 42, height: 42, borderRadius: 14, borderWidth: 1.5, padding: 2 },
  miniAvatar: { width: '100%', height: '100%', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  miniAvatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  
  scrollPadding: { paddingHorizontal: 24 },
  heroWrapper: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 20,
    minHeight: 140
  },
  heroTextContent: { flex: 1 },
  heroHeading: { fontSize: 40, fontWeight: 'bold', lineHeight: 44, letterSpacing: -2 },
  heroBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 10 },
  heroBadgeText: { fontSize: 11, fontWeight: 'bold' },
  visualContainer: { width: 100, height: 100, alignItems: 'center', justifyContent: 'center' },
  iconBox: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  dash: { position: 'absolute', width: 20, height: 20, borderStyle: 'dashed', borderWidth: 1.5, borderRadius: 6 },
  dashTL: { top: 0, left: 0, transform: [{ rotate: '-15deg' }] },
  dashBR: { bottom: 0, right: 0, transform: [{ rotate: '15deg' }] },
  
  sectionHeader: { marginTop: 32, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', letterSpacing: -0.5 },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  statMini: { width: '31%', padding: 16, borderRadius: 16 },
  statValue: { fontSize: 16, fontWeight: '900', letterSpacing: -0.5 },
  statMiniLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginTop: 2, opacity: 0.6 },
  
  detailsCard: { borderRadius: 28, padding: 20 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 15, paddingVertical: 10 },
  detailIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  detailLabel: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  detailValue: { fontSize: 15, fontWeight: '600', marginTop: 2 },
  divider: { height: 1, marginVertical: 5 },

  taskList: { gap: 12 },
  taskCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 24 },
  taskIcon: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
  taskTextWrapper: { flex: 1, marginLeft: 12 },
  taskTitle: { fontSize: 16, fontWeight: '700' },
  taskSub: { fontSize: 12, marginTop: 2 },
  timeTag: { alignItems: 'flex-end', gap: 4 },
  taskTime: { fontSize: 12, fontWeight: '700' },
  
  emptyBox: { padding: 30, borderRadius: 24, borderStyle: 'dashed', borderWidth: 2, alignItems: 'center' },
  deleteBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 10, 
    marginTop: 40, 
    paddingVertical: 18, 
    borderRadius: 24 
  },
  deleteText: { color: '#FF4757', fontWeight: 'bold', fontSize: 15 }
});

export default StudentDetailsScreen;