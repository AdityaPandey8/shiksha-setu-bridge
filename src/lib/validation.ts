/**
 * Input Validation Utilities
 * 
 * Provides comprehensive validation for user inputs
 * using Zod schemas for type safety.
 */

import { z } from 'zod';
import { VALIDATION } from '@/constants';

// ============= Base Schemas =============

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(VALIDATION.EMAIL.MAX_LENGTH, `Email must be less than ${VALIDATION.EMAIL.MAX_LENGTH} characters`);

/**
 * Password validation schema
 */
export const passwordSchema = z
  .string()
  .min(VALIDATION.PASSWORD.MIN_LENGTH, `Password must be at least ${VALIDATION.PASSWORD.MIN_LENGTH} characters`)
  .max(VALIDATION.PASSWORD.MAX_LENGTH, `Password must be less than ${VALIDATION.PASSWORD.MAX_LENGTH} characters`);

/**
 * Name validation schema
 */
export const nameSchema = z
  .string()
  .trim()
  .min(VALIDATION.NAME.MIN_LENGTH, `Name must be at least ${VALIDATION.NAME.MIN_LENGTH} characters`)
  .max(VALIDATION.NAME.MAX_LENGTH, `Name must be less than ${VALIDATION.NAME.MAX_LENGTH} characters`);

// ============= Auth Schemas =============

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/**
 * Signup form validation schema
 */
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: passwordSchema,
  fullName: nameSchema,
  role: z.enum(['student', 'teacher', 'admin']),
  class: z.string().optional(),
  language: z.enum(['hindi', 'english']).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/**
 * Password change form validation schema
 */
export const passwordChangeSchema = z.object({
  newPassword: passwordSchema,
  confirmPassword: passwordSchema,
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// ============= Content Schemas =============

/**
 * URL validation schema with protocol check
 */
export const urlSchema = z
  .string()
  .trim()
  .max(VALIDATION.CONTENT.URL_MAX, 'URL is too long')
  .refine(
    (url) => {
      if (!url) return true;
      try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    { message: 'Please enter a valid URL (starting with http:// or https://)' }
  )
  .optional()
  .or(z.literal(''));

/**
 * Content creation/edit form validation schema
 */
export const contentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(VALIDATION.CONTENT.TITLE_MAX, `Title must be less than ${VALIDATION.CONTENT.TITLE_MAX} characters`),
  description: z
    .string()
    .trim()
    .max(VALIDATION.CONTENT.DESCRIPTION_MAX, `Description must be less than ${VALIDATION.CONTENT.DESCRIPTION_MAX} characters`)
    .optional()
    .or(z.literal('')),
  content_type: z.enum(['video', 'article', 'pdf', 'image']),
  class: z.string().min(1, 'Class is required'),
  language: z.enum(['hindi', 'english']),
  url: urlSchema,
  article_body: z
    .string()
    .max(VALIDATION.CONTENT.ARTICLE_BODY_MAX, 'Article content is too long')
    .optional()
    .or(z.literal('')),
  image_url: urlSchema,
});

/**
 * Quiz creation validation schema
 */
export const quizSchema = z.object({
  question: z
    .string()
    .trim()
    .min(5, 'Question must be at least 5 characters')
    .max(500, 'Question must be less than 500 characters'),
  options: z
    .array(z.string().trim().min(1, 'Option cannot be empty'))
    .min(2, 'At least 2 options are required')
    .max(6, 'Maximum 6 options allowed'),
  correct_answer: z.number().min(0, 'Please select the correct answer'),
  class: z.string().min(1, 'Class is required'),
  language: z.enum(['hindi', 'english']),
});

/**
 * Ebook creation validation schema
 */
export const ebookSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  subject: z
    .string()
    .trim()
    .min(1, 'Subject is required')
    .max(100, 'Subject must be less than 100 characters'),
  description: z
    .string()
    .trim()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  class: z.string().min(1, 'Class is required'),
  language: z.enum(['hindi', 'english']),
  pdf_url: z.string().url('Please enter a valid PDF URL'),
});

// ============= Validation Helper Functions =============

/**
 * Validates data against a schema and returns structured errors
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Object with success status, data, and errors
 */
export function validateForm<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): { success: boolean; data: z.infer<T> | null; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data, errors: {} };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = err.message;
    }
  });
  
  return { success: false, data: null, errors };
}

/**
 * Simple validation for a single field
 */
export function validateField<T extends z.ZodSchema>(
  schema: T,
  value: unknown
): { valid: boolean; error: string | null } {
  const result = schema.safeParse(value);
  
  if (result.success) {
    return { valid: true, error: null };
  }
  
  return { valid: false, error: result.error.errors[0]?.message || 'Invalid input' };
}
