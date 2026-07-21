import type { Metadata } from "next";
import { Container } from "@/components/container";
import { SectionHeading } from "@/components/section-heading";
import { principles } from "@/lib/artroom-data";

export const metadata: Metadata = {
  title: "About | Artroom",
  description: "The curatorial principles behind Artroom.",
};

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-line py-14 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionHeading
            eyebrow="About"
            title="A quieter room for looking."
            description="Artroom is shaped as a flexible gallery system where the work, the artist, and the visitor path remain clear."
          />
          <div className="grid gap-4">
            {principles.map((principle, index) => (
              <div className="border-t border-line pt-5" key={principle}>
                <p className="font-mono text-sm text-coral">0{index + 1}</p>
                <p className="mt-3 text-lg leading-8 text-ink">{principle}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container className="grid gap-8 md:grid-cols-3">
          <div className="border-t border-line pt-5">
            <h2 className="text-xl font-semibold text-ink">Location</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              Seoul studio district, visits by appointment.
            </p>
          </div>
          <div className="border-t border-line pt-5">
            <h2 className="text-xl font-semibold text-ink">Focus</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              Contemporary painting, editions, research-led displays.
            </p>
          </div>
          <div className="border-t border-line pt-5">
            <h2 className="text-xl font-semibold text-ink">Contact</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              studio@artroom.example
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
