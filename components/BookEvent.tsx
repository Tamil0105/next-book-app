'use client'


import React, { useState } from "react";
import { Event } from "../types";

const BookEvent: React.FC = () => {
  const [title, setTitle] = useState<string>("");
  const [dateTime, setDateTime] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const event: Event = {
      summary: "Team Meeting",
      start: { "dateTime": "2024-12-31T10:00:00-05:00" },
      end: { "dateTime": "2024-12-31T11:00:00-05:00" },
      location: "Conference Room A",
      guests: [
        { email: "guest1@example.com", "phone": "+1234567890" },
      ]
    };

    const res = await fetch("/api/book-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event }),
    });

    if (res.ok) alert("Event booked successfully!");
    else alert("Error booking event.");
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <h2 className="text-xl font-bold">Book an Event</h2>
      <input
        type="text"
        placeholder="Event Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="block w-full p-2 border mb-4"
      />
      <input
        type="datetime-local"
        value={dateTime}
        onChange={(e) => setDateTime(e.target.value)}
        className="block w-full p-2 border mb-4"
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Book Event
      </button>
    </form>
  );
};

export default BookEvent;
