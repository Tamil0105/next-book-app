import { useState } from "react";
import BookingWitDb from "@/components/BookingWithDb";
import EventList from "@/components/EventList";

export default function Home() {
  const [activeComponent] = useState<"booking" | "event">("booking");

  return (
    <div className="py-10">
      <h1 className="text-4xl font-bold text-center mb-6 text-blue-600">
        Booking Your Slots
      </h1>

      {/* Toggle Controls */}
      {/* <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setActiveComponent("booking")}
          className={`px-4 py-2 rounded ${
            activeComponent === "booking" ? "bg-blue-500 text-white" : "bg-gray-300 text-black"
          }`}
        >
          Booking
        </button>
        <button
          onClick={() => setActiveComponent("event")}
          className={`px-4 py-2 rounded ${
            activeComponent === "event" ? "bg-blue-500 text-white" : "bg-gray-300 text-black"
          }`}
        >
          Google Booking 
        </button>
      </div> */}

      {/* Conditionally Render Components */}
      {activeComponent === "booking" && <BookingWitDb />}
      {activeComponent === "event" && <EventList />}
    </div>
  );
}
