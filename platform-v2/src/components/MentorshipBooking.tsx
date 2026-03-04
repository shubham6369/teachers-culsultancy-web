"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface MentorshipBookingProps {
    teacherId: string;
    teacherName: string;
    subjects: string[];
}

interface BookingPayload {
    teacherId: string;
    teacherName: string;
    sessionDate: string;
    sessionTime: string;
    subject: string;
    notes: string;
}

export default function MentorshipBooking({ teacherId, teacherName, subjects }: MentorshipBookingProps) {
    const queryClient = useQueryClient();
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [subject, setSubject] = useState(subjects[0] || "");
    const [message, setMessage] = useState("");

    const mutation = useMutation({
        mutationFn: async (bookingData: BookingPayload) => {
            if (!auth.currentUser) throw new Error("Authentication required");

            return await addDoc(collection(db, "mentorship_sessions"), {
                ...bookingData,
                requestId: auth.currentUser.uid,
                requestName: auth.currentUser.displayName || "Anonymous School",
                status: "PENDING",
                createdAt: serverTimestamp(),
            });
        },
        onSuccess: () => {
            setSelectedDate("");
            setSelectedTime("");
            setMessage("");
            alert("Mentorship request sent successfully!");
            queryClient.invalidateQueries({ queryKey: ["mentorship_sessions"] });
        },
        onError: (error: Error) => {
            alert(`Booking failed: ${error.message}`);
        }
    });

    const handleBooking = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate || !selectedTime || !subject) {
            alert("Please fill all required fields");
            return;
        }

        mutation.mutate({
            teacherId,
            teacherName,
            sessionDate: selectedDate,
            sessionTime: selectedTime,
            subject,
            notes: message,
        });
    };

    return (
        <div className="bg-slate-900 p-8 rounded-4xl shadow-2xl text-white border border-white/10 relative overflow-hidden group">
            {/* GLOW EFFECT */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 blur-2xl rounded-full group-hover:bg-blue-500/30 transition-all duration-700"></div>

            <div className="relative z-10">
                <h3 className="text-2xl font-black mb-1 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-sm shadow-lg shadow-blue-500/20">
                        <i className="fas fa-calendar-plus"></i>
                    </span>
                    Book a Session
                </h3>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                    Request a 1-on-1 mentorship session with {teacherName} to accelerate your growth.
                </p>

                <form onSubmit={handleBooking} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Session Date</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all text-white placeholder-slate-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Preferred Time</label>
                            <select
                                value={selectedTime}
                                onChange={(e) => setSelectedTime(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all text-white"
                            >
                                <option value="" className="bg-slate-900">Choose Slot</option>
                                <option value="09:00 AM" className="bg-slate-900">09:00 AM - 10:00 AM</option>
                                <option value="11:00 AM" className="bg-slate-900">11:00 AM - 12:00 PM</option>
                                <option value="03:00 PM" className="bg-slate-900">03:00 PM - 04:00 PM</option>
                                <option value="05:00 PM" className="bg-slate-900">05:00 PM - 06:00 PM</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Focus Topic</label>
                        <div className="flex flex-wrap gap-2">
                            {subjects.map((sub) => (
                                <button
                                    key={sub}
                                    type="button"
                                    onClick={() => setSubject(sub)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${subject === sub
                                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                        }`}
                                >
                                    {sub}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Additional Message (Optional)</label>
                        <textarea
                            placeholder="What would you like to discuss?"
                            rows={3}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all text-white placeholder-slate-600 resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-900/40 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                        {mutation.isPending ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Processing...
                            </>
                        ) : (
                            <>
                                Confirm Booking
                                <i className="fas fa-paper-plane text-[10px]"></i>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
