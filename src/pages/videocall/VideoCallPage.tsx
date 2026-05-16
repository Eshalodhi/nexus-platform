import { useRef, useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { users } from '../../data/users';

const VideoCallPage = () => {
  const { user } = useAuth();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const timerRef = useRef<any>(null);

  const otherUsers = users.filter(u => u.id !== user?.id);

  useEffect(() => {
    if (isCallActive) {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isCallActive]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startCall = async () => {
    if (!selectedUser) {
      alert('Please select a person to call');
      return;
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setIsCallActive(true);
      setIsVideoOn(true);
      setIsAudioOn(true);
    } catch (err) {
      alert('Could not access camera/microphone. Please allow permissions.');
    }
  };

  const endCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    setStream(null);
    setIsCallActive(false);
    setIsVideoOn(true);
    setIsAudioOn(true);
    setIsScreenSharing(false);
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOn(prev => !prev);
    }
  };

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioOn(prev => !prev);
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await (navigator.mediaDevices as any).getDisplayMedia({
          video: true,
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
        screenStream.getVideoTracks()[0].onended = () => {
          stopScreenShare();
        };
      } catch (err) {
        alert('Could not start screen sharing.');
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setIsScreenSharing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const callingUser = users.find(u => u.id === selectedUser);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Video Call</h1>
        <p className="text-gray-500 text-sm mt-1">Connect face to face with investors and entrepreneurs</p>
      </div>

      {/* Select User + Start Call */}
      {!isCallActive && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Start a New Call</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
            >
              <option value="">Select a person to call...</option>
              {otherUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.role}
                </option>
              ))}
            </select>
            <button
              onClick={startCall}
              className="flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-2.5 rounded-xl hover:bg-green-600 transition font-medium text-sm shadow"
            >
              📞 Start Call
            </button>
          </div>
        </div>
      )}

      {/* Call UI */}
      {isCallActive && (
        <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl mb-6">

          {/* Call Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <img
                src={callingUser?.avatarUrl}
                alt={callingUser?.name}
                className="w-9 h-9 rounded-full object-cover"
              />
              <div>
                <p className="text-white text-sm font-medium">{callingUser?.name}</p>
                <p className="text-green-400 text-xs">● Connected</p>
              </div>
            </div>
            <div className="bg-gray-800 px-4 py-1.5 rounded-full">
              <p className="text-white text-sm font-mono">{formatTime(callDuration)}</p>
            </div>
          </div>

          {/* Videos */}
          <div className="relative bg-gray-900 aspect-video flex items-center justify-center">

            {/* Remote Video (mock — shows avatar) */}
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <img
                  src={callingUser?.avatarUrl}
                  alt={callingUser?.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-4 border-gray-600"
                />
                <p className="text-white text-sm font-medium">{callingUser?.name}</p>
                <p className="text-gray-400 text-xs mt-1">Connecting...</p>
              </div>
            </div>

            {/* Local Video (real camera) */}
            <div className="absolute bottom-4 right-4 w-32 md:w-44 aspect-video bg-gray-700 rounded-xl overflow-hidden border-2 border-gray-600 shadow-lg">
              {isVideoOn ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <div className="text-center">
                    <p className="text-3xl">👤</p>
                    <p className="text-gray-400 text-xs mt-1">Camera off</p>
                  </div>
                </div>
              )}
            </div>

            {/* Screen Share Badge */}
            {isScreenSharing && (
              <div className="absolute top-4 left-4 bg-blue-500 text-white text-xs px-3 py-1.5 rounded-full">
                🖥️ Screen Sharing
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 md:gap-4 px-6 py-5">

            {/* Mute */}
            <button
              onClick={toggleAudio}
              className={`flex flex-col items-center gap-1 w-14 h-14 rounded-full transition ${
                isAudioOn
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              <span className="text-xl mt-3">{isAudioOn ? '🎙️' : '🔇'}</span>
            </button>

            {/* Video */}
            <button
              onClick={toggleVideo}
              className={`flex flex-col items-center gap-1 w-14 h-14 rounded-full transition ${
                isVideoOn
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              <span className="text-xl mt-3">{isVideoOn ? '📹' : '🚫'}</span>
            </button>

            {/* Screen Share */}
            <button
              onClick={toggleScreenShare}
              className={`flex flex-col items-center gap-1 w-14 h-14 rounded-full transition ${
                isScreenSharing
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              <span className="text-xl mt-3">🖥️</span>
            </button>

            {/* End Call */}
            <button
              onClick={endCall}
              className="flex flex-col items-center gap-1 w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white transition shadow-lg"
            >
              <span className="text-2xl mt-3">📵</span>
            </button>

          </div>

          {/* Controls Labels */}
          <div className="flex items-center justify-center gap-3 md:gap-4 px-6 pb-4">
            <p className="text-gray-400 text-xs w-14 text-center">
              {isAudioOn ? 'Mute' : 'Unmute'}
            </p>
            <p className="text-gray-400 text-xs w-14 text-center">
              {isVideoOn ? 'Stop Video' : 'Start Video'}
            </p>
            <p className="text-gray-400 text-xs w-14 text-center">
              {isScreenSharing ? 'Stop Share' : 'Share Screen'}
            </p>
            <p className="text-gray-400 text-xs w-16 text-center">End Call</p>
          </div>
        </div>
      )}

      {/* Recent Calls */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Calls</h2>
        <div className="space-y-3">
          {otherUsers.slice(0, 3).map((u, i) => (
            <div key={u.id} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
              <img
                src={u.avatarUrl}
                alt={u.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{u.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {i === 0 ? '📞 Incoming · 2 hours ago' : i === 1 ? '📤 Outgoing · Yesterday' : '📞 Incoming · 2 days ago'}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedUser(u.id);
                  startCall();
                }}
                className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-100 transition font-medium"
              >
                Call Back
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoCallPage;