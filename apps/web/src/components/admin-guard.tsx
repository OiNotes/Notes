"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AdminGuardProps = {
  children: React.ReactNode;
};

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem("admin_auth");
    if (auth === "true") {
      setIsAuthorized(true);
    } else {
      router.push("/");
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Проверка доступа...</p>
      </div>
    );
  }

  return <>{children}</>;
}
