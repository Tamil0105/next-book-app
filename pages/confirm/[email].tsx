import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';

const ConfirmationPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [hasBooked, setHasBooked] = useState(false); // State to track if booking has been attempted
  const router = useRouter();
  const { email, phoneNumber, location, start, end } = router.query;

  console.log(email, start, end);

  const bookSlot = async () => {
    if (start && end && email) { // Ensure email is also checked
      const eventDetails = {
        guests: [{ email: email, phone: phoneNumber }],
        summary: "Booking Event",
        start: { dateTime: start, timeZone: "Asia/Kolkata" },
        end: { dateTime: end, timeZone: "Asia/Kolkata" },
        phoneNumber: phoneNumber,
        location: location,
      };

      try {
        const response = await fetch("/api/book-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: eventDetails }),
        });

        if (!response.ok) {
          throw new Error("Failed to book the slot");
        }

        // const data = await response.json();
        // Redirect to a success page or another route after successful booking
        router.push('/'); // Change '/success' to your desired route
      } catch (error) {
        console.error("Error booking slot", error);
        setError("Failed to book the slot. Please try again.");
      }
    }
  };

  useEffect(() => {
    if (!hasBooked && start && end && email) { // Check if booking has not been attempted and all required values are present
      console.log("Booking slot...");
      bookSlot();
      setHasBooked(true); // Mark that booking has been attempted
    }
  }, [start, end, email, hasBooked]); // Run when start, end, or email changes

  return (
    <div className="confirmation-container flex flex-col items-center justify-center h-screen w-full p-4">
      {error ? (
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