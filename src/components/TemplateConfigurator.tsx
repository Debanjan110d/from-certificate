'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sliders, Save, RefreshCw, Eye, Check, Layers, Type, Upload, FileUp, AlertCircle, FileCheck, Calendar, QrCode, Hash } from 'lucide-react';
import { TemplateConfig } from '@/lib/types';

export default function TemplateConfigurator() {
  const [config, setConfig] = useState<TemplateConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [renderingPreview, setRenderingPreview] = useState(false);

  // Template Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTestPreview = useCallback(async (currentConfig?: TemplateConfig) => {
    const activeConfig = currentConfig || config;
    if (!activeConfig) return;

    setRenderingPreview(true);
    try {
      const res = await fetch('/api/generate-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Name: 'Debanjan Das',
          Email: 'debanjan@example.com',
          Course: 'Full Stack & AI Systems Engineering',
          isPreview: true,
          templateConfig: activeConfig,
        }),
      });

      const data = await res.json();
      if (data.success && data.pdfBase64) {
        setPreviewUrl(data.pdfBase64);
      }
    } catch (err) {
      console.error('Failed to generate test preview:', err);
    } finally {
      setRenderingPreview(false);
    }
  }, [config]);

  useEffect(() => {
    fetchTemplate();
  }, []);

  const fetchTemplate = async () => {
    try {
      const res = await fetch('/api/templates');
      const data = await res.json();
      if (data.success && data.templates && data.templates.length > 0) {
        const loadedConfig = data.templates[0];
        setConfig(loadedConfig);
        handleTestPreview(loadedConfig);
      }
    } catch (err) {
      console.error('Failed to fetch template config:', err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced auto-preview renderer whenever config is modified
  const updateConfig = (newConfig: TemplateConfig) => {
    setConfig(newConfig);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      handleTestPreview(newConfig);
    }, 250); // 250ms smooth debouncing for instant live preview while dragging sliders!
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        handleTestPreview(config);
      }
    } catch (err) {
      console.error('Failed to save template:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setUploadMessage(null);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('/api/templates/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload template PDF');
      }

      setUploadMessage('New PDF Template uploaded and applied successfully!');
      setSelectedFile(null);
      await fetchTemplate();
      setTimeout(() => setUploadMessage(null), 5000);
    } catch (err: any) {
      setUploadError(err.message || 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2 font-sans">
        <RefreshCw className="w-5 h-5 animate-spin text-amber-400" /> Loading Template Configurations...
      </div>
    );
  }

  const nameField = config.fields.name;
  const dateField = config.fields.date || { x: 170, y: 140, fontSize: 11, fontFamily: 'Helvetica', color: '#334155', alignment: 'center', enabled: true };
  const certIdField = config.fields.certificateId || { x: 770, y: 565, fontSize: 9, fontFamily: 'Courier', color: '#64748b', alignment: 'right', enabled: true };
  const qrField = config.fields.qrCode || { x: 685, y: 45, size: 70, enabled: true };

  const updateName = (key: string, value: any) => {
    updateConfig({
      ...config,
      fields: {
        ...config.fields,
        name: { ...nameField, [key]: value },
      },
    });
  };

  const updateDate = (key: string, value: any) => {
    updateConfig({
      ...config,
      fields: {
        ...config.fields,
        date: { ...dateField, [key]: value },
      },
    });
  };

  const updateCertId = (key: string, value: any) => {
    updateConfig({
      ...config,
      fields: {
        ...config.fields,
        certificateId: { ...certIdField, [key]: value },
      },
    });
  };

  const updateQr = (key: string, value: any) => {
    updateConfig({
      ...config,
      fields: {
        ...config.fields,
        qrCode: { ...qrField, [key]: value },
      },
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start font-sans">
      {/* Controls Column */}
      <div className="lg:col-span-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              Real-Time Template & Field Designer
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Move sliders or change fonts — the PDF preview on the right auto-refreshes in real time!
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              {saveSuccess ? <Check className="w-4 h-4 text-slate-950 font-bold" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : saveSuccess ? 'Saved Config!' : 'Save Config'}
            </button>
          </div>
        </div>

        {/* PDF Template File Upload Box */}
        <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-amber-500/30 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Upload className="w-4 h-4" /> Upload Custom Certificate Background PDF
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Format: .pdf</span>
          </div>

          <form onSubmit={handleFileUpload} className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl px-4 py-3 flex items-center gap-3 transition-colors">
                <FileUp className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-xs text-slate-300 truncate">
                  {selectedFile ? selectedFile.name : 'Choose custom PDF file (from Canva, Adobe, etc.)'}
                </span>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>

              <button
                type="submit"
                disabled={!selectedFile || uploading}
                className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-40 shrink-0 flex items-center gap-1.5"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" /> Apply PDF Template
                  </>
                )}
              </button>
            </div>

            {uploadMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" /> {uploadMessage}
              </div>
            )}

            {uploadError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" /> {uploadError}
              </div>
            )}
          </form>
        </div>

        {/* Student Name Font & Coordinates Box */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-5 shadow-xl">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Type className="w-4 h-4" /> Student Name Font & Positioning
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-semibold flex items-center gap-1">
              Select Name Font Style
            </label>
            <select
              value={nameField.fontFamily}
              onChange={(e) => updateName('fontFamily', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="TimesRomanBold">✒️ Times Roman Bold (Classic Serif Bold)</option>
              <option value="TimesBoldItalic">📜 Times Bold Italic (Formal Calligraphic Bold)</option>
              <option value="TimesItalic">🖋️ Times Roman Italic (Calligraphic Regular)</option>
              <option value="TimesRoman">🏛️ Times Roman Regular (Classic Serif Standard)</option>
              <option value="HelveticaBold">💼 Helvetica / Arial Bold (Modern Sans Bold)</option>
              <option value="Helvetica">📝 Helvetica / Arial Regular (Modern Sans Standard)</option>
              <option value="HelveticaOblique">✨ Helvetica / Arial Italic (Modern Slanted)</option>
              <option value="CourierBold">💻 Courier Monospace Bold (Stamp Style)</option>
              <option value="Courier">🖥️ Courier Monospace Regular</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">X Position (points): {nameField.x}</label>
              <input
                type="range"
                min="50"
                max="800"
                value={nameField.x}
                onChange={(e) => updateName('x', Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Y Position (points): {nameField.y}</label>
              <input
                type="range"
                min="50"
                max="550"
                value={nameField.y}
                onChange={(e) => updateName('y', Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Font Size ({nameField.fontSize}pt)</label>
              <input
                type="number"
                value={nameField.fontSize}
                onChange={(e) => updateName('fontSize', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Alignment</label>
              <select
                value={nameField.alignment}
                onChange={(e) => updateName('alignment', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                <option value="center">Center</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Text Color (Hex)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={nameField.color || '#10172a'}
                  onChange={(e) => updateName('color', e.target.value)}
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={nameField.color || '#10172a'}
                  onChange={(e) => updateName('color', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Date Coordinates Box WITH Checkbox Toggle */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Issue Date Placement
            </h3>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer font-semibold bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
              <input
                type="checkbox"
                checked={dateField.enabled !== false}
                onChange={(e) => updateDate('enabled', e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-blue-500 focus:ring-blue-500"
              />
              Show Issue Date on PDF
            </label>
          </div>

          {dateField.enabled !== false && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">X Pos: {dateField.x}</label>
                <input
                  type="range"
                  min="50"
                  max="800"
                  value={dateField.x}
                  onChange={(e) => updateDate('x', Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Y Pos: {dateField.y}</label>
                <input
                  type="range"
                  min="50"
                  max="550"
                  value={dateField.y}
                  onChange={(e) => updateDate('y', Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Font Size ({dateField.fontSize}pt)</label>
                <input
                  type="number"
                  value={dateField.fontSize}
                  onChange={(e) => updateDate('fontSize', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Certificate ID Coordinates Box WITH Checkbox Toggle */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
              <Hash className="w-4 h-4" /> Certificate ID Placement
            </h3>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer font-semibold bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
              <input
                type="checkbox"
                checked={certIdField.enabled !== false}
                onChange={(e) => updateCertId('enabled', e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-purple-500 focus:ring-purple-500"
              />
              Show Certificate ID Text
            </label>
          </div>

          {certIdField.enabled !== false && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">X Pos: {certIdField.x}</label>
                <input
                  type="range"
                  min="50"
                  max="800"
                  value={certIdField.x}
                  onChange={(e) => updateCertId('x', Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Y Pos: {certIdField.y}</label>
                <input
                  type="range"
                  min="50"
                  max="580"
                  value={certIdField.y}
                  onChange={(e) => updateCertId('y', Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Font Size ({certIdField.fontSize}pt)</label>
                <input
                  type="number"
                  value={certIdField.fontSize}
                  onChange={(e) => updateCertId('fontSize', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* QR Code Settings WITH Checkbox Toggle */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <QrCode className="w-4 h-4" /> QR Code Verification Overlay
            </h3>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer font-semibold bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
              <input
                type="checkbox"
                checked={qrField.enabled !== false}
                onChange={(e) => updateQr('enabled', e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
              />
              Show QR Code Overlay
            </label>
          </div>
          {qrField.enabled !== false && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">X Pos: {qrField.x}</label>
                <input
                  type="range"
                  min="50"
                  max="800"
                  value={qrField.x}
                  onChange={(e) => updateQr('x', Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Y Pos: {qrField.y}</label>
                <input
                  type="range"
                  min="20"
                  max="500"
                  value={qrField.y}
                  onChange={(e) => updateQr('y', Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">QR Size ({qrField.size}px)</label>
                <input
                  type="number"
                  value={qrField.size}
                  onChange={(e) => updateQr('size', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Preview Column */}
      <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl space-y-3 sticky top-24">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-semibold text-slate-300 flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-400" /> Real-Time Live Render Preview
            {renderingPreview && (
              <span className="text-[10px] text-amber-400 animate-pulse font-mono font-bold">
                (Rendering Live...)
              </span>
            )}
          </span>
          <button
            onClick={() => handleTestPreview(config)}
            className="text-amber-400 hover:underline text-xs flex items-center gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${renderingPreview ? 'animate-spin' : ''}`} /> Force Refresh
          </button>
        </div>

        {previewUrl ? (
          <div className="w-full h-[560px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
            <iframe src={previewUrl} className="w-full h-full border-none" title="Real-Time Config Preview" />
          </div>
        ) : (
          <div className="h-[560px] bg-slate-950/60 rounded-xl border border-dashed border-slate-800 flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-3">
            <Eye className="w-10 h-10 text-slate-600" />
            <p className="text-xs">Adjust sliders or fonts to start real-time live preview.</p>
          </div>
        )}
      </div>
    </div>
  );
}
