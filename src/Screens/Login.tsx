import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  Dimensions, 
  FlatList, 
  Animated 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../Context/ThemeContext';
import { AuthService } from '../Services/FirebaseAuthService';
import { Sun, Moon, PencilRuler, Zap, CreditCard, ChevronRight } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    heading: 'Smart\nChalk',
    description: 'Focus on teaching, not paperwork. Generate custom assignments in seconds using AI.',
    icon: 'PencilRuler',
  },
  {
    id: '2',
    heading: 'Auto\nGrading',
    description: 'Instant feedback for your students. Our AI grades submissions so you don’t have to.',
    icon: 'Zap',
  },
  {
    id: '3',
    heading: 'Fee\nTracker',
    description: 'Automate your earnings. Track payments, send invoices, and manage student subscriptions.',
    icon: 'CreditCard',
  },
];

const LoginScreen = ({ navigation }: any) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const user = await AuthService.signInWithGoogle();
      if (user) {
        // Navigation is usually handled by the Auth Listener in App.tsx
        console.log("Login successful:", user.email);
      }
    } catch (error: any) {
      // Logic is handled inside AuthService.handleError, 
      // but we catch here to stop the loading spinner
    } finally {
      setLoading(false);
    }
  };

  const renderIcon = (name: string) => {
    const props = { color: theme.colors.text, size: 100, strokeWidth: 1.2 };
    switch (name) {
      case 'PencilRuler': return <PencilRuler {...props} />;
      case 'Zap': return <Zap {...props} />;
      case 'CreditCard': return <CreditCard {...props} />;
      default: return <PencilRuler {...props} />;
    }
  };

  const renderSlide = ({ item }: { item: typeof SLIDES[0] }) => (
    <View style={styles.slide}>
      <View style={styles.heroSection}>
        <Text style={[styles.mainHeading, { color: theme.colors.text }]}>{item.heading}</Text>
        
        <View style={styles.iconContainer}>
          {renderIcon(item.icon)}
          <View style={[styles.dash, styles.dashTL, { borderColor: theme.colors.primary }]} />
          <View style={[styles.dash, styles.dashBR, { borderColor: theme.colors.primary }]} />
        </View>
      </View>

      <View style={styles.bodySection}>
        <Text style={[styles.description, { color: theme.colors.text }]}>
          {item.description}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.mainContainer, { backgroundColor: theme.colors.background }]}>
      {/* 1. Theme Toggle Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleTheme} style={styles.toggleBtn}>
          {isDark ? (
            <Sun color={theme.colors.accent} size={24} />
          ) : (
            <Moon color={theme.colors.textSecondary} size={24} />
          )}
        </TouchableOpacity>
      </View>

      {/* 2. Slidable Content (Horizontal) */}
      <FlatList
        data={SLIDES}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        keyExtractor={(item) => item.id}
        scrollEventThrottle={16}
        bounces={false}
      />

      {/* 3. Footer (Dots & Login) */}
      <View style={styles.footer}>
        <View style={styles.pagination}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * SCREEN_WIDTH, i * SCREEN_WIDTH, (i + 1) * SCREEN_WIDTH];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 22, 8],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View 
                key={i} 
                style={[
                  styles.dot, 
                  { 
                    width: dotWidth, 
                    opacity, 
                    backgroundColor: theme.colors.primary 
                  }
                ]} 
              />
            );
          })}
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={[styles.loginButton, { backgroundColor: theme.colors.text }]} 
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.surface} />
            ) : (
              <View style={styles.buttonInner}>
                <Text style={[styles.buttonText, { color: theme.colors.surface }]}>
                  Login with Google
                </Text>
                <ChevronRight color={theme.colors.surface} size={20} style={{ marginLeft: 8 }} />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.signUpRow}>
            <Text style={[styles.signUpText, { color: theme.colors.textSecondary }]}>
              New to Smart Chalk?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={[styles.signUpLink, { color: theme.colors.primary }]}>
                Create now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  header: { 
    width: '100%', 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    paddingHorizontal: 20,
    paddingTop: 10
  },
  toggleBtn: { padding: 8 },
  slide: { width: SCREEN_WIDTH, paddingHorizontal: 30 },
  heroSection: { 
    alignItems: 'flex-start', 
    marginTop: 20, 
    minHeight: SCREEN_HEIGHT * 0.42 
  },
  mainHeading: { 
    fontSize: 58, 
    fontWeight: 'bold', 
    lineHeight: 66, 
    marginBottom: 40, 
    letterSpacing: -1.5 
  },
  iconContainer: { 
    width: '100%', 
    alignItems: 'center', 
    justifyContent: 'center', 
    position: 'relative',
    marginTop: 10
  },
  dash: { 
    position: 'absolute', 
    width: 24, 
    height: 24, 
    borderStyle: 'dashed', 
    borderWidth: 1.5, 
    borderRadius: 6 
  },
  dashTL: { top: -15, left: '25%', transform: [{ rotate: '-15deg' }] },
  dashBR: { bottom: -10, right: '25%', transform: [{ rotate: '15deg' }] },
  bodySection: { width: '100%', marginTop: 30 },
  description: { 
    fontSize: 19, 
    lineHeight: 28, 
    paddingRight: 30, 
    fontWeight: '500' 
  },
  footer: { paddingHorizontal: 30, paddingBottom: 50 },
  pagination: { flexDirection: 'row', marginBottom: 40, alignItems: 'center' },
  dot: { height: 8, borderRadius: 4, marginHorizontal: 4 },
  actionSection: { width: '100%', alignItems: 'flex-start' },
  loginButton: { 
    paddingVertical: 18, 
    paddingHorizontal: 30, 
    borderRadius: 14, 
    marginBottom: 25, 
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  buttonInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontWeight: 'bold', fontSize: 18 },
  signUpRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 5 },
  signUpText: { fontSize: 15, fontWeight: '500' },
  signUpLink: { fontSize: 15, fontWeight: 'bold' }
});

export default LoginScreen;