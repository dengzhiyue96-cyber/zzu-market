import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
/**
 * ZZU二手市场 启动页（每次进入网站展示2.4秒，只展示一次）
 */
const SplashScreen = () => {
    const [show, setShow] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setShow(false), 2400);
        return () => clearTimeout(timer);
    }, []);
    if (!show)
        return null;
    return (_jsxs("div", { className: "splash-screen", children: [_jsx("div", { className: "splash-ring", style: { left: '50%', top: '50%', transform: 'translate(-50%,-50%)' } }), _jsx("div", { className: "splash-ring", style: { left: '50%', top: '50%', transform: 'translate(-50%,-50%)', animationDelay: '0.7s' } }), _jsx("div", { className: "splash-logo", children: _jsxs("svg", { width: "64", height: "64", viewBox: "0 0 64 64", fill: "none", children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "s-gold", x1: "0", y1: "0", x2: "1", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: "#F1D48A" }), _jsx("stop", { offset: "100%", stopColor: "#C9A658" })] }) }), _jsx("path", { d: "M18 22 L46 22 L30 40 L46 40 L18 42 L34 24 L18 24 Z", fill: "url(#s-gold)" })] }) }), _jsx("div", { className: "splash-title", children: "ZZU\u4E8C\u624B\u5E02\u573A" }), _jsx("div", { className: "splash-sub", children: "\u6821 \u5185 \u76F4 \u8FDE \u00B7 \u653E \u5FC3 \u4EA4 \u6613" }), _jsx("div", { className: "splash-tag", children: "ZZU \u00B7 \u90D1\u5927\u540C\u5B66\u4E13\u5C5E" })] }));
};
export default SplashScreen;
