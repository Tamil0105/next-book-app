import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const ConfirmationPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // State to track loading status
  const [hasBooked, setHasBooked] = useState(false); // State to track if booking has been attempted
  const router = useRouter();
  const { email, name, phoneNumber, location, date } = router.query;

  useEffect(() => {
    const bookSlots = async () => {
      const selectedSlots = localStorage.getItem("selectedSlots");
      if (!selectedSlots) {
        setError("No slots found in localStorage.");
        return;
      }

      const parsedSlots = JSON.parse(selectedSlots) as { startTime: string; endTime: string }[];

      setLoading(true); // Start loading
      try {
        await Promise.all(
          parsedSlots.map((slot) =>
            axios.post("/api/db/book", {
              date: new Date(date as string).toISOString(),
              startTime: slot.startTime,
              endTime: slot.endTime,
              userName: name,
              userEmail: email,
              userLocation: location,
              phoneNumber,
            })
          )
        );
        localStorage.removeItem("selectedSlots");
        localStorage.removeItem("userLocation");
        alert("Slots booked successfully!");
      } catch (error: unknown) {
        console.error(error);
        setError("Failed to book the slot. Please try again.");
      } finally {
        setLoading(false); // Stop loading
        router.push("/");
      }
    };

    if (!hasBooked && phoneNumber && location && email) {
      console.log("Booking slot...");
      setHasBooked(true); // Mark that booking has been attempted
      bookSlots(); // Call the booking function
    }
  }, [email, hasBooked, phoneNumber, location, date, name, router]); // Run when dependencies change

  return (
    <div className="confirmation-container flex flex-col items-center justify-center h-screen w-full p-4">
      {loading ? (
        <div className="loading-message flex flex-col justify-center items-center text-center">
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
          <p className="mt-4 text-lg">Booking your slots, please wait...</p>
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
