import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  SPIRAL_PATH,
  SPIRAL_WORDS,
  SayHiSpiral,
} from "@/components/devices/SayHiSpiral";
import { sayHi } from "@/content/say-hi";

afterEach(cleanup);

describe("SayHiSpiral", () => {
  it("is aria-hidden and defines the path and word once", () => {
    const { container } = render(<SayHiSpiral />);
    expect(container.firstElementChild?.getAttribute("aria-hidden")).toBe(
      "true",
    );
    const path = container.querySelectorAll("defs path");
    expect(path).toHaveLength(1);
    expect(path[0].getAttribute("id")).toBe("say-hi-path");
    expect(path[0].getAttribute("d")).toBe(SPIRAL_PATH);
    const text = container.querySelector("defs text")!;
    expect(text.querySelector("textPath")?.getAttribute("href")).toBe(
      "#say-hi-path",
    );
    expect(text.textContent).toBe(sayHi.spiralWord);
  });

  it("renders 22 word svgs with the measured box and an index", () => {
    expect(SPIRAL_WORDS).toBe(22);
    const { container } = render(<SayHiSpiral />);
    const words = [...container.querySelectorAll("svg[viewBox]")];
    expect(words).toHaveLength(SPIRAL_WORDS);
    words.forEach((w, i) => {
      expect(w.getAttribute("viewBox")).toBe("72.7 -67 71.5 133.7");
      expect(w.querySelector("use")?.getAttribute("href")).toBe("#say-hi-word");
      expect((w as SVGElement).style.getPropertyValue("--i")).toBe(String(i));
    });
  });

  it("uses no colour literal", () => {
    const { container } = render(<SayHiSpiral />);
    expect(container.innerHTML).not.toMatch(/="#[0-9a-fA-F]{3,8}"/);
  });
});
