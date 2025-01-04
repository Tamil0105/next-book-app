import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import dayjs from "dayjs";
import PaymentButton from "./paymentButton";
import { cashfree } from "@/utils/cashFree";

interface Slot {
  startTime: string;
  endTime: string;
  available: boolean;
}

const BookingWithDb = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<
    { startTime: string; endTime: string }[]
  >([]);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userLocation, setUserLocation] = useState<string>("Los Angeles");
  const [loading, setLoading] = useState<boolean>(false);
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);
  
  const [errors, setErrors] = useState<{
    userName?: string;
    userEmail?: string;
    phoneNumber?: string;
  }>({});
  // const [error, setError] = useState<boolean>(false);

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
  } => {
    const newErrors: {
      userName?: string;
      userEmail?: string;
      phoneNumber?: string;
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
  const initiatePayment = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (
      !selectedDate ||
      selectedSlots.length === 0 ||
      !userName ||
      !userEmail ||
      !userLocation ||
      !phoneNumber
    ) {
      alert("Please fill all fields and select at least one slot.");
      return;
    }
    setBookingLoading(true)
    setLoading(true);
    try {
      const response = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: "order_" + new Date().getTime(),
          orderAmount: selectedSlots.length * 500, // Use the order amount from props
          customerDetails: {
            customer_id: `customer_${Math.random().toString(36).substr(2, 9)}`, // Use the customer ID from props
            customer_name: userName, // Use the customer name from props
            customer_email: userEmail, // Use the customer email from props
            customer_phone: phoneNumber, // Use the customer phone from props
          },
        }),
      });

      const data = await response.json();
      const sessionId = data.data.payment_session_id;
      cashfree
        .checkout({
          paymentSessionId: sessionId,
          // redirectTarget:'next-app-iframe',
  
          returnUrl: `https://next-book-app-chi.vercel.app/confirm/page/${userEmail}?&phoneNumber=${phoneNumber}&location=${userLocation}&date=${selectedDate}&name=${userName}`,
        }
  )
        .then(function (result: { error: { message: unknown }; redirect: unknown }) {
          if (result.error) {
            alert(result.error.message);
          }
          if (result.redirect) {
            console.log("Redirection");
          }
        });
    } catch (error) {
      console.error("Error initiating payment:", error);
      // setError(true);
    } finally {
      setLoading(false);
      setBookingLoading(false)
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
    <div className="mx-auto p-4 w-full md:w-[70%]">
      {/* Date Picker */}
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

      {/* Loading Indicator */}
      {loading && (
        <div className="text-center mt-4 text-gray-500">Loading slots...</div>
      )}

      {/* Slots Display */}
      <div className="mt-4 items-center flex flex-wrap justify-center">
        {slots.map((slot, i) => (
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

      {/* User Details and Booking - Only visible if any slots are selected */}
      {selectedSlots.length > 0 && (
        <div className="w-full flex justify-center ">
          <div className="w-full flex md:w-[90%] flex-col gap-3 p-4">
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
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="border p-3 mb-2 w-full rounded-lg"
            />
            {errors.userEmail && (
              <div className="text-red-500 mb-2">{errors.userEmail}</div>
            )}

            <input
              type="tel"
              placeholder="Your Phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className={`w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
            />
            {errors.phoneNumber && (
              <div className="text-red-500 mb-2">{errors.phoneNumber}</div>
            )}

            <PaymentButton
            
              onClick={() => {
                initiatePayment();
              }}
              loading={loading}
            />
            {bookingLoading && (
              <div className="text-center mt-2 text-gray-500">
                Processing your booking...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingWithDb;
