import { useEffect, useState } from 'react';

/** Seconds a button stays locked after `open` turns true: time to read first (as on the kiosk). */
export function useLock(open: boolean, seconds = 2): number {
    const [left, setLeft] = useState(0);
    useEffect(() => {
        if (!open) return;
        setLeft(seconds);
        const id = window.setInterval(() => setLeft(n => {
            if (n <= 1) window.clearInterval(id);
            return Math.max(0, n - 1);
        }), 1000);
        return () => window.clearInterval(id);
    }, [open, seconds]);
    return left;
}
