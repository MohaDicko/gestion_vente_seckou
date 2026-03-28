import React from 'react';

export const SekouLogo = ({ className = "w-12 h-12" }: { className?: string }) => {
    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Design minimaliste pour Draperie (Rideaux/Draps) */}
            <rect x="20" y="20" width="60" height="60" rx="4" stroke="currentColor" strokeWidth="8" className="text-primary" />
            
            {/* Courbe symbolisant un drap ou rideau */}
            <path
                d="M30 20C30 20 40 50 70 50C70 50 80 50 80 80"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                className="text-primary"
            />
            
            {/* Lettre S stylisée */}
            <text x="50" y="65" textAnchor="middle" fontSize="40" fontWeight="bold" fill="currentColor" className="text-primary">S</text>
        </svg>
    );
};
