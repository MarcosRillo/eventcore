# API Documentation

> RESTful API for Plataforma de Eventos Turísticos

**Base URL:** `http://localhost:8000/api/v1/`
**Version:** 1.0
**Last Updated:** October 29, 2025

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Events](#events)
3. [Categories](#categories)
4. [Locations](#locations)
5. [Approval Workflow](#approval-workflow)
6. [Dashboard](#dashboard)
7. [Organizer](#organizer)
8. [Public API](#public-api)
9. [Appearance](#appearance)

---

## 🔐 Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer {your-token}
```

### Register

Create a new user account.

**Endpoint:** `POST /api/v1/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "password_confirmation": "securepassword123"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "1|abc123xyz..."
}
```

### Login

Authenticate and receive access token.

**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "organizer_admin"
  },
  "token": "1|abc123xyz..."
}
```

### Get Current User

Get authenticated user information.

**Endpoint:** `GET /api/v1/auth/me`
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "organizer_admin",
  "created_at": "2025-10-29T00:00:00.000000Z"
}
```

### Logout

Revoke current access token.

**Endpoint:** `POST /api/v1/auth/logout`
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "message": "Successfully logged out"
}
```

---

## 📅 Events

CRUD operations for events (entity staff and admins).

### List Events

Get paginated list of events.

**Endpoint:** `GET /api/v1/events`
**Auth Required:** Yes

**Query Parameters:**
- `page` (integer): Page number
- `per_page` (integer): Items per page
- `status` (string): Filter by status
- `category_id` (integer): Filter by category
- `search` (string): Search in title

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "title": "Festival de Música",
      "description": "Gran evento musical",
      "status": "approved_internal",
      "category_id": 1,
      "location_id": 1,
      "start_date": "2025-11-15",
      "end_date": "2025-11-17",
      "created_at": "2025-10-29T00:00:00.000000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "total": 50
  }
}
```

### Get Event

Get single event details.

**Endpoint:** `GET /api/v1/events/{id}`
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "Festival de Música",
  "description": "Gran evento musical",
  "status": "approved_internal",
  "category": {
    "id": 1,
    "name": "Música"
  },
  "location": {
    "id": 1,
    "name": "Teatro San Martín"
  },
  "start_date": "2025-11-15",
  "end_date": "2025-11-17"
}
```

### Create Event

Create a new event (draft status).

**Endpoint:** `POST /api/v1/events`
**Auth Required:** Yes

**Request Body:**
```json
{
  "title": "New Event",
  "description": "Event description",
  "category_id": 1,
  "location_id": 1,
  "start_date": "2025-11-15",
  "end_date": "2025-11-17",
  "start_time": "18:00:00",
  "end_time": "22:00:00"
}
```

**Response:** `201 Created`
```json
{
  "id": 2,
  "title": "New Event",
  "status": "draft",
  ...
}
```

### Update Event

Update an existing event.

**Endpoint:** `PUT /api/v1/events/{id}`
**Auth Required:** Yes

**Request Body:** Same as Create Event

**Response:** `200 OK`

### Delete Event

Delete an event (soft delete).

**Endpoint:** `DELETE /api/v1/events/{id}`
**Auth Required:** Yes

**Response:** `204 No Content`

### Duplicate Event

Create a copy of an existing event.

**Endpoint:** `POST /api/v1/events/{id}/duplicate`
**Auth Required:** Yes

**Response:** `201 Created`

### Event Statistics

Get event statistics.

**Endpoint:** `GET /api/v1/events/statistics`
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "total": 150,
  "draft": 25,
  "pending_internal": 30,
  "approved_internal": 40,
  "published": 55
}
```

---

## 🏷️ Categories

Manage event categories.

### List Categories

Get all categories.

**Endpoint:** `GET /api/v1/categories`
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "name": "Música",
      "description": "Eventos musicales",
      "is_active": true
    }
  ]
}
```

### Get Active Categories

Get only active categories.

**Endpoint:** `GET /api/v1/categories/active`
**Auth Required:** No

**Response:** `200 OK`

### Get Category

Get single category.

**Endpoint:** `GET /api/v1/categories/{id}`
**Auth Required:** Yes

**Response:** `200 OK`

### Create Category

**Endpoint:** `POST /api/v1/categories`
**Auth Required:** Yes (Admin only)

**Request Body:**
```json
{
  "name": "Nueva Categoría",
  "description": "Descripción",
  "is_active": true
}
```

**Response:** `201 Created`

### Update Category

**Endpoint:** `PUT /api/v1/categories/{id}`
**Auth Required:** Yes (Admin only)

**Response:** `200 OK`

### Delete Category

**Endpoint:** `DELETE /api/v1/categories/{id}`
**Auth Required:** Yes (Admin only)

**Response:** `204 No Content`

---

## 📍 Locations

Manage event locations.

### List Locations

**Endpoint:** `GET /api/v1/locations`
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "name": "Teatro San Martín",
      "address": "Av. Corrientes 1530",
      "city": "San Miguel de Tucumán",
      "capacity": 500,
      "is_active": true
    }
  ]
}
```

### Get Active Locations

**Endpoint:** `GET /api/v1/locations/active`
**Auth Required:** No

**Response:** `200 OK`

### Get Location

**Endpoint:** `GET /api/v1/locations/{id}`
**Auth Required:** Yes

**Response:** `200 OK`

### Create Location

**Endpoint:** `POST /api/v1/locations`
**Auth Required:** Yes (Admin only)

**Request Body:**
```json
{
  "name": "Nuevo Lugar",
  "address": "Dirección completa",
  "city": "Tucumán",
  "capacity": 300
}
```

**Response:** `201 Created`

### Update Location

**Endpoint:** `PUT /api/v1/locations/{id}`
**Auth Required:** Yes (Admin only)

**Response:** `200 OK`

### Delete Location

**Endpoint:** `DELETE /api/v1/locations/{id}`
**Auth Required:** Yes (Admin only)

**Response:** `204 No Content`

---

## ✅ Approval Workflow

Event approval operations (Entity Admin only).

### Approve Event

Approve event for internal publication.

**Endpoint:** `PATCH /api/v1/events/{id}/approve`
**Auth Required:** Yes (Entity Admin)

**Response:** `200 OK`
```json
{
  "id": 1,
  "status": "approved_internal",
  "approved_at": "2025-10-29T12:00:00.000000Z",
  "approved_by": 2
}
```

### Reject Event

Reject event submission.

**Endpoint:** `PATCH /api/v1/events/{id}/reject`
**Auth Required:** Yes (Entity Admin)

**Request Body:**
```json
{
  "reason": "Incomplete information"
}
```

**Response:** `200 OK`

### Request Changes

Request modifications to event.

**Endpoint:** `PATCH /api/v1/events/{id}/request-changes`
**Auth Required:** Yes (Entity Admin)

**Request Body:**
```json
{
  "comments": "Please add more details about the event"
}
```

**Response:** `200 OK`

### Request Public Visibility

Request event to be published publicly.

**Endpoint:** `PATCH /api/v1/events/{id}/request-public`
**Auth Required:** Yes (Organizer)

**Response:** `200 OK`

### Publish Event

Publish event to public calendar.

**Endpoint:** `PATCH /api/v1/events/{id}/publish`
**Auth Required:** Yes (Entity Admin)

**Response:** `200 OK`
```json
{
  "id": 1,
  "status": "published",
  "published_at": "2025-10-29T12:00:00.000000Z"
}
```

### Toggle Featured

Mark event as featured/unfeatured.

**Endpoint:** `PATCH /api/v1/events/{id}/toggle-featured`
**Auth Required:** Yes (Entity Admin)

**Response:** `200 OK`

### Approval Statistics

Get approval workflow statistics.

**Endpoint:** `GET /api/v1/events/approval/statistics`
**Auth Required:** Yes (Entity Admin)

**Response:** `200 OK`
```json
{
  "pending_internal": 15,
  "approved_internal": 25,
  "requires_changes": 5,
  "rejected": 3,
  "pending_public": 10,
  "published": 40
}
```

---

## 📊 Dashboard

Dashboard statistics for entity admins.

### Dashboard Events

Get events for dashboard view.

**Endpoint:** `GET /api/v1/dashboard/events`
**Auth Required:** Yes (Entity Admin)

**Query Parameters:**
- `status` (string): Filter by status
- `page` (integer): Page number

**Response:** `200 OK`

### Events Summary

Get summary of events by status.

**Endpoint:** `GET /api/v1/dashboard/events/summary`
**Auth Required:** Yes (Entity Admin)

**Response:** `200 OK`
```json
{
  "pending": 15,
  "approved": 25,
  "published": 40,
  "total": 80
}
```

---

## 👤 Organizer

Endpoints for event organizers.

### Organizer Stats

Get organizer's event statistics.

**Endpoint:** `GET /api/v1/organizer/stats`
**Auth Required:** Yes (Organizer)

**Response:** `200 OK`
```json
{
  "total_events": 25,
  "pending_internal": 5,
  "approved_internal": 8,
  "published": 10,
  "requires_changes": 2
}
```

### Dashboard Stats

More detailed stats for organizer dashboard.

**Endpoint:** `GET /api/v1/organizer/dashboard/stats`
**Auth Required:** Yes (Organizer)

**Response:** `200 OK`
```json
{
  "total": 25,
  "draft": 3,
  "pending_internal": 5,
  "approved_internal": 8,
  "pending_public": 4,
  "published": 10,
  "requires_changes": 2,
  "rejected": 1
}
```

### List Organizer Events

Get organizer's own events.

**Endpoint:** `GET /api/v1/organizer/events`
**Auth Required:** Yes (Organizer)

**Query Parameters:**
- `status` (string): Filter by status
- `page` (integer): Page number

**Response:** `200 OK`

### Get Organizer Event

**Endpoint:** `GET /api/v1/organizer/events/{id}`
**Auth Required:** Yes (Organizer)

**Response:** `200 OK`

### Create Organizer Event

**Endpoint:** `POST /api/v1/organizer/events`
**Auth Required:** Yes (Organizer)

**Request Body:** Same as general Create Event

**Response:** `201 Created`

### Update Organizer Event

**Endpoint:** `PUT /api/v1/organizer/events/{id}`
**Auth Required:** Yes (Organizer)

**Response:** `200 OK`

### Delete Organizer Event

**Endpoint:** `DELETE /api/v1/organizer/events/{id}`
**Auth Required:** Yes (Organizer)

**Response:** `204 No Content`

---

## 🌐 Public API

Public endpoints (no authentication required).

### List Public Events

Get published events for public calendar.

**Endpoint:** `GET /api/v1/public/events`
**Auth Required:** No

**Query Parameters:**
- `page` (integer): Page number
- `category_id` (integer): Filter by category
- `start_date` (date): Filter from date
- `end_date` (date): Filter to date

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "title": "Festival de Música",
      "description": "Gran evento musical",
      "category": {
        "id": 1,
        "name": "Música"
      },
      "location": {
        "id": 1,
        "name": "Teatro San Martín"
      },
      "start_date": "2025-11-15",
      "end_date": "2025-11-17",
      "is_featured": true
    }
  ]
}
```

### Get Public Event

**Endpoint:** `GET /api/v1/public/events/{id}`
**Auth Required:** No

**Response:** `200 OK`

### Upcoming Events

Get upcoming published events.

**Endpoint:** `GET /api/v1/public/events/upcoming`
**Auth Required:** No

**Query Parameters:**
- `limit` (integer, default: 10): Number of events

**Response:** `200 OK`

### Featured Events

Get featured events.

**Endpoint:** `GET /api/v1/public/events/featured`
**Auth Required:** No

**Response:** `200 OK`

### Search Events

Search published events by keyword.

**Endpoint:** `GET /api/v1/public/events/search`
**Auth Required:** No

**Query Parameters:**
- `q` (string, required): Search query
- `page` (integer): Page number

**Response:** `200 OK`

### Events by Category

Get events for a specific category.

**Endpoint:** `GET /api/v1/public/events/category/{categoryId}`
**Auth Required:** No

**Response:** `200 OK`

### Events by Date Range

Get events within a date range.

**Endpoint:** `GET /api/v1/public/events/date-range`
**Auth Required:** No

**Query Parameters:**
- `start_date` (date, required): Start date (Y-m-d)
- `end_date` (date, required): End date (Y-m-d)

**Response:** `200 OK`

### Calendar Events

Get events for a specific month.

**Endpoint:** `GET /api/v1/public/events/calendar/{year}/{month}`
**Auth Required:** No

**Path Parameters:**
- `year` (integer): Year (e.g., 2025)
- `month` (integer): Month (1-12)

**Response:** `200 OK`

### Public Categories

**Endpoint:** `GET /api/v1/public/categories`
**Auth Required:** No

**Response:** `200 OK`

### Public Active Categories

**Endpoint:** `GET /api/v1/public/categories/active`
**Auth Required:** No

**Response:** `200 OK`

### Public Active Locations

**Endpoint:** `GET /api/v1/public/locations/active`
**Auth Required:** No

**Response:** `200 OK`

---

## 🎨 Appearance

Manage platform appearance settings (Admin only).

### List Appearance Settings

**Endpoint:** `GET /api/v1/admin/appearance`
**Auth Required:** Yes (Admin)

**Response:** `200 OK`

### Get Appearance Setting

**Endpoint:** `GET /api/v1/admin/appearance/{id}`
**Auth Required:** Yes (Admin)

**Response:** `200 OK`

### Create Appearance Setting

**Endpoint:** `POST /api/v1/admin/appearance`
**Auth Required:** Yes (Admin)

**Response:** `201 Created`

### Update Appearance Setting

**Endpoint:** `PUT /api/v1/admin/appearance/{id}`
**Auth Required:** Yes (Admin)

**Response:** `200 OK`

### Delete Appearance Setting

**Endpoint:** `DELETE /api/v1/admin/appearance/{id}`
**Auth Required:** Yes (Admin)

**Response:** `204 No Content`

---

## 📖 Swagger Documentation

Interactive API documentation available at:

**URL:** `http://localhost:8000/api/documentation`

---

## 🔒 Authorization Roles

- **platform_admin**: Full platform access
- **entity_admin**: Entity administration, event approval
- **entity_staff**: Create/manage own entity events
- **organizer_admin**: Create/manage own events

---

## 🚨 Error Responses

### 400 Bad Request
```json
{
  "message": "Validation error",
  "errors": {
    "title": ["The title field is required."]
  }
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthenticated"
}
```

### 403 Forbidden
```json
{
  "message": "This action is unauthorized."
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Server Error"
}
```

---

## 📊 Summary

**Total Endpoints:** 61
- Authentication: 4
- Events: 14
- Categories: 7
- Locations: 7
- Approval: 6
- Dashboard: 2
- Organizer: 7
- Public API: 11
- Appearance: 5

---

**Last Updated:** October 29, 2025
**Version:** 1.0
**Maintainer:** Marcos Rillo Cabanne
