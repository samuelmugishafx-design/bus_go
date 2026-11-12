import React from 'react';
import { Bus, Check, Disc } from 'lucide-react';

interface SeatSelectorProps {
  totalSeats: number;
  bookedSeats: number[];
  selectedSeat: number | null;
  onSelectSeat: (seatNum: number) => void;
  busModel?: string;
  plateNumber?: string;
}

export const SeatSelector: React.FC<SeatSelectorProps> = ({
  totalSeats = 28,
  bookedSeats = [],
  selectedSeat,
  onSelectSeat,
  busModel = 'Toyota Coaster Executive',
  plateNumber = 'RAD 482 B',
}) => {
  // Generate seats array 1..totalSeats
  const seats = Array.from({ length: totalSeats }, (_, i) => i + 1);

  // Group seats in rows:
  // For Coaster (28 seats): 2 seats left, aisle, 2 seats right (or 1 left, 2 right)
  // Let's do a realistic 2x2 with central aisle layout
  const rows: { left: number[]; right: number[] }[] = [];
  let currentIdx = 0;

  while (currentIdx < totalSeats) {
    const left1 = currentIdx + 1 <= totalSeats ? currentIdx + 1 : null;
    const left2 = currentIdx + 2 <= totalSeats ? currentIdx + 2 : null;
    const right1 = currentIdx + 3 <= totalSeats ? currentIdx + 3 : null;
    const right2 = currentIdx + 4 <= totalSeats ? currentIdx + 4 : null;

    rows.push({
      left: [left1, left2].filter((n): n is number => n !== null),
      right: [right1, right2].filter((n): n is number => n !== null),
    });

    currentIdx += 4;
  }

  const availableCount = totalSeats - bookedSeats.length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Bus className="w-5 h-5 text-emerald-600" />
            Interactive Seat Selection
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {busModel} · Plate: <span className="font-mono font-semibold text-slate-700">{plateNumber}</span>
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded border border-slate-300 bg-slate-50"></div>
            <span className="text-slate-600">Available ({availableCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center">
              <Check className="w-2.5 h-2.5" />
            </div>
            <span className="text-slate-900 font-semibold">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-slate-200 text-slate-400"></div>
            <span className="text-slate-400">Booked ({bookedSeats.length})</span>
          </div>
        </div>
      </div>

      {/* Bus Cabin Interior Representation */}
      <div className="mt-6 max-w-sm mx-auto bg-slate-50 border-2 border-slate-300 rounded-3xl p-4 shadow-inner relative">
        {/* Front of Bus & Driver Position */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b-2 border-dashed border-slate-300">
          <div className="flex items-center gap-2 bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-300">
            <Disc className="w-5 h-5 text-slate-700 animate-spin-slow" />
            <span className="text-xs font-semibold text-slate-700">Driver Cabin</span>
          </div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Entrance Door →
          </div>
        </div>

        {/* Rows */}
        <div className="space-y-2.5">
          {rows.map((row, rIdx) => (
            <div key={rIdx} className="flex items-center justify-between gap-4">
              {/* Left Side */}
              <div className="flex items-center gap-1.5">
                {row.left.map((seatNum) => {
                  const isBooked = bookedSeats.includes(seatNum);
                  const isSelected = selectedSeat === seatNum;

                  return (
                    <button
                      key={seatNum}
                      type="button"
                      disabled={isBooked}
                      onClick={() => onSelectSeat(seatNum)}
                      className={`w-9 h-10 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center relative ${
                        isBooked
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                          : isSelected
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500 ring-offset-1'
                          : 'bg-white hover:bg-emerald-50 text-slate-700 border border-slate-300 hover:border-emerald-400 shadow-sm'
                      }`}
                      title={isBooked ? `Seat ${seatNum} (Already booked)` : `Select seat ${seatNum}`}
                    >
                      <span className="text-[10px] leading-none mb-0.5 opacity-80">Seat</span>
                      <span className="tabular-nums leading-none">{seatNum}</span>
                    </button>
                  );
                })}
              </div>

              {/* Central Aisle */}
              <div className="w-6 text-center text-[10px] text-slate-300 font-mono select-none">
                |
              </div>

              {/* Right Side */}
              <div className="flex items-center gap-1.5">
                {row.right.map((seatNum) => {
                  const isBooked = bookedSeats.includes(seatNum);
                  const isSelected = selectedSeat === seatNum;

                  return (
                    <button
                      key={seatNum}
                      type="button"
                      disabled={isBooked}
                      onClick={() => onSelectSeat(seatNum)}
                      className={`w-9 h-10 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center relative ${
                        isBooked
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                          : isSelected
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500 ring-offset-1'
                          : 'bg-white hover:bg-emerald-50 text-slate-700 border border-slate-300 hover:border-emerald-400 shadow-sm'
                      }`}
                      title={isBooked ? `Seat ${seatNum} (Already booked)` : `Select seat ${seatNum}`}
                    >
                      <span className="text-[10px] leading-none mb-0.5 opacity-80">Seat</span>
                      <span className="tabular-nums leading-none">{seatNum}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Back of Bus */}
        <div className="mt-4 pt-3 border-t border-slate-200 text-center">
          <span className="text-[11px] text-slate-400 font-medium tracking-wide uppercase">
            Rear of Bus / Emergency Exit
          </span>
        </div>
      </div>

      <div className="mt-4 text-center">
        {selectedSeat ? (
          <p className="text-sm font-medium text-emerald-700 bg-emerald-50 py-2 px-3 rounded-lg border border-emerald-200 inline-block">
            You have selected <span className="font-bold">Seat #{selectedSeat}</span>.
          </p>
        ) : (
          <p className="text-sm text-slate-500">
            Click on any available seat above to select your preferred spot.
          </p>
        )}
      </div>
    </div>
  );
};
