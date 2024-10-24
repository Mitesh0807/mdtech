"use client";
import { resetPassword } from "@/actions/resetPassword";

export default function ResetPasswordPage() {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await resetPassword(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" placeholder="Email" required />
      <input
        type="password"
        name="newPassword"
        placeholder="New Password"
        required
      />
      <button type="submit">Reset Password</button>
    </form>
  );
}
