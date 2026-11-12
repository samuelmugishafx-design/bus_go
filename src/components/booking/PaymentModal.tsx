import React, { useState } from 'react';
import { PaymentMethod } from '../../types';
import { X, CheckCircle2, ShieldCheck, Smartphone, AlertCircle, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amountRwf: number;
  passengerName: string;
  defaultPhone: string;
  tripDescription: string;
  onPaymentSuccess: (method: PaymentMethod, phone: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amountRwf,
  passengerName,
  defaultPhone,
  tripDescription,
  onPaymentSuccess,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<PaymentMethod>('MTN_MOMO');
  const [phoneNumber, setPhoneNumber] = useState(defaultPhone || '0788123456');
  const [pin, setPin] = useState('');
  const [processingState, setProcessingState] = useState<'idle' | 'prompt_sent' | 'processing' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleStartPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.trim().length < 8) {
      setErrorMessage('Please enter a valid Rwandan mobile number (e.g. 0788 123 456).');
      return;
    }

    setErrorMessage('');
    setProcessingState('prompt_sent');

    // Simulate USSD push prompt after 1.2s
    setTimeout(() => {
      setProcessingState('processing');

      // Simulate network confirmation after another 1.8s
      setTimeout(() => {
        setProcessingState('success');
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });

        setTimeout(() => {
          onPaymentSuccess(selectedProvider, phoneNumber);
        }, 1200);
      }, 1800);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm no-print">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base">Mobile Money Payment</h3>
          </div>
          {processingState === 'idle' && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Demonstration Notice */}
          <div className="mb-5 p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Simulated Payment Gateway. No real funds will be deducted.</span>
          </div>

          {/* Amount Due & Trip summary */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Ticket For: {passengerName}</p>
              <p className="text-xs font-semibold text-slate-800 mt-0.5">{tripDescription}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Total Fare</span>
              <span className="text-xl font-extrabold text-emerald-700 font-mono tabular-nums">
                {amountRwf.toLocaleString()} RWF
              </span>
            </div>
          </div>

          {processingState === 'idle' && (
            <form onSubmit={handleStartPayment} className="space-y-5">
              {/* Provider Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Rwandan Mobile Payment Provider
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* MTN MoMo */}
                  <button
                    type="button"
                    onClick={() => setSelectedProvider('MTN_MOMO')}
                    className={`p-3 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                      selectedProvider === 'MTN_MOMO'
                        ? 'border-yellow-500 bg-yellow-50/60 ring-2 ring-yellow-400/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-yellow-900">MTN MoMo</span>
                      <div className="w-3.5 h-3.5 rounded-full border flex items-center justify-center border-yellow-600">
                        {selectedProvider === 'MTN_MOMO' && <div className="w-2 h-2 rounded-full bg-yellow-500"></div>}
                      </div>
                    </div>
                    <span className="text-[11px] text-yellow-800 font-medium mt-1">Dial *182# Rwanda</span>
                  </button>

                  {/* Airtel Money */}
                  <button
                    type="button"
                    onClick={() => setSelectedProvider('AIRTEL_MONEY')}
                    className={`p-3 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                      selectedProvider === 'AIRTEL_MONEY'
                        ? 'border-red-500 bg-red-50/60 ring-2 ring-red-400/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-red-900">Airtel Money</span>
                      <div className="w-3.5 h-3.5 rounded-full border flex items-center justify-center border-red-600">
                        {selectedProvider === 'AIRTEL_MONEY' && <div className="w-2 h-2 rounded-full bg-red-600"></div>}
                      </div>
                    </div>
                    <span className="text-[11px] text-red-800 font-medium mt-1">Dial *500# Rwanda</span>
                  </button>
                </div>
              </div>

              {/* Phone number input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {selectedProvider === 'MTN_MOMO' ? 'MTN Mobile Number' : 'Airtel Mobile Number'} (+250)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm text-slate-400 font-mono">
                    +250
                  </span>
                  <input
                    type="text"
                    required
                    value={phoneNumber.replace(/^\+250\s*/, '')}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="788 123 456"
                    className="w-full pl-16 pr-4 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  A simulated USSD prompt will be sent to this Rwanda mobile number.
                </p>
              </div>

              {/* Optional Demo PIN input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Simulated MoMo PIN (Demonstration)
                </label>
                <input
                  type="password"
                  maxLength={5}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••• (Any 4 or 5 digits)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono tracking-widest focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-red-50 text-red-700 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                    selectedProvider === 'MTN_MOMO'
                      ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-950 shadow-yellow-500/20'
                      : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
                  }`}
                >
                  <span>Authorize {amountRwf.toLocaleString()} RWF via {selectedProvider === 'MTN_MOMO' ? 'MTN MoMo' : 'Airtel Money'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Processing States */}
          {processingState === 'prompt_sent' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                <Smartphone className="w-7 h-7 animate-bounce" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">USSD Push Sent to Mobile</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Simulating payment request on {phoneNumber}...
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-xs text-slate-600">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Awaiting user PIN confirmation on phone</span>
              </div>
            </div>
          )}

          {processingState === 'processing' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Loader2 className="w-7 h-7 animate-spin" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">Confirming with Rwanda Telecom Switch</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Validating mobile money transaction #{Math.floor(100000 + Math.random() * 900000)}...
                </p>
              </div>
            </div>
          )}

          {processingState === 'success' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-lg">Payment Successful!</h4>
                <p className="text-xs text-emerald-700 mt-1 font-medium">
                  {amountRwf.toLocaleString()} RWF received via {selectedProvider === 'MTN_MOMO' ? 'MTN MoMo' : 'Airtel Money'}.
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Generating your digital ticket with verifiable QR code...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
