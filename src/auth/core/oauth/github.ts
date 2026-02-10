import { z } from "zod";

import { OAuthClient } from "./base";
import { env } from "@/env";

export function createGithubOAuthClient() {
  return new OAuthClient({
    provider: "github",
    clientId: env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
    scopes: ["user:email", "read:user"],
    urls: {
      auth: "https://github.com/login/oauth/authorize",
      token: "https://github.com/login/oauth/access_token",
      user: "https://api.github.com/user",
    },
    userInfo: {
      schema: z.object({
        id: z.number(),
        name: z.string().nullable(),
        login: z.string(),
        email: z.email().nullable().optional(),
      }),
      parser: async (user, { accessToken, tokenType }) => {
        let email = user.email;

        if (email == null) {
          console.log("Github email is private, fetching /user/emails...");
          const res = await fetch("https://api.github.com/user/emails", {
            headers: {
              Authorization: `${tokenType} ${accessToken}`,
            },
          });

          const emails = await res.json();

          const primaryEmail = (emails as any[]).find(
            (e) => e.primary && e.verified,
          );

          if (!primaryEmail)
            throw new Error("No verified email found in GitHub account");
          email = primaryEmail.email;
        }
        return {
          id: user.id.toString(),
          name: user.name ?? user.login,
          email: email as string,
        };
      },
    },
  });
}
