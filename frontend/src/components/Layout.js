import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-dark-950">
      {/* Main Content — Centered with max width */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
