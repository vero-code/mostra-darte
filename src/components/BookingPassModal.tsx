import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Ticket,
  Calendar,
  Clock,
  User,
  Sparkles,
  CheckCircle2,
  QrCode,
  Download,
} from 'lucide-react';
import type { BookingPass } from '../types';

interface BookingPassModalProps {
  pass: BookingPass | null;
  onClose: () => void;
}

export const BookingPassModal: React.FC<BookingPassModalProps> = ({ pass, onClose }) => {
  if (!pass) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-md bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border border-amber-500/40 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.2)] overflow-hidden text-stone-100"
        >
          {/* Decorative Golden Ambient Blur */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="p-6 border-b border-amber-500/20 flex items-center justify-between bg-stone-950/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
                <Ticket className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-display tracking-widest uppercase text-amber-300 font-bold">
                  Mostra d'Arte
                </h3>
                <p className="text-[10px] text-stone-400 font-mono">Official VIP Exhibition Pass</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Ticket Body */}
          <div className="p-6 space-y-5">
            {/* Status Badge */}
            <div className="flex items-center justify-between bg-emerald-950/40 border border-emerald-500/40 rounded-xl px-3.5 py-2">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Admission Confirmed by Agent</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md font-semibold">
                {pass.passId}
              </span>
            </div>

            {/* Exhibition Details */}
            <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 space-y-3">
              <div>
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                  Exhibition
                </span>
                <h4 className="text-base font-display font-semibold text-amber-200 mt-0.5">
                  {pass.artworkTitle}
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-800/80">
                <div className="flex items-center gap-2 text-xs text-stone-300">
                  <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{pass.visitorName}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-300">
                  <Ticket className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{pass.ticketsCount} {pass.ticketsCount === 1 ? 'Pass' : 'Passes'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-300">
                  <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{pass.date}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-300">
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{pass.session}</span>
                </div>
              </div>
            </div>

            {/* Perforated Divider Simulation */}
            <div className="relative flex items-center justify-between my-2">
              <div className="w-5 h-5 -ml-8 bg-stone-950 rounded-full border-r border-amber-500/30" />
              <div className="flex-1 border-b-2 border-dashed border-stone-700/60 mx-2" />
              <div className="w-5 h-5 -mr-8 bg-stone-950 rounded-full border-l border-amber-500/30" />
            </div>

            {/* Pass QR and Verification */}
            <div className="flex items-center justify-between bg-stone-950/80 p-3.5 rounded-2xl border border-stone-800">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-stone-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Curator Verified
                </p>
                <p className="text-[10px] text-stone-400 font-serif-body">
                  Present this digital pass at the Grand Hall reception.
                </p>
              </div>
              <div className="p-2 bg-white rounded-xl shadow-inner text-stone-950">
                <QrCode className="w-10 h-10" />
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 bg-stone-950 border-t border-stone-800 flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg"
            >
              <Download className="w-3.5 h-3.5" />
              Save Pass to Wallet
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
