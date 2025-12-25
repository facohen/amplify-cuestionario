import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoadingSpinner from "../components/ui/LoadingSpinner";

// Lazy load screens for code splitting
const WelcomeScreen = lazy(() => import("../screens/WelcomeScreen"));
const QuestionnaireScreen = lazy(() => import("../screens/QuestionnaireScreen"));
const CompletedScreen = lazy(() => import("../screens/CompletedScreen"));
const InvalidTokenScreen = lazy(() => import("../screens/InvalidTokenScreen"));
const TermsScreen = lazy(() => import("../screens/TermsScreen"));
const AdminScreen = lazy(() => import("../screens/AdminScreen"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoadingSpinner size="lg" />
    </div>
  );
}

function withSuspense(Component: React.ComponentType) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

function AssistedQuestionnaireScreen() {
  return <QuestionnaireScreen assistedMode={true} />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: withSuspense(WelcomeScreen),
  },
  {
    path: "/q/:token",
    element: withSuspense(QuestionnaireScreen),
  },
  {
    path: "/completed",
    element: withSuspense(CompletedScreen),
  },
  {
    path: "/invalid",
    element: withSuspense(InvalidTokenScreen),
  },
  {
    path: "/terms",
    element: withSuspense(TermsScreen),
  },
  {
    path: "/admin",
    element: withSuspense(AdminScreen),
  },
  {
    path: "/asistida/:token",
    element: withSuspense(AssistedQuestionnaireScreen),
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
