import { Routes, Route } from 'react-router-dom';
import Home from './routes/Home';
import Config from './routes/Config';
import { EventProvider } from './context/EventProvider';
const Root = () => (
    <EventProvider>
        <div className="min-h-screen bg-blue-100 p-6 text-gray-800">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/config/:id" element={<Config />} />
            </Routes>
        </div>
    </EventProvider>
);

export default Root;
