import React from "react";
import { Layout } from "@/components/layout";
import { Leaf, Heart, Users, Award } from "lucide-react";

const AboutPage = () => {
  return (
    <Layout>
      {/* Hero */}
      <section
        className="relative h-[50vh] min-h-[400px] flex items-center justify-center text-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1771849316389-dbd4db5dee77)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        data-testid="about-hero"
      >
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="relative z-10 text-white max-w-2xl px-4">
          <h1 className="font-serif text-4xl md:text-6xl font-semibold mb-4">
            Our Story
          </h1>
          <p className="text-lg text-white/80">
            Handcrafted with love, made to last
          </p>
        </div>
      </section>

      {/* Story Content */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="heading-md mb-6">The Beginning</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                AavyaRath-Home Decor was born from a simple belief: that the things we
                surround ourselves with should tell a story. In a world of mass
                production, we wanted to create something different – pieces
                that carry the warmth of human touch and the beauty of natural
                materials.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                What started as a small workshop in Faridabad has grown into a
                community of skilled artisans across India, each bringing their
                unique heritage and craftsmanship to our collections.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Every resin coaster, wooden toy, and flower vase in our
                collection is handcrafted with intention and care. We believe
                that home decor should be more than just beautiful – it should
                be meaningful.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1707256787102-47c91967ca36"
                  alt="Artisan crafting wooden toys"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="aspect-square rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1628072380604-22bcabb71740"
                  alt="Resin art creation"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="heading-md mb-6">Our Craft</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We work with a carefully selected network of artisans who
                specialize in different crafts. Our resin artists create
                stunning pieces that capture the beauty of nature – from ocean
                waves to geode formations.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our woodworkers use sustainably sourced timber to create toys
                that spark imagination and decor pieces that bring warmth to any
                space. Each piece is sanded smooth, finished with care, and made
                to be treasured for years.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We believe in quality over quantity. That's why we take our time
                with each piece, ensuring it meets our standards before it
                reaches your home.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section
        className="section-padding bg-muted/30"
        data-testid="values-section"
      >
        <div className="container-custom">
          <h2 className="heading-md text-center mb-12">Our Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Leaf className="text-primary" size={28} />
              </div>
              <h3 className="font-semibold mb-2">Sustainability</h3>
              <p className="text-sm text-muted-foreground">
                We use eco-friendly materials and sustainable practices to
                minimize our environmental footprint.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="text-primary" size={28} />
              </div>
              <h3 className="font-semibold mb-2">Craftsmanship</h3>
              <p className="text-sm text-muted-foreground">
                Every piece is handcrafted with attention to detail and a
                commitment to quality.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="text-primary" size={28} />
              </div>
              <h3 className="font-semibold mb-2">Community</h3>
              <p className="text-sm text-muted-foreground">
                We support local artisans and help preserve traditional crafting
                techniques.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="text-primary" size={28} />
              </div>
              <h3 className="font-semibold mb-2">Quality</h3>
              <p className="text-sm text-muted-foreground">
                We never compromise on quality. Every product is made to last
                and be cherished.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-padding">
        <div className="container-custom">
          <h2 className="heading-md text-center mb-4">Meet Our Artisans</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            The talented hands behind every piece
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-muted">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200"
                  alt="Artisan"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-semibold">Rajesh Kumar</h3>
              <p className="text-sm text-muted-foreground">Master Woodworker</p>
              <p className="text-sm text-muted-foreground mt-2 italic">
                "Wood speaks to me. I just help it find its form."
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-muted">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200"
                  alt="Artisan"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-semibold">Priya Sharma</h3>
              <p className="text-sm text-muted-foreground">Resin Artist</p>
              <p className="text-sm text-muted-foreground mt-2 italic">
                "I capture nature's beauty in every pour."
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-muted">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200"
                  alt="Artisan"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-semibold">Arun Patel</h3>
              <p className="text-sm text-muted-foreground">Toy Designer</p>
              <p className="text-sm text-muted-foreground mt-2 italic">
                "Every toy should spark wonder and joy."
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
