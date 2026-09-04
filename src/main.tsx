import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initializeGa4 } from './lib/ga4';
import './styles/global.css';

initializeGa4();

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
