import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import LogoOnlyLayout from './layouts/LogoOnlyLayout';
//
import Blog from './pages/Blog';
import User from './pages/User';
import Login from './pages/Login';
import NotFound from './pages/Page404';
import Register from './pages/Register';
import Products from './pages/Products';
import DashboardApp from './pages/DashboardApp';
import { useContext } from 'react';
import { GlobalContext } from './GlobalContext/GlobalContext';
import Cookies from 'js-cookie'
import Shops from './pages/Shops';
import Orders from './pages/Orders';

// ----------------------------------------------------------------------

export default function Router() {
  const { user } = useContext(GlobalContext)
  return useRoutes([
    {
      path: '/dashboard',
      element: <DashboardLayout />,
      children: [
        { path: 'app', element: <DashboardApp /> },
        { path: 'vendors', element: <User /> },
        // { path: 'products', element: <Products /> },
        { path: 'blog', element: <Blog /> },
        { path: 'shops', element: <Shops /> },
        { path: 'shops/:id', element: <Products /> },
        { path: 'orders', element: <Orders /> },
       ],
    },
    {
      path: 'login',
      element: <Login />,
    },
    {
      path: 'register',
      element: <Register />,
    },
    {
      path: '/',
      element: <LogoOnlyLayout />,
      children: [
        { path: '/', element: <Navigate to={Cookies.get('admin_token')?'/dashboard':'login'} /> },
        { path: '404', element: <NotFound /> },
        { path: '*', element: <Navigate to="/404" /> },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);
}
