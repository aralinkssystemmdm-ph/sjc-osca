import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Heart, ChevronRight, Search, AlertCircle, ArrowLeft, Gift, Wallet, Cake, Loader2, CheckCircle2, MoreVertical, Filter, RefreshCw, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import AnnualCashGiftManagement from './AnnualCashGiftManagement';
import SocialPensionManagement from './SocialPensionManagement';
import WeddingAnniversaryManagement from './WeddingAnniversaryManagement';
import BirthdayIncentiveManagement from './BirthdayIncentiveManagement';
import { AnnualCashGiftForm, SocialPensionForm, WeddingAnniversaryForm, BirthdayIncentiveForm } from '../CitizenPortal';

const benefitsList = [
  { 
    id: 'annual-cash-gift', 
    name: 'Annual Cash Gift', 
    icon: Gift, 
    color: 'bg-rose-50 text-rose-600',
    description: 'Manage yearly birthday financial assistance'
  },
  { 
    id: 'social-pension', 
    name: 'Social Pension (DSWD)', 
    icon: Wallet, 
    color: 'bg-blue-50 text-blue-600',
    description: 'Monthly stipend for indigent senior citizens'
  },
  { 
    id: '50th-wedding-anniversary-incentive', 
    name: '50th Wedding Anniversary Incentive', 
    icon: Heart, 
    color: 'bg-amber-50 text-amber-600',
    description: 'One-time incentive for golden wedding couples'
  },
  { 
    id: 'birthday-cash-incentives', 
    name: 'Birthday Cash Incentives', 
    icon: Cake, 
    color: 'bg-emerald-50 text-emerald-600',
    description: 'Milestone birthday financial rewards'
  },
];

function CitizenSelectionTable() {
  const { benefit } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [barangayFilter, setBarangayFilter] = useState('All');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://api-dbosca.phoenix.com.ph/api/masterlist', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const result = await response.json();
      const masterlist = result.data?.data || result.data || result || [];
      
      // Apply condition: id_status = 'released' ONLY
      const releasedList = (Array.isArray(masterlist) ? masterlist : []).filter(item => item.id_status === 'released');
      setData(releasedList);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter(item => {
    const fullName = `${item.first_name} ${item.last_name}`.toLowerCase();
    const scid = (item.scid_number || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    const matchesSearch = fullName.includes(search) || scid.includes(search);
    const matchesBarangay = barangayFilter === 'All' || item.barangay === barangayFilter;
    return matchesSearch && matchesBarangay;
  });

  const uniqueBarangays = ['All', ...Array.from(new Set(data.map(item => item.barangay).filter(Boolean)))].sort();

  const handleApply = (item: any) => {
    navigate(`/benefits/${benefit}/new/forms?citizen_id=${item.citizen_id}`);
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(`/benefits/${benefit}`)}
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#0F172A] hover:shadow-lg transition-all border border-slate-100 shadow-sm"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-4xl font-black tracking-tight text-[#0F172A] uppercase">Select Citizen</h2>
            <p className="text-slate-500 font-medium mt-1 text-lg">Apply benefits for released records</p>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="relative md:col-span-3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or SCID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-[#0F172A] focus:ring-2 focus:ring-[#EF4444]/10 focus:border-[#EF4444] outline-none transition-all"
          />
        </div>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400">
             <Filter className="w-4 h-4" />
          </div>
          <select 
            value={barangayFilter}
            onChange={(e) => setBarangayFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-[#0F172A] appearance-none cursor-pointer outline-none focus:border-[#EF4444] transition-all"
          >
            {uniqueBarangays.map(bg => <option key={bg} value={bg}>{bg}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#0F172A]">
                <th className="px-6 py-5 text-[10px] font-black text-white uppercase tracking-[0.2em]">SCID Number</th>
                <th className="px-6 py-5 text-[10px] font-black text-white uppercase tracking-[0.2em]">Full Name</th>
                <th className="px-6 py-5 text-[10px] font-black text-white uppercase tracking-[0.2em]">Birthdate</th>
                <th className="px-6 py-5 text-[10px] font-black text-white uppercase tracking-[0.2em]">Barangay</th>
                <th className="px-6 py-5 text-[10px] font-black text-white uppercase tracking-[0.2em] text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="w-12 h-12 text-[#EF4444] animate-spin" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Masterlist...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <AlertCircle className="w-16 h-16 text-slate-100" />
                      <p className="text-slate-400 font-medium text-lg">No released records found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-6">
                      <p className="text-xs font-black text-[#0F172A] tracking-widest">{item.scid_number || '---'}</p>
                    </td>
                    <td className="px-6 py-6">
                      <p className="text-sm font-black text-[#0F172A] uppercase tracking-tight">
                        {item.last_name}, {item.first_name} {item.middle_name || ''}
                      </p>
                    </td>
                    <td className="px-6 py-6">
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">{item.birth_date || '---'}</p>
                    </td>
                    <td className="px-6 py-6">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{item.barangay}</p>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <button 
                        onClick={() => handleApply(item)}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200"
                      >
                        Apply Benefits
                      </button>
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

function BenefitsMenu() {
  return (
    <div className="space-y-6">
      <header className="mb-10 text-center md:text-left">
        <h2 className="text-4xl font-black tracking-tight text-[#0F172A]">BENEFITS MODULE</h2>
        <p className="text-slate-500 font-medium mt-1 text-lg">Select a benefit to manage</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {benefitsList.map((benefit) => (
          <Link 
            key={benefit.id}
            to={`/benefits/${benefit.id}`}
            className="group bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-slate-900 hover:shadow-2xl hover:shadow-slate-300 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-6">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
                benefit.color
              )}>
                <benefit.icon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#0F172A] uppercase tracking-tight">{benefit.name}</h3>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">{benefit.description}</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function BenefitManagement() {
  const { benefit } = useParams();
  const navigate = useNavigate();

  const renderManagementView = () => {
    switch (benefit) {
      case 'annual-cash-gift':
        return <AnnualCashGiftManagement hideHeader={true} />;
      case 'social-pension':
        return <SocialPensionManagement hideHeader={true} />;
      case '50th-wedding-anniversary-incentive':
        return <WeddingAnniversaryManagement hideHeader={true} />;
      case 'birthday-cash-incentives':
        return <BirthdayIncentiveManagement hideHeader={true} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <AlertCircle className="w-16 h-16 mb-4 opacity-20" />
            <p className="font-bold uppercase tracking-widest">Management Module Not Found</p>
          </div>
        );
    }
  };

  const benefitData = benefitsList.find(b => b.id === benefit);

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/benefits')}
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#0F172A] hover:shadow-lg transition-all border border-slate-100 shadow-sm"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-4xl font-black tracking-tight text-[#0F172A] uppercase">
              {benefitData?.name || 'Benefit Management'}
            </h2>
            <p className="text-slate-500 font-medium mt-1 text-lg">Registry and Action Management</p>
          </div>
        </div>
        <Link 
          to={benefit === 'annual-cash-gift' ? `/benefits/${benefit}/new` : `/benefits/${benefit}/new-entry`}
          className="px-8 py-4 bg-[#EF4444] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-200 flex items-center gap-3"
        >
          <Gift className="w-4 h-4" />
          New Entry
        </Link>
      </header>

      {renderManagementView()}
    </div>
  );
}

function BenefitFormWrapper() {
  const { benefit } = useParams();
  const [searchParams] = useSearchParams();
  const citizenId = searchParams.get('citizen_id');
  
  switch (benefit) {
    case 'annual-cash-gift':
      return <AnnualCashGiftForm mode="admin" initialCitizenId={citizenId || undefined} isReadOnly={!!citizenId} />;
    case 'social-pension':
      return <SocialPensionForm mode="admin" />;
    case '50th-wedding-anniversary-incentive':
      return <WeddingAnniversaryForm mode="admin" />;
    case 'birthday-cash-incentives':
      return <BirthdayIncentiveForm mode="admin" />;
    default:
      return <div>Form not found</div>;
  }
}

export default function BenefitsModule() {
  return (
    <Routes>
      <Route index element={<BenefitsMenu />} />
      <Route path=":benefit" element={<BenefitManagement />} />
      <Route path=":benefit/new" element={<CitizenSelectionTable />} />
      <Route path=":benefit/new/forms" element={<BenefitFormWrapper />} />
      {/* Fallback for existing links if any */}
      <Route path=":benefit/new-entry" element={<BenefitFormWrapper />} />
    </Routes>
  );
}
