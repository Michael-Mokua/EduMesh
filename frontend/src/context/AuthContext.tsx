import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'national_admin' | 'county_admin' | 'admin' | 'teacher' | 'student' | 'parent';

export interface User {
    id: number;
    username: string;
    display_name?: string;
    role: UserRole;
    school_id?: number;
    county?: string;
    avatar_color?: string;
    subjects_json?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const savedToken = localStorage.getItem('edumesh_token');
        const savedUser = localStorage.getItem('edumesh_user');
        if (savedToken && savedUser) {
            try {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem('edumesh_token');
                localStorage.removeItem('edumesh_user');
            }
        }
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('edumesh_token', newToken);
        localStorage.setItem('edumesh_user', JSON.stringify(newUser));
        // Offline fallback cache
        localStorage.setItem(`edumesh_offline_user_${newUser.username}`, JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('edumesh_token');
        localStorage.removeItem('edumesh_user');
    };

    const isRole = (...roles: UserRole[]) => !!user && roles.includes(user.role);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, isRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
