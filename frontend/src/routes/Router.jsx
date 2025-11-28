import { lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router';
import Loadable from 'src/layouts/full/shared/loadable/Loadable';
import RequireAuth from '../components/protection/RequireAuth';
import RedirectIfAuthenticated from '../components/protection/RedirectIfAuthenticated';
import RequireAdmin from '../components/protection/RequiereAdmin';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

// Authentication
const Login = Loadable(lazy(() => import('../views/auth/login/Login')));

// Error page
const Error = Loadable(lazy(() => import('../views/error/Error')));

// General
const Home = Loadable(lazy(() => import('../views/home/Home')));
const Profile = Loadable(lazy(() => import('../views/profile/Profile')));
const Materials = Loadable(lazy(() => import('../views/materials/Materials')));
const Users = Loadable(lazy(() => import('../views/users/Users')));
const Customers = Loadable(lazy(() => import('../views/customers/Customers')));
const Suppliers = Loadable(lazy(() => import('../views/suppliers/Suppliers')));
const Warehouses = Loadable(lazy(() => import('../views/warehouses/Warehouses')));
const Constructions = Loadable(lazy(() => import('../views/constructions/Constructions')));
const CrewMembers = Loadable(lazy(() => import('../views/crew-members/CrewMembers')));
const Crews = Loadable(lazy(() => import('../views/crews/Crews')));
const Units = Loadable(lazy(() => import('../views/units/Units')));
const Movements = Loadable(lazy(() => import('../views/movements/Movements')));
const Stocks = Loadable(lazy(() => import('../views/stocks/Stocks')));
const StockHistorical = Loadable(lazy(() => import('../views/stocks-historical/StocksHistorical')));
const StockControl = Loadable(lazy(() => import('../views/stocks-control/StocksControl')));

const Router = [
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <FullLayout />,
        children: [
          { path: '/', exact: true, element: <Home /> },
          { path: '/profile', exact: true, element: <Profile /> },
          { path: '/materials', exact: true, element: <Materials /> },
          {
            path: '/users',
            element: <RequireAdmin />,
            children: [
              { index: true, element: <Users /> }
            ]
          },
          {
            path: '/customers',
            element: <RequireAdmin />,
            children: [
              { index: true, element: <Customers /> }
            ]
          },
          { path: '/suppliers', exact: true, element: <Suppliers /> },
          { path: '/warehouses', exact: true, element: <Warehouses /> },
          { path: '/constructions', exact: true, element: <Constructions /> },
          { path: '/crew-members', exact: true, element: <CrewMembers /> },
          { path: '/crews', exact: true, element: <Crews /> },
          { path: '/units', exact: true, element: <Units /> },
          { path: '/movements', exact: true, element: <Movements /> },
          { path: '/stocks', exact: true, element: <Stocks /> },
          { path: '/stocks-historical', exact: true, element: <StockHistorical /> },
          { path: '/stocks-control', exact: true, element: <StockControl /> }
        ],
      },
    ],
  },
  {
    element: <RedirectIfAuthenticated />,
    children: [
      {
        path: '/',
        element: <BlankLayout />,
        children: [
          { path: '/auth/login', element: <Login /> },
        ],
      },
    ],
  },
  { path: '/404', element: <Error /> },
  { path: '*', element: <Navigate to="/404" /> },
];

const router = createBrowserRouter(Router, { basename: '/' });
export default router;