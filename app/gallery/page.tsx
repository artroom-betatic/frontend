import type { Metadata } from "next";
import { ArtworkCard } from "@/components/artwork-card";
import { Container } from "@/components/container";
import { SectionHeading } from "@/components/section-heading";
import { featuredArtworks } from "@/lib/artroom-data";

export const metadata: Metadata = {
  title: "Gallery | Artroom",
  description: "Selected artworks and artist details from Artroom.",
};

export default function GalleryPage() {
  return (
    <>
      <section className="border-b border-line py-14 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Gallery"
            title="Selected works"
            description="A responsive collection view for artworks, editions, and exhibition objects."
          />
        </Container>
      </section>
      <section className="py-14 sm:py-20">
        <Container>
          <div className="grid gap-10 md:grid-cols-2">
            {featuredArtworks.map((artwork) => (
              <ArtworkCard artwork={artwork} key={artwork.id} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
