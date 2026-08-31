import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useApp } from './store/app';
import { api } from './lib/http';
import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import PublishPage from './pages/PublishPage';
import TextbookPage from './pages/TextbookPage';
import ChatsPage from './pages/ChatsPage';
import ChatRoomPage from './pages/ChatRoomPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import FavoritesPage from './pages/FavoritesPage';
import MyProductsPage from './pages/MyProductsPage';
import VerifyPage from './pages/VerifyPage';
import WantedPage from './pages/WantedPage';
import WantedDetailPage from './pages/WantedDetailPage';
export default function App() {
    const setConfig = useApp((s) => s.setConfig);
    const token = useApp((s) => s.token);
    const setUser = useApp((s) => s.setUser);
    const loc = useLocation();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        api('/api/config').then(r => r.code === 0 && setConfig(r.data));
        if (token) {
            api('/api/user/me').then(r => {
                if (r.code === 0)
                    setUser(r.data);
            }).finally(() => setLoading(false));
        }
        else {
            setLoading(false);
        }
    }, []); // eslint-disable-line
    const isAuthPage = loc.pathname.startsWith('/login');
    if (loading)
        return (_jsx("div", { className: "h-full flex items-center justify-center text-sm text-zinc-500", children: _jsx("span", { className: "animate-pulse", children: "\u90D1\u5927\u96C6\u5E02\u52A0\u8F7D\u4E2D..." }) }));
    return (_jsxs("div", { className: "min-h-full pb-[72px]", children: [_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/list", element: _jsx(ProductListPage, {}) }), _jsx(Route, { path: "/product/:id", element: _jsx(ProductDetailPage, {}) }), _jsx(Route, { path: "/publish", element: _jsx(PublishPage, {}) }), _jsx(Route, { path: "/wanted", element: _jsx(WantedPage, {}) }), _jsx(Route, { path: "/wanted/:id", element: _jsx(WantedDetailPage, {}) }), _jsx(Route, { path: "/textbooks", element: _jsx(TextbookPage, {}) }), _jsx(Route, { path: "/chats", element: _jsx(ChatsPage, {}) }), _jsx(Route, { path: "/chats/:id", element: _jsx(ChatRoomPage, {}) }), _jsx(Route, { path: "/favorites", element: _jsx(FavoritesPage, {}) }), _jsx(Route, { path: "/me/products", element: _jsx(MyProductsPage, {}) }), _jsx(Route, { path: "/me/verify", element: _jsx(VerifyPage, {}) }), _jsx(Route, { path: "/me", element: _jsx(ProfilePage, {}) }), _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "*", element: _jsx(HomePage, {}) })] }), !isAuthPage && _jsx(NavBar, {})] }));
}
