interface SectionCardProps {
  title: string;
  subtitle?: string;
  content: string;
  className?: string;
}

export const SectionCard = ({
  title,
  subtitle,
  content,
  className = "",
}: SectionCardProps): string => {
  return `
    <section class="section-card ${className}">
      <h2>${title}</h2>
      ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ""}
      ${content}
    </section>
  `;
};
