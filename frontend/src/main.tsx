import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import PaperPage from './pages/PaperPage';
import CheckPage from './pages/CheckPage';
import DocsPage from './pages/DocsPage';
import NotFoundPage from './pages/NotFoundPage';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<HomePage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="paper/:paperId" element={<PaperPage />} />
          <Route path="check/:checkId" element={<CheckPage />} />
          <Route path="docs" element={<DocsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
