import type { NextApiRequest, NextApiResponse } from "next";
import { checkAuth } from "@/actions/login";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const user = await checkAuth();
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    res.status(200).json(user);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error?.message);
    }
    res.status(500).json({ error: "Failed to fetch user data" });
  }
}
