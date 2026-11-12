import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { DigitalTicketCard } from '../../components/tickets/DigitalTicketCard';
import { RouteChangeModal } from '../../components/tickets/RouteChangeModal';
import { Ticket, PaymentTransaction } from '../../types';
import { ticketService } from '../../services/ticketService';
import {
  Ticket as TicketIcon,
  User,
  History,
  CreditCard,
  Bell,
  RefreshCw,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  PhoneCall,
  Headphones,
} from 'lucide-react';

interface PassengerDashboardProps {
  onNavigateToBooking: () => void;
  onOpenUssd: () => void;
  onNavigateToTracker?: (ticketNumber?: string) => void;
  onCallAgency?: (agencyId?: string, ticketNumber?: string) => void;
}

export const PassengerDashboard: React.FC<PassengerDashboardProps> = ({
  onNavigateToBooking,
  onOpenUssd,
  onNavigateToTracker,
  onCallAgency,
}) => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'tickets' | 'history' | 'payments' | 'profile' | 'notifications'>('tickets');
  const [ticketFilter, setTicketFilter] = useState<'all' | 'valid' | 'boarded' | 'route_changed'>('all');
  const [selectedTicketForChange, setSelectedTicketForChange] = useState<Ticket | null>(null);

  // Profile edit state
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editEmail, setEditEmail] = useState(currentUser?.email || '');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Real-time tickets and payments
  const allTickets = storageService.getTickets();
  const allPayments = storageService.getPayments();

  // Filter for this user's tickets (by phone or name)
  const userTickets = useMemo(() => {
    if (!currentUser) return allTickets;
    const cleanPhone = currentUser.phone.replace(/\D/g, '');
    return allTickets.filter(
      (t) =>
        t.passengerPhone.replace(/\D/g, '').includes(cleanPhone) ||
        t.passengerName.toLowerCase() === currentUser.name.toLowerCase()
    );
  }, [allTickets, currentUser]);

  const filteredTickets = useMemo(() => {
    if (ticketFilter === 'all') return userTickets;
    return userTickets.filter((t) => t.ticketStatus === ticketFilter);
  }, [userTickets, ticketFilter]);

  const userPayments = useMemo(() => {
    if (!currentUser) return allPayments;
    const cleanPhone = currentUser.phone.replace(/\D/g, '');
    return allPayments.filter((p) => p.passengerPhone.replace(/\D/g, '').includes(cleanPhone));
  }, [allPayments, currentUser]);

  const validTicketsCount = userTickets.filter((t) => t.ticketStatus === 'valid').length;
  const totalSpentRwf = userPayments.reduce((acc, p) => acc + p.amountRwf, 0);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    storageService.updateUserProfile({
      ...currentUser,
      name: editName,
      phone: editPhone,
      email: editEmail,
    });
    setProfileSuccessMsg('Profile updated successfully!');
    setTimeout(() => setProfileSuccessMsg(''), 3000);
  };

  const handleCancelTicket = (ticket: Ticket) => {
    if (window.confirm(`Are you sure you want to cancel ticket ${ticket.ticketNumber}? This will release your seat.`)) {
      ticketService.cancelTicket(ticket.ticketNumber);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header / Profile Hero */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-md">
              {currentUser?.name.charAt(0) || 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {currentUser?.name || 'Passenger Portal'}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                  VERIFIED PASSENGER
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {currentUser?.phone} {currentUser?.email ? `· ${currentUser.email}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToBooking}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <TicketIcon className="w-4 h-4" />
              <span>Book New Ticket</span>
            </button>
            <button
              onClick={onOpenUssd}
              className="px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs rounded-xl transition-all"
            >
              USSD *888#
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Active / Upcoming Tickets
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {validTicketsCount}
              </span>
              <span className="text-xs text-emerald-700 font-semibold">Ready for boarding</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Total Journeys Booked
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {userTickets.length}
              </span>
              <span className="text-xs text-slate-500">Across Rwanda</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Total Fares Settled
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-700 font-mono tabular-nums">
                {totalSpentRwf.toLocaleString()} RWF
              </span>
              <span className="text-xs text-slate-500">Via MoMo / Airtel</span>
            </div>
          </div>
        </div>

        {/* Agency Direct Help / Emergency Dispatch Banner */}
        <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-800/80 border border-blue-700 flex items-center justify-center shrink-0 text-blue-200">
              <PhoneCall className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Agency Passenger Dispatch Hotline</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 font-mono px-1.5 py-0.5 rounded border border-amber-400/30">
                  24/7 Rwanda Terminal Desk
                </span>
              </h4>
              <p className="text-xs text-blue-200">
                Experiencing a delay, missing luggage, need bay directions, or emergency route adjustment? Call any agency dispatch desk directly.
              </p>
            </div>
          </div>
          <button
            onClick={() => onCallAgency && onCallAgency()}
            className="shrink-0 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2"
          >
            <Headphones className="w-4 h-4 text-slate-900" />
            <span>Call Agency Desk</span>
          </button>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'tickets' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TicketIcon className="w-4 h-4" />
            <span>My Tickets ({userTickets.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'payments' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payment History</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'profile' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Phone</span>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'notifications' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>SMS Notifications</span>
          </button>
        </div>

        {/* TAB 1: MY TICKETS */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            {/* Filter buttons */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 text-xs font-medium">
                <button
                  onClick={() => setTicketFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    ticketFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({userTickets.length})
                </button>
                <button
                  onClick={() => setTicketFilter('valid')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    ticketFilter === 'valid' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Active ({validTicketsCount})
                </button>
                <button
                  onClick={() => setTicketFilter('boarded')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    ticketFilter === 'boarded' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Boarded
                </button>
                <button
                  onClick={() => setTicketFilter('route_changed')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    ticketFilter === 'route_changed' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Changed Routes
                </button>
              </div>

              <div className="text-xs text-slate-500">
                To modify your travel destination, click &quot;Change Route / Station&quot; on any active ticket.
              </div>
            </div>

            {filteredTickets.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
                <TicketIcon className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No Tickets Found</h3>
                <p className="text-xs text-slate-500">
                  You don&apos;t have any tickets under this category yet.
                </p>
                <button
                  onClick={onNavigateToBooking}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
                >
                  Search Intercity Buses
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredTickets.map((ticket) => (
                  <DigitalTicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onOpenRouteChange={(t) => setSelectedTicketForChange(t)}
                    onCancelTicket={handleCancelTicket}
                    onTrackTicket={(num) => onNavigateToTracker && onNavigateToTracker(num)}
                    onCallAgency={onCallAgency}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PAYMENT HISTORY */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">Mobile Money Statement</h3>
                <p className="text-xs text-slate-500">
                  Transactions processed via MTN MoMo and Airtel Money Rwanda
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Tx Reference</th>
                    <th className="px-6 py-3 font-semibold">Ticket</th>
                    <th className="px-6 py-3 font-semibold">Provider</th>
                    <th className="px-6 py-3 font-semibold">Phone</th>
                    <th className="px-6 py-3 font-semibold text-right">Amount (RWF)</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {userPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 font-mono font-semibold text-slate-900">
                        {p.providerTransactionId}
                      </td>
                      <td className="px-6 py-3 font-mono text-emerald-700 font-bold">
                        {p.ticketNumber}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            p.provider === 'MTN_MOMO'
                              ? 'bg-yellow-100 text-yellow-900'
                              : 'bg-red-100 text-red-900'
                          }`}
                        >
                          {p.provider === 'MTN_MOMO' ? 'MTN MoMo (*182#)' : 'Airtel Money'}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-mono text-slate-600">{p.passengerPhone}</td>
                      <td className="px-6 py-3 font-mono font-bold text-slate-900 text-right tabular-nums">
                        {p.amountRwf.toLocaleString()} RWF
                      </td>
                      <td className="px-6 py-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          COMPLETED
                        </span>
                      </td>
                      <td className="px-6 py-3 text-slate-500">
                        {new Date(p.timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PROFILE */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-xl mx-auto shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-lg mb-1">Passenger Profile</h3>
            <p className="text-xs text-slate-500 mb-6">
              Manage your personal details and Rwanda phone number used for SMS tickets.
            </p>

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Rwanda Phone Number (+250)
                </label>
                <input
                  type="tel"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {profileSuccessMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-2xl mx-auto shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-lg">SMS Alerts & Gate Notices</h3>
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
                <Bell className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Ticket BG-RW-2026-7841 Confirmed</span>
                  <p className="text-slate-600 mt-1">
                    Your seat #4 on Volcano Express departing Kigali (Nyabugogo) at 08:00 has been verified. Please arrive 15 minutes before departure.
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">Sent via SMS to {currentUser?.phone}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
                <RefreshCw className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Route Change Window Open</span>
                  <p className="text-slate-600 mt-1">
                    You can change your destination until 07:45 AM. After departure, route changes are locked.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Route Change Modal trigger if active */}
        {selectedTicketForChange && (
          <RouteChangeModal
            isOpen={!!selectedTicketForChange}
            onClose={() => setSelectedTicketForChange(null)}
            ticket={selectedTicketForChange}
            onRouteChangeSuccess={() => {
              setSelectedTicketForChange(null);
            }}
          />
        )}
      </div>
    </div>
  );
};
