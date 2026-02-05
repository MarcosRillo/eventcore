export const adminKeys = {
  stats: (showPast?: boolean) => showPast ? '/events/approval/statistics?show_past=1' : '/events/approval/statistics',
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
  list: (params: string) => `/events?${params}`,
  statistics: '/events/statistics',
  approvalStats: '/events/approval/statistics',
}

export const locationKeys = {
  active: '/locations/active',
  list: (params: string) => `/locations?${params}`,
}

export const publicEventKeys = {
  list: (params: string) => `/public/events?${params}`,
  types: '/public/event-types',
  subtypes: (typeId: number) => `/public/event-types/${typeId}/subtypes`,
  locations: '/public/locations/active',
}

export const internalCalendarKeys = {
  events: (params: string) => `/internal-calendar/events?${params}`,
}

export const eventTypeKeys = {
  list: (params: string) => `/event-types?${params}`,
  subtypesList: (typeId: number, params: string) => `/event-types/${typeId}/subtypes?${params}`,
}

export const organizerEventKeys = {
  list: (params: string) => `/organizer/events?${params}`,
}

export const organizationKeys = {
  list: (params: string) => `/organizations?${params}`,
  detail: (id: number) => `/organizations/${id}`,
}

export const userKeys = {
  list: (params: string) => `/users?${params}`,
  detail: (id: number) => `/users/${id}`,
}

export const registrationRequestKeys = {
  list: (params: string) => `/registration-requests?${params}`,
  detail: (id: number) => `/registration-requests/${id}`,
}

export const invitationKeys = {
  list: '/invitations',
  roles: '/roles/assignable',
}
