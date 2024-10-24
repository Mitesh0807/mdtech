"use server";
import { z } from "zod";
import { db } from "@/db/connection";
import { users } from "@/db/schema";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { eq } from 'drizzle-orm';

const signupSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }).trim(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .trim(),
});

export async function signup(formData: FormData) {
  const result = signupSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { email, password } = result.data;

  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return { errors: { email: ["Email already in use"] } };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(users).values({
      email,
      password: hashedPassword,
      name: email.split('@')[0],
    });

    redirect("/login");
  } catch (error) {
    console.error('Signup error:', error);
    return {
      errors: {
        form: ["An error occurred during signup. Please try again."]
      }
    };
  }
}