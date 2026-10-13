import { z } from "zod";

export const QuestionSchema = z.object({
  prompt: z.string().min(3, "Question prompt is required (min 3 chars)"),
  media_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  correct_answer: z.string().min(1, "Flag / correct answer cannot be empty"),
  points: z.number().int().min(1, "Points must be at least 1").max(10000),
  order_index: z.number().int(),
});

export const CreateEventSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100),
    pin_code: z
      .string()
      .min(4, "PIN code must be at least 4 characters")
      .max(12, "PIN code cannot exceed 12 characters")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "PIN can only contain alphanumeric characters, hyphens, and underscores"
      ),
    start_time: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid start time"),
    end_time: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid end time"),
    questions: z.array(QuestionSchema).min(1, "At least one question is required"),
  })
  .refine((data) => new Date(data.end_time) > new Date(data.start_time), {
    message: "End time must be after start time",
    path: ["end_time"],
  });

export type EventFormValues = z.infer<typeof CreateEventSchema>;
