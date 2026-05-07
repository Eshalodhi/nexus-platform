import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAuth } from '../../context/AuthContext';
import { meetingRequests as initialRequests } from '../../data/meetingRequests';
import { MeetingRequest } from '../../types';
import { users } from '../../data/users';

const CalendarPage = () => {
  const { user } = useAuth();

  const [events, setEvents] = useState([
    {
      id: '1',
      title: 'Meeting with Investor',
      start: new Date().toISOString(),
      backgroundColor: '#4F46E5',
      borderColor: '#4F46E5',
    },
    {
      id: '2',
      title: 'Pitch Review',
      start: new Date(Date.now() + 86400000).toISOString(),
      backgroundColor: '#10B981',
      borderColor: '#10B981',
    },
    {
      id: '3',
      title: 'Team Standup',
      start: new Date(Date.now() + 172800000).toISOString(),
      backgroundColor: '#F59E0B',
      borderColor: '#F59E0B',
    },
  ]);

  const [requests, setRequests] =
    useState<MeetingRequest[]>(initialRequests);
  const [showModal, setShowModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'calendar' | 'requests'>('calendar');
  const [newEvent, setNewEvent] = useState({
    title: '', date: '', time: '', color: '#4F46E5',
  });
  const [newRequest, setNewRequest] = useState({
    receiverId: '', title: '', date: '', time: '', message: '',
  });

  const colorOptions = [
    { label: 'Indigo', value: '#4F46E5' },
    { label: 'Green', value: '#10B981' },
    { label: 'Amber', value: '#F59E0B' },
    { label: 'Red', value: '#EF4444' },
    { label: 'Blue', value: '#3B82F6' },
  ];

  const otherUsers = users.filter(u => u.id !== user?.id);
  const receivedRequests = requests.filter(
    r => r.receiverId === user?.id && r.status === 'pending'
  );
  const sentRequests = requests.filter(r => r.senderId === user?.id);

  const getUserName = (id: string) =>
    users.find(u => u.id === id)?.name || 'Unknown';

  const handleDateClick = (arg: any) => {
    setNewEvent({ title: '', date: arg.dateStr, time: '', color: '#4F46E5' });
    setShowModal(true);
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date) return;
    const event = {
      id: String(Date.now()),
      title: newEvent.title,
      start: newEvent.time
        ? `${newEvent.date}T${newEvent.time}`
        : newEvent.date,
      backgroundColor: newEvent.color,
      borderColor: newEvent.color,
    };
    setEvents([...events, event]);
    setShowModal(false);
    setNewEvent({ title: '', date: '', time: '', color: '#4F46E5' });
  };

  const handleEventClick = (arg: any) => setSelectedEvent(arg.event);

  const handleDeleteEvent = () => {
    setEvents(events.filter(e => e.id !== selectedEvent.id));
    setSelectedEvent(null);
  };

  const handleSendRequest = () => {
    if (!newRequest.receiverId || !newRequest.title || !newRequest.date) return;
    const req: MeetingRequest = {
      id: String(Date.now()),
      senderId: user?.id || '',
      receiverId: newRequest.receiverId,
      title: newRequest.title,
      date: newRequest.date,
      time: newRequest.time,
      message: newRequest.message,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setRequests([...requests, req]);
    setShowRequestModal(false);
    setNewRequest({ receiverId: '', title: '', date: '', time: '', message: '' });
  };

  const handleAccept = (id: string) => {
    const req = requests.find(r => r.id === id);
    if (!req) return;
    setRequests(requests.map(r =>
      r.id === id ? { ...r, status: 'accepted' } : r
    ));
    setEvents(prev => [...prev, {
      id: 'req-' + id,
      title: req.title,
      start: req.time ? `${req.date}T${req.time}` : req.date,
      backgroundColor: '#10B981',
      borderColor: '#10B981',
    }]);
  };

  const handleDecline = (id: string) => {
    setRequests(requests.map(r =>
      r.id === id ? { ...r, status: 'declined' } : r
    ));
  };

  const statusBadge = (status: string) => {
    if (status === 'pending')
      return <span className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded-full">Pending</span>;
    if (status === 'accepted')
      return <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full">Accepted</span>;
    return <span className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded-full">Declined</span>;
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-500 text-sm mt-1">Schedule and manage your meetings</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 border border-indigo-600 text-indigo-600 px-4 py-2 rounded-xl hover:bg-indigo-50 transition font-medium text-sm"
          >
            Send Request
          </button>
          <button
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              setNewEvent({ title: '', date: today, time: '', color: '#4F46E5' });
              setShowModal(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition font-medium text-sm shadow"
          >
            + Add Meeting
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Total Meetings</p>
          <p className="text-2xl font-bold text-indigo-600">{events.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">This Month</p>
          <p className="text-2xl font-bold text-green-600">
            {events.filter(e =>
              new Date(e.start).getMonth() === new Date().getMonth()
            ).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Pending Requests</p>
          <p className="text-2xl font-bold text-amber-600">
            {receivedRequests.length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Sent Requests</p>
          <p className="text-2xl font-bold text-blue-600">
            {sentRequests.length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
            activeTab === 'calendar'
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Calendar View
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Meeting Requests
          {receivedRequests.length > 0 && (
            <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {receivedRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 md:p-6 overflow-hidden">
            <style>{`
              .fc .fc-toolbar { flex-wrap: wrap; gap: 8px; }
              .fc .fc-toolbar-title { font-size: 1rem; font-weight: 700; color: #111827; }
              .fc .fc-button { background: #4F46E5; border-color: #4F46E5; border-radius: 8px; font-size: 0.75rem; padding: 5px 10px; }
              .fc .fc-button:hover { background: #4338CA; border-color: #4338CA; }
              .fc .fc-button-active { background: #3730A3 !important; border-color: #3730A3 !important; }
              .fc .fc-today-button { background: white; border: 1px solid #E5E7EB; color: #374151; border-radius: 8px; }
              .fc .fc-today-button:hover { background: #F9FAFB; }
              .fc .fc-daygrid-day.fc-day-today { background: #EEF2FF; }
              .fc .fc-daygrid-day-number { font-size: 0.8rem; color: #6B7280; padding: 4px 6px; }
              .fc .fc-col-header-cell-cushion { font-size: 0.7rem; font-weight: 600; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.05em; padding: 8px 0; }
              .fc .fc-event { border-radius: 6px; font-size: 0.7rem; padding: 1px 4px; border: none; cursor: pointer; }
              .fc .fc-daygrid-event { margin: 1px 2px; }
              .fc th { border-color: #F3F4F6; }
              .fc td { border-color: #F3F4F6; }
              .fc .fc-scrollgrid { border-color: #F3F4F6; }
            `}</style>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              events={events}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              height="auto"
            />
          </div>

          {/* Upcoming Meetings */}
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Upcoming Meetings
            </h2>
            {events
              .filter(e => new Date(e.start) >= new Date())
              .sort((a, b) =>
                new Date(a.start).getTime() - new Date(b.start).getTime()
              )
              .slice(0, 5)
              .map(event => (
                <div
                  key={event.id}
                  className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: event.backgroundColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {event.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(event.start).toLocaleDateString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric',
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setEvents(events.filter(e => e.id !== event.id))
                    }
                    className="text-xs text-red-400 hover:text-red-600 transition flex-shrink-0"
                  >
                    Remove
                  </button>
                </div>
              ))}
            {events.filter(e => new Date(e.start) >= new Date()).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                No upcoming meetings
              </p>
            )}
          </div>
        </>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Received Requests
            </h2>
            {requests
              .filter(r => r.receiverId === user?.id)
              .map(req => (
                <div
                  key={req.id}
                  className="border border-gray-100 rounded-xl p-4 mb-3 last:mb-0"
                >
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {req.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        From: {getUserName(req.senderId)}
                      </p>
                    </div>
                    {statusBadge(req.status)}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{req.message}</p>
                  <p className="text-xs text-indigo-500 mb-3">
                    {req.date} {req.time && `at ${req.time}`}
                  </p>
                  {req.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(req.id)}
                        className="flex-1 bg-green-50 text-green-600 py-2 rounded-lg text-xs font-medium hover:bg-green-100 transition"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDecline(req.id)}
                        className="flex-1 bg-red-50 text-red-500 py-2 rounded-lg text-xs font-medium hover:bg-red-100 transition"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            {requests.filter(r => r.receiverId === user?.id).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                No requests received
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Sent Requests
            </h2>
            {sentRequests.map(req => (
              <div
                key={req.id}
                className="border border-gray-100 rounded-xl p-4 mb-3 last:mb-0"
              >
                <div className="flex items-start justify-between mb-2 gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {req.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      To: {getUserName(req.receiverId)}
                    </p>
                  </div>
                  {statusBadge(req.status)}
                </div>
                <p className="text-xs text-gray-500 mb-1">{req.message}</p>
                <p className="text-xs text-indigo-500">
                  {req.date} {req.time && `at ${req.time}`}
                </p>
              </div>
            ))}
            {sentRequests.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                No requests sent yet
              </p>
            )}
          </div>
        </div>
      )}

      {/* Add Meeting Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Add New Meeting</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
              <input
                type="text"
                placeholder="e.g. Meeting with Investor"
                value={newEvent.title}
                onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
              <input
                type="date"
                value={newEvent.date}
                onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Time (optional)</label>
              <input
                type="time"
                value={newEvent.time}
                onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Color</label>
              <div className="flex gap-2">
                {colorOptions.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setNewEvent({ ...newEvent, color: c.value })}
                    className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c.value,
                      outline: newEvent.color === c.value ? `3px solid ${c.value}` : 'none',
                      outlineOffset: '2px',
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddEvent}
                className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition text-sm font-medium"
              >
                Add Meeting
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 py-2.5 rounded-xl hover:bg-gray-50 transition text-sm font-medium text-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-screen overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Send Meeting Request</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Send To</label>
              <select
                value={newRequest.receiverId}
                onChange={e => setNewRequest({ ...newRequest, receiverId: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
              >
                <option value="">Select a person</option>
                {otherUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Meeting Title</label>
              <input
                type="text"
                placeholder="e.g. Investment Discussion"
                value={newRequest.title}
                onChange={e => setNewRequest({ ...newRequest, title: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
              <input
                type="date"
                value={newRequest.date}
                onChange={e => setNewRequest({ ...newRequest, date: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Time (optional)</label>
              <input
                type="time"
                value={newRequest.time}
                onChange={e => setNewRequest({ ...newRequest, time: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
              <textarea
                placeholder="Write a short message..."
                value={newRequest.message}
                onChange={e => setNewRequest({ ...newRequest, message: e.target.value })}
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSendRequest}
                className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition text-sm font-medium"
              >
                Send Request
              </button>
              <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 border border-gray-200 py-2.5 rounded-xl hover:bg-gray-50 transition text-sm font-medium text-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div
              className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center"
              style={{ backgroundColor: selectedEvent.backgroundColor + '20' }}
            >
              <div
                className="w-5 h-5 rounded-full"
                style={{ backgroundColor: selectedEvent.backgroundColor }}
              />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">{selectedEvent.title}</h2>
            <p className="text-sm text-gray-400 mb-6">
              {selectedEvent.start?.toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteEvent}
                className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-xl hover:bg-red-100 transition text-sm font-medium"
              >
                Delete Meeting
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                className="flex-1 border border-gray-200 py-2.5 rounded-xl hover:bg-gray-50 transition text-sm font-medium text-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;