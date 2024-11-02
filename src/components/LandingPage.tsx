import React from 'react';
import { Instagram, Mail, Armchair, Calendar } from 'lucide-react';
import Link from 'next/link';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute w-96 h-96 bg-gray-100 rounded-full filter blur-3xl opacity-50 animate-blob z-0" />
      <div className="absolute w-96 h-96 bg-gray-400 rounded-full filter blur-3xl opacity-50 animate-blob2 z-0" />
      
      {/* Container for circle and content */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {/* Black circle */}
        <div className="w-[450px] h-[450px] bg-black rounded-full z-5 filter blur-md" />
        
        {/* Main content - positioned with additional downward offset */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 z-10 text-center w-full">
            <h1 style={{ fontFamily: 'Title' }} className="text-7xl font-bold mb-8 opacity-0 animate-fadeIn">
                NAPTIMER
            </h1>
            
            {/* Line between title and button */}
            <div className="h-px w-16 bg-white opacity-0 animate-lineSlide mx-auto mb-8"></div>

            {/* Booking button */}
            <Link
                href="/bookings"
                className="bg-transparent border border-gray-400 text-gray-400 py-3 px-6 
                rounded-full hover:bg-gray-400 hover:text-black 
                transition-all duration-300 opacity-0 animate-bookingFade inline-block"
            >
                Booking Form
            </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;