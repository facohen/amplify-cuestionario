import { createBrowserRouter, RouterProvider } from "react-router-dom";
import WelcomeScreen from "../screens/WelcomeScreen";
import QuestionnaireScreen from "../screens/QuestionnaireScreen";
import CompletedScreen from "../screens/CompletedScreen";
import InvalidTokenScreen from "../screens/InvalidTokenScreen";
import TermsScreen from "../screens/TermsScreen";
import AdminScreen from "../screens/AdminScreen";

const router = createBrowserRouter([
  {
    path: "/",
    element: <WelcomeScreen />,
  },
  {
    path: "/q/:token",
    element: <QuestionnaireScreen />,
  },
  {
    path: "/completed",
    element: <CompletedScreen />,
  },
  {
    path: "/invalid",
    element: <InvalidTokenScreen />,
  },
  {
    path: "/terms",
    element: <TermsScreen />,
  },
  {
    path: "/admin",
    element: <AdminScreen />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
