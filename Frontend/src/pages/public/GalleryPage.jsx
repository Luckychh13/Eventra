import { useEffect, useState } from "react";
import { getImages } from "../../services/api/imageService.js";

function GalleryHero() {
    return (
        <section className="relative overflow-hidden bg-black px-6 pb-24 pt-12 text-white">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-0 top-10 h-96 w-96 rounded-full bg-pink-600/20 blur-[150px]" />
                <div className="absolute bottom-0 right-0 h-[30rem] w-[30rem] rounded-full bg-purple-700/25 blur-[180px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-6xl text-center">
                <p className="mb-3 font-semibold uppercase tracking-[6px] text-pink-400">
                    // Memories in Motion //
                </p>

                <h1 className="mb-6 text-4xl font-extrabold leading-tight sm:text-6xl md:text-7xl">
                    Capture the Moments that Matter
                    <br />
                    <span className="text-pink-500">
                        Dive into Stories that Shine ✨
                    </span>
                </h1>

                <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-300 sm:text-lg">
                    Dive into our vibrant gallery — every photo tells a story
                    of{" "}
                    <span className="font-semibold text-pink-400">joy</span>,{" "}
                    <span className="font-semibold text-purple-400">music</span>,
                    and{" "}
                    <span className="font-semibold text-white">
                        unforgettable memories
                    </span>
                    . Relive the laughter, the lights, and the love — one
                    frame at a time. 🎶
                </p>
            </div>

            <div className="absolute left-1/4 top-12 h-2 w-2 animate-ping rounded-full bg-pink-400" />
            <div className="absolute bottom-16 right-1/3 h-3 w-3 animate-ping rounded-full bg-purple-400" />
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
        <section className="min-h-screen bg-black px-6 py-16 text-white">
            <div className="mx-auto max-w-7xl">
                <h2 className="mb-12 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-center text-4xl font-extrabold text-transparent sm:text-5xl">
                    Moments of Magic
                </h2>

                {loading ? (
                    <p className="py-20 text-center text-gray-400">
                        Loading gallery...
                    </p>
                ) : error ? (
                    <p className="py-20 text-center text-red-300">
                        {error}
                    </p>
                ) : images.length === 0 ? (
                    <p className="py-20 text-center text-gray-400">
                        No images available.
                    </p>
                ) : (
                    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
                        {images.map((item, index) => (
                            <article
                                key={item._id}
                                className="group relative mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-gray-900 shadow-lg"
                            >
                                <div
                                    className="w-full overflow-hidden bg-gray-800"
                                    style={{
                                        height: `${imageHeights[index % imageHeights.length]}px`,
                                    }}
                                >
                                    <img
                                        src={item.imageUrl}
                                        alt={item.title || "Event gallery image"}
                                        loading="lazy"
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>

                                {/* Image information overlay */}
                                <div className="absolute inset-0 flex flex-col justify-end rounded-2xl bg-black/60 p-5 opacity-100 transition-opacity duration-500 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                                    {item.tags?.length > 0 && (
                                        <p className="mb-1 text-sm text-purple-400">
                                            {item.tags.join(", ")}
                                        </p>
                                    )}

                                    <h3 className="text-lg font-semibold text-white">
                                        {item.title}
                                    </h3>

                                    {item.description && (
                                        <p className="mt-1 text-sm text-gray-300">
                                            {item.description}
                                        </p>
                                    )}
                                </div>

                                {/* Subtle hover glow */}
                                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-purple-500/0 transition-all duration-500 group-hover:bg-purple-500/10" />
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
        <>
            <GalleryHero />
            <GalleryImageSection />
        </>
    );
}

export default GalleryPage;