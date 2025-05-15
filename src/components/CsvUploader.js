import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/CsvUploader.tsx
import { useState } from 'react';
export default function CsvUploader() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);
    const handleUpload = async () => {
        if (!file)
            return;
        setUploading(true);
        setMessage(null);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch(import.meta.env.VITE_UPLOAD_ENDPOINT, {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('✅ File uploaded successfully.');
            }
            else {
                setMessage(`❌ Upload failed: ${data.error}`);
            }
        }
        catch (err) {
            setMessage(`❌ Error: ${err.message}`);
        }
        finally {
            setUploading(false);
        }
    };
    return (_jsxs("div", { className: "my-10 border p-6 rounded-md", children: [_jsx("h2", { className: "text-lg font-semibold mb-2", children: "Upload New Inventory CSV" }), _jsx("input", { type: "file", accept: ".csv", onChange: (e) => setFile(e.target.files?.[0] || null), className: "block mb-4" }), _jsx("button", { onClick: handleUpload, disabled: uploading || !file, className: "bg-blue-600 text-white px-4 py-2 rounded", children: uploading ? 'Uploading...' : 'Upload CSV' }), message && _jsx("p", { className: "mt-4 text-sm text-gray-700", children: message })] }));
}
