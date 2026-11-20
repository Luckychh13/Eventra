
import { useEffect, useState } from "react";
import { getImages } from "../../services/api/imageService.js";
import "./GalleryPage.css";

function GalleryHero() {
    return (
        <section className="gallery-hero">
            <div className="gallery-hero__glow gallery-hero__glow--left" />
            <div className="gallery-hero__glow gallery-hero__glow--right" />

            <div className="gallery-hero__content">
                <p className="gallery-eyebrow">
                    Memories in Motion
                </p>

                <h1>
                    Every Moment Has
                    <br />
                    <span>a Story to Tell.</span>
                </h1>

                <p className="gallery-hero__description">
                    From unforgettable performances to the energy of the
                    crowd, explore the moments that make Eventra special.
                    Every frame holds a memory worth reliving.
                </p>

                <div className="gallery-hero__decoration">
                    <span />
                    <span />
                    <span />
                </div>
            </div>
        </section>
    );
}

function GalleryImageSection() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isActive = true;

        getImages()
            .then((imagesData) => {
                if (isActive) {
                    setImages(
                        Array.isArray(imagesData) ? imagesData : []
                    );
                }
            })
            .catch((err) => {
                if (isActive) {
                    setError(
                        err.response?.data?.message ||
                        err.response?.data?.error ||
                        err.message ||
                        "Failed to load gallery images."
                    );
                }
            })
            .finally(() => {
                if (isActive) {
                    setLoading(false);
                }
            });

        return () => {
            isActive = false;
        };
    }, []);

    const imageHeights = [250, 300, 350, 400, 450];

    return (
        <section className="gallery-section">
            <div className="gallery-section__inner">
                <div className="gallery-section__heading">
                    <p className="gallery-eyebrow">
                        The Eventra Experience
                    </p>

                    <h2>
                        Moments Worth <span>Remembering.</span>
                    </h2>

                    <p>
                        A collection of memories, celebrations, and
                        unforgettable experiences.
                    </p>
                </div>

                {loading ? (
                    <div className="gallery-state">
                        <div className="gallery-loader" />
                        <p>Gathering your memories...</p>
                    </div>
                ) : error ? (
                    <div className="gallery-state gallery-state--error">
                        <p>{error}</p>
                    </div>
                ) : images.length === 0 ? (
                    <div className="gallery-state">
                        <p className="gallery-empty__icon">✦</p>
                        <h3>No memories just yet</h3>
                        <p>Our gallery will have something special soon.</p>
                    </div>
                ) : (
                    <div className="gallery-grid">
                        {images.map((item, index) => (
                            <article
                                key={item._id}
                                className="gallery-card"
                            >
                                <div
                                    className="gallery-card__image"
                                    style={{
                                        height: `${imageHeights[index % imageHeights.length]}px`,
                                    }}
                                >
                                    <img
                                        src={item.imageUrl}
                                        alt={item.title || "Event gallery image"}
                                        loading="lazy"
                                    />
                                </div>

                                <div className="gallery-card__overlay">
                                    {item.tags?.length > 0 && (
                                        <p className="gallery-card__tags">
                                            {item.tags.join(" · ")}
                                        </p>
                                    )}

                                    <h3>
                                        {item.title}
                                    </h3>

                                    {item.description && (
                                        <p className="gallery-card__description">
                                            {item.description}
                                        </p>
                                    )}
                                </div>

                                <div className="gallery-card__accent" />
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

function GalleryPage() {
    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }, []);

    return (
        <main className="gallery-page">
            <GalleryHero />
            <GalleryImageSection />
        </main>
    );
}

export default GalleryPage;
