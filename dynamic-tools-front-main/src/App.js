import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import HomePage from './pages/HomePage';
import AnalyticsPage from './pages/AnalyticsPage';
import NotFoundPage from './pages/NotFoundPage';

import Header from './components/layout/header';
import Footer from './components/layout/footer';
import LoadingBackdrop from './components/common/loading/LoadingBackdrop';

function App() {
  return (
    <div className="main">
      <ToastContainer />
      <LoadingBackdrop />
      <Router>
        <Header />
        <Routes>
          <Route exact path="/" element={<AnalyticsPage />} />
          <Route path="/collection" element={<HomePage />} />
          <Route path="/collection/:slug" element={<AnalyticsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
