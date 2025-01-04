// import Image from "next/image";
// import { Geist, Geist_Mono } from "next/font/google";
import BookingWitDb from "@/components/BookingWithDb";
import EventList from "@/components/EventList";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export default function Home() {
  return (
    <div className="py-10">
      <h1 className="text-4xl font-bold text-center  mb-6 text-blue-600">
        Booking Your Slots
      </h1>

      <BookingWitDb />

      <EventList  /> 
    </div>
  );
}
