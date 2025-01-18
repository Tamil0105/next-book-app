import { useSession } from "next-auth/react";
import LogoutButton from "@/components/LogoutButton";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import router from "next/router";
import axios from "axios";
import toast from "react-hot-toast";

type Booking = {
  id: string; // Assuming each booking has a unique ID
  date: string;
  slots: [{ date: string; startTime: string; endTime: string }];
  userName: string;
  userEmail: string;
  userLocation: string;
  phoneNumber: string;
  peopleCount: number;
  orderId: string;
  paymentStatus: string; // New field
  amount: number; // New field
};

const Modal = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex overflow-auto  px-56  items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white  rounded-lg p-4 shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [blockedDays, setBlockedDays] = useState<{id:number,date:string}[]>([]);
  const [newBlockedDay, setNewBlockedDay] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  // Modal states
  const [isCancelBookingModalOpen, setCancelBookingModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);



    const fetchBookings = async (page: number, limit: number) => {
        try {
          const response = await fetch(`/api/db/book-slots?page=${page}&limit=${limit}`);
          if (!response.ok) {
            throw new Error("Failed to fetch bookings");
          }
          const data = await response.json();
          setBookings(data.bookings);
          setTotalPages(data.totalPages);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

 
  const handleCancelBookingWithRefund = async (
    bookingId: string,
    orderId: string,
    refundAmount: number
  ) => {
    try {
      const response = await fetch(`/api/payment/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refundId: "refund" + new Date().getTime(),
          orderId,
          refundAmount,
          refundReason: "cancelled",
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to cancel booking");
      }
      await axios.delete(`/api/db/remove-book-order-id`, {
        params: { orderId: orderId },
      });
      toast.success("Removed Successfully")
      setBookings(bookings.filter((booking) => booking.id !== bookingId));
    } catch (error) {
      console.error(error);
    }
  };
  const handleCancelBookingWithoutRefund = async (
    bookingId: string,
  ) => {
    console.log(bookingId,"ppp")
    try {
      await axios.delete(`/api/db/remove-booking`, {
        params: { id: bookingId },
      });
      setBookings(bookings.filter((booking) => booking.id !== bookingId));
    } catch (error) {
      console.error(error);
    }
  };
  const handleRemoveBlockedDay = async (day: string) => {
    try {
      const response = await fetch("/api/db/remove-blocked-day", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ day }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error)
        throw new Error("Failed to remove blocked day");
      }
      setBlockedDays(blockedDays.filter((d) => d.date!== day));
    } catch (error) {
      console.error(error);
    }
  };
  

 
  const handleOpenCancelBookingModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setCancelBookingModalOpen(true);
  };

  const handleCloseCancelBookingModal = () => {
    setCancelBookingModalOpen(false);
    setSelectedBooking(null);
  };
  const handleConfirmCancelBooking = async () => {
    if (selectedBooking) {

        selectedBooking.orderId.startsWith('admin_create')?
      await handleCancelBookingWithoutRefund(
        selectedBooking.id,
      ):await handleCancelBookingWithRefund(
        selectedBooking.id,
        selectedBooking.orderId,
        selectedBooking.amount
      )
      handleCloseCancelBookingModal();
    }
  };
  const handleBlockDay = async () => {
    if (!newBlockedDay) return;


  
    try {
      const response = await fetch("/api/db/add-blocked-day", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ day: newBlockedDay }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error)
        throw new Error("Failed to block day");
      }
      setBlockedDays(data.blockedDays);
      setNewBlockedDay("");
    } catch (error) {
      console.error(error);
    }
  };
  
  useEffect(() => {
    const fetchBlockedDays = async () => {
      try {
        const response = await fetch("/api/db/get-blocked-days");
        if (!response.ok) {
          throw new Error("Failed to fetch blocked days");
        }
        const data = await response.json();
        console.log(data.blockedDays)
        setBlockedDays(data.blockedDays);
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchBlockedDays();
  }, []);
  useEffect(() => {
  fetchBookings(page, limit);
}, [page, limit]);
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="bg-gray-800 sticky z-30 top-0 text-white p-4">
        <div className=" container mx-auto flex justify-between items-center">
          <h1 className="text-lg font-bold">Admin Dashboard</h1>
          <LogoutButton />
        </div>
      </nav>

      <div className="flex-grow p-4 md:px-16 md:py-10 bg-gray-100">
        <h2 className="text-xl font-bold mb-4">
          Welcome, {session?.user?.name || "Admin"}!
        </h2>
        <div className="flex  justify-between">
          <h2 className="text-lg font-semibold mb-2">Bookings</h2>
          <button
            onClick={() =>{
             router.push("/admin/booking");

            }}
            className="mb-4 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition"
          >
            Create Booking
          </button>
        </div>
        <div className="flex justify-between mb-4">
  <div className="flex gap-2 border rounded-lg">
    <button
      onClick={() => setPage(page - 1)}
      disabled={page === 1}
      className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l"
    >
      Prev
    </button>

    <p className="flex items-center  text-center">{page}</p>
    <button
      onClick={() => setPage(page + 1)}
      disabled={page === totalPages}
      className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r"
    >
      Next
    </button>

  
  </div>
  <div>
    <select
      value={limit}
      onChange={(e) => setLimit(parseInt(e.target.value))}
      className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
    >
      <option value={5}>5</option>
      <option value={10}>10</option>
      <option value={15}>15</option>
    </select>
  </div>
</div>
        <div className="mt-4">
          {loading ? (
            <p>Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <p>No bookings available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-9 py-2 border">Date</th>
                    <th className="px-9 py-2 border">Booked Date</th>
                    <th className="px-16 py-2 border">Slots</th>
                    <th className="px-4 py-2 border">Name</th>
                    <th className="px-4 py-2 border">Persons</th>
                    <th className="px-4 py-2 border">Email</th>
                    <th className="px-4 py-2 border">Phone</th>
                    <th className="px-4 py-2 border">Location</th>
                    <th className="px-4 py-2 border">Payment Status</th>
                    <th className="px-4 py-2 border">Amount</th>
                    <th className="px-4 py-2 border">Order ID</th>
                    <th className="px-4 py-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking, index) => (
                    <tr
                      key={index}
                      className={`hover:bg-gray-50 ${
                        index % 2 === 0 ? "bg-gray-100" : "bg-white"
                      }`}
                    >
                      <td className="px-1 py-2 border text-center">
                        {dayjs(booking.date).format("YYYY-MM-DD")}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        {dayjs(booking.slots[0].date).format("YYYY-MM-DD")}
                      </td>
                      <td className="w-full border">
                        <div className="flex py-4 justify-center flex-wrap gap-4">
                          {booking.slots.map((slot, slotIndex) => (
                            <span
                              key={slotIndex}
                              className="flex flex-row p-2 items-center justify-center shadow-lg text-xs font-semibold text-white bg-blue-600 rounded-full transition-transform transform hover:scale-105 hover:bg-blue-700"
                            >
                              {dayjs(slot.startTime).format("hh:mm A")} -{" "}
                              {dayjs(slot.endTime).format("hh:mm A")}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-2 border">{booking.userName}</td>
                      <td className="px-4 py-2 border">
                        {booking.peopleCount}
                      </td>
                      <td className="px-4 py-2 border">{booking.userEmail}</td>
                      <td className="px-4 py-2 border">
                        {booking.phoneNumber}
                      </td>
                      <td className="px-4 py-2 border">
                        {booking.userLocation}
                      </td>
                      <td className="px-4 py-2 border text-green-600">
                        {booking.paymentStatus}
                      </td>
                      <td className="px-4 py-2 border">{booking.amount}</td>
                      <td className="px-4 py-2 border">{booking.orderId}</td>
                      <td className="px-4 py-2 border">
                        <button
                          onClick={() => handleOpenCancelBookingModal(booking)}
                          className="text-red-500 hover:underline"
                        >
                          Cancel & Refund
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 bg-white shadow-md rounded-lg p-6">
  <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Manage Blocked Days</h2>
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
    <input
      type="date"
      value={newBlockedDay}
      onChange={(e) => setNewBlockedDay(e.target.value)}
      className="border border-gray-300 rounded px-4 py-2 text-gray-700 focus:outline-none focus:ring focus:ring-green-300 mb-4 sm:mb-0 sm:mr-4 w-full sm:w-auto"
    />
    <button
      onClick={handleBlockDay}
      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition w-full sm:w-auto"
    >
     Add  Day
    </button>
  </div>
  {!blockedDays || blockedDays.length === 0 ? (
    <p className="text-gray-500 italic">No blocked days available.</p>
  ) : (
    <ul className="list-disc pl-5 space-y-3">
      {blockedDays.map((day, index) => (
        <li
          key={day.id}
          className="flex justify-between items-center bg-gray-50 p-3 rounded-lg shadow-sm hover:bg-gray-100 transition"
        >
          <span className="text-gray-800 font-medium">{day.date}</span>
          <button
            onClick={() => handleRemoveBlockedDay(day.date)}
            className="text-red-500 hover:text-red-600 hover:underline"
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  )}
</div>

      </div>

    
      <Modal
        isOpen={isCancelBookingModalOpen}
        onClose={handleCloseCancelBookingModal}
      >
        <h2 className="text-lg font-semibold mb-2">Confirm Cancellation</h2>
        <p>
          Are you sure you want to cancel the booking for{" "}
          {selectedBooking?.userName}?
        </p>
        <div className="flex justify-end mt-4">
          <button
            onClick={handleCloseCancelBookingModal}
            className="mr-2 text-gray-500 hover:underline"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmCancelBooking}
            className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition"
          >
            Confirm
          </button>
        </div>
      </Modal>
    </div>
  );
}
