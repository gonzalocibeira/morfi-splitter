import React from "react";
const paths = {
    home: (
        <>
            <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" />
            <path d="M9 21v-8h6v8" />
        </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    split: (
        <>
            <path d="M8 3 4 7l4 4M4 7h12M16 13l4 4-4 4M20 17H8" />
        </>
    ),
    chart: (
        <>
            <path d="M4 3v17h17M9 15V9M14 15V5M19 15v-4" />
        </>
    ),
    wallet: (
        <>
            <path d="M20 8V5a2 2 0 0 0-2-2H6a3 3 0 0 0 0 6h14v11H6a3 3 0 0 1-3-3V6" />
            <path d="M20 12h-6v5h6M17 14.5h.01" />
        </>
    ),
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    chevron: <path d="m9 5 7 7-7 7" />,
    Food: (
        <>
            <path d="M5 3v7m3-7v7m-6-7v5a3 3 0 0 0 6 0M5 11v10M18 21V3c-5 3-5 10 0 10" />
        </>
    ),
    Supermarket: (
        <>
            <path d="M3 4h2l3 12h11l3-9H6M9 20h.01M18 20h.01" />
        </>
    ),
    Utilities: <path d="m13 2-9 12h7l-1 8 10-12h-7Z" />,
    Other: (
        <>
            <rect x="4" y="4" width="6" height="6" rx="2" />
            <rect x="14" y="4" width="6" height="6" rx="2" />
            <rect x="4" y="14" width="6" height="6" rx="2" />
            <rect x="14" y="14" width="6" height="6" rx="2" />
        </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    logout: (
        <>
            <path d="M9 4H4v16h5M9 12h12m-4-4 4 4-4 4" />
        </>
    ),
    edit: (
        <>
            <path d="m15 4 5 5-11 11H4v-5ZM13 6l5 5" />
        </>
    ),
    trash: (
        <>
            <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" />
        </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    calendar: (
        <>
            <rect x="3" y="5" width="18" height="16" rx="3" />
            <path d="M7 3v4M17 3v4M3 11h18M7 15h3" />
        </>
    ),
};
export default function Icon({ name, size = 22, ...props }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            {...props}
        >
            {paths[name] || paths.Other}
        </svg>
    );
}
