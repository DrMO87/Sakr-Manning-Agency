import React, { useState, useEffect } from "react";
import { Upload, X, Download, FileText } from "lucide-react";
import { useToast } from "../../../context/ToastContext";
import api from "../../../services/Auth/api";

export const AdminAttachmentsSection = ({ userId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const { notify } = useToast();

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/documents/?user=" + userId);
      let docs = res.data?.results || res.data || [];
      docs = docs.filter(d => d.user === parseInt(userId, 10));
      setDocuments(docs);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchDocuments();
  }, [userId]);

  const handleUpload = async () => {
    if (!name || !file) return notify.error("Name and File are required");
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("user", userId);
      formData.append("title", name);
      formData.append("file", file);

      await api.post("/documents/", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      notify.success("Attachment uploaded");
      setName("");
      setFile(null);
      const fileInput = document.getElementById("admin-attachment-file");
      if(fileInput) fileInput.value = "";
      fetchDocuments();
    } catch(err) {
      console.error(err);
      const errMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      notify.error("Failed to upload attachment: " + errMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this attachment?")) return;
    try {
      await api.delete("/documents/" + id + "/");
      notify.success("Attachment deleted");
      fetchDocuments();
    } catch(err) {
      console.error(err);
      notify.error("Failed to delete attachment");
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-slate-500 mb-1">Attachment Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white" placeholder="e.g. Background Check" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-slate-500 mb-1">File</label>
          <input id="admin-attachment-file" type="file" onChange={e => setFile(e.target.files[0])} className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        </div>
        <button onClick={handleUpload} disabled={uploading || !name || !file} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2">
          {uploading ? "Uploading..." : <><Upload className="w-4 h-4" /> Upload</>}
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-slate-500">Loading attachments...</div>
      ) : documents.length === 0 ? (
        <div className="text-sm text-slate-500 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">No admin attachments found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-500" />
                <div className="overflow-hidden">
                  <h4 className="font-medium text-slate-900 dark:text-white text-sm truncate" title={doc.title}>{doc.title}</h4>
                  <p className="text-xs text-slate-500">{new Date(doc.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={doc.file} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-lg transition-colors" title="View/Download">
                  <Download className="w-4 h-4" />
                </a>
                <button onClick={() => handleDelete(doc.id)} className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Delete">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
