# Mokudos Mobile App

Social goal-tracking platform built with Expo and React Native.

## Tech Stack

- **Expo** - React Native framework
- **TypeScript** - Type safety
- **Supabase** - Backend (auth, database, storage)
- **React Navigation** - Navigation
- **React Native Testing Library** - Testing

## Project Structure

```
app/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Screen components
│   ├── navigation/      # Navigation setup
│   ├── services/        # API services (Supabase)
│   ├── utils/           # Helper functions
│   ├── types/           # TypeScript types
│   └── hooks/           # Custom React hooks
├── assets/              # Images, fonts
├── App.tsx              # Entry point
└── app.json             # Expo configuration
```

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

3. **Add Supabase credentials to .env:**
   - Get URL and anon key from Supabase dashboard
   - Update `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`

4. **Run the app:**
   ```bash
   # iOS
   npm run ios

   # Android
   npm run android

   # Web
   npm run web
   ```

## Development

- **Start Expo dev server:** `npm start`
- **Run tests:** `npm test` (will add tests as we build)
- **Lint:** `npm run lint` (will configure later)

## Environment Variables

See `.env.example` for required environment variables.

## Next Steps

- [ ] Set up Supabase project
- [ ] Create database schema
- [ ] Build authentication flow (magic link)
- [ ] Build core screens (Home, Create Goal, Post Update, Profile)
- [ ] Add tests

See `/memory/` and `/plans/` for full documentation.
