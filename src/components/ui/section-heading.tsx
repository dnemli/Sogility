type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-2">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6A8090]">
          {eyebrow}
        </p>
      ) : null}
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-[#E0E8F0]">{title}</h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-[#9AB0C0]">{description}</p>
      </div>
    </div>
  );
}
