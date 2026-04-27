# User Data Update Specification

This document defines how users can update username and email.

---

## 1) Editable Fields

User can update:

- username
- email

MongoDB collection name: `Users`

---

## 2) Security Requirement

Before updating:

- User must provide current password

---

## 3) Warning Behavior

Before submitting:

- Show message:

"You will be logged out after changing your account information"

---

## 4) Update Flow

1. User submits:
   - new username and/or email
   - current password

2. Backend:
   - Validates password
   - Updates user data

3. Backend invalidates session:
   - session.isValid = false
   - clears token

4. User is logged out

---

## 5) Email Notifications

After update:

- Send email to OLD email:
  - Notify that account data was changed

- Send email to NEW email:
  - Confirm update success

---

## 6) Frontend Behavior

- After success:
  - Redirect to login page
  - Show success message

---

## 7) Validation Rules

- Email must be unique
- Username must be unique

---

## 8) Color Preferences

Users can persist interface color preferences in `preferences.colors`.

Supported color fields:

- `backgroundPrimary`
- `backgroundSecondary`
- `textPrimary`
- `textSecondary`
- `borderColor`
- `inputBackground`
- `headerBackground`
- `headerText`
- `primaryButtonBackground`
- `primaryButtonText`
- `secondaryButtonBackground`
- `secondaryButtonText`

All color fields are optional and must be valid hexadecimal colors when provided.