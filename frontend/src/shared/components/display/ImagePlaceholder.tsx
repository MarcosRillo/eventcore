/**
 * ImagePlaceholder Component
 * Reusable gradient + calendar icon placeholder for missing event images
 */

interface ImagePlaceholderProps {
  className?: string;
}

export default function ImagePlaceholder({ className = '' }: ImagePlaceholderProps) {
  return (
    <div
      className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 ${className}`}
      data-testid="event-image-placeholder"
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
