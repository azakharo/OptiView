import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {GalleryPage} from './pages/GalleryPage';
import {UploadPage} from './pages/UploadPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GalleryPage />} />
        <Route path="/upload" element={<UploadPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
