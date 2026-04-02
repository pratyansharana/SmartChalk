import React, { useMemo, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { LayoutGrid, Sparkles, User, Plus } from 'lucide-react-native';

// Project Imports
import { useTheme } from '../Context/ThemeContext';
import LoginScreen from '../Screens/Login';
import HomeScreen from '../Screens/Home';
import AddClassScreen from '../Screens/AddClassScreen';
import StudentsScreen from '../Screens/StudentsScreen';
import StudentDetailsScreen from '../Screens/StudentDetailsScreen';
import HomeworkScreen from '../Screens/HomeworkScreen';

const Stack = createStackNavigator();

// This sub-component allows us to use navigation hooks inside the same file
const AppStack = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="AddClass" component={AddClassScreen} />
          <Stack.Screen name="Students" component={StudentsScreen} />
          <Stack.Screen name="StudentDetails" component={StudentDetailsScreen} />
          <Stack.Screen name="Homework" component={HomeworkScreen} />

        </>
      )}
    </Stack.Navigator>
  );
};

export const AppNavigator = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  const { theme, isDark } = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [70], []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 1. STACK NAVIGATION */}
      <AppStack isAuthenticated={isAuthenticated} />

      {/* 2. THE FLOATING OVAL BAR */}
      {isAuthenticated && (
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          detached={true}
          bottomInset={Platform.OS === 'ios' ? 35 : 25}
          enablePanDownToClose={false}
          handleComponent={null}
          style={styles.sheetFloatingWrapper}
          backgroundStyle={{
            backgroundColor: theme.colors.surface,
            borderRadius: 40,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
            elevation: 15,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.25,
            shadowRadius: 25,
          }}
        >
          <NavItems theme={theme} isDark={isDark} />
        </BottomSheet>
      )}
    </View>
  );
};

// Internal component to handle navigation logic for the bar
const NavItems = ({ theme, isDark }: any) => {
  const navigation = useNavigation<any>();

  return (
    <BottomSheetView style={styles.navContent}>
      {/* Home Tab */}
      <TouchableOpacity 
        style={styles.tabBtn} 
        onPress={() => navigation.navigate('Home')}
      >
        <LayoutGrid color={theme.colors.primary} size={22} strokeWidth={2.5} />
        <View style={[styles.activeDot, { backgroundColor: theme.colors.primary }]} />
      </TouchableOpacity>

      {/* NEW: Add Class Tab (Central Trigger) */}
      <TouchableOpacity 
        activeOpacity={0.85} 
        style={styles.aiCircleContainer}
        onPress={() => navigation.navigate('AddClass')}
      >
        <View style={[styles.aiCircle, { backgroundColor: theme.colors.primary }]}>
          <Plus 
            color={isDark ? '#0F172A' : '#FFFFFF'} 
            size={28} 
            strokeWidth={3} 
          />
        </View>
        <View style={[styles.aiGlow, { backgroundColor: theme.colors.primary, opacity: 0.3 }]} />
      </TouchableOpacity>

      {/* Profile/Placeholder Tab */}
      <TouchableOpacity style={styles.tabBtn}>
        <User color={theme.colors.textSecondary} size={22} strokeWidth={2} />
      </TouchableOpacity>
    </BottomSheetView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  sheetFloatingWrapper: {
    marginHorizontal: 55,
    zIndex: 99,
  },
  navContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 35,
    height: '100%',
  },
  tabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    position: 'absolute',
    bottom: 8,
  },
  aiCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiCircle: {
    width: 58,
    height: 58,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  aiGlow: {
    position: 'absolute',
    width: 45,
    height: 45,
    borderRadius: 20,
    zIndex: 1,
  }
});