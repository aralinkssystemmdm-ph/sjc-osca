import React, { useState, useMemo } from 'react';
import { 
  Search, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  User,
  Calendar,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export interface LcrRecord {
  id: number;
  full_name: string;
  birth_date: string;
  age: number;
}

interface LcrRegistryProps {
  lcrData: LcrRecord[];
  onRefresh: () => void;
  isLoading?: boolean;
}

export default function LcrRegistry({ lcrData, onRefresh, isLoading = false }: LcrRegistryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const dob = new Date(birthDate);
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options).toUpperCase();
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const filteredData = useMemo(() => {
    return lcrData.filter(item => {
      const fullName = (item?.full_name || '').toString().toLowerCase();
      const search = (searchQuery || '').toLowerCase();
      return fullName.includes(search);
    });
  }, [lcrData, searchQuery]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-[#0F172A]">LCR BIRTH REGISTRY</h2>
          <p className="text-slate-500 font-medium mt-1 text-lg">Local birth records registry for testing</p>
        </div>
      </header>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="relative w-full lg:w-[500px]">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search name and press enter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-6 py-5 bg-white border border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/50 text-lg font-bold text-[#0F172A] placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-[#0F172A]/5 transition-all"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="px-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-lg shadow-slate-200/50 text-xs font-black text-slate-400 uppercase tracking-widest">
            Page Results: 20
          </div>
          <button 
            onClick={handleRefresh}
            className={cn(
              "p-4 bg-white border border-slate-100 rounded-2xl shadow-lg shadow-slate-200/50 text-[#0F172A] hover:bg-slate-50 transition-all",
              isRefreshing && "animate-spin"
            )}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Record Indicator */}
      <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#0F172A] text-white rounded-full shadow-lg shadow-slate-200">
        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-widest">Displaying: {itemsPerPage} records per page</span>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0F172A]">
                <th className="px-10 py-6 text-[11px] font-black text-white uppercase tracking-[0.2em]">FULL NAME</th>
                <th className="px-10 py-6 text-[11px] font-black text-white uppercase tracking-[0.2em]">BIRTHDAY</th>
                <th className="px-10 py-6 text-[11px] font-black text-white uppercase tracking-[0.2em] text-center">CURRENT AGE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <RefreshCw className="w-16 h-16 text-slate-200 animate-spin" />
                      <p className="text-slate-400 font-medium text-lg tracking-tight">Fetching official registry...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Search className="w-16 h-16 text-slate-100" />
                      <p className="text-slate-400 font-bold text-xl uppercase tracking-widest">No records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-white transition-colors shadow-sm">
                          <User className="w-6 h-6 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-lg font-black text-[#0F172A] uppercase tracking-tight">{record.full_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-slate-300" />
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">{formatDate(record.birth_date)}</p>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 rounded-full">
                        <Clock className="w-3.5 h-3.5 text-rose-500" />
                        <p className="text-xs font-black text-rose-500 uppercase tracking-widest">
                          {calculateAge(record.birth_date)} YEARS OLD
                        </p>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            PAGE {currentPage}
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-6 py-3 bg-white border border-slate-100 rounded-xl shadow-sm text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#0F172A] disabled:opacity-30 transition-all"
            >
              Previous
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-6 py-3 bg-[#0F172A] text-white rounded-xl shadow-sm text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-30 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
