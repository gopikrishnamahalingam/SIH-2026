import React, { useState, useEffect } from 'react';
import { FileText, Copy, Download, Search, Check, Sparkles } from 'lucide-react';
import { DocumentTemplate } from '../types';

export const TemplateLibrary: React.FC = () => {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/templates')
      .then((res) => res.json())
      .then((data) => {
        setTemplates(data);
        if (data.length > 0) setSelectedTemplate(data[0]);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load templates:', err);
        setLoading(false);
      });
  }, []);

  const handleCopy = () => {
    if (!selectedTemplate) return;
    navigator.clipboard.writeText(selectedTemplate.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!selectedTemplate) return;
    const element = document.createElement('a');
    const file = new Blob([selectedTemplate.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${selectedTemplate.title.toLowerCase().replace(/ /g, '_')}_template.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const filteredTemplates = templates.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Document Template Library</h1>
          <p className="text-slate-500 text-sm mt-1">
            Access standardized procurement agreements, risk logs, validation scopes, and planning formats.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-900 bg-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-900" />
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left panel: List */}
          <div className="md:col-span-1 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Available Formats</h3>
            {filteredTemplates.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No templates matching your query</p>
            ) : (
              filteredTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedTemplate?.id === t.id
                      ? 'border-blue-900 bg-blue-50/20 ring-1 ring-blue-900 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`p-2 rounded-lg ${
                        selectedTemplate?.id === t.id ? 'bg-blue-100 text-blue-900' : 'bg-slate-50 text-slate-400'
                      }`}
                    >
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-[9px] font-bold rounded text-slate-500 uppercase tracking-wider mb-1">
                        {t.category}
                      </span>
                      <h4 className="font-bold text-sm text-slate-800 truncate">{t.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                        {t.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Right panel: Editor / View */}
          <div className="md:col-span-2">
            {selectedTemplate ? (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px]">
                {/* Header */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-800">{selectedTemplate.title}</h3>
                    <p className="text-xs text-slate-400">{selectedTemplate.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCopy}
                      className="p-2 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-200 bg-white"
                      title="Copy Content"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={handleDownload}
                      className="p-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
                      title="Download File"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                {/* Editor Content Area */}
                <div className="flex-1 p-6 overflow-y-auto bg-slate-900 font-mono text-slate-300 text-xs leading-relaxed custom-scrollbar">
                  <pre className="whitespace-pre-wrap">{selectedTemplate.content}</pre>
                </div>

                {/* Footer notes */}
                <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-400 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>These templates satisfy standard Indian government sandbox integration and IP frameworks.</span>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 flex flex-col items-center justify-center h-[500px]">
                <FileText className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-sm font-medium">Select a template from the list to view its details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
