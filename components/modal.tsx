import React, { useState } from "react";
import PaymentButton from "./paymentButton";
import { cashfree } from "@/utils/cashFree";

interface ModalProps {
  isOpen: boolean;
  selectedSlot: { start: string; end: string };
  onClose: () => void;
  onConfirm: (
    email: string,
    description: string,
    phoneNumber: string,
    location: string
  ) => void;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  selectedSlot,
  // onConfirm,
}) => {
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});
  // const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const locations = [
    "Location 1",
    "Location 2",
    "Location 3",
    "Location 4",
    "Location 5",
  ]; // Replace with your actual locations

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name) newErrors.name = "Name is required.";
    if (!email) newErrors.email = "Email is required.";
    if (email && !/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Email is invalid.";
    if (!description) newErrors.description = "Description is required.";
    if (!phoneNumber) newErrors.phoneNumber = "Phone number is required.";
    if (phoneNumber && !/^\d{10}$/.test(phoneNumber))
      newErrors.phoneNumber = "Phone number must be 10 digits.";
    if (!location) newErrors.location = "Location is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const initiatePayment = async () => {
    if (!validateForm()) {
      return; // Exit if there are validation errors
    }
    setLoading(true);
    try {
      const response = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: "order_" + new Date().getTime(),
          orderAmount: 500, // Use the order amount from props
          customerDetails: {
            customer_id: `customer_${Math.random().toString(36).substr(2, 9)}`, // Use the customer ID from props
            customer_name: name, // Use the customer name from props
            customer_email: email, // Use the customer email from props
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
  
          returnUrl: `https://next-book-app-chi.vercel.app/confirm/${email}?&phoneNumber=${phoneNumber}&location=${location}&start=${selectedSlot.start}&end=${selectedSlot.end}`,
        })
        .then(function (result: { error: { message: unknown }; redirect: unknown }) {
          if (result.error) {
            alert(result.error.message);
          }
          if (result.redirect) {
            onClose();
            console.log("Redirection");
          }
        });
    } catch (error) {
      console.error("Error initiating payment:", error);
      // setError(true);
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg sm:max-w-xl md:max-w-2xl p-4 sm:p-6 md:p-8 overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Booking Details
        </h2>
        <form>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`w-full border ${
                errors.description ? "border-red-500" : "border-gray-300"
              } rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className={`w-full border ${
                errors.phoneNumber ? "border-red-500" : "border-gray-300"
              } rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={`w-full border ${
                errors.location ? "border-red-500" : "border-gray-300"
              } rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
            >
              <option value="">Select a location</option>
              {locations.map((loc, index) => (
                <option key={index} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            {errors.location && (
              <p className="text-red-500 text-sm">{errors.location}</p>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <PaymentButton onClick={initiatePayment} loading={loading} />
            {/* <button
              type="button"
              onClick={handleConfirm}
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              Confirm Booking
            </button> */}
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;
