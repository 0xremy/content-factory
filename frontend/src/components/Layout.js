import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-dark-950">
      {/* Main Content — Full Width */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
