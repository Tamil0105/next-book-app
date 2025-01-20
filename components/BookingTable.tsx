import React from 'react';
import { Table, Button, Spin } from 'antd';
import dayjs from 'dayjs';

interface Slot {
  date: string;
  startTime: string;
  endTime: string;
}

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

interface BookingsTableProps {
  loading: boolean;
  bookings: Booking[];
  handleOpenCancelBookingModal: (booking: Booking) => void;
}

const BookingsTable: React.FC<BookingsTableProps> = ({
  loading,
  bookings,
  handleOpenCancelBookingModal,
}) => {
  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD'),
    },
    {
      title: 'Booked Date',
      dataIndex: 'slots',
      render: (slots: Slot[]) => dayjs(slots[0].date).format('YYYY-MM-DD'),
    },
    {
      title: 'Slots',
      
      dataIndex: 'slots',
      render: (slots: Slot[]) => (
        <div className="flex py-4   w-full justify-center flex-wrap gap-2">
            <p className='text-transparent'>
ddddddddddddddddddddddd
            </p>
          {slots.map((slot, index) => (
            <span
              key={index}
              className="flex flex-row p-2 items-center justify-center shadow-lg text-xs font-semibold text-white bg-blue-600 rounded-full transition-transform transform hover:scale-105 hover:bg-blue-700"
            >
              {dayjs(slot.startTime).format('hh:mm A')} - {dayjs(slot.endTime).format('hh:mm A')}
            </span>
          ))}
        </div>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'userName',
    },
    {
      title: 'Persons',
      dataIndex: 'peopleCount',
    },
    {
      title: 'Email',
      dataIndex: 'userEmail',
    },
    {
      title: 'Phone',
      dataIndex: 'phoneNumber',
    },
    {
      title: 'Location',
      dataIndex: 'userLocation',
    },
    {
      title: 'Payment Status',
      dataIndex: 'paymentStatus',
      render: (text: string) => <span className="text-green-600">{text}</span>,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
    },
    {
      title: 'Order ID',
      dataIndex: 'orderId',
    },
    {
      title: 'Actions',
      render: (text: string, booking: Booking) => (
        <Button
          type="link"
          onClick={() => handleOpenCancelBookingModal(booking)}
          className="text-red-500"
        >
          Cancel & Refund
        </Button>
      ),
    },
  ];

  return (
    <div className="mt-4">
      {loading ? (
        <Spin tip="Loading bookings..." />
      ) : bookings.length === 0 ? (
        <p>No bookings available.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={bookings}
            rowKey={(record) => record.orderId} // Assuming orderId is unique
            pagination={false}
            className="min-w-full"
            scroll={{ x: true }} // Enable horizontal scrolling for small screens
          />
        </div>
      )}
    </div>
  );
};

export default BookingsTable;