import z from "zod";

export const PostCreationSchema = z.object({
    title: z.string().min(3).max(20),
    content: z.string().min(3).max(200),
})