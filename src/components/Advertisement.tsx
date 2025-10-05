import React, { useEffect } from 'react';

interface AdProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  style?: React.CSSProperties;
}

export function Advertisement({ slot, format = 'auto', style }: AdProps) {
  useEffect(() => {
    try {
      // Push the command to Google AdSense
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push(
        {}
      );
    } catch (error) {
      console.error('Error loading advertisement:', error);
    }
  }, []);

  return (
    <div className="advertisement-container my-4">
      <ins
        className="adsbygoogle"
        style={style || { display: 'block' }}
        data-ad-client="ca-pub-2675674662794179" // Replace with your AdSense publisher ID
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
