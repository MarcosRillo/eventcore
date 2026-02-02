/**
 * SafeImage Component
 * Wrapper around Next.js Image component for handling external/dynamic URLs safely
 * Provides fallback handling and proper error states
 */

'use client';

import Image from 'next/image';
import { useState } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  width?: number;
  height?: number;
  fill?: boolean;
  style?: React.CSSProperties;
}

const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallback,
  width,
  height,
  fill = false,
  style,
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  if (hasError) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center text-gray-500 text-sm ${className}`}
        style={style}
      >
        Error al cargar imagen
      </div>
    );
  }

  const imageProps = fill
    ? { fill: true }
    : { width: width || 100, height: height || 100 };

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setHasError(true)}
      {...imageProps}
    />
  );
};

export default SafeImage;
