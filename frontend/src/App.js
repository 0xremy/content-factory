import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ContentQueue from './components/ContentQueue';
import ThreadPreview from './components/ThreadPreview';
import PostEditor from './components/PostEditor';
import AnalyticsView from './components/AnalyticsView';
import LoginPage from './components/LoginPage';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('dashboard_token'));

  const handleLogin = (newToken) => {
    localStorage.setItem('dashboard_token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('dashboard_token');
    setToken(null);
  };

  if (!token) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <Layout title="Content Queue" onLogout={handleLogout}>
            <ContentQueue />
          </Layout>
        } />
        <Route path="/preview/:postId" element={
          <Layout title="Thread Preview" onLogout={handleLogout}>
            <ThreadPreview />
          </Layout>
        } />
        <Route path="/edit/:postId" element={
          <Layout title="Edit Thread" onLogout={handleLogout}>
            <PostEditor />
          </Layout>
        } />
        <Route path="/analytics/:postId" element={
          <Layout title="Performance Analytics" onLogout={handleLogout}>
            <AnalyticsView />
          </Layout>
        } />
        <Route path="/publish" element={
          <Layout title="Create New Thread" onLogout={handleLogout}>
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 bg-white rounded-2xl border border-slate-200">
              <p className="text-lg font-medium">Thread Creator coming in the next sprint!</p>
              <p className="text-sm">For now, use the API /ingest endpoint to add content.</p>
            </div>
          </Layout>
        } />
        <Route path="/settings" element={
          <Layout title="System Settings" onLogout={handleLogout}>
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 bg-white rounded-2xl border border-slate-200">
              <p className="text-lg font-medium">Settings panel under construction.</p>
            </div>
          </Layout>
        } />
      </Routes>
    </Router>
  );
};

export default App;
