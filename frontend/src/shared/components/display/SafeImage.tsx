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
  sizes?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  loading?: 'lazy' | 'eager';
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
  sizes,
  priority,
  placeholder,
  blurDataURL,
  loading,
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  if (hasError) {
    return (
      <div
        className={`bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center ${className}`}
        style={style}
      >
        <svg
          className="w-12 h-12 text-primary-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
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
      sizes={sizes}
      priority={priority}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      loading={loading}
      {...imageProps}
    />
  );
};

export default SafeImage;
