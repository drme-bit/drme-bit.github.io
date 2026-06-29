import Main from './pages/Main/Main';
import { SmoothScrolling } from '@/components/layout/SmoothScrolling/SmoothScrolling';
import './styles/App.scss';

export default function App() {
  return (
    <SmoothScrolling>
      <Main />
    </SmoothScrolling>
  );
}
