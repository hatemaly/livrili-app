# Priority 1: Authentication & Authorization Test Plan

## Overview
Critical authentication and authorization tests for the Livrili Admin Portal. These tests ensure secure access control and user session management.

## Test Environment Setup
- Admin Portal: http://localhost:3001
- Test Users:
  - Valid Admin: `admin@test.com` / `test123`
  - Valid Username: `testadmin` / `test123`
  - Invalid User: `invalid@test.com` / `wrongpass`
  - Inactive User: `inactive@test.com` / `test123`

---

## Test Suite 1: Login Authentication

### AUTH-001: Valid Email Login
**Test ID**: AUTH-001  
**Priority**: Critical  
**Type**: Integration  
**Description**: Verify successful login with valid email and password

**Prerequisites**:
- Admin portal is accessible
- Valid admin user exists in system

**Test Steps**:
1. Navigate to `/login`
2. Enter valid email: `admin@test.com`
3. Enter valid password: `test123`
4. Click "Sign In to Admin Portal"
5. Verify redirect to dashboard

**Expected Results**:
- User is authenticated successfully
- Redirected to `/dashboard` 
- Session is established
- User profile appears in header

**Test Data**: Valid admin credentials

---

### AUTH-002: Valid Username Login
**Test ID**: AUTH-002  
**Priority**: Critical  
**Type**: Integration  
**Description**: Verify successful login with username and password

**Prerequisites**:
- Admin user with username exists

**Test Steps**:
1. Navigate to `/login`
2. Enter username: `testadmin`
3. Enter password: `test123`
4. Submit form
5. Verify authentication success

**Expected Results**:
- Username-based authentication works
- Session established correctly
- Redirected to dashboard

**Test Data**: Username credentials

---

### AUTH-003: Invalid Credentials
**Test ID**: AUTH-003  
**Priority**: High  
**Type**: Integration  
**Description**: Verify error handling for invalid credentials

**Test Steps**:
1. Navigate to `/login`
2. Enter invalid email: `invalid@test.com`
3. Enter wrong password: `wrongpass`
4. Submit form
5. Verify error message display

**Expected Results**:
- Login fails gracefully
- Error message displayed: "Invalid login credentials"
- No redirect occurs
- Form remains accessible

**Test Data**: Invalid credentials

---

### AUTH-004: Empty Field Validation
**Test ID**: AUTH-004  
**Priority**: Medium  
**Type**: Unit  
**Description**: Verify form validation for empty fields

**Test Steps**:
1. Navigate to `/login`
2. Leave username field empty
3. Enter password
4. Attempt to submit
5. Verify validation message

**Expected Results**:
- Form validation prevents submission
- Required field indicators shown
- User remains on login page

**Test Data**: Empty username

---

### AUTH-005: Google OAuth Login
**Test ID**: AUTH-005  
**Priority**: High  
**Type**: E2E  
**Description**: Verify Google OAuth authentication flow

**Test Steps**:
1. Navigate to `/login`
2. Click "Continue with Google"
3. Complete OAuth flow in popup
4. Verify admin role validation
5. Confirm dashboard access

**Expected Results**:
- OAuth popup opens correctly
- Authentication completes
- Admin role validated
- User redirected to dashboard

**Test Data**: Valid Google account with admin access

---

### AUTH-006: OAuth Role Validation
**Test ID**: AUTH-006  
**Priority**: Critical  
**Type**: Security  
**Description**: Verify non-admin users cannot access via OAuth

**Test Steps**:
1. Navigate to `/login`
2. Attempt OAuth with non-admin Google account
3. Verify rejection and error message

**Expected Results**:
- OAuth completes but access denied
- Error: "Access denied. Admin accounts only."
- User redirected back to login
- No session established

**Test Data**: Non-admin Google account

---

### AUTH-007: Session Persistence
**Test ID**: AUTH-007  
**Priority**: High  
**Type**: Integration  
**Description**: Verify session persists across browser refresh

**Test Steps**:
1. Login successfully
2. Navigate to dashboard
3. Refresh browser page
4. Verify user remains authenticated

**Expected Results**:
- Session maintained after refresh
- User stays on dashboard
- No re-authentication required

**Test Data**: Valid login session

---

### AUTH-008: Session Expiry Handling
**Test ID**: AUTH-008  
**Priority**: High  
**Type**: Security  
**Description**: Verify proper handling of expired sessions

**Test Steps**:
1. Login successfully
2. Wait for session to expire (or simulate)
3. Attempt to perform authenticated action
4. Verify redirect to login

**Expected Results**:
- Expired session detected
- User redirected to login
- Session cleared properly
- Error message displayed

**Test Data**: Expired session token

---

## Test Suite 2: Authorization & Role Management

### AUTH-101: Admin Role Access
**Test ID**: AUTH-101  
**Priority**: Critical  
**Type**: Security  
**Description**: Verify admin users can access all portal features

**Prerequisites**:
- User with admin role logged in

**Test Steps**:
1. Login as admin user
2. Navigate to `/users` (admin-only section)
3. Navigate to `/retailers` 
4. Navigate to `/orders`
5. Verify all sections accessible

**Expected Results**:
- All navigation items visible
- All admin pages accessible
- No permission errors

**Test Data**: Admin role user

---

### AUTH-102: Non-Admin Role Rejection
**Test ID**: AUTH-102  
**Priority**: Critical  
**Type**: Security  
**Description**: Verify non-admin users cannot access admin portal

**Test Steps**:
1. Attempt login with retailer role user
2. Verify access denied
3. Check error message accuracy

**Expected Results**:
- Login rejected
- Appropriate error message
- No access to admin features

**Test Data**: Retailer role user credentials

---

### AUTH-103: Route Protection
**Test ID**: AUTH-103  
**Priority**: Critical  
**Type**: Security  
**Description**: Verify protected routes redirect unauthenticated users

**Test Steps**:
1. Ensure user is logged out
2. Directly navigate to `/dashboard`
3. Directly navigate to `/users`
4. Verify redirects to login

**Expected Results**:
- Unauthenticated access blocked
- Automatic redirect to `/login`
- Route protection active on all pages

**Test Data**: No authentication token

---

### AUTH-104: Deep Link Preservation
**Test ID**: AUTH-104  
**Priority**: Medium  
**Type**: UX  
**Description**: Verify deep links preserved after authentication

**Test Steps**:
1. While logged out, navigate to `/orders`
2. Get redirected to login
3. Complete login process
4. Verify redirect to original `/orders` page

**Expected Results**:
- Original destination preserved
- Post-login redirect accurate
- User lands on intended page

**Test Data**: Deep link URL

---

### AUTH-105: Multiple Tab Session Sync
**Test ID**: AUTH-105  
**Priority**: Medium  
**Type**: Integration  
**Description**: Verify session state syncs across browser tabs

**Test Steps**:
1. Login in Tab 1
2. Open Tab 2 to same portal
3. Verify authentication state in Tab 2
4. Logout from Tab 1
5. Check Tab 2 reflects logout

**Expected Results**:
- Login state synced across tabs
- Logout propagates to all tabs
- Consistent session management

**Test Data**: Multi-tab browser session

---

## Test Suite 3: Profile Management

### AUTH-201: View Profile Information
**Test ID**: AUTH-201  
**Priority**: Medium  
**Type**: Integration  
**Description**: Verify user can view their profile information

**Test Steps**:
1. Login successfully
2. Click user dropdown in header
3. Select "Profile"
4. Navigate to profile page
5. Verify information display

**Expected Results**:
- Profile page loads correctly
- User information displayed accurately
- All profile fields visible

**Test Data**: User profile data

---

### AUTH-202: Update Profile Information
**Test ID**: AUTH-202  
**Priority**: Medium  
**Type**: Integration  
**Description**: Verify user can update profile information

**Test Steps**:
1. Navigate to profile page
2. Update full name field
3. Update phone number
4. Save changes
5. Verify updates persist

**Expected Results**:
- Changes save successfully
- Updated information displays correctly
- Database updated properly

**Test Data**: Updated profile information

---

### AUTH-203: Password Change
**Test ID**: AUTH-203  
**Priority**: High  
**Type**: Security  
**Description**: Verify user can change their password

**Test Steps**:
1. Navigate to profile page
2. Access password change section
3. Enter current password
4. Enter new password
5. Confirm new password
6. Submit changes

**Expected Results**:
- Password updated successfully
- User can login with new password
- Old password no longer works

**Test Data**: Current and new passwords

---

### AUTH-204: Weak Password Rejection
**Test ID**: AUTH-204  
**Priority**: High  
**Type**: Security  
**Description**: Verify weak passwords are rejected

**Test Steps**:
1. Attempt to change password
2. Enter weak password (less than 8 characters)
3. Submit form
4. Verify validation error

**Expected Results**:
- Weak password rejected
- Validation message displayed
- Password policy enforced

**Test Data**: Various weak passwords

---

## Test Suite 4: Logout & Session Management

### AUTH-301: Standard Logout
**Test ID**: AUTH-301  
**Priority**: Critical  
**Type**: Integration  
**Description**: Verify user can logout successfully

**Test Steps**:
1. Login to admin portal
2. Click user dropdown
3. Select "Sign Out"
4. Verify logout process

**Expected Results**:
- User logged out immediately
- Session cleared completely
- Redirected to login page

**Test Data**: Active user session

---

### AUTH-302: Post-Logout Access Prevention
**Test ID**: AUTH-302  
**Priority**: Critical  
**Type**: Security  
**Description**: Verify logged out users cannot access protected content

**Test Steps**:
1. Complete logout process
2. Attempt to navigate to `/dashboard`
3. Attempt direct API calls
4. Verify access blocked

**Expected Results**:
- Protected pages redirect to login
- API calls return authentication errors
- No cached data accessible

**Test Data**: Post-logout session state

---

### AUTH-303: Concurrent Session Logout
**Test ID**: AUTH-303  
**Priority**: Medium  
**Type**: Security  
**Description**: Verify logout affects all user sessions

**Test Steps**:
1. Login from multiple devices/browsers
2. Logout from one session
3. Verify other sessions invalidated

**Expected Results**:
- All sessions terminated
- Universal logout enforced
- Security maintained across devices

**Test Data**: Multiple concurrent sessions

---

## Test Data Requirements

### Valid Admin Users
```json
{
  "admin1": {
    "email": "admin@test.com",
    "username": "testadmin",
    "password": "test123",
    "role": "admin",
    "full_name": "Test Administrator"
  }
}
```

### Invalid Test Cases
```json
{
  "invalid_credentials": {
    "email": "invalid@test.com",
    "password": "wrongpass"
  },
  "weak_passwords": [
    "123",
    "weak",
    "1234567"
  ]
}
```

### OAuth Test Accounts
- Admin Google account: `admin.test@gmail.com`
- Non-admin Google account: `user.test@gmail.com`

---

## Security Considerations

### Critical Security Tests
1. **SQL Injection**: Test login forms for SQL injection vulnerabilities
2. **XSS Protection**: Verify input sanitization in login forms
3. **CSRF Protection**: Test cross-site request forgery protection
4. **Session Fixation**: Verify session IDs regenerated after login
5. **Brute Force Protection**: Test login attempt rate limiting

### Performance Tests
1. **Login Response Time**: < 2 seconds for standard login
2. **OAuth Response Time**: < 5 seconds for OAuth flow
3. **Session Validation**: < 500ms for protected route access
4. **Concurrent Logins**: Support 100+ concurrent admin sessions

---

## Error Scenarios

### Network Failure Tests
- **AUTH-401**: Login during network interruption
- **AUTH-402**: OAuth failure handling
- **AUTH-403**: Session validation network timeout

### Database Failure Tests  
- **AUTH-501**: User lookup failure
- **AUTH-502**: Session storage failure
- **AUTH-503**: Profile update failure

### Browser-Specific Tests
- **AUTH-601**: Chrome authentication flow
- **AUTH-602**: Firefox OAuth handling
- **AUTH-603**: Safari session persistence
- **AUTH-604**: Mobile browser compatibility

---

## Automation Notes

### Playwright Implementation
- Use `page.goto()` for navigation
- `page.fill()` for form inputs
- `page.click()` for button interactions
- `expect(page).toHaveURL()` for redirect verification

### API Testing
- Direct tRPC endpoint testing
- Authentication header validation
- Session token verification
- Role-based access control testing

### Visual Testing
- Login form rendering
- Error message display
- Profile page layout
- Mobile responsiveness