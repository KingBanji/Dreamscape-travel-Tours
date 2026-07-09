import { useState } from "react";
import { Booking, Destination } from "../types";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Share2, Compass, AlertCircle } from "lucide-react";

interface SafariCalendarProps {
  bookings: Booking[];
  destinations: Destination[];
}

export default function SafariCalendar({ bookings, destinations }: SafariCalendarProps) {
  // Find the first booking with a valid date to initialize the calendar month
  const parseDateParts = (dateStr: string) => {
    if (!dateStr) return null;
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return {
        year: parseInt(match[1], 10),
        month: parseInt(match[2], 10) - 1, // 0-based
        day: parseInt(match[3], 10),
      };
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return {
        year: d.getFullYear(),
        month: d.getMonth(),
        day: d.getDate(),
      };
    }
    return null;
  };

  // Get initial date based on bookings or today
  const getInitialDate = () => {
    if (bookings.length > 0) {
      // Find the first future/upcoming booking or just the first booking
      const firstBook = bookings[0];
      const parts = parseDateParts(firstBook.preferredStartDate);
      if (parts) {
        return new Date(parts.year, parts.month, 1);
      }
    }
    return new Date();
  };

  const [currentDate, setCurrentDate] = useState<Date>(getInitialDate);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper for rendering calendar month grid
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Handle month changes
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  // Check if a day has bookings
  const getBookingsForDay = (day: number) => {
    return bookings.filter((b) => {
      const parts = parseDateParts(b.preferredStartDate);
      if (!parts) return false;
      return parts.year === year && parts.month === month && parts.day === day;
    });
  };

  // Render calendar grid days
  const calendarDays = [];
  // Empty blocks before the first day of the month
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-8 w-8" />);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayBookings = getBookingsForDay(day);
    const hasBooking = dayBookings.length > 0;
    const isSelected = selectedDay === day;

    calendarDays.push(
      <button
        key={`day-${day}`}
        onClick={() => setSelectedDay(day)}
        className={`h-8 w-8 text-xs font-mono font-bold rounded-full flex flex-col items-center justify-center relative transition-all duration-200 cursor-pointer ${
          isSelected
            ? "bg-brand-teal text-white ring-2 ring-brand-teal/40 scale-110 z-10"
            : hasBooking
            ? "bg-brand-gold/20 text-brand-gold border border-brand-gold/50 font-extrabold hover:bg-brand-gold/30 hover:scale-105"
            : "text-brand-dark/80 dark:text-slate-300 hover:bg-brand-dark/5 dark:hover:bg-white/10"
        }`}
        title={hasBooking ? `${dayBookings.length} Booked Safari(s)` : undefined}
      >
        <span>{day}</span>
        {hasBooking && !isSelected && (
          <span className="absolute bottom-0.5 w-1.5 h-1.5 bg-brand-teal rounded-full animate-pulse" />
        )}
      </button>
    );
  }

  // Google Calendar URL generator helper
  const getGoogleCalendarUrl = (booking: Booking, targetDest?: Destination) => {
    const title = encodeURIComponent(
      `Dreamscape Safari: ${booking.packageId || booking.tourName || targetDest?.name || "Zambia Expedition"}`
    );

    const parts = parseDateParts(booking.preferredStartDate);
    let dateParam = "";
    if (parts) {
      const yStr = parts.year.toString();
      const mStr = (parts.month + 1).toString().padStart(2, "0");
      const dStr = parts.day.toString().padStart(2, "0");

      const start = `${yStr}${mStr}${dStr}`;

      // End date is start date + 1 day for all-day event
      const endDate = new Date(parts.year, parts.month, parts.day + 1);
      const eyStr = endDate.getFullYear().toString();
      const emStr = (endDate.getMonth() + 1).toString().padStart(2, "0");
      const edStr = endDate.getDate().toString().padStart(2, "0");
      const end = `${eyStr}${emStr}${edStr}`;

      dateParam = `${start}/${end}`;
    } else {
      const today = new Date();
      const yStr = today.getFullYear().toString();
      const mStr = (today.getMonth() + 1).toString().padStart(2, "0");
      const dStr = today.getDate().toString().padStart(2, "0");
      dateParam = `${yStr}${mStr}${dStr}/${yStr}${mStr}${dStr}`;
    }

    const details = encodeURIComponent(
      `Welcome to your Dreamscape Safari Adventure!\n\n` +
      `Reservation Status: ${booking.status.toUpperCase()}\n` +
      `Lead Traveler: ${booking.customerName}\n` +
      `Guests: ${booking.guestsCount} travelers\n` +
      `Total Price: ${booking.totalPrice} ZMW\n\n` +
      `Need assistance? Email us at dreamscapetourszambia@gmail.com\n` +
      `Thank you for booking with Dreamscape Tours Zambia!`
    );

    const location = encodeURIComponent(targetDest?.location || "Zambia, Africa");

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateParam}&details=${details}&location=${location}`;
  };

  // Get active safari details to display below the calendar grid
  const activeDayBookings = selectedDay ? getBookingsForDay(selectedDay) : [];
  
  // If no day is selected but we have bookings for this month, auto-select the first one to keep UI active
  const bookingsInMonth = bookings.filter((b) => {
    const parts = parseDateParts(b.preferredStartDate);
    return parts && parts.year === year && parts.month === month;
  });

  return (
    <div id="safari-calendar-widget" className="p-4 rounded-2xl bg-white/5 dark:bg-black/35 border border-brand-sand-dark/40 shadow-md">
      {/* Calendar Header with navigation */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-sm font-bold uppercase text-brand-dark dark:text-slate-200 tracking-wide flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-brand-teal" />
          <span>Safari Calendar</span>
        </h3>
        
        <div className="flex items-center gap-1.5 bg-brand-dark/5 dark:bg-black/25 px-2 py-1 rounded-lg border border-brand-sand-dark/30">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded-md hover:bg-brand-dark/10 dark:hover:bg-white/10 text-brand-dark/70 dark:text-slate-300 cursor-pointer"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-[11px] font-mono font-extrabold uppercase text-brand-teal w-24 text-center">
            {monthNames[month]} {year}
          </span>
          
          <button
            onClick={handleNextMonth}
            className="p-1 rounded-md hover:bg-brand-dark/10 dark:hover:bg-white/10 text-brand-dark/70 dark:text-slate-300 cursor-pointer"
            aria-label="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekdays indicator row */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1 pb-1.5 border-b border-brand-sand-dark/20">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day, idx) => (
          <span
            key={day}
            className={`text-[9px] font-mono font-extrabold uppercase ${
              idx === 0 || idx === 6
                ? "text-brand-teal/80"
                : "text-brand-dark/50 dark:text-slate-400"
            }`}
          >
            {day}
          </span>
        ))}
      </div>

      {/* Calendar month grid */}
      <div className="grid grid-cols-7 gap-1 text-center justify-items-center mb-4">
        {calendarDays}
      </div>

      {/* Highlight booking info helper below the grid */}
      <div className="pt-3 border-t border-brand-sand-dark/30">
        {activeDayBookings.length > 0 ? (
          <div className="space-y-3">
            <span className="text-[9px] font-mono uppercase bg-brand-teal/10 text-brand-teal px-2 py-0.5 rounded font-extrabold block w-max">
              🎯 Expedition scheduled on {monthNames[month]} {selectedDay}
            </span>
            
            {activeDayBookings.map((b) => {
              const targetDest = destinations.find((d) => d.id === b.destinationId);
              return (
                <div
                  key={b.id}
                  className="p-3 bg-brand-dark/5 dark:bg-black/30 rounded-xl border border-brand-sand-dark/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all"
                >
                  <div className="space-y-0.5 text-left">
                    <h4 className="font-serif text-xs font-bold uppercase text-brand-dark dark:text-slate-200">
                      {b.packageId || targetDest?.name.split(" (")[0] || "Custom Safari"}
                    </h4>
                    <p className="text-[10px] text-brand-dark/60 dark:text-slate-400 font-medium">
                      Traveler: {b.customerName} ({b.guestsCount} {b.guestsCount === 1 ? 'Guest' : 'Guests'})
                    </p>
                  </div>
                  
                  <a
                    href={getGoogleCalendarUrl(b, targetDest)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-3 py-1.5 bg-brand-gold text-brand-dark hover:bg-brand-gold-light rounded-lg text-[10px] font-extrabold uppercase font-mono tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm select-none"
                    aria-label={`Export ${b.packageId || 'Safari'} to Google Calendar`}
                  >
                    <Share2 className="w-3 h-3 text-brand-dark" /> Add to GCal
                  </a>
                </div>
              );
            })}
          </div>
        ) : bookingsInMonth.length > 0 ? (
          <div className="text-center py-2 bg-brand-dark/5 dark:bg-black/20 rounded-xl border border-brand-sand-dark/20 text-xs">
            <p className="text-[10px] text-brand-dark/70 dark:text-slate-350 flex items-center justify-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-brand-gold animate-spin-slow" />
              <span>You have <strong>{bookingsInMonth.length}</strong> trip{bookingsInMonth.length > 1 ? 's' : ''} in {monthNames[month]}! Click a highlighted day.</span>
            </p>
          </div>
        ) : (
          <div className="text-center py-2 text-[10px] text-brand-dark/50 dark:text-slate-400 flex items-center justify-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-brand-dark/40 dark:text-slate-500" />
            <span>No expeditions scheduled for {monthNames[month]} {year}.</span>
          </div>
        )}
      </div>
    </div>
  );
}
