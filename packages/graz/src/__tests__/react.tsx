import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { FC, ReactNode } from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";

type Wrapper = FC<{ children: ReactNode }>;

const Passthrough: Wrapper = ({ children }) => <>{children}</>;

export const createQueryWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
      queries: {
        gcTime: 0,
        retry: false,
      },
    },
  });

  const wrapper: Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { queryClient, wrapper };
};

export const flushReact = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
};

export const renderHook = <TResult,>(
  hook: () => TResult,
  options: { wrapper?: Wrapper } = {},
) => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const WrapperComponent = options.wrapper ?? Passthrough;
  let result: TResult | undefined;

  const Host = () => {
    result = hook();
    return null;
  };

  const render = () => {
    root.render(
      <WrapperComponent>
        <Host />
      </WrapperComponent>,
    );
  };

  act(() => {
    render();
  });

  return {
    get result() {
      if (result === undefined) {
        throw new Error("Hook did not render");
      }
      return result;
    },
    rerender() {
      act(() => {
        render();
      });
    },
    unmount() {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
};

export const renderComponent = (children: ReactNode, options: { wrapper?: Wrapper } = {}) => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const WrapperComponent = options.wrapper ?? Passthrough;

  act(() => {
    root.render(<WrapperComponent>{children}</WrapperComponent>);
  });

  return {
    container,
    unmount() {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
};
