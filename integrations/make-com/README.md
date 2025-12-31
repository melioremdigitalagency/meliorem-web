# Make.com Webhook Integration

This directory contains the Make.com webhook integration for form submissions.

## Overview

Make.com webhooks are used for **actioned data** - data that triggers actions like:
- Sending leads to third-party services
- Sending emails
- Creating records in external systems
- Triggering workflows

## Structure

```
integrations/make-com/
├── config.js                    # Make.com-specific configuration
├── lead-dc-webhook.js          # DC Lead form webhook client
├── contact-request-webhook.js   # Contact-Us and Waitlist webhook client
└── README.md                    # This file
```

## Configuration

### Main Configuration (`integrations/config.js`)

Webhook URLs are configured in the main `integrations/config.js` file:

```javascript
makeCom: {
  enabled: true,
  webhooks: {
    'dc-lead': 'https://hook.make.com/your-dc-lead-webhook',
    'contact-us': 'https://hook.make.com/your-contact-waitlist-webhook',
    'waitlist': 'https://hook.make.com/your-contact-waitlist-webhook'
  },
  timeout: 10000,
  retryAttempts: 1
}
```

### Make.com Configuration (`integrations/make-com/config.js`)

This file contains Make.com-specific settings:
- Default headers
- Timeout settings
- Retry configuration

**Webhook Mapping:**
- `dc-lead` → Uses `lead-dc-webhook.js` → `dc-lead` webhook
- `contact-us` → Uses `contact-request-webhook.js` → `contact-us` webhook
- `waitlist` → Uses `contact-request-webhook.js` → `contact-us` webhook (same as contact-us)

## Usage

### DC Lead Form

```javascript
// Submit DC Lead form data to Make.com webhook
try {
  const payload = {
    formType: 'dc-lead',
    submittedAt: new Date().toISOString(),
    fields: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+27123456789',
      idNumber: '1234567890123',
      consent: true,
      newsletter: false
    },
    metadata: {
      // Anti-bot metadata, browser info, etc.
    }
  };

  const result = await window.LeadDcWebhook.submit(payload);
  console.log('Success:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Contact-Us Form

```javascript
// Submit Contact-Us form data to Make.com webhook
try {
  const payload = {
    formType: 'contact-us',
    submittedAt: new Date().toISOString(),
    fields: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+27123456789',
      message: 'Hello, I have a question...',
      consentNewsletter: true
    },
    metadata: {
      // Anti-bot metadata, browser info, etc.
    }
  };

  const result = await window.ContactRequestWebhook.submit('contact-us', payload);
  console.log('Success:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Waitlist Form

```javascript
// Submit Waitlist form data to Make.com webhook
try {
  const payload = {
    formType: 'waitlist',
    submittedAt: new Date().toISOString(),
    fields: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+27123456789',
      consent: true,
      newsletter: true
    },
    metadata: {
      // Anti-bot metadata, browser info, etc.
    }
  };

  const result = await window.ContactRequestWebhook.submit('waitlist', payload);
  console.log('Success:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Check Configuration

```javascript
// Check if DC Lead webhook is configured
if (window.LeadDcWebhook.isConfigured()) {
  // Proceed with submission
} else {
  console.warn('Make.com DC Lead webhook not configured');
}

// Check if Contact Request webhook is configured
if (window.ContactRequestWebhook.isConfigured()) {
  // Proceed with submission
} else {
  console.warn('Make.com Contact Request webhook not configured');
}
```

## Webhook Payload Structure

All form submissions include the following structure:

```javascript
{
  // Form identification
  formType: 'waitlist' | 'contact-us' | 'dc-lead',
  submittedAt: '2025-01-24T10:30:00.000Z', // ISO 8601 timestamp
  
  // User-submitted data
  fields: {
    name: string,
    email: string,
    phone: string | null,
    message: string | null,      // Contact-Us only
    idNumber: string | null,      // DC Lead only
    consentNewsletter: boolean,
    consentSharing: boolean       // DC Lead only
  },
  
  // Anti-bot metadata
  metadata: {
    honeypot: { ... },
    timing: { ... },
    interaction: { ... },
    browser: { ... }
  }
}
```

## Error Handling

The client includes automatic retry logic:
- **Timeout**: 10 seconds (configurable)
- **Retry Attempts**: 1 (configurable)
- **Retry Delay**: 1 second (configurable)

Errors are thrown as exceptions and should be caught:

```javascript
try {
  await window.MakeComClient.submit('waitlist', payload);
} catch (error) {
  if (error.message.includes('timeout')) {
    // Handle timeout
  } else if (error.message.includes('not configured')) {
    // Handle missing configuration
  } else {
    // Handle other errors
  }
}
```

## Security Considerations

1. **Webhook URLs**: Store webhook URLs in `integrations/config.js` (not in version control if sensitive)
2. **HTTPS Only**: All webhook URLs should use HTTPS
3. **Payload Validation**: Make.com webhooks should validate payload structure
4. **Rate Limiting**: Consider rate limiting on Make.com side

## Adding New Form Types

If you need to add a new form type:

1. **If it should use an existing webhook:**
   - Add the form type to the appropriate webhook client's `validFormTypes` array
   - Use the existing webhook client in your form component

2. **If it needs a new webhook:**
   - Add webhook URL to `integrations/config.js`:
     ```javascript
     webhooks: {
       'new-form-type': 'https://hook.make.com/your-webhook'
     }
     ```
   - Create a new webhook client file following the pattern of `lead-dc-webhook.js` or `contact-request-webhook.js`
   - Expose globally as `window.NewFormTypeWebhook`

## Testing

To test webhook submissions:

1. Ensure webhook URLs are configured in `integrations/config.js`
2. Use browser console to test:

   **DC Lead:**
   ```javascript
   const testPayload = {
     formType: 'dc-lead',
     submittedAt: new Date().toISOString(),
     fields: { name: 'Test', email: 'test@example.com', idNumber: '1234567890123', consent: true }
   };
   await window.LeadDcWebhook.submit(testPayload);
   ```

   **Contact-Us or Waitlist:**
   ```javascript
   const testPayload = {
     formType: 'waitlist',
     submittedAt: new Date().toISOString(),
     fields: { name: 'Test', email: 'test@example.com' }
   };
   await window.ContactRequestWebhook.submit('waitlist', testPayload);
   ```

3. Check Make.com scenario execution logs for received data

## Troubleshooting

### "Webhook URL is empty" Error
- Ensure webhook URL is set in `integrations/config.js`
- For DC Lead: Check `dc-lead` webhook URL
- For Contact-Us/Waitlist: Check `contact-us` webhook URL

### "Request timeout" Error
- Check Make.com scenario is active
- Verify webhook URL is correct
- Check network connectivity
- Consider increasing timeout in config

### "Webhook request failed" Error
- Check Make.com scenario logs
- Verify payload structure matches expected format
- Check for authentication requirements on webhook

