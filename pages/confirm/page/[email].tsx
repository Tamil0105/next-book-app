import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const ConfirmationPage: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  const [error, setError] = useState<string | null>(null);
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

      try {
        await Promise.all(
          parsedSlots.map((slot) =>
            axios.post("/api/db/book", {
              date: date,
              startTime: slot.startTime,
              endTime: slot.endTime,
              userName: name,
              userEmail: email,
              userLocation: location,
              phoneNumber,
            })
          )
        );
        alert("Slots booked successfully!");
      } catch (error: any) {
        setError("Failed to book the slot. Please try again.");
      } finally {
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