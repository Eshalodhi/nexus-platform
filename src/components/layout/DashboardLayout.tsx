import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import {
  X, ChevronRight, ChevronLeft, Home, Calendar,
  Video, FileText, Wallet, MessageCircle, Rocket, Building2, Map
} from 'lucide-react';

const getStepIcon = (lucideIcon?: string) => {
  const size = 20;
  const icons: Record<string, React.ReactNode> = {
    home: <Home size={size} />,
    calendar: <Calendar size={size} />,
    video: <Video size={size} />,
    'file-text': <FileText size={size} />,
    wallet: <Wallet size={size} />,
    'message-circle': <MessageCircle size={size} />,
    rocket: <Rocket size={size} />,
    building: <Building2 size={size} />,
  };
  return icons[lucideIcon || ''] || <Building2 size={size} />;
};

const tourSteps = [
  {
    title: 'Welcome to Business Nexus!',
    description: 'Let us show you around the platform. This quick tour will help you get started.',
    position: 'center',
    lucideIcon: 'building',
  },
  {
    title: 'Dashboard',
    description: 'Your home base. See an overview of your activity, meetings, and connections.',
    position: 'sidebar',
    target: 'dashboard',
    lucideIcon: 'home',
  },
  {
    title: 'Calendar',
    description: 'Schedule meetings, send and accept meeting requests from investors and entrepreneurs.',
    position: 'sidebar',
    target: 'calendar',
    lucideIcon: 'calendar',
  },
  {
    title: 'Video Call',
    description: 'Connect face to face with your partners using our built-in video calling feature.',
    position: 'sidebar',
    target: 'videocall',
    lucideIcon: 'video',
  },
  {
    title: 'Document Chamber',
    description: 'Upload, preview, sign and share important documents and contracts.',
    position: 'sidebar',
    target: 'documents',
    lucideIcon: 'file-text',
  },
  {
    title: 'Payments',
    description: 'Manage your wallet, deposit funds, transfer money and fund deals.',
    position: 'sidebar',
    target: 'payments',
    lucideIcon: 'wallet',
  },
  {
    title: 'Messages',
    description: 'Chat directly with investors and entrepreneurs on the platform.',
    position: 'sidebar',
    target: 'messages',
    lucideIcon: 'message-circle',
  },
  {
    title: 'You are all set!',
    description: 'You now know your way around Business Nexus. Start connecting and growing your network!',
    position: 'center',
    lucideIcon: 'rocket',
  },
];

export const DashboardLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [runTour, setRunTour] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      const hasSeenTour = localStorage.getItem('nexus_tour_seen');
      if (!hasSeenTour) {
        setTimeout(() => {
          setRunTour(true);
        }, 1000);
      }
    }
  }, [isAuthenticated]);
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const startTour = () => {
    localStorage.removeItem('nexus_tour_seen');
    setCurrentStep(0);
    setRunTour(true);
  };

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      localStorage.setItem('nexus_tour_seen', 'true');
      setRunTour(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const closeTour = () => {
    localStorage.setItem('nexus_tour_seen', 'true');
    setRunTour(false);
  };

  const step = tourSteps[currentStep];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Tour Overlay */}
      {runTour && (
        <>
          {/* Dark overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-40"
            onClick={closeTour}
          />

          {/* Tour Card */}
          <div
            className={`fixed z-50 bg-white rounded-2xl shadow-2xl p-6 w-80 ${
              step.position === 'center'
                ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                : 'top-1/2 left-72 -translate-y-1/2 ml-4'
            }`}
          >
            {/* Close button */}
            <button
              onClick={closeTour}
              className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 rounded-lg transition"
            >
              <X size={14} className="text-gray-400" />
            </button>

            {/* Progress dots */}
            <div className="flex gap-1.5 mb-4">
              {tourSteps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentStep
                      ? 'bg-indigo-600 w-4'
                      : i < currentStep
                      ? 'bg-indigo-200 w-1.5'
                      : 'bg-gray-200 w-1.5'
                  }`}
                />
              ))}
            </div>

            {/* Icon */}
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
              {getStepIcon(step.lucideIcon)}
            </div>

            {/* Content */}
            <h3 className="text-base font-bold text-gray-900 mb-2">
              {step.title}
            </h3>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              {step.description}
            </p>

            {/* Step counter + buttons */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {currentStep + 1} of {tourSteps.length}
              </span>
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={prevStep}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <ChevronLeft size={12} />
                    Back
                  </button>
                )}
                <button
                  onClick={nextStep}
                  className="flex items-center gap-1 px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                >
                  {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
                  {currentStep < tourSteps.length - 1 && <ChevronRight size={12} />}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">

            {/* Tour Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={startTour}
                className="flex items-center gap-2 text-xs bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl hover:bg-indigo-100 transition font-medium border border-indigo-100"
              >
                <Map size={14} />
                Take a Tour
              </button>
            </div>

            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};