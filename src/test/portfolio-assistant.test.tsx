import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { PortfolioAssistant } from "@/components/portfolio/PortfolioAssistant";
afterEach(cleanup);
it.each([
  ["Tell me about his projects", "Featured projects include"],
  ["What is Aftab studying?", "expects to graduate"],
  ["What is Aftab's email?", "Email:"],
  ["Explain painting", "I don't have that detail"],
])("answers the intended topic for %s", (question, answer) => {
  render(<PortfolioAssistant />);
  fireEvent.click(screen.getByRole("button", { name: "Chat with Aftab's portfolio assistant" }));
  fireEvent.change(screen.getByLabelText("Ask about Aftab"), { target: { value: question } });
  fireEvent.click(screen.getByRole("button", { name: "Send message" }));
  expect(screen.getByText((text) => text.includes(answer))).toBeInTheDocument();
});
