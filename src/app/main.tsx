import './styles.css';
import '@/shared/ui/HomeworkList.css';
import '@/shared/ui/OpenLink.css';
import '@/shared/ui/PdfPages.css';
import '@/shared/ui/Exercise.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { setProgressDoc } from '@/entities/word';

import App from './App';
import { initializeDocumentId } from './model/useDocumentSync';

const root = document.getElementById('root');
if (!root) throw new Error('index.html has no #root element');
const docId = initializeDocumentId();
setProgressDoc(docId);

createRoot(root).render(
  <StrictMode>
    <App initialDocId={docId} />
  </StrictMode>
);
