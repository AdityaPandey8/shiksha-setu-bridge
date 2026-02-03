/**
 * StudentLayout Component
 * 
 * A layout wrapper for all student pages that provides:
 * - Consistent layout structure
 * - Persistent components across navigation
 * - Floating chatbot accessible on all student pages
 */

import { Outlet } from 'react-router-dom';
import { OfflineChatbot } from '@/components/OfflineChatbot';

export function StudentLayout() {
  return (
    <>
      <Outlet />
      <OfflineChatbot />
    </>
  );
}

export default StudentLayout;