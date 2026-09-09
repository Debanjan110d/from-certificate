'use client';

import React, { useState } from 'react';
import { Send, Download, ExternalLink, RefreshCw, CheckCircle2, AlertTriangle, Plus, Trash2, FileText } from 'lucide-react';

export default function FormSimulator() {
  const [fields, setFields] = useState<Array<{ key: string; value: string }>>([
    { key: 'Name', value: 'Debanjan Das' },
    { key: 'Email', value: 'debanjan@example.com' },
  ]);

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  const applyPresetV1 = () => {
    setFields([
      { key: 'Name', value: 'Debanjan Das' },
      { key: 'Email', value: 'debanjan@example.com' },
    ]);
  };

  const applyPresetExtended = () => {
    setFields([
      { key: 'Name', value: 'Debanjan Das' },
      { key: 'Email', value: 'debanjan@example.com' },
      { key: 'College', value: 'Indian Institute of Technology' },
      { key: 'Course', value: 'Advanced Web Engineering & AI' },
      { key: 'Phone', value: '+91 9876543210' },
      { key: 'Registration Number', value: 'REG-2026-9812' },
    ]);
  };

  const addField = () => {
    setFields([...fields, { key: '', value: '' }]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, key: string, value: string) => {
    const updated = [...fields];
    updated[index] = { key, value };
    setFields(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    // Convert fields array into key-value JSON object
    const payload: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.key.trim()) {
        payload[f.key.trim()] = f.value;
      }
    });

    try {
      const res = await fetch('/api/generate-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate certificate');
      }

      setResponse(data);
      if (data.certificateId) {
        setPdfPreviewUrl(`/api/download/${data.certificateId}?t=${Date.now()}`);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Form Input Section */}
      <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-amber-400" />
            Google Form Simulator
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulate incoming Google Form submission webhooks live to test backend field extraction & PDF creation.
          </p>
        </div>

        {/* Presets */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={applyPresetV1}
            className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg border border-slate-700 transition-colors"
          >
            V1 Preset (2 Fields)
          </button>
          <button
            type="button"
            onClick={applyPresetExtended}
            className="flex-1 py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-semibold text-amber-300 rounded-lg border border-amber-500/30 transition-colors"
          >
            Extended (6 Fields)
          </button>
        </div>

        {/* Fields List */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {fields.map((field, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Field Key (e.g. Name)"
                  value={field.key}
                  onChange={(e) => updateField(idx, e.target.value, field.value)}
                  className="w-5/12 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={field.value}
                  onChange={(e) => updateField(idx, field.key, e.target.value)}
                  className="w-6/12 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => removeField(idx)}
                  disabled={fields.length <= 2 && (field.key === 'Name' || field.key === 'Email')}
                  className="w-1/12 p-2 text-slate-500 hover:text-rose-400 disabled:opacity-30 transition-colors"
                  title="Remove field"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={addField}
              className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold"
            >
              <Plus className="w-4 h-4" /> Add Extra Form Field
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Processing Submission...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Generate Certificate
              </>
            )}
          </button>
        </form>
      </div>

      {/* Output & Preview Section */}
      <div className="lg:col-span-7 space-y-6">
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3 text-rose-300 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <p className="font-semibold">Validation Error</p>
              <p className="text-xs text-rose-200 mt-1">{error}</p>
            </div>
          </div>
        )}

        {response && response.success ? (
          <div className="space-y-6">
            {/* Success Card */}
            <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold text-white">Certificate Generated!</h3>
                    <p className="text-xs text-slate-400">Recipient: {response.student.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-lg">
                    {response.certificateId}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={response.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-md"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </a>
                <a
                  href={response.verifyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg transition-colors border border-slate-700"
                >
                  <ExternalLink className="w-4 h-4" /> Open Verification Page
                </a>
              </div>

              {response.extraFieldsReceived && response.extraFieldsReceived.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-slate-400">
                    Received {response.extraFieldsReceived.length} extra fields safely:{' '}
                    <span className="text-slate-300 font-mono">
                      {response.extraFieldsReceived.join(', ')}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Inline PDF Preview Frame */}
            {pdfPreviewUrl && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl">
                <div className="flex items-center justify-between mb-3 text-xs text-slate-400 px-1">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                    <FileText className="w-4 h-4 text-amber-400" /> PDF Live Preview
                  </span>
                  <span>A4 Landscape PDF</span>
                </div>
                <div className="w-full h-[480px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                  <iframe
                    src={pdfPreviewUrl}
                    className="w-full h-full border-none"
                    title="Certificate Preview"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Initial Placeholder */
          <div className="bg-slate-900/40 border border-slate-800/80 border-dashed rounded-2xl p-12 text-center text-slate-500 space-y-3">
            <FileText className="w-12 h-12 mx-auto text-slate-600" />
            <h3 className="text-base font-semibold text-slate-400">No Submission Processed Yet</h3>
            <p className="text-xs max-w-sm mx-auto">
              Fill out the simulator form on the left and click "Generate Certificate" to generate and preview the student's PDF certificate live.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
