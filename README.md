# JobTrack - Contractor Job Tracker

A simple offline-first mobile app for contractors to track jobs, attach photos, and manage work progress.

## Features

- Create and track jobs with client information
- Update job status (Pending → In Progress → Completed)
- Add notes to jobs
- Attach photos from camera or gallery
- Generate job summaries
- Offline-first with SQLite storage

## Tech Stack

- React Native with Expo
- Expo Router for navigation
- Expo SQLite for local database
- Expo ImagePicker for photos
- Lucide React Native for icons

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- Expo CLI
- Expo Go app on your iOS/Android device

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

## Important Notes

**This app is designed for mobile devices (iOS/Android) only.**

The app uses Expo SQLite for local storage, which works on iOS and Android but not on web. To test the app:

1. Use Expo Go on a physical device
2. Or create a development build for iOS/Android

## Project Structure

```
app/
├── (tabs)/
│   ├── index.tsx          # Job list screen
│   ├── create.tsx         # Create job screen
│   └── _layout.tsx        # Tab navigation
├── job/
│   ├── [id].tsx           # Job details screen
│   └── [id]/
│       └── add-note.tsx   # Add note screen
└── _layout.tsx            # Root layout

components/
├── JobCard.tsx            # Job list item
└── PhotoThumbnail.tsx     # Photo preview

database/
└── db.ts                  # SQLite database functions

types/
└── job.ts                 # TypeScript types
```

## Data Model

### Job

- id, title, clientName, address, description
- price (optional), status, createdAt

### Note

- id, jobId, text, createdAt

### Photo

- id, jobId, uri, createdAt

## App Flow

1. **Jobs Tab** - View all jobs, tap to see details
2. **New Job Tab** - Create a new job with client info
3. **Job Details** - View job info, add notes, attach photos
4. **Start/Complete** - Update job status
5. **Generate Summary** - Create a text summary of the job

## Running on Mobile

### Using Expo Go (Recommended for Testing)

1. Install Expo Go from App Store or Play Store
2. Run `npm run dev`
3. Scan the QR code

### Creating a Production Build

For production, create a development build:

```bash
npx expo install expo-dev-client
npx expo run:ios
# or
npx expo run:android
```

## Future Enhancements

- Cloud sync with Supabase
- User authentication
- PDF report generation
- Job scheduling
- Time tracking
- Invoice generation

## License

MIT
