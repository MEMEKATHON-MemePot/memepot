"use client";

import { useEffect } from "react";

export const ExternalStyles = () => {
  useEffect(() => {
    // Remix Icon 추가
    const remixIconLink = document.createElement("link");
    remixIconLink.rel = "stylesheet";
    remixIconLink.href = "https://cdn.jsdelivr.net/npm/remixicon@4.0.0/fonts/remixicon.css";
    document.head.appendChild(remixIconLink);

    return () => {
      // Cleanup: 컴포넌트 언마운트 시 제거
      document.head.removeChild(remixIconLink);
    };
  }, []);

  return null;
};
