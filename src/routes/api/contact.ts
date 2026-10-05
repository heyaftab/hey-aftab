import { createFileRoute } from "@tanstack/react-router";

const INBOX = "aftabuddinahmad26@gmail.com";
const RESEND_ENDPOINT = "https://api.resend.com/emails";

function jsonError(error: string, status: number) {
  return Response.json({ error }, { status });
}

export const Route = createFileRoute("/api/contact")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        const origin = request.headers.get("origin");
        if (origin && new URL(origin).origin !== new URL(request.url).origin) {
          return jsonError("invalid_origin", 403);
        }

        const contentLength = Number(request.headers.get("content-length") ?? 0);
        if (contentLength > 8_192) return jsonError("request_too_large", 413);

        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return jsonError("invalid_request", 400);
        }

        if (!payload || typeof payload !== "object") return jsonError("invalid_request", 400);
        const form = payload as Record<string, unknown>;
        const name = typeof form.name === "string" ? form.name.trim() : "";
        const email = typeof form.email === "string" ? form.email.trim() : "";
        const message = typeof form.message === "string" ? form.message.trim() : "";

        // Quietly accept honeypot submissions without forwarding spam.
        if (typeof form["website"] === "string" && form["website"].trim()) {
          return Response.json({ ok: true });
        }

        if (name.length < 2 || name.length > 120) return jsonError("invalid_name", 400);
        if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return jsonError("invalid_email", 400);
        }
        if (message.length < 10 || message.length > 2_000) return jsonError("invalid_message", 400);

        const environment = context.cloudflareEnv as { RESEND_API_KEY?: string } | undefined;
        const apiKey = environment?.RESEND_API_KEY;
        if (!apiKey) return jsonError("email_not_configured", 503);

        try {
          const delivery = await fetch(RESEND_ENDPOINT, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Aftab Portfolio <onboarding@resend.dev>",
              to: [INBOX],
              reply_to: email,
              subject: "New message from your portfolio",
              text: `From: ${name}\nReply to: ${email}\n\n${message}`,
            }),
          });

          if (!delivery.ok) {
            console.error("Portfolio email provider rejected the message", delivery.status);
            return jsonError("delivery_failed", 502);
          }

          return Response.json({ ok: true });
        } catch (error) {
          console.error("Portfolio email delivery failed", error);
          return jsonError("delivery_failed", 502);
        }
      },
    },
  },
});
