"use client";

/**
 * Link that routes through the selection-box transition.
 *
 * Falls back to normal navigation for modified clicks (new tab, download,
 * middle click) and for external/hash hrefs, so it never traps the browser's
 * own behaviours.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "./TransitionProvider";

type Props = React.ComponentPropsWithoutRef<typeof Link> & { href: string };

export function TransitionLink({ href, onClick, children, ...rest }: Props) {
  const router = useRouter();
  const { startTransition } = useTransition();

  return (
    <Link
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;

        // Let the browser handle anything that isn't a plain left click,
        // plus external links and in-page anchors.
        const modified =
          e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;
        const internal = href.startsWith("/") && !href.startsWith("/#");
        if (modified || !internal) return;

        e.preventDefault();
        router.prefetch(href);
        startTransition(e.clientX, e.clientY, () => {
          router.push(href);
          window.scrollTo(0, 0);
        });
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
