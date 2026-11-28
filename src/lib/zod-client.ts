import { z } from "zod";

/**
 * Zod 4 JIT-compiles validators with `new Function`, which our Content-Security-Policy forbids (no 'unsafe-eval').
 * Jitless mode uses the interpreter instead — imported by every client component that validates with zod.
 */
z.config({ jitless: true });
