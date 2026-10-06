import { expect, it, vi } from "vitest";
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => ({ options }),
}));
import { Route } from "@/routes/api/contact";
const post = (
  Route.options as unknown as {
    server: {
      handlers: { POST: (args: { request: Request; context: object }) => Promise<Response> };
    };
  }
).server.handlers.POST;
it("rejects oversized contact bodies without Content-Length", async () => {
  const request = new Request("http://localhost/api/contact", {
    method: "POST",
    body: JSON.stringify({ extra: "x".repeat(9000) }),
  });
  const response = await post({ request, context: {} });
  expect(response.status).toBe(413);
});
it("still accepts normal JSON and quietly drops honeypot submissions", async () => {
  const request = new Request("http://localhost/api/contact", {
    method: "POST",
    body: JSON.stringify({ website: "spam" }),
  });
  const response = await post({ request, context: {} });
  expect(response.status).toBe(200);
});
