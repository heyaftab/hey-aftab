import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { PortfolioAssistant } from "@/components/portfolio/PortfolioAssistant";
afterEach(cleanup);
it.each([
  ["Tell me about his projects", "Featured projects include"],
  ["What is Aftab studying?", "expects to graduate"],
  ["What is Aftab's email?", "Email:"],
  ["Explain painting", "I don't have that detail"],
])("answers the intended topic for %s", async (question, answer) => {
  render(<PortfolioAssistant />);
  fireEvent.click(screen.getByRole("button", { name: "Chat with Aftab's portfolio assistant" }));
  fireEvent.change(screen.getByLabelText("Ask about Aftab"), { target: { value: question } });
  fireEvent.click(screen.getByRole("button", { name: "Send message" }));
  expect(await screen.findByText((text) => text.includes(answer), {}, { timeout: 2000 })).toBeInTheDocument();
});

it.each([
  ["Does he know Docker?", "Docker"],
  ["Which databases does he use?", "MySQL"],
  ["What awards has he won?", "third"],
])("understands rephrased question %s", async (question, answer) => {
  render(<PortfolioAssistant />);
  fireEvent.click(screen.getByRole("button", { name: "Chat with Aftab's portfolio assistant" }));
  fireEvent.change(screen.getByLabelText("Ask about Aftab"), { target: { value: question } });
  fireEvent.click(screen.getByRole("button", { name: "Send message" }));
  expect(await screen.findByText((text) => text.includes(answer), {}, { timeout: 2000 })).toBeInTheDocument();
});
