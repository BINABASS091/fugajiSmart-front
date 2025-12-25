import { Suspense, lazy } from 'react';
import { ToastProvider } from './components/ui/toast';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';

// Helper to safely resolve default or named exports
const lazyResolve = (importFn: () => Promise<any>, exportName?: string) =>
  lazy(() =>
    importFn().then(mod => {
      // Try to resolve: named export, default export, or first export
      const resolved = exportName
        ? (mod[exportName] || mod.default)
        : (mod.default || Object.values(mod).find(v => typeof v === 'function'));

      if (!resolved) {
        console.error('Failed to resolve lazy import:', {
          exportName,
          availableExports: Object.keys(mod)
        });
        throw new Error(`Lazy import resolved to undefined. Available exports: ${Object.keys(mod).join(', ')}`);
      }
      return { default: resolved };
    })
  );

// Lazy load pages with proper named export handling
const Login = lazyResolve(() => import('./pages/Login'), 'Login');
const Signup = lazyResolve(() => import('./pages/Signup'), 'Signup');

// Lazy load admin pages
const AdminDashboard = lazyResolve(() => import('./pages/admin/AdminDashboard'), 'AdminDashboard');
const FarmersManagement = lazyResolve(() => import('./pages/admin/FarmersManagement'), 'FarmersManagement');
const FarmerDetail = lazyResolve(() => import('./pages/admin/FarmerDetail'), 'FarmerDetail');
const SubscriptionsManagement = lazyResolve(() => import('./pages/admin/SubscriptionsManagement'), 'SubscriptionsManagement');
const RecommendationsManagement = lazyResolve(() => import('./pages/admin/RecommendationsManagement'), 'RecommendationsManagement');
const AlertsManagement = lazyResolve(() => import('./pages/admin/AlertsManagement'), 'AlertsManagement');
const DevicesManagement = lazyResolve(() => import('./pages/admin/DevicesManagement'), 'DevicesManagement');
const AllFarmsManagement = lazyResolve(() => import('./pages/admin/AllFarmsManagement'), 'AllFarmsManagement');
const AllBatchesManagement = lazyResolve(() => import('./pages/admin/AllBatchesManagement'), 'AllBatchesManagement');
const BreedConfigurations = lazyResolve(() => import('./pages/admin/BreedConfigurations'), 'BreedConfigurations');
const Settings = lazyResolve(() => import('./pages/admin/Settings'), 'Settings');

// Lazy load farmer pages
const FarmerDashboard = lazyResolve(() => import('./pages/farmer/FarmerDashboard'), 'FarmerDashboard');
const FarmsManagement = lazyResolve(() => import('./pages/farmer/FarmsManagement'), 'FarmsManagement');
const FarmDetail = lazyResolve(() => import('./pages/farmer/FarmDetail'), 'FarmDetail');
const BatchesManagement = lazyResolve(() => import('./pages/farmer/BatchesManagement'), 'BatchesManagement');
const ActivitiesManagement = lazyResolve(() => import('./pages/farmer/ActivitiesManagement'), 'ActivitiesManagement');
const DiseasePrediction = lazyResolve(() => import('./pages/disease-prediction')); // uses default export
const KnowledgeBase = lazyResolve(() => import('./pages/farmer/KnowledgeBase'), 'KnowledgeBase');
const AlertsPage = lazyResolve(() => import('./pages/farmer/AlertsPage'), 'AlertsPage');
const ProfilePage = lazyResolve(() => import('./pages/farmer/ProfilePage'), 'ProfilePage');
const Subscription = lazyResolve(() => import('./pages/farmer/Subscription')); // uses default export
const InventoryManagement = lazyResolve(() => import('./pages/farmer/InventoryManagement')); // uses default export

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    <span className="sr-only">Loading...</span>
  </div>
);

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  const role = String(user.role || '').toUpperCase();
  return <Navigate to={role === 'ADMIN' ? '/admin' : '/farmer'} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <SubscriptionProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<RootRedirect />} />

              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <DashboardLayout>
                    <AdminDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/farmers" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <DashboardLayout>
                    <FarmersManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/farmers/:id" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <DashboardLayout>
                    <FarmerDetail />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/farms" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <DashboardLayout>
                    <AllFarmsManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/batches" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <DashboardLayout>
                    <AllBatchesManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/devices" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <DashboardLayout>
                    <DevicesManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/subscriptions" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <DashboardLayout>
                    <SubscriptionsManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/recommendations" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <DashboardLayout>
                    <RecommendationsManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/alerts" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <DashboardLayout>
                    <AlertsManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/breeds" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <DashboardLayout>
                    <BreedConfigurations />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/settings" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <DashboardLayout>
                    <Settings />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              {/* Farmer Routes */}
              <Route path="/farmer" element={
                <ProtectedRoute requiredRole="FARMER">
                  <DashboardLayout>
                    <FarmerDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/farmer/farms" element={
                <ProtectedRoute requiredRole="FARMER">
                  <DashboardLayout>
                    <FarmsManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/farmer/farms/:id" element={
                <ProtectedRoute requiredRole="FARMER">
                  <DashboardLayout>
                    <FarmDetail />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/farmer/batches" element={
                <ProtectedRoute requiredRole="FARMER">
                  <DashboardLayout>
                    <BatchesManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/farmer/activities" element={
                <ProtectedRoute requiredRole="FARMER">
                  <DashboardLayout>
                    <ActivitiesManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/disease-prediction" element={
                <ProtectedRoute requiredRole="FARMER">
                  <DashboardLayout>
                    <DiseasePrediction />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/farmer/knowledge" element={
                <ProtectedRoute requiredRole="FARMER">
                  <DashboardLayout>
                    <KnowledgeBase />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/farmer/alerts" element={
                <ProtectedRoute requiredRole="FARMER">
                  <DashboardLayout>
                    <AlertsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/farmer/profile" element={
                <ProtectedRoute requiredRole="FARMER">
                  <DashboardLayout>
                    <ProfilePage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/farmer/subscription" element={
                <ProtectedRoute requiredRole="FARMER">
                  <DashboardLayout>
                    <Subscription />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/farmer/inventory" element={
                <ProtectedRoute requiredRole="FARMER">
                  <DashboardLayout>
                    <InventoryManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
            </Routes>
          </Suspense>
        </SubscriptionProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
