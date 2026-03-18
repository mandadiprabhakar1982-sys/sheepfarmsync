'use client';

import React, { useEffect, useRef, useState } from 'react';
import { format, addDays, subDays, isSameDay, eachDayOfInterval } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HorizontalDatePickerProps {
  selectedDate: Date | undefined;
  onSelect: (date: Date) => void;
  className?: string;
}

export function HorizontalDatePicker({ selectedDate, onSelect, className }: HorizontalDatePickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [dates, setDates] = useState<Date[]>([]);

  useEffect(() => {
    // Generate dates: 15 days before and 180 days after
    const start = subDays(new Date(), 15);
    const end = addDays(new Date(), 180);
    const dateRange = eachDayOfInterval({ start, end });
    setDates(dateRange);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 240;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const activeDate = selectedDate || new Date();

  return (
    <div className={cn("space-y-6 py-2", className)}>
      <div className="flex items-center gap-4 px-2">
        <button 
          type="button"
          onClick={() => scroll('left')}
          className="h-8 w-8 rounded-full flex items-center justify-center text-slate-900 hover:bg-slate-100 transition-colors active:scale-90"
        >
          <ChevronLeft className="h-6 w-6 stroke-[3px]" />
        </button>
        <button 
          type="button"
          onClick={() => scroll('right')}
          className="h-8 w-8 rounded-full flex items-center justify-center text-slate-900 hover:bg-slate-100 transition-colors active:scale-90"
        >
          <ChevronRight className="h-6 w-6 stroke-[3px]" />
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto no-scrollbar px-2 snap-x pb-4"
      >
        {dates.map((date, idx) => {
          const isSelected = isSameDay(date, activeDate);
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelect(date)}
              className={cn(
                "flex-shrink-0 w-24 h-24 rounded-[1.5rem] flex flex-col items-center justify-center gap-1 transition-all snap-center active:scale-95",
                isSelected 
                  ? "bg-gradient-to-br from-[#14d5c7] to-[#0d8f89] text-white shadow-xl shadow-[#14d5c7]/20 border-none" 
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100"
              )}
            >
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest opacity-70",
                isSelected && "opacity-100"
              )}>
                {format(date, 'MMM')}
              </span>
              <span className="text-xl font-black tracking-tight leading-none">
                {format(date, 'd')}
              </span>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest opacity-70",
                isSelected && "opacity-100"
              )}>
                {format(date, 'yyyy')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
