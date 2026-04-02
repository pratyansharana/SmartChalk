# SmartChalk

A modern, full-featured classroom management application built with React Native and Expo. SmartChalk enables educators to manage classes, track student progress, assign homework, and leverage AI-powered features for enhanced learning experiences.

## 🎯 Features

- **Multi-Platform Support**: Native iOS, Android, and Web support via Expo
- **Authentication**: Secure Firebase authentication with Google Sign-In integration
- **Classroom Management**: Create and manage classes with multiple students
- **Student Tracking**: Detailed student profiles with progress monitoring
- **Homework Management**: Assign and track homework assignments
- **AI Integration**: Google Generative AI powered features for enhanced functionality
- **Dark Mode Support**: Fully themed UI with light and dark mode options
- **Real-Time Database**: Cloud Firestore for real-time data synchronization
- **Responsive Design**: Optimized UI for different screen sizes and orientations

## 🛠️ Tech Stack

- **Framework**: React Native 0.81.5 with Expo 54.0.33
- **Language**: TypeScript
- **Navigation**: React Navigation (Stack Navigator)
- **State Management**: React Context (Theme Context)
- **Backend & Auth**: Firebase (Authentication, Firestore)
- **AI**: Google Generative AI SDK
- **UI Components**: Lucide React Native icons, React Native Gifted Charts
- **Build Tools**: EAS Build, Expo CLI
- **Code Quality**: TypeScript configuration for type safety

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.x or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** (comes with Node.js)
- **Expo CLI** - Install globally: `npm install -g expo-cli`
- **Git** - For version control

### Platform-Specific Requirements

- **iOS Development**: Mac with Xcode 14+ (for iOS simulator)
- **Android Development**: 
  - Android Studio (for Android emulator)
  - Java Development Kit (JDK) 11+
  - Android SDK API level 21+
- **Web Development**: Any modern web browser (Chrome, Firefox, Safari, Edge)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd SmartChalk
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including Expo, Firebase SDK, React Native dependencies, and other modules listed in `package.json`.

### 3. Firebase Setup

Before running the app, you need to configure Firebase:

#### 3.1 Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (name it "SmartChalk" or similar)
3. Enable Firestore Database in test mode
4. Enable Authentication:
   - Enable Email/Password sign-in
   - Enable Google Sign-In

#### 3.2 Get Firebase Credentials

1. Go to Project Settings in Firebase Console
2. Download your Firebase config file for Android
3. Place the downloaded `google-services.json` in the root directory of the project

#### 3.3 Update Firebase Configuration

Update [src/Backend/FirebaseConfig.ts](src/Backend/FirebaseConfig.ts) with your Firebase credentials if needed.

### 4. Environment Configuration

Create a `.env` or `.env.local` file in the root directory with the following variables (if needed):

```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 5. Run the Application

#### Option A: Start with Expo CLI (Recommended for Development)

```bash
npm start
```

This launches the Expo development server. You'll see a QR code in your terminal.

#### Option B: Run on Android Emulator

```bash
npm run android
```

Requires Android Studio and an active Android emulator/device.

#### Option C: Run on iOS Simulator (macOS only)

```bash
npm run ios
```

Requires Xcode and an active iOS simulator.

#### Option D: Run on Web

```bash
npm run web
```

Opens the app in your default web browser.

#### Option E: Scan QR Code

If using `npm start`:
1. Open Expo Go app on your mobile device
2. Scan the QR code displayed in the terminal
3. App will load on your device

## 📁 Project Structure

```
SmartChalk/
├── src/
│   ├── Backend/
│   │   └── FirebaseConfig.ts          # Firebase initialization
│   ├── Components/                    # Reusable UI components
│   ├── Context/
│   │   └── ThemeContext.tsx           # Theme provider (Light/Dark mode)
│   ├── Navigation/
│   │   └── AppNavigator.tsx           # Navigation stack configuration
│   ├── Screens/
│   │   ├── Home.tsx                   # Main dashboard
│   │   ├── Login.tsx                  # Authentication screen
│   │   ├── AddClassScreen.tsx         # Create new classes
│   │   ├── ClassesScreen.tsx          # View and manage classes
│   │   ├── StudentsScreen.tsx         # Student list view
│   │   ├── StudentDetailsScreen.tsx   # Individual student profile
│   │   ├── HomeworkScreen.tsx         # Homework management
│   │   └── settings.tsx               # User settings
│   ├── Services/
│   │   └── FirebaseAuthService.ts     # Authentication logic
│   ├── Theme/
│   │   ├── Light.ts                   # Light theme configuration
│   │   └── Dark.ts                    # Dark theme configuration
│   └── Utils/                         # Utility functions
├── App.tsx                            # Root app component
├── app.json                           # Expo configuration
├── package.json                       # Dependencies and scripts
├── tsconfig.json                      # TypeScript configuration
└── google-services.json               # Firebase Android config (get from Firebase Console)
```

## 🔑 Key Components

### Authentication
- Uses Firebase Authentication with email/password and Google Sign-In
- Session persistence across app launches
- [FirebaseAuthService.ts](src/Services/FirebaseAuthService.ts) handles all auth logic

### Navigation
- Stack-based navigation configured in [AppNavigator.tsx](src/Navigation/AppNavigator.tsx)
- Conditional rendering based on authentication state

### Theming
- Light and Dark mode support via [ThemeContext.tsx](src/Context/ThemeContext.tsx)
- Theme definitions in [Theme/](src/Theme/) directory

### Data Management
- Real-time data sync with Firestore
- Student and class information stored in cloud database

## 📱 Available Scripts

```bash
npm start      # Start development server
npm run android  # Run on Android emulator/device
npm run ios      # Run on iOS simulator (macOS)
npm run web      # Run on web browser
```

## 🔧 Configuration Files

- **app.json**: Expo configuration, app metadata, and platform-specific settings
- **eas.json**: EAS Build configuration for cloud builds
- **tsconfig.json**: TypeScript compiler options
- **package.json**: Project dependencies and scripts
- **google-services.json**: Firebase Android configuration (generate from Firebase Console)

## 🛡️ Security Notes

- **Never commit** `google-services.json` if it contains sensitive keys
- Use environment variables for sensitive configuration
- Firebase security rules should be properly configured in Firebase Console
- Implement proper Firestore security rules to restrict data access

## 🐛 Troubleshooting

### Issue: `Module not found` errors
**Solution**: Run `npm install` to ensure all dependencies are installed

### Issue: Firebase connection fails
**Solution**: 
- Verify `google-services.json` is in the root directory
- Check Firebase project ID matches in [FirebaseConfig.ts](src/Backend/FirebaseConfig.ts)
- Ensure Firebase project has Firestore and Authentication enabled

### Issue: Expo CLI not found
**Solution**: Install globally with `npm install -g expo-cli`

### Issue: Android emulator won't start
**Solution**: 
- Launch Android Studio
- Go to Device Manager and create/start a virtual device
- Run `npm run android` after device is running

### Issue: App crashes on startup
**Solution**:
- Check console logs for errors
- Verify all dependencies installed: `npm install`
- Clear Expo cache: `expo start -c`

## 📚 Learning Resources

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [Firebase React Native Guide](https://rnfirebase.io/)
- [React Navigation Docs](https://reactnavigation.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🚢 Deployment

### Build for Production

For iOS and Android builds, use EAS Build:

```bash
eas build --platform all
```

This requires an Expo account and creates production builds in the cloud.

For more details, see [eas.json](eas.json) configuration.

## 📝 License

This project is proprietary and created for educational purposes.

## 👨‍💻 Author

Pratyansh Rana

---

**Happy coding! 🎓**