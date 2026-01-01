import { z } from 'zod';

export const imageSchema = z.object({
  model: z.string().min(1, { message: 'Please select a model' }),
  prompt: z
    .string()
    .min(3, { message: 'Prompt must be at least 3 characters long' })
    .max(1000, {
      message: 'Prompt must be less than 1000 characters',
    })
    .trim(),
  aspectRatio: z
    .string()
    .min(1, { message: 'Please select an aspect ratio' }),
  characterImageUrl: z
    .string()
    .url('Please enter a valid url')
    .optional(),
  objectImageUrl: z
    .string()
    .url('Please enter a valid url')
    .optional(),
});

export type ImageSchema = z.infer<typeof imageSchema>;
