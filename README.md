# 🍉 Webcam Fruit Ninja (Static Edition)

A modern, real-time, gesture-controlled browser game inspired by Fruit Ninja. Slice fruits with your finger in front of your webcam! 

**This project is a 100% static web application. No backend or installation required!**

## ✨ Features

- **Gesture Control**: Use your index finger as a blade. No mouse or keyboard needed!
- **Real-time Tracking**: Powered by MediaPipe JavaScript for low-latency hand landmark detection.
- **Pure Static**: Hosted easily on GitHub Pages, Vercel, or Netlify.
- **Scoring System**: Includes combos, high scores, and increasing difficulty levels.
- **Dynamic Gameplay**: Fruits spawn at increasing rates, with bombs to avoid.

## 🚀 Getting Started

Simply open `index.html` in any modern web browser or host it on a static hosting platform.

### Hosting on GitHub Pages
1. Push this repository to GitHub.
2. Go to **Settings > Pages**.
3. Select the `main` branch and `/ (root)` folder.
4. Click Save. Your game will be live in minutes!

## 🎮 How to Play

1. **Start**: Click the "Play Game" button.
2. **Permission**: Allow camera access when prompted.
3. **Slice**: Use your **index finger** to slice fruits.
4. **Combos**: Slice multiple fruits in quick succession for bonus points.
5. **Avoid Bombs**: Slicing a bomb results in an instant game over.
6. **Lives**: You start with 3 lives. Missing a fruit (letting it fall) costs 1 life.

## 📂 Project Structure

```text
.
├── index.html          # Main entry point (Static HTML)
├── static/
│   ├── game.js         # Core Game Engine (Physics, Logic, Rendering)
│   ├── script.js       # MediaPipe Integration & Camera Handling
│   ├── style.css       # Glassmorphism UI Styles
│   └── assets/         # Game sprites and sound effects
└── README.md           # Project Documentation
```

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
