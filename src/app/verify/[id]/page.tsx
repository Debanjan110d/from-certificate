import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ShieldAlert, Download, Calendar, Mail, Award, CheckCircle, ArrowLeft, ExternalLink } from 'lucide-react';
import { getCertificateById } from '@/lib/certificate/cert-store';

export const metadata = {
  title: 'Certificate Verification System',
  description: 'Verify official student certificates instantly',
};

function maskEmail(email: string) {
  if (!email || !email.includes('@')) return email;
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user[0]}*@${domain}`;
  return `${user[0]}${'*'.repeat(user.length - 2)}${user[user.length - 1]}@${domain}`;
}

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const certRecord = getCertificateById(id);

  const isValid = !!certRecord;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 md:p-8 font-sans selection:bg-amber-500/30">
      {/* Background glow graphics */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        {/* Navigation back */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>

        {isValid ? (
          /* VALID CERTIFICATE CARD */
          <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 md:p-10 shadow-2xl shadow-blue-950/50">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Verified Authentic
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-white mt-1">Official Certificate</h1>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 uppercase tracking-widest font-mono">Certificate ID</p>
                <p className="text-lg font-mono font-bold text-amber-400">{certRecord.id}</p>
              </div>
            </div>

            {/* Student Info */}
            <div className="py-6 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Recipient Name</p>
                <p className="text-3xl font-extrabold text-white tracking-tight">{certRecord.name}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/60 flex items-center gap-3">
                  <Award className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Course / Program</p>
                    <p className="text-sm font-semibold text-slate-200">{certRecord.course}</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/60 flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Issue Date</p>
                    <p className="text-sm font-semibold text-slate-200">{certRecord.issueDate}</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/60 flex items-center gap-3 md:col-span-2">
                  <Mail className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Registered Student Email (Masked)</p>
                    <p className="text-sm font-semibold text-slate-200 font-mono">
                      {maskEmail(certRecord.email)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Form Fields (if present) */}
              {certRecord.extraFields && Object.keys(certRecord.extraFields).length > 0 && (
                <div className="mt-4 p-4 bg-slate-950/30 rounded-xl border border-slate-800/40">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    Additional Submission Details
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {Object.entries(certRecord.extraFields).map(([key, val]) => (
                      <div key={key} className="truncate">
                        <span className="text-slate-500 font-medium capitalize">{key}: </span>
                        <span className="text-slate-300 font-semibold">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle className="w-4 h-4 text-emerald-400" /> Digitally cryptographically signed & verified
              </div>
              <a
                href={`/api/download/${certRecord.id}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
              >
                <Download className="w-4 h-4" /> Download PDF Certificate
              </a>
            </div>
          </div>
        ) : (
          /* INVALID / NOT FOUND CARD */
          <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Certificate Not Found
            </span>
            <h1 className="text-2xl font-bold text-white mt-3">Invalid or Unverified ID</h1>
            <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
              We could not locate any certificate record associated with ID{' '}
              <span className="font-mono text-amber-400 font-semibold">{id}</span> in our official database.
            </p>
            <div className="mt-8 pt-6 border-t border-slate-800">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl transition-colors"
              >
                Return to Certificate Portal
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
