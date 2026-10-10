# TaskFlow - Modern To-Do List Application

A high-performance, responsive To-Do List web application with real-time Firebase Firestore database persistence, Google Authentication, and snappy client-side state management.

## 🚀 Features

- **Client-Side State Management**: Instant, zero-latency interactions built with React `useState`.
- **Firebase Database & Google Auth**:
  - Sign in with Google to synchronize your tasks across all devices in real-time.
  - Offline/Guest mode support with `localStorage` fallback.
  - Automatic migration: sync guest tasks to your cloud account upon signing in.
- **Task Management**:
  - Add tasks with keyboard shortcut (`Enter`).
  - Set priority levels (`Low`, `Medium`, `High`) and categories (`Work`, `Personal`, `Health`, `Shopping`, `Ideas`).
  - Strikethrough visual styling with confetti celebrations on completion.
  - Inline task editing and quick delete.
  - Batch actions: "Mark all complete" and "Clear completed".
- **Productivity & Filtering**:
  - Filter by **All**, **Active**, and **Completed** with live counter badges.
  - Instant text search across all tasks.
  - Sort by newest, oldest, priority, or alphabetical order.
  - Progress bar and completion analytics.
- **Responsive & Accessible Design**: Beautiful dark mode with Tailwind CSS and Lucide icons.

---

## 🛠️ GitHub & Vercel Deployment

### Deploying to GitHub
1. Initialize git and commit:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of TaskFlow to-do app"
   ```
2. Link your remote repository and push:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```

### Deploying to Vercel
1. Import your GitHub repository in [Vercel](https://vercel.com).
2. Framework Preset: **Vite** (detected automatically via `vercel.json`).
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Click **Deploy**.
