/**
 * StudentLayout Component
 * 
 * A layout wrapper for all student pages that provides:
 * - Consistent layout structure
 * - Persistent components across navigation
 */

import { Outlet } from 'react-router-dom';

export function StudentLayout() {
  return <Outlet />;
}

export default StudentLayout;