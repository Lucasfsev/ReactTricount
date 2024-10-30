import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Root from "./Root.jsx";
import Home from "./routes/Home.jsx";
import './styles/style.css';
import Config from "./routes/Config.jsx";

const router = createBrowserRouter([
    {
        element: <Root />,
        children: [
            {
                path: '/',
                element: <Home />,
            },
            {
                path: '/config/:id',
                element: <Config />,
            }
        ]
    }
]);

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);