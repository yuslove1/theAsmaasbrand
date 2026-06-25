import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Mail, Phone, MessageCircle } from 'lucide-react'

export default function AboutSection() {
  return (
    <>
      {/* About */}
      <section id="about" className="py-24 bg-brand-navy text-white overflow-hidden relative">
        {/* Decorative Arabic watermark */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 text-white/3 text-[200px] select-none pointer-events-none leading-none hidden lg:block"
          style={{ fontFamily: 'var(--font-amiri)' }}
        >
          جودة
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <p className="arabic-accent text-2xl mb-2 opacity-70" style={{ fontFamily: 'var(--font-amiri)' }}>
              من نحن
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-white font-light mb-6 leading-tight">
              Quality You Can{' '}
              <span className="text-gold-shimmer italic">Trust</span>
            </h2>
            <div className="w-16 h-0.5 bg-brand-gold mb-6" />
            <p className="text-white/60 text-base leading-relaxed font-body mb-4">
              The Asmaa&apos;s Brand was founded with one purpose — to bring beautifully crafted
              Islamic fashion and essentials to every Muslim home. We deal in the finest
              Abayas, Jalabias, Scarves, Hijabs, and authentic Islamic Art.
            </p>
            <p className="text-white/60 text-base leading-relaxed font-body mb-8">
              Located at two convenient spots in Lagos, we serve customers across Nigeria
              with pride and dedication to quality.
            </p>
            <div className="flex items-center gap-3">
              <div className="w-px h-10 bg-brand-gold" />
              <p
                className="text-brand-gold text-xl italic"
                style={{ fontFamily: 'var(--font-amiri)' }}
              >
                ...Shop The Quality!
              </p>
            </div>
          </div>

          {/* Image grid */}
          <div className="grid grid-cols-2 gap-3 h-96">
            <div className="relative rounded-none overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80"
                alt="Women's Islamic fashion"
                fill
                className="object-cover"
              />
            </div>
            <div className="grid grid-rows-2 gap-3">
              <div className="relative overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=600&q=80"
                  alt="Islamic art"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80"
                  alt="Fashion items"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="arabic-accent text-2xl mb-2" style={{ fontFamily: 'var(--font-amiri)' }}>
              تواصل معنا
            </p>
            <h2 className="section-heading">Get In Touch</h2>
            <div className="gold-divider" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <MapPin size={28} className="text-brand-gold" />,
                title: 'Visit Us',
                lines: ['13 Shoyinka Street, Fadeyi', 'LASU, Ojo, Lagos'],
              },
              {
                icon: <MessageCircle size={28} className="text-brand-gold" />,
                title: 'WhatsApp',
                lines: ['08143378187'],
                href: 'https://wa.me/2348143378187',
              },
              {
                icon: <Phone size={28} className="text-brand-gold" />,
                title: 'Call Us',
                lines: ['08024928389'],
                href: 'tel:08024928389',
              },
              {
                icon: <Mail size={28} className="text-brand-gold" />,
                title: 'Email Us',
                lines: ['asmaurufai37@gmail.com'],
                href: 'mailto:asmaurufai37@gmail.com',
              },
            ].map(({ icon, title, lines, href }) => (
              <div key={title} className="bg-white p-6 border border-brand-stone text-center group hover:border-brand-gold transition-colors duration-300">
                <div className="flex justify-center mb-3">{icon}</div>
                <h4 className="font-display text-lg text-brand-navy mb-2">{title}</h4>
                {lines.map((line) =>
                  href ? (
                    <a
                      key={line}
                      href={href}
                      className="block text-brand-navy/60 text-sm font-body hover:text-brand-wine transition-colors"
                    >
                      {line}
                    </a>
                  ) : (
                    <p key={line} className="text-brand-navy/60 text-sm font-body">{line}</p>
                  )
                )}
              </div>
            ))}
          </div>

          {/* Social links */}
          <div className="text-center mt-10">
            <p className="text-brand-navy/40 text-xs tracking-widest uppercase font-body mb-4">
              Follow us on social media
            </p>
            <div className="flex justify-center gap-6">
              {['@the Asmaa\'s Brand', '@the Asmaa\'s Brand', '@the Asmaa\'s Brand'].map((handle, i) => (
                <a
                  key={i}
                  href="#"
                  className="text-brand-navy/60 hover:text-brand-wine text-sm font-body transition-colors"
                >
                  {['Instagram', 'TikTok', 'Facebook'][i]}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
