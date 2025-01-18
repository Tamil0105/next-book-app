import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import router from "next/router";

interface Slot {
  startTime: string;
  endTime: string;
  available: boolean;
}

const AdminBooking = () => {
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<
    { startTime: string; endTime: string }[]
  >([]);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [userLocation, setUserLocation] = useState<string>("Los Angeles");
  const [peopleCount, setPeopleCount] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);
  
  const [errors, setErrors] = useState<{
    userName?: string;
    userEmail?: string;
    phoneNumber?: string;
    peopleCount?: string;
  }>({});

  const locations = [
    "New York",
    "Los Angeles",
    "Chicago",
    "Houston",
    "Phoenix",
  ];

  const validateForm = (): {
    userName?: string;
    userEmail?: string;
    phoneNumber?: string;
    peopleCount?: string;
  } => {
    const newErrors: {
      userName?: string;
      userEmail?: string;
      phoneNumber?: string;
      peopleCount?: string;
    } = {};
    if (!userName) newErrors.userName = "Name is required.";
    if (!userEmail) {
      newErrors.userEmail = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(userEmail)) {
      newErrors.userEmail = "Email is invalid.";
    }
    if (!phoneNumber) {
      newErrors.phoneNumber = "Phone number is required.";
    } else if (!/^\d{10}$/.test(phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be 10 digits.";
    }
    if (peopleCount <= 0) {
      newErrors.peopleCount = "People count must be at least 1.";
    }
    return newErrors;
  };

  const fetchSlots = async (date: Date) => {
    const formattedDate = dayjs(date).format("YYYY-MM-DD");
    setLoading(true);
    try {
      const response = await axios.get(
        `/api/db/slots?date=${formattedDate}&userLocation=${userLocation}`
      );
      setSlots(response.data);
    } catch (error) {
      console.error("Error fetching slots:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSlotSelection = (slot: {
    startTime: string;
    endTime: string;
  }) => {
    setSelectedSlots((prevSelected) => {
      const isSelected = prevSelected.some(
        (s) => s.startTime === slot.startTime && s.endTime === slot.endTime
      );
      if (isSelected) {
        return prevSelected.filter(
          (s) => s.startTime !== slot.startTime || s.endTime !== slot.endTime
        );
      } else {
        return [...prevSelected, slot];
      }
    });
  };

  const bookSlots = async () => {
    const selectedSlots = localStorage.getItem("selectedSlots");
    if (!selectedSlots) {
      setError("No slots found in localStorage.");
      return;
    }

    const parsedSlots = JSON.parse(selectedSlots) as { startTime: string; endTime: string }[];
    setLoading(true);
    try {
      await Promise.all(
        parsedSlots.map((slot) =>
          axios.post("/api/db/book", {
            date: new Date(selectedDate as unknown as string).toISOString(),
            startTime: slot.startTime,
            endTime: slot.endTime,
            userName: userName,
            userEmail: userEmail,
            userLocation,
            peopleCount: peopleCount,
            paymentStatus: 'PAID',
            orderId: `admin_create_${new Date().getTime()}`,
            amount: '1000',
            phoneNumber,
          })
        )
      );

      localStorage.removeItem("selectedSlots");
      localStorage.removeItem("userLocation");
      toast.success("Slots booked successfully!");
    } catch (error: unknown) {
      toast.error('Failed to book the slot. Please try again.');
      setError("Failed to book the slot. Please try again.");
    } finally {
        
      setLoading(false);
      router.push("/admin/dashboard");

    
    }
  };

  useEffect(() => {
    const storedLocation = localStorage.getItem("userLocation");
    const storedSlots = localStorage.getItem("selectedSlots");

    if (storedLocation) {
      setUserLocation(storedLocation);
    }
    if (storedSlots) {
      setSelectedSlots(JSON.parse(storedSlots));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("userLocation", userLocation);
  }, [userLocation]);

  useEffect(() => {
    localStorage.setItem("selectedSlots", JSON.stringify(selectedSlots));
  }, [selectedSlots]);

  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate);
    }
  }, [selectedDate, userLocation]);

  return (
    <div className="mx-auto p-4 h-full">
      <div className="flex md:flex-row flex-col justify-center gap-3">
        <DatePicker
          placeholderText="Choose Date.."
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          className="border w-full p-3 rounded-lg shadow-md"
          dateFormat="yyyy-MM-dd"
        />

        <select
          value={userLocation}
          onChange={(e) => setUserLocation(e.target.value)}
          className="border h-12 p-2 w-full md:w-1/5 rounded-lg"
        >
          <option value="" disabled>
            Select Your Location
          </option>
          {locations.map((location, index) => (
            <option key={index} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center mt-4 text-gray-500">Loading slots...</div>
      ):(slots.length===0&&selectedDate!=undefined)&&<div className="text-center mt-4 text-gray-500">No Available Slots</div>}

      <div className="mt-4 items-center flex flex-wrap justify-center">
        { slots.map((slot, i) => (
          <button
            key={i}
            className={`px-6 py-3 m-2 border rounded-lg transition duration-300 shadow-lg ${
              selectedSlots.some(
                (s) =>
                  s.startTime === slot.startTime && s.endTime === slot.endTime
              )
                ? "bg-blue-500 text-white"
                : slot.available
                ? "bg-blue-50 hover:bg-blue-100 hover:border-blue-500 text-blue-500"
                : "bg-gray-200 text-slate-400"
            }`}
            onClick={() =>
              slot.available &&
              toggleSlotSelection({
                endTime: slot.endTime,
                startTime: slot.startTime,
              })
            }
            disabled={!slot.available}
          >
            {dayjs(new Date(slot.startTime)).format("hh:mm A")} -{" "}
            {dayjs(new Date(slot.endTime)).format("hh:mm A")}
          </button>
        ))}
      </div>

      {selectedSlots.length > 0 && (
        <div className="w-full flex justify-center">
          <div className="w-full flex md:w-[90%] flex-col gap-3 p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Your Details</h2>
            <input
              type="text"
              placeholder="Your Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="border p-3 mb-2 w-full rounded-lg"
            />
            {errors.userName && (
              <div className="text-red-500 mb-2">{errors.userName}</div>
            )}

            <input
              type="email"
              placeholder="Your Email"
              value ={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="border p-3 mb-2 w-full rounded-lg"
            />
            {errors.userEmail && (
              <div className="text-red-500 mb-2">{errors.userEmail}</div>
            )}

            <input
              type="text"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="border p-3 mb-2 w-full rounded-lg"
            />
            {errors.phoneNumber && (
              <div className="text-red-500 mb-2">{errors.phoneNumber}</div>
            )}

            <input
              type="number"
              value={peopleCount}
              onChange={(e) => setPeopleCount(Number(e.target.value))}
              className="border p-3 mb-2 w-full rounded-lg"
              min="1"
              placeholder="Number of People"
            />
            {errors.peopleCount && (
              <div className="text-red-500 mb-2">{errors.peopleCount}</div>
            )}

            <div className="w-full mt-5">
              <button
                onClick={bookSlots}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
              >
                Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBooking;