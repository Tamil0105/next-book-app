import React, { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import Modal from "./modal";
const EventList = () => {
  const [events, setEvents] = useState([]);
  const [date, setDate] = useState<Dayjs | null>(null);
  // const [availableSlots, setAvailableSlots] = useState<{ start: string; end: string }[]>([]);
  // const [bookedSlots, setBookedSlots] = useState<{ start: string; end: string }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateDailySlots = (date: Dayjs) => {
    const slots = [];
    let startTime = date.set("hour", 7).set("minute", 0).set("second", 0).valueOf(); // 7:00 AM
    const endTime = date.set("hour", 18).set("minute", 0).set("second", 0).valueOf(); // 6:00 PM

    while (startTime < endTime) {
      const endTimeForSlot = startTime + 1 * 60 * 60 * 1000; // 1 hour
      slots.push({
        start: dayjs(startTime).toISOString(),
        end: dayjs(endTimeForSlot).toISOString(),
      });
      startTime = endTimeForSlot;
    }
    return slots;
  };

  // useEffect(() => {
  //   if (date) {
  //     fetch(`/api/get-events?date=${date.toISOString()}&timeMin=${date.set("hour", 7).set("minute", 0).set("second", 0).toISOString()}&timeMax=${date.set("hour", 18).set("minute", 0).set("second", 0).toISOString()}&intervalMinutes=60`)
  //       .then((res) => res.json())
  //       .then((data) => setEvents(data.availableSlots))
  //       .catch((err) => console.error(err));
  //   }
  // }, [date]);
  useEffect(() => {
    if (date) {
      setLoading(true); // Enable loading
      fetch(`/api/get-events?date=${date.toISOString()}&timeMin=${date.set("hour", 7).set("minute", 0).set("second", 0).toISOString()}&timeMax=${date.set("hour", 18).set("minute", 0).set("second", 0).toISOString()}&intervalMinutes=60`)
        .then((res) => res.json())
        .then((data) => {
          setEvents(data.availableSlots);
          setLoading(false); // Disable loading after success
        })
        .catch((err) => {
          console.error(err);
          setLoading(false); // Disable loading on error
        });
    }
  }, [date]);
  const findAvailableSlots = async () => {
    if (!date) {
      alert("Please select a date.");
      return;
    }

    setLoading(true); // Start loading
    // const timeMin = date.startOf("day").toISOString(); // Start of the day
    // const timeMax = date.endOf("day").toISOString(); // End of the day

    // Generate slots for the day (7 AM to 6 PM)
    const allDaySlots = generateDailySlots(date);

    // Filter out busy slots
    const freeSlots = allDaySlots.filter(
      (slot) =>
        !events.some(
          (busy :{start:string,end:string}) =>
            dayjs((busy).start).isBefore(dayjs(slot.end)) &&
            dayjs((busy).end).isAfter(dayjs(slot.start))
        )
    );
   console.log(freeSlots.length,)
    // setAvailableSlots(freeSlots);
    // setBookedSlots(events);
    setLoading(false); // End loading
  };

  const bookSlot = async (email: string, description: string, phoneNumber: string, location: string) => {
    if (selectedSlot) {
      const eventDetails = {
        guests: [{ email: email, phone: phoneNumber }],
        summary: description || "Booking Event",
        start: { dateTime: selectedSlot.start, timeZone: "Asia/Kolkata" },
        end: { dateTime: selectedSlot.end, timeZone: "Asia/Kolkata" },
        phoneNumber: phoneNumber, // Include phone number
        location: location, // Include location
      };
      try {
        await fetch("/api/book-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event:eventDetails }),
        });
        setEvents([])
        alert("Slot booked successfully!");
        findAvailableSlots(); // Refresh slots after booking
      } catch (error) {
        console.error("Error booking slot", error);
      }
    }
  };

  return (
    <div className="min-h-screen  p-4">
      <div className="max-w-full mx-auto bg-white  rounded-lg p-6">

        <div className="flex items-center justify-center border-b gap-4 p-2">
          <input
            type="date"
            onChange={(e) => setDate(dayjs(e.target.value))}
            className="md:w-[18%] w-full border border-gray-300 rounded-md p-2"
          />
          {/* <button
            onClick={findAvailableSlots}
            className="bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600"
          >
            Available  Slots
          </button> */}
        </div>

        {loading ? (
          <div className="text-center">
            <svg
              className="animate-spin h-8 w-8 text-blue-500 mx-auto"
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
                d="M4 12a8 8 0 018-8v4a4 4 0 000 8H4z"
              ></path>
            </svg>
          </div>
        ) : (
          <div className="py-5 px-10 ">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {events.map((slot:{start:string,end:string}, index) => (
              <div
                key={index}
                className="py-4 px-6 border rounded-lg shadow-sm hover:shadow-md hover:bg-blue-50 cursor-pointer transition-all duration-200"
                onClick={() => {
                  setSelectedSlot(slot);
                  setIsModalOpen(true);
                }}
              >
                <p className="text-sm font-medium text-gray-600">
                  {dayjs((slot).start).format("hh:mm A")} - {dayjs((slot).end).format("hh:mm A")}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        )}
      </div>
       
      {isModalOpen && (
        <Modal
        selectedSlot={selectedSlot??{end:"",start:""}}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={(email, description, phoneNumber, location) => {
            bookSlot(email, description, phoneNumber, location);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default EventList;
