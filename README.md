# 🇬🇧 English Notes Viewer

**The ultimate interactive platform for mastering English.**

[Live Demo: learn-english-teal.vercel.app](https://learn-english-teal.vercel.app/)

This application transforms static study notes into an **immersive learning experience**. Designed to help students improve pronunciation and comprehension, combining the speed of SSR with the smoothness of a Single Page Application.

-   **Instant Text-to-Speech**: Interactive, high-fidelity audio reviews.
-   **Zero-Flicker Navigation**: Seamless, state-preserving transitions.
-   **Integrated Video Lessons**: Curated YouTube content embedded directly.
-   **Exam-Focused Reviews**: Structured content organization (A1-B2).

![Tech Stack](https://img.shields.io/badge/React-19-61DAFB?logo=react&style=flat-square)
![Tech Stack](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&style=flat-square)
![Tech Stack](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&style=flat-square)
![Tech Stack](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&style=flat-square)
![License](https://img.shields.io/badge/License-GPLv3-green?style=flat-square)

---

## 🚀 Key Features

-   **⚡ Performance**:
    -   **Direct File Access**: High-throughput file reading without redundant caching layers.
    -   **Optimized Assets**: Glassmorphism UI with hardware-accelerated transitions.
-   **🌍 Built-in Translator**: Quick access floating widget powered by Google Translate (GTX) for instant word lookup.
-   **📱 Mobile Support**:
    -   Responsive Sidebar & Touch-friendly tap targets.
    -   Smart YouTube embedding (`playsinline`).
    -   **Background Playback & PiP**: Videos continue playing with screen off or in Picture-in-Picture mode on mobile.

## 📂 Project Structure

```bash
├── app/                  # Source Code
│   ├── server/           # Backend Logic
│   │   ├── index.ts      # Server entry point
│   │   ├── markdownProcessor.ts # Markdown transformations
│   │   └── fileTree.ts   # File system operations
│   ├── src/              # Frontend Logic
│   │   ├── ClientApp.tsx # Client entry point
│   │   ├── components/   # UI Components
│   │   └── App.tsx       # Root Server Component
│   └── public/           # Static Assets
└── contenido/            # Content Storage
    ├── A1/
    ├── A2/
    └── ...
```

## 🛠️ Installation & Usage

### Prerequisites
-   Node.js v20+ (Required for native features)

### Development
```bash
cd app
npm install
npm run dev
```
> Starts hybrid server on port 3000 with Hot Module Replacement.

### ⚡ Easy Launch (Mac & Windows)
If you already have Node.js installed, you can start the application by double-clicking the script for your platform in the root directory:
- **Mac**: Double-click `dev-mac.command`
- **Windows**: Double-click `dev-windows.bat`

*These scripts will automatically install dependencies if they are missing and open the browser for you.*

### Production
```bash
cd app
npm run build
npm start
```
> Builds optimized bundle and serves via efficient Node.js production server.

## 📝 Content Formatting

The system uses advanced Regex to auto-enhance your content. Supported formats:

### 1. Questions & Answers
Standard format for grammar rules.
```markdown
- **Question:** What is your name?
- **Answer:** My name is Albert.
```

### 2. Vocabulary & Expressions
Optimized for phrase lists.
```markdown
- **"How are you?"** - ¿Cómo estás?
- **"See you later"** - Hasta luego
```

*The viewer automatically adds interactive speaker icons and highlighting to the bolded English text.*
