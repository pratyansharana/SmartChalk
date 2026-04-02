import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  StatusBar,
  Dimensions,
  Platform,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../Context/ThemeContext';
import { AuthService } from '../Services/FirebaseAuthService';
import { 
  Users, 
  BookOpen, 
  Sparkles, 
  Calendar, 
  CheckCircle2,
  Search,
  Zap,
  Sun,
  Moon,
  LogOut
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const user = AuthService.getCurrentUser();
  const navigation = useNavigation<any>();

  // --- 1. FIRESTORE SYNC & PUSH TOKEN LOGIC ---
  useEffect(() => {
    const initializeUser = async () => {
      if (user) {
        try {
          const token = await registerForPushNotificationsAsync();
          // Sync data only once the user lands on Home
          await AuthService.syncUserToFirestore(user, token);
        } catch (error) {
          console.log("Sync Error:", error);
        }
      }
    };
    initializeUser();
  }, []);

  async function registerForPushNotificationsAsync() {
    let token = null;
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus === 'granted') {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      }
    } catch (e) {
      console.log('Push Token: Not supported in this environment.');
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
      });
    }
    return token;
  }

  // --- 2. LOGOUT HANDLER ---
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to exit the Studio?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive", 
          onPress: async () => {
            try {
              await AuthService.signOut();
            } catch (error) {
              Alert.alert("Error", "Logout failed.");
            }
          } 
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} transparent translucent />
      
      {/* 1. REFINED STUDIO HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
            DASHBOARD
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text }]}>
            Hi, {user?.name?.split(' ')[0] || 'Teacher'}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={toggleTheme} 
            style={[styles.iconBtn, { backgroundColor: theme.colors.surface }]}
          >
            {isDark ? (
              <Sun color={theme.colors.accent} size={18} />
            ) : (
              <Moon color={theme.colors.textSecondary} size={18} />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleLogout}
            style={[styles.iconBtn, { backgroundColor: theme.colors.surface }]}
          >
            <LogOut color="#FF4757" size={18} />
          </TouchableOpacity>

          <View style={[styles.avatarFrame, { borderColor: theme.colors.primary }]}>
            <Image 
              source={{ uri: user?.photo || 'https://ui-avatars.com/api/?name=Teacher&background=22D3EE&color=fff' }} 
              style={styles.avatarImg} 
            />
          </View>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.scrollPadding, { paddingBottom: insets.bottom + 140 }]}
      >
        {/* 2. HERO SECTION */}
        <View style={styles.heroWrapper}>
          <View style={styles.heroTextContent}>
             <Text style={[styles.heroHeading, { color: theme.colors.text }]}>Next{'\n'}Chalk</Text>
             <View style={[styles.heroBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                <Text style={[styles.heroBadgeText, { color: theme.colors.primary }]}>Grade 12-B • 10:30 AM</Text>
             </View>
          </View>
          
          <View style={styles.visualContainer}>
            <View style={[styles.iconBox, { backgroundColor: theme.colors.surface }]}>
                <Zap color={theme.colors.primary} size={48} strokeWidth={1.5} />
            </View>
            <View style={[styles.dash, styles.dashTL, { borderColor: theme.colors.primary }]} />
            <View style={[styles.dash, styles.dashBR, { borderColor: theme.colors.primary }]} />
          </View>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Tools</Text>
        </View>
        <View style={styles.grid}>
          <ActionCard 
            icon={<Users color={theme.colors.primary} />} 
            label="Students" 
            theme={theme}
            onPress={() => navigation.navigate('Students')}
          />
          <ActionCard icon={<BookOpen color={theme.colors.primary} />} label="Homework" theme={theme} onPress={() => navigation.navigate('Homework')} />
          <ActionCard icon={<Sparkles color={theme.colors.primary} />} label="Chalk AI" theme={theme} />
          <ActionCard icon={<Calendar color={theme.colors.primary} />} label="Schedule" theme={theme} />
        </View>

        {/* Stats Section */}
        <View style={styles.statsRow}>
          <StatMiniCard label="Students" value="128" theme={theme} />
          <StatMiniCard label="Tasks" value="06" theme={theme} />
          <StatMiniCard label="Lessons" value="85%" theme={theme} />
        </View>

        {/* Recent Tasks */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Tasks</Text>
        </View>
        <View style={styles.taskList}>
          <TaskItem title="Grade Math Assignments" sub="12 pending" time="2h ago" theme={theme} />
          <TaskItem title="Create Quiz: Organic Chem" sub="Draft saved" time="5h ago" theme={theme} completed />
        </View>

      </ScrollView>
    </View>
  );
};

// --- Sub-Components ---

const ActionCard = ({ icon, label, theme, onPress }: any) => (
  <TouchableOpacity 
    onPress={onPress}
    style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
  >
    <View style={styles.actionIconWrapper}>
      {icon}
      <View style={[styles.miniDash, { borderColor: theme.colors.primary }]} />
    </View>
    <Text style={[styles.actionLabel, { color: theme.colors.text }]}>{label}</Text>
  </TouchableOpacity>
);
  
const StatMiniCard = ({ label, value, theme }: any) => (
  <View style={[styles.statMini, { backgroundColor: theme.colors.surface, borderLeftWidth: 3, borderLeftColor: theme.colors.primary }]}>
    <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
    <Text style={[styles.statMiniLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
  </View>
);

const TaskItem = ({ title, sub, time, theme, completed }: any) => (
  <View style={[styles.taskCard, { backgroundColor: theme.colors.surface }]}>
    <View style={styles.taskIcon}>
      <CheckCircle2 color={completed ? theme.colors.primary : theme.colors.textSecondary} size={22} />
    </View>
    <View style={styles.taskTextWrapper}>
      <Text style={[styles.taskTitle, { color: theme.colors.text }, completed && { opacity: 0.5 }]}>{title}</Text>
      <Text style={[styles.taskSub, { color: theme.colors.textSecondary }]}>{sub}</Text>
    </View>
    <Text style={[styles.taskTime, { color: theme.colors.textSecondary }]}>{time}</Text>
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
  headerLeft: { flex: 1 },
  greeting: { fontSize: 10, fontWeight: '900', letterSpacing: 2, opacity: 0.6 },
  subtitle: { fontSize: 28, fontWeight: 'bold', letterSpacing: -1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  avatarFrame: { width: 42, height: 42, borderRadius: 14, borderWidth: 1.5, padding: 2 },
  avatarImg: { width: '100%', height: '100%', borderRadius: 10 },
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
  heroHeading: { fontSize: 44, fontWeight: 'bold', lineHeight: 48, letterSpacing: -2 },
  heroBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 10 },
  heroBadgeText: { fontSize: 11, fontWeight: 'bold' },
  visualContainer: { width: 100, height: 100, alignItems: 'center', justifyContent: 'center' },
  iconBox: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  dash: { position: 'absolute', width: 20, height: 20, borderStyle: 'dashed', borderWidth: 1.5, borderRadius: 6 },
  dashTL: { top: 0, left: 0, transform: [{ rotate: '-15deg' }] },
  dashBR: { bottom: 0, right: 0, transform: [{ rotate: '15deg' }] },
  sectionHeader: { marginTop: 32, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', letterSpacing: -0.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  actionCard: { width: (width - 60) / 2, padding: 20, borderRadius: 28 },
  actionIconWrapper: { width: 45, height: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  miniDash: { position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, borderStyle: 'dashed', borderWidth: 1, borderRadius: 4 },
  actionLabel: { fontSize: 15, fontWeight: '700' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  statMini: { width: '31%', padding: 16, borderRadius: 16 },
  statValue: { fontSize: 22, fontWeight: 'bold' },
  statMiniLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  taskList: { gap: 12 },
  taskCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 24 },
  taskIcon: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
  taskTextWrapper: { flex: 1, marginLeft: 12 },
  taskTitle: { fontSize: 15, fontWeight: '700' },
  taskSub: { fontSize: 13, marginTop: 2 },
  taskTime: { fontSize: 12, fontWeight: '600' }
});

export default HomeScreen;