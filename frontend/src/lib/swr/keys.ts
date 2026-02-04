export const adminKeys = {
  stats: '/events/approval/statistics',
}

export const organizerKeys = {
  stats: '/organizer/stats',
}

export const dashboardKeys = {
  summary: '/dashboard/events/summary',
  events: (params: string) => `/dashboard/events?${params}`,
}

export const eventKeys = {
  detail: (id: number) => `/events/${id}/detail`,
  organizerDetail: (id: number) => `/organizer/events/${id}`,
  types: { active: '/event-types/active' },
  subtypes: { active: (typeId: number) => `/event-types/${typeId}/subtypes/active` },
}

export const locationKeys = {
  active: '/locations/active',
}
