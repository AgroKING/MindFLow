# MindFlow Mobile

A React Native mobile application for MindFlow, built with TypeScript, NativeWind, and React Navigation.

## Features

- **Authentication**: Login and Sign Up with persistent session management.
- **Dashboard**: Daily mood check-in, quick actions, and insights.
- **Journal**: Create and view daily journal entries.
- **Mood Tracking**: View mood history and trends.
- **Activities**: AI-suggested wellness activities.
- **Profile**: User settings and logout.

## Tech Stack

- **Framework**: React Native (0.83.1)
- **Language**: TypeScript
- **Styling**: NativeWind (TailwindCSS)
- **Navigation**: React Navigation (Native Stack + Bottom Tabs)
- **State Management**: React Context (Auth)
- **API**: Axios with Interceptors
- **Storage**: AsyncStorage

## Prerequisites

- Node.js >= 18
- JDK 17
- Android Studio (for Android)
- Xcode (for iOS, macOS only)

## Setup

1.  **Install Dependencies**

    ```bash
    npm install
    ```

2.  **Start Metro Bundler**

    ```bash
    npm start
    ```

3.  **Run on Android**

    ```bash
    # Ensure you have an Android Emulator running
    npm run android
    ```

4.  **Run on iOS** (macOS only)

    ```bash
    cd ios && pod install && cd ..
    npm run ios
    ```

5.  **Run on Physical Android Device**

    - Enable **Developer Options** and **USB Debugging** on your phone.
    - Connect your phone via USB.
    - Run `adb devices` to ensure it is connected.
    - Run the app:
        ```bash
        npm run android
        ```

6.  **Build Android APK (Release)**

    To generate a signed APK that you can install manually:
    ```bash
    cd android
    ./gradlew assembleRelease
    ```
    The APK will be located at: `android/app/build/outputs/apk/release/app-release.apk`

## Environment Configuration

The API URL is configured in `src/api/client.ts`.
- Android Emulator: `http://10.0.2.2:8000/api`
- Physical Device: `http://<YOUR_PC_IP>:8000/api` (Make sure your phone and PC are on the same WiFi)
- iOS Simulator: `http://localhost:8000/api`

Update this if your backend is running elsewhere.

## Project Structure

- `src/api`: API client and configuration.
- `src/components`: Reusable UI components.
- `src/context`: Global state (Auth).
- `src/navigation`: Navigation configurations.
- `src/screens`: Application screens.
- `src/types`: TypeScript definitions.
