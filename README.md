# ✊ Rock Paper Scissors AI

A browser-based Rock–Paper–Scissors game that uses **computer vision to recognize hand gestures in real time** and lets you play against an AI opponent. Built with React and MediaPipe, with support for installation as a Progressive Web App (PWA).

## ✨ Features

- 📷 Real-time hand detection using your camera
- ✋ Recognizes Rock, Paper, and Scissors gestures
- 🤖 Plays against a randomly choosing AI opponent
- 🏆 Tracks wins, losses, and draws
- 📱 Installable as a Progressive Web App (PWA)
- 🔒 Hand detection runs locally in the browser

## 🛠️ Tech Stack

- **React** – User interface
- **Vite** – Development server and build tool
- **MediaPipe Tasks Vision** – Hand landmark detection
- **JavaScript** – Gesture classification and game logic
- **vite-plugin-pwa** – PWA manifest and service worker

## ⚙️ How It Works

1. The app accesses the user's camera with permission.
2. MediaPipe detects the hand and identifies its landmarks.
3. A gesture classifier determines whether the hand represents Rock, Paper, or Scissors.
4. The player starts a round and holds a gesture during the countdown.
5. The AI randomly selects its move, and the game determines the winner.
6. The scoreboard updates based on the result.

## 🚀 Getting Started

**Prerequisites:** Node.js and npm.

```bash
# Clone the repository
git clone YOUR_GITHUB_REPOSITORY_URL

# Enter the project folder
cd rock-paper-scissor-ai

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open the local URL shown in the terminal.

## 📦 Build for Production

```bash
npm run build
npm run preview
```

## 📲 Install as an App

Deploy the project to an HTTPS-enabled hosting service, such as Vercel. Open the deployed URL in a supported browser and use the **Install App** button when installation is available.

> **Note:** Camera access requires permission and a secure context, such as HTTPS or localhost. MediaPipe model assets are loaded from online URLs, so gesture detection may require an internet connection.

---

