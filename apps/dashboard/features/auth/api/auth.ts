import { createAuthClient } from "@mono-repo-template/auth";

export async function getCurrentUser() {
  try {
    const user = createAuthClient;
  } catch (error) {
    throw new Error("Failed to get current user");
  }
}
