import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';

// interface ConfirmationPageProps {
//   email: string;
//   description: string;
//   phoneNumber: string;
//   location: string;
//   selectedSlot: { start: string; end: string } | null; // Adjust the type as needed
// }

const ConfirmationPage = ({
//   email,
//   description,
//   phoneNumber,
//   location,
//   selectedSlot,
}) => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { email, phoneNumber, location, start, end } = router.query;
  const bookSlot = async () => {
    if (start&&end) {
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
         localStorage.removeItem('selectedSlots')    
         localStorage.removeItem('userLocation')     
 
        // const data = await response.json();
      } catch (error) {
        console.error("Error booking slot", error);
        setError("Failed to book the slot. Please try again.");
      }
    }
  };

  useEffect(() => {
    bookSlot();
  }, []); // Run once when the component mounts

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