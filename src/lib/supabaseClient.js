import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing VITE_SUPABASE_URL.");
}

if (!supabasePublishableKey) {
  throw new Error("Missing VITE_SUPABASE_PUBLISHABLE_KEY.");
}

const retryFetch = async (input, init = {}, retries = 3) => {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(input, init);

      if (response.ok || response.status < 500) {
        return response;
      }

      lastError = new Error(
        `Supabase API returned HTTP ${response.status}`
      );
    } catch (error) {
      lastError = error;

      if (attempt === retries) {
        throw error;
      }
    }

    await new Promise((resolve) =>
      setTimeout(resolve, 800 * (attempt + 1))
    );
  }

  throw lastError;
};

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    global: {
      fetch: retryFetch,
    },
  }
);