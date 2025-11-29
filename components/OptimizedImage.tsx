import React, { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  lazy?: boolean;
}

/**
 * OptimizedImage component with lazy loading and responsive image support.
 * Prefers WebP format with fallback to original format.
 * Generates responsive sizes and uses lazy loading to reduce initial payload.
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  lazy = true,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Extract base path and extension
  const lastDot = src.lastIndexOf('.');
  const basePath = src.substring(0, lastDot);
  const ext = src.substring(lastDot);

  // Generate responsive sizes
  const sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

  return (
    <picture>
      {/* WebP format with fallback to original */}
      <source
        srcSet={`
          ${basePath}.webp 1x,
          ${basePath}@2x.webp 2x
        `}
        type="image/webp"
        sizes={sizes}
      />
      
      {/* Original format fallback */}
      <source
        srcSet={`
          ${src} 1x,
          ${basePath}@2x${ext} 2x
        `}
        sizes={sizes}
      />

      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={lazy ? 'lazy' : 'eager'}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        onLoad={() => setIsLoaded(true)}
      />
    </picture>
  );
};

export default OptimizedImage;
