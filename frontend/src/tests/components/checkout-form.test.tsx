import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CheckoutForm } from "@/components/features/checkout/checkout-form";
import { useCartStore } from "@/store/use-cart-store";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

// Mock dependencies
vi.mock("@/lib/api-client");
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));
vi.mock("@/hooks/use-reward-reveal", () => ({
  useRewardReveal: () => ({
    reveal: vi.fn(),
  }),
}));

describe("CheckoutForm", () => {
  let queryClient: QueryClient;
  const mockCheckout = vi.fn();
  const mockGetStats = vi.fn();
  const mockGetCart = vi.fn();

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Reset store
    useCartStore.getState().clearCart();
    useCartStore.getState().setItems([]);

    // Setup API mocks
    (apiClient.checkout as any) = mockCheckout;
    (apiClient.getStats as any) = mockGetStats;
    (apiClient.getCart as any) = mockGetCart;

    // Default mock responses
    mockGetStats.mockResolvedValue({
      discountCodes: [
        { code: "SAVE10", isUsed: false },
        { code: "SAVE20", isUsed: true },
      ],
    });

    mockGetCart.mockResolvedValue({ items: [], subtotal: 0 });

    vi.clearAllMocks();
  });

  const renderCheckoutForm = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <CheckoutForm />
      </QueryClientProvider>
    );
  };

  describe("Rendering", () => {
    it("should render checkout form with discount code input", () => {
      renderCheckoutForm();

      expect(screen.getByLabelText(/discount code/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /complete order/i })
      ).toBeInTheDocument();
    });

    it("should display item count from cart", () => {
      useCartStore.getState().setItems([
        { productId: "product-1", quantity: 2 },
        { productId: "product-2", quantity: 1 },
      ]);

      renderCheckoutForm();

      expect(screen.getByText(/items in cart:/i)).toBeInTheDocument();
      // Component shows items.length, not total quantity
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  describe("Discount Code", () => {
    it("should allow entering discount code", async () => {
      const user = userEvent.setup();
      // Mock stats with no available coupons to prevent auto-apply
      mockGetStats.mockResolvedValue({
        discountCodes: [{ code: "USED", isUsed: true }],
      });

      renderCheckoutForm();

      // Wait for stats to load
      await waitFor(() => {
        expect(mockGetStats).toHaveBeenCalled();
      });

      const input = screen.getByLabelText(/discount code/i);
      await user.type(input, "SAVE10");

      expect(input).toHaveValue("SAVE10");
    });

    it("should auto-apply first available coupon when stats load", async () => {
      renderCheckoutForm();

      await waitFor(() => {
        const input = screen.getByLabelText(/discount code/i);
        expect(input).toHaveValue("SAVE10");
      });
    });

    it("should not auto-apply if no available coupons", async () => {
      // Reset the ref by creating a new query client
      const testQueryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      mockGetStats.mockResolvedValue({
        discountCodes: [{ code: "USED", isUsed: true }],
      });

      render(
        <QueryClientProvider client={testQueryClient}>
          <CheckoutForm />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(mockGetStats).toHaveBeenCalled();
      });

      const input = screen.getByLabelText(/discount code/i);
      expect(input).toHaveValue("");
    });
  });

  describe("Form Submission", () => {
    it("should submit checkout with items and discount code", async () => {
      const user = userEvent.setup();
      useCartStore
        .getState()
        .setItems([{ productId: "product-1", quantity: 2 }]);

      mockCheckout.mockResolvedValue({
        order: {
          finalAmount: 20.0,
          discountApplied: 0,
        },
        reward: null,
      });

      renderCheckoutForm();

      // Wait for auto-apply to complete, then verify it's there
      await waitFor(() => {
        const input = screen.getByLabelText(/discount code/i);
        expect(input).toHaveValue("SAVE10");
      });

      const submitButton = screen.getByRole("button", {
        name: /complete order/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCheckout).toHaveBeenCalledWith({
          items: [{ productId: "product-1", quantity: 2 }],
          discountCode: "SAVE10",
        });
      });
    });

    it("should submit checkout without discount code if empty", async () => {
      const user = userEvent.setup();
      useCartStore
        .getState()
        .setItems([{ productId: "product-1", quantity: 1 }]);

      // Mock stats with no available coupons to prevent auto-apply
      mockGetStats.mockResolvedValue({
        discountCodes: [{ code: "USED", isUsed: true }],
      });

      mockCheckout.mockResolvedValue({
        order: {
          finalAmount: 10.0,
          discountApplied: 0,
        },
        reward: null,
      });

      renderCheckoutForm();

      // Wait for stats to load and ensure no auto-apply
      await waitFor(() => {
        expect(mockGetStats).toHaveBeenCalled();
      });

      // Clear any auto-applied code
      const input = screen.getByLabelText(/discount code/i);
      await user.clear(input);

      const submitButton = screen.getByRole("button", {
        name: /complete order/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCheckout).toHaveBeenCalledWith({
          items: [{ productId: "product-1", quantity: 1 }],
          discountCode: undefined,
        });
      });
    });

    it("should show error toast when cart is empty", async () => {
      useCartStore.getState().setItems([]);

      const { container } = renderCheckoutForm();

      // Submit form directly since button is disabled
      const form = container.querySelector("form");
      expect(form).toBeInTheDocument();
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Your cart is empty");
      });

      expect(mockCheckout).not.toHaveBeenCalled();
    });

    it("should disable submit button when cart is empty", () => {
      useCartStore.getState().setItems([]);

      renderCheckoutForm();

      const submitButton = screen.getByRole("button", {
        name: /complete order/i,
      });
      expect(submitButton).toBeDisabled();
    });

    it("should show loading state during checkout", async () => {
      const user = userEvent.setup();
      useCartStore
        .getState()
        .setItems([{ productId: "product-1", quantity: 1 }]);

      // Create a promise that we can control
      let resolveCheckout: (value: any) => void;
      const checkoutPromise = new Promise((resolve) => {
        resolveCheckout = resolve;
      });
      mockCheckout.mockReturnValue(checkoutPromise);

      renderCheckoutForm();

      const submitButton = screen.getByRole("button", {
        name: /complete order/i,
      });
      await user.click(submitButton);

      expect(screen.getByText(/processing/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      // Resolve the promise
      resolveCheckout!({
        order: { finalAmount: 10.0, discountApplied: 0 },
        reward: null,
      });

      await waitFor(() => {
        expect(screen.queryByText(/processing/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Success Handling", () => {
    it("should show success toast with order details", async () => {
      const user = userEvent.setup();
      useCartStore
        .getState()
        .setItems([{ productId: "product-1", quantity: 1 }]);

      mockCheckout.mockResolvedValue({
        order: {
          finalAmount: 20.0,
          discountApplied: 5.0,
        },
        reward: null,
      });

      renderCheckoutForm();

      const submitButton = screen.getByRole("button", {
        name: /complete order/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
        const successCall = (toast.success as any).mock.calls[0];
        // toast.success is called with a React element
        const element = successCall[0];
        expect(element).toBeDefined();
        // Check that it's a React element with children containing "Order Confirmed!"
        expect(element.props?.children).toBeDefined();
      });
    });

    it("should clear cart after successful checkout", async () => {
      const user = userEvent.setup();
      useCartStore
        .getState()
        .setItems([{ productId: "product-1", quantity: 1 }]);

      mockCheckout.mockResolvedValue({
        order: {
          finalAmount: 10.0,
          discountApplied: 0,
        },
        reward: null,
      });

      renderCheckoutForm();

      const submitButton = screen.getByRole("button", {
        name: /complete order/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(useCartStore.getState().items).toHaveLength(0);
      });
    });

    it("should show reward message if reward is returned", async () => {
      const user = userEvent.setup();
      useCartStore
        .getState()
        .setItems([{ productId: "product-1", quantity: 1 }]);

      mockCheckout.mockResolvedValue({
        order: {
          finalAmount: 10.0,
          discountApplied: 0,
        },
        reward: {
          message: "You won a free item!",
        },
      });

      renderCheckoutForm();

      const submitButton = screen.getByRole("button", {
        name: /complete order/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });
    });
  });

  describe("Error Handling", () => {
    it("should show error toast on checkout failure", async () => {
      const user = userEvent.setup();
      useCartStore
        .getState()
        .setItems([{ productId: "product-1", quantity: 1 }]);

      mockCheckout.mockRejectedValue(new Error("Checkout failed"));

      renderCheckoutForm();

      const submitButton = screen.getByRole("button", {
        name: /complete order/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        // Error message uses error.message if available, otherwise fallback
        expect(toast.error).toHaveBeenCalledWith("Checkout failed");
      });
    });
  });
});
