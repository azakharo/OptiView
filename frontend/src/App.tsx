import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {GalleryPage} from './pages/GalleryPage';

// Placeholder for future upload page
function UploadPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Upload Page</h1>
      <p className="text-gray-600">
        Upload feature will be implemented in Stage 6
      </p>
    </div>
  );
}

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
