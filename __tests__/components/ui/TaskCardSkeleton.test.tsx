import { render } from "@testing-library/react";
import TaskCardSkeleton from "@/components/ui/TaskCardSkeleton";

describe("TaskCardSkeleton", () => {
  it("renders a loading card container", () => {
    const { container } = render(<TaskCardSkeleton />);
    const card = container.firstElementChild as HTMLElement;

    expect(card).toBeInTheDocument();
    expect(card.className).toContain("animate-pulse");
    expect(card.className).toContain("rounded-xl");
  });

  it("renders multiple placeholder blocks", () => {
    const { container } = render(<TaskCardSkeleton />);
    const placeholders = container.querySelectorAll(".bg-stone-200");

    expect(placeholders.length).toBeGreaterThanOrEqual(6);
  });
});