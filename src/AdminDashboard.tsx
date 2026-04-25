import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, 
  UserPlus, 
  IdCard, 
  Heart, 
  Stethoscope, 
  ClipboardList, 
  MessageSquare,
  LogOut, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  Search, 
  BarChart3,
  Check,
  X,
  AlertCircle,
  MoreVertical,
  Eye,
  RefreshCw,
  Loader2,
  Download,
  Edit3
} from 'lucide-react';
import { cn } from './lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

import { Application } from './App';
import RegistrationForm from './RegistrationForm';
import LcrRegistry, { LcrRecord } from './components/LcrRegistry';
import WalkInEnrollment from './components/WalkInEnrollment';
import Masterlist from './components/Masterlist';
import RegistrationProfileModal from './components/RegistrationProfileModal';
import MasterlistProfileModal from './components/MasterlistProfileModal';
import BenefitsModule from './components/BenefitsModule';
import FeedbackConcern from './components/FeedbackConcern';
import PhilHealthFacilitation from './components/PhilHealthFacilitation';
import IdIssuanceModule from './components/IdIssuanceModule';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminDashboard({ 
  applications, 
  setApplications, 
  fetchApplications,
  onSignOut 
}: { 
  applications: Application[],
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>,
  fetchApplications: () => Promise<void>,
  onSignOut: () => void 
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('Management');
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [isIdIssuanceOpen, setIsIdIssuanceOpen] = useState(false);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard') setActiveTab('Dashboard');
    else if (path === '/registration/management') {
      setActiveTab('Management');
      setIsRegistrationOpen(true);
    }
    else if (path === '/registration/walk-in') {
      setActiveTab('Walk-in');
      setIsRegistrationOpen(true);
    }
    else if (path === '/masterlist') setActiveTab('Masterlist');
    else if (path === '/id-issuance/management') {
      setActiveTab('IdManagement');
      setIsIdIssuanceOpen(true);
    }
    else if (path === '/id-issuance/walk-in') {
      setActiveTab('IdWalkIn');
      setIsIdIssuanceOpen(true);
    }
    else if (path.startsWith('/benefits')) setActiveTab('Benefits');
    else if (path === '/philhealth-facilitation') setActiveTab('PhilHealthFacilitation');
    else if (path === '/feedback-and-concern') setActiveTab('FeedbackConcern');
    else if (path === '/registry') setActiveTab('LcrRegistry');
  }, [location.pathname]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    switch (tab) {
      case 'Dashboard': navigate('/dashboard'); break;
      case 'Management': navigate('/registration/management'); break;
      case 'Walk-in': navigate('/registration/walk-in'); break;
      case 'Masterlist': navigate('/masterlist'); break;
      case 'IdManagement': navigate('/id-issuance/management'); break;
      case 'IdWalkIn': navigate('/id-issuance/walk-in'); break;
      case 'Benefits': navigate('/benefits'); break;
      case 'PhilHealthFacilitation': navigate('/philhealth-facilitation'); break;
      case 'FeedbackConcern': navigate('/feedback-and-concern'); break;
      case 'LcrRegistry': navigate('/registry'); break;
    }
  };
  
  const initialLcrData: LcrRecord[] = [
    {
      id: 1,
      full_name: "JUAN DELA CRUZ",
      birth_date: "1955-05-20",
      age: 70
    },
    {
      id: 2,
      full_name: "MARIA SANTOS",
      birth_date: "1958-11-12",
      age: 66
    },
    {
      id: 3,
      full_name: "CARLOS REYES",
      birth_date: "1960-03-08",
      age: 65
    },
    {
      id: 4,
      full_name: "ANA LOPEZ",
      birth_date: "1952-07-25",
      age: 72
    },
    {
      id: 5,
      full_name: "ROBERTO GOMEZ",
      birth_date: "1949-01-15",
      age: 76
    },
    {
      id: 6,
      full_name: "LIZA SOBERANO",
      birth_date: "1998-01-04",
      age: 28
    }
  ];

  const [lcrData, setLcrData] = useState<LcrRecord[]>(initialLcrData);
  
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [modalInitialIsEditing, setModalInitialIsEditing] = useState(false);
  const [isMasterlistModalOpen, setIsMasterlistModalOpen] = useState(false);
  const [masterlistRefreshKey, setMasterlistRefreshKey] = useState(0);

  const [isDisapproveModalOpen, setIsDisapproveModalOpen] = useState(false);
  const [rejectionRemarks, setRejectionRemarks] = useState('');
  const [disapprovingId, setDisapprovingId] = useState<number | null>(null);

  const [isWalkInFormOpen, setIsWalkInFormOpen] = useState(false);
  const [selectedLcrRecord, setSelectedLcrRecord] = useState<LcrRecord | null>(null);

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Move to Pending State
  const [isMoveToPendingModalOpen, setIsMoveToPendingModalOpen] = useState(false);
  const [pendingCitizenId, setPendingCitizenId] = useState<number | null>(null);
  const [isMovingToPending, setIsMovingToPending] = useState(false);

  // Reset Password State
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<number | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Pagination State for Registration Module
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Rejection Remarks Modal State
  const [isRemarksModalOpen, setIsRemarksModalOpen] = useState(false);
  const [selectedRemarks, setSelectedRemarks] = useState('');

  // Filters State
  const [barangayFilter, setBarangayFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All record');
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    if (openDropdownId !== null) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [openDropdownId]);

  useEffect(() => {
    const handleFetch = async () => {
      setIsLoading(true);
      setApplications([]); // Reset state before fetch
      try {
        await fetchApplications();
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === 'Management') {
      handleFetch();
    }
    
    // Reset filters on tab change
    setBarangayFilter('All');
    setStatusFilter('All record');
    setDateRange({ from: '', to: '' });
    setCurrentPage(1);
    
  }, [activeTab, fetchApplications]);

  useEffect(() => {
    if (activeTab === 'Masterlist') {
      setMasterlistRefreshKey(prev => prev + 1);
    }
  }, [activeTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [barangayFilter, statusFilter, dateRange]);

  const uniqueBarangays = ['All', ...Array.from(new Set(applications.map(app => app.barangay)))].sort();

  const filteredApplications = applications.filter(app => {
    const matchesBarangay = barangayFilter === 'All' || app.barangay === barangayFilter;
    
    let matchesStatus = true;
    if (statusFilter !== 'All record') {
      const statusMap: Record<string, string> = {
        'For Approval (pending)': 'pending',
        'Approved': 'approved',
        'Rejected': 'disapproved'
      };
      matchesStatus = app.reg_status === statusMap[statusFilter];
    }

    const regDate = app.registration_date ? new Date(app.registration_date) : null;
    let matchesDate = true;
    if (dateRange.from && regDate) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      matchesDate = matchesDate && regDate >= fromDate;
    }
    if (dateRange.to && regDate) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      matchesDate = matchesDate && regDate <= toDate;
    }

    return matchesBarangay && matchesStatus && matchesDate;
  });

  const handleExport = () => {
    if (filteredApplications.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = ["Full Name", "Barangay", "Birthdate", "Registration Date", "Type", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredApplications.map(app => [
        `"${formatName(app)}"`,
        `"${app.barangay}"`,
        `"${formatDateLong(app.birth_date)}"`,
        `"${formatDate(app.registration_date || '')}"`,
        `"${app.registration_type}"`,
        `"${app.reg_status.toUpperCase()}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `registration_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '---';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}-${day}-${year}`;
    } catch (e) {
      return dateString;
    }
  };

  const formatDateLong = (dateString: string | null | undefined) => {
    if (!dateString) return '---';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatName = (app: Application) => {
    return `${app.last_name}, ${app.first_name} ${app.middle_name || ''}`.trim();
  };

  const updateStatus = async (id: number, status: 'approved' | 'disapproved' | 'pending', remarks?: string) => {
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {
        "Accept": "application/json",
        "Content-Type": "application/json"
      };
      if (token && token !== 'undefined' && token !== 'null') {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const body: any = {
        reg_status: status
      };

      if (remarks) {
        body.rejection_remarks = remarks;
      }

      // Determine if it's a citizen_id or application_id
      const isCitizenId = id > 1000000;
      const endpoint = isCitizenId 
        ? `https://api-dbosca.phoenix.com.ph/api/masterlist/${id}`
        : `https://api-dbosca.phoenix.com.ph/api/applications/${id}`;

      const res = await fetch(endpoint, {
        method: "PUT",
        headers,
        body: JSON.stringify(body)
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Invalid JSON:", text);
        return;
      }

      if (res.ok) {
        alert("Status updated successfully");
        if (activeTab === 'Masterlist') {
          setMasterlistRefreshKey(prev => prev + 1);
        }
        await fetchApplications();
      } else {
        alert(`Update failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Update failed");
    }
  };

  const handleViewProfile = (app: Application) => {
    setSelectedApp(app);
    if (activeTab === 'Masterlist') {
      setIsMasterlistModalOpen(true);
    } else {
      setIsRegistrationModalOpen(true);
    }
  };

  const handleSaveProfile = async (updatedApp: Application, newFiles?: File[], removedFiles?: string[]) => {
    if (!updatedApp.id && !updatedApp.citizen_id) {
      alert("Error: Record ID is missing");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {
        "Accept": "application/json"
      };
      if (token && token !== 'undefined' && token !== 'null') {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Use FormData only if there are new files to upload
      let body: any;
      let method = "PUT";
      let contentType: string | undefined = "application/json";

      if (newFiles && newFiles.length > 0) {
        const formData = new FormData();
        
        // For multipart/form-data updates, many backends require POST with _method=PUT
        formData.append("_method", "PUT");
        method = "POST";
        
        // Append all fields from updatedApp
        Object.entries(updatedApp).forEach(([key, value]) => {
          if (key === 'document') return; // Handle documents separately
          if (value === null || value === undefined) {
            formData.append(key, "");
          } else if (typeof value === 'boolean') {
            formData.append(key, value ? "1" : "0");
          } else {
            formData.append(key, String(value));
          }
        });

        // Append new files
        newFiles.forEach(file => {
          if (file instanceof File) {
            if (file.name === "captured_photo.jpg") {
              formData.append("id_photo", file);
            } else {
              formData.append("document[]", file);
            }
          }
        });

        // Append existing documents info (filtered by removedFiles)
        const docField = updatedApp.document;
        let docArray: any[] = [];
        if (Array.isArray(docField)) {
          docArray = docField;
        } else if (typeof docField === 'string' && docField.trim()) {
          try {
            const parsed = JSON.parse(docField);
            docArray = Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            docArray = [];
          }
        }
        
        const currentDocs = docArray.filter(doc => !removedFiles?.includes(doc.path));
        formData.append("existing_documents", JSON.stringify(currentDocs));

        body = formData;
        contentType = undefined; // Let the browser set it for FormData
      } else {
        // Use JSON for updates without new files
        // If there are removed files, filter the document array
        const docField = updatedApp.document;
        let docArray: any[] = [];
        if (Array.isArray(docField)) {
          docArray = docField;
        } else if (typeof docField === 'string' && docField.trim()) {
          try {
            const parsed = JSON.parse(docField);
            docArray = Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            docArray = [];
          }
        }

        const currentDocs = docArray.filter(doc => !removedFiles?.includes(doc.path));
        
        const payload: any = {
          ...updatedApp,
          existing_documents: currentDocs,
          reg_status: updatedApp.reg_status || "pending"
        };
        
        // Omit the 'document' field from JSON payload because it contains objects,
        // but the backend validation expects it to be an array of files.
        delete payload.document;
        
        body = JSON.stringify(payload);
      }

      const fetchOptions: RequestInit = {
        method,
        headers: contentType ? { ...headers, "Content-Type": contentType } : headers,
        body
      };

      // Determine endpoint and ID
      const targetId = updatedApp.citizen_id || updatedApp.id;
      const endpoint = updatedApp.citizen_id 
        ? `https://api-dbosca.phoenix.com.ph/api/masterlist/${targetId}`
        : `https://api-dbosca.phoenix.com.ph/api/applications/${targetId}`;

      const res = await fetch(endpoint, fetchOptions);

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Invalid JSON:", text);
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to update application");
      }

      alert("Changes saved successfully");
      setIsRegistrationModalOpen(false);
      setIsMasterlistModalOpen(false);
      setSelectedApp(null);
      if (activeTab === 'Masterlist') {
        setMasterlistRefreshKey(prev => prev + 1);
      }
      await fetchApplications();
    } catch (err) {
      console.error("Update error:", err);
      alert(err instanceof Error ? err.message : "An error occurred while saving changes");
    }
  };

  const handleDisapproveClick = (id: number) => {
    setDisapprovingId(id);
    setRejectionRemarks('');
    setIsDisapproveModalOpen(true);
  };

  const submitDisapproval = async () => {
    if (disapprovingId) {
      await updateStatus(disapprovingId, 'disapproved', rejectionRemarks);
      setIsDisapproveModalOpen(false);
      setDisapprovingId(null);
      setRejectionRemarks('');
    }
  };

  const handleApproveClick = (id: number) => {
    setApprovingId(id);
    setIsApproveModalOpen(true);
  };

  const submitApproval = async () => {
    if (approvingId) {
      await updateStatus(approvingId, 'approved');
      setIsApproveModalOpen(false);
      setApprovingId(null);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const submitDelete = async () => {
    if (!deletingId) return;
    
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {
        "Accept": "application/json"
      };
      if (token && token !== 'undefined' && token !== 'null') {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`https://api-dbosca.phoenix.com.ph/api/applications/${deletingId}`, {
        method: "DELETE",
        headers
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Invalid JSON:", text);
      }

      if (res.ok) {
        alert("Record deleted successfully");
        if (activeTab === 'Masterlist') {
          setMasterlistRefreshKey(prev => prev + 1);
        }
        await fetchApplications();
      } else {
        alert(`Delete failed: ${data?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Delete failed");
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    }
  };

  const triggerMoveToPending = (citizenId: number) => {
    setPendingCitizenId(citizenId);
    setIsMoveToPendingModalOpen(true);
  };

  const handleMoveToPending = async () => {
    if (!pendingCitizenId || isMovingToPending) return;
    
    const citizenId = pendingCitizenId;
    setIsMovingToPending(true);
    setIsMoveToPendingModalOpen(false);
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`https://api-dbosca.phoenix.com.ph/api/masterlist/move-to-pending/${citizenId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.data.success) {
        setPendingCitizenId(null);
        setMasterlistRefreshKey(prev => prev + 1);
        await fetchApplications();
        alert("Successfully moved to pending.");
      } else {
        alert(response.data.message || "Failed to move to pending.");
      }
    } catch (error: any) {
      console.error("Move to pending error:", error);
      const errorMessage = error.response?.data?.message || "An error occurred while moving the record to pending.";
      alert(errorMessage);
    } finally {
      setIsMovingToPending(false);
    }
  };

  const triggerResetPassword = (id: number) => {
    setResetPasswordUserId(id);
    setIsResetPasswordModalOpen(true);
  };

  const handleResetPassword = async () => {
    if (!resetPasswordUserId || isResettingPassword) return;
    
    const userId = resetPasswordUserId;
    setIsResettingPassword(true);
    setIsResetPasswordModalOpen(false);
    
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {
        "Accept": "application/json",
        "Content-Type": "application/json"
      };
      if (token && token !== 'undefined' && token !== 'null') {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`https://api-dbosca.phoenix.com.ph/api/auth/admin/reset-password/${userId}`, {
        method: "POST",
        headers
      });

      if (res.ok) {
        alert("Password reset successfully");
        setResetPasswordUserId(null);
      } else {
        const data = await res.json();
        alert(`Reset failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Reset password error:", error);
      alert("Reset password failed");
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FB] font-sans text-[#1E293B]">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20">
        <div className="p-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#0F172A] rounded-full flex items-center justify-center text-white font-bold text-xl">
            SC
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-[#0F172A]">SeniorConnect</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Admin</p>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-2 overflow-y-auto">
          <button 
            onClick={() => handleTabChange('Dashboard')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
              activeTab === 'Dashboard' ? "bg-slate-100 text-[#0F172A]" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>

          <div className="space-y-1">
            <button 
              onClick={() => setIsRegistrationOpen(!isRegistrationOpen)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                activeTab === 'Management' || activeTab === 'Walk-in' ? "text-[#0F172A]" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <div className="flex items-center gap-3">
                <UserPlus className="w-5 h-5" />
                Registration
              </div>
              <ChevronDown className={cn("w-4 h-4 transition-transform", isRegistrationOpen && "rotate-180")} />
            </button>
            {isRegistrationOpen && (
              <div className="ml-12 space-y-1">
                <button 
                  onClick={() => handleTabChange('Management')}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm font-semibold transition-colors relative",
                    activeTab === 'Management' ? "text-[#0F172A]" : "text-slate-400 hover:text-[#0F172A]"
                  )}
                >
                  {activeTab === 'Management' && <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-1 h-4 bg-red-500 rounded-full" />}
                  Management
                </button>
                <button 
                  onClick={() => handleTabChange('Walk-in')}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm font-semibold transition-colors relative",
                    activeTab === 'Walk-in' ? "text-[#0F172A]" : "text-slate-400 hover:text-[#0F172A]"
                  )}
                >
                  {activeTab === 'Walk-in' && <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-1 h-4 bg-red-500 rounded-full" />}
                  Walk-in
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={() => handleTabChange('Masterlist')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
              activeTab === 'Masterlist' ? "bg-slate-100 text-[#0F172A]" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <ClipboardList className="w-5 h-5" />
            Masterlist
          </button>

          <div className="space-y-1">
            <button 
              onClick={() => setIsIdIssuanceOpen(!isIdIssuanceOpen)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                activeTab === 'IdManagement' || activeTab === 'IdWalkIn' ? "text-[#0F172A]" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <div className="flex items-center gap-3">
                <IdCard className="w-5 h-5" />
                ID Issuance
              </div>
              <ChevronDown className={cn("w-4 h-4 transition-transform", isIdIssuanceOpen && "rotate-180")} />
            </button>
            {isIdIssuanceOpen && (
              <div className="ml-12 space-y-1">
                <button 
                  onClick={() => handleTabChange('IdManagement')}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm font-semibold transition-colors relative",
                    activeTab === 'IdManagement' ? "text-[#0F172A]" : "text-slate-400 hover:text-[#0F172A]"
                  )}
                >
                  {activeTab === 'IdManagement' && <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-1 h-4 bg-red-500 rounded-full" />}
                  Management
                </button>
                <button 
                  onClick={() => handleTabChange('IdWalkIn')}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm font-semibold transition-colors relative",
                    activeTab === 'IdWalkIn' ? "text-[#0F172A]" : "text-slate-400 hover:text-[#0F172A]"
                  )}
                >
                  {activeTab === 'IdWalkIn' && <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-1 h-4 bg-red-500 rounded-full" />}
                  Walk-in
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={() => handleTabChange('Benefits')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
              activeTab === 'Benefits' ? "bg-slate-100 text-[#0F172A]" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <Heart className="w-5 h-5" />
            Benefits
          </button>

          <button 
            onClick={() => handleTabChange('PhilHealthFacilitation')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
              activeTab === 'PhilHealthFacilitation' ? "bg-slate-100 text-[#0F172A]" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <Stethoscope className="w-5 h-5" />
            PhilHealth Facilitation
          </button>

          <button 
            onClick={() => handleTabChange('FeedbackConcern')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
              activeTab === 'FeedbackConcern' ? "bg-slate-100 text-[#0F172A]" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <MessageSquare className="w-5 h-5" />
            Feedback and Concern
          </button>

          <div className="pt-10 pb-2">
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registry Reference</p>
          </div>

          <button 
            onClick={() => handleTabChange('LcrRegistry')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
              activeTab === 'LcrRegistry' ? "bg-slate-100 text-[#0F172A]" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <BarChart3 className="w-5 h-5" />
            LCR/PWD Registry
          </button>
        </nav>

        <div className="p-6 mt-auto border-t border-slate-100">
          <button 
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 overflow-y-auto p-12">
        {activeTab === 'Management' && (
          <>
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-4xl font-black tracking-tight text-[#0F172A]">REGISTRATION MANAGEMENT</h2>
                <p className="text-slate-500 font-medium mt-1 text-lg">Central Enrollment Registry</p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date Range (From - To)</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#0F172A] outline-none focus:border-slate-900 transition-all"
                    />
                    <span className="text-slate-400 text-xs font-bold">-</span>
                    <input 
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#0F172A] outline-none focus:border-slate-900 transition-all"
                    />
                    {(dateRange.from || dateRange.to) && (
                      <button 
                        onClick={() => setDateRange({ from: '', to: '' })}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        title="Clear Date Filter"
                      >
                        <X className="w-4 h-4 text-slate-400" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Barangay Filter</label>
                  <div className="relative">
                    <select 
                      value={barangayFilter}
                      onChange={(e) => setBarangayFilter(e.target.value)}
                      className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-bold text-[#0F172A] focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all cursor-pointer min-w-[160px]"
                    >
                      {uniqueBarangays.map(brgy => (
                        <option key={brgy} value={brgy}>{brgy}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status Filter</label>
                  <div className="relative">
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-bold text-[#0F172A] focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all cursor-pointer min-w-[180px]"
                    >
                      <option value="All record">All record</option>
                      <option value="For Approval (pending)">For Approval (pending)</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 self-end">
                  <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#0F172A] text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>
            </header>

            {/* Main Card Container */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 p-10 border border-slate-100">
              {/* Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-[#0F172A]">
                      <th className="px-6 py-5 text-[11px] font-bold text-white uppercase tracking-widest bg-[#0F172A]">FULLNAME</th>
                      <th className="px-6 py-5 text-[11px] font-bold text-white uppercase tracking-widest text-center bg-[#0F172A]">Barangay</th>
                      <th className="px-6 py-5 text-[11px] font-bold text-white uppercase tracking-widest text-center bg-[#0F172A]">Birthdate</th>
                      <th className="px-6 py-5 text-[11px] font-bold text-white uppercase tracking-widest text-center bg-[#0F172A]">REGISTRATION DATE</th>
                      <th className="px-6 py-5 text-[11px] font-bold text-white uppercase tracking-widest text-center bg-[#0F172A]">Registration Type</th>
                      <th className="px-6 py-5 text-[11px] font-bold text-white uppercase tracking-widest text-center bg-[#0F172A]">Status</th>
                      <th className="px-6 py-5 text-[11px] font-bold text-white uppercase tracking-widest text-center bg-[#0F172A]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="px-8 py-32 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-12 h-12 text-[#EF4444] animate-spin" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading records...</p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-8 py-32 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <AlertCircle className="w-16 h-16 text-slate-100" />
                            <p className="text-slate-400 font-medium text-lg">No records found.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredApplications.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-6">
                            <p className="text-sm font-bold text-[#0F172A] uppercase tracking-tight">
                              {formatName(app)}
                            </p>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <p className="text-xs font-bold text-slate-600 uppercase tracking-tight">
                              {app.barangay}
                            </p>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <p className="text-xs font-semibold text-slate-500">{formatDateLong(app.birth_date)}</p>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <p className="text-xs font-semibold text-slate-500">{formatDate(app.registration_date || '')}</p>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1 bg-slate-50 rounded-full">
                              {app.registration_type}
                            </span>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <div className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider",
                                app.reg_status === 'approved' && "bg-emerald-50 text-emerald-600 border-emerald-100",
                                app.reg_status === 'pending' && "bg-amber-50 text-amber-600 border-amber-100",
                                app.reg_status === 'disapproved' && "bg-rose-50 text-rose-600 border-rose-100",
                              )}>
                                <div className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  app.reg_status === 'approved' && "bg-emerald-500",
                                  app.reg_status === 'pending' && "bg-amber-500 animate-pulse",
                                  app.reg_status === 'disapproved' && "bg-rose-500",
                                )} />
                                {app.reg_status === 'disapproved' ? 'DISAPPROVED' : (app.reg_status === 'approved' ? 'APPROVED' : app.reg_status)}
                              </div>
                              {app.reg_status === 'disapproved' && (
                                <button 
                                  onClick={() => {
                                    setSelectedRemarks(app.rejection_remarks || 'No remarks provided.');
                                    setIsRemarksModalOpen(true);
                                  }}
                                  className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline mt-1"
                                >
                                  View Remarks
                                </button>
                              )}
                              {(app.reg_status === 'approved' || app.reg_status === 'disapproved') && app.date_reviewed && (
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                                  Reviewed: {formatDateLong(app.date_reviewed)}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-6 text-right relative">
                            <div className="flex justify-center">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownId(openDropdownId === app.id ? null : app.id);
                                }}
                                className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition text-slate-600"
                              >
                                <MoreVertical className="w-5 h-5" />
                              </button>

                              <AnimatePresence>
                                {openDropdownId === app.id && (
                                  <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.1, ease: "easeOut" }}
                                    className="absolute right-12 top-1/2 -translate-y-1/2 z-30 w-44 bg-white border border-slate-100 rounded-xl shadow-lg py-1 overflow-hidden origin-right"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button 
                                      onClick={() => {
                                        handleViewProfile(app);
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-gray-100 cursor-pointer transition-colors"
                                    >
                                      <Eye className="w-4 h-4 text-slate-400" />
                                      View Profile
                                    </button>
                                    
                                    {app.reg_status === 'pending' && (
                                      <>
                                        <button 
                                          onClick={() => {
                                            setSelectedApp(app);
                                            setModalInitialIsEditing(true);
                                            setIsRegistrationModalOpen(true);
                                            setOpenDropdownId(null);
                                          }}
                                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-gray-100 cursor-pointer transition-colors"
                                        >
                                          <Edit3 className="w-4 h-4 text-slate-400" />
                                          Edit Profile
                                        </button>
                                        <div className="h-px bg-slate-50 my-1" />
                                        <button 
                                          onClick={() => {
                                            handleApproveClick(app.id);
                                            setOpenDropdownId(null);
                                          }}
                                          className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-emerald-600 hover:bg-gray-100 cursor-pointer transition-colors"
                                        >
                                          <Check className="w-4 h-4" />
                                          Approve
                                        </button>
                                        <button 
                                          onClick={() => {
                                            handleDisapproveClick(app.id);
                                            setOpenDropdownId(null);
                                          }}
                                          className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-rose-600 hover:bg-gray-100 cursor-pointer transition-colors"
                                        >
                                          <X className="w-4 h-4" />
                                          Disapprove
                                        </button>
                                        <div className="h-px bg-slate-50 my-1" />
                                        <button 
                                          onClick={() => {
                                            handleDeleteClick(app.id);
                                            setOpenDropdownId(null);
                                          }}
                                          className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-rose-600 hover:bg-gray-100 cursor-pointer transition-colors"
                                        >
                                          <X className="w-4 h-4" />
                                          Delete Record
                                        </button>
                                      </>
                                    )}

                                    {app.reg_status === 'disapproved' && (
                                      <>
                                        <div className="h-px bg-slate-50 my-1" />
                                        <button 
                                          onClick={() => {
                                            updateStatus(app.id, 'pending');
                                            setOpenDropdownId(null);
                                          }}
                                          className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-amber-600 hover:bg-gray-100 cursor-pointer transition-colors"
                                        >
                                          <RefreshCw className="w-4 h-4" />
                                          Move to Pending
                                        </button>
                                      </>
                                    )}
                                  </motion.div>
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

              {/* Pagination */}
              {filteredApplications.length > itemsPerPage && (
                <div className="flex items-center justify-between mt-8 pt-8 border-t border-slate-50">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Showing <span className="text-slate-900">{Math.min(filteredApplications.length, (currentPage - 1) * itemsPerPage + 1)}</span> to <span className="text-slate-900">{Math.min(filteredApplications.length, currentPage * itemsPerPage)}</span> of <span className="text-slate-900">{filteredApplications.length}</span> records
                  </p>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.ceil(filteredApplications.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={cn(
                            "w-10 h-10 rounded-xl text-xs font-black transition-all",
                            currentPage === page 
                              ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                              : "text-slate-400 hover:bg-slate-50"
                          )}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredApplications.length / itemsPerPage), prev + 1))}
                      disabled={currentPage === Math.ceil(filteredApplications.length / itemsPerPage)}
                      className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'Walk-in' && (
          !isWalkInFormOpen ? (
            <WalkInEnrollment 
              lcrData={lcrData}
              onProceed={(record) => {
                setSelectedLcrRecord(record);
                setIsWalkInFormOpen(true);
              }}
              onBack={() => handleTabChange('Management')}
            />
          ) : (
            <RegistrationForm 
              registrationType="Walk-in"
              isLcrVerified={!!selectedLcrRecord}
              lcrName={selectedLcrRecord?.full_name || ""}
              initialData={selectedLcrRecord ? {
                lastName: selectedLcrRecord.full_name.split(' ').slice(-1)[0],
                firstName: selectedLcrRecord.full_name.split(' ').slice(0, -1).join(' '),
                birthDate: selectedLcrRecord.birth_date,
                age: selectedLcrRecord.age
              } : undefined}
              onComplete={() => {
                fetchApplications();
                setIsWalkInFormOpen(false);
                setSelectedLcrRecord(null);
                handleTabChange('Management');
              }}
              onBack={() => {
                setIsWalkInFormOpen(false);
                setSelectedLcrRecord(null);
              }}
            />
          )
        )}

        {activeTab === 'IdManagement' && (
          <IdIssuanceModule type="Management" applications={applications} />
        )}

        {activeTab === 'IdWalkIn' && (
          <IdIssuanceModule type="Walk-In" applications={applications} />
        )}

        {activeTab === 'Benefits' && (
          <BenefitsModule />
        )}

        {activeTab === 'PhilHealthFacilitation' && (
          <PhilHealthFacilitation />
        )}

        {activeTab === 'LcrRegistry' && (
          <LcrRegistry 
            lcrData={lcrData}
            onRefresh={() => setLcrData(initialLcrData)}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'Masterlist' && (
          <Masterlist 
            onViewProfile={handleViewProfile}
            refreshTrigger={masterlistRefreshKey}
            onMoveToPending={triggerMoveToPending}
            onResetPassword={triggerResetPassword}
          />
        )}

        {activeTab === 'FeedbackConcern' && (
          <FeedbackConcern />
        )}

        {activeTab === 'Dashboard' && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-slate-300">
            <LayoutDashboard className="w-20 h-20 mb-4 opacity-20" />
            <p className="text-xl font-bold uppercase tracking-widest opacity-20">Dashboard Overview Coming Soon</p>
          </div>
        )}

        <AnimatePresence>
          {isRegistrationModalOpen && selectedApp && (
            <RegistrationProfileModal 
              application={selectedApp}
              isOpen={isRegistrationModalOpen}
              initialIsEditing={modalInitialIsEditing}
              onClose={() => {
                setIsRegistrationModalOpen(false);
                setModalInitialIsEditing(false);
              }}
              onSave={handleSaveProfile}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isMasterlistModalOpen && selectedApp && (
            <MasterlistProfileModal 
              application={selectedApp}
              isOpen={isMasterlistModalOpen}
              onClose={() => setIsMasterlistModalOpen(false)}
              onSave={handleSaveProfile}
              onRefresh={() => {
                setMasterlistRefreshKey(prev => prev + 1);
                fetchApplications();
              }}
              onMoveToPending={triggerMoveToPending}
              onResetPassword={triggerResetPassword}
            />
          )}
        </AnimatePresence>

        {/* Disapprove Modal */}
        <AnimatePresence>
          {isDisapproveModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-[#0F172A] uppercase tracking-tight">Disapprove Application</h3>
                    <button 
                      onClick={() => setIsDisapproveModalOpen(false)}
                      className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rejection Remarks</label>
                      <textarea 
                        value={rejectionRemarks}
                        onChange={(e) => setRejectionRemarks(e.target.value)}
                        placeholder="Enter reason for disapproval..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium text-[#0F172A] focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all min-h-[120px] resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <button 
                      onClick={() => setIsDisapproveModalOpen(false)}
                      className="flex-1 px-6 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={submitDisapproval}
                      className="flex-1 px-6 py-3.5 bg-rose-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-200"
                    >
                      Confirm Disapprove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Approve Modal */}
        <AnimatePresence>
          {isApproveModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-[#0F172A] uppercase tracking-tight">Approve Application</h3>
                    <button 
                      onClick={() => setIsApproveModalOpen(false)}
                      className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <p className="text-slate-600 font-medium">Are you sure you want to approve this application? This will mark the citizen as an official senior citizen member.</p>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <button 
                      onClick={() => setIsApproveModalOpen(false)}
                      className="flex-1 px-6 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={submitApproval}
                      className="flex-1 px-6 py-3.5 bg-emerald-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200"
                    >
                      Confirm Approve
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {isDeleteModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-[#0F172A] uppercase tracking-tight">Delete Record</h3>
                    <button 
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <p className="text-slate-600 font-medium">Are you sure you want to delete this record? This action cannot be undone and all data associated with this application will be permanently removed.</p>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <button 
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="flex-1 px-6 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={submitDelete}
                      className="flex-1 px-6 py-3.5 bg-rose-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-200"
                    >
                      Confirm Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Move to Pending Confirmation Modal */}
        <AnimatePresence>
          {isMoveToPendingModalOpen && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
              >
                <div className="p-8">
                  <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
                    <AlertCircle className="w-8 h-8 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">
                    Confirm Action
                  </h3>
                  <p className="text-slate-500 leading-relaxed mb-8">
                    Are you sure you want to move this record to pending?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsMoveToPendingModalOpen(false)}
                      className="flex-1 px-6 py-4 rounded-2xl text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleMoveToPending}
                      disabled={isMovingToPending}
                      className="flex-1 px-6 py-4 bg-amber-600 rounded-2xl text-xs font-black text-white uppercase tracking-widest hover:bg-amber-700 shadow-lg shadow-amber-200 transition-all disabled:opacity-50"
                    >
                      {isMovingToPending ? "Moving..." : "Confirm"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* Reset Password Confirmation Modal */}
        <AnimatePresence>
          {isResetPasswordModalOpen && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
              >
                <div className="p-8">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                    <AlertCircle className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">
                    Confirm Action
                  </h3>
                  <p className="text-slate-500 leading-relaxed mb-8">
                    Are you sure you want to reset this user's password?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsResetPasswordModalOpen(false)}
                      className="flex-1 px-6 py-4 rounded-2xl text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleResetPassword}
                      disabled={isResettingPassword}
                      className="flex-1 px-6 py-4 bg-blue-600 rounded-2xl text-xs font-black text-white uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
                    >
                      {isResettingPassword ? "Resetting..." : "Confirm"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Rejection Remarks Modal */}
        <AnimatePresence>
          {isRemarksModalOpen && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
              >
                <div className="p-8">
                  <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">
                    Rejection Details
                  </h3>
                  <div className="bg-slate-50 rounded-2xl p-6 mb-8">
                    <p className="text-slate-600 leading-relaxed italic">
                      "{selectedRemarks}"
                    </p>
                  </div>
                  <button
                    onClick={() => setIsRemarksModalOpen(false)}
                    className="w-full px-6 py-4 bg-slate-900 rounded-2xl text-xs font-black text-white uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
