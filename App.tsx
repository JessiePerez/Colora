
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import WelcomeScreen from './components/WelcomeScreen';
import PermissionScreen from './components/PermissionScreen';
import CameraScreen from './components/CameraScreen';
import ConfirmationScreen from './components/ConfirmationScreen';
import ResultsScreen from './components/ResultsScreen';
import ExploreScreen from './components/ExploreScreen';
import SavedScreen from './components/SavedScreen';
import { AnalysisResponse } from './types';

const App: React.FC = () => {
  const [capturedColor, setCapturedColor] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);

  return (
    <HashRouter>
      <div className="min-h-screen bg-background-dark text-white max-w-md mx-auto shadow-2xl overflow-hidden relative">
        <Routes>
          {/* El punto de entrada siempre será WelcomeScreen */}
          <Route path="/" element={<WelcomeScreen />} />
          
          <Route path="/permissions" element={<PermissionScreen />} />
          
          <Route path="/explore" element={
            <ExploreScreen 
              onAnalysisReady={(res) => setAnalysis(res)} 
              onSetCapturedColor={(color) => setCapturedColor(color)}
            />
          } />
          
          <Route path="/saved" element={
            <SavedScreen 
              onAnalysisReady={(res) => setAnalysis(res)} 
              onSetCapturedColor={(color) => setCapturedColor(color)}
            />
          } />
          
          <Route path="/capture" element={
            <CameraScreen onCapture={(color) => setCapturedColor(color)} />
          } />
          
          <Route path="/confirmation" element={
            capturedColor ? (
              <ConfirmationScreen 
                color={capturedColor} 
                onConfirm={(finalColor) => setCapturedColor(finalColor)}
                onAnalysisReady={(res) => setAnalysis(res)}
              />
            ) : <Navigate to="/" />
          } />
          
          <Route path="/results" element={
            analysis ? (
              <ResultsScreen analysis={analysis} onReset={() => {
                setCapturedColor(null);
                setAnalysis(null);
              }} />
            ) : <Navigate to="/" />
          } />

          {/* Fallback para cualquier otra ruta */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;
