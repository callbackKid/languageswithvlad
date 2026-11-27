import './styles.css';
import '@/shared/ui/HomeworkList.css';
import '@/shared/ui/OpenLink.css';
import '@/shared/ui/PdfPages.css';
import '@/shared/ui/Exercise.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { setProgressDoc } from '@/entities/word';
import { getUiStartupError, prepareUiLanguage } from '@/shared/i18n';
import { Button } from '@/shared/ui/controls';

import App from './App';
import { initializeDocumentId } from './model/useDocumentSync';

const root = document.getElementById('root');
if (!root) throw new Error('index.html has no #root element');
const appRoot = createRoot(root);
const docId = initializeDocumentId();
setProgressDoc(docId);

const start = async () => {
  try {
    await prepareUiLanguage();
  } catch {
    const { somethingWrong, tryAgain } = getUiStartupError();
    appRoot.render(
      <main className="page">
        <div className="note err" role="alert">
          <p>{somethingWrong}</p>
          <Button onClick={() => void start()}>{tryAgain}</Button>
        </div>
      </main>
    );
    return;
  }
  appRoot.render(
    <StrictMode>
      <App initialDocId={docId} />
    </StrictMode>
  );
};

void start();
