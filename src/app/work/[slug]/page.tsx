import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects, getProject, getNextProject } from "@/content/projects";
import { site } from "@/content/site";
import { CaseHero } from "@/components/case-study/CaseHero";
import { MetricsBand } from "@/components/case-study/MetricsBand";
import { TransitionLink } from "@/components/transition/TransitionLink";

/** Pre-render every case study at build time. */
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  const title = `${project.title} — ${site.name}`;
  return {
    title,
    description: project.description,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      type: "article",
      title,
      description: project.description,
      url: `${site.url}/work/${project.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: project.description,
    },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const next = getNextProject(slug);

  return (
    <article>
      <CaseHero
        eyebrow={project.tag}
        title={project.title}
        description={project.description}
        image={project.heroImage}
        imageAlt={project.heroImageAlt}
      />

      <div className="container">
        <div className="pd-editorial">
          <aside className="pd-sidebar">
            {project.sidebar.map((block) => (
              <div key={block.label} className="pd-sidebar__block">
                <div className="pd-sidebar__label">{block.label}</div>
                <div className="pd-sidebar__val">{block.value}</div>
              </div>
            ))}
          </aside>

          <div className="pd-content">
            {project.sections.map((section) => (
              <section key={section.heading}>
                <h3>{section.heading}</h3>
                {section.body.map((para) => (
                  <p key={para.slice(0, 40)}>{para}</p>
                ))}
                {section.highlights && (
                  <ul className="pd-highlights">
                    {section.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>
      </div>

      <MetricsBand metrics={project.metrics} />

      <div className="container">
        <section className="pd-next">
          <div className="pd-next__label">Next Project</div>
          <TransitionLink href={`/work/${next.slug}`} className="pd-next__name">
            {next.title}
          </TransitionLink>
        </section>
      </div>
    </article>
  );
}
