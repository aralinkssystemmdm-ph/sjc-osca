import React, { useState, useEffect } from 'react';
import { 
  X, 
  Edit3, 
  Save, 
  User, 
  MapPin, 
  Briefcase, 
  Heart, 
  Phone, 
  Mail, 
  FileText,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  ClipboardList,
  Calendar,
  Loader2,
  Download,
  Eye,
  RefreshCw,
  Trash2,
  Camera,
  Upload,
  RotateCcw,
  PenTool
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Application } from '../App';
import PdfViewer from './PdfViewer';

const formatDate = (date: any) => {
  if (!date) return '---';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const getFileUrl = (file: any) => {
  if (!file) return null;

  const storageBaseUrl = "https://api-dbosca.phoenix.com.ph/storage/";

  // If it's a data URL or already absolute, return as is
  if (typeof file === "string" && (file.startsWith('data:') || file.startsWith('http'))) {
    return file;
  }

  // If it starts with /api/, it's already a full view URL from the backend
  if (typeof file === "string" && file.startsWith('/api/')) {
    return `https://api-dbosca.phoenix.com.ph${file}`;
  }

  // If JSON string → parse
  if (typeof file === "string" && file.startsWith("[")) {
    try {
      const parsed = JSON.parse(file);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const path = parsed[0].path || parsed[0].file_path;
        return path ? `${storageBaseUrl}${path}` : null;
      }
    } catch (e) {
      console.error("JSON parse error in getFileUrl:", e);
    }
  }

  // If already array
  if (Array.isArray(file)) {
    if (file.length > 0) {
      const path = file[0].path || file[0].file_path;
      return path ? `${storageBaseUrl}${path}` : null;
    }
    return null;
  }

  // If raw string path
  if (typeof file === "string") {
    // Clean potential quotes
    const cleanPath = file.replace(/^["']|["']$/g, '');
    return `${storageBaseUrl}${cleanPath}`;
  }

  return null;
};

const getRawPath = (file: any) => {
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

const AuthenticatedPreview = ({ path, label }: { path: string, label: string }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }
    
    // If it's already a data URL
    if (path.startsWith('data:')) {
      setUrl(path);
      setLoading(false);
      return;
    }

    const fetchFile = async () => {
      try {
        const token = localStorage.getItem('token');
        const cleanPath = path.includes('/storage/') ? path.split('/storage/')[1] : path;
        
        // If it's a full external URL but not ours
        if (path.startsWith('http') && !path.includes('api-dbosca.phoenix.com.ph')) {
           setUrl(path);
           setLoading(false);
           return;
        }

        const response = await fetch(`https://api-dbosca.phoenix.com.ph/api/files/view?path=${encodeURIComponent(cleanPath)}&action=view`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const blob = await response.blob();
          setUrl(URL.createObjectURL(blob));
        } else {
          setError(true);
        }
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
    return () => { if (url && url.startsWith('blob:')) URL.revokeObjectURL(url); };
  }, [path]);

  if (loading) return <div className="flex items-center justify-center p-4"><Loader2 className="w-5 h-5 text-slate-300 animate-spin" /></div>;
  if (error || !url) return <div className="flex flex-col items-center gap-2"><AlertCircle className="w-8 h-8 text-slate-200" /><span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Load Error</span></div>;

  const isPdf = path.toLowerCase().endsWith('.pdf') || url.includes('application/pdf');

  if (isPdf) return <div className="flex flex-col items-center gap-2 px-4 text-center"><FileText className="w-8 h-8 text-rose-400" /><span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">PDF Document</span></div>;

  return <img src={url} alt={label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />;
};

interface BenefitsProfileModalProps {
  application: Application;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedApp: Application, files?: File[]) => Promise<void> | void;
  readOnly?: boolean;
  initialIsEditing?: boolean;
}

interface ProfileFormData {
  id?: number;
  citizen_id: string;
  scid_number: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  birthDate: string;
  age: string | number;
  gender: string;
  civilStatus: string;
  citizenship: string;
  birthPlace: string;
  address: string;
  barangay: string;
  city: string;
  district: string;
  province: string;
  email: string;
  livingArrangement: string;
  isPensioner: boolean;
  gsis: boolean;
  sss: boolean;
  afpslai: boolean;
  otherPension: string;
  pensionAmount: string | number;
  hasIncome: boolean;
  incomeSource: string;
  hasSupport: boolean;
  supportCash: boolean;
  supportCashAmount: string | number;
  supportCashFrequency: string;
  supportInKind: boolean;
  supportInKindDetails: string;
  hasIllness: boolean;
  illnessDetails: string;
  hospitalized: boolean;
  contactNumber: string;
  registration_type: string;
  reg_status?: string;
  incentive_tier?: string | number;
  created_at?: string;
  remarks?: string;
}

const SectionHeader = ({ icon: Icon, title, color }: { icon: any, title: string, color: string }) => (
  <div className="flex items-center gap-2 mb-6 pt-6 border-t border-slate-100 first:border-t-0 first:pt-0">
    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", color)}>
      <Icon className="w-4 h-4 text-white" />
    </div>
    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">{title}</h3>
  </div>
);

const Field = ({ 
  label, 
  value, 
  field, 
  isEditing, 
  onChange, 
  type = "text", 
  options,
  disabled = false,
  placeholder
}: { 
  label: string, 
  value: any, 
  field: string, 
  isEditing: boolean,
  onChange: (field: string, value: any) => void,
  type?: string, 
  options?: string[],
  disabled?: boolean,
  placeholder?: string
}) => {
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

  const isTrue = (val: any) => val === true || val === 1 || val === "1";

  if (isEditing) {
    if (disabled) {
      return (
        <div className="space-y-1.5 opacity-70">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
          <div className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 cursor-not-allowed">
            {value || '---'}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        {type === "select" ? (
          <select 
            value={value || ''} 
            onChange={(e) => onChange(field, e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
          >
            <option value="">Select {label}</option>
            {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : type === "textarea" ? (
          <textarea 
            value={value || ''} 
            onChange={(e) => onChange(field, e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all resize-none"
            placeholder={placeholder}
          />
        ) : type === "checkbox" ? (
          <div className="flex items-center gap-2 py-2">
            <input 
              type="checkbox" 
              checked={isTrue(value)} 
              onChange={(e) => onChange(field, e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-rose-500 focus:ring-rose-500"
            />
            <span className="text-sm font-bold text-slate-700">Yes</span>
          </div>
        ) : (
          <input 
            type={type} 
            value={value === null || value === undefined ? '' : value} 
            onChange={(e) => onChange(field, type === "number" ? (e.target.value === "" ? 0 : Number(e.target.value)) : e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-slate-700">
        {type === 'checkbox' ? (isTrue(value) ? 'YES' : 'NO') : (type === 'date' ? formatDate(value) : (value || '---'))}
      </p>
    </div>
  );
};

export default function BenefitsProfileModal({ 
  application, 
  isOpen, 
  onClose, 
  onSave, 
  readOnly = false,
  initialIsEditing = false 
}: BenefitsProfileModalProps) {
  const app = application as any;
  const isExisting = !!application.id;
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [isSaving, setIsSaving] = useState(false);

  // Attachment and Photo Capture State
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsEditing(initialIsEditing);
      setNewAttachments([]);
      setCapturedPhoto(null);
      setIsCapturing(false);
    }
  }, [isOpen, initialIsEditing]);

  const startCamera = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access failed", err);
      alert("Camera access failed. Please allow camera permission.");
      setIsCapturing(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setCapturedPhoto(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileList = Array.from(files);
      setNewAttachments(prev => [...prev, ...fileList]);
    }
  };

  const removeNewAttachment = (index: number) => {
    setNewAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const base64ToFile = (base64: string, filename: string) => {
    if (!base64 || !base64.includes(',')) return null;
    try {
      const arr = base64.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    } catch (e) {
      console.error("Base64 to File conversion failed:", e);
      return null;
    }
  };

  const [isFetchingFile, setIsFetchingFile] = useState(false);
  const [viewingFile, setViewingFile] = useState<{ 
    url: string | null, 
    directUrl?: string,
    filename: string, 
    type: string, 
    jsonData?: any,
    isPdf?: boolean
  } | null>(null);
  const [useGoogleViewer, setUseGoogleViewer] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    id: application.id,
    citizen_id: application.citizen_id || "",
    scid_number: application.scid_number || "",
    firstName: application.first_name || "",
    middleName: application.middle_name || "",
    lastName: application.last_name || "",
    suffix: application.suffix || "",
    birthDate: application.birth_date || "",
    age: application.age || "",
    gender: application.sex || "",
    civilStatus: application.civil_status || "",
    citizenship: application.citizenship || "",
    birthPlace: application.birth_place || "",
    address: application.address || "",
    barangay: application.barangay || "",
    city: application.city_municipality || "",
    district: application.district || "",
    province: application.province || "",
    email: application.email || "",
    livingArrangement: application.living_arrangement || "",
    isPensioner: application.is_pensioner === 1,
    gsis: application.pension_source_gsis === 1,
    sss: application.pension_source_sss === 1,
    afpslai: application.pension_source_afpslai === 1,
    otherPension: application.pension_source_others || "",
    pensionAmount: application.pension_amount || "",
    hasIncome: application.has_permanent_income === 1,
    incomeSource: application.permanent_income_source || "",
    hasSupport: application.has_regular_support === 1,
    supportCash: application.support_type_cash === 1,
    supportCashAmount: application.support_cash_amount || "",
    supportCashFrequency: application.support_cash_frequency || "",
    supportInKind: application.support_type_inkind === 1,
    supportInKindDetails: application.support_inkind_details || "",
    hasIllness: application.has_illness === 1,
    illnessDetails: application.illness_details || "",
    hospitalized: application.hospitalized_last_6_months === 1,
    contactNumber: application.contact_number || "",
    registration_type: application.registration_type || "",
    reg_status: (application as any).status || application.reg_status || "pending",
    incentive_tier: (application as any).incentive_tier || "",
    created_at: (application as any).created_at || "",
    remarks: application.remarks || ""
  });

  useEffect(() => {
    if (application && !isEditing) {
      setFormData({
        id: application.id,
        citizen_id: application.citizen_id || "",
        scid_number: application.scid_number || "",
        firstName: application.first_name || "",
        middleName: application.middle_name || "",
        lastName: application.last_name || "",
        suffix: application.suffix || "",
        birthDate: application.birth_date || "",
        age: application.age || "",
        gender: application.sex || "",
        civilStatus: application.civil_status || "",
        citizenship: application.citizenship || "",
        birthPlace: application.birth_place || "",
        address: application.address || "",
        barangay: application.barangay || "",
        city: application.city_municipality || "",
        district: application.district || "",
        province: application.province || "",
        email: application.email || "",
        livingArrangement: application.living_arrangement || "",
        isPensioner: application.is_pensioner === 1,
        gsis: application.pension_source_gsis === 1,
        sss: application.pension_source_sss === 1,
        afpslai: application.pension_source_afpslai === 1,
        otherPension: application.pension_source_others || "",
        pensionAmount: application.pension_amount || "",
        hasIncome: application.has_permanent_income === 1,
        incomeSource: application.permanent_income_source || "",
        hasSupport: application.has_regular_support === 1,
        supportCash: application.support_type_cash === 1,
        supportCashAmount: application.support_cash_amount || "",
        supportCashFrequency: application.support_cash_frequency || "",
        supportInKind: application.support_type_inkind === 1,
        supportInKindDetails: application.support_inkind_details || "",
        hasIllness: application.has_illness === 1,
        illnessDetails: application.illness_details || "",
        hospitalized: application.hospitalized_last_6_months === 1,
        contactNumber: application.contact_number || "",
        registration_type: application.registration_type || "",
        reg_status: (application as any).status || application.reg_status || "pending",
        incentive_tier: (application as any).incentive_tier || "",
        created_at: (application as any).created_at || "",
        remarks: application.remarks || ""
      });
    }
  }, [application, isEditing]);

  if (!isOpen) return null;

  const calculateAge = (birth_date: string) => {
    if (!birth_date) return 0;
    const today = new Date();
    const birth = new Date(birth_date);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (formData.email && formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert("Please enter a valid email address");
      return;
    }

    if (formData.contactNumber && formData.contactNumber.toString().trim() && formData.contactNumber.toString().length !== 11) {
      alert("Contact number must be 11 digits");
      return;
    }

    setIsSaving(true);
    try {
      const updatedApp: any = {
        ...application,
        id: formData.id!,
        citizen_id: formData.citizen_id,
        scid_number: formData.scid_number,
        first_name: formData.firstName,
        middle_name: formData.middleName,
        last_name: formData.lastName,
        suffix: formData.suffix,
        birth_date: formData.birthDate,
        age: Number(formData.age),
        sex: formData.gender,
        civil_status: formData.civilStatus,
        citizenship: formData.citizenship,
        birth_place: formData.birthPlace,
        address: formData.address,
        barangay: formData.barangay,
        city_municipality: formData.city,
        district: formData.district,
        province: formData.province,
        email: formData.email,
        living_arrangement: formData.livingArrangement,
        is_pensioner: formData.isPensioner ? 1 : 0,
        pension_source_gsis: formData.gsis ? 1 : 0,
        pension_source_sss: formData.sss ? 1 : 0,
        pension_source_afpslai: formData.afpslai ? 1 : 0,
        pension_source_others: formData.otherPension,
        pension_amount: Number(formData.pensionAmount),
        has_permanent_income: formData.hasIncome ? 1 : 0,
        permanent_income_source: formData.incomeSource,
        has_regular_support: formData.hasSupport ? 1 : 0,
        support_type_cash: formData.supportCash ? 1 : 0,
        support_cash_amount: Number(formData.supportCashAmount),
        support_cash_frequency: formData.supportCashFrequency,
        support_type_inkind: formData.supportInKind ? 1 : 0,
        support_inkind_details: formData.supportInKindDetails,
        has_illness: formData.hasIllness ? 1 : 0,
        illness_details: formData.illnessDetails,
        hospitalized_last_6_months: formData.hospitalized ? 1 : 0,
        contact_number: formData.contactNumber,
        registration_type: formData.registration_type,
        reg_status: formData.reg_status as any,
        incentive_tier: formData.incentive_tier,
        remarks: formData.remarks
      };

      const files: File[] = [...newAttachments];
      if (capturedPhoto) {
        const photoFile = base64ToFile(capturedPhoto, "captured_photo.jpg");
        if (photoFile) files.push(photoFile);
      }

      await onSave(updatedApp, files);
      setIsEditing(false);
    } catch (error: any) {
      console.error("Save error:", error);
      alert(error.message || "An error occurred during save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'birthDate') {
        newData.age = calculateAge(value);
      }
      return newData;
    });
  };

  const handleToggle = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: !(prev as any)[field]
    }));
  };

  const getAttachments = (attachments: any) => {
    if (Array.isArray(attachments)) return attachments;
    if (typeof attachments === 'string') {
      try {
        const parsed = JSON.parse(attachments);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const handleFileAction = async (path: string, filename: string, action: 'view' | 'download') => {
    if (path.startsWith('data:')) {
      if (action === 'view') {
        const fileType = path.split(';')[0].split(':')[1];
        setViewingFile({ url: path, filename, type: fileType });
      } else {
        const link = document.createElement('a');
        link.href = path;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      return;
    }

    if (path.startsWith('http')) {
      if (action === 'view') {
        const isPdf = path.toLowerCase().endsWith('.pdf');
        setViewingFile({ 
          url: path, 
          directUrl: path,
          filename, 
          type: isPdf ? 'application/pdf' : 'image', 
          isPdf 
        });
      } else {
        const link = document.createElement('a');
        link.href = path;
        link.setAttribute('download', filename);
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      return;
    }

    setIsFetchingFile(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = `https://api-dbosca.phoenix.com.ph/api/files/view`;
      
      // Ensure name has an extension for the API to guess mime type correctly if not provided
      let finalName = filename;
      if (!finalName.includes('.')) {
        const ext = path.split('.').pop()?.toLowerCase();
        if (ext && ext.length <= 4 && /^[a-z0-9]+$/.test(ext)) {
          finalName = `${filename}.${ext}`;
        } else {
          // Default to common extension if we can't find one
          finalName = `${filename}.jpg`;
        }
      }

      const queryParams = `path=${encodeURIComponent(path)}&name=${encodeURIComponent(finalName)}&action=${action}`;
      const url = `${baseUrl}?${queryParams}`;
      
      // Debug: Log the file URL
      console.log(`[DEBUG] Fetching file: ${url}`);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('File fetch failed:', { status: response.status, errorText, url });
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      const blob = await response.blob();

      if (action === 'view') {
        let fileUrl: string | null = null;
        let fileType: string = blob.type || (filename.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/) ? 'image' : 'document');
        let jsonData: any = null;
        let isPdf = filename.toLowerCase().endsWith('.pdf') || 
                   blob.type === 'application/pdf' || 
                   blob.type === 'application/x-pdf';

        if (contentType && contentType.includes('application/json')) {
          try {
            const text = await blob.text();
            jsonData = JSON.parse(text);
          } catch (e) {
            console.warn('JSON parsing failed');
          }
        }

        if (isPdf || (!jsonData && (fileType.startsWith('image/') || filename.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/)))) {
          // Requirement: Ensure correct blob type for PDF and use response()->file() style
          const finalBlob = isPdf ? new Blob([blob], { type: 'application/pdf' }) : blob;
          fileUrl = window.URL.createObjectURL(finalBlob);
        }

        // Add token to direct URL for Google Viewer fallback if possible
        const directUrl = `${url}${token ? `&token=${token}` : ''}`;
        
        setPdfError(false);
        setUseGoogleViewer(false);
        setViewingFile({ url: fileUrl, directUrl, filename, type: fileType, jsonData, isPdf });
      } else {
        const fileUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = fileUrl;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(fileUrl);
      }
    } catch (error) {
      console.error('Error handling file:', error);
      alert('Failed to process file request. Please try again.');
    } finally {
      setIsFetchingFile(false);
    }
  };

  useEffect(() => {
    if (viewingFile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [viewingFile]);

  useEffect(() => {
    const currentUrl = viewingFile?.url;
    return () => {
      if (currentUrl && currentUrl.startsWith('blob:')) {
        window.URL.revokeObjectURL(currentUrl);
      }
    };
  }, [viewingFile]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-10">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 lg:px-12 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
              <User className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                {formData.lastName}, {formData.firstName} {formData.middleName || ''}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                  (String(formData.reg_status || "").toLowerCase() === 'approved') ? "bg-emerald-50 text-emerald-600" :
                  (String(formData.reg_status || "").toLowerCase() === 'pending') ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                )}>
                  {formData.reg_status}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">• ID: {formData.id}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {!isEditing ? (
              !readOnly && (
                <button 
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Profile
                </button>
              )
            ) : (
              <>
                <button 
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  disabled={isSaving}
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
            <button 
              onClick={onClose}
              className="p-3 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-12 no-scrollbar">
          {(() => {
            const isSocialPension = formData.registration_type?.toLowerCase().includes('social pension');
            
            if (isSocialPension) {
              return (
                <div className="space-y-12">
                  <div className="space-y-8">
                    <SectionHeader icon={User} title="Personal Information" color="bg-indigo-500" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <Field label="Citizen ID" value={formData.citizen_id} field="citizen_id" isEditing={isEditing} onChange={handleChange} disabled={true} />
                      <Field label="SCID Number" value={formData.scid_number} field="scid_number" isEditing={isEditing} onChange={handleChange} disabled={isExisting} />
                      <Field label="First Name" value={formData.firstName} field="firstName" isEditing={isEditing} onChange={handleChange} disabled={isExisting} />
                      <Field label="Middle Name" value={formData.middleName} field="middleName" isEditing={isEditing} onChange={handleChange} disabled={isExisting} />
                      <Field label="Last Name" value={formData.lastName} field="lastName" isEditing={isEditing} onChange={handleChange} disabled={isExisting} />
                      <Field label="Birthdate" value={formData.birthDate} field="birthDate" type="date" isEditing={isEditing} onChange={handleChange} disabled={isExisting} />
                      <Field label="Age" value={formData.age} field="age" type="number" isEditing={isEditing} onChange={handleChange} disabled={true} />
                      <Field label="Contact Number" value={formData.contactNumber} field="contactNumber" isEditing={isEditing} onChange={handleChange} disabled={isExisting} />
                    </div>
                  </div>

                  <div className="space-y-8">
                    <SectionHeader icon={MapPin} title="Location" color="bg-emerald-500" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <Field label="Barangay" value={formData.barangay} field="barangay" isEditing={isEditing} onChange={handleChange} disabled={isExisting} />
                      <Field label="City / Municipality" value={formData.city} field="city" isEditing={isEditing} onChange={handleChange} disabled={isExisting} />
                      <Field label="Province" value={formData.province} field="province" isEditing={isEditing} onChange={handleChange} disabled={isExisting} />
                    </div>
                  </div>

                  <div className="space-y-8">
                    <SectionHeader icon={ClipboardList} title="Status & Timestamps" color="bg-blue-500" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <Field 
                        label="Registration Status" 
                        value={formData.reg_status} 
                        field="reg_status" 
                        isEditing={isEditing} 
                        onChange={handleChange} 
                        type="select"
                        options={['pending', 'approved', 'disapproved', 'rejected']}
                      />
                      <Field 
                        label="Date Submitted" 
                        value={formatDate(formData.created_at)} 
                        field="created_at" 
                        isEditing={false} 
                        onChange={handleChange} 
                      />
                    </div>
                  </div>

                  {/* REMARKS for Social Pension */}
                  <div className="space-y-8">
                    <SectionHeader icon={PenTool} title="Remarks" color="bg-slate-700" />
                    <div className="grid grid-cols-1 gap-8">
                      <Field 
                        label="Administrative Remarks" 
                        value={formData.remarks} 
                        field="remarks" 
                        isEditing={isEditing} 
                        onChange={handleChange} 
                        type="textarea"
                      />
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <>
                {formData.registration_type?.includes('Wedding') ? (
                <div className="space-y-12">
              {/* Husband Information */}
              <div className="space-y-8">
                <SectionHeader icon={User} title="Husband Information" color="bg-blue-500" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <Field label="Full Name" value={app.husband?.full_name} field="husband_full_name" isEditing={false} onChange={handleChange} />
                  <Field label="Birthdate" value={app.husband?.birth_date} field="husband_birth_date" type="date" isEditing={false} onChange={handleChange} />
                  <Field label="Age" value={app.husband?.age} field="husband_age" isEditing={false} onChange={handleChange} />
                  <Field label="Contact" value={app.husband?.contact_number} field="husband_contact" isEditing={false} onChange={handleChange} />
                </div>
              </div>

              {/* Wife Information */}
              <div className="space-y-8">
                <SectionHeader icon={User} title="Wife Information" color="bg-rose-500" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <Field label="Full Name" value={app.wife?.full_name} field="wife_full_name" isEditing={false} onChange={handleChange} />
                  <Field label="Birthdate" value={app.wife?.birth_date} field="wife_birth_date" type="date" isEditing={false} onChange={handleChange} />
                  <Field label="Age" value={app.wife?.age} field="wife_age" isEditing={false} onChange={handleChange} />
                  <Field label="Contact" value={app.wife?.contact_number} field="wife_contact" isEditing={false} onChange={handleChange} />
                </div>
              </div>

              {/* Marriage Details */}
              <div className="space-y-8">
                <SectionHeader icon={Heart} title="Marriage Details" color="bg-red-500" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <Field label="Marriage Date" value={app.marriage_details?.marriage_date} field="marriage_date" type="date" isEditing={false} onChange={handleChange} />
                </div>
              </div>

              {/* Certificate */}
              <div className="space-y-8">
                <SectionHeader icon={FileText} title="Certificate" color="bg-slate-500" />
                <div className="w-full bg-slate-50 rounded-[2rem] border border-slate-200 overflow-hidden shadow-inner">
                  {(() => {
                    const rawPath = getRawPath(app.marriage_details?.certificate_url || app.certificate_url);
                    
                    if (!rawPath) {
                      return (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                          <AlertCircle className="w-12 h-12 text-slate-200" />
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest tracking-tight">No certificate uploaded</p>
                        </div>
                      );
                    }

                    return (
                      <>
                        <div className="relative bg-white min-h-[400px] flex items-center justify-center p-4">
                          <AuthenticatedPreview path={rawPath} label="Marriage Certificate" />
                        </div>
                        <div className="p-6 bg-white border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                          <button 
                            type="button"
                            onClick={() => handleFileAction(rawPath, "Marriage Certificate", 'view')}
                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95 outline-none"
                          >
                            <Eye className="w-4 h-4" /> View Fullscreen
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleFileAction(rawPath, "Marriage Certificate.pdf", 'download')}
                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95 outline-none"
                          >
                            <Download className="w-4 h-4" /> Download Certificate
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-8">
                <SectionHeader icon={MapPin} title="Location" color="bg-emerald-500" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <Field label="Barangay" value={app.location?.barangay} field="barangay" isEditing={false} onChange={handleChange} />
                  <Field label="City / Municipality" value={app.location?.city_municipality} field="city" isEditing={false} onChange={handleChange} />
                  <Field label="Province" value={app.location?.province} field="province" isEditing={false} onChange={handleChange} />
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-8">
                <SectionHeader icon={PenTool} title="Remarks" color="bg-slate-700" />
                <div className="grid grid-cols-1 gap-8">
                  <Field 
                    label="Administrative Remarks" 
                    value={formData.remarks} 
                    field="remarks" 
                    isEditing={isEditing} 
                    onChange={handleChange} 
                    type="textarea"
                  />
                </div>
              </div>

              {/* Status & Timestamps */}
              <div className="space-y-8">
                <SectionHeader icon={ClipboardList} title="Status & Timestamps" color="bg-indigo-500" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <Field 
                    label="Status" 
                    value={formData.reg_status} 
                    field="reg_status" 
                    isEditing={isEditing} 
                    onChange={handleChange} 
                    type="select"
                    options={['pending', 'approved', 'disapproved', 'rejected']}
                  />
                  <Field label="Submitted At" value={formatDate(app.submitted_at)} field="submitted_at" isEditing={false} onChange={handleChange} />
                  <Field label="Updated At" value={formatDate(app.updated_at)} field="updated_at" isEditing={false} onChange={handleChange} />
                </div>
              </div>
            </div>
          ) : (
                <>
                  {/* BIRTHDAY INCENTIVE SPECIFIC */}
                  {(formData.registration_type?.includes('Birthday')) && (
                    <div className="space-y-8">
                       <SectionHeader icon={Heart} title="Incentive Details" color="bg-amber-500" />
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          <Field 
                            label="Incentive Tier" 
                            value={formData.incentive_tier} 
                            field="incentive_tier" 
                            isEditing={isEditing} 
                            onChange={handleChange} 
                            type="select"
                            options={['70', '80', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '100']}
                          />
                       </div>
                    </div>
                  )}

                  {/* PERSONAL INFO */}
                  <div className="space-y-8">
                    <SectionHeader icon={User} title="Personal Information" color="bg-indigo-500" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <Field label="Citizen ID" value={formData.citizen_id} field="citizen_id" isEditing={isEditing} onChange={handleChange} disabled={true} />
                      <Field label="SCID Number" value={formData.scid_number} field="scid_number" isEditing={isEditing} onChange={handleChange} disabled={isExisting} />
                      <Field label="First Name" value={formData.firstName} field="firstName" isEditing={isEditing} onChange={handleChange} disabled={isExisting} />
                      <Field label="Middle Name" value={formData.middleName} field="middleName" isEditing={isEditing} onChange={handleChange} disabled={isExisting} />
                      <Field label="Last Name" value={formData.lastName} field="lastName" isEditing={isEditing} onChange={handleChange} disabled={isExisting} />
                      <Field label="Birthdate" value={formData.birthDate} field="birthDate" type="date" isEditing={isEditing} onChange={handleChange} disabled={isExisting} />
                      <Field label="Age" value={formData.age} field="age" type="number" isEditing={isEditing} onChange={handleChange} disabled={true} />
                      <Field label="Contact Number" value={formData.contactNumber} field="contactNumber" isEditing={isEditing} onChange={handleChange} disabled={isExisting} />
                    </div>
                  </div>

                  {/* LOCATION */}
                  <div className="space-y-8">
                    <SectionHeader icon={MapPin} title="Location" color="bg-emerald-500" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <Field label="Barangay" value={formData.barangay} field="barangay" isEditing={isEditing} onChange={handleChange} disabled={isExisting} />
                      <Field label="City / Municipality" value={formData.city} field="city" isEditing={isEditing} onChange={handleChange} disabled={isExisting} />
                      <Field label="Province" value={formData.province} field="province" isEditing={isEditing} onChange={handleChange} disabled={isExisting} />
                    </div>
                  </div>

                  {/* STATUS */}
                  <div className="space-y-8">
                    <SectionHeader icon={ClipboardList} title="Status & Timestamps" color="bg-blue-500" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <Field 
                        label="Registration Status" 
                        value={formData.reg_status} 
                        field="reg_status" 
                        isEditing={isEditing} 
                        onChange={handleChange} 
                        type="select"
                        options={['pending', 'approved', 'disapproved', 'rejected']}
                      />
                      <Field 
                        label="Date Submitted" 
                        value={formatDate(formData.created_at)} 
                        field="created_at" 
                        isEditing={false} 
                        onChange={handleChange} 
                      />
                    </div>
                  </div>

                  {/* REMARKS */}
                  <div className="space-y-8">
                    <SectionHeader icon={PenTool} title="Remarks" color="bg-slate-700" />
                    <div className="grid grid-cols-1 gap-8">
                      <Field 
                        label="Administrative Remarks" 
                        value={formData.remarks} 
                        field="remarks" 
                        isEditing={isEditing} 
                        onChange={handleChange} 
                        type="textarea"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ATTACHMENTS */}
              {formData.registration_type !== "Social Pension (DSWD)" && (
                <div className="space-y-8 pb-12">
                  <SectionHeader icon={FileText} title="Attachments" color="bg-slate-500" />
                  
                  {isEditing && !isExisting && (
                    <div className="bg-slate-50 rounded-3xl p-8 border-2 border-dashed border-slate-200 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Documents</p>
                          <div className="relative group">
                            <input 
                              type="file" 
                              multiple 
                              onChange={handleFileUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-slate-200 rounded-2xl group-hover:border-rose-300 transition-all">
                              <Upload className="w-8 h-8 text-slate-300 group-hover:text-rose-400 transition-colors mb-2" />
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Drop files or click to upload</p>
                            </div>
                          </div>
  
                          {newAttachments.length > 0 && (
                            <div className="space-y-2">
                              {newAttachments.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                  <span className="text-[10px] font-bold text-slate-600 uppercase truncate max-w-[200px]">{file.name}</span>
                                  <button onClick={() => removeNewAttachment(idx)} className="text-rose-400 hover:text-rose-600">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
  
                        <div className="space-y-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Photo Capture</p>
                          {isCapturing ? (
                            <div className="space-y-4">
                              <div className="aspect-video bg-black rounded-2xl overflow-hidden relative border border-slate-200">
                                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                <canvas ref={canvasRef} className="hidden" />
                              </div>
                              <div className="flex gap-2">
                                <button onClick={capturePhoto} className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">Capture</button>
                                <button onClick={stopCamera} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">Cancel</button>
                              </div>
                            </div>
                          ) : capturedPhoto ? (
                            <div className="space-y-4">
                              <div className="aspect-video bg-slate-100 rounded-2xl overflow-hidden relative border border-slate-200 group">
                                <img src={capturedPhoto} alt="Captured" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <button onClick={startCamera} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-900 hover:scale-110 transition-transform"><RotateCcw className="w-5 h-5" /></button>
                                  <button onClick={() => setCapturedPhoto(null)} className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"><Trash2 className="w-5 h-5" /></button>
                                </div>
                              </div>
                              <p className="text-[9px] font-black text-emerald-500 uppercase text-center tracking-widest">New photo captured successfully!</p>
                            </div>
                          ) : (
                            <button 
                              onClick={startCamera}
                              className="w-full flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-slate-200 rounded-2xl hover:border-indigo-300 transition-all group"
                            >
                              <Camera className="w-8 h-8 text-slate-300 group-hover:text-indigo-400 transition-colors mb-2" />
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Launch Camera</p>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {(() => {
                      // Collect all potential attachment fields
                      const potentialFields = [
                        { value: (application as any).photo || (application as any).photo_url, label: 'Photo' },
                        { value: (application as any).indigency_certificate || (application as any).indigency_certificate_url, label: 'Indigency Certificate' },
                        { value: (application as any).document, label: 'Document' },
                        { value: (application as any).birth_certificate || (application as any).birth_certificate_url || (application as any).birthcertificate, label: 'Birth Certificate' },
                        { value: (application as any).barangay_certificate || (application as any).barangay_certificate_url, label: 'Barangay Certificate' },
                        { value: (application as any).marriage_certificate_path || (application as any).marriage_certificate, label: 'Marriage Certificate' },
                        { value: (application as any).id_photo, label: 'ID Photo' },
                        { value: (application as any).id_file, label: 'ID Card / Document' }
                      ];
  
                      const validAttachments = potentialFields
                        .map(field => {
                          const path = getRawPath(field.value);
                          return { 
                            raw: path,
                            label: field.label
                          };
                        })
                        .filter(item => item.raw !== null && item.raw !== "");
  
                      if (validAttachments.length > 0) {
                        return validAttachments.map((item, idx) => {
                          return (
                            <div key={idx} className="p-5 bg-white border border-slate-200 rounded-2xl flex flex-col gap-4 hover:border-slate-300 transition-all shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                                  <FileText className="w-5 h-5 text-slate-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-black text-slate-900 truncate uppercase tracking-tight">{item.label}</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Requirement</p>
                                </div>
                              </div>
                              <div className="aspect-video bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center relative">
                                 <AuthenticatedPreview path={item.raw!} label={item.label} />
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  type="button"
                                  onClick={() => handleFileAction(item.raw!, item.label, 'view')}
                                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95 outline-none"
                                >
                                  <Eye className="w-3 h-3" />VIEW
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => handleFileAction(item.raw!, `${item.label}${item.raw!.toLowerCase().endsWith('.pdf') ? '.pdf' : '.jpg'}`, 'download')}
                                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95 outline-none"
                                >
                                  <Download className="w-3 h-3" />DOWNLOAD
                                </button>
                              </div>
                            </div>
                          );
                        });
                      }
                      return (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-slate-100 rounded-[2rem]">
                          <AlertCircle className="w-12 h-12 text-slate-200" />
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">No attachment available</p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </>
          );
        })()}
        </div>
      </motion.div>

      <AnimatePresence>
        {viewingFile && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 lg:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingFile(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                      {viewingFile.jsonData ? 'View Details' : 'View Document'}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{viewingFile.filename}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setViewingFile(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="flex-1 overflow-auto bg-slate-50 p-6 no-scrollbar">
                {viewingFile.jsonData ? (
                  <div className="w-full bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <tbody className="divide-y divide-slate-50">
                        {Object.entries(viewingFile.jsonData).map(([key, value]) => (
                          <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/30 w-1/3">
                              {key.replace(/_/g, ' ')}
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-700">
                              {typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : viewingFile.isPdf ? (
                  <div className="w-full h-full flex flex-col gap-4">
                    {pdfError ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-slate-200">
                        <AlertCircle className="w-12 h-12 text-rose-500" />
                        <p className="text-lg font-bold text-slate-900 uppercase tracking-tight">Unable to display document</p>
                        <button 
                          onClick={() => {
                            setPdfError(false);
                            setUseGoogleViewer(true);
                          }}
                          className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
                        >
                          Try Google Viewer
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setUseGoogleViewer(!useGoogleViewer)}
                            className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
                          >
                            <RefreshCw className={cn("w-3 h-3", isFetchingFile && "animate-spin")} />
                            {useGoogleViewer ? 'Switch to Standard Viewer' : 'Switch to Google Viewer'}
                          </button>
                        </div>
                        <div className="w-full h-full min-h-[70vh] relative">
                          {useGoogleViewer ? (
                            <iframe 
                              id="pdfViewer"
                              src={`https://docs.google.com/gview?url=${encodeURIComponent(viewingFile.directUrl!)}&embedded=true`} 
                              className="w-full h-full min-h-[70vh] rounded-2xl border border-slate-200 shadow-inner bg-white"
                              title={viewingFile.filename}
                              onError={() => setPdfError(true)}
                            />
                          ) : (
                            <PdfViewer url={viewingFile.url!} filename={viewingFile.filename} />
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ) : viewingFile.url ? (
                  <div className="flex items-center justify-center min-h-[400px]">
                    <img 
                      src={viewingFile.url} 
                      alt={viewingFile.filename} 
                      className="max-w-full max-h-full object-contain rounded-2xl shadow-lg"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <AlertCircle className="w-12 h-12 text-rose-500" />
                    <p className="text-lg font-bold text-slate-900 uppercase tracking-tight">Unable to load file</p>
                    <p className="text-sm text-slate-400 font-medium tracking-tight">The file might be missing or in an unsupported format.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
