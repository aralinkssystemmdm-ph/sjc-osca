import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  CheckCircle2, 
  Reply, 
  X,
  AlertCircle,
  ChevronDown,
  Download
} from 'lucide-react';
import { cn, exportToCSV } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface FeedbackItem {
  id: number;
  submitted_at: string;
  sender_name?: string;
  first_name?: string;
  last_name?: string;
  message: string;
  category: string;
  contact?: {
    address?: string;
    contact_number?: string;
    email?: string;
  };
  status: 'Pending' | 'Resolved';
  response?: string;
}

export default function FeedbackConcern() {
  const [data, setData] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch Data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://api-dbosca.phoenix.com.ph/api/feedback-concerns", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      const result = await response.json();
      if (response.ok) {
        setData(result.data || []);
      } else {
        setError(result.message || "Failed to fetch feedback/concerns");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("An error occurred while fetching data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const itemText = (item.message || '').toString();
      const senderName = item.sender_name || `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Anonymous';
      const address = (item.contact?.address || '').toString();
      const search = (searchTerm || '').toLowerCase();
      const addrFilter = (addressFilter || '').toLowerCase();

      const matchesAddress = address.toLowerCase().includes(addrFilter);
      const matchesSearch = senderName.toLowerCase().includes(search) || 
                           itemText.toLowerCase().includes(search);
      return matchesAddress && matchesSearch;
    });
  }, [data, addressFilter, searchTerm]);

  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Full Name',
      'Address',
      'Description',
      'Type',
      'Status'
    ];

    const dataToExport = filteredData.map(item => ({
      'Date': item.submitted_at,
      'Full Name': item.sender_name || `${item.first_name || ''} ${item.last_name || ''}`.trim(),
      'Address': item.contact?.address || 'N/A',
      'Description': item.message,
      'Type': item.category,
      'Status': item.status
    }));

    exportToCSV(dataToExport, headers, 'feedback_concern.csv');
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-10">
      <header className="mb-10">
        <h2 className="text-4xl font-black tracking-tight text-[#0F172A]">FEEDBACK & CONCERN</h2>
        <p className="text-slate-500 font-medium mt-1 text-lg tracking-tight">Citizen Engagement Monitoring</p>
      </header>

      {/* Main Card Container */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 p-10 border border-slate-100">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600 font-bold text-sm">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
        
        {/* Top Control Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
            {/* Search Bar */}
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-[#0F172A] focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
              />
            </div>

            {/* Address Filter */}
            <div className="relative w-full sm:w-64">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input 
                type="text"
                placeholder="Filter by Address"
                value={addressFilter}
                onChange={(e) => setAddressFilter(e.target.value)}
                className="w-full pl-10 pr-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-[#0F172A] focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleExportCSV}
              disabled={filteredData.length === 0}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>

            <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
              <MessageSquare className="w-5 h-5 text-[#0F172A]" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Entries</span>
                <span className="text-lg font-black text-[#0F172A] leading-none">{filteredData.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#0F172A]">
                <th className="px-6 py-5 text-[11px] font-bold text-white uppercase tracking-widest">Date</th>
                <th className="px-6 py-5 text-[11px] font-bold text-white uppercase tracking-widest">Full Name</th>
                <th className="px-6 py-5 text-[11px] font-bold text-white uppercase tracking-widest">Address</th>
                <th className="px-6 py-5 text-[11px] font-bold text-white uppercase tracking-widest">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-slate-900/10 border-t-slate-900 rounded-full animate-spin" />
                      <p className="text-slate-400 font-medium text-lg tracking-tight">Fetching entries...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <MessageSquare className="w-16 h-16 text-slate-100" />
                      <p className="text-slate-400 font-medium text-lg tracking-tight">No feedback or concerns found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-6">
                      <p className="text-xs font-semibold text-slate-500">
                        {formatDate(item.submitted_at)}
                      </p>
                    </td>
                    <td className="px-6 py-6">
                      <p className="text-sm font-bold text-[#0F172A] uppercase tracking-tight">
                        {item.sender_name || `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Anonymous'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">{item.contact?.contact_number || item.contact_number}</p>
                    </td>
                    <td className="px-6 py-6">
                      <p className="text-sm font-bold text-slate-600 uppercase tracking-tight">
                        {item.contact?.address || 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-6 max-w-md">
                      <p className="text-sm text-slate-600 font-medium line-clamp-2">
                        {item.message}
                      </p>
                      {item.response && (
                        <div className="mt-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Response sent:</p>
                          <p className="text-xs text-emerald-700 font-medium italic">"{item.response}"</p>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
