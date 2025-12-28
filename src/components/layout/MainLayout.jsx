import React from 'react';
import Header from './Header';

const MainLayout = ({ children }) => {
    return (
        <div className="page-container">
            <Header />
            <main style={{ flex: 1, position: 'relative', height: '100%', width: '100%' }}>
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
