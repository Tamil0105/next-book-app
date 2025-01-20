
// import React, { useState, useEffect } from "react";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import axios from "axios";
// import dayjs from "dayjs";
// import PaymentButton from "./paymentButton";
// import { cashfree } from "@/utils/cashFree";

// interface Slot {
//   startTime: string;
//   endTime: string;
//   available: boolean;
// }

// const BookingWithDb = () => {
//   const [selectedDate, setSelectedDate] = useState<Date | null>(null);
//   const [slots, setSlots] = useState<Slot[]>([]);
//   const [selectedSlots, setSelectedSlots] = useState<
//     { startTime: string; endTime: string }[]
//   >([]);
//   const [userName, setUserName] = useState<string>("");
//   const [userEmail, setUserEmail] = useState<string>("");
//   const [phoneNumber, setPhoneNumber] = useState<string>("");
//   const [userLocation, setUserLocation] = useState<string>("Los Angeles");
//   const [peopleCount, setPeopleCount] = useState<number>(1);  // New people count field
//   const [loading, setLoading] = useState<boolean>(false);
//   // const [bookingLoading, setBookingLoading] = useState<boolean>(false);
  
//   const [errors, setErrors] = useState<{
//     userName?: string;
//     userEmail?: string;
//     phoneNumber?: string;
//     peopleCount?: string; // Error for people count
//   }>({});

//   const locations = [
//     "New York",
//     "Los Angeles",
//     "Chicago",
//     "Houston",
//     "Phoenix",
//   ];

//   const validateForm = (): {
//     userName?: string;
//     userEmail?: string;
//     phoneNumber?: string;
//     peopleCount?: string;  // Validation for people count
//   } => {
//     const newErrors: {
//       userName?: string;
//       userEmail?: string;
//       phoneNumber?: string;
//       peopleCount?: string;
//     } = {};
//     if (!userName) newErrors.userName = "Name is required.";
//     if (!userEmail) {
//       newErrors.userEmail = "Email is required.";
//     } else if (!/\S+@\S+\.\S+/.test(userEmail)) {
//       newErrors.userEmail = "Email is invalid.";
//     }
//     if (!phoneNumber) {
//       newErrors.phoneNumber = "Phone number is required.";
//     } else if (!/^\d{10}$/.test(phoneNumber)) {
//       newErrors.phoneNumber = "Phone number must be 10 digits.";
//     }
//     if (peopleCount <= 0) {
//       newErrors.peopleCount = "People count must be at least 1.";
//     }
//     return newErrors;
//   };

//   const fetchSlots = async (date: Date) => {
//     const formattedDate = dayjs(date).format("YYYY-MM-DD");
//     setLoading(true);
//     try {
//       const response = await axios.get(
//         `/api/db/slots?date=${formattedDate}&userLocation=${userLocation}`
//       );
//       setSlots(response.data);
//     } catch (error) {
//       console.error("Error fetching slots:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleSlotSelection = (slot: {
//     startTime: string;
//     endTime: string;
//   }) => {
//     setSelectedSlots((prevSelected) => {
//       const isSelected = prevSelected.some(
//         (s) => s.startTime === slot.startTime && s.endTime === slot.endTime
//       );
//       if (isSelected) {
//         return prevSelected.filter(
//           (s) => s.startTime !== slot.startTime || s.endTime !== slot.endTime
//         );
//       } else {
//         return [...prevSelected, slot];
//       }
//     });
//   };

//   const initiatePayment = async () => {
//     const validationErrors = validateForm();
//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       return;
//     }
//     if (
//       !selectedDate ||
//       selectedSlots.length === 0 ||
//       !userName ||
//       !userEmail ||
//       !userLocation ||
//       !phoneNumber
//     ) {
//       alert("Please fill all fields and select at least one slot.");
//       return;
//     }
//     // setBookingLoading(true);
//     setLoading(true);
//     try {
//       const response = await fetch("/api/payment/initiate", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           orderId: "order_" + new Date().getTime(),
//           orderAmount: selectedSlots.length * 500 * peopleCount, // Order amount based on people count
//           customerDetails: {
//             customer_id: `customer_${Math.random().toString(36).substr(2, 9)}`,
//             customer_name: userName,
//             customer_email: userEmail,
//             customer_phone: phoneNumber,
//           },
//         }),
//       });

//       const data = await response.json();

//       const sessionId = data.data.payment_session_id;
//       cashfree
//         .checkout({
//           paymentSessionId: sessionId,
//           redirectTarget: "_self",

//           // returnUrl :`https://test.cashfree.com/pgappsdemos/return.php?{{order_status}}`
//           returnUrl: `http://localhost:3000/confirm/page/${userEmail}?orderId={order_id}&status={order_status}&phoneNumber=${phoneNumber}&location=${userLocation}&date=${selectedDate}&name=${userName}&count=${peopleCount}&amount=${selectedSlots.length * 500 * peopleCount}`,
//         })
//         .then(function (result: { error: { message: unknown }; redirect: unknown }) {
//           if (result.error) {
//             alert(result.error.message);
//           }
//           if (result.redirect) {
//             console.log(result)
//             console.log("Redirection");
//           }
//         });
//       } catch (error) {
//         console.error("Error initiating payment:", error);
//       } finally {
//         setLoading(false);
//         // setBookingLoading(false);
//       }
      
//   };

//   useEffect(() => {
//     const storedLocation = localStorage.getItem("userLocation");
//     const storedSlots = localStorage.getItem("selectedSlots");

//     if (storedLocation) {
//       setUserLocation(storedLocation);
//     }
//     if (storedSlots) {
//       setSelectedSlots(JSON.parse(storedSlots));
//     }
//   }, []);

//   useEffect(() => {
//     localStorage.setItem("userLocation", userLocation);
//   }, [userLocation]);

//   useEffect(() => {
//     localStorage.setItem("selectedSlots", JSON.stringify(selectedSlots));
//   }, [selectedSlots]);

//   useEffect(() => {
//     if (selectedDate) {
//       fetchSlots(selectedDate);
//     }
//   }, [selectedDate, userLocation]);

//   return (
//     <div className="mx-auto p-4 w-full md:w-[70%]">
//       {/* Date Picker */}
//       <div className="flex md:flex-row flex-col justify-center gap-3">
//         <DatePicker
//           placeholderText="Choose Date.."
//           selected={selectedDate}
//           onChange={(date) => setSelectedDate(date)}
//           className="border w-full p-3 rounded-lg shadow-md"
//           dateFormat="yyyy-MM-dd"
//         />

//         <select
//           value={userLocation}
//           onChange={(e) => setUserLocation(e.target.value)}
//           className="border h-12 p-2 w-full md:w-1/5 rounded-lg"
//         >
//           <option value="" disabled>
//             Select Your Location
//           </option>
//           {locations.map((location, index) => (
//             <option key={index} value={location}>
//               {location}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Loading Indicator */}
//       {loading ? (
//         <div className="text-center mt-4 text-gray-500">Loading slots...</div>
//       ):(slots.length===0&&selectedDate!=undefined)&&<div className="text-center mt-4 text-gray-500">No Available Slots</div>}

//       {/* Slots Display */}
//       <div className="mt-4 items-center flex flex-wrap justify-center">
//         {slots.map((slot, i) => (
//           <button
//             key={i}
//             className={`px-6 py-3 m-2 border rounded-lg transition duration-300 shadow-lg ${
//               selectedSlots.some(
//                 (s) =>
//                   s.startTime === slot.startTime && s.endTime === slot.endTime
//               )
//                 ? "bg-blue-500 text-white"
//                 : slot.available
//                 ? "bg-blue-50 hover:bg-blue-100 hover:border-blue-500 text-blue-500"
//                 : "bg-gray-200 text-slate-400"
//             }`}
//             onClick={() =>
//               slot.available &&
//               toggleSlotSelection({
//                 endTime: slot.endTime,
//                 startTime: slot.startTime,
//               })
//             }
//             disabled={!slot.available}
//           >
//             {dayjs(new Date(slot.startTime)).format("hh:mm A")} -{" "}
//             {dayjs(new Date(slot.endTime)).format("hh:mm A")}
//           </button>
//         ))}
//       </div>

//       {/* User Details and Booking - Only visible if any slots are selected */}
//       {selectedSlots.length > 0 && (
//         <div className="w-full flex justify-center ">
//           <div className="w-full flex md:w-[90%] flex-col gap-3 p-4">
//             <h2 className="text-2xl font-semibold mb-4">Your Details</h2>
//             <input
//               type="text"
//               placeholder="Your Name"
//               value={userName}
//               onChange={(e) => setUserName(e.target.value)}
//               className="border p-3 mb-2 w-full rounded-lg"
//             />
//             {errors.userName && (
//               <div className="text-red-500 mb-2">{errors.userName}</div>
//             )}

//             <input
//               type="email"
//               placeholder="Your Email"
//               value={userEmail}
//               onChange={(e) => setUserEmail(e.target.value)}
//               className="border p-3 mb-2 w-full rounded-lg"
//             />
//             {errors.userEmail && (
//               <div className="text-red-500 mb-2">{errors.userEmail}</div>
//             )}

//             <input
//               type="text"
//               placeholder="Phone Number"
//               value={phoneNumber}
//               onChange={(e) => setPhoneNumber(e.target.value)}
//               className="border p-3 mb-2 w-full rounded-lg"
//             />
//             {errors.phoneNumber && (
//               <div className="text-red-500 mb-2">{errors.phoneNumber}</div>
//             )}

//             {/* New people count input */}
//             <input
//               type="number"
//               value={peopleCount}
//               onChange={(e) => setPeopleCount(Number(e.target.value))}
//               className="border p-3 mb-2 w-full rounded-lg"
//               min="1"
//               placeholder="Number of People"
//             />
//             {errors.peopleCount && (
//               <div className="text-red-500 mb-2">{errors.peopleCount}</div>
//             )}

//             <div className="w-full mt-5">
//                        <PaymentButton
            
//                           onClick={() => {
//                             initiatePayment();
//                           }}
//                           loading={loading}
//                         />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BookingWithDb;
import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import toast from "react-hot-toast";
import router from "next/router";
import { Button, DatePicker, Form, Input, Select, Spin, Row, Col } from "antd";
import PaymentButton from "./paymentButton";
import { cashfree } from "@/utils/cashFree";

interface Slot {
  startTime: string;
  endTime: string;
  available: boolean;
}

interface BlockedDays {
  id: number;
  timeRanges: { start: string; end: string }[];
  isWeekendDisabled: boolean;
  blockedDays: string[];
  dateRange: { start: string; end: string };
}

const dateFormat = "YYYY-MM-DD";

const BookingWithDb = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [duration, setDuration] = useState<number>(1);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [userLocation, setUserLocation] = useState<string>("Los Angeles");
  const [peopleCount, setPeopleCount] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{
    userName?: string;
    userEmail?: string;
    phoneNumber?: string;
    peopleCount?: string;
  }>({});
  const [disableWeekends, setDisableWeekends] = useState<boolean>(false);
  const [blockedDaysConfig, setBlockedDaysConfig] = useState<BlockedDays>({
    id: 0,
    timeRanges: [],
    isWeekendDisabled: true,
    blockedDays: [],
    dateRange: {
      start: dayjs().subtract(7, "day").toISOString(),
      end: dayjs().toISOString(),
    }, // Default date range
  });
  const locations = [
    "New York",
    "Los Angeles",
    "Chicago",
    "Houston",
    "Phoenix",
  ];

  useEffect(() => {
    const fetchBlockedDays = async () => {
      setLoading(true); // Start loading
      try {
        const response = await fetch("/api/db/manage-days");
        const data = await response.json();
        setBlockedDaysConfig(data[0] || blockedDaysConfig); // Assuming you want the first config
        setDisableWeekends(data[0]?.isWeekendDisabled || false); // Set initial state for the switch
      } catch (error) {
        console.error("Error fetching blocked days:", error);
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchBlockedDays();
  }, []);

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

  const calculateTotalAmount = () => {
    return 500 * peopleCount * duration; // 500 per person per hour
  };

  const initiatePayment = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (!selectedSlot || !selectedDate) {
      toast.error("Please select a slot and date.");
      return;
    }

    const startTime = selectedSlot.startTime;
    const endTime = dayjs(startTime).add(duration, "hour").toISOString();
    if (
      !selectedDate ||
      !userName ||
      !userEmail ||
      !userLocation ||
      !phoneNumber
    ) {
      toast.error("Please fill all fields and select at least one slot.");
      return;
    }

    setLoading(true);
    try {
      const orderAmount = calculateTotalAmount(); // Calculate the order amount

      const response = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: "order_" + new Date().getTime(),
          orderAmount: orderAmount, // Updated order amount
          customerDetails: {
            customer_id: `customer_${Math.random().toString(36).substr(2, 9)}`,
            customer_name: userName,
            customer_email: userEmail,
            customer_phone: phoneNumber,
          },
        }),
      });

      const data = await response.json();

      const sessionId = data.data.payment_session_id;
      cashfree
        .checkout({
          paymentSessionId: sessionId,
          redirectTarget: "_self",
          returnUrl: `http://localhost:3000/confirm/page/${userEmail}?orderId={order_id}&status={order_status}&start=${startTime}&end=${endTime}&phoneNumber=${phoneNumber}&location=${userLocation}&date=${selectedDate}&name=${userName}&count=${peopleCount}&amount=${orderAmount}`,
        })
        .then(function (result: { error: { message: unknown }; redirect: unknown }) {
          if (result.error) {
            alert(result.error.message);
          }
          if (result.redirect) {
            console.log(result);
            console.log("Redirection");
          }
        });
    } catch (error) {
      console.error("Error initiating payment:", error);
    } finally {
      setLoading(false);
    }
  };

  const bookSlot = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!selectedSlot || !selectedDate) {
      toast.error("Please select a slot and date.");
      return;
    }

    const startTime = selectedSlot.startTime;
    const endTime = dayjs(startTime).add(duration, "hour").toISOString();

    setLoading(true);
    try {
      await axios.post("/api/db/book", {
        date: startTime,
        startTime,
        endTime,
        userName,
        userEmail,
        userLocation,
        peopleCount,
        paymentStatus: "PAID",
        orderId: `admin_create_${new Date().getTime()}`,
        amount: calculateTotalAmount(), // Use the calculated amount
        phoneNumber,
      });

      toast.success("Slot booked successfully!");
      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Failed to book the slot:", error);
      toast.error("Failed to book the slot. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate);
    }
  }, [selectedDate, userLocation]);

  const disableDate = (current: Dayjs) => {
    return disableWeekends
      ? current.day() === 0 ||
          current.day() === 6 ||
          current < dayjs(blockedDaysConfig.dateRange.start) ||
          current > dayjs(blockedDaysConfig.dateRange.end)
      : current < dayjs(blockedDaysConfig.dateRange.start) ||
          current > dayjs(blockedDaysConfig.dateRange.end); // Disable weekends if toggle is on
  };

  return (
    <div className="mx-auto p-4 w-full md:w-[50%] h-full">
      <Row gutter={16} className="">
        <Col xs={24} md={12}>
          <Select
            value={userLocation}
            onChange={(value) => setUserLocation(value)}
            className="w-full"
            placeholder="Select Your Location"
          >
            {locations.map((location, index) => (
              <Select.Option key={index} value={location}>
                {location}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} md={12}>
          <DatePicker
            className="w-full"
            defaultValue={dayjs(
              new Date(blockedDaysConfig.dateRange.start).toISOString()
            )}
            onChange={(date) => {
              setSelectedDate(date ? date.toDate() : null);
              if (date) {
                fetchSlots(date.toDate());
              }
            }}
            disabledDate={disableDate}
          />
        </Col>
      </Row>

      {loading ? (
        <div className="text-center mt-4 text-gray-500">
          <Spin /> Loading slots...
        </div>
      ) : (
        slots.length === 0 &&
        selectedDate != undefined && (
          <div className="text-center mt-4 text-gray-500">
            No Available Slots
          </div>
        )
      )}

      <div className="mt-4 flex flex-col justify-center">
        {selectedDate && (
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Select Start Time
          </h2>
        )}
        <div className="flex flex-wrap justify-center bg-white rounded-md shadow-lg">
          {slots.map((slot, i) => (
            <Button
              key={i}
              className={`m-2 transition duration-200 ease-in-out ${
                selectedSlot?.startTime === slot.startTime
                  ? "bg-blue-500 text-white"
                  : slot.available
                  ? "bg-blue-50 hover:bg-blue-100 text-blue-500"
                  : "bg-gray-200 text-slate-400"
              }`}
              onClick={() => slot.available && setSelectedSlot(slot)}
              disabled={!slot.available}
            >
              {dayjs(new Date(slot.startTime)).format("hh:mm A")}
            </Button>
          ))}
        </div>
      </div>

      {selectedSlot && (
        <div className="w-full flex justify-center mt-4">
          <div className="w-full md:w-[100%] flex flex-col gap-3 p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Your Details</h2>
            <Form layout="vertical">
              <Form.Item
                label="Your Name"
                validateStatus={errors.userName ? "error" : ""}
                help={errors.userName}
              >
                <Input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </Form.Item>
              <Form.Item
                label="Your Email"
                validateStatus={errors.userEmail ? "error" : ""}
                help={errors.userEmail}
              >
                <Input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                />
              </Form.Item>
              <Form.Item
                label="Phone Number"
                validateStatus={errors.phoneNumber ? "error" : ""}
                help={errors.phoneNumber}
              >
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </Form.Item>
              <Form.Item
                label="Number of People"
                validateStatus={errors.peopleCount ? "error" : ""}
                help={errors.peopleCount}
              >
                <Input
                  type="number"
                  className="w-24"
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(Number(e.target.value))}
                  min="1"
                />
              </Form.Item>
              <Form.Item label="Duration (hours)">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setDuration((prev) => Math.max(prev - 1, 1))}
                    disabled={duration <= 1}
                  >
                    -
                  </Button>
                  <Input
                    className="text-center w-16"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    min="1"
                  />
                  <Button onClick={() => setDuration((prev) => prev + 1)}>
                    +
                  </Button>
                </div>
              </Form.Item>
              {/* Display Total Amount */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold">
                  Total Amount: ₹{calculateTotalAmount()}
                </h3>
              </div>
            
              <Form.Item>
                <PaymentButton
                  onClick={() => {
                    initiatePayment();
                  }}
                  loading={loading}
                />
              </Form.Item>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingWithDb;
