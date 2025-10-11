"use client";

import { useEffect } from "react";

export default function WebsiteWidgets() {
  useEffect(() => {
    // Tawk.to Script
    const Tawk_API = (window as any).Tawk_API || {};
    const Tawk_LoadStart = new Date();
    
    (function() {
      const s1 = document.createElement("script");
      const s0 = document.getElementsByTagName("script")[0];
      
      s1.async = true;
      s1.src = 'https://embed.tawk.to/68d51682131e39194eb8122f/1j605vs53';
      s1.charset = 'UTF-8';
      s1.setAttribute('crossorigin', '*');
      
      if (s0 && s0.parentNode) {
        s0.parentNode.insertBefore(s1, s0);
      }
    })();

    // Sienna Widget Script
    const siennaScript = document.createElement("script");
    siennaScript.src = "https://website-widgets.pages.dev/dist/sienna.min.js";
    siennaScript.defer = true;
    document.head.appendChild(siennaScript);
  }, []);

  return null; // This component doesn't render anything visible
}
