
import { useEffect, useState } from "react";
import { getEvents } from "../../services/api/eventService.js";
import {
    getEventPricings,
    createTierPricings,
    updatePricing,
    applyOffer,
    removeOffer,
} from "../../services/api/pricingService.js";

function AdminPricingPage() {
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState("");
    const [pricings, setPricings] = useState([]);

    const [eventsLoading, setEventsLoading] = useState(true);
    const [pricingsLoading, setPricingsLoading] = useState(false);

    const [error, setError] = useState("");

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [creating, setCreating] = useState(false);

    const [newPricing, setNewPricing] = useState({
        ticketType: "GOLDEN",
        price: "",
        totalTickets: "",
    });

    const [editingPricingId, setEditingPricingId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        price: "",
        totalTickets: "",
    });
    const [updating, setUpdating] = useState(false);

    const [offerPricingId, setOfferPricingId] = useState(null);
    const [offerFormData, setOfferFormData] = useState({
        percentage: "",
        expiry: "",
    });
    const [offerLoading, setOfferLoading] = useState(false);

    const [formError, setFormError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        let isActive = true;

        const loadEvents = async () => {
            try {
                const response = await getEvents();

                if (isActive) {
                    const eventList = Array.isArray(response) ? response : [];

                    setEvents(eventList);

                    if (eventList.length > 0) {
                        setSelectedEventId(eventList[0]._id);
                    }
                }
            } catch (err) {
                if (isActive) {
                    setError(
                        err.response?.data?.message ||
                        err.message ||
                        "Failed to load events."
                    );
                }
            } finally {
                if (isActive) {
                    setEventsLoading(false);
                }
            }
        };

        loadEvents();

        return () => {
            isActive = false;
        };
    }, []);

    useEffect(() => {
    if (!selectedEventId) return;

        let isActive = true;

        const loadPricings = async () => {
            try {
                setPricingsLoading(true);
                setError("");

                const response = await getEventPricings(selectedEventId);

                if (isActive) {
                    setPricings(Array.isArray(response) ? response : []);
                }
            } catch (err) {
                if (isActive) {
                    setError(
                        err.response?.data?.message ||
                        err.message ||
                        "Failed to load pricing."
                    );
                    setPricings([]);
                }
            } finally {
                if (isActive) {
                    setPricingsLoading(false);
                }
            }
        };

        loadPricings();

        return () => {
            isActive = false;
        };
    }, [selectedEventId]);

    const selectedEvent = events.find(
        (event) => event._id === selectedEventId
    );

    const handleCreatePricing = async (event) => {
        event.preventDefault();

        if (!selectedEventId) {
            setFormError("Please select an event.");
            return;
        }

        const price = Number(newPricing.price);
        const totalTickets = Number(newPricing.totalTickets);

        if (
            newPricing.price === "" ||
            !Number.isFinite(price) ||
            price < 0
        ) {
            setFormError("Enter a valid ticket price.");
            return;
        }

        if (
            newPricing.totalTickets === "" ||
            !Number.isInteger(totalTickets) ||
            totalTickets <= 0
        ) {
            setFormError("Total tickets must be a positive integer.");
            return;
        }

        try {
            setCreating(true);
            setFormError("");
            setSuccessMessage("");

            await createTierPricings(selectedEventId, [
                {
                    ticketType: newPricing.ticketType,
                    price,
                    totalTickets,
                },
            ]);

            const updatedPricings = await getEventPricings(selectedEventId);

            setPricings(Array.isArray(updatedPricings) ? updatedPricings : []);

            setNewPricing({
                ticketType: "GOLDEN",
                price: "",
                totalTickets: "",
            });

            setShowCreateForm(false);
            setSuccessMessage("Ticket pricing created successfully.");
        } catch (err) {
            setFormError(
                err.response?.data?.message ||
                err.message ||
                "Failed to create ticket pricing."
            );
        } finally {
            setCreating(false);
        }
    };

    const openEditForm = (pricing) => {
        setEditingPricingId(pricing._id);
        setOfferPricingId(null);

        setEditFormData({
            price: String(pricing.price),
            totalTickets: String(pricing.totalTickets),
        });

        setFormError("");
        setSuccessMessage("");
    };

    const handleUpdatePricing = async (event, pricing) => {
        event.preventDefault();

        const price = Number(editFormData.price);
        const totalTickets = Number(editFormData.totalTickets);

        if (
            editFormData.price === "" ||
            !Number.isFinite(price) ||
            price < 0
        ) {
            setFormError("Enter a valid ticket price.");
            return;
        }

        if (
            editFormData.totalTickets === "" ||
            !Number.isInteger(totalTickets) ||
            totalTickets < pricing.ticketsSold
        ) {
            setFormError(
                `Total tickets cannot be less than tickets already sold (${pricing.ticketsSold}).`
            );
            return;
        }

        try {
            setUpdating(true);
            setFormError("");
            setSuccessMessage("");

            await updatePricing(pricing._id, {
                price,
                totalTickets,
            });

            const updatedPricings = await getEventPricings(selectedEventId);

            setPricings(
                Array.isArray(updatedPricings) ? updatedPricings : []
            );

            setEditingPricingId(null);
            setSuccessMessage("Ticket pricing updated successfully.");
        } catch (err) {
            setFormError(
                err.response?.data?.message ||
                err.message ||
                "Failed to update pricing."
            );
        } finally {
            setUpdating(false);
        }
    };

    const openOfferForm = (pricing) => {
        setOfferPricingId(pricing._id);
        setEditingPricingId(null);

        setOfferFormData({
            percentage: "",
            expiry: "",
        });

        setFormError("");
        setSuccessMessage("");
    };

    const handleApplyOffer = async (event, pricing) => {
        event.preventDefault();

        const percentage = Number(offerFormData.percentage);

        if (
            offerFormData.percentage === "" ||
            !Number.isFinite(percentage) ||
            percentage <= 0 ||
            percentage > 100
        ) {
            setFormError("Offer percentage must be greater than 0 and at most 100.");
            return;
        }

        if (!offerFormData.expiry) {
            setFormError("Please select an offer expiry date and time.");
            return;
        }

        const expiryDate = new Date(offerFormData.expiry);

        if (
            Number.isNaN(expiryDate.getTime()) ||
            expiryDate <= new Date()
        ) {
            setFormError("Offer expiry must be a future date and time.");
            return;
        }

        try {
            setOfferLoading(true);
            setFormError("");
            setSuccessMessage("");

            await applyOffer(
                pricing._id,
                percentage,
                expiryDate.toISOString()
            );

            const updatedPricings = await getEventPricings(selectedEventId);

            setPricings(
                Array.isArray(updatedPricings) ? updatedPricings : []
            );

            setOfferPricingId(null);
            setSuccessMessage("Offer applied successfully.");
        } catch (err) {
            setFormError(
                err.response?.data?.message ||
                err.message ||
                "Failed to apply offer."
            );
        } finally {
            setOfferLoading(false);
        }
    };

    const handleRemoveOffer = async (pricing) => {
        const confirmed = window.confirm(
            `Remove the offer from ${pricing.ticketType} tickets?`
        );

        if (!confirmed) return;

        try {
            setOfferLoading(true);
            setFormError("");
            setSuccessMessage("");

            await removeOffer(pricing._id);

            const updatedPricings = await getEventPricings(selectedEventId);

            setPricings(
                Array.isArray(updatedPricings) ? updatedPricings : []
            );

            setSuccessMessage("Offer removed successfully.");
        } catch (err) {
            setFormError(
                err.response?.data?.message ||
                err.message ||
                "Failed to remove offer."
            );
        } finally {
            setOfferLoading(false);
        }
    };

    if (eventsLoading) {
        return <p className="text-gray-400">Loading events...</p>;
    }

    return (
        <section className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-white">
                    Event Pricing
                </h1>
                <p className="mt-1 text-sm text-gray-400">
                    Manage ticket pricing and offers for your events.
                </p>
            </div>

            {error && (
                <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                    {error}
                </p>
            )}

            <div className="max-w-md space-y-2">
                <label
                    htmlFor="event"
                    className="block text-sm font-medium text-gray-300"
                >
                    Select Event
                </label>

                <select
                    id="event"
                    value={selectedEventId}
                    onChange={(event) => {
                        setSelectedEventId(event.target.value);
                        setEditingPricingId(null);
                        setOfferPricingId(null);
                        setShowCreateForm(false);
                        setFormError("");
                        setSuccessMessage("");
                    }}
                    className="w-full rounded-lg border border-white/10 bg-[#171522] px-4 py-3 text-white outline-none focus:border-purple-500"
                >
                    {events.length === 0 && (
                        <option value="">No events available</option>
                    )}

                    {events.map((event) => (
                        <option key={event._id} value={event._id}>
                            {event.title}
                        </option>
                    ))}
                </select>
            </div>

            {selectedEvent && (
                <h2 className="text-lg font-medium text-white">
                    {selectedEvent.title}
                </h2>
            )}

            <div className="space-y-4">
                <button
                    type="button"
                    onClick={() => {
                        setShowCreateForm((current) => !current);
                        setFormError("");
                        setSuccessMessage("");
                    }}
                    disabled={!selectedEventId}
                    className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-500 disabled:opacity-50"
                >
                    {showCreateForm ? "Cancel" : "Add Ticket Tier"}
                </button>

                {successMessage && (
                    <p className="text-sm text-green-400">
                        {successMessage}
                    </p>
                )}

                {showCreateForm && (
                    <form
                        onSubmit={handleCreatePricing}
                        className="max-w-lg space-y-4 rounded-xl border border-white/10 bg-[#171522] p-5"
                    >
                        <h3 className="text-lg font-semibold text-white">
                            Create Ticket Tier
                        </h3>

                        {formError && (
                            <p className="text-sm text-red-400">
                                {formError}
                            </p>
                        )}

                        <div className="space-y-2">
                            <label className="block text-sm text-gray-300">
                                Ticket Type
                            </label>

                            <select
                                value={newPricing.ticketType}
                                onChange={(event) =>
                                    setNewPricing((current) => ({
                                        ...current,
                                        ticketType: event.target.value,
                                    }))
                                }
                                className="w-full rounded-lg border border-white/10 bg-[#171522] px-3 py-2 text-white"
                            >
                                <option value="GOLDEN">GOLDEN</option>
                                <option value="SILVER">SILVER</option>
                                <option value="BRONZE">BRONZE</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm text-gray-300">
                                Ticket Price (₹)
                            </label>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={newPricing.price}
                                onChange={(event) =>
                                    setNewPricing((current) => ({
                                        ...current,
                                        price: event.target.value,
                                    }))
                                }
                                placeholder="Enter ticket price"
                                className="w-full rounded-lg border border-white/10 bg-[#171522] px-3 py-2 text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm text-gray-300">
                                Total Tickets
                            </label>

                            <input
                                type="number"
                                min="1"
                                step="1"
                                value={newPricing.totalTickets}
                                onChange={(event) =>
                                    setNewPricing((current) => ({
                                        ...current,
                                        totalTickets: event.target.value,
                                    }))
                                }
                                placeholder="Enter total tickets"
                                className="w-full rounded-lg border border-white/10 bg-[#171522] px-3 py-2 text-white"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={creating}
                            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 disabled:opacity-50"
                        >
                            {creating ? "Creating..." : "Create Pricing"}
                        </button>
                    </form>
                )}
            </div>

            {pricingsLoading ? (
                <p className="text-gray-400">Loading pricing tiers...</p>
            ) : pricings.length === 0 ? (
                <p className="rounded-lg border border-white/10 p-5 text-gray-400">
                    No pricing tiers have been created for this event yet.
                </p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {pricings.map((pricing) => (
                        <div
                            key={pricing._id}
                            className="rounded-xl border border-white/10 bg-[#171522] p-5"
                        >
                            {editingPricingId === pricing._id ? (
                                <form
                                    onSubmit={(event) =>
                                        handleUpdatePricing(event, pricing)
                                    }
                                    className="space-y-4"
                                >
                                    <h3 className="text-lg font-semibold text-white">
                                        Edit {pricing.ticketType} Pricing
                                    </h3>

                                    {formError && (
                                        <p className="text-sm text-red-400">
                                            {formError}
                                        </p>
                                    )}

                                    <div className="space-y-2">
                                        <label className="block text-sm text-gray-300">
                                            Ticket Price (₹)
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={editFormData.price}
                                            onChange={(event) =>
                                                setEditFormData((current) => ({
                                                    ...current,
                                                    price: event.target.value,
                                                }))
                                            }
                                            className="w-full rounded-lg border border-white/10 bg-[#171522] px-3 py-2 text-white"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm text-gray-300">
                                            Total Tickets
                                        </label>

                                        <input
                                            type="number"
                                            min={pricing.ticketsSold}
                                            step="1"
                                            value={editFormData.totalTickets}
                                            onChange={(event) =>
                                                setEditFormData((current) => ({
                                                    ...current,
                                                    totalTickets: event.target.value,
                                                }))
                                            }
                                            className="w-full rounded-lg border border-white/10 bg-[#171522] px-3 py-2 text-white"
                                        />

                                        <p className="text-xs text-gray-500">
                                            Already sold: {pricing.ticketsSold}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            type="submit"
                                            disabled={updating}
                                            className="rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-500 disabled:opacity-50"
                                        >
                                            {updating ? "Saving..." : "Save Changes"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingPricingId(null);
                                                setFormError("");
                                            }}
                                            disabled={updating}
                                            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <h3 className="text-lg font-semibold text-white">
                                        {pricing.ticketType}
                                    </h3>

                                    <div className="mt-4 space-y-2 text-sm text-gray-400">
                                        <p>Original price: ₹{pricing.price}</p>
                                        <p>Final price: ₹{pricing.finalPrice}</p>
                                        <p>Total tickets: {pricing.totalTickets}</p>
                                        <p>Tickets sold: {pricing.ticketsSold}</p>
                                        <p>
                                            Tickets remaining:{" "}
                                            {pricing.totalTickets - pricing.ticketsSold}
                                        </p>
                                    </div>

                                    {pricing.offer?.active && (
                                        <div className="mt-4 space-y-1 rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                                            <p className="text-sm font-medium text-green-400">
                                                {pricing.offer.percentage}% offer active
                                            </p>

                                            {pricing.offer.expiry && (
                                                <p className="text-xs text-gray-400">
                                                    Expires:{" "}
                                                    {new Date(
                                                        pricing.offer.expiry
                                                    ).toLocaleString()}
                                                </p>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveOffer(pricing)
                                                }
                                                disabled={offerLoading}
                                                className="mt-2 rounded-lg border border-red-500/20 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                                            >
                                                {offerLoading
                                                    ? "Please wait..."
                                                    : "Remove Offer"}
                                            </button>
                                        </div>
                                    )}

                                    {!pricing.offer?.active && (
                                        <button
                                            type="button"
                                            onClick={() => openOfferForm(pricing)}
                                            className="mt-4 rounded-lg border border-green-500/20 px-4 py-2 text-sm text-green-300 transition hover:bg-green-500/10"
                                        >
                                            Apply Offer
                                        </button>
                                    )}

                                    {offerPricingId === pricing._id && (
                                        <form
                                            onSubmit={(event) =>
                                                handleApplyOffer(event, pricing)
                                            }
                                            className="mt-4 space-y-3 rounded-lg border border-white/10 p-4"
                                        >
                                            <h4 className="font-medium text-white">
                                                Apply Offer
                                            </h4>

                                            {formError && (
                                                <p className="text-sm text-red-400">
                                                    {formError}
                                                </p>
                                            )}

                                            <div className="space-y-2">
                                                <label className="block text-sm text-gray-300">
                                                    Discount Percentage
                                                </label>

                                                <input
                                                    type="number"
                                                    min="0.01"
                                                    max="100"
                                                    step="0.01"
                                                    value={offerFormData.percentage}
                                                    onChange={(event) =>
                                                        setOfferFormData((current) => ({
                                                            ...current,
                                                            percentage: event.target.value,
                                                        }))
                                                    }
                                                    placeholder="e.g. 20"
                                                    className="w-full rounded-lg border border-white/10 bg-[#171522] px-3 py-2 text-white"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm text-gray-300">
                                                    Offer Expiry
                                                </label>

                                                <input
                                                    type="datetime-local"
                                                    value={offerFormData.expiry}
                                                    onChange={(event) =>
                                                        setOfferFormData((current) => ({
                                                            ...current,
                                                            expiry: event.target.value,
                                                        }))
                                                    }
                                                    className="w-full rounded-lg border border-white/10 bg-[#171522] px-3 py-2 text-white"
                                                />
                                            </div>

                                            <div className="flex flex-wrap gap-3">
                                                <button
                                                    type="submit"
                                                    disabled={offerLoading}
                                                    className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white transition hover:bg-green-500 disabled:opacity-50"
                                                >
                                                    {offerLoading
                                                        ? "Applying..."
                                                        : "Apply Offer"}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setOfferPricingId(null);
                                                        setFormError("");
                                                    }}
                                                    disabled={offerLoading}
                                                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => openEditForm(pricing)}
                                        className="mt-5 rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300 transition hover:bg-white/5"
                                    >
                                        Edit Pricing
                                    </button>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default AdminPricingPage;
