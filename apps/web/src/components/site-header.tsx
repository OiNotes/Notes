"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Container } from "./container";

export function SiteHeader() {
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Сброс счётчика через 2 секунды бездействия
    if (clickCount > 0) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setClickCount(0);
      }, 2000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [clickCount]);

  const handleBrandClick = (e: React.MouseEvent) => {
    e.preventDefault();

    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount === 5) {
      // 5-й клик - запрос пароля
      const password = prompt("🔐 Введите пароль:");

      if (password === "1234") {
        // Сохраняем в sessionStorage для доступа к админке
        sessionStorage.setItem("admin_auth", "true");
        router.push("/admin/music");
      } else if (password !== null) {
        alert("❌ Неверный пароль!");
      }

      setClickCount(0);
    } else if (newCount < 5) {
      // Просто переходим на главную при клике
      router.push("/");
    }
  };

  return (
    <header className="site-header">
      <Container className="site-header__inner">
        <a
          href="/"
          onClick={handleBrandClick}
          className="brand"
          aria-label="Oi/Notes — на главную"
        >
          <span className="brand__mark" aria-hidden="true">
            Oi
          </span>
          <span className="brand__text">Notes</span>
        </a>
      </Container>
    </header>
  );
}
