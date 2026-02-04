import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GalleryPage } from './pages/GalleryPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage'
import { CreateEventPage } from './pages/CreateEventPage';
import './styles/global.css';
import { OrganizerPage } from './pages/OrganizerPage';
import { AdminPage } from './pages/AdminPage';
import { ProfilePage } from './pages/ProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<RegisterPage/>} />
        <Route path="/" element={<LoginPage />} />
        <Route path="/events" element={<GalleryPage />} />
        <Route path="/org/anunciar" element={<CreateEventPage />} />
        <Route path="/org" element={<OrganizerPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path='/perfil' element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}