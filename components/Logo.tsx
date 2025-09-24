import React from 'react';

const logoBase64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIyLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJ1dHJlbmQtZ3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2E3OGJmYSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM3YzNhZWQiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHBhdGggZD0iTTQgMjBWMTBDNCA2LjY4NjI5IDYuNjg2MjkgNCAxMCA0SDE0QzE3LjMxMzcgNCAyMCA2LjY4NjI5IDIwIDEwVjE0IiBzdHJva2U9InVybCgjdXRyZW5kLWdyYWQpIi8+PHBhdGggZD0iTTE1IDlMMjAgNEwyMCA5IiBzdHJva2U9InVybCgjdXRyZW5kLWdyYWQpIi8+PC9zdmc+";

interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export const UtrendLogo: React.FC<LogoProps> = (props) => (
  <img 
    src={logoBase64} 
    alt="utrend Logo" 
    {...props} 
    className={`animate-logo-pulse ${props.className || ''}`}
  />
);