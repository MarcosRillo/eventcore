export interface OrganizerStats {
  total_events: number;
  upcoming_events: number;
  past_events: number;
  pending_internal: number;
  approved_internal: number;
  pending_public: number;
  published: number;
  requires_changes: number;
  rejected: number;
}

export interface StatCardData {
  label: string;
  value: number;
  color: 'blue' | 'yellow' | 'green' | 'orange' | 'red' | 'gray';
}
