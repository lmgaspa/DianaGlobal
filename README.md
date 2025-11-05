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
  authProvider: res.data.auth_provider,  // snake_case → camelCase
  passwordSet: res.data.password_set,    // snake_case → camelCase
};
```
**Benefit**: Backend schema changes only require updating the mapping, not the entire application.

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

## 🐾 Meet Diana

Diana is the beloved cat behind DianaCoin! Her charm and beauty inspired the creation of this meme coin. Follow her journey and enjoy exclusive perks as part of the DianaCoin family.

## 🐛 Contributing

We welcome contributions! If you encounter a bug or have a feature request, please open an issue or submit a pull request.

When contributing, please follow:
- SOLID principles, especially OCP
- TypeScript best practices
- Component-based architecture
- Security-first approach

## 🌐 Deployment

Visit our live site: [www.dianaglobal.com.br](https://www.dianaglobal.com.br)

## 📧 Contact

For more information, reach out:

- **Email**: luhmgasparetto@gmail.com
- **LinkedIn**: Luiz Gasparetto
- **GitHub**: [lmgaspa](https://github.com/lmgaspa)

---

**Built with ❤️ following SOLID principles and security best practices**
