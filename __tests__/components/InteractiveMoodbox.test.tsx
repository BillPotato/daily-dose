import { fireEvent, render, screen } from "@testing-library/react";
import InteractiveMoodbox from "@/components/InteractiveMoodbox";

jest.mock("@/contexts/ThemeContext", () => ({
  useTheme: () => ({ isDark: false, toggleTheme: jest.fn() }),
}));

describe("InteractiveMoodbox", () => {
  it("renders summary metric content", () => {
    render(
      <InteractiveMoodbox
        title="Mood Average"
        value={4.1}
        subtitle="/5 this week"
        icon="😊"
        type="mood"
        additionalData={{ exercise: 42 }}
      />,
    );

    expect(screen.getAllByText("Mood Average").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("4.1").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("/5 this week").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Health Insight")).toBeInTheDocument();
  });

  it("updates visual state on hover and restores on leave", () => {
    const { container } = render(
      <InteractiveMoodbox
        title="Mood Average"
        value={4.1}
        subtitle="/5 this week"
        icon="😊"
        type="mood"
        additionalData={{ exercise: 42 }}
      />,
    );

    const root = container.firstElementChild as HTMLElement;
    const mainCard = root.children[0] as HTMLElement;
    const hoverOverlay = root.children[1] as HTMLElement;

    expect(mainCard.className).toContain("opacity-100");
    expect(hoverOverlay.className).toContain("opacity-0");

    fireEvent.mouseEnter(root);

    expect(mainCard.className).toContain("opacity-0");
    expect(hoverOverlay.className).toContain("opacity-100");
    expect(hoverOverlay.className).toContain("scale-110");

    fireEvent.mouseLeave(root);

    expect(mainCard.className).toContain("opacity-100");
    expect(hoverOverlay.className).toContain("opacity-0");
  });

  it("renders mood-specific insight copy", () => {
    render(
      <InteractiveMoodbox
        title="Mood Average"
        value={2.2}
        subtitle="/5 this week"
        icon="🙂"
        type="mood"
        additionalData={{ exercise: 15 }}
      />,
    );

    expect(screen.getByText(/Your mood could use a boost/i)).toBeInTheDocument();
    expect(screen.getByText("Try a 10-minute walk outside")).toBeInTheDocument();
  });
});