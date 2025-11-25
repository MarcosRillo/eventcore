'use client';

import { MessageCircle, Facebook, Twitter, Link2 } from 'lucide-react';
import { Event } from '@/types/event.types';
import { useState } from 'react';

interface ShareButtonsProps {
  event: Event;
}

export default function ShareButtons({ event }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const eventUrl = `${window.location.origin}/calendar/evento/${event.id}`;
  const eventText = `${event.title} - ${event.description?.substring(0, 100)}...`;

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`${event.title}\n\n${eventUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(eventUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(eventText);
    const url = encodeURIComponent(eventUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={handleWhatsAppShare}
        className="inline-flex items-center px-3 py-2 text-xs bg-green-600 text-white rounded hover:bg-green-700"
        title="Compartir en WhatsApp"
      >
        <MessageCircle className="w-4 h-4 mr-1" />
        WhatsApp
      </button>

      <button
        onClick={handleFacebookShare}
        className="inline-flex items-center px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
        title="Compartir en Facebook"
      >
        <Facebook className="w-4 h-4 mr-1" />
        Facebook
      </button>

      <button
        onClick={handleTwitterShare}
        className="inline-flex items-center px-3 py-2 text-xs bg-sky-500 text-white rounded hover:bg-sky-600"
        title="Compartir en Twitter"
      >
        <Twitter className="w-4 h-4 mr-1" />
        Twitter
      </button>

      <button
        onClick={handleCopyLink}
        className={`inline-flex items-center px-3 py-2 text-xs rounded transition-colors ${
          copied
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        title={copied ? 'Enlace copiado' : 'Copiar enlace'}
      >
        <Link2 className="w-4 h-4 mr-1" />
        {copied ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  );
}