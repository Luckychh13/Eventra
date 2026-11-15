import { useEffect, useState } from "react";

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
        <section className="relative overflow-hidden bg-black px-6 pb-24 pt-20 text-white">
            <div className="pointer-events-none absolute left-0 top-10 h-96 w-96 rounded-full bg-blue-600/20 blur-[180px]" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-purple-700/25 blur-[200px]" />

            <div className="relative z-10 mx-auto max-w-6xl text-center">
                <p className="mb-4 font-semibold uppercase tracking-[6px] text-pink-500">
                    Contact Us
                </p>

                <h1 className="text-4xl font-extrabold leading-tight sm:text-6xl md:text-7xl">
                    We're Here to <span className="text-pink-500">Help You</span>
                    <br />
                    <span className="text-purple-400">Reach Out Anytime</span>
                </h1>

                <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-300">
                    Have questions, suggestions, or need support?
                    Explore our website or reach out to the event organizers.
                </p>

                <div className="mt-10 flex justify-center gap-6">
                    {["✉", "☎", "⌖"].map((symbol) => (
                        <div
                            key={symbol}
                            className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-3xl transition hover:bg-pink-500/20"
                        >
                            {symbol}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function ContactInfoSection() {
    const items = [
        {
            icon: "✉",
            title: "Email Us",
            description: "Official support email will be published here.",
        },
        {
            icon: "☎",
            title: "Call Us",
            description: "Official contact number will be published here.",
        },
        {
            icon: "⌖",
            title: "Our Address",
            description: "Official event venue information will be published here.",
        },
    ];

    return (
        <section className="relative overflow-hidden bg-black px-6 py-24 text-white">
            <div className="pointer-events-none absolute -left-20 top-0 h-96 w-96 rounded-full bg-pink-600/10 blur-[150px]" />

            <div className="relative mx-auto max-w-6xl">
                <h2 className="text-center text-4xl font-extrabold sm:text-6xl">
                    Get in <span className="text-pink-400">Touch</span>
                </h2>

                <p className="mx-auto mb-16 mt-5 max-w-2xl text-center text-lg text-gray-300">
                    Have a question, suggestion, or need help?
                    We're working to make it easier to connect with our team.
                </p>

                <div className="grid gap-8 md:grid-cols-3">
                    {items.map((item) => (
                        <article
                            key={item.title}
                            className="rounded-3xl border border-white/10 bg-white/10 p-10 text-center transition hover:-translate-y-2 hover:border-pink-500/60"
                        >
                            <div className="text-5xl text-pink-400">{item.icon}</div>
                            <h3 className="mt-5 text-2xl font-bold">{item.title}</h3>
                            <p className="mt-3 text-gray-300">{item.description}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

function ContactFormSection() {
    return (
        <section className="relative overflow-hidden bg-black px-6 py-24 text-white">
            <div className="mx-auto max-w-3xl">
                <h2 className="text-center text-4xl font-extrabold sm:text-5xl">
                    Send Us a <span className="text-pink-400">Message</span>
                </h2>

                <p className="mx-auto mb-12 mt-5 max-w-2xl text-center text-lg text-gray-300">
                    Have questions or suggestions? You can prepare your message below.
                </p>

                <form
                    onSubmit={(event) => event.preventDefault()}
                    className="rounded-2xl border border-white/10 bg-white/10 p-6 shadow-lg backdrop-blur-md sm:p-10"
                >
                    <div className="grid gap-6 sm:grid-cols-2">
                        <input
                            type="text"
                            placeholder="Full Name"
                            aria-label="Full Name"
                            className="rounded-xl border border-white/20 bg-black/40 p-4 outline-none focus:border-pink-500"
                        />

                        <input
                            type="email"
                            placeholder="Email Address"
                            aria-label="Email Address"
                            className="rounded-xl border border-white/20 bg-black/40 p-4 outline-none focus:border-pink-500"
                        />

                        <input
                            type="tel"
                            placeholder="Phone Number"
                            aria-label="Phone Number"
                            className="rounded-xl border border-white/20 bg-black/40 p-4 outline-none focus:border-pink-500"
                        />

                        <select
                            defaultValue=""
                            aria-label="Select Reason"
                            className="rounded-xl border border-white/20 bg-black/40 p-4 text-gray-300 outline-none focus:border-pink-500"
                        >
                            <option value="" disabled>
                                Select Reason
                            </option>
                            <option value="general">General Inquiry</option>
                            <option value="event">Event Related</option>
                            <option value="technical">Technical Issue</option>
                            <option value="feedback">Feedback / Suggestion</option>
                        </select>
                    </div>

                    <input
                        type="text"
                        placeholder="Subject"
                        aria-label="Subject"
                        className="mt-6 w-full rounded-xl border border-white/20 bg-black/40 p-4 outline-none focus:border-pink-500"
                    />

                    <input
                        type="text"
                        placeholder="Event Name (Optional)"
                        aria-label="Event Name"
                        className="mt-6 w-full rounded-xl border border-white/20 bg-black/40 p-4 outline-none focus:border-pink-500"
                    />

                    <textarea
                        rows={5}
                        placeholder="Your Message"
                        aria-label="Your Message"
                        className="mt-6 w-full rounded-xl border border-white/20 bg-black/40 p-4 outline-none focus:border-pink-500"
                    />

                    <div className="mt-6">
                        <label className="mb-2 block text-gray-300">
                            Attach File (Optional)
                        </label>
                        <input
                            type="file"
                            className="w-full cursor-pointer rounded-xl border border-white/20 bg-black/40 p-3 text-gray-300"
                        />
                    </div>

                    <p className="mt-6 text-sm text-amber-300">
                        This form is currently a frontend-only form. Message submission
                        is not connected to a backend.
                    </p>

                    <button
                        type="button"
                        disabled
                        className="mt-8 w-full cursor-not-allowed rounded-xl bg-pink-500/50 py-4 text-lg font-semibold text-white"
                    >
                        Send Message — Not Available Yet
                    </button>
                </form>
            </div>
        </section>
    );
}

function ContactMapSection() {
    return (
        <section className="bg-black px-6 py-24 text-white">
            <div className="mx-auto max-w-5xl text-center">
                <h2 className="text-4xl font-extrabold sm:text-6xl">
                    Find <span className="text-pink-400">Us</span>
                </h2>

                <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-300">
                    Venue and location details will be displayed here once the
                    official event location is confirmed.
                </p>

                <div className="mt-12 flex min-h-64 items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-8">
                    <p className="max-w-md text-gray-400">
                        Official venue map will be available here.
                    </p>
                </div>
            </div>
        </section>
    );
}

function FAQSection() {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <section className="relative overflow-hidden bg-black px-6 py-24 text-white">
            <div className="mx-auto max-w-4xl">
                <h2 className="text-center text-4xl font-extrabold sm:text-6xl">
                    <span className="text-pink-400">FAQ</span> – Common Questions
                </h2>

                <p className="mx-auto mb-14 mt-5 max-w-2xl text-center text-lg text-gray-300">
                    Find answers to some common questions about using Eventra.
                </p>

                <div className="space-y-5">
                    {faqData.map((item, index) => {
                        const isOpen = openIndex === index;

                        return (
                            <article
                                key={item.question}
                                className="rounded-2xl border border-white/10 bg-white/10 p-6 transition hover:border-pink-400/40"
                            >
                                <button
                                    type="button"
                                    aria-expanded={isOpen}
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                    className="flex w-full items-center justify-between gap-4 text-left"
                                >
                                    <span className="text-lg font-semibold sm:text-xl">
                                        {item.question}
                                    </span>

                                    <span className="text-2xl text-pink-400">
                                        {isOpen ? "−" : "+"}
                                    </span>
                                </button>

                                {isOpen && (
                                    <p className="mt-4 leading-relaxed text-gray-300">
                                        {item.answer}
                                    </p>
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
        <section className="bg-black px-6 py-16 text-center text-white">
            <h2 className="text-4xl font-bold sm:text-5xl">
                Follow <span className="text-pink-400">Us</span>
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-gray-300">
                Follow the official Eventra social media channels for updates.
                Social profile links will be added once confirmed.
            </p>
        </section>
    );
}

export default function ContactPage() {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    return (
        <>
            <ContactHeroSection />
            <ContactInfoSection />
            <ContactFormSection />
            <ContactMapSection />
            <FAQSection />
            <ContactSocialSection />
        </>
    );
}
