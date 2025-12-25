import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { AlertCircle, Mail, Loader2, LogIn } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { authApi } from '../lib/api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export function Login() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const normalizeRole = (value: any): 'ADMIN' | 'FARMER' => {
    const upper = String(value || '').toUpperCase();
    return upper === 'ADMIN' ? 'ADMIN' : 'FARMER';
  };

  // Handle redirect after successful authentication
  useEffect(() => {
    console.log('Auth state updated:', {
      hasUser: !!user,
      user,
      loading,
      currentPath: window.location.pathname
    });

    const checkAuthAndRedirect = async () => {
      if (!user || loading) return;

      console.log('Checking auth and redirecting...');

      // Try to get role from multiple sources and normalize safely
      let role = normalizeRole(user?.role || localStorage.getItem('userRole') || '');

      // Role is already in user object from AuthContext

      // Default to FARMER if no role is found
      const finalRole = normalizeRole(role || 'FARMER');

      console.log('Auth check complete:', {
        hasUser: !!user,
        finalRole,
        currentPath: window.location.pathname
      });

      // Only redirect if we're still on the login page
      if (window.location.pathname === '/login') {
        const targetPath = finalRole === 'ADMIN' ? '/admin' : '/farmer';
        console.log(`Redirecting to: ${targetPath}`);
        navigate(targetPath, { replace: true });
      }
    };

    checkAuthAndRedirect();
  }, [user, loading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('Login attempt started for:', email);

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      console.log('Sign in successful');

      // Show loading state for a better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      // The useEffect should handle the redirection, but we'll add a fallback
      const checkAndNavigate = (attempts = 0) => {
        if (attempts > 10) {
          console.warn('Redirection timeout, forcing navigation...');
          const finalRole = normalizeRole(user?.role || localStorage.getItem('userRole') || 'FARMER');
          navigate(finalRole === 'ADMIN' ? '/admin' : '/farmer', { replace: true });
          return;
        }

        if (window.location.pathname === '/login') {
          console.log('Still on login page, checking again...', { attempt: attempts + 1 });
          setTimeout(() => checkAndNavigate(attempts + 1), 500);
        }
      };

      checkAndNavigate();

    } catch (err: any) {
      console.error('Login error:', err);
      if (err.message === 'FARMER_NOT_VERIFIED') {
        setError(t('auth.notVerified') || 'Your account is not yet verified. Please contact support.');
      } else if (err.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(err.message || 'Failed to sign in. Please try again later.');
      }
      setLoading(false);
    }
  };

  // Google Login Hook
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        // The hook returns an access_token, but for backend verification we usually want an id_token.
        // However, useGoogleLogin defaults to implicit flow (access_token).
        // To get id_token, we can use flow: 'auth-code' or just verify the access_token on backend 
        // OR better, switch to the component <GoogleLogin> which gives credential (id_token).
        // BUT, for custom button style, useGoogleLogin is better. 
        // We can request 'id_token' if we use the 'implicit' flow carefully or just use the user info endpoint on backend.

        // Actually, the simplest way for a custom button with useGoogleLogin 
        // is to send the access_token to the backend, and let backend fetch user info from Google.
        // OR we can use the credential response if we use the <GoogleLogin> component (rendered by Google).

        // Let's stick to useGoogleLogin and fetch the user info in the frontend then send to backend? NO, unsafe.
        // Let's change the flow to get an verify the token.

        // Wait, standard practice with DRF/simplejwt/google is often sending the access_token.
        // My backend implementation uses `id_token.verify_oauth2_token(token, ...)` which expects an ID Token.
        // `useGoogleLogin` generally returns an access_token unless we ask for id_token (which OIDC does).
        // Actually, let's use the `onSuccess` callback which receives a `TokenResponse`.

        // Correction: useGoogleLogin by default gives an access_token. 
        // To getting an ID Token for backend verification is trickier with the hook if we want a custom button
        // without managing the OIDC flow manually.

        // Alternative: Use the implicit flow to get an id_token directly?
        // Or change backend to verify access_token (via https://www.googleapis.com/oauth2/v3/userinfo).

        // Let's ADJUST THE BACKEND implementation plan? No, I already wrote the backend to expect an ID Token.
        // So I need an ID Token.
        // useGoogleLogin with flow: 'implicit' does not return id_token in the response object by default in the new library?
        // documentation says: "If you need an id_token... use the <GoogleLogin> component... OR use flow: 'implicit' ... but checking docs..."

        // Let's use the property `flow: 'implicit'` (default) but the response usually just has access_token.
        // Actually, checking @react-oauth/google docs, `useGoogleLogin` is for Authorization Code flow (default) or Implicit.
        // If I want an ID Token with a custom button, I might need to use the `onSuccess` to call a Google API to get user info?
        // NO, that defeats the purpose of backend verification.

        // Plan B: Update backend to accept access_token and verify it by calling Google UserInfo endpoint.
        // That is actually more robust for the `useGoogleLogin` hook users.

        // MODIFYING FRONTEND TO SEND ACCESS_TOKEN, AND I WILL MODIFY BACKEND TO VERIFY IT.
        // It's safer to stick to what I can easily do.

        const { access_token } = tokenResponse;

        // Send access_token to backend
        const { data, error } = await authApi.googleLogin(access_token);

        if (error) throw new Error(error);
        if (data) {
          // Success! 
          // Ideally backend sets cookies.
          // We refresh the user context to get the new user.
          await refreshUser();
          setLoading(false);
          // The useEffect hook watching 'user' will handle the redirection.
        }
      } catch (err: any) {
        console.error('Google login error:', err);
        setError(err.message || 'Google login failed');
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google login failed');
      setLoading(false);
    }
  });

  const handleGoogle = () => {
    setError('');
    loginWithGoogle();
  };

  const handleResend = async () => {
    if (!email) return;
    // TODO: Implement resend verification with Supabase
    setError('Resend verification not yet implemented');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <img
                src="https://res.cloudinary.com/diyy8h0d9/image/upload/v1759477181/WhatsApp_Image_2025-09-10_at_10.41.48_AM_klrrtu.jpg"
                alt="FugajiPro Logo"
                className="w-40 h-auto mx-auto rounded-xl object-contain shadow-md"
              />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">Sign in to manage your poultry farm</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email Address
              </Label>
              <div className="relative mt-1.5">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="pl-10 h-11"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="mt-1.5 h-11"
                placeholder="Enter your password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full h-11 border-gray-300 hover:bg-gray-50"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </Button>

          {/* Footer Links */}
          <div className="mt-8 space-y-3 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-green-600 hover:text-green-700 font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
