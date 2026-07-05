import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { SmoothScrolling } from '@/components/layout/SmoothScrolling/SmoothScrolling';
import LoadingScreen from '@/components/ui/LoadingScreen/LoadingScreen';
import './styles/App.scss';

const Main = lazy(() => import('./pages/Main/Main'));
const ProjectPage = lazy(() => import('./pages/ProjectPage/ProjectPage'));

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
    <Routes>
      <Route
        path="/"
        element={
          <SmoothScrolling>
            <Main />
          </SmoothScrolling>
        }
      />

      <Route path="/project/:id" element={
        <SmoothScrolling>
          <ProjectPage />
        </SmoothScrolling>
      } />
    </Routes>
    </Suspense>
  );
}