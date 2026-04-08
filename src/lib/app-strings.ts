/**
 * Structural application strings (not client content).
 * Error, 404, and loading text live here to avoid violating the zero hardcoded text rule.
 */
export const APP_STRINGS = {
  error: {
    title: "Something went wrong",
    description: "An unexpected error occurred. Please try again.",
    retry: "Try again",
  },
  notFound: {
    title: "Page not found",
    description: "The page you are looking for does not exist.",
    back: "Back to home",
  },
} as const;
