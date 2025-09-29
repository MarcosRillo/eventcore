/**
 * EVENT SERVICE USAGE EXAMPLES
 * Examples showing how to use the new specialized event services
 */

'use client';

import { useState } from 'react';
import { useEventManager } from '@/features/events/hooks/useEventManager';
import {
  getEventServiceForContext
} from '@/features/events/services/event.service';
import { eventPublicExportService } from '@/features/events/services/eventPublicService';
import { apiClient } from '@/lib/api';
import { usePermissions } from '@/hooks/usePermissions';
import { Event, EventStatistics, EventTemplate } from '@/types/event.types';

// Context types for event service examples
type ServiceContext = 'admin' | 'public' | 'organizer';



// Example 1: Basic usage with auto-detection
export const AutoDetectedEventManager = () => {
  // useEventManager automatically detects the appropriate service based on user role
  const {
    events,
    isLoading,
    // Example functions available but not used in demo
    // createEvent,
    // updateEvent,
    // deleteEvent,
    // canManageEvents
  } = useEventManager(); // Auto-detects context

  return (
    <div>
      <h2>Auto-Detected Event Manager</h2>
      <p>Automatically uses the right service for your role</p>
      
      {isLoading ? (
        <p>Loading events...</p>
      ) : (
        <div>
          <p>Found {events.length} events</p>
          {/* canManageEvents check removed for demo */}
          <button onClick={() => console.log('Example create events')}>
            Create Event (Demo)
          </button>
        </div>
      )}
    </div>
  );
};

// Example 2: Explicitly setting context
export const ExplicitContextEventManager = () => {
  const [context, setContext] = useState<'admin' | 'public' | 'organizer'>('admin');
  
  // Explicitly specify which service to use
  const adminEvents = useEventManager({ context: 'admin' });
  const publicEvents = useEventManager({ context: 'public' });
  const organizerEvents = useEventManager({ context: 'organizer' });

  const currentManager = context === 'admin' ? adminEvents :
                         context === 'public' ? publicEvents :
                         organizerEvents;

  return (
    <div>
      <h2>Explicit Context Event Manager</h2>
      
      <div className="mb-4">
        <label>Choose Context: </label>
        <select
          value={context}
          onChange={(e) => setContext(e.target.value as ServiceContext)}
        >
          <option value="admin">Admin</option>
          <option value="public">Public</option>
          <option value="organizer">Organizer</option>
        </select>
      </div>

      <div>
        <h3>Events from {context} service:</h3>
        <p>Loading: {currentManager.isLoading.toString()}</p>
        <p>Count: {currentManager.events.length}</p>
      </div>
    </div>
  );
};

// Example 3: Direct service usage
export const DirectServiceUsage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAdmin, isOrganizer } = usePermissions();

  const loadAdminEvents = async () => {
    setLoading(true);
    try {
      const service = getEventServiceForContext('admin');
      const result = await service.getEvents({ per_page: 10 });
      setEvents(result.data);
    } catch (error) {
      console.error('Error loading admin events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPublicEvents = async () => {
    setLoading(true);
    try {
      const result = await apiClient.get<{events: Event[]}>('/public/events?featured_only=true&upcoming_only=true');
      setEvents(result.events);
    } catch (error) {
      console.error('Error loading public events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizerEvents = async () => {
    setLoading(true);
    try {
      const result = await apiClient.get<{events: Event[]}>('/organizer/events?draft_only=true');
      setEvents(result.events);
    } catch (error) {
      console.error('Error loading organizer events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Direct Service Usage</h2>
      
      <div className="space-x-2 mb-4">
        {isAdmin() && (
          <button 
            onClick={loadAdminEvents}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Load Admin Events
          </button>
        )}
        
        <button 
          onClick={loadPublicEvents}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Load Public Events
        </button>
        
        {isOrganizer() && (
          <button 
            onClick={loadOrganizerEvents}
            className="bg-purple-500 text-white px-4 py-2 rounded"
          >
            Load My Events
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <p>Loaded {events.length} events</p>
          <ul>
            {events.map((event, index) => (
              <li key={index}>{event.title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Example 4: Service-specific features
export const ServiceSpecificFeatures = () => {
  const [stats, setStats] = useState<EventStatistics | null>(null);
  const [templates, setTemplates] = useState<EventTemplate[]>([]);
  const [exportUrl, setExportUrl] = useState<string>('');

  const loadAdminStats = async () => {
    try {
      const response = await apiClient.get<{ data: EventStatistics }>('/admin/events/statistics');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadOrganizerTemplates = async () => {
    try {
      const response = await apiClient.get<{ data: EventTemplate[] }>('/organizer/templates');
      setTemplates(response.data);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const generateRSSFeed = () => {
    const url = eventPublicExportService.getRSSFeedUrl({
      featured_only: true,
      upcoming_only: true
    });
    setExportUrl(url);
  };

  const generateICalFeed = () => {
    const url = eventPublicExportService.getICalUrl({
      this_month: true
    });
    setExportUrl(url);
  };

  return (
    <div>
      <h2>Service-Specific Features</h2>
      
      <div className="space-y-4">
        {/* Admin Features */}
        <div className="border p-4 rounded">
          <h3 className="font-bold">Admin Features</h3>
          <button 
            onClick={loadAdminStats}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          >
            Load Detailed Statistics
          </button>
          {stats && (
            <div className="mt-2">
              <p>Statistics loaded successfully</p>
              <pre>{JSON.stringify(stats, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* Organizer Features */}
        <div className="border p-4 rounded">
          <h3 className="font-bold">Organizer Features</h3>
          <button 
            onClick={loadOrganizerTemplates}
            className="bg-purple-500 text-white px-4 py-2 rounded mr-2"
          >
            Load My Templates
          </button>
          {templates.length > 0 && (
            <div className="mt-2">
              <p>Templates: {templates.length}</p>
              <ul>
                {templates.map((template) => (
                  <li key={template.id}>{template.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Public Features */}
        <div className="border p-4 rounded">
          <h3 className="font-bold">Public Export Features</h3>
          <button 
            onClick={generateRSSFeed}
            className="bg-green-500 text-white px-4 py-2 rounded mr-2"
          >
            Generate RSS Feed
          </button>
          <button 
            onClick={generateICalFeed}
            className="bg-green-600 text-white px-4 py-2 rounded mr-2"
          >
            Generate iCal Feed
          </button>
          {exportUrl && (
            <div className="mt-2">
              <p>Export URL:</p>
              <a 
                href={exportUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 underline break-all"
              >
                {exportUrl}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Example 5: Migration from old service
export const MigrationExample = () => {
  return (
    <div>
      <h2>Migration from Old Service</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-bold">OLD WAY (still works)</h3>
          <pre className="bg-gray-100 p-2 text-sm">
{`// Direct import (deprecated but functional)
import { eventService } from 'services/event.service';

// Still works - delegates to admin service
const events = await eventService.getEvents();
const event = await eventService.createEvent(data);`}
          </pre>
        </div>

        <div>
          <h3 className="font-bold">NEW WAY (recommended)</h3>
          <pre className="bg-gray-100 p-2 text-sm">
{`// Use hook with auto-detection
const { events, createEvent } = useEventManager();

// Or explicit context
const { events } = useEventManager({ 
  context: 'admin' 
});

// Or direct service access
const service = getEventServiceForContext('admin');
const events = await service.getEvents();`}
          </pre>
        </div>
      </div>

      <div className="mt-4 p-4 bg-yellow-100 rounded">
        <h4 className="font-bold">Migration Notes:</h4>
        <ul className="list-disc list-inside">
          <li>Old eventService calls still work (backward compatible)</li>
          <li>New services provide role-specific functionality</li>
          <li>useEventManager automatically chooses the right service</li>
          <li>Public service has different methods optimized for public views</li>
          <li>Organizer service has limited scope for security</li>
        </ul>
      </div>
    </div>
  );
};

// Main demo component
export const EventServiceDemo = () => {
  const [activeExample, setActiveExample] = useState('auto');

  const examples = {
    auto: AutoDetectedEventManager,
    explicit: ExplicitContextEventManager,
    direct: DirectServiceUsage,
    features: ServiceSpecificFeatures,
    migration: MigrationExample,
  };

  const ExampleComponent = examples[activeExample as keyof typeof examples];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Event Service Examples</h1>
      
      <div className="mb-6">
        <nav className="flex space-x-4">
          {Object.keys(examples).map((key) => (
            <button
              key={key}
              onClick={() => setActiveExample(key)}
              className={`px-4 py-2 rounded ${
                activeExample === key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      <ExampleComponent />
    </div>
  );
};

export default EventServiceDemo;