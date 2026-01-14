import React, { useState, useEffect } from 'react';
import Header from './Header';
import WaterLoader from '../ui/WaterLoader';

const MainLayout = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);

    // Ensure we only show loader on initial mount (optional: could use session storage to show only once per session)
    // For now, simple state is enough as page refresh resets it.

    return (
        <>
            {isLoading && <WaterLoader onFinish={() => setIsLoading(false)} />}

            {/* 
               We can choose to hide the content OR let it render behind. 
               Rendering behind allows the globe to initialize while hidden.
            */}
            <div className="page-container" style={{ visibility: isLoading ? 'hidden' : 'visible', opacity: isLoading ? 0 : 1, transition: 'opacity 0.5s ease-in' }}>
                <Header />
                <main style={{ flex: 1, position: 'relative', height: '100%', width: '100%', overflowY: 'auto' }}>
                    {children}
                </main>
            </div>
        </>
    );
};

export default MainLayout;
