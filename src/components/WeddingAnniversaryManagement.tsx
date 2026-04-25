import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Check, 
  X, 
  AlertCircle,
  ChevronDown,
  Eye,
  Loader2,
  Plus,
  MoreVertical,
  Filter,
  RefreshCw,
  Pencil
} from 'lucide-react';
import { cn } from '../lib/utils';
import BenefitsProfileModal from './BenefitsProfileModal';
import { motion, AnimatePresence } from 'motion/react';

interface WeddingAnniversaryManagementProps {
  hideHeader?: boolean;
}

export default function WeddingAnniversaryManagement({ 
  hideHeader = false
}: WeddingAnniversaryManagementProps) {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [barangayFilter, setBarangayFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  const fetchApplications = async () => {
    setIsLoading(true);
    setApplications([]); // Reset state before fetch
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://api-dbosca.phoenix.com.ph/api/wedding-anniversary-incentives", {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      const apps = Array.isArray(data.data?.data) ? data.data.data : (Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
      setApplications(apps);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const getCleanPath = (file: any) => {
    if (!file) return "";
    if (typeof file === "string" && file.startsWith("[")) {
      try {
        const parsed = JSON.parse(file);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const item = parsed[0];
          if (typeof item === 'string') return item;
          return item.path || item.file_path || file;
        }
      } catch (e) {}
    }
    if (Array.isArray(file) && file.length > 0) {
      const item = file[0];
      if (typeof item === 'string') return item;
      return item.path || item.file_path || "";
    }
    if (typeof file === "string" && file.startsWith("http")) {
       const parts = file.split('/storage/');
       if (parts.length > 1) return parts[1];
    }
    return file;
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem("token");
      const record = applications.find(a => a.id === id);
      if (!record) return;

      const fd = new FormData();
      
      // Grouped fields based on structured data requirements
      fd.append("status", status.toLowerCase());
      
      // Husband Information
      fd.append("husband[first_name]", record.husband?.first_name || record.husband_first_name || "");
      fd.append("husband[last_name]", record.husband?.last_name || record.husband_last_name || "");
      fd.append("husband[scid_number]", record.husband?.scid_number || record.husband_scid || "");
      
      // Wife Information
      fd.append("wife[first_name]", record.wife?.first_name || record.wife_first_name || "");
      fd.append("wife[last_name]", record.wife?.last_name || record.wife_last_name || "");
      fd.append("wife[scid_number]", record.wife?.scid_number || record.wife_scid || "");
      
      // Marriage Details
      fd.append("marriage_details[marriage_date]", record.marriage_details?.marriage_date || record.marriage_date || "");
      fd.append("contact_number", record.contact_number || "");
      
      // Location Information
      const barangay = record.location?.barangay || record.barangay || "";
      const city = record.location?.city_municipality || record.city_municipality || "";
      const province = record.location?.province || record.province || "";
      
      fd.append("location[barangay]", barangay);
      fd.append("location[city_municipality]", city);
      fd.append("location[province]", province);
      
      if (record.remarks) {
        fd.append("remarks", record.remarks);
      }

      // Existing file reference - Use required marriage_certificate field
      const certPath = getCleanPath(record.marriage_details?.certificate_url || record.certificate_url);
      if (certPath) fd.append("marriage_certificate", certPath);

      // Laravel PUT override
      fd.append("_method", "PUT");

      const response = await fetch(`https://api-dbosca.phoenix.com.ph/api/wedding-anniversary-incentives/${id}`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: fd
      });

      if (response.ok) {
        setApplications(prev => prev.map(app => app.id === id ? { ...app, status: status.toLowerCase() } : app));
        setOpenDropdownId(null);
      } else {
        const errorData = await response.json();
        alert("Failed to update status: " + (errorData.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("An error occurred");
    }
  };

  const [isEditMode, setIsEditMode] = useState(false);

  const handleNewEntry = () => {
    const newApp: any = {
      id: undefined,
      first_name: "",
      middle_name: "",
      last_name: "",
      suffix: "",
      birth_date: "",
      age: 0,
      sex: "",
      civil_status: "",
      citizenship: "Filipino",
      address: "",
      barangay: "",
      email: "",
      registration_type: "50th Wedding Anniversary Incentive",
      reg_status: "pending",
      husband_first_name: "",
      husband_last_name: "",
      wife_first_name: "",
      wife_last_name: ""
    };
    setSelectedApp(newApp);
    setIsEditMode(true);
    setIsProfileModalOpen(true);
  };

  const handleSave = async (updatedApp: any, files?: File[]) => {
    try {
      const token = localStorage.getItem("token");
      const isNew = !updatedApp.id;
      const url = isNew 
        ? "https://api-dbosca.phoenix.com.ph/api/wedding-anniversary-incentives" 
        : `https://api-dbosca.phoenix.com.ph/api/wedding-anniversary-incentives/${updatedApp.id}`;
      
      let response;
      const fd = new FormData();
      
      // Grouped fields structure
      fd.append("status", (updatedApp.status || updatedApp.reg_status || "pending").toLowerCase());
      
      // Husband
      fd.append("husband[first_name]", updatedApp.husband?.first_name || updatedApp.husband_first_name || "");
      fd.append("husband[last_name]", updatedApp.husband?.last_name || updatedApp.husband_last_name || "");
      fd.append("husband[scid_number]", updatedApp.husband?.scid_number || updatedApp.husband_scid || "");
      
      // Wife
      fd.append("wife[first_name]", updatedApp.wife?.first_name || updatedApp.wife_first_name || "");
      fd.append("wife[last_name]", updatedApp.wife?.last_name || updatedApp.wife_last_name || "");
      fd.append("wife[scid_number]", updatedApp.wife?.scid_number || updatedApp.wife_scid || "");
      
      // Marriage Details
      fd.append("marriage_details[marriage_date]", updatedApp.marriage_details?.marriage_date || updatedApp.marriage_date || "");
      fd.append("contact_number", updatedApp.contact_number || "");
      
      // Location
      fd.append("location[barangay]", updatedApp.location?.barangay || updatedApp.barangay || "");
      fd.append("location[city_municipality]", updatedApp.location?.city_municipality || updatedApp.city || "");
      fd.append("location[province]", updatedApp.location?.province || updatedApp.province || "");

      if (updatedApp.remarks) {
        fd.append("remarks", updatedApp.remarks);
      }

      // Handle Files
      if (files && files.length > 0) {
        files.forEach(file => {
          // Use marriage_certificate for file uploads
          if (file.name === "marriage_certificate.pdf" || file.name === "document" || !file.name.includes("photo")) {
            fd.append("marriage_certificate", file);
          } else if (file.name === "captured_photo.jpg") {
            fd.append("id_photo", file);
          }
        });
      } else if (!isNew) {
        // Preserve existing file for updates if no new file provided
        const existingCert = getCleanPath(updatedApp.marriage_details?.certificate_url || updatedApp.certificate_url);
        if (existingCert) fd.append("marriage_certificate", existingCert);
      }

      if (!isNew) {
        fd.append("_method", "PUT");
      }

      response = await fetch(url, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: fd
      });

      if (response.ok) {
        await fetchApplications();
        setIsProfileModalOpen(false);
        setSelectedApp(null);
        alert(isNew ? "New application created successfully" : "Profile updated successfully");
      } else {
        const data = await response.json();
        alert(data.message || `Failed to ${isNew ? 'create' : 'update'} profile`);
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("An error occurred during save");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`https://api-dbosca.phoenix.com.ph/api/wedding-anniversary-incentives/${id}`, {
        method: "DELETE",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        setApplications(prev => prev.filter(app => app.id !== id));
        setOpenDropdownId(null);
        alert("Application deleted successfully");
      } else {
        alert("Failed to delete application");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("An error occurred during deletion");
    }
  };

  const filteredApplications = applications.filter(app => {
    const husbandFull = (app.husband?.full_name || "").toLowerCase();
    const wifeFull = (app.wife?.full_name || "").toLowerCase();
    const matchesSearch = husbandFull.includes(searchTerm.toLowerCase()) || wifeFull.includes(searchTerm.toLowerCase());
    const barangay = app.location?.barangay || "";
    const matchesBarangay = barangayFilter === 'All' || barangay === barangayFilter;
    const matchesStatus = statusFilter === 'All' || app.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesBarangay && matchesStatus;
  });

  const uniqueBarangays = ['All', ...Array.from(new Set(applications.map(app => app.location?.barangay).filter(Boolean)))].sort();

  const handleViewProfile = (app: any, isEdit = false) => {
    // Specialized mapping for wedding anniversary in the generic modal
    const mappedApp = {
      ...app,
      registration_type: "50th Wedding Anniversary Incentive",
      // Map for header display in BenefitsProfileModal if it uses these
      full_name: app.husband?.full_name || "Marriage Application",
      first_name: app.husband?.full_name?.split(' ')[0] || "",
      last_name: app.husband?.full_name?.split(' ').slice(-1)[0] || "",
    };
    setSelectedApp(mappedApp);
    setIsEditMode(isEdit);
    setIsProfileModalOpen(true);
  };

  const formatDate = (date: any) => {
    if (!date) return '---';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {!hideHeader && (
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-[#0F172A]">50th WEDDING ANNIVERSARY</h2>
            <p className="text-slate-500 font-medium mt-1 text-lg">Benefit Application Registry</p>
          </div>
          <button 
            className="flex items-center gap-2 px-6 py-3.5 bg-[#EF4444] text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-200"
            onClick={handleNewEntry}
          >
            <Plus className="w-5 h-5" />
            New Entry
          </button>
        </header>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by couple names..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-[#0F172A] focus:ring-2 focus:ring-[#EF4444]/10 focus:border-[#EF4444] outline-none transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select 
            value={barangayFilter}
            onChange={(e) => setBarangayFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-[#0F172A] appearance-none cursor-pointer outline-none focus:border-[#EF4444] transition-all"
          >
            {uniqueBarangays.map(bg => <option key={bg} value={bg}>{bg}</option>)}
          </select>
        </div>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-400" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-[#0F172A] appearance-none cursor-pointer outline-none focus:border-[#EF4444] transition-all"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Disapproved">Disapproved</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#0F172A]">
                <th className="px-6 py-5 text-[10px] font-black text-white uppercase tracking-[0.2em]">Date Submitted</th>
                <th className="px-6 py-5 text-[10px] font-black text-white uppercase tracking-[0.2em]">Requestor Name</th>
                <th className="px-6 py-5 text-[10px] font-black text-white uppercase tracking-[0.2em] text-center">Age</th>
                <th className="px-6 py-5 text-[10px] font-black text-white uppercase tracking-[0.2em]">Barangay</th>
                <th className="px-6 py-5 text-[10px] font-black text-white uppercase tracking-[0.2em] text-center">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-white uppercase tracking-[0.2em] text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="w-12 h-12 text-[#EF4444] animate-spin" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Applications...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <AlertCircle className="w-16 h-16 text-slate-100" />
                      <p className="text-slate-400 font-medium text-lg">No records found matching criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-6">
                      <p className="text-xs font-bold text-slate-500 tracking-tight">{formatDate(app.submitted_at)}</p>
                    </td>
                    <td className="px-6 py-6 border-l-4 border-l-transparent group-hover:border-l-[#EF4444] transition-all">
                      <p className="text-sm font-black text-[#0F172A] uppercase">
                        {app.husband?.full_name || 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <p className="text-sm font-bold text-slate-600">{app.husband?.age || '---'}</p>
                    </td>
                    <td className="px-6 py-6">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{app.location?.barangay || '---'}</p>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest",
                        app.status?.toLowerCase() === 'approved' && "bg-emerald-50 text-emerald-600 border-emerald-100",
                        app.status?.toLowerCase() === 'pending' && "bg-amber-50 text-amber-600 border-amber-100",
                        (app.status?.toLowerCase() === 'disapproved' || app.status?.toLowerCase() === 'rejected') && "bg-rose-50 text-rose-600 border-rose-100",
                      )}>
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          app.status?.toLowerCase() === 'approved' && "bg-emerald-500",
                          app.status?.toLowerCase() === 'pending' && "bg-amber-500 animate-pulse",
                          (app.status?.toLowerCase() === 'disapproved' || app.status?.toLowerCase() === 'rejected') && "bg-rose-500",
                        )} />
                        {app.status}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center justify-center relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === app.id ? null : app.id);
                          }}
                          className="p-2 hover:bg-slate-100 rounded-xl transition-all"
                        >
                          <MoreVertical className="w-5 h-5 text-slate-400" />
                        </button>
                        
                        <AnimatePresence>
                          {openDropdownId === app.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-30" 
                                onClick={() => setOpenDropdownId(null)}
                              />
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-40"
                              >
                                <button 
                                  onClick={() => {
                                    handleViewProfile(app, false);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-all"
                                >
                                  <Eye className="w-4 h-4 text-slate-400" />
                                  View Details
                                </button>
                                <button 
                                  onClick={() => {
                                    handleViewProfile(app, true);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 rounded-xl text-xs font-bold text-indigo-600 transition-all"
                                >
                                  <Pencil className="w-4 h-4 text-indigo-400" />
                                  Edit Profile
                                </button>
                                <button 
                                  onClick={() => updateStatus(app.id, 'approved')}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50 rounded-xl text-xs font-bold text-emerald-600 transition-all"
                                >
                                  <Check className="w-4 h-4" />
                                  Approve
                                </button>
                                <button 
                                  onClick={() => updateStatus(app.id, 'disapproved')}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-rose-50 rounded-xl text-xs font-bold text-rose-600 transition-all"
                                >
                                  <X className="w-4 h-4" />
                                  Disapprove
                                </button>
                                <button 
                                  onClick={() => updateStatus(app.id, 'pending')}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50 rounded-xl text-xs font-bold text-amber-600 transition-all"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                  Move to Pending
                                </button>
                                <button 
                                  onClick={() => handleDelete(app.id)}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 rounded-xl text-xs font-bold text-rose-500 transition-all border-t border-slate-50"
                                >
                                  <X className="w-4 h-4" />
                                  Delete Application
                                </button>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isProfileModalOpen && selectedApp && (
          <BenefitsProfileModal 
            application={selectedApp}
            isOpen={isProfileModalOpen}
            onClose={() => {
              setIsProfileModalOpen(false);
              setIsEditMode(false);
            }}
            onSave={handleSave} 
            initialIsEditing={isEditMode}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
