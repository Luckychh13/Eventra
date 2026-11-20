
import { useEffect, useState } from "react";
import "./ContactPage.css";

const faqData = [
    {
        question: "How can I register for an event?",
        answer:
            "Visit the Events or Event Schedules section to explore available events and follow the registration or booking process shown for each event.",
    },
    {
        question: "Where can I find event details?",
        answer:
            "Visit the Event Schedules page for available event dates, timings, locations, and descriptions.",
    },
    {
        question: "How can I purchase an event ticket?",
        answer:
            "Select an event, visit its pricing page, and follow the available booking and payment steps.",
    },
    {
        question: "How can I view event photographs?",
        answer:
            "Visit the Gallery page to explore the photographs shared by the event organizers.",
    },
    {
        question: "How can I get help with a booking?",
        answer:
            "Use the contact information published by the organizers once the official support details are available.",
    },
    {
        question: "Where can I find announcements?",
        answer:
            "Check the website for the latest announcements and updates shared by the organizers.",
    },
];

function ContactHeroSection() {
    return (
        <section className="contact-hero">
            <div className="contact-hero__glow contact-hero__glow--one" />
            <div className="contact-hero__glow contact-hero__glow--two" />

            <div className="contact-hero__content">
                <span className="contact-eyebrow">We're Just a Message Away</span>

                <h1>
                    We're Here to
                    <br />
                    <span>Help You.</span>
                </h1>

                <p>
                    Have questions, suggestions, or need support?
                    Explore our website or reach out to the event organizers.
                </p>

                <div className="contact-hero__symbols">
                    <span>✉</span>
                    <span>⌕</span>
                    <span>↗</span>
                </div>
            </div>

            <div className="contact-hero__bottom">
                <span>QUESTIONS</span>
                <span />
                <span>SUPPORT</span>
                <span />
                <span>CONNECTION</span>
            </div>
        </section>
    );
}

function ContactInfoSection() {
    const items = [
        {
            icon: "✉",
            number: "01",
            title: "Email Us",
            description: "Official support email will be published here.",
        },
        {
            icon: "⌕",
            number: "02",
            title: "Call Us",
            description: "Official contact number will be published here.",
        },
        {
            icon: "⌖",
            number: "03",
            title: "Our Address",
            description: "Official event venue information will be published here.",
        },
    ];

    return (
        <section className="contact-section contact-info">
            <div className="contact-container">
                <div className="contact-section-heading">
                    <span className="contact-eyebrow contact-eyebrow--light">
                        Let's Connect
                    </span>
                    <h2>
                        Get in <span>Touch.</span>
                    </h2>
                    <p>
                        Have a question, suggestion, or need help?
                        We're working to make it easier to connect with our team.
                    </p>
                </div>

                <div className="contact-info__grid">
                    {items.map((item) => (
                        <article className="contact-info-card" key={item.title}>
                            <div className="contact-info-card__top">
                                <span>{item.number}</span>
                                <span className="contact-info-card__icon">
                                    {item.icon}
                                </span>
                            </div>

                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

function ContactFormSection() {
    return (
        <section className="contact-section contact-form-section">
            <div className="contact-container contact-form-section__grid">
                <div className="contact-form-intro">
                    <span className="contact-eyebrow contact-eyebrow--light">
                        We'd Love to Hear From You
                    </span>

                    <h2>
                        Send Us a <span>Message.</span>
                    </h2>

                    <p>
                        Have questions or suggestions? You can prepare your
                        message below.
                    </p>

                    <div className="contact-form-note">
                        <span>✦</span>
                        <div>
                            <strong>We're listening.</strong>
                            <p>
                                Your feedback helps make every Eventra
                                experience better.
                            </p>
                        </div>
                    </div>
                </div>

                <form
                    onSubmit={(event) => event.preventDefault()}
                    className="contact-form"
                >
                    <div className="contact-form__grid">
                        <label>
                            <span>Full Name</span>
                            <input
                                type="text"
                                placeholder="Your name"
                                aria-label="Full Name"
                            />
                        </label>

                        <label>
                            <span>Email Address</span>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                aria-label="Email Address"
                            />
                        </label>

                        <label>
                            <span>Phone Number</span>
                            <input
                                type="tel"
                                placeholder="Your phone number"
                                aria-label="Phone Number"
                            />
                        </label>

                        <label>
                            <span>Reason for Contact</span>
                            <select
                                defaultValue=""
                                aria-label="Select Reason"
                            >
                                <option value="" disabled>
                                    Select a reason
                                </option>
                                <option value="general">General Inquiry</option>
                                <option value="event">Event Related</option>
                                <option value="technical">Technical Issue</option>
                                <option value="feedback">Feedback / Suggestion</option>
                            </select>
                        </label>
                    </div>

                    <label className="contact-form__full">
                        <span>Subject</span>
                        <input
                            type="text"
                            placeholder="What is this regarding?"
                            aria-label="Subject"
                        />
                    </label>

                    <label className="contact-form__full">
                        <span>Event Name (Optional)</span>
                        <input
                            type="text"
                            placeholder="Enter event name"
                            aria-label="Event Name"
                        />
                    </label>

                    <label className="contact-form__full">
                        <span>Your Message</span>
                        <textarea
                            rows={5}
                            placeholder="Tell us how we can help..."
                            aria-label="Your Message"
                        />
                    </label>

                    <label className="contact-form__full">
                        <span>Attach File (Optional)</span>
                        <input
                            type="file"
                            className="contact-form__file"
                        />
                    </label>

                    <p className="contact-form__notice">
                        This form is currently frontend-only. Message
                        submission is not connected to a backend.
                    </p>

                    <button
                        type="button"
                        disabled
                        className="contact-form__submit"
                    >
                        Send Message <span>↗</span>
                    </button>
                </form>
            </div>
        </section>
    );
}

function ContactMapSection() {
    return (
        <section className="contact-section contact-location">
            <div className="contact-container">
                <div className="contact-section-heading">
                    <span className="contact-eyebrow contact-eyebrow--light">
                        Find Your Way
                    </span>
                    <h2>
                        Find <span>Us.</span>
                    </h2>
                    <p>
                        Venue and location details will be displayed here once
                        the official event location is confirmed.
                    </p>
                </div>

                <div className="contact-location__placeholder">
                    <div className="contact-location__decoration">
                        <span>⌖</span>
                    </div>
                    <h3>Our Location</h3>
                    <p>
                        Official venue map will be available here.
                    </p>
                    <span className="contact-location__status">
                        VENUE DETAILS COMING SOON
                    </span>
                </div>
            </div>
        </section>
    );
}

function FAQSection() {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <section className="contact-section contact-faq">
            <div className="contact-container contact-faq__container">
                <div className="contact-section-heading">
                    <span className="contact-eyebrow contact-eyebrow--light">
                        Need Some Answers?
                    </span>
                    <h2>
                        Frequently Asked <span>Questions.</span>
                    </h2>
                    <p>
                        Find answers to some common questions about using Eventra.
                    </p>
                </div>

                <div className="contact-faq__list">
                    {faqData.map((item, index) => {
                        const isOpen = openIndex === index;

                        return (
                            <article
                                key={item.question}
                                className={`contact-faq-item ${isOpen ? "contact-faq-item--open" : ""
                                    }`}
                            >
                                <button
                                    type="button"
                                    aria-expanded={isOpen}
                                    onClick={() =>
                                        setOpenIndex(isOpen ? null : index)
                                    }
                                >
                                    <span className="contact-faq-item__number">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>

                                    <span className="contact-faq-item__question">
                                        {item.question}
                                    </span>

                                    <span className="contact-faq-item__toggle">
                                        {isOpen ? "−" : "+"}
                                    </span>
                                </button>

                                {isOpen && (
                                    <div className="contact-faq-item__answer">
                                        <p>{item.answer}</p>
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function ContactSocialSection() {
    return (
        <section className="contact-social">
            <div className="contact-social__content">
                <span className="contact-eyebrow">Stay in the Loop</span>

                <h2>
                    Follow <span>Eventra.</span>
                </h2>

                <p>
                    Follow the official Eventra social media channels for updates.
                    Social profile links will be added once confirmed.
                </p>

                <div className="contact-social__placeholder">
                    Official social profile links coming soon
                </div>
            </div>
        </section>
    );
}

export default function ContactPage() {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    return (
        <main className="contact-page">
            <ContactHeroSection />
            <ContactInfoSection />
            <ContactFormSection />
            <ContactMapSection />
            <FAQSection />
            <ContactSocialSection />
        </main>
    );
}
