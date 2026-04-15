import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children, onLogout }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-dark-950">
      <Sidebar onLogout={onLogout} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
