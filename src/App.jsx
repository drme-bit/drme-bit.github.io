import { Routes, Route } from 'react-router-dom';
import Main from './pages/Main/Main';
import ProjectPage from './pages/ProjectPage/ProjectPage';
import { SmoothScrolling } from '@/components/layout/SmoothScrolling/SmoothScrolling';
import './styles/App.scss';

export default function App() {
  return (
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
  );
}