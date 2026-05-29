import React, { useState } from 'react';
import Layout from './components/Layout';
import ContentQueue from './components/ContentQueue';
import PostModal from './components/PostModal';
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
    <>
      <Layout>
        <ContentQueue />
      </Layout>
      <PostModal />
    </>
  );
};

export default App;
