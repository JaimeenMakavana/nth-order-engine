import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductCard } from "@/components/features/cart/product-card";
import type { Product } from "@/types/ecommerce";

describe("ProductCard", () => {
  const mockProduct: Product = {
    id: "product-1",
    name: "Test Product",
    price: 29.99,
  };

  const mockOnAddToCart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render product name and price", () => {
      render(
        <ProductCard
          product={mockProduct}
          onAddToCart={mockOnAddToCart}
        />
      );

      expect(screen.getByText("Test Product")).toBeInTheDocument();
      expect(screen.getByText("$29.99")).toBeInTheDocument();
    });

    it("should render add to cart button", () => {
      render(
        <ProductCard
          product={mockProduct}
          onAddToCart={mockOnAddToCart}
        />
      );

      expect(
        screen.getByRole("button", { name: /add to cart/i })
      ).toBeInTheDocument();
    });

    it("should render product image placeholder", () => {
      render(
        <ProductCard
          product={mockProduct}
          onAddToCart={mockOnAddToCart}
        />
      );

      const image = screen.getByAltText("Test Product");
      expect(image).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call onAddToCart when button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <ProductCard
          product={mockProduct}
          onAddToCart={mockOnAddToCart}
        />
      );

      const button = screen.getByRole("button", { name: /add to cart/i });
      await user.click(button);

      expect(mockOnAddToCart).toHaveBeenCalledTimes(1);
      expect(mockOnAddToCart).toHaveBeenCalledWith("product-1");
    });

    it("should disable button when isAdding is true", () => {
      render(
        <ProductCard
          product={mockProduct}
          onAddToCart={mockOnAddToCart}
          isAdding={true}
        />
      );

      const button = screen.getByRole("button", { name: /adding/i });
      expect(button).toBeDisabled();
    });

    it("should show 'Adding...' text when isAdding is true", () => {
      render(
        <ProductCard
          product={mockProduct}
          onAddToCart={mockOnAddToCart}
          isAdding={true}
        />
      );

      expect(screen.getByText(/adding/i)).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible button", () => {
      render(
        <ProductCard
          product={mockProduct}
          onAddToCart={mockOnAddToCart}
        />
      );

      const button = screen.getByRole("button", { name: /add to cart/i });
      expect(button).toBeInTheDocument();
    });

    it("should have alt text for product image", () => {
      render(
        <ProductCard
          product={mockProduct}
          onAddToCart={mockOnAddToCart}
        />
      );

      const image = screen.getByAltText(mockProduct.name);
      expect(image).toBeInTheDocument();
    });
  });

  describe("Price Formatting", () => {
    it("should format price with 2 decimal places", () => {
      const productWithDecimal: Product = {
        id: "product-2",
        name: "Decimal Product",
        price: 19.9,
      };

      render(
        <ProductCard
          product={productWithDecimal}
          onAddToCart={mockOnAddToCart}
        />
      );

      expect(screen.getByText("$19.90")).toBeInTheDocument();
    });

    it("should format whole number prices correctly", () => {
      const productWhole: Product = {
        id: "product-3",
        name: "Whole Price Product",
        price: 50,
      };

      render(
        <ProductCard
          product={productWhole}
          onAddToCart={mockOnAddToCart}
        />
      );

      expect(screen.getByText("$50.00")).toBeInTheDocument();
    });
  });
});

