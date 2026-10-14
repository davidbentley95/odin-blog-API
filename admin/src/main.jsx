import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, redirect, RouterProvider } from 'react-router-dom';
import { getToken } from './api.js';
import Layout from './Layout.jsx';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';
import PostEditor from './PostEditor.jsx';
import './styles.css';

const requireToken = () => (getToken() ? null : redirect('/login'));

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    element: <Layout />,
    loader: requireToken,
    children: [
      { path: '/', element: <Dashboard /> },
      { path: '/posts/new', element: <PostEditor /> },
      { path: '/posts/:postId', element: <PostEditor /> },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
