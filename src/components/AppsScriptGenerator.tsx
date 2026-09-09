'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, Code2, Layers, FileCheck, HelpCircle, AlertTriangle, RefreshCw, Zap } from 'lucide-react';

export default function AppsScriptGenerator() {
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState('https://from-certificate.vercel.app');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.origin) {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const webhookUrl = `${baseUrl}/api/generate-certificate`;

  const scriptCode = `/**
 * Google Apps Script for Automated Student Certificate Generation
 * Production Deployment URL: ${webhookUrl}
 * 
 * INCLUDES 2 FUNCTIONS:
 * 1. onFormSubmit(e) -> Automatic real-time trigger for NEW submissions
 * 2. syncAllPastSubmissions() -> ONE-CLICK FAILSAFE to sync all PAST submissions already in the sheet!
 */

const WEBHOOK_URL = "${webhookUrl}";

/**
 * 1. REAL-TIME TRIGGER FOR NEW FORM SUBMISSIONS
 */
function onFormSubmit(e) {
  try {
    let payload = {};

    if (e && e.namedValues) {
      for (let key in e.namedValues) {
        let val = e.namedValues[key];
        payload[key] = Array.isArray(val) ? val[0] : val;
      }
    } else if (e && e.values && e.range) {
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

    sendPayloadToBackend(payload);
  } catch (err) {
    Logger.log("Error in onFormSubmit: " + err.toString());
  }
}

/**
 * 2. FAILSAFE BULK SYNC FOR ALL PAST EXISTING SUBMISSIONS
 * Select "syncAllPastSubmissions" at the top of Apps Script and click "Run"
 * to instantly sync all existing rows in your Google Sheet!
 */
function syncAllPastSubmissions() {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  let data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    Logger.log("No existing submission rows found.");
    return;
  }

  let headers = data[0]; // Row 1 headers
  let totalSynced = 0;

  for (let r = 1; r < data.length; r++) {
    let row = data[r];
    let payload = {};

    for (let c = 0; c < headers.length; c++) {
      let headerName = headers[c];
      payload[headerName] = row[c] !== undefined ? row[c] : "";
    }

    if (sendPayloadToBackend(payload)) {
      totalSynced++;
    }
  }

  Logger.log("Failsafe Sync Complete: Successfully synced " + totalSynced + " past submissions!");
}

/**
 * Helper function to POST JSON to backend
 */
function sendPayloadToBackend(payload) {
  try {
    let options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    let response = UrlFetchApp.fetch(WEBHOOK_URL, options);
    Logger.log("Response (" + response.getResponseCode() + "): " + response.getContentText());
    return response.getResponseCode() === 200;
  } catch (err) {
    Logger.log("Failed to send payload: " + err.toString());
    return false;
  }
}
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* File Type & Column Names Explanation Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center gap-3 text-amber-400">
            <FileCheck className="w-6 h-6" />
            <h3 className="text-lg font-bold text-white">Production Vercel Domain</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Live Webhook Endpoint:{' '}
            <code className="text-amber-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-xs">
              {webhookUrl}
            </code>
          </p>
          <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
            <li>Outputs downloadable <strong className="text-slate-200">PDF (.pdf)</strong> certificates.</li>
            <li>Embedded vector fonts and scannable QR verification badges.</li>
            <li>Runs 24/7 on Vercel serverless environment.</li>
          </ul>
        </div>

        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center gap-3 text-blue-400">
            <Layers className="w-6 h-6" />
            <h3 className="text-lg font-bold text-white">Google Sheet Column Matching</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Form headers are extracted dynamically regardless of column position or extra fields:
          </p>
          <div className="text-xs space-y-1.5 font-mono text-slate-300">
            <p><span className="text-emerald-400">Name</span> &rarr; <code className="bg-slate-950 px-1 text-slate-300">Name</code>, <code className="bg-slate-950 px-1 text-slate-300">Student Name</code>, <code className="bg-slate-950 px-1 text-slate-300">Full Name</code></p>
            <p><span className="text-emerald-400">Email</span> &rarr; <code className="bg-slate-950 px-1 text-slate-300">Email</code>, <code className="bg-slate-950 px-1 text-slate-300">Email Address</code>, <code className="bg-slate-950 px-1 text-slate-300">Student Email</code></p>
            <p><span className="text-blue-400">Extra Fields</span> &rarr; <code className="bg-slate-950 px-1 text-slate-300">College</code>, <code className="bg-slate-950 px-1 text-slate-300">Phone</code>, <code className="bg-slate-950 px-1 text-slate-300">Registration Number</code>, etc.</p>
          </div>
        </div>
      </div>

      {/* Failsafe Past Submissions Feature Box */}
      <div className="p-6 bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-950 border border-blue-500/30 rounded-2xl space-y-3 shadow-xl">
        <div className="flex items-center gap-3 text-blue-400">
          <Zap className="w-6 h-6" />
          <h3 className="text-base font-bold text-white uppercase tracking-wider">
            Failsafe Feature: Sync All Past Submissions
          </h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          If students submitted your Google Form <strong className="text-white">before</strong> you connected this website, don't worry! The updated script includes <code className="text-amber-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded">syncAllPastSubmissions()</code>.
        </p>
        <p className="text-xs text-slate-400">
          <strong>How to run it:</strong> At the top bar of Google Apps Script, select <code className="text-emerald-400">syncAllPastSubmissions</code> from the dropdown next to Debug/Run, and click <strong className="text-white font-semibold">▶ Run</strong>. It will instantly loop through every existing row in your Google Sheet and sync them all into the database!
        </p>
      </div>

      {/* Critical Trigger Settings Alert Box */}
      <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs leading-relaxed text-amber-200">
          <p className="font-bold text-sm text-amber-300 uppercase tracking-wide">
            Critical Trigger Setting Requirement
          </p>
          <p>
            When configuring the automatic trigger in Apps Script (Clock ⏰ icon &rarr; Add Trigger), make sure to set:
          </p>
          <p className="font-mono text-white bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
            Select event type = <span className="text-emerald-400 font-bold">On form submit</span> (Do NOT choose "On open")
          </p>
        </div>
      </div>

      {/* Code Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-2 text-slate-200 font-mono text-sm">
            <Code2 className="w-4 h-4 text-amber-400" />
            <span>Production Apps Script — Code.gs (Real-Time + Failsafe Sync)</span>
          </div>
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold rounded-lg transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied Script!' : 'Copy Script for Google Sheets'}
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
          Production Google Sheet Setup Guide
        </h3>
        <ol className="space-y-3 text-sm text-slate-300 list-decimal list-inside">
          <li className="leading-relaxed">
            Open the <strong className="text-white">Google Sheet</strong> connected to your Google Form.
          </li>
          <li className="leading-relaxed">
            In the menu, click <strong className="text-amber-400">Extensions</strong> &rarr;{' '}
            <strong className="text-amber-400">Apps Script</strong>.
          </li>
          <li className="leading-relaxed">
            Paste the code above into <code className="text-slate-200 bg-slate-950 px-1.5 py-0.5 rounded">Code.gs</code> and press <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-xs text-white">Ctrl + S</kbd> to save.
          </li>
          <li className="leading-relaxed">
            <strong className="text-amber-400">Failsafe for Past Submissions:</strong> At the top toolbar of Apps Script, select <code className="text-emerald-400">syncAllPastSubmissions</code> from the function dropdown and click <strong className="text-white">▶ Run</strong> to sync all existing rows!
          </li>
          <li className="leading-relaxed">
            Click the <strong className="text-white">Triggers (Clock icon)</strong> on the left sidebar &rarr; Click <strong className="text-amber-400">+ Add Trigger</strong>.
          </li>
          <li className="leading-relaxed">
            Set: Function = <code className="text-emerald-400">onFormSubmit</code>, Event Source = <code className="text-emerald-400">From sheet</code>, Event Type = <code className="text-emerald-400">On form submit</code>.
          </li>
          <li className="leading-relaxed">
            Click <strong className="text-white">Save</strong> and grant permissions when prompted.
          </li>
        </ol>
      </div>
    </div>
  );
}
