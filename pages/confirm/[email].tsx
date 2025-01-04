import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

const ConfirmationPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Loading state
  const [hasBooked, setHasBooked] = useState(false); // State to track if booking has been attempted
  const router = useRouter();
  const { email, phoneNumber, location, start, end } = router.query;

  console.log(email, start, end);

  const bookSlot = async () => {
    if (start && end && email) {
      const eventDetails = {
        guests: [{ email: email, phone: phoneNumber }],
        summary: "Booking Event",
        start: { dateTime: start, timeZone: "Asia/Kolkata" },
        end: { dateTime: end, timeZone: "Asia/Kolkata" },
        phoneNumber: phoneNumber,
        location: location,
      };

      try {
        setLoading(true); // Start loading
        const response = await fetch("/api/book-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: eventDetails }),
        });

        if (!response.ok) {
          throw new Error("Failed to book the slot");
        }

        // Redirect to a success page or another route after successful booking
        router.push("/"); // Change '/success' to your desired route
      } catch (error) {
        console.error("Error booking slot", error);
        setError("Failed to book the slot. Please try again.");
      } finally {
        setLoading(false); // Stop loading
      }
    }
  };

  useEffect(() => {
    if (!hasBooked && start && end && email) {
      console.log("Booking slot...");
      bookSlot();
      setHasBooked(true); // Mark that booking has been attempted
    }
  }, [start, end, email, hasBooked]);

  return (
    <div className="confirmation-container flex flex-col items-center justify-center h-screen w-full p-4">
      {loading ? (
        <div className="loading-message  flex flex-col justify-center items-center text-center">
          <svg
            className="animate-spin h-8 w-8 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
          <p className="mt-4 text-lg">Booking your slot, please wait...</p>
        </div>
      ) : error ? (
        <div className="error-message text-red-500">{error}</div>
      ) : (
        <div className="confirmation-message text-center">
          <h2 className="text-xl font-semibold">Booking Confirmed!</h2>
          <p className="mt-2">Your booking has been successfully confirmed.</p>
        </div>
      )}
    </div>
  );
};

export default ConfirmationPage;
