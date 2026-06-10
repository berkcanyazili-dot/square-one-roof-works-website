import { useEffect, useRef, useState } from 'react'
import './App.css'
import {
  businessInfo,
  features,
  featuredVideo,
  footerServices,
  heroCards,
  navLinks,
  photoSrc,
  processSteps,
  projectPlaceholders,
  reviewFields,
  serviceAreas,
  services,
  trustBullets,
  trustStats,
} from './content'
import { useReducedMotion, useRevealObserver } from './useReveal'

function Icon({ icon, decorative = true }) {
  return (
    <span className="line-icon" aria-hidden={decorative}>
      <img src={icon.src} alt={decorative ? '' : icon.alt} decoding="async" />
    </span>
  )
}

function AnimatedValue({ value, label, start }) {
  const reducedMotion = useReducedMotion()
  const [displayValue, setDisplayValue] = useState(value)
  const isNumeric = /^\d+/.test(value)

  useEffect(() => {
    if (!isNumeric || reducedMotion || !start) {
      return undefined
    }

    const target = Number.parseInt(value, 10)
    let frameId = 0
    let startTime = 0

    const step = (timestamp) => {
      if (!startTime) {
        startTime = timestamp
      }

      const progress = Math.min((timestamp - startTime) / 700, 1)
      const eased = 1 - (1 - progress) ** 3
      const currentValue = Math.round(target * eased)
      setDisplayValue(label === 'Emergency Service' ? `${currentValue}-Hour` : `${currentValue} Years`)

      if (progress < 1) {
        frameId = window.requestAnimationFrame(step)
      }
    }

    frameId = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(frameId)
  }, [isNumeric, label, reducedMotion, start, value])

  return displayValue
}

function ServiceCard({ title, text, icon, dark = false, delay = 0 }) {
  return (
    <article className={dark ? 'service-card dark-card reveal-card' : 'service-card reveal-card'} data-reveal style={{ '--reveal-delay': `${delay}ms` }}>
      <Icon icon={icon} />
      <h3>{title}</h3>
      <p>{text}</p>
      <a href="#quote">{dark ? 'Request Service' : 'Request Free Inspection'}</a>
    </article>
  )
}

function FeatureCard({ title, text, icon, delay = 0 }) {
  return (
    <article className="feature-card reveal-card" data-reveal style={{ '--reveal-delay': `${delay}ms` }}>
      <Icon icon={icon} />
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </article>
  )
}

function ProjectCard({ project, index }) {
  return (
    <article className="project-card reveal-card" data-reveal style={{ '--reveal-delay': `${index * 60}ms` }}>
      <div className="project-media">
        {project.image ? (
          <img
            className="project-photo real-project-photo"
            src={project.image.src}
            alt={project.image.alt}
            width="1152"
            height="1536"
          />
        ) : (
          <div
            className={`project-photo project-${(index % 3) + 1}`}
            role="img"
            aria-label={`${project.service} placeholder project photo`}
          >
            <span>Project photos will be updated soon.</span>
          </div>
        )}
        <div className="project-overlay">
          <span>{project.status}</span>
        </div>
      </div>
      <div className="project-content structured-project">
        <div>
          <small>Service</small>
          <strong>{project.service}</strong>
        </div>
        <div>
          <small>Location</small>
          <strong>{project.location}</strong>
        </div>
        <div>
          <small>Status</small>
          <strong>{project.status}</strong>
        </div>
      </div>
    </article>
  )
}

function ProcessCard({ step, delay = 0 }) {
  return (
    <article className="process-card reveal-card" data-reveal style={{ '--reveal-delay': `${delay}ms` }}>
      <span className="process-step">{step.step}</span>
      <h3>{step.title}</h3>
      <p>{step.text}</p>
    </article>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [headerScrolled, setHeaderScrolled] = useState(false)
  const [formStatus, setFormStatus] = useState('')
  const reducedMotion = useRevealObserver()
  const [statsStarted, setStatsStarted] = useState(false)
  const statsSectionRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setHeaderScrolled(window.scrollY > 14)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  useEffect(() => {
    if (reducedMotion) {
      const frameId = window.requestAnimationFrame(() => setStatsStarted(true))
      return () => window.cancelAnimationFrame(frameId)
    }

    if (statsStarted) {
      return undefined
    }

    if (!statsSectionRef.current || typeof IntersectionObserver === 'undefined') {
      const frameId = window.requestAnimationFrame(() => setStatsStarted(true))
      return () => window.cancelAnimationFrame(frameId)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStatsStarted(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.35 },
    )

    observer.observe(statsSectionRef.current)
    return () => observer.disconnect()
  }, [reducedMotion, statsStarted])

  const handleQuoteSubmit = (event) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const name = (formData.get('name') || '').toString().trim()
    const phone = (formData.get('phone') || '').toString().trim()
    const email = (formData.get('email') || '').toString().trim()
    const propertyAddress = (formData.get('propertyAddress') || '').toString().trim()
    const serviceNeeded = (formData.get('serviceNeeded') || '').toString().trim()
    const description = (formData.get('description') || '').toString().trim()

    const subject = encodeURIComponent(`Free Roof Inspection Request - ${name || 'Website Lead'}`)
    const body = encodeURIComponent(
      [
        'Square One Roof Works website lead',
        '',
        `Name: ${name || 'Not provided'}`,
        `Phone: ${phone || 'Not provided'}`,
        `Email: ${email || 'Not provided'}`,
        `Property Address: ${propertyAddress || 'Not provided'}`,
        `Service Needed: ${serviceNeeded || 'Not provided'}`,
        '',
        'Project Details:',
        description || 'Not provided',
      ].join('\n'),
    )

    window.location.href = `mailto:${businessInfo.email}?subject=${subject}&body=${body}`
    setFormStatus(`Your email app should open a message addressed to ${businessInfo.email}.`)
  }

  return (
    <>
      <div className="top-bar">
        <div className="container top-bar-inner">
          <span>{businessInfo.address}</span>
          <a href={businessInfo.phoneHref}>{businessInfo.phone}</a>
          <a href={businessInfo.emailHref}>{businessInfo.email}</a>
          <strong>24-hour emergency service available</strong>
        </div>
      </div>

      <header
        className={[
          'site-header',
          menuOpen ? 'menu-open' : '',
          headerScrolled ? 'is-scrolled' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="container nav-shell">
          <a className="brand" href="#home" onClick={() => setMenuOpen(false)}>
            <img
              className="brand-logo"
              src={businessInfo.logoSrc}
              alt="Square One Roof Works logo"
              width="860"
              height="614"
            />
          </a>

          <button
            className="menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span></span>
            <span></span>
            <span></span>
            Menu
          </button>

          <nav
            id="primary-navigation"
            className={menuOpen ? 'primary-nav open' : 'primary-nav'}
            aria-label="Primary navigation"
          >
            {navLinks.map(([label, href], index) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                style={{ '--reveal-delay': `${index * 40}ms` }}
              >
                {label}
              </a>
            ))}
          </nav>

          <a className="nav-cta" href={businessInfo.phoneHref}>
            Call for Free Quote
          </a>
        </div>
      </header>

      <main>
        <section className="hero-section" id="home">
          <div className="container hero-grid">
            <div className={reducedMotion ? 'hero-copy is-visible' : 'hero-copy hero-intro is-visible'}>
              <p className="hero-brand-line hero-animate hero-animate-1">{businessInfo.name}</p>
              <p className="kicker hero-animate hero-animate-2">Roofing company Watertown NY</p>
              <h1 className="hero-animate hero-animate-3">Quality Roofing Done Right the First Time</h1>
              <p className="hero-animate hero-animate-4">
                Serving Watertown, Fort Drum, and the surrounding tri-county area with honest roof
                repairs, free inspections, and full roof replacements.
              </p>
              <div className="button-row hero-animate hero-animate-5">
                <a className="button red" href={businessInfo.phoneHref}>
                  Call for Free Quote
                </a>
                <a className="button dark" href="#quote">
                  Request Free Inspection
                </a>
              </div>
              <div className="hero-trust hero-animate hero-animate-6" aria-label="Trust highlights">
                <span>15 Years of Experience</span>
                <span>Fully Insured</span>
                <span>24-Hour Emergency Service</span>
              </div>
            </div>
          </div>
        </section>

        <section className="hero-card-section" aria-label="Primary roofing services">
          <div className="container hero-card-grid">
            {heroCards.map((card, index) => (
              <article className="hero-service-card reveal-card" key={card.title} data-reveal style={{ '--reveal-delay': `${index * 70}ms` }}>
                <Icon icon={card.icon} />
                <h2>{card.title}</h2>
                <p>{card.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section about-section" id="about">
          <div className="container about-grid">
            <div className="image-collage reveal-card" data-reveal>
              <img
                className="collage-main"
                src={photoSrc.ownerRoofRepair}
                alt="Square One Roof Works owner working on a roof"
                width="1152"
                height="1536"
              />
              <img
                className="collage-small"
                src={photoSrc.barnMetalRoof}
                alt="Metal roofing project by Square One Roof Works"
                width="1152"
                height="1536"
              />
              <div className="measurement-mark" aria-hidden="true"></div>
            </div>
            <div className="section-copy reveal-card" data-reveal style={{ '--reveal-delay': '70ms' }}>
              <p className="kicker">Who we are</p>
              <h2>We're Committed to Reliable Roofing Service</h2>
              <p>
                {businessInfo.name} is a local roofing company serving homeowners and businesses
                throughout {businessInfo.serviceArea}. With 15 years of experience, we provide
                dependable inspections, repairs, and full roof replacements with a focus on honest
                communication, quality workmanship, and doing the job right the first time.
              </p>
              <ul className="check-list">
                {trustBullets.map((item, index) => (
                  <li key={item} data-reveal style={{ '--reveal-delay': `${index * 40}ms` }}>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="image-support-copy">
                Hands-on roofing work from a local team serving Watertown, Fort Drum, and the
                surrounding tri-county area.
              </p>
              <a className="button red" href="#contact">
                Contact Us
              </a>
            </div>
          </div>
        </section>

        <section className="section video-section" data-reveal>
          <div className="container video-grid">
            <div className="video-copy reveal-card" data-reveal>
              <p className="kicker">{featuredVideo.eyebrow}</p>
              <h2>{featuredVideo.heading}</h2>
              <p className="video-subtitle">{featuredVideo.subtitle}</p>
              <p>{featuredVideo.description}</p>
              <div className="button-row">
                <a className="button red" href={businessInfo.phoneHref}>
                  Call for Free Quote
                </a>
                <a className="button dark" href="#quote">
                  Request Free Inspection
                </a>
              </div>
            </div>
            <div className="video-frame reveal-card" data-reveal style={{ '--reveal-delay': '70ms' }}>
              <div className="video-embed-shell">
                <iframe
                  src={featuredVideo.embedUrl}
                  title={featuredVideo.title}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </section>

        <section className="section dark-pattern" id="services">
          <div className="container">
            <div className="center-heading reveal-card" data-reveal>
              <p className="kicker">Our dedicated services</p>
              <h2>Roofing Services for Homes & Businesses</h2>
            </div>
            <div className="dark-service-grid">
              {services.map((service, index) => (
                <ServiceCard
                  key={service.title}
                  title={service.title}
                  text={service.text}
                  icon={service.icon}
                  dark
                  delay={index * 60}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="section why-section">
          <div className="container why-grid">
            <div className="why-copy reveal-card" data-reveal>
              <p className="kicker">Why choose us</p>
              <h2>The Right Choice for Quality Roofing in Watertown, NY</h2>
              <p>
                When you need a roofing contractor Fort Drum NY and Watertown NY property owners
                can trust, {businessInfo.name} keeps the process clear, practical, and focused on
                protecting your property.
              </p>
              <img
                className="why-image"
                src={photoSrc.metalRoofService}
                alt="Roofing contractor working on a metal roof in Watertown NY"
                width="1152"
                height="1536"
              />
              <p className="image-support-copy">
                Metal, shingle, and rubber roofing with free inspections and honest recommendations.
              </p>
            </div>
            <div className="feature-stack">
              {features.map((feature, index) => (
                <FeatureCard
                  key={feature.title}
                  title={feature.title}
                  text={feature.text}
                  icon={feature.icon}
                  delay={index * 45}
                />
              ))}
            </div>
          </div>
        </section>

        <section
          ref={statsSectionRef}
          className="stats-section dark-pattern"
          aria-label="Square One Roof Works trust facts"
          data-reveal
        >
          <div className="container stats-grid">
            {trustStats.map((stat, index) => (
              <div className="stat-card reveal-card" key={stat.label} data-reveal style={{ '--reveal-delay': `${index * 60}ms` }}>
                <Icon icon={stat.icon} />
                <strong>
                  {index === 0 || index === 3 ? (
                    <AnimatedValue value={stat.value} label={stat.label} start={statsStarted} />
                  ) : (
                    stat.value
                  )}
                </strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="section projects-section" id="projects">
          <div className="container">
            <div className="section-heading reveal-card" data-reveal>
              <div>
                <p className="kicker">Projects</p>
                <h2>Recent Roofing Projects</h2>
              </div>
              <p>Project photos will be updated soon.</p>
            </div>
            <div className="project-grid">
              {projectPlaceholders.map((project, index) => (
                <ProjectCard key={`${project.service}-${project.location}`} project={project} index={index} />
              ))}
            </div>
          </div>
        </section>

        <section className="section process-section">
          <div className="container">
            <div className="section-heading process-heading reveal-card" data-reveal>
              <div>
                <p className="kicker">What to expect</p>
                <h2>What to Expect</h2>
              </div>
              <p>Simple, clear roofing service from inspection through final cleanup.</p>
            </div>
            <div className="process-grid">
              {processSteps.map((step, index) => (
                <ProcessCard key={step.step} step={step} delay={index * 55} />
              ))}
            </div>
          </div>
        </section>

        <section className="section service-area-section" id="service-area">
          <div className="container service-area-grid">
            <div className="section-copy reveal-card" data-reveal>
              <p className="kicker">Local service area</p>
              <h2>Local Roofing Service Across Watertown, Fort Drum & the Tri-County Area</h2>
              <p>
                {businessInfo.name} is based in Watertown, NY and serves homeowners and businesses
                throughout Fort Drum and the surrounding tri-county area. Choosing a local roofer
                matters because local roofing crews understand Northern New York weather, snow,
                ice, storm damage, and the roof wear that comes with it.
              </p>
              <img
                className="service-area-image"
                src={photoSrc.winterRoofService}
                alt="Square One Roof Works winter roofing service on a snow-covered roof"
                width="1152"
                height="1536"
              />
            </div>
            <div className="service-area-list" aria-label="Towns served">
              {serviceAreas.map((town, index) => (
                <span key={town} data-reveal style={{ '--reveal-delay': `${index * 30}ms` }}>
                  {town}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-banner reveal-card" data-reveal>
          <div className="container cta-banner-inner">
            <div>
              <p className="kicker">Need roof help?</p>
              <h2>Call Us To Get a Quick Free Quote</h2>
              <a href={businessInfo.phoneHref}>{businessInfo.phone}</a>
            </div>
            <a className="button light" href={businessInfo.phoneHref}>
              Call for Free Quote
            </a>
          </div>
        </section>

        <section className="section reviews-section" id="reviews">
          <div className="container reviews-grid">
            <div className="review-visual reveal-card" data-reveal role="img" aria-label="Roofing project placeholder image"></div>
            <div className="section-copy reveal-card" data-reveal style={{ '--reveal-delay': '70ms' }}>
              <p className="kicker">Reviews</p>
              <h2>Customer Testimonials Will Be Added Soon</h2>
              <p>
                This section is ready for real customer feedback without pretending proof exists
                today. When reviews are available, each testimonial can include the customer name,
                town, service type, review text, and star rating.
              </p>
              <div className="review-template-grid" aria-label="Future testimonial fields">
                {reviewFields.map((field, index) => (
                  <div className="review-template-card" key={field} data-reveal style={{ '--reveal-delay': `${index * 40}ms` }}>
                    {field}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section quote-section" id="quote">
          <div className="container quote-grid">
            <div className="quote-copy reveal-card" data-reveal>
              <p className="kicker">Free inspection</p>
              <h2>Get a Free Roofing Inspection</h2>
              <p>
                Tell {businessInfo.name} what you need help with, or call directly for the fastest
                response. Prefer to call? Call <a href={businessInfo.phoneHref}>{businessInfo.phone}</a> for a free
                quote.
              </p>
              <div className="desktop-call-strip">
                <strong>Need roofing help fast?</strong>
                <a href={businessInfo.phoneHref}>Call {businessInfo.phone}</a>
                <span>24-hour emergency roofing service available</span>
              </div>
              <div className="qr-box">
                <img
                  className="qr-image"
                  src={photoSrc.freeQuoteQr}
                  alt="Square One Roof Works free quote QR code"
                  width="522"
                  height="528"
                />
                <strong>Scan for a Free Quote</strong>
                <span>Quick access to call or connect with Square One Roof Works.</span>
              </div>
            </div>

            <form
              className="booking-form reveal-card"
              data-reveal
              style={{ '--reveal-delay': '70ms' }}
              aria-label="Roofing inspection request form"
              onSubmit={handleQuoteSubmit}
            >
              <label>
                Name
                <input name="name" type="text" autoComplete="name" placeholder="Name" required />
              </label>
              <label>
                Phone
                <input name="phone" type="tel" autoComplete="tel" placeholder="Phone" required />
              </label>
              <label>
                Email
                <input name="email" type="email" autoComplete="email" placeholder="Email" required />
              </label>
              <label>
                Property Address
                <input
                  name="propertyAddress"
                  type="text"
                  autoComplete="street-address"
                  placeholder="Property Address"
                  required
                />
              </label>
              <label>
                Service Needed
                <select name="serviceNeeded" defaultValue="" required>
                  <option value="" disabled>
                    Select a service
                  </option>
                  {footerServices.map((service) => (
                    <option key={service}>{service}</option>
                  ))}
                </select>
              </label>
              <label>
                Brief Description
                <textarea
                  name="description"
                  rows="4"
                  placeholder="Briefly describe the roofing issue or project."
                  required
                ></textarea>
              </label>
              <button className="button red full-width" type="submit">
                Request Free Inspection
              </button>
              {formStatus ? <p className="form-status">{formStatus}</p> : null}
              <p className="form-support-copy">
                Need faster help? Call <a href={businessInfo.phoneHref}>{businessInfo.phone}</a>. Form
                submissions open an email to {businessInfo.email}.
              </p>
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer reveal-card" id="contact" data-reveal>
        <div className="container footer-top">
          <a className="footer-brand" href="#home">
            <img
              className="footer-logo"
              src={businessInfo.logoSrc}
              alt="Square One Roof Works logo"
              width="860"
              height="614"
            />
          </a>
          <div className="footer-call">
            <span>Need roofing help?</span>
            <a href={businessInfo.phoneHref}>Call Us: {businessInfo.phone}</a>
          </div>
        </div>
        <div className="container footer-grid">
          <div>
            <h2>Information</h2>
            <address>
              <a href={businessInfo.phoneHref}>{businessInfo.phone}</a>
              <a href={businessInfo.emailHref}>{businessInfo.email}</a>
              <span>{businessInfo.address}</span>
              <span>{businessInfo.serviceArea}</span>
              <strong>24-hour emergency service available</strong>
            </address>
          </div>
          <div>
            <h2>Our Services</h2>
            <ul>
              {footerServices.map((service) => (
                <li key={service}>
                  <a href="#services">{service}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Service Area</h2>
            <p>
              Roofing company Watertown NY, roofing contractor Fort Drum NY, and surrounding
              tri-county area service for homes and businesses.
            </p>
            <a className="button red footer-cta" href={businessInfo.phoneHref}>
              Call for Free Quote
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 {businessInfo.name}. All rights reserved.</span>
        </div>
      </footer>

      <a className="mobile-call-bar" href={businessInfo.phoneHref}>
        Call for Free Quote
      </a>
    </>
  )
}

export default App
