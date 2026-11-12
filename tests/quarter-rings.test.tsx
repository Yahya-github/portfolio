import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  QuarterRings,
  RING_COUNT,
  RING_RATIO,
  RING_THICKNESS,
} from "@/components/devices/QuarterRings";

afterEach(cleanup);

describe("QuarterRings", () => {
  it("draws 14 circles centred on the top-right corner of a 100 box", () => {
    const { container } = render(<QuarterRings />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("viewBox")).toBe("0 0 100 100");
    expect(svg.getAttribute("fill")).toBe("none");
    expect(svg.getAttribute("stroke")).toBe("currentColor");
    const circles = svg.querySelectorAll("circle");
    expect(circles).toHaveLength(RING_COUNT);
    circles.forEach((c) => {
      expect(c.getAttribute("cx")).toBe("100");
      expect(c.getAttribute("cy")).toBe("0");
    });
  });

  it("scales each ring by 0.8 with a 16.5% thick stroke", () => {
    const { container } = render(<QuarterRings />);
    const circles = [...container.querySelectorAll("circle")];
    expect(RING_RATIO).toBe(0.8);
    expect(circles[0].getAttribute("r")).toBe("91.75");
    expect(circles[0].getAttribute("stroke-width")).toBe("16.5");
    circles.forEach((c) => {
      const r = Number(c.getAttribute("r"));
      expect(Number(c.getAttribute("stroke-width"))).toBeCloseTo(
        r * RING_THICKNESS,
        1,
      );
    });
    expect(Math.abs(Number(circles[13].getAttribute("r")) - 5.04)).toBeLessThan(
      0.02,
    );
  });

  it("is aria-hidden and carries no hex colour", () => {
    const { container } = render(<QuarterRings />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,6}/);
  });
});
