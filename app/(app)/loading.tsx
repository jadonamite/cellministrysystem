import { PageSkeleton } from "@/components/shell/page-skeleton";

/**
 * Root loading boundary. Cascades to every route without its own loading.tsx,
 * so tapping any nav item swaps to a skeleton instantly while the dynamic page
 * renders — no dead wait between press and switch. Its presence also lets
 * <Link> prefetch each route's shell.
 */
export default function Loading() {
  return <PageSkeleton />;
}
