'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, Code2, Layers, FileCheck, AlertCircle, HelpCircle } from 'lucide-react';

export default function AppsScriptGenerator() {
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const webhookUrl = `${baseUrl || 'http://YOUR_SERVER_DOMAIN'}/api/generate-certificate`;

  const scriptCode = `/**
 * Google Apps Script for Automated Student Certificate Generation
 * Attach this script to your Google Sheet connected to your Google Form.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open Google Sheets -> Extensions -> Apps Script
 * 2. Paste this code into Code.gs
 * 3. Save the script (Ctrl+S or Cmd+S)
 * 4. Click the Clock Icon (Triggers) on the left sidebar
 * 5. Click "+ Add Trigger"
 *    - Choose function: onFormSubmit
 *    - Select event source: From sheet
 *    - Select event type: On form submit
 * 6. Save & Authorize the trigger permissions!
 */

const WEBHOOK_URL = "${webhookUrl}";

function onFormSubmit(e) {
  try {
    let payload = {};

    // 1. If triggered by Google Form Submission event
    if (e && e.namedValues) {
      // e.namedValues provides an object where keys are Column Headers / Field Names
      // Example: { "Name": ["Debanjan Das"], "Email": ["debanjan@example.com"], "College": ["IIT"] }
      for (let key in e.namedValues) {
        let val = e.namedValues[key];
        payload[key] = Array.isArray(val) ? val[0] : val;
      }
    } else if (e && e.values && e.range) {
      // Fallback: Read headers from Row 1
      let sheet = e.range.getSheet();
      let headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      let rowValues = e.values;
      for (let i = 0; i < headers.length; i++) {
        payload[headers[i]] = rowValues[i] || "";
      }
    } else {
      Logger.log("No submission event payload found.");
      return;
    }

    Logger.log("Sending payload to certificate backend: " + JSON.stringify(payload));

    // 2. Send HTTP POST request to backend API
    let options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    let response = UrlFetchApp.fetch(WEBHOOK_URL, options);
    let responseText = response.getContentText();
    Logger.log("Backend Response (" + response.getResponseCode() + "): " + responseText);

  } catch (err) {
    Logger.log("Error in onFormSubmit: " + err.toString());
  }
}
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* File Type & Column Names Explanation Panel */}
      <div className="grid grid-[#1] md:grid-cols-2 gap-6">
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center gap-3 text-amber-400">
            <FileCheck className="w-6 h-6" />
            <h3 className="text-lg font-bold text-white">Certificate File Format</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            The template background must be a <strong className="text-amber-400">PDF (.pdf)</strong> file.
          </p>
          <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
            <li>Template path: <code className="text-slate-200 bg-slate-950 px-1.5 py-0.5 rounded">public/templates/default_template.pdf</code></li>
            <li>Output format: High-resolution downloadable <strong className="text-slate-200">PDF (.pdf)</strong>.</li>
            <li>Includes crisp vector typography and embedded QR verification graphics.</li>
          </ul>
        </div>

        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center gap-3 text-blue-400">
            <Layers className="w-6 h-6" />
            <h3 className="text-lg font-bold text-white">Column Names / Namespaces</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            The system automatically matches Google Form column headers regardless of field count or order:
          </p>
          <div className="text-xs space-y-1.5 font-mono text-slate-300">
            <p><span className="text-emerald-400">Name</span> → Matches: <code className="bg-slate-950 px-1 text-slate-300">Name</code>, <code className="bg-slate-950 px-1 text-slate-300">Student Name</code>, <code className="bg-slate-950 px-1 text-slate-300">Full Name</code></p>
            <p><span className="text-emerald-400">Email</span> → Matches: <code className="bg-slate-950 px-1 text-slate-300">Email</code>, <code className="bg-slate-950 px-1 text-slate-300">Email Address</code>, <code className="bg-slate-950 px-1 text-slate-300">Student Email</code></p>
            <p><span className="text-blue-400">Extra Fields</span> → <code className="bg-slate-950 px-1 text-slate-300">College</code>, <code className="bg-slate-950 px-1 text-slate-300">Phone</code>, <code className="bg-slate-950 px-1 text-slate-300">Event</code>, etc. are safely received & recorded!</p>
          </div>
        </div>
      </div>

      {/* Code Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-2 text-slate-200 font-mono text-sm">
            <Code2 className="w-4 h-4 text-amber-400" />
            <span>Google Apps Script — Code.gs</span>
          </div>
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold rounded-lg transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied to Clipboard!' : 'Copy Apps Script'}
          </button>
        </div>

        <div className="p-6 bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto">
          <pre>{scriptCode}</pre>
        </div>
      </div>

      {/* Step by Step Setup Guide */}
      <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-400" />
          Step-by-Step Google Sheet Setup Guide
        </h3>
        <ol className="space-y-3 text-sm text-slate-300 list-decimal list-inside">
          <li className="leading-relaxed">
            Open the <strong className="text-white">Google Sheet</strong> that receives responses from your Google Form.
          </li>
          <li className="leading-relaxed">
            In the top menu, click <strong className="text-amber-400">Extensions</strong> &rarr;{' '}
            <strong className="text-amber-400">Apps Script</strong>.
          </li>
          <li className="leading-relaxed">
            Delete any code in the editor, paste the script copied above into <code className="text-slate-200 bg-slate-950 px-1.5 py-0.5 rounded">Code.gs</code>, and press <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-xs text-white">Ctrl + S</kbd> to save.
          </li>
          <li className="leading-relaxed">
            On the left menu of Apps Script, click the <strong className="text-white">Triggers (Clock icon)</strong>.
          </li>
          <li className="leading-relaxed">
            Click <strong className="text-amber-400">+ Add Trigger</strong> at the bottom right.
          </li>
          <li className="leading-relaxed">
            Configure: Function = <code className="text-emerald-400">onFormSubmit</code>, Event Source = <code className="text-emerald-400">From sheet</code>, Event Type = <code className="text-emerald-400">On form submit</code>.
          </li>
          <li className="leading-relaxed">
            Click <strong className="text-white">Save</strong> and grant permissions when prompted by Google.
          </li>
        </ol>
      </div>
    </div>
  );
}
