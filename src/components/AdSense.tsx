"use client";
import { useEffect } from 'react';

type Props = {
  adSlot?: string;
  style?: React.CSSProperties;
  className?: string;
};

type WindowWithAds = Window & { adsbygoogle?: unknown[] };

export default function AdSense({ adSlot, style, className }: Props) {
  const clientId = process.env.NEXT_PUBLIC_ADS_CLIENT;
  const slotId = adSlot || process.env.NEXT_PUBLIC_ADS_SLOT;

  useEffect(() => {
    const existing = document.querySelector<HTMLScriptElement>('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]');
    const pushAd = () => {
      try {
        const w = window as WindowWithAds;
        (w.adsbygoogle = w.adsbygoogle || []).push({});
      } catch {}
    };
    if (!existing) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
      script.onload = pushAd;
    } else {
      pushAd();
    }
  }, [clientId]);

  return (
    <ins
      className={`adsbygoogle ${className || ''}`}
      style={style || { display: 'block' }}
      data-ad-client={clientId}
      data-ad-slot={slotId}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}