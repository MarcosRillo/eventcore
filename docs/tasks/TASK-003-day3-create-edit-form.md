# TASK-003 DÍA 3: Formulario Crear/Editar Evento
## Panel Organizador - Event Form (Create/Edit)

**Fecha:** Octubre 7, 2025  
**Prioridad:** Alta (feature crítica del panel)  
**Tiempo estimado:** 2 horas  
**Dependencias:** TASK-003 Día 2 completada ✅

---

## 🎯 OBJETIVO

Implementar formulario completo para crear y editar eventos con:
- Todos los campos del evento
- Validaciones frontend y backend
- Manejo de errores con feedback visual
- Guardado con redirección a lista

---

## 📋 CAMPOS DEL FORMULARIO

### Obligatorios:
- **title** (string, max 255)
- **description** (text)
- **start_date** (date)
- **category_id** (foreign key)
- **location_id** (foreign key)

### Opcionales:
- **end_date** (date, debe ser >= start_date)
- **start_time** (time)
- **end_time** (time)
- **address** (string, max 500)
- **image_url** (string, URL válida)
- **registration_url** (string, URL válida)
- **contact_email** (email)
- **contact_phone** (string, max 20)
- **capacity** (integer, min 1)
- **price** (decimal, min 0)
- **is_free** (boolean, default false)

---

## 🔧 IMPLEMENTACIÓN BACKEND

### 1. Métodos en OrganizerController

**Archivo:** `backend/app/Features/Organizer/Controllers/OrganizerController.php`

#### Método: store (crear evento)

```php
/**
 * Create new event for organization
 * 
 * @bodyParam title string required Event title. Example: Festival de Jazz
 * @bodyParam description text required Event description
 * @bodyParam start_date date required Start date. Example: 2025-11-15
 * @bodyParam end_date date optional End date. Example: 2025-11-17
 * @bodyParam category_id int required Category ID
 * @bodyParam location_id int required Location ID
 * @bodyParam address string optional Physical address
 * @bodyParam start_time time optional Start time. Example: 19:00
 * @bodyParam end_time time optional End time. Example: 23:00
 * @bodyParam image_url string optional Image URL
 * @bodyParam registration_url string optional Registration URL
 * @bodyParam contact_email string optional Contact email
 * @bodyParam contact_phone string optional Contact phone
 * @bodyParam capacity int optional Max capacity
 * @bodyParam price decimal optional Price (0 if free)
 * @bodyParam is_free boolean optional Is free event. Default: false
 */
public function store(Request $request)
{
    $user = $request->user();
    
    if (!$user->organization_id) {
        Log::warning('User without organization tried to create event', [
            'user_id' => $user->id
        ]);
        return response()->json([
            'error' => 'User not associated with organization'
        ], 403);
    }
    
    // Validation
    $validated = $request->validate([
        'title' => 'required|string|max:255',
        'description' => 'required|string',
        'start_date' => 'required|date|after_or_equal:today',
        'end_date' => 'nullable|date|after_or_equal:start_date',
        'category_id' => 'required|exists:categories,id',
        'location_id' => 'required|exists:locations,id',
        'address' => 'nullable|string|max:500',
        'start_time' => 'nullable|date_format:H:i',
        'end_time' => 'nullable|date_format:H:i',
        'image_url' => 'nullable|url|max:500',
        'registration_url' => 'nullable|url|max:500',
        'contact_email' => 'nullable|email|max:255',
        'contact_phone' => 'nullable|string|max:20',
        'capacity' => 'nullable|integer|min:1',
        'price' => 'nullable|numeric|min:0',
        'is_free' => 'nullable|boolean'
    ]);
    
    try {
        DB::beginTransaction();
        
        // Get draft status
        $draftStatus = EventStatus::where('status_code', 'draft')->first();
        
        if (!$draftStatus) {
            throw new \Exception('Draft status not found in database');
        }
        
        // Create event
        $event = Event::create([
            'organization_id' => $user->organization_id,
            'status_id' => $draftStatus->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'] ?? null,
            'category_id' => $validated['category_id'],
            'location_id' => $validated['location_id'],
            'address' => $validated['address'] ?? null,
            'start_time' => $validated['start_time'] ?? null,
            'end_time' => $validated['end_time'] ?? null,
            'image_url' => $validated['image_url'] ?? null,
            'registration_url' => $validated['registration_url'] ?? null,
            'contact_email' => $validated['contact_email'] ?? null,
            'contact_phone' => $validated['contact_phone'] ?? null,
            'capacity' => $validated['capacity'] ?? null,
            'price' => $validated['price'] ?? null,
            'is_free' => $validated['is_free'] ?? false,
            'slug' => \Str::slug($validated['title']) . '-' . time()
        ]);
        
        DB::commit();
        
        Log::info('Event created by organizer', [
            'event_id' => $event->id,
            'organization_id' => $user->organization_id,
            'user_id' => $user->id,
            'title' => $event->title
        ]);
        
        return response()->json([
            'message' => 'Event created successfully',
            'event' => $event->load(['status', 'category', 'locations'])
        ], 201);
        
    } catch (\Exception $e) {
        DB::rollBack();
        
        Log::error('Error creating event', [
            'user_id' => $user->id,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'error' => 'Error creating event: ' . $e->getMessage()
        ], 500);
    }
}
```

#### Método: show (obtener evento para editar)

```php
/**
 * Get single event details for editing
 * 
 * @urlParam id int required Event ID
 */
public function show(Request $request, $id)
{
    $user = $request->user();
    
    if (!$user->organization_id) {
        return response()->json(['error' => 'User not associated with organization'], 403);
    }
    
    $event = Event::withoutGlobalScopes()
        ->with(['status', 'category', 'locations'])
        ->where('id', $id)
        ->where('organization_id', $user->organization_id)
        ->first();
    
    if (!$event) {
        Log::warning('Event not found or unauthorized access', [
            'event_id' => $id,
            'user_id' => $user->id,
            'organization_id' => $user->organization_id
        ]);
        return response()->json(['error' => 'Event not found'], 404);
    }
    
    Log::info('Event retrieved for editing', [
        'event_id' => $event->id,
        'user_id' => $user->id
    ]);
    
    return response()->json($event);
}
```

#### Método: update (actualizar evento)

```php
/**
 * Update existing event
 * 
 * @urlParam id int required Event ID
 * @bodyParam (same as store)
 */
public function update(Request $request, $id)
{
    $user = $request->user();
    
    if (!$user->organization_id) {
        return response()->json(['error' => 'User not associated with organization'], 403);
    }
    
    $event = Event::withoutGlobalScopes()
        ->where('id', $id)
        ->where('organization_id', $user->organization_id)
        ->first();
    
    if (!$event) {
        return response()->json(['error' => 'Event not found'], 404);
    }
    
    // Validation (same as store)
    $validated = $request->validate([
        'title' => 'required|string|max:255',
        'description' => 'required|string',
        'start_date' => 'required|date',
        'end_date' => 'nullable|date|after_or_equal:start_date',
        'category_id' => 'required|exists:categories,id',
        'location_id' => 'required|exists:locations,id',
        'address' => 'nullable|string|max:500',
        'start_time' => 'nullable|date_format:H:i',
        'end_time' => 'nullable|date_format:H:i',
        'image_url' => 'nullable|url|max:500',
        'registration_url' => 'nullable|url|max:500',
        'contact_email' => 'nullable|email|max:255',
        'contact_phone' => 'nullable|string|max:20',
        'capacity' => 'nullable|integer|min:1',
        'price' => 'nullable|numeric|min:0',
        'is_free' => 'nullable|boolean'
    ]);
    
    try {
        DB::beginTransaction();
        
        $event->update([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'] ?? null,
            'category_id' => $validated['category_id'],
            'location_id' => $validated['location_id'],
            'address' => $validated['address'] ?? null,
            'start_time' => $validated['start_time'] ?? null,
            'end_time' => $validated['end_time'] ?? null,
            'image_url' => $validated['image_url'] ?? null,
            'registration_url' => $validated['registration_url'] ?? null,
            'contact_email' => $validated['contact_email'] ?? null,
            'contact_phone' => $validated['contact_phone'] ?? null,
            'capacity' => $validated['capacity'] ?? null,
            'price' => $validated['price'] ?? null,
            'is_free' => $validated['is_free'] ?? false,
            'slug' => \Str::slug($validated['title']) . '-' . $event->id
        ]);
        
        DB::commit();
        
        Log::info('Event updated by organizer', [
            'event_id' => $event->id,
            'user_id' => $user->id,
            'changes' => array_keys($validated)
        ]);
        
        return response()->json([
            'message' => 'Event updated successfully',
            'event' => $event->fresh()->load(['status', 'category', 'locations'])
        ]);
        
    } catch (\Exception $e) {
        DB::rollBack();
        
        Log::error('Error updating event', [
            'event_id' => $event->id,
            'user_id' => $user->id,
            'error' => $e->getMessage()
        ]);
        
        return response()->json([
            'error' => 'Error updating event: ' . $e->getMessage()
        ], 500);
    }
}
```

### 2. Agregar Rutas

**Archivo:** `backend/routes/api.php`

**Dentro del grupo `organizer`:**

```php
Route::post('events', [OrganizerController::class, 'store']);
Route::get('events/{id}', [OrganizerController::class, 'show']);
Route::put('events/{id}', [OrganizerController::class, 'update']);
```

### 3. Verificar Model Event

**Archivo:** `backend/app/Models/Event.php`

**Asegurar que $fillable incluye todos los campos:**

```php
protected $fillable = [
    'organization_id',
    'status_id',
    'category_id',
    'location_id',
    'title',
    'slug',
    'description',
    'start_date',
    'end_date',
    'start_time',
    'end_time',
    'address',
    'image_url',
    'registration_url',
    'contact_email',
    'contact_phone',
    'capacity',
    'price',
    'is_free'
];
```

---

## 🎨 IMPLEMENTACIÓN FRONTEND

### 1. Actualizar organizerService

**Archivo:** `frontend/src/features/events/services/organizerService.ts`

**Agregar métodos:**

```typescript
export interface CreateEventDto {
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  category_id: number;
  location_id: number;
  address?: string;
  start_time?: string;
  end_time?: string;
  image_url?: string;
  registration_url?: string;
  contact_email?: string;
  contact_phone?: string;
  capacity?: number;
  price?: number;
  is_free?: boolean;
}

export const organizerService = {
  // ... métodos existentes
  
  /**
   * Create new event
   */
  async createEvent(data: CreateEventDto): Promise<Event> {
    const response = await apiClient.post<{ event: Event }>('/organizer/events', data);
    return response.data.event;
  },
  
  /**
   * Get event by ID for editing
   */
  async getEvent(id: number): Promise<Event> {
    const response = await apiClient.get<Event>(`/organizer/events/${id}`);
    return response.data;
  },
  
  /**
   * Update existing event
   */
  async updateEvent(id: number, data: CreateEventDto): Promise<Event> {
    const response = await apiClient.put<{ event: Event }>(`/organizer/events/${id}`, data);
    return response.data.event;
  }
};
```

### 2. Hook useEventForm

**Archivo:** `frontend/src/features/events/hooks/useEventForm.ts`

**Crear nuevo hook:**

```typescript
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { organizerService, CreateEventDto } from '../services/organizerService';
import type { Event } from '@/types';

interface UseEventFormProps {
  eventId?: number;
}

export const useEventForm = ({ eventId }: UseEventFormProps = {}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<Event | null>(null);

  const isEditMode = !!eventId;

  // Load event if editing
  useEffect(() => {
    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await organizerService.getEvent(eventId!);
      setEvent(data);
    } catch (err) {
      console.error('Error loading event:', err);
      setError('Error al cargar evento');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: CreateEventDto) => {
    try {
      setSaving(true);
      setError(null);

      if (isEditMode) {
        await organizerService.updateEvent(eventId!, data);
      } else {
        await organizerService.createEvent(data);
      }

      // Redirect to events list
      router.push('/organizer/events');
    } catch (err: any) {
      console.error('Error saving event:', err);
      
      // Extract validation errors if present
      if (err.response?.data?.errors) {
        const validationErrors = Object.values(err.response.data.errors).flat().join(', ');
        setError(validationErrors);
      } else {
        setError(err.response?.data?.error || 'Error al guardar evento');
      }
    } finally {
      setSaving(false);
    }
  };

  return {
    event,
    loading,
    saving,
    error,
    isEditMode,
    handleSubmit
  };
};
```

### 3. Componente EventForm (formulario reutilizable)

**Archivo:** `frontend/src/features/events/components/dumb/EventForm.tsx`

**Crear componente:**

```typescript
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { CreateEventDto } from '../../services/organizerService';
import type { Event, Category, Location } from '@/types';

interface EventFormProps {
  event?: Event | null;
  categories: Category[];
  locations: Location[];
  onSubmit: (data: CreateEventDto) => void;
  saving: boolean;
  error?: string | null;
}

export const EventForm = ({
  event,
  categories,
  locations,
  onSubmit,
  saving,
  error
}: EventFormProps) => {
  const [formData, setFormData] = useState<CreateEventDto>({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    category_id: 0,
    location_id: 0,
    address: '',
    start_time: '',
    end_time: '',
    image_url: '',
    registration_url: '',
    contact_email: '',
    contact_phone: '',
    capacity: undefined,
    price: undefined,
    is_free: false
  });

  // Load event data if editing
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        start_date: event.start_date || '',
        end_date: event.end_date || '',
        category_id: event.category_id || 0,
        location_id: event.location_id || 0,
        address: event.address || '',
        start_time: event.start_time || '',
        end_time: event.end_time || '',
        image_url: event.image_url || '',
        registration_url: event.registration_url || '',
        contact_email: event.contact_email || '',
        contact_phone: event.contact_phone || '',
        capacity: event.capacity || undefined,
        price: event.price || undefined,
        is_free: event.is_free || false
      });
    }
  }, [event]);

  const handleChange = (field: keyof CreateEventDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clean empty strings to undefined
    const cleanData = Object.entries(formData).reduce((acc, [key, value]) => {
      acc[key] = value === '' ? undefined : value;
      return acc;
    }, {} as any);
    
    onSubmit(cleanData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Información Básica</h2>
        
        <Input
          label="Título del Evento *"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          required
          maxLength={255}
          placeholder="Ej: Festival de Jazz 2025"
        />

        <Textarea
          label="Descripción *"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          required
          rows={5}
          placeholder="Describe el evento..."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Categoría *"
            value={formData.category_id.toString()}
            onChange={(e) => handleChange('category_id', Number(e.target.value))}
            required
            options={[
              { value: '0', label: 'Seleccionar categoría' },
              ...categories.map(cat => ({ value: cat.id.toString(), label: cat.name }))
            ]}
          />

          <Select
            label="Ubicación *"
            value={formData.location_id.toString()}
            onChange={(e) => handleChange('location_id', Number(e.target.value))}
            required
            options={[
              { value: '0', label: 'Seleccionar ubicación' },
              ...locations.map(loc => ({ value: loc.id.toString(), label: loc.name }))
            ]}
          />
        </div>

        <Input
          label="Dirección Específica"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          maxLength={500}
          placeholder="Ej: Av. Independencia 500"
        />
      </div>

      {/* Date & Time */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Fecha y Hora</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="date"
            label="Fecha de Inicio *"
            value={formData.start_date}
            onChange={(e) => handleChange('start_date', e.target.value)}
            required
          />

          <Input
            type="date"
            label="Fecha de Fin"
            value={formData.end_date}
            onChange={(e) => handleChange('end_date', e.target.value)}
            min={formData.start_date}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="time"
            label="Hora de Inicio"
            value={formData.start_time}
            onChange={(e) => handleChange('start_time', e.target.value)}
          />

          <Input
            type="time"
            label="Hora de Fin"
            value={formData.end_time}
            onChange={(e) => handleChange('end_time', e.target.value)}
          />
        </div>
      </div>

      {/* Contact & Registration */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Contacto e Inscripción</h2>

        <Input
          type="url"
          label="URL de Inscripción"
          value={formData.registration_url}
          onChange={(e) => handleChange('registration_url', e.target.value)}
          placeholder="https://..."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="email"
            label="Email de Contacto"
            value={formData.contact_email}
            onChange={(e) => handleChange('contact_email', e.target.value)}
            placeholder="contacto@ejemplo.com"
          />

          <Input
            type="tel"
            label="Teléfono de Contacto"
            value={formData.contact_phone}
            onChange={(e) => handleChange('contact_phone', e.target.value)}
            maxLength={20}
            placeholder="+54 381 123-4567"
          />
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Información Adicional</h2>

        <Input
          type="url"
          label="URL de Imagen"
          value={formData.image_url}
          onChange={(e) => handleChange('image_url', e.target.value)}
          placeholder="https://..."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="number"
            label="Capacidad"
            value={formData.capacity?.toString() || ''}
            onChange={(e) => handleChange('capacity', e.target.value ? Number(e.target.value) : undefined)}
            min={1}
            placeholder="100"
          />

          <Input
            type="number"
            label="Precio (ARS)"
            value={formData.price?.toString() || ''}
            onChange={(e) => handleChange('price', e.target.value ? Number(e.target.value) : undefined)}
            min={0}
            step="0.01"
            placeholder="0.00"
            disabled={formData.is_free}
          />

          <div className="flex items-end pb-2">
            <Checkbox
              label="Evento Gratuito"
              checked={formData.is_free || false}
              onChange={(e) => {
                handleChange('is_free', e.target.checked);
                if (e.target.checked) {
                  handleChange('price', 0);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={saving}
        >
          {saving ? 'Guardando...' : event ? 'Actualizar Evento' : 'Crear Evento'}
        </Button>
      </div>
    </form>
  );
};
```

### 4. Página Create Event

**Archivo:** `frontend/src/app/(organizer)/organizer/events/create/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { EventForm } from '@/features/events/components/dumb/EventForm';
import { useEventForm } from '@/features/events/hooks/useEventForm';
import { categoryService } from '@/features/categories/services/categoryService';
import { locationService } from '@/features/locations/services/locationService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Category, Location } from '@/types';

export default function CreateEventPage() {
  const { handleSubmit, saving, error } = useEventForm();
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      const [categoriesData, locationsData] = await Promise.all([
        categoryService.getActive(),
        locationService.getActive()
      ]);
      setCategories(categoriesData);
      setLocations(locationsData);
    } catch (err) {
      console.error('Error loading form data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Evento</h1>
        <p className="text-gray-600 mt-1">
          Completa los datos del evento. Los campos marcados con * son obligatorios.
        </p>
      </div>

      <EventForm
        categories={categories}
        locations={locations}
        onSubmit={handleSubmit}
        saving={saving}
        error={error}
      />
    </div>
  );
}
```

### 5. Página Edit Event

**Archivo:** `frontend/src/app/(organizer)/organizer/events/[id]/edit/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { EventForm } from '@/features/events/components/dumb/EventForm';
import { useEventForm } from '@/features/events/hooks/useEventForm';
import { categoryService } from '@/features/categories/services/categoryService';
import { locationService } from '@/features/locations/services/locationService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Category, Location } from '@/types';

export default function EditEventPage() {
  const params = useParams();
  const eventId = Number(params.id);
  
  const { event, loading, handleSubmit, saving, error } = useEventForm({ eventId });
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      const [categoriesData, locationsData] = await Promise.all([
        categoryService.getActive(),
        locationService.getActive()
      ]);
      setCategories(categoriesData);
      setLocations(locationsData);
    } catch (err) {
      console.error('Error loading form data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Evento no encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar Evento</h1>
        <p className="text-gray-600 mt-1">
          Modifica los datos del evento "{event.title}"
        </p>
      </div>

      <EventForm
        event={event}
        categories={categories}
        locations={locations}
        onSubmit={handleSubmit}
        saving={saving}
        error={error}
      />
    </div>
  );
}
```

---

## 🧪 TESTING

### Test 1: Backend - Create Event

```bash
# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria.rodriguez@sheraton.com","password":"password"}'

# Create event
curl -X POST http://localhost:8000/api/v1/organizer/events \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Event",
    "description": "Test Description",
    "start_date": "2025-12-01",
    "category_id": 1,
    "location_id": 1
  }'

# Verificar:
# ✅ Status 201
# ✅ Evento creado con status "draft"
# ✅ organization_id correcto
```

### Test 2: Backend - Get Event

```bash
# Get event by ID
curl -X GET http://localhost:8000/api/v1/organizer/events/1 \
  -H "Authorization: Bearer {TOKEN}"

# Verificar:
# ✅ Status 200
# ✅ Datos del evento completos
```

### Test 3: Backend - Update Event

```bash
# Update event
curl -X PUT http://localhost:8000/api/v1/organizer/events/1 \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "description": "Updated Description",
    "start_date": "2025-12-01",
    "category_id": 1,
    "location_id": 1
  }'

# Verificar:
# ✅ Status 200
# ✅ Evento actualizado
```

### Test 4: Frontend - Create Event

```bash
cd frontend
npm run dev
```

**En browser:**

1. **Login como organizador**
   - maria.rodriguez@sheraton.com

2. **Navegar a crear**
   - http://localhost:3000/organizer/events/create
   - ✅ Formulario carga
   - ✅ Categorías y ubicaciones cargan en dropdowns

3. **Llenar formulario mínimo**
   - Título: "Evento de Prueba"
   - Descripción: "Descripción de prueba"
   - Fecha inicio: Cualquier fecha futura
   - Categoría: Seleccionar cualquiera
   - Ubicación: Seleccionar cualquiera

4. **Guardar**
   - Click "Crear Evento"
   - ✅ Muestra "Guardando..."
   - ✅ Redirige a /organizer/events
   - ✅ Nuevo evento aparece en la lista

### Test 5: Frontend - Edit Event

1. **Desde la lista**
   - Click en ícono lápiz de cualquier evento
   - ✅ Navega a /organizer/events/[id]/edit

2. **Verificar carga**
   - ✅ Formulario carga con datos del evento
   - ✅ Todos los campos poblados correctamente

3. **Modificar y guardar**
   - Cambiar título
   - Click "Actualizar Evento"
   - ✅ Guarda cambios
   - ✅ Redirige a lista
   - ✅ Cambios reflejados en tabla

### Test 6: Validaciones

1. **Intentar crear sin campos obligatorios**
   - ✅ Muestra mensajes de error
   
2. **Fecha de fin antes de inicio**
   - ✅ Backend rechaza con error

3. **URL inválida**
   - ✅ Backend rechaza con error

### Test 7: TypeScript & Build

```bash
cd frontend
npx tsc --noEmit
# ✅ 0 errores

npm run build
# ✅ Build exitoso
```

---

## ✅ CRITERIOS DE ÉXITO

### Backend:
- [ ] Método store() funciona y crea eventos
- [ ] Método show() retorna evento para editar
- [ ] Método update() actualiza eventos
- [ ] Validaciones funcionan correctamente
- [ ] Solo se crean/editan eventos de la organización del usuario
- [ ] Transacciones DB implementadas
- [ ] Logs completos en cada operación
- [ ] Eventos se crean con status "draft"
- [ ] Slug generado automáticamente

### Frontend:
- [ ] Página /organizer/events/create funciona
- [ ] Página /organizer/events/[id]/edit funciona
- [ ] Componente EventForm es reutilizable
- [ ] Todos los campos del formulario presentes
- [ ] Campos obligatorios marcados con *
- [ ] Validaciones frontend (HTML5)
- [ ] Loading states funcionan
- [ ] Error handling con mensajes claros
- [ ] Redirección a lista después de guardar
- [ ] TypeScript: 0 errores
- [ ] Build: exitoso

---

## 📦 COMMIT STRATEGY

### Backend:

```bash
git add backend/app/Features/Organizer/Controllers/OrganizerController.php
git add backend/routes/api.php
git add backend/app/Models/Event.php
git commit -m "feat(backend): add organizer event create/edit endpoints

- Add store() method for creating events
- Add show() method for getting event details
- Add update() method for updating events
- Validate all fields with Laravel validation
- Create events with 'draft' status by default
- Generate slug automatically
- Validate organization_id ownership
- DB transactions for data integrity
- Comprehensive logging

Validation rules:
- Required: title, description, start_date, category_id, location_id
- Optional: All other fields with proper validation
- Date validation: end_date >= start_date
- URL validation: image_url, registration_url
- Email validation: contact_email

Part of: TASK-003 Day 3 - Event Form
Time: ~45min backend
Endpoints: POST /organizer/events, GET /organizer/events/{id}, PUT /organizer/events/{id}"
```

### Frontend:

```bash
git add frontend/src/features/events/services/organizerService.ts
git add frontend/src/features/events/hooks/useEventForm.ts
git add frontend/src/features/events/components/dumb/EventForm.tsx
git add "frontend/src/app/(organizer)/organizer/events/create/page.tsx"
git add "frontend/src/app/(organizer)/organizer/events/[id]/edit/page.tsx"
git commit -m "feat(frontend): implement event create/edit forms

New Features:
- EventForm reusable component (15+ fields)
- Create event page at /organizer/events/create
- Edit event page at /organizer/events/[id]/edit
- useEventForm hook for form logic
- organizerService methods (createEvent, getEvent, updateEvent)

Form Sections:
- Basic Information (title, description, category, location)
- Date & Time (start/end dates and times)
- Contact & Registration (urls, email, phone)
- Additional Info (image, capacity, price, is_free)

Features:
- All 15+ event fields supported
- Required field validation
- Loading states while fetching data
- Error handling with user feedback
- Auto-redirect to list after save
- Edit mode pre-populates all fields
- Checkbox 'is_free' disables price input

UX:
- Organized in 4 collapsible sections
- Clear labels and placeholders
- Responsive grid layout
- Save/Cancel buttons
- Professional styling

Tests:
✅ TypeScript: 0 errors
✅ Build: successful
✅ Create flow works end-to-end
✅ Edit flow works end-to-end

Part of: TASK-003 Day 3 - Event Form
Time: ~1.5h frontend
Lines: ~500+ new code"
```

---

## ⏰ TIMELINE ESTIMADO

**Backend:** 45 min
- 20 min: store() y update()
- 15 min: show() y validaciones
- 10 min: Testing curl

**Frontend:** 1h 15min
- 15 min: organizerService methods
- 15 min: useEventForm hook
- 30 min: EventForm component
- 10 min: Create page
- 5 min: Edit page
- 10 min: Testing browser

**Total:** 2 horas

---

**TASK-003 DÍA 3 COMPLETADA = Organizador puede crear y editar eventos completos**