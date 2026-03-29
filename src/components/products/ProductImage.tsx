'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
}

export default function ProductImage({ src, alt, fill, width, height, className, sizes }: ProductImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={`bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center ${className || ''}`}>
        <div className="text-center p-4">
          <div className="text-4xl mb-2">📦</div>
          <p className="text-sm text-gray-500">{alt}</p>
        </div>
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 400}
      height={height || 400}
      className={className}
      onError={() => setError(true)}
    />
  );
}
