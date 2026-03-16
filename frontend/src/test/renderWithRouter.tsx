import {render} from '@testing-library/react';
import {BrowserRouter} from 'react-router-dom';
import type {ReactElement} from 'react';

/**
 * Wrapper component that provides React Router context for testing
 */
// eslint-disable-next-line react-refresh/only-export-components
const RouterWrapper = ({children}: {children: React.ReactNode}) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

/**
 * Render a component with React Router context
 * Use this instead of @testing-library/react's render for components
 * that use react-router-dom hooks (useNavigate, useLocation, etc.)
 */
export const renderWithRouter = (component: ReactElement) => {
  return render(component, {wrapper: RouterWrapper});
};
