import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RoleSwitcherBar } from './components/common/RoleSwitcherBar';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/public/HomePage';
import { BusBookingSearchPage } from './pages/public/BusBookingSearchPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { AgenciesPage } from './pages/public/AgenciesPage';
import { PassengerDashboard } from './pages/passenger/PassengerDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { RouteTrackerPage } from './pages/public/RouteTrackerPage';
import { UssdSimulatorModal } from './components/ussd/UssdSimulatorModal';
import { TicketVerificationModal } from './components/tickets/TicketVerificationModal';
import { RouteChangeModal } from './components/tickets/RouteChangeModal';
import { AgencyCallModal } from './components/support/AgencyCallModal';
import { Ticket } from './types';
import { storageService } from './services/storageService';

function MainAppContent() {
  const { currentUser } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isUssdOpen, setIsUssdOpen] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isAgencyCallOpen, setIsAgencyCallOpen] = useState<boolean>(false);
  const [callAgencyId, setCallAgencyId] = useState<string | undefined>(undefined);
  const [callTicketNumber, setCallTicketNumber] = useState<string | undefined>(undefined);
  const [activeTicketForChange, setActiveTicketForChange] = useState<Ticket | null>(null);
  const [activeTrackingTicket, setActiveTrackingTicket] = useState<string>('');

  const handleOpenAgencyCall = (agencyId?: string, ticketNumber?: string) => {
    setCallAgencyId(agencyId);
    setCallTicketNumber(ticketNumber);
    setIsAgencyCallOpen(true);
  };

  // Search parameters when navigated from Home or Tracker
  const [searchParams, setSearchParams] = useState<{ origin?: string; destination?: string }>({
    origin: 'Kigali (Nyabugogo)',
    destination: 'Musanze (Ruhengeri)',
  });

  const handleHeroSearchSubmit = (origin: string, destination: string) => {
    setSearchParams({ origin, destination });
    setCurrentTab('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAgencySelect = (agencyId: string) => {
    setCurrentTab('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrackTicket = (ticketNumber?: string) => {
    if (ticketNumber) {
      setActiveTrackingTicket(ticketNumber);
    }
    setCurrentTab('tracker');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* 1. Quick Role Switcher Bar for Reviewers & USSD shortcut */}
      <RoleSwitcherBar
        onOpenUssd={() => setIsUssdOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      {/* 2. Navigation Header */}
      <Header
        currentTab={currentTab}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenUssd={() => setIsUssdOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenAgencyCall={() => handleOpenAgencyCall()}
      />

      {/* 3. Main Views */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            onSearchSubmit={handleHeroSearchSubmit}
            onOpenUssd={() => setIsUssdOpen(true)}
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenAgencyCall={handleOpenAgencyCall}
          />
        )}

        {currentTab === 'search' && (
          <BusBookingSearchPage
            initialOrigin={searchParams.origin}
            initialDestination={searchParams.destination}
            onNavigateToPassenger={() => setCurrentTab('passenger')}
            onOpenRouteChange={(ticket) => setActiveTicketForChange(ticket)}
            onCallAgency={handleOpenAgencyCall}
          />
        )}

        {currentTab === 'how-it-works' && (
          <HowItWorksPage
            onNavigateToBooking={() => setCurrentTab('search')}
            onOpenUssd={() => setIsUssdOpen(true)}
            onOpenScanner={() => setIsScannerOpen(true)}
          />
        )}

        {currentTab === 'tracker' && (
          <RouteTrackerPage
            initialTicketNumber={activeTrackingTicket}
            onBookRoute={(origin, destination) => {
              setSearchParams({ origin, destination });
              setCurrentTab('search');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenUssd={() => setIsUssdOpen(true)}
          />
        )}

        {currentTab === 'agencies' && (
          <AgenciesPage
            onSelectAgency={handleAgencySelect}
            onCallAgency={handleOpenAgencyCall}
          />
        )}

        {currentTab === 'passenger' && (
          <PassengerDashboard
            onNavigateToBooking={() => setCurrentTab('search')}
            onOpenUssd={() => setIsUssdOpen(true)}
            onNavigateToTracker={handleTrackTicket}
            onCallAgency={handleOpenAgencyCall}
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboard
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenUssd={() => setIsUssdOpen(true)}
          />
        )}
      </main>

      {/* 4. Footer */}
      <Footer
        onNavigate={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenUssd={() => setIsUssdOpen(true)}
      />

      {/* 5. Interactive USSD Mobile Simulator (*888#) */}
      <UssdSimulatorModal
        isOpen={isUssdOpen}
        onClose={() => setIsUssdOpen(false)}
      />

      {/* 6. Station Ticket Verification Scanner */}
      <TicketVerificationModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />

      {/* 7. Agency Direct Support & Phone Call Modal */}
      <AgencyCallModal
        isOpen={isAgencyCallOpen}
        onClose={() => setIsAgencyCallOpen(false)}
        initialAgencyId={callAgencyId}
        ticketNumber={callTicketNumber}
      />

      {/* 8. Route Change Modal (when triggered from Ticket Cards) */}
      {activeTicketForChange && (
        <RouteChangeModal
          isOpen={!!activeTicketForChange}
          onClose={() => setActiveTicketForChange(null)}
          ticket={activeTicketForChange}
          onRouteChangeSuccess={() => {
            setActiveTicketForChange(null);
            setCurrentTab('passenger');
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
