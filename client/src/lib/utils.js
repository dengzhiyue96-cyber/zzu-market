import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');
export function timeAgo(ts) {
    if (!ts)
        return '';
    return dayjs(Number(ts)).fromNow();
}
export function formatPrice(n) {
    if (n === undefined || n === null)
        return '';
    return `¥${Number(n).toFixed(Number.isInteger(n) ? 0 : 2)}`;
}
export function placeholder(seed, w = 400, h = 300, label = '郑大二手市场') {
    const colors = ['#F2F7FF', '#EAFBF8', '#FEF3C7', '#FCE7F3', '#E5EAFF', '#FFE4E6'];
    const c = colors[Number(seed) % colors.length];
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'><defs><linearGradient id='g' x1='0' x2='1'><stop offset='0' stop-color='${c}'/><stop offset='1' stop-color='#ffffff'/></linearGradient></defs><rect width='${w}' height='${h}' fill='url(#g)'/><text x='50%25' y='52%25' text-anchor='middle' font-size='32' font-family='PingFang SC,sans-serif' fill='rgba(75,63,227,0.65)' font-weight='700'>${label}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
export function campusColor(campus) {
    switch (campus) {
        case '主校区': return 'bg-purple-100 text-purple-700';
        case '南校区': return 'bg-amber-100 text-amber-700';
        case '北校区': return 'bg-sky-100 text-sky-700';
        case '东校区': return 'bg-emerald-100 text-emerald-700';
        default: return 'bg-zinc-100 text-zinc-700';
    }
}
export function verifiedBadge(v) {
    if (v === 2)
        return { text: '已认证', cls: 'bg-brand/10 text-brand' };
    if (v === 1)
        return { text: '审核中', cls: 'bg-amber-100 text-amber-700' };
    return { text: '未认证', cls: 'bg-zinc-200 text-zinc-600' };
}
