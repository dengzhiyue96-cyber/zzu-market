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
        if (r.code === 0) setUser(r.data);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  const isAuthPage = loc.pathname.startsWith('/login');
  if (loading) return (
    <div className="h-full flex items-center justify-center text-sm text-zinc-500">
      <span className="animate-pulse">郑大集市加载中...</span>
    </div>
  );

  return (
    <div className="min-h-full pb-[72px]">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/list" element={<ProductListPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/publish" element={<PublishPage />} />
        <Route path="/wanted" element={<WantedPage />} />
        <Route path="/wanted/:id" element={<WantedDetailPage />} />
        <Route path="/textbooks" element={<TextbookPage />} />
        <Route path="/chats" element={<ChatsPage />} />
        <Route path="/chats/:id" element={<ChatRoomPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/me/products" element={<MyProductsPage />} />
        <Route path="/me/verify" element={<VerifyPage />} />
        <Route path="/me" element={<ProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      {!isAuthPage && <NavBar />}
    </div>
  );
}
