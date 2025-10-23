# My Task - Android Learning App

A comprehensive mobile learning platform built with React Native/Expo and Firebase, designed to help students enhance their skills through structured courses and tasks.

## Features

### Admin Dashboard
- **User Management**: View, block/unblock users, manage premium access
- **Course Management**: Create and organize courses by categories
- **Task Management**: Add programming and non-programming tasks
- **Programming Language Support**: Integrated compiler support for multiple languages
- **Statistics Dashboard**: Track users, courses, and engagement

### User Dashboard
- **Course Browsing**: Explore courses organized by categories
- **Task Completion**: View and complete tasks with progress tracking
- **In-App Compiler**: Practice coding in C, C++, Java, JavaScript, Python
- **Premium Access**: Special premium courses for authorized users
- **Profile Management**: Update profile and track learning progress

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Compiler API**: JDoodle for online code execution
- **Navigation**: React Navigation with tab-based navigation
- **UI/UX**: Dark theme with gradient colors (purple, blue, pink)

## Firebase Configuration

The app is connected to Firebase with the following services:
- **Authentication**: Email/Password authentication
- **Firestore**: Real-time database for courses, tasks, and users
- **Storage**: Image and file storage

## Admin Credentials

- **Email**: admin@mytasks.com
- **Password**: mytasks@admin

## Database Structure

```
Firestore Collections:
├── users/
│   ├── {userId}/
│   │   ├── name
│   │   ├── email
│   │   ├── role (admin/user)
│   │   ├── isBlocked
│   │   └── premiumAccess
├── categories/
│   ├── {categoryId}/
│   │   ├── name
│   │   └── icon
├── courses/
│   ├── {courseId}/
│   │   ├── title
│   │   ├── description
│   │   ├── categoryId
│   │   ├── isProgramming
│   │   ├── language
│   │   └── premium
└── tasks/
    ├── {taskId}/
    │   ├── courseId
    │   ├── title
    │   └── description
```

## Programming Languages Supported

The in-app compiler supports:
- C
- C++
- Java
- JavaScript
- Python
- Go
- Rust
- Ruby

## UI/UX Design

- **Theme**: Dark mode with gradient backgrounds
- **Colors**: Purple (#667eea), Pink (#764ba2), Blue (#24243e)
- **Components**: Rounded cards (20dp), gradient buttons, animated transitions
- **Icons**: Expo Vector Icons (Ionicons)

## Key Features

1. **Role-Based Access**: Separate dashboards for Admin and Users
2. **Premium System**: Course-level and user-level premium access control
3. **Code Compiler**: Real-time code execution with output display
4. **Beautiful UI**: Modern dark theme with gradients and animations
5. **Progress Tracking**: Track course completion and task status
6. **Responsive Design**: Works on all mobile screen sizes

## Getting Started

1. **Sign Up**: Create a new account with email and password
2. **Login**: Use your credentials to access your dashboard
3. **Browse Courses**: Explore available courses by category
4. **Complete Tasks**: Work through tasks to enhance your skills
5. **Use Compiler**: Practice coding directly in the app

## Admin Panel Features

### Dashboard
- Total users count
- Total courses count
- Categories count
- Active users tracking

### User Management
- View all registered users
- Block/unblock users
- Grant/revoke premium access
- View user profiles and progress

### Course Creation
- Add new categories
- Create courses with descriptions
- Mark as programming/premium
- Select programming language for coding courses
- Organize courses by categories

## Future Enhancements

- Certificates for completed courses
- In-app chat between admin and users
- Gamification (XP points, badges)
- Payment gateway for premium courses
- Discussion forums per course
- Video course content
- Progress reports and analytics

## Credits

**Designed & Developed By ❤️ Sumanth Csy**

Version: 1.0.0

---

## Technical Notes

- Built with Expo SDK 54
- React Native 0.79.5
- Firebase v12
- React Navigation v7
- Platform-aware Firebase persistence (AsyncStorage for mobile, localStorage for web)
- JDoodle API for code compilation

## License

This is a personal teaching companion app.
