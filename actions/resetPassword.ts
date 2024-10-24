"use server";
import { z } from "zod";
import { db } from "@/db/connection";
import { users } from "@/db/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

const resetPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }).trim(),
  oldPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .trim(),
  newPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .trim(),
});

export async function resetPassword(formData: FormData) {
  const result = resetPasswordSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { email, oldPassword, newPassword } = result.data;

  // Find user by email
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return { errors: { email: ["User not found"] } };
  }

  // Verify old password
  const passwordMatch = await bcrypt.compare(oldPassword, user.password);

  if (!passwordMatch) {
    return { errors: { oldPassword: ["Current password is incorrect"] } };
  }

  // Hash and update new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.email, email));

  return { message: "Password reset successfully" };
}
