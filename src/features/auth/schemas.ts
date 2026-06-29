import { z } from 'zod';

export const emailSchema = z
  .string()
  .trim()
  .email({ message: 'invalid_email' })
  .max(255);

export const passwordSchema = z
  .string()
  .min(8, { message: 'password_short' })
  .max(72, { message: 'password_long' });

export const nameSchema = z
  .string()
  .trim()
  .min(2, { message: 'name_short' })
  .max(60, { message: 'name_long' });

// E.164-ish phone: leading +, 8-15 digits.
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{7,14}$/, { message: 'invalid_phone' });

export const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, { message: 'invalid_otp' });

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  remember: z.boolean().default(true),
});

export const signUpSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});
