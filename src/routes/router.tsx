import { createBrowserRouter, Navigate } from 'react-router-dom'
import { GiftProjectPage } from '@/features/gift-project'
import { Home } from '@/features/home'
import { Onboarding } from '@/features/onboarding'
import { PeopleIndexPane, PeopleLayout } from '@/features/people'
import { PersonProfile } from '@/features/profile'
import { RequireOnboarding } from './RequireOnboarding'

export const router = createBrowserRouter([
  { path: '/welcome', element: <Onboarding /> },
  {
    element: <RequireOnboarding />,
    children: [
      { index: true, element: <Home /> },
      {
        path: 'people',
        element: <PeopleLayout />,
        children: [
          { index: true, element: <PeopleIndexPane /> },
          { path: ':personId', element: <PersonProfile /> },
        ],
      },
      { path: 'gifts/:projectId', element: <GiftProjectPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
