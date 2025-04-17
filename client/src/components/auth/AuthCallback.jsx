// src/components/AuthCallback.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        // Extract token from URL fragment (#)
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        
        const token = params.get('token');
        const expiry = params.get('expiry');
        const page = params.get('page') || 'dashboard';

        if (token && expiry) {
            localStorage.setItem('microsoftAccessToken', token);
            localStorage.setItem('tokenExpiry', expiry);
            navigate(`/${page}`);
        } else {
            navigate('/?error=auth_failed');
        }
    }, []);

    return <div>Logging you in...</div>;
}