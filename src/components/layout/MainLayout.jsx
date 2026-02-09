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

            {/* Render content behind the loader so heavy components (Globe) can initialize while hidden visually. */}
            <div className="page-container" style={{ pointerEvents: isLoading ? 'none' : 'auto' }}>
                <Header />
                <main className="main-content">
                    {children}
                </main>
            </div>
        </>
    );
};

export default MainLayout;
