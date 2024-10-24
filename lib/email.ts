"use server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
console.log(process.env.RESEND_API_KEY, "RESEND_API_KEY");
interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  console.log(to, subject, text, html, "to,suject,text,html");
  try {
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to,
      subject,
      text,
      react: html || text,
    });
    console.log(data, "data");
    if (error instanceof Error) {
      console.log(error.message);
    }
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
}
