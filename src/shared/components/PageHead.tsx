import { Head } from "vite-react-ssg";
import { usePageHead, type PageHeadInput } from "@/shared/hooks/usePageHead";

/**
 * Renders per-route head tags through vite-react-ssg's SSR-safe <Head> manager
 * (react-helmet-async). Because this is rendered during build-time prerender,
 * the resulting <title>, meta, canonical, and JSON-LD tags are written into each
 * route's static HTML — not just patched on the client (§12/§17).
 */
export function PageHead(props: PageHeadInput) {
  const model = usePageHead(props);

  return (
    <Head>
      <title>{model.title}</title>
      <link rel="canonical" href={model.canonical} />
      {model.robots ? <meta name="robots" content={model.robots} /> : null}
      {model.meta.map((tag) =>
        tag.property ? (
          <meta
            key={`p:${tag.property}`}
            property={tag.property}
            content={tag.content}
          />
        ) : (
          <meta key={`n:${tag.name}`} name={tag.name} content={tag.content} />
        ),
      )}
      {model.jsonLd.map((data, index) => (
        <script key={`ld:${index}`} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Head>
  );
}
