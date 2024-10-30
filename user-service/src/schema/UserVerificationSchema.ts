import z from 'zod';

export const userVerificationSchema = z.object({
    email: z.string().email(),
    verificationCode: z.string().min(6).max(6)
})