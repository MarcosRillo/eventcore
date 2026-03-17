export interface EventDetailLocation {
  id: number;
  name: string;
  address?: string;
  city?: string;
}

export interface EventDetailData {
  id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  featured_image?: string;
  is_featured?: boolean;
  locations?: EventDetailLocation[];
  location_text?: string;
  virtual_link?: string;
  contact_email?: string;
  contact_phone?: string;
  website_url?: string;
  cta_text?: string;
  cta_link?: string;
  event_type?: { id: number; name: string; color?: string };
  event_subtype?: { id: number; name: string };
  organizer?: { name: string; organization?: string };
}

export interface EventDetailBodyProps {
  event: EventDetailData;
  headerActions?: React.ReactNode;
  footerActions?: React.ReactNode;
  descriptionMode?: 'html' | 'text';
  imagePriority?: boolean;
  className?: string;
}
