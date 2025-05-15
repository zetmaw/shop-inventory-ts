import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
export default function AuthGuard({ children }) {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            if (data.session) {
                setAuthenticated(true);
            }
            else {
                navigate('/login');
            }
            setLoading(false);
        };
        checkSession();
    }, [navigate]);
    if (loading) {
        return _jsx("div", { className: "p-4 text-gray-500", children: "\uD83D\uDD10 Checking auth..." });
    }
    return _jsx(_Fragment, { children: authenticated ? children : null });
}
