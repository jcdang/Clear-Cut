import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CompareSlider } from "./CompareSlider";

describe("CompareSlider", () => {
  it("renders both original and result images", () => {
    render(
      <CompareSlider
        originalUrl="data:image/png;base64,original"
        resultUrl="data:image/png;base64,result"
      />,
    );

    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThanOrEqual(2);
    expect(images.map((img) => img.getAttribute("src"))).toEqual(
      expect.arrayContaining([
        "data:image/png;base64,original",
        "data:image/png;base64,result",
      ]),
    );
  });
});
