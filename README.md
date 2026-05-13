# 🏴‍☠️ Pirate Stream

A modern, fast, and beautifully designed movie and TV show streaming application built with React, Vite, and vanilla CSS. Pirate Stream offers a premium, glassy interface and leverages the TMDB API for rich media data and VidFast for seamless video playback.

## ✨ Features

- **Stunning UI/UX:** A visually striking "glassmorphism" design with smooth transitions, modern typography, and a dynamic hero carousel.
- **Vast Library:** Powered by the TMDB API, easily browse trending movies, TV shows, and search for your favorites.
- **Instant Streaming:** Integrated `vidfast.pro` player for immediate playback without leaving the site.
- **Watch History:** Automatically saves your recently watched content locally so you can pick up where you left off.
- **Fully Responsive:** Carefully crafted CSS ensures a perfect experience on desktop, tablet, and mobile devices.
- **Fast & Lightweight:** Built with Vite and React for lightning-fast hot module replacement (HMR) and optimized production builds.

## 🛠️ Tech Stack

- **Frontend Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Vanilla CSS (CSS Variables, Flexbox, Grid, Custom Animations)
- **Routing:** React Router DOM
- **Data Source:** [TMDB API](https://developer.themoviedb.org/docs)
- **Video Player:** Vidfast.pro

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/pirate-stream.git
   cd pirate-stream
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure the TMDB API Token**
   Open `src/utils/api.js` and ensure your TMDB API Bearer token is correctly configured in the `API_TOKEN` variable.
   *(You can get your API token by registering at [TMDB](https://www.themoviedb.org/))*

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   Visit `http://localhost:5173` in your browser.

## 📁 Project Structure

```
src/
├── assets/         # Static assets like images and icons
├── components/     # Reusable UI components (Navbar, MovieCard, etc.)
├── hooks/          # Custom React hooks (e.g., useWatchHistory)
├── pages/          # Application routes (Home, Search, MovieDetails, History)
├── utils/          # Utility functions and API configuration
├── App.jsx         # Main application component and routing
└── main.jsx        # React entry point
```

## 🤝 Contributing

Contributions are welcome! If you'd like to improve the app or add new features:
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📝 License

This project is open-source and available under the MIT License.

## 🙏 Acknowledgements

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for their comprehensive API.
- [Lucide React](https://lucide.dev/) for beautiful iconography.
- The open-source community for the tools that made this possible.
