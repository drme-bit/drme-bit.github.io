import { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from '@vercel/speed-insights/react';
import { getRedirectResult } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { SmoothScrolling } from '@/components/layout/SmoothScrolling/SmoothScrolling';
import DrawerMenu from '@/components/layout/DrawerMenu/DrawerMenu';
import LoadingScreen from '@/components/ui/LoadingScreen/LoadingScreen';
import '@/styles/App.scss';

const Main = lazy(() => import('@/pages/Main/Main'));
const ProjectPage = lazy(() => import('@/pages/ProjectPage/ProjectPage'));
const PostsList = lazy(() => import('@/pages/PostsList/PostsList'));
const PostPage = lazy(() => import('@/pages/PostPage/PostPage'));
const NotFound = lazy(() => import('@/pages/NotFound/NotFound'));

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    getRedirectResult(auth).catch((err) => {
      console.error('Redirect result error:', err);
    });
  }, []);

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Analytics />
      <SpeedInsights />
      <DrawerMenu
        open={drawerOpen}
        onToggle={() => setDrawerOpen((v) => !v)}
        onClose={() => setDrawerOpen(false)}
      />
      <Routes>
        <Route
          path="/"
          element={
            <SmoothScrolling>
              <Main />
            </SmoothScrolling>
          }
        />

        <Route
          path="/project/:id"
          element={
            <SmoothScrolling>
              <ProjectPage />
            </SmoothScrolling>
          }
        />

        <Route
          path="/posts"
          element={<PostsList />}
        />

        <Route
          path="/posts/:slug"
          element={<PostPage />}
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}