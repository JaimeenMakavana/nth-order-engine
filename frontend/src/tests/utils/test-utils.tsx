import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCartStore } from "@/store/use-cart-store";

// Create a test query client with default options
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  queryClient?: QueryClient;
  initialCartItems?: Array<{ productId: string; quantity: number }>;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    queryClient = createTestQueryClient(),
    initialCartItems = [],
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  // Reset stores to initial state
  useCartStore.getState().clearCart();
  useCartStore.getState().setItems(initialCartItems);

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

// Factory functions for test data
export const createMockProduct = (overrides?: Partial<any>) => ({
  id: "product-1",
  name: "Test Product",
  price: 29.99,
  ...overrides,
});

export const createMockCartItem = (overrides?: Partial<any>) => ({
  productId: "product-1",
  quantity: 1,
  ...overrides,
});

export const createMockCartResponse = (overrides?: Partial<any>) => ({
  items: [{ productId: "product-1", quantity: 1 }],
  subtotal: 29.99,
  ...overrides,
});

// Re-export everything from testing-library
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";

