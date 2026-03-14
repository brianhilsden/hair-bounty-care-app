# Hair Bounty Care - Mobile App

React Native Expo mobile application for Hair Bounty Care.

## Features (Phase 1)

✅ **Authentication**
- Welcome screen with app introduction
- User registration with 7-day free trial
- Login with JWT authentication
- Forgot password functionality
- Automatic token refresh
- Secure token storage with Expo SecureStore

✅ **Design System**
- Beautiful UI components matching website branding
- NativeWind v4 (Tailwind CSS for React Native)
- Custom color palette (browns & golds)
- Reusable components: Button, Input, Card, Badge

✅ **State Management**
- Zustand for global state (auth, user)
- TanStack Query for server state management
- Automatic API request/response handling

✅ **Navigation**
- Expo Router for file-based routing
- Auth flow (welcome, login, register)
- Protected routes with authentication guards
- Tab navigation ready for future phases

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Expo | ~54 | React Native framework |
| React Native | 0.81.5 | Mobile framework |
| Expo Router | ^6.0 | File-based navigation |
| NativeWind | ^4.2 | Tailwind CSS for RN |
| TypeScript | ~5.9 | Type safety |
| Zustand | ^5.0 | State management |
| TanStack Query | ^5.90 | Server state |
| React Hook Form | ^7.71 | Form management |
| Zod | ^4.3 | Schema validation |
| Axios | ^1.13 | HTTP client |

## Project Structure

```
hair-bounty-app/
├── app/                          # Expo Router (file-based routing)
│   ├── _layout.tsx               # Root layout with providers
│   ├── index.tsx                 # Splash/entry screen
│   │
│   ├── (auth)/                   # Auth flow screens
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx           # Welcome screen
│   │   ├── login.tsx             # Login screen
│   │   ├── register.tsx          # Register screen
│   │   └── forgot-password.tsx   # Password reset
│   │
│   └── (tabs)/                   # Main app (tab navigation)
│       ├── _layout.tsx
│       └── home/
│           └── index.tsx         # Home screen
│
├── components/
│   ├── ui/                       # Base UI components
│   │   ├── Button.tsx            # Button component
│   │   ├── Input.tsx             # Input with validation
│   │   ├── Card.tsx              # Card container
│   │   └── Badge.tsx             # Badge/label
│   ├── forms/                    # Form components (Phase 2+)
│   └── shared/                   # Shared components (Phase 2+)
│
├── lib/
│   ├── api.ts                    # Axios client with interceptors
│   ├── queryClient.ts            # TanStack Query config
│   ├── api/
│   │   └── auth.ts               # Auth API endpoints
│   └── validations/
│       └── auth.schema.ts        # Zod validation schemas
│
├── store/
│   └── authStore.ts              # Zustand auth store
│
├── constants/
│   └── colors.ts                 # Brand colors
│
├── hooks/                        # Custom hooks (Phase 2+)
├── assets/                       # Images, animations
│
├── global.css                    # Tailwind styles
├── tailwind.config.js            # Tailwind configuration
├── app.json                      # Expo configuration
├── tsconfig.json
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- Expo Go app on your phone (or Android/iOS simulator)

### Installation

```bash
cd hair-bounty-app
npm install
```

### Running the App

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS (Mac only)
npm run ios

# Run in browser (limited features)
npm run web
```

### Configuration

Make sure the backend API is running at `http://localhost:5000` (or update the API_URL in `lib/api.ts`).

For physical devices, update the API URL to your machine's IP:

```typescript
// lib/api.ts
const API_URL = __DEV__ ? 'http://YOUR_IP:5000/api/v1' : 'https://api.hairbountycare.com/api/v1';
```

## Design System

### Colors

The app uses Hair Bounty Care's brand colors:

```typescript
{
  brown: {
    900: '#2a1f1a',  // Darkest
    800: '#3F2D25',  // Primary background
    700: '#5A4A3A',  // Lighter background
  },
  gold: {
    500: '#D2994A',  // Primary accent
    400: '#C79745',  // Hover states
    300: '#C9764D',  // Secondary accent
  }
}
```

### Components

All UI components support:
- **Multiple variants** (primary, secondary, outline, ghost)
- **Multiple sizes** (sm, md, lg)
- **Consistent styling** matching the website
- **NativeWind classes** for customization

## API Integration

The app communicates with the backend API:

- **Base URL**: `http://localhost:5000/api/v1`
- **Authentication**: JWT with Bearer tokens
- **Token Storage**: Expo SecureStore (encrypted)
- **Auto-refresh**: Automatic token refresh on 401 errors
- **Request interceptors**: Add auth token to all requests
- **Response interceptors**: Handle token refresh automatically

## Phase 1 Complete! 🎉

**What's Working:**
- ✅ User registration with email validation
- ✅ User login with error handling
- ✅ Automatic 7-day free trial activation
- ✅ Secure token storage and automatic refresh
- ✅ Beautiful, branded UI matching the website
- ✅ Form validation with Zod
- ✅ Navigation with Expo Router
- ✅ State management with Zustand
- ✅ API integration with TanStack Query

**What's Next (Phase 2):**
- Onboarding flow (age, gender, hair photo, quiz, goals)
- Hair profile creation
- Photo upload to Cloudinary

## Screens

### Auth Flow
1. **Welcome** - App introduction with CTAs
2. **Register** - Sign up form with 7-day trial
3. **Login** - Login form with "forgot password" link
4. **Forgot Password** - Password reset request

### Main App
1. **Home** - Dashboard (placeholder for Phase 2+)

## Notes

- The app is production-ready for authentication
- All forms have proper validation and error handling
- Tokens are stored securely and refreshed automatically
- UI matches the website branding perfectly
- Navigation structure supports future feature additions

## License

MIT
