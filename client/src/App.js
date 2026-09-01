import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from './store/app';
import { api } from './lib/http';
import NavBar from './components/NavBar';
import SplashScreen from './components/SplashScreen';
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
import AdminPage from './pages/AdminPage';
export default function App() {
    const setConfig = useApp((s) => s.setConfig);
    const token = useApp((s) => s.token);
    const setUser = useApp((s) => s.setUser);
    const login = useApp((s) => s.login);
    const user = useApp((s) => s.user);
    const loc = useLocation();
    const nav = useNavigate();
    const [loading, setLoading] = useState(true);
    // 小程序 web-view 带进来的 wx_code：自动微信一键登录
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const wx_code = params.get('wx_code');
        if (wx_code && !token) {
            api('/api/auth/wx-login', { method: 'POST', data: { code: wx_code } })
                .then((r) => {
                if (r.code === 0) {
                    login(r.data.token, r.data.user);
                    // 清除 URL 参数，避免重复触发
                    window.history.replaceState(null, '', window.location.pathname);
                }
            }).catch(() => { });
        }
    }, []); // eslint-disable-line
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
    // 管理后台路由守卫：非管理员禁止进入
    useEffect(() => {
        if (loc.pathname.startsWith('/admin') && user && user.role !== 'admin') {
            nav('/login?from=%2Fadmin', { replace: true });
        }
    }, [loc.pathname, user, nav]);
    const isAuthPage = loc.pathname.startsWith('/login');
    const isAdminPage = loc.pathname.startsWith('/admin');
    if (loading)
        return (_jsx("div", { className: "h-full flex items-center justify-center text-sm text-zinc-500", children: _jsx("span", { className: "animate-pulse", children: "ZZU\u4E8C\u624B\u5E02\u573A\u52A0\u8F7D\u4E2D..." }) }));
    return (_jsxs(_Fragment, { children: [_jsx(SplashScreen, {}), _jsxs("div", { className: "min-h-full pb-[72px]", children: [_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/list", element: _jsx(ProductListPage, {}) }), _jsx(Route, { path: "/product/:id", element: _jsx(ProductDetailPage, {}) }), _jsx(Route, { path: "/publish", element: _jsx(PublishPage, {}) }), _jsx(Route, { path: "/wanted", element: _jsx(WantedPage, {}) }), _jsx(Route, { path: "/wanted/:id", element: _jsx(WantedDetailPage, {}) }), _jsx(Route, { path: "/textbooks", element: _jsx(TextbookPage, {}) }), _jsx(Route, { path: "/chats", element: _jsx(ChatsPage, {}) }), _jsx(Route, { path: "/chats/:id", element: _jsx(ChatRoomPage, {}) }), _jsx(Route, { path: "/favorites", element: _jsx(FavoritesPage, {}) }), _jsx(Route, { path: "/me/products", element: _jsx(MyProductsPage, {}) }), _jsx(Route, { path: "/me/verify", element: _jsx(VerifyPage, {}) }), _jsx(Route, { path: "/me", element: _jsx(ProfilePage, {}) }), _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/admin", element: _jsx(AdminPage, {}) }), _jsx(Route, { path: "*", element: _jsx(HomePage, {}) })] }), !isAuthPage && !isAdminPage && _jsx(NavBar, {})] })] }));
}
