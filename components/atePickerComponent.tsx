import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Props {
  onDateChange: (date: Date | null) => void;
}

const DatePickerComponent: React.FC<Props> = ({ onDateChange }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  return (
    <div className="p-10 bg-red-300">
      <h2 className="text-xl font-bold">Select a Date</h2>
      <DatePicker
        selected={selectedDate}
        onChange={(date) => {
          setSelectedDate(date);
          onDateChange(date);
        }}
        inline
      />
    </div>
  );
};

export default DatePickerComponent;
