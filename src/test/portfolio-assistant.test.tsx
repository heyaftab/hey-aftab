import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { PortfolioAssistant } from "@/components/portfolio/PortfolioAssistant";
import { renderAssistantMarkdown } from "@/components/portfolio/assistant-markdown";
afterEach(cleanup);
it("renders the chat toggle with an accessible ELI label", () => {
  render(<PortfolioAssistant />);
  const launcher = screen.getByRole("button", { name: "Chat with ELI" });
  expect(launcher.querySelector("svg")).toBeInTheDocument();
});

it("shows the site logo in the assistant panel", () => {
  render(<PortfolioAssistant />);
  fireEvent.click(screen.getByRole("button", { name: "Chat with ELI" }));
  const panel = screen.getByRole("region", { name: "ELI assistant" });
  expect(screen.getByRole("heading", { name: "ELI" })).toBeInTheDocument();
  expect(panel.querySelector("header img")).toHaveAttribute("src", "/assets/site-logo.png");
  expect(screen.getByText("Aftab's AI assistant")).toBeInTheDocument();
  expect(screen.getByRole("img", { name: "Online" })).toBeInTheDocument();
  expect(
    screen.getByText("AI can make mistakes. Contact Aftab directly for anything important."),
  ).toBeInTheDocument();
});

it("renders safe bold text, lists, and links in assistant markdown", () => {
  const content = renderAssistantMarkdown(
    "**Highlights**\n- First\n- [Portfolio](https://example.com)\n\nSee https://example.org",
  );
  render(<div>{content}</div>);
  expect(screen.getByText("Highlights").tagName).toBe("STRONG");
  expect(screen.getByRole("list").children).toHaveLength(2);
  expect(screen.getByRole("link", { name: "Portfolio" })).toHaveAttribute(
    "href",
    "https://example.com/",
  );
  expect(screen.getByRole("link", { name: "https://example.org" })).toHaveAttribute(
    "href",
    "https://example.org/",
  );
  cleanup();

  render(<div>{renderAssistantMarkdown("[Unsafe](javascript:alert(1))")}</div>);
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
});

it("sends on Enter and preserves newlines with Shift+Enter", () => {
  render(<PortfolioAssistant />);
  fireEvent.click(screen.getByRole("button", { name: "Chat with ELI" }));
  const input = screen.getByRole("textbox", { name: "Ask ELI about Aftab" });
  fireEvent.change(input, { target: { value: "Tell me about his projects" } });
  fireEvent.keyDown(input, { key: "Enter", shiftKey: true });
  expect(input).toHaveValue("Tell me about his projects");
  fireEvent.keyDown(input, { key: "Enter" });
  expect(document.querySelector(".eli-user-bubble")?.textContent).toBe(
    "Tell me about his projects",
  );
  expect(input).toHaveValue("");
  expect(screen.queryByText("Try asking")).not.toBeInTheDocument();
});

it.each([
  ["Tell me about his projects", "Featured projects include"],
  ["What is Aftab studying?", "expects to graduate"],
  ["What is Aftab's email?", "Email:"],
  ["Explain painting", "I don't have that detail"],
])("answers the intended topic for %s", async (question, answer) => {
  render(<PortfolioAssistant />);
  fireEvent.click(screen.getByRole("button", { name: "Chat with ELI" }));
  fireEvent.change(screen.getByLabelText("Ask ELI about Aftab"), {
    target: { value: question },
  });
  fireEvent.click(screen.getByRole("button", { name: "Send message" }));
  expect(
    await screen.findByText((text) => text.includes(answer), {}, { timeout: 2000 }),
  ).toBeInTheDocument();
});

it.each([
  ["Does he know Docker?", "Docker"],
  ["Which databases does he use?", "MySQL"],
  ["What awards has he won?", "third"],
])("understands rephrased question %s", async (question, answer) => {
  render(<PortfolioAssistant />);
  fireEvent.click(screen.getByRole("button", { name: "Chat with ELI" }));
  fireEvent.change(screen.getByLabelText("Ask ELI about Aftab"), {
    target: { value: question },
  });
  fireEvent.click(screen.getByRole("button", { name: "Send message" }));
  expect(
    await screen.findByText((text) => text.includes(answer), {}, { timeout: 2000 }),
  ).toBeInTheDocument();
});
