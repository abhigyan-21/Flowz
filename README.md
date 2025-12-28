# Flowz - Response Management System (RMS) Frontend

Flowz is a modern Response Management System frontend designed for real-time flood monitoring, alerts, and analytics. It features a stunning 3D interactive globe, dynamic dashboard overlays, and historical data visualization.

## 🚀 Features

### 🌍 3D Interactive Map
- **Tech**: Powered by `react-globe.gl` and `three.js`.
- **Experience**: Photorealistic 3D Earth model with topology and atmosphere.
- **Interaction**: Click on alert markers to smoothly zoom and focus on specific regions. Space-themed background.

### 📊 Dashboard & Analytics
- **Alerts Overlay**: Floating panel with toggle controls for "Alerts" vs "Evacuation" modes.
- **Real-time Info**: 
    - **Alerts**: For You, Country-wide, Severity levels (High, Moderate, Info).
    - **Evacuation**: Routes (Safe/Caution) and Shelters.
- **Analytics Page**: 
    - Visual statistics cards.
    - Interactive Line Charts for flood incidents & water levels.
    - Area Charts for rainfall trends.

### 🔮 Predictions & Forecasts
- **Forecast Page**: 7-Day and 24-Hour flood prediction views.
- **Risk Assessment**: Clear visual indicators for flood risk levels.

### 🎨 UI/UX Excellence
- **Design**: Premium glassmorphism aesthetics with translucent headers and panels.
- **Responsiveness**: Fully responsive layout for various screen sizes.
- **Micro-interactions**: Hover effects, smooth transitions, and auto-closing dropdowns.
- **Custom Assets**: Integrated "Flowz" branding.

## 🛠️ Tech Stack

- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling**: Vanilla CSS (Modular & Variable-based)
- **3D Visualization**: `react-globe.gl`, `three.js`
- **Maps (Legacy)**: `leaflet`, `react-leaflet` (available but replaced by Globe)
- **Charts**: `recharts`
- **Routing**: `react-router-dom`
- **Icons**: `lucide-react`

## 🏃‍♂️ Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/abhigyan-21/Flowz.git
    cd RMS
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```

4.  **Open in Browser**
    Visit `http://localhost:5173` to view the application.

## 📁 Project Structure

```
src/
├── assets/          # Images and static resources
├── components/
│   ├── dashboard/   # Overlay panels, Alert cards
│   ├── layout/      # Header, MainLayout
│   ├── map/         # MapComponent (3D Globe)
│   └── charts/      # Recharts components
├── pages/
│   ├── Home.jsx           # Main Landing (Globe + Dashboard)
│   ├── Analytics.jsx      # Historical Data & Stats
│   ├── Forecast.jsx       # Predictions Page
│   └── AlertsHistory.jsx  # Notification Log
├── styles/          # Modular CSS files
└── main.jsx         # Entry point & Routing
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
