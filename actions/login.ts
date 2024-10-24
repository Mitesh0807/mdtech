"use server";
import { z } from "zod";
import { createSession, decrypt, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/db/connection";
import { users } from "@/db/schema";
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }).trim().toLowerCase(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .trim(),
});

export async function login(formData: FormData) {
  try {
    const result = loginSchema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return {
        errors: result.error.flatten().fieldErrors,
      };
    }

    const { email, password } = result.data;

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
      columns: {
        id: true,
        email: true,
        password: true,
        name: true,
      },
    });

    if (!user) {
      return { errors: { email: ["Invalid email or password"] } };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return { errors: { email: ["Invalid email or password"] } };
    }


    await createSession(user.id.toString());


    redirect("/dashboard");
  } catch (error) {
    console.error('Login error:', error);
    return {
      errors: {
        _form: ["An error occurred during login. Please try again."]
      }
    };
  }
}

export async function logout() {
  try {
    await deleteSession();
    redirect("/login");
  } catch (error) {
    console.error('Logout error:', error);
    redirect("/login");
  }
}

export async function checkAuth() {
  try {
    const session = await decrypt();
    if (!session) {
      redirect("/login");
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, Number(session.userId)),
      columns: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      await deleteSession();
      redirect("/login");
    }

    return user;
  } catch (error) {
    await deleteSession();
    redirect("/login");
  }
}