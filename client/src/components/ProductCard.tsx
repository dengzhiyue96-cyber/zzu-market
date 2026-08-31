import { Link } from 'react-router-dom';
import { Heart, Eye, MessageCircle } from 'lucide-react';
import { formatPrice, placeholder, timeAgo, campusColor } from '../lib/utils';

export interface ProductCardData {
  id: number;
  title: string;
  price: number;
  original_price?: number;
  cover: string;
  condition: string;
  campus: string;
  contact?: string;
  view_count: number;
  fav_count: number;
  chat_count: number;
  created_at: number;
  category_name?: string;
  category_icon?: string;
  seller_id: number;
  seller_name: string;
  seller_avatar?: string;
  seller_verified?: number;
  book_name?: string;
  course_name?: string;
  product_status?: number;
}

export default function ProductCard({ p }: { p: ProductCardData }) {
  const cover = p.cover || placeholder(p.id, 400, 300, p.category_icon || '🛍');
  const discount = p.original_price ? Math.round((p.price / p.original_price) * 10) : null;
  return (
    <Link to={`/product/${p.id}`} className="card overflow-hidden flex flex-col transition active:scale-[0.985]">
      <div className="relative aspect-[4/3] bg-zinc-50 overflow-hidden">
        <img src={cover} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
        {discount && (
          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-red-500/90 text-white text-[10px] font-bold">
            {discount}折
          </span>
        )}
        {p.course_name && (
          <span className="absolute bottom-2 left-2 chip chip-brand">
            📚 {p.course_name.length > 8 ? p.course_name.slice(0, 8) + '…' : p.course_name}
          </span>
        )}
        {p.campus && (
          <span className={`absolute top-2 right-2 chip !bg-white/90 ${campusColor(p.campus)} !py-0.5`}>
            {p.campus}
          </span>
        )}
      </div>
      <div className="p-2.5 flex flex-col gap-1.5 flex-1">
        <h3 className="text-sm text-zinc-800 line-clamp-2 leading-snug min-h-[2.5rem]">
          {p.title}
        </h3>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className="text-base font-bold text-red-500 leading-none">{formatPrice(p.price)}</span>
          {p.original_price ? (
            <span className="text-[11px] text-zinc-400 line-through">{formatPrice(p.original_price)}</span>
          ) : null}
        </div>
        <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-1 pt-1.5 border-t border-zinc-50">
          <div className="flex items-center gap-1 min-w-0">
            <span className={`px-1.5 py-0.5 rounded text-[10px] bg-zinc-100 text-zinc-600 whitespace-nowrap`}>{p.condition}</span>
            <span className="truncate">{timeAgo(p.created_at)}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-0.5"><Eye size={12} />{p.view_count || 0}</span>
            <span className="flex items-center gap-0.5"><Heart size={12} />{p.fav_count || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
