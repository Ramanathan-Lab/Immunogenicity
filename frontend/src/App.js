import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import TherapeuticDetailsPage from './pages/TherapeuticDetailsPage';
import ImmunogenicityDetailsPage from './pages/ImmunogenicityDetailsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import PackageDetailsPage from './pages/PackageDetailsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/therapeutic-details" element={<TherapeuticDetailsPage />} />
        <Route path="/immunogenicity-details" element={<ImmunogenicityDetailsPage />} />
        <Route path="/product-details" element={<ProductDetailsPage />} />
        <Route path="/package-details" element={<PackageDetailsPage />} />
        {/* Info Page is not implemented fully yet, but we can add a placeholder: */}
        <Route path="/info" element={<div style={{ padding: '1rem' }}>Info Page (TBD)</div>} />
      </Routes>
    </Router>
  );
}

export default App;
