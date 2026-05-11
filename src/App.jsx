import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Providers from "@/components/Providers";
import RouteFallback from "@/components/RouteFallback";

const HomePage = lazy(() => import("@/pages/HomePage"));
const BlogPage = lazy(() => import("@/pages/BlogPage"));
const BlogPostPage = lazy(() => import("@/pages/BlogPostPage"));
const ProjectsPage = lazy(() => import("@/pages/ProjectsPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const UpdateVlogPage = lazy(() => import("@/pages/UpdateVlogPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

function SiteLayout() {
  return (
    <Providers>
      <Header />
      <div className="mx-auto flex max-w-3xl flex-col px-8">
        <main className="grow">
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <Footer />
    </Providers>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <SiteLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "projects", element: <ProjectsPage /> },
      { path: "blog", element: <BlogPage /> },
      { path: "blog/:slug", element: <BlogPostPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "privacy", element: <PrivacyPage /> },
      { path: "update-vlog", element: <UpdateVlogPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
