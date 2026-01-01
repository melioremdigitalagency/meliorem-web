# Anti-Bot Module

Client-side anti-bot protection for form submissions using honeypot fields.

## Overview

This module provides honeypot field validation to detect and block automated bot submissions. Honeypot fields are invisible to human users but trap bots that auto-fill all form fields.

## Files

- `config.js` - Form configurations (honeypot field names, types, labels)
- `honeypot.js` - Standalone validation function
- `honeypot.css` - CSS for hiding honeypot fields

## Usage

### 1. Include Scripts

Load the configuration and validation modules in your HTML:

```html
<script src="../security/anti-bot/config.js"></script>
<script src="../security/anti-bot/honeypot.js"></script>
```

**Important:** Load `config.js` before `honeypot.js`.

### 2. Add Honeypot Field(s) to HTML

Add honeypot field(s) to your form HTML. For single honeypot:

```html
<div class="opb-honeypot-field" aria-hidden="true">
  <label for="reason_for_contact">Reason for contact</label>
  <input 
    type="text" 
    id="reason_for_contact" 
    name="reason_for_contact"
    tabindex="-1"
    autocomplete="off"
  />
</div>
```

For multiple honeypot fields (e.g., B2B form):

```html
<div class="opb-honeypot-field" aria-hidden="true">
  <label for="sa-id-number">SA ID Number</label>
  <input 
    type="text" 
    id="sa-id-number" 
    name="sa-id-number"
    tabindex="-1"
    autocomplete="off"
  />
</div>

<div class="opb-honeypot-field" aria-hidden="true">
  <label for="tnc-consent">Terms & Conditions</label>
  <input 
    type="checkbox" 
    id="tnc-consent" 
    name="tnc-consent"
    tabindex="-1"
    autocomplete="off"
  />
</div>
```

### 3. Validate on Form Submission

In your form submission handler:

```javascript
const formData = new FormData(form);
if (!window.validateHoneypot(formData, 'waitlist')) {
  // Block submission - show generic error message
  showErrorMessage("We couldn't process your submission. Please try again.");
  return;
}
// Continue with normal submission
```

## Form Types

Supported form types (defined in `config.js`):
- `b2b` - B2B contact form (supports multiple honeypot fields)
- `waitlist` - Waitlist form component
- `contact-us` - Contact form component
- `dc-lead` - DC Lead form in calculator

## Adding a New Form

### Single Honeypot Field (Legacy Format)

1. Add configuration to `config.js`:
```javascript
'new-form': {
  honeypotField: 'field_name',
  honeypotLabel: 'Field Label',
  honeypotType: 'text',
  formSelector: '.form-selector',
  timing: {
    minDuration: 3
  }
}
```

2. Add honeypot field to form HTML
3. Call `validateHoneypot()` in form submission handler

### Multiple Honeypot Fields (Recommended)

1. Add configuration to `config.js`:
```javascript
'new-form': {
  honeypotFields: [
    { name: 'field1', label: 'Field 1', type: 'text' },
    { name: 'field2', label: 'Field 2', type: 'checkbox' },
    { name: 'field3', label: 'Field 3', type: 'email' }
  ],
  formSelector: '.form-selector',
  timing: {
    minDuration: 3
  }
}
```

2. Add all honeypot fields to form HTML (each wrapped in `.opb-honeypot-field`)
3. Call `validateHoneypot()` in form submission handler

The validation function will check all honeypot fields and return `false` if any are filled/checked.

## Security Notes

- Never reveal honeypot logic to users
- Use generic error messages when validation fails
- Honeypot fields must be truly invisible (CSS + accessibility)
- Validation fails open (returns true if config missing) to avoid breaking forms

## Timestamp Validation

### Overview

Timestamp validation ensures forms are not submitted too quickly (indicating bot behavior). All forms require a minimum of 3 seconds from when they become available until submission.

### Usage

#### 1. Initialize Timing

Call `initializeFormTiming()` when the form becomes available to the user:

```javascript
// For regular forms (on initialization)
if (window.initializeFormTiming) {
  window.initializeFormTiming(formElement, 'waitlist');
}

// For modal forms (when modal opens)
function openModal() {
  modal.classList.add('active');
  const form = document.getElementById('formId');
  if (form && window.initializeFormTiming) {
    window.initializeFormTiming(form, 'dc-lead');
  }
}
```

#### 2. Validate on Submission

Call `validateFormTiming()` before processing form submission:

```javascript
if (window.validateFormTiming && !window.validateFormTiming(formElement, 'waitlist')) {
  // Block submission - show generic error message
  showErrorMessage("We couldn't process your submission. Please try again.");
  return;
}
// Continue with normal submission
```

#### 3. Reset Timing

Call `resetFormTiming()` when form is reset or modal is closed:

```javascript
// On form reset
form.reset();
if (window.resetFormTiming) {
  window.resetFormTiming(form);
}

// On modal close
function closeModal() {
  modal.classList.remove('active');
  const form = document.getElementById('formId');
  if (form && window.resetFormTiming) {
    window.resetFormTiming(form);
  }
}
```

### Configuration

Timing thresholds are configured in `config.js`:

```javascript
forms: {
  'waitlist': {
    timing: {
      minDuration: 3  // seconds (uniform for all forms)
    }
  }
}
```

### Function Reference

- `initializeFormTiming(formElement, formType)` - Start timer when form becomes available
- `validateFormTiming(formElement, formType)` - Validate timing on submission (returns boolean)
- `resetFormTiming(formElement)` - Reset timer (for form reset or modal close)

All functions are also available via `window.TimestampValidator` namespace.

### Behavior

- **Minimum duration:** 3 seconds (uniform for all forms)
- **No maximum duration:** Forms can be filled for unlimited time
- **Reset on form.reset():** Timer resets when form is programmatically reset
- **Reset on modal reopen:** Timer resets when modal closes and reinitializes on reopen
- **Fail open:** Returns `true` if config missing or timing not initialized (doesn't block legitimate users)

## Future Phases

- Phase 3: Field interaction tracking
- Additional phases: Enhanced validation, rate limiting, etc.

