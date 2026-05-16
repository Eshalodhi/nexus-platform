import React, { useState, useRef } from 'react';
import {Upload, Download, Trash2, Share2, Eye, PenTool, X } from 'lucide-react'; 
import SignatureCanvas from 'react-signature-canvas';
import { useAuth } from '../../context/AuthContext';

type DocStatus = 'Draft' | 'In Review' | 'Signed';

interface Document {
  id: number;
  name: string;
  type: string;
  size: string;
  lastModified: string;
  shared: boolean;
  status: DocStatus;
  url?: string;
}

const initialDocuments: Document[] = [
  {
    id: 1,
    name: 'Pitch Deck 2024.pdf',
    type: 'PDF',
    size: '2.4 MB',
    lastModified: '2024-02-15',
    shared: true,
    status: 'Signed',
  },
  {
    id: 2,
    name: 'Financial Projections.xlsx',
    type: 'Spreadsheet',
    size: '1.8 MB',
    lastModified: '2024-02-10',
    shared: false,
    status: 'In Review',
  },
  {
    id: 3,
    name: 'Business Plan.docx',
    type: 'Document',
    size: '3.2 MB',
    lastModified: '2024-02-05',
    shared: true,
    status: 'Draft',
  },
  {
    id: 4,
    name: 'Market Research.pdf',
    type: 'PDF',
    size: '5.1 MB',
    lastModified: '2024-01-28',
    shared: false,
    status: 'Draft',
  },
];

const statusColors: Record<DocStatus, string> = {
  Draft: 'bg-gray-100 text-gray-600',
  'In Review': 'bg-amber-50 text-amber-600',
  Signed: 'bg-green-50 text-green-600',
};

const statusOptions: DocStatus[] = ['Draft', 'In Review', 'Signed'];

export const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [activeFilter, setActiveFilter] = useState<'All' | DocStatus>('All');
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [signDoc, setSignDoc] = useState<Document | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const sigRef = useRef<SignatureCanvas>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = activeFilter === 'All'
    ? documents
    : documents.filter(d => d.status === activeFilter);

  const counts = {
    All: documents.length,
    Draft: documents.filter(d => d.status === 'Draft').length,
    'In Review': documents.filter(d => d.status === 'In Review').length,
    Signed: documents.filter(d => d.status === 'Signed').length,
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newDoc: Document = {
      id: Date.now(),
      name: file.name,
      type: file.type.includes('pdf') ? 'PDF' : 'Document',
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      lastModified: new Date().toISOString().split('T')[0],
      shared: false,
      status: 'Draft',
      url: URL.createObjectURL(file),
    };
    setDocuments(prev => [newDoc, ...prev]);
    e.target.value = '';
  };

  const handleDelete = (id: number) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const handleStatusChange = (id: number, status: DocStatus) => {
    setDocuments(prev =>
      prev.map(d => d.id === id ? { ...d, status } : d)
    );
  };

  const handleClearSignature = () => {
    sigRef.current?.clear();
    setSignature(null);
  };

  const handleSaveSignature = () => {
    if (sigRef.current?.isEmpty()) {
      alert('Please draw your signature first.');
      return;
    }
    const sig = sigRef.current?.toDataURL();
    setSignature(sig || null);
    if (signDoc) {
      handleStatusChange(signDoc.id, 'Signed');
    }
    setSignDoc(null);
  };

  const getFileIcon = (type: string) => {
    if (type === 'PDF') return '📄';
    if (type === 'Spreadsheet') return '📊';
    return '📝';
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Document Chamber
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage deals, contracts and important files
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition font-medium text-sm shadow"
        >
          <Upload size={16} />
          Upload Document
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xlsx"
          onChange={handleUpload}
          className="hidden"
        />
      </div>
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['All', 'Draft', 'In Review', 'Signed'] as const).map(s => (
          <button
            key={s}
            onClick={() => setActiveFilter(s)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition border ${
              activeFilter === s
                ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {s}
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
              activeFilter === s
                ? 'bg-white text-indigo-600'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {counts[s]}
            </span>
          </button>
        ))}
      </div>
      

      {/* Document List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            {activeFilter === 'All' ? 'All Documents' : `${activeFilter} Documents`}
          </h2>
          <p className="text-sm text-gray-400">{filtered.length} files</p>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📂</p>
            <p className="text-gray-400 text-sm">No documents found</p>
          </div>
        )}

        <div className="divide-y divide-gray-50">
          {filtered.map(doc => (
            <div
              key={doc.id}
              className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition"
            >
              {/* Icon */}
              <div className="text-2xl w-10 text-center flex-shrink-0">
                {getFileIcon(doc.type)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {doc.name}
                  </p>
                  {doc.shared && (
                    <span className="text-xs bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full">
                      Shared
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {doc.type} · {doc.size} · Modified {doc.lastModified}
                </p>
              </div>

              {/* Status Dropdown */}
              <select
                value={doc.status}
                onChange={e =>
                  handleStatusChange(doc.id, e.target.value as DocStatus)
                }
                className={`text-xs px-3 py-1.5 rounded-full border-0 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${statusColors[doc.status]}`}
              >
                {statusOptions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => setPreviewDoc(doc)}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                  title="Preview"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => setSignDoc(doc)}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                  title="Sign"
                >
                  <PenTool size={16} />
                </button>
                <button
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Download"
                >
                  <Download size={16} />
                </button>
                <button
                  className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                  title="Share"
                >
                  <Share2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="text-sm font-semibold text-gray-900">{previewDoc.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {previewDoc.type} · {previewDoc.size}
                </p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              {previewDoc.url ? (
                <iframe
                  src={previewDoc.url}
                  className="w-full h-96 rounded-xl border border-gray-100"
                  title={previewDoc.name}
                />
              ) : (
                <div className="w-full h-96 bg-gray-50 rounded-xl flex flex-col items-center justify-center border border-gray-100">
                  <p className="text-6xl mb-4">{getFileIcon(previewDoc.type)}</p>
                  <p className="text-gray-500 text-sm font-medium">{previewDoc.name}</p>
                  <p className="text-gray-400 text-xs mt-2">
                    Preview not available for this file type
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-xs">
                    <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                      <p className="text-xs text-gray-400">Size</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{previewDoc.size}</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                      <p className="text-xs text-gray-400">Status</p>
                      <p className={`text-sm font-medium mt-1 ${statusColors[previewDoc.status].split(' ')[1]}`}>
                        {previewDoc.status}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                      <p className="text-xs text-gray-400">Modified</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{previewDoc.lastModified}</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                      <p className="text-xs text-gray-400">Shared</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{previewDoc.shared ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => {
                  setPreviewDoc(null);
                  setSignDoc(previewDoc);
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition text-sm font-medium"
              >
                <PenTool size={15} />
                Sign Document
              </button>
              <button
                onClick={() => setPreviewDoc(null)}
                className="flex-1 border border-gray-200 py-2.5 rounded-xl hover:bg-gray-50 transition text-sm font-medium text-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {signDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="text-sm font-semibold text-gray-900">Sign Document</p>
                <p className="text-xs text-gray-400 mt-0.5">{signDoc.name}</p>
              </div>
              <button
                onClick={() => setSignDoc(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              {/* Signer Info */}
              <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-600 text-sm font-bold">
                    {user?.name?.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
                <div className="ml-auto text-xs text-gray-400">
                  {new Date().toLocaleDateString()}
                </div>
              </div>

              {/* Signature Pad */}
              <p className="text-sm font-medium text-gray-700 mb-2">
                Draw your signature below:
              </p>
              <div className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                <SignatureCanvas
                  ref={sigRef}
                  canvasProps={{
                    width: 460,
                    height: 180,
                    className: 'w-full',
                    style: { background: '#F9FAFB' },
                  }}
                  penColor="#1e1b4b"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Sign above using your mouse or touch screen
              </p>

              {/* Saved Signature Preview */}
              {signature && (
                <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-xs text-green-600 font-medium mb-2">
                    ✅ Previous signature saved
                  </p>
                  <img
                    src={signature}
                    alt="Saved signature"
                    className="h-10 object-contain"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={handleClearSignature}
                className="flex-1 border border-gray-200 py-2.5 rounded-xl hover:bg-gray-50 transition text-sm font-medium text-gray-600"
              >
                Clear
              </button>
              <button
                onClick={handleSaveSignature}
                className="flex-1 bg-green-500 text-white py-2.5 rounded-xl hover:bg-green-600 transition text-sm font-medium"
              >
                ✅ Sign & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};