import { useState } from "react";
import axios from "axios";
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "../utils/api";
import Spinner from "./Spinner";

export default function EmergencyDocuments({ reportId, onUploadSuccess }) {
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type (PDF, JPEG, PNG)
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid format. Please upload a PDF, PNG, or JPEG.");
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size too large. Limit is 5MB.");
      return;
    }

    setLoading(true);
    toast.loading("Encrypting and uploading file to SHIELD Secure Vault...");

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Data = reader.result.split(",")[1];
      try {
        const storedId = localStorage.getItem("shield_id");
        const userData = storedId ? JSON.parse(storedId) : null;
        const userId = userData?.publicKey?.slice(0, 8) || "Anonymous";

        const { data } = await axios.post(api("/api/lost-item/upload"), {
          userId,
          fileName: file.name,
          fileType: file.type,
          base64Data,
          reportId
        });

        toast.dismiss();
        if (data && data.success) {
          toast.success("Document uploaded successfully!");
          const newFile = { name: file.name, url: data.fileUrl, type: file.type };
          setUploadedFiles(prev => [...prev, newFile]);
          if (onUploadSuccess) onUploadSuccess(newFile);
        } else {
          throw new Error("Upload response failed");
        }
      } catch (err) {
        console.error(err);
        toast.dismiss();
        toast.error("Document upload failed. Server error.");
      } finally {
        setLoading(false);
      }
    };
  };

  return (
    <div className="p-6 md:p-8 bg-white/5 border border-white/10 rounded-[2rem] space-y-6">
      <div>
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <UploadCloud size={20} className="text-indigo-400 animate-pulse" />
          Secure Document Vault
        </h3>
        <p className="text-white/40 text-[9px] uppercase tracking-widest font-black mt-1">
          Upload passport copies, travel visas, and ID proofs
        </p>
      </div>

      <div className="relative group border-2 border-dashed border-white/10 hover:border-indigo-500/50 rounded-2xl p-8 flex flex-col items-center justify-center transition-all bg-black/20">
        <input
          type="file"
          id="doc-upload"
          onChange={handleFileChange}
          disabled={loading}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          aria-label="Upload document file"
        />
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <Spinner />
            <span className="text-xs font-bold text-white/60 uppercase tracking-widest mt-2">Uploading...</span>
          </div>
        ) : (
          <div className="text-center space-y-2 pointer-events-none">
            <UploadCloud className="mx-auto text-white/20 group-hover:text-indigo-400 transition-colors w-12 h-12" />
            <p className="text-sm font-bold text-white/80">Select or Drag file here</p>
            <p className="text-[10px] text-white/20 uppercase tracking-wider">Supports PDF, PNG, JPG (Max 5MB)</p>
          </div>
        )}
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-white/5">
          <h4 className="text-[10px] uppercase tracking-widest text-indigo-400 font-black">Uploaded Proofs</h4>
          <div className="flex flex-col gap-2">
            {uploadedFiles.map((file, idx) => (
              <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="text-white/40" size={16} />
                  <span className="text-xs text-white/80 font-bold truncate max-w-[200px]">{file.name}</span>
                </div>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
