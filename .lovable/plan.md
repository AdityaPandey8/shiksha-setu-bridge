
# Floating Chatbot on All Student Pages & Fix Teacher Dashboard Issues

## Summary
This plan addresses two main issues:
1. Make the floating chatbot appear on **every student page** (not just dashboard)
2. Fix "Add Learning Content" and "E-Book" functionality on Teacher Dashboard

---

## Problem Analysis

### Issue 1: Chatbot Only on Dashboard
Currently, `OfflineChatbot` is rendered only in `StudentDashboard.tsx`. The `StudentLayout` component is empty (just renders `<Outlet />`), so the chatbot disappears when students navigate to E-Books, Content, Quizzes, etc.

### Issue 2: Teacher Content/E-Book Not Working
The forms work correctly BUT require:
- Teacher must have **subject allocation from Admin** (via Admin Dashboard > Manage Teachers > Edit)
- If no allocation exists, the subject dropdown shows "No subjects allocated" and forms are blocked
- This is by design but may confuse teachers who haven't been allocated

---

## Solution

### Part 1: Floating Chatbot on All Student Pages

**File: `src/components/StudentLayout.tsx`**

Transform the layout to include the floating chatbot:

```
Before:
export function StudentLayout() {
  return <Outlet />;
}

After:
export function StudentLayout() {
  return (
    <>
      <Outlet />
      <OfflineChatbot />
    </>
  );
}
```

Then **remove** the `<OfflineChatbot />` from `StudentDashboard.tsx` to avoid duplicates.

---

### Part 2: Fix Teacher Dashboard Issues

**2A. Improve Error Messaging**

Add a clear alert banner when teacher has no allocation, explaining what to do:

```tsx
{!allocationLoading && allocation?.subjects.length === 0 && (
  <Alert className="mb-4 border-amber-500/50 bg-amber-50">
    <AlertTriangle className="h-4 w-4 text-amber-600" />
    <AlertDescription>
      You have no subjects allocated yet. Please contact your admin 
      to get assigned subjects, classes, and languages before adding content.
    </AlertDescription>
  </Alert>
)}
```

**2B. Fix Quiz Form Subject Dropdown**

The quiz form is missing subject restriction. Add subject dropdown to quiz form (similar to content form):

```tsx
// Add subject state: quizSubject
// Add subject dropdown in quiz form
// Add validation in handleAddQuiz
```

**2C. Fix EbookManager (Interactive E-Books)**

The `EbookManager` component doesn't have teacher allocation restrictions. This allows teachers to create ebooks for any subject. Add allocation restrictions.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/StudentLayout.tsx` | Add `OfflineChatbot` component for all student pages |
| `src/pages/StudentDashboard.tsx` | Remove duplicate `<OfflineChatbot />` |
| `src/pages/TeacherDashboard.tsx` | Add allocation warning alert, fix quiz form subject dropdown |
| `src/components/EbookManager.tsx` | Add teacher allocation restrictions |

---

## Technical Implementation Details

### StudentLayout.tsx Changes
- Import `OfflineChatbot` component
- Wrap `Outlet` with Fragment and add `OfflineChatbot` at the end
- This ensures chatbot appears on all nested routes: /student/ebooks, /student/content, /student/quizzes, etc.

### TeacherDashboard.tsx Changes
1. Add allocation warning alert before the Tabs component
2. The quiz form currently uses hardcoded class dropdown (6-10) - change to use `allocation?.classes`
3. Add subject dropdown to quiz form (similar to content form)
4. Add validation in `handleAddQuiz` to check subject against allocation

### EbookManager.tsx Changes
1. Import `useTeacherAllocation` and `useSubjects` hooks
2. Add subject dropdown restricted to allocated subjects
3. Add validation before save

---

## Expected Behavior After Fix

1. **Students**: Floating chatbot button (bottom-right) visible on ALL pages - Dashboard, E-Books, Content, Quizzes, Career, Study Tools
2. **Teachers**: 
   - Clear warning if no allocation exists
   - Subject dropdowns only show allocated subjects
   - Forms work immediately when teacher has proper allocation
3. **Admins**: No changes needed
