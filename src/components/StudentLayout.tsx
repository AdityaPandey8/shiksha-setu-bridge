/**
 * StudentLayout Component
 * 
 * A layout wrapper for all student pages that provides:
 * - Global floating Setu Saarthi chatbot
 * - Consistent layout structure
 * - Persistent components across navigation
 */

import { Outlet } from 'react-router-dom';
import { GlobalSetuSaarthi } from './GlobalSetuSaarthi';

export function StudentLayout() {
  return (
    <>
      <Outlet />
      <GlobalSetuSaarthi />
    </>
  );
}

export default StudentLayout;