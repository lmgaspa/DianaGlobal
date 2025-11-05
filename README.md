# Diana Global 🌍🐱

Welcome to Diana Global, a decentralized exchange (DEX) prototype! This platform is designed to provide seamless crypto transactions, featuring DianaCoin (DCN), a unique meme coin inspired by Diana, the beauty cat 🐾.

## 🚀 Key Features

- **DianaCoin (DCN)**: Our custom meme coin for the community.
- **Simple and Intuitive UI**: User-friendly interface for crypto trading and wallet management.
- **Deposit & Withdraw**: Easily manage funds with secure deposit and withdrawal functionalities.
- **Real-Time Trading**: Swift and transparent trading experience.
- **Blockchain Integration**: Supports public wallet generation for secure transactions.
- **Multi-Provider Authentication**: Secure login with email/password and Google OAuth2.
- **Password Management**: Comprehensive password reset and setup flows for Google-authenticated users.
- **Security-First Architecture**: Token-based authentication with automatic refresh and CSRF protection.

## 🛠️ Tech Stack

- **Frontend**: Next.js, Tailwind CSS, TypeScript, React
- **Backend**: Spring Boot, MongoDB Atlas
- **Database**: MongoDB for decentralized storage
- **Authentication**: 
  - NextAuth.js for session management
  - JWT-based authentication with HttpOnly cookies
  - Automatic token refresh with retry logic
  - CSRF protection with double-submit pattern

## 🔒 Security Features

### Authentication & Authorization

#### Token Management Strategy
- **Access Token**: Stored only in memory (short-lived, 1-5 minutes)
- **Refresh Token**: HttpOnly cookie managed by backend (prevents XSS attacks)
- **CSRF Protection**: Double-submit pattern using cookie + header
- **Token Refresh**: Automatic refresh with exponential backoff retry logic
- **Session Persistence**: NextAuth.js manages JWT sessions securely

#### Password Blocking System
The application implements a comprehensive blocking system for Google OAuth2 users who haven't set a password yet. This ensures that sensitive financial operations require a password, even if the user authenticated via Google.

**Features:**
- **Route Protection**: Global `PasswordRequiredGate` component blocks all `/protected/*` routes except dashboard
- **Function Blocking**: Deposit, Withdraw, Buy with Money, and Swap functions are disabled until password is set
- **Consistent UI**: Same blocking interface across login, forgot-password, and protected routes
- **Smart Detection**: Automatically detects Google users without passwords via backend responses (403 Forbidden)

**Flow:**
1. User attempts to access protected resource or perform financial operation
2. System checks if user is Google-authenticated and has `password_set: false`
3. If blocked, shows warning message with list of suspended functions
4. User must authenticate with Google first, then set password in dashboard
5. After password is set, all features are unlocked

**Implementation Points:**
- `PasswordRequiredGate`: Global component that wraps protected routes
- `ProtectedRouteGuard`: Applies blocking logic automatically to all `/protected/*` routes
- `PasswordNotice`: Dashboard component that displays blocking message
- `EstimatedBalance`: Disables action buttons when password is not set
- Login/Forgot Password pages: Detect Google users and show blocking UI

### Security Best Practices

1. **HttpOnly Cookies**: Refresh tokens stored in HttpOnly cookies to prevent XSS attacks
2. **CSRF Tokens**: Double-submit pattern with cookie and header validation
3. **Token Rotation**: Backend automatically rotates refresh tokens on use
4. **Automatic Cleanup**: Legacy tokens in localStorage are cleaned on app startup
5. **Session Validation**: Middleware validates tokens before allowing access to protected routes
6. **Error Handling**: Secure error messages that don't leak sensitive information

## 🏗️ Architecture & SOLID Principles

### Open-Closed Principle (OCP) Implementation

The codebase follows the Open-Closed Principle, allowing extension without modification. Key examples:

#### 1. Token Extraction (OCP)
```typescript
// OCP: If backend changes token field names, only extend pickers
function pickAccessToken(data: any): string | undefined {
  return (
    data?.accessToken ||
    data?.jwt ||
    data?.token ||
    data?.bearer ||
    undefined
  );
}
```
**Benefit**: Backend can change response structure without modifying authentication flow.

#### 2. Authentication Providers (OCP)
```typescript
// OCP: New providers can be added without modifying existing code
providers: [
  CredentialsProvider({ ... }),
  GoogleProvider({ ... }),
  // Future: FacebookProvider, AppleProvider, etc.
]
```
**Benefit**: New authentication methods can be added by extending the providers array.

#### 3. Protected Route Guard (OCP)
```typescript
// OCP: New routes can be excluded without modifying guard logic
const EXCLUDED_ROUTES = [
  "/protected/dashboard",
  "/protected/login",
  "/set-password",
];
```
**Benefit**: Route protection rules can be extended by modifying the exclusion list.

#### 4. API Interceptors (OCP)
```typescript
// OCP: Response handling can be extended without modifying core logic
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    // Extensible error handling
    if (error.response?.status === 401) {
      // Refresh logic - can be extended
    }
  }
);
```
**Benefit**: New error handling strategies can be added without changing the interceptor structure.

#### 5. Profile Data Mapping (OCP)
```typescript
// OCP: Backend field changes handled through mapping layer
const mappedProfile: Profile = {
  id: res.data.id,
  name: res.data.name,
  email: res.data.email,
  authProvider: res.data.authProvider || res.data.auth_provider,  // Supports both formats
  passwordSet: res.data.passwordSet !== undefined ? res.data.passwordSet : res.data.password_set,
};
```
**Benefit**: Backend schema changes only require updating the mapping, not the entire application. Supports both camelCase and snake_case formats.

#### 6. CSRF Token Management (OCP)
```typescript
// OCP: CSRF token extraction can be extended for different response formats
export function captureCsrfFromFetchResponse(response: Response): void {
  const token = response.headers.get("X-CSRF-Token") || 
                response.headers.get("X-XSRF-TOKEN") ||
                extractFromCookie(response);
  if (token) setCsrfToken(token);
}
```
**Benefit**: New CSRF token sources can be added without modifying the core authentication logic.

#### 7. Token Synchronization (OCP)
```typescript
// OCP: Token sources can be extended without modifying hooks
useEffect(() => {
  if (sessionAccessToken) {
    setAccessToken(sessionAccessToken);  // From NextAuth
  } else if (legacyToken) {
    setAccessToken(legacyToken);  // From localStorage (if needed)
  }
}, [sessionAccessToken, legacyToken]);
```
**Benefit**: New token sources (localStorage, sessionStorage, external APIs) can be added by extending the effect dependencies.

#### 8. Refresh Validation (OCP)
```typescript
// OCP: Public page list can be extended without modifying validation logic
const PUBLIC_PAGES = [
  "/login",
  "/signup",
  "/forgot-password",
  // New pages can be added here
];
```
**Benefit**: New public routes can be added without changing the refresh validation algorithm.

### Component Architecture

#### Separation of Concerns
- **Hooks**: Business logic (`useBackendProfile`, `useResolvedAuth`)
- **Components**: UI presentation (`PasswordRequiredGate`, `PasswordNotice`)
- **Utils**: Helper functions (`authUtils`, `refreshValidation`)
- **Lib**: Core infrastructure (`http`, `api`, `auth`)

#### Extensibility Points
1. **New Authentication Providers**: Add to NextAuth providers array
2. **New Protected Routes**: Automatically protected by `ProtectedRouteGuard`
3. **New Blocking Conditions**: Extend `PasswordRequiredGate` logic
4. **New Token Sources**: Extend token picker functions
5. **New Error Handlers**: Extend interceptor error handling
6. **New Profile Fields**: Extend profile mapping without modifying hooks
7. **New CSRF Sources**: Extend CSRF token extraction
8. **New Public Routes**: Add to `PUBLIC_PAGES` array

### How to Extend the System (OCP Guidelines)

#### Adding a New Authentication Provider
```typescript
// Step 1: Add provider to NextAuth config (no changes to existing code)
providers: [
  CredentialsProvider({ ... }),  // Existing
  GoogleProvider({ ... }),       // Existing
  AppleProvider({ ... }),        // NEW: Just add here
]

// Step 2: If needed, extend token exchange (OCP)
async function exchangeAppleIdToken(idToken: string) {
  // New function, doesn't modify existing exchangeGoogleIdToken
}
```

#### Adding a New Protected Route
```typescript
// No code changes needed! ProtectedRouteGuard automatically protects:
// /protected/new-route  ← Automatically blocked if password not set

// To exclude from blocking:
const EXCLUDED_ROUTES = [
  "/protected/dashboard",
  "/protected/new-route",  // Just add here
];
```

#### Adding a New Blocked Function
```typescript
// Step 1: Extend EstimatedBalance component (OCP)
const needsPassword = Boolean(
  (isGoogle && !hasPassword) ||
  profileMissingFields ||
  // NEW: Add your condition here
  customBlockingCondition
);

// Step 2: Update PasswordNotice message (extend, don't modify)
const suspendedFunctions = [
  "Deposit",
  "Withdraw",
  "Buy with Money",
  "Swap",
  "New Function",  // Just add here
];
```

#### Adding a New Profile Field
```typescript
// Step 1: Extend Profile type (OCP)
export type Profile = {
  id: string;
  name: string | null;
  email: string;
  authProvider?: string;
  passwordSet?: boolean;
  newField?: string;  // NEW: Just add here
};

// Step 2: Extend mapping (OCP)
const mappedProfile: Profile = {
  // ... existing fields
  newField: res.data.newField || res.data.new_field,  // Supports both formats
};
```

#### Adding a New Error Handler
```typescript
// Extend interceptor without modifying existing logic (OCP)
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    // Existing 401 handling
    if (error.response?.status === 401) { /* ... */ }
    
    // NEW: Add new error type handling
    if (error.response?.status === 429) {
      // Rate limit handling - doesn't affect existing logic
    }
  }
);
```

## 📋 Password Management Flow

### For Google OAuth2 Users Without Password

1. **Login Attempt**:
   - User tries to login with email/password
   - Backend returns `403 Forbidden` with message: "Use Sign in with Google or set a password first."
   - Frontend detects Google user and shows blocking UI
   - Only "Continue with Google" button is available

2. **Forgot Password Attempt**:
   - Same detection and blocking as login
   - User must authenticate with Google first

3. **Protected Route Access**:
   - `PasswordRequiredGate` checks user profile
   - If Google user without password → blocks access
   - Shows message: "Set your password to access this feature"

4. **Dashboard Experience**:
   - `PasswordNotice` component displays warning
   - Action buttons (Deposit, Withdraw, etc.) are disabled
   - User clicks "Set a new password" → redirects to `/set-password`
   - After setting password, all features unlock

### Password Setup Flow

1. User authenticates with Google
2. Redirects to dashboard
3. Sees `PasswordNotice` with instructions
4. Clicks "Set a new password"
5. Redirects to `/set-password` (email already available from session)
6. Submits new password
7. Backend validates and sets password
8. Frontend reloads profile
9. All features unlock automatically

## 🔄 Token Refresh Flow

1. **Automatic Refresh**:
   - Axios interceptor detects 401 Unauthorized
   - Checks if refresh should be attempted (not on public pages)
   - Calls `/api/v1/auth/refresh-token` with HttpOnly cookie
   - Updates access token in memory
   - Retries original request

2. **Retry Logic**:
   - Exponential backoff for retries
   - Maximum 3 retry attempts
   - Only retries if NextAuth session is valid

3. **Public Page Protection**:
   - `refreshValidation.ts` prevents refresh attempts on public pages
   - Reduces unnecessary API calls
   - Prevents 403 errors in console

## 🎣 Custom Hooks Architecture

### useBackendProfile
**Purpose**: Fetches and manages user profile data from backend.

**OCP Implementation**:
- Profile type can be extended without modifying hook logic
- Mapping layer handles backend format changes (camelCase/snake_case)
- Token synchronization is extensible (NextAuth, localStorage, etc.)

**Features**:
- Automatic retry with exponential backoff
- Token synchronization from NextAuth session
- Error handling without automatic redirects (delegates to components)
- Manual reload capability

**Usage**:
```typescript
const { profile, loading, error, reload } = useBackendProfile();

// Profile automatically syncs token from NextAuth session
// Supports both authProvider/auth_provider formats
// Handles retries automatically on 401 errors
```

### useResolvedAuth
**Purpose**: Resolves authentication status and fetches profile.

**OCP Implementation**:
- Token sources can be extended (session, localStorage, etc.)
- Profile fetching logic is isolated and extensible

**Features**:
- Syncs NextAuth session token to http.ts
- Automatic profile fetching on session changes
- Error handling with automatic sign-out

### useSessionHandler
**Purpose**: Manages NextAuth session state.

**OCP Implementation**:
- Session update logic can be extended without modifying hook structure

## 🔐 Security Deep Dive

### Token Lifecycle (OCP)

1. **Token Acquisition**:
   ```typescript
   // OCP: Multiple token sources supported
   - NextAuth session (primary)
   - Manual fetch (fallback)
   - External API (extensible)
   ```

2. **Token Storage**:
   ```typescript
   // OCP: Storage mechanism can be extended
   - Memory (current) - access tokens
   - HttpOnly cookies (current) - refresh tokens
   - Future: Encrypted localStorage, sessionStorage, etc.
   ```

3. **Token Synchronization**:
   ```typescript
   // OCP: Sync logic extensible without modifying hooks
   useEffect(() => {
     if (sessionAccessToken) {
       setAccessToken(sessionAccessToken);  // From NextAuth
     }
     // Future sources can be added here
   }, [sessionAccessToken]);
   ```

### CSRF Protection (OCP)

The CSRF protection system is designed with OCP in mind:

```typescript
// OCP: New token sources can be added without modifying core logic
export function captureCsrfFromFetchResponse(response: Response): void {
  const token = 
    response.headers.get("X-CSRF-Token") ||      // Primary source
    response.headers.get("X-XSRF-TOKEN") ||     // Alternative
    extractFromCookie(response) ||               // Cookie fallback
    extractFromBody(response);                   // Future: body extraction
  
  if (token) setCsrfToken(token);
}
```

**Benefits**:
- New token sources can be added by extending the function
- Core validation logic remains unchanged
- Multiple token formats supported

### Interceptor Architecture (OCP)

The axios interceptor system follows OCP principles:

```typescript
// OCP: Error handling can be extended without modifying core interceptor
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    // 401 handling (existing)
    if (error.response?.status === 401) { /* refresh logic */ }
    
    // 403 handling (extensible)
    if (error.response?.status === 403) { /* custom logic */ }
    
    // 429 handling (extensible)
    if (error.response?.status === 429) { /* rate limit logic */ }
    
    // New status codes can be added here without breaking existing logic
  }
);
```

## 🐾 Meet Diana

Diana is the beloved cat behind DianaCoin! Her charm and beauty inspired the creation of this meme coin. Follow her journey and enjoy exclusive perks as part of the DianaCoin family.

## 🧪 Testing & Quality Assurance

### OCP Testing Strategy

When extending the system, ensure your changes follow OCP:

1. **Extension, Not Modification**: New features should extend existing code, not modify it
2. **Backward Compatibility**: Existing functionality must continue to work
3. **Isolated Testing**: Test new features independently without affecting existing tests

### Example Test Cases (OCP-Compliant)

```typescript
// Test: Adding new profile field doesn't break existing fields
describe('Profile Extension', () => {
  it('should support new fields without breaking existing ones', () => {
    const profile = {
      id: '123',
      email: 'test@example.com',
      authProvider: 'GOOGLE',
      passwordSet: true,
      newField: 'value'  // NEW: Doesn't break existing fields
    };
    expect(profile.id).toBe('123');
    expect(profile.newField).toBe('value');
  });
});

// Test: New authentication provider doesn't affect existing ones
describe('Auth Provider Extension', () => {
  it('should support new provider without breaking Google/Credentials', () => {
    // Existing providers still work
    expect(googleLogin).toBeDefined();
    expect(credentialsLogin).toBeDefined();
    
    // New provider works
    expect(appleLogin).toBeDefined();
  });
});
```

## 📚 Best Practices (OCP-Focused)

### 1. Always Extend, Never Modify

❌ **Bad** (Modifies existing code):
```typescript
// Modifying existing function
function pickAccessToken(data: any) {
  return data?.accessToken || data?.newToken;  // Changed existing logic
}
```

✅ **Good** (Extends existing code):
```typescript
// Extending without modification
function pickAccessToken(data: any) {
  return (
    data?.accessToken ||   // Existing
    data?.jwt ||           // Existing
    data?.token ||         // Existing
    data?.newToken ||      // NEW: Added here
    undefined
  );
}
```

### 2. Use Mapping Layers

❌ **Bad** (Direct access):
```typescript
// Direct backend field access breaks if backend changes
const provider = res.data.auth_provider;
```

✅ **Good** (Mapping layer):
```typescript
// Mapping layer handles format changes
const provider = res.data.authProvider || res.data.auth_provider;
```

### 3. Configuration Arrays

❌ **Bad** (Hardcoded logic):
```typescript
// Hardcoded conditions make extension difficult
if (path === '/login' || path === '/signup' || path === '/forgot') {
  // ...
}
```

✅ **Good** (Configuration array):
```typescript
// Configuration array allows easy extension
const PUBLIC_PAGES = ['/login', '/signup', '/forgot-password'];
if (PUBLIC_PAGES.includes(path)) {
  // ...
}
```

### 4. Extensible Error Handling

❌ **Bad** (Fixed error handling):
```typescript
// Only handles 401, can't extend
if (error.status === 401) {
  // handle
}
```

✅ **Good** (Extensible error handling):
```typescript
// Can extend for new error types
if (error.status === 401) { /* ... */ }
if (error.status === 403) { /* ... */ }  // NEW: Easy to add
if (error.status === 429) { /* ... */ }  // NEW: Easy to add
```

## 🐛 Contributing

We welcome contributions! If you encounter a bug or have a feature request, please open an issue or submit a pull request.

When contributing, please follow:
- **SOLID principles, especially OCP**: Always extend, never modify
- **TypeScript best practices**: Type safety and proper interfaces
- **Component-based architecture**: Separation of concerns
- **Security-first approach**: Never compromise security for convenience
- **Mapping layers**: Use abstraction layers for backend communication
- **Configuration over code**: Prefer arrays/objects over hardcoded logic

## 🌐 Deployment

Visit our live site: [www.dianaglobal.com.br](https://www.dianaglobal.com.br)

## 📧 Contact

For more information, reach out:

- **Email**: luhmgasparetto@gmail.com
- **LinkedIn**: Luiz Gasparetto
- **GitHub**: [lmgaspa](https://github.com/lmgaspa)

---

**Built with ❤️ following SOLID principles and security best practices**
