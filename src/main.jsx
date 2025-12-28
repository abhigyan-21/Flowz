import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Home from './pages/Home'
import Analytics from './pages/Analytics'
import Forecast from './pages/Forecast'
import AlertsHistory from './pages/AlertsHistory'
import './styles/main.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/alerts" element={<AlertsHistory />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  </StrictMode>,
)
