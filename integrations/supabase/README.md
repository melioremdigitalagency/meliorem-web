# Supabase Integration

This directory contains Supabase integrations for production data, analytics, and user account purposes.

## Overview

Supabase is used for:
- **Production Data**: Operational data needed for the application
- **Analytics**: User behavior tracking, session data, event tracking
- **User Accounts**: User account management (future)

This is separate from Make.com webhooks, which handle **actioned data** (triggering external workflows).

## Structure

```
integrations/supabase/
├── config.js              # Supabase client configuration
├── session-tracking.js    # Session tracking operations
├── event-tracking.js     # Event tracking operations
├── lead-tracking.js      # Lead tracking operations
└── README.md             # This file
```

## Configuration

### Setup

1. **Get Supabase credentials:**
   - Project URL: `https://your-project-id.supabase.co`
   - Anonymous Key: Found in Supabase dashboard → Settings → API

2. **Configure in `integrations/supabase/config.js`:**
   ```javascript
   window.SupabaseConfig = {
     url: 'https://your-project-id.supabase.co',
     anonKey: 'your-anon-key',
     enabled: true,
     tables: {
       sessions: 'sessions',
       events: 'events',
       leads: 'leads'
     }
   };
   ```

3. **Include Supabase JS library:**
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   ```

### Security

⚠️ **IMPORTANT**: 
- **NEVER** use the service role key in client-side code
- **ALWAYS** use the anonymous key with Row Level Security (RLS) enabled
- Configure RLS policies in Supabase dashboard to restrict data access

## Modules

### Session Tracking (`session-tracking.js`)

Tracks user sessions, page views, and session metadata.

**Methods:**
- `createSession(sessionData)` - Create a new session
- `endSession(sessionId, duration)` - End a session
- `trackPageView(sessionId, pageUrl, pageTitle)` - Track page view

**Usage:**
```javascript
// Create session
const result = await window.SupabaseSessionTracking.createSession({
  sessionId: 'unique-session-id',
  userAgent: navigator.userAgent,
  referrer: document.referrer,
  landingPage: window.location.href,
  utmSource: 'google',
  utmMedium: 'cpc',
  utmCampaign: 'summer-sale'
});

// Track page view
await window.SupabaseSessionTracking.trackPageView(
  'session-id',
  window.location.href,
  document.title
);

// End session
await window.SupabaseSessionTracking.endSession('session-id', 300); // 5 minutes
```

### Event Tracking (`event-tracking.js`)

Tracks user interactions, conversions, and custom events.

**Methods:**
- `trackEvent(eventData)` - Track a custom event
- `trackConversion(conversionData)` - Track a conversion event
- `trackCalculatorCompletion(calculatorData)` - Track calculator completion

**Usage:**
```javascript
// Track custom event
await window.SupabaseEventTracking.trackEvent({
  eventType: 'button_click',
  eventName: 'download_button',
  sessionId: 'session-id',
  pageUrl: window.location.href,
  properties: { buttonId: 'download-cta' }
});

// Track conversion
await window.SupabaseEventTracking.trackConversion({
  conversionType: 'form_submission',
  formType: 'waitlist',
  sessionId: 'session-id',
  value: 100,
  metadata: { source: 'homepage' }
});

// Track calculator completion
await window.SupabaseEventTracking.trackCalculatorCompletion({
  calculatorType: 'family-readiness-check',
  sessionId: 'session-id',
  results: { score: 85 },
  metadata: { completed: true }
});
```

### Lead Tracking (`lead-tracking.js`)

Tracks form submissions and lead captures.

**Methods:**
- `trackLead(leadData)` - Track a simple lead capture
- `trackFormSubmission(submissionData)` - Track full form submission with payload
- `updateLeadStatus(leadId, status, notes)` - Update lead status

**Usage:**
```javascript
// Track simple lead
await window.SupabaseLeadTracking.trackLead({
  formType: 'waitlist',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+27123456789',
  sessionId: 'session-id',
  source: 'homepage',
  metadata: { context: 'hero-section' }
});

// Track full form submission
await window.SupabaseLeadTracking.trackFormSubmission({
  formType: 'waitlist',
  payload: {
    formType: 'waitlist',
    submittedAt: new Date().toISOString(),
    fields: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+27123456789'
    },
    metadata: {
      honeypot: { ... },
      timing: { ... },
      interaction: { ... },
      browser: { ... }
    }
  }
});

// Update lead status (typically server-side)
await window.SupabaseLeadTracking.updateLeadStatus(
  'lead-id',
  'contacted',
  { notes: 'Follow-up scheduled' }
);
```

## Database Schema

### Sessions Table

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT UNIQUE NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  landing_page TEXT NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  last_page_url TEXT,
  last_page_title TEXT,
  page_views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Events Table

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  session_id TEXT,
  page_url TEXT,
  page_title TEXT,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Leads Table

```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_type TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  id_number TEXT,
  consent_newsletter BOOLEAN DEFAULT FALSE,
  consent_sharing BOOLEAN DEFAULT FALSE,
  session_id TEXT,
  source TEXT,
  status TEXT DEFAULT 'new',
  page_url TEXT,
  page_title TEXT,
  metadata JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Error Handling

All methods return a consistent response format:

```javascript
{
  success: true | false,
  data: { ... },      // On success
  error: 'message'    // On failure
}
```

**Example:**
```javascript
const result = await window.SupabaseLeadTracking.trackLead(leadData);

if (result.success) {
  console.log('Lead tracked:', result.data);
} else {
  console.error('Error:', result.error);
  // Handle error gracefully
}
```

## Debug Mode

Enable debug logging by setting in `integrations/config.js`:

```javascript
window.APIConfig = {
  debug: true,
  // ... other config
};
```

This will log all Supabase operations to the console.

## Row Level Security (RLS)

**CRITICAL**: Enable RLS on all tables and create appropriate policies:

```sql
-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Example: Allow inserts for sessions (anonymous users can create sessions)
CREATE POLICY "Allow anonymous inserts" ON sessions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Example: Allow inserts for events
CREATE POLICY "Allow anonymous inserts" ON events
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Example: Allow inserts for leads
CREATE POLICY "Allow anonymous inserts" ON leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Example: Restrict reads (only authenticated users or service role)
CREATE POLICY "Restrict reads" ON leads
  FOR SELECT
  TO authenticated
  USING (true);
```

## Best Practices

1. **Fail Gracefully**: Always check if client is available before using
2. **Don't Block UI**: Use async/await but don't wait for Supabase calls to complete before showing success to user
3. **Error Handling**: Log errors but don't expose sensitive information
4. **Data Validation**: Validate data before sending to Supabase
5. **RLS Policies**: Always use RLS to protect sensitive data
6. **Batch Operations**: For multiple operations, consider batching (future enhancement)

## Troubleshooting

### "Supabase JS library not loaded"
- Ensure `@supabase/supabase-js` is included in your HTML
- Check script loading order

### "Client not configured"
- Verify `integrations/supabase/config.js` has valid URL and anonKey
- Check that `enabled` is set to `true`

### RLS Policy Errors
- Check RLS policies in Supabase dashboard
- Verify policies allow the operations you're trying to perform
- Test with Supabase dashboard SQL editor

### Timeout Errors
- Check network connectivity
- Verify Supabase project is active
- Consider increasing timeout in config

