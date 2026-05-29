/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import headerLogo from './assets/images/logo.png';
import { ContentItem } from './types';

export default function App() {
  const [topic, setTopic] = useState('');
  const [subTopic, setSubTopic] = useState('');
  const [conceptTricks, setConceptTricks] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ContentItem[]>(() => {
    const saved = localStorage.getItem('workbook_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [subtopicStatus, setSubtopicStatus] = useState<Record<string, 'Done' | 'Pending'>>(() => {
    const saved = localStorage.getItem('subtopic_status');
    return saved ? JSON.parse(saved) : {};
  });
  const [view, setView] = useState<'generator' | 'dashboard'>('generator');

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem('workbook_history', JSON.stringify(history));
    localStorage.setItem('subtopic_status', JSON.stringify(subtopicStatus));
  }, [history, subtopicStatus]);

  const topicOptions: Record<string, string[]> = {
    "Core Calculations": ["Addition", "Subtraction", "Multiplication", "Division"],
    "Square and Cube": ["Square", "Square root", "Cube", "Cube root"],
    "Percentage and Fraction": [
      "Percentage to Fraction Conversion",
      "Fraction to Percentage Conversion",
      "Fraction Addition",
      "Fraction Subtraction",
      "Fraction Multiplication",
      "Fraction Division",
      "Fraction to ratio Conversion",
      "Cross multiply of Fractions"
    ],
    "Simplification": ["Simplification"],
    "Approximation": ["Approximation"],
    "Missing Number Series": ["Missing Number Series"],
    "Wrong Number Series": ["Wrong Number Series"],
    "Quadratic Equations": ["Quadratic Equations"]
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Content copied to clipboard!');
    });
  };

  const descriptionRef = useRef<HTMLDivElement>(null);

  const generateModule = async () => {
    setLoading(true);
    setContent('');
    try {
      const descriptionContent = descriptionRef.current ? descriptionRef.current.innerHTML : '';
      const response = await fetch('/api/generate-module', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, subTopic, conceptTricks, description: descriptionContent }),
      });
      const data = await response.json();
      setContent(data.content);
      const newItem: ContentItem = {
        id: Date.now().toString(),
        topic,
        subTopic,
        content: data.content,
        timestamp: new Date()
      };
      setHistory(prev => [newItem, ...prev]);
    } catch (error) {
      console.error('Error:', error);
      setContent('Failed to generate module. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadJSON = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "workbook_history.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };
  
  const allSubtopics = Object.entries(topicOptions).flatMap(([_, subs]) => subs);
  const totalSubtopics = allSubtopics.length;
  const doneSubtopics = Object.values(subtopicStatus).filter(s => s === 'Done').length;
  const progress = totalSubtopics > 0 ? Math.round((doneSubtopics / totalSubtopics) * 100) : 0;

  return (
    <div className="min-h-screen bg-black relative font-sans">
      {/* Math Symbols Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] select-none text-slate-500 font-serif text-8xl flex flex-wrap gap-x-20 gap-y-32 p-20 justify-center">
        <span>+</span><span>-</span><span>×</span><span>÷</span><span>%</span>
        <span>+</span><span>-</span><span>×</span><span>÷</span><span>%</span>
      </div>

      <header className="bg-neutral-950 border-b border-white sticky top-0 z-50 shadow-sm">
        <div className="flex justify-center items-center h-[176px]">
            <img src={headerLogo} alt="BOOK CONTENT MAKER logo" className="h-[165px] w-auto" />
        </div>
      </header>
      
      <div className="sticky top-[176px] w-full z-40 bg-neutral-950 py-2 flex justify-center gap-2 shadow-sm border-b border-neutral-800">
            <button 
                onClick={() => setView('generator')}
                className={`font-semibold px-4 py-2 rounded-lg transition ${view === 'generator' ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-blue-200'}`}>Generator</button>
            <button 
                onClick={() => setView('dashboard')}
                className={`font-semibold px-4 py-2 rounded-lg transition ${view === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-blue-200'}`}>Dashboard</button>
      </div>
      
      <main className="max-w-7xl mx-auto p-6 md:p-8 z-10 relative">
        {view === 'generator' ? (
          <div className="grid md:grid-cols-2 gap-8">
            <section className="bg-neutral-900 p-8 rounded-xl shadow-lg border border-neutral-800 space-y-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-100">Chapter (Topic)</label>
                  <select
                    value={topic}
                    onChange={(e) => {
                      setTopic(e.target.value);
                      setSubTopic('');
                    }}
                    className="mt-2 block w-full border border-slate-700 bg-slate-800 text-gray-100 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-100"
                  >
                    <option value="">Select Chapter</option>
                    {Object.keys(topicOptions).map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-100">Sub-topic</label>
                  <select
                    value={subTopic}
                    onChange={(e) => setSubTopic(e.target.value)}
                    className="mt-2 block w-full border border-slate-700 bg-slate-800 text-gray-100 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-100"
                    disabled={!topic || topicOptions[topic].length === 0}
                  >
                    <option value="">Select Sub-topic</option>
                    {topic && topicOptions[topic].map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white">Concept/Tricks</label>
                  <textarea
                    value={conceptTricks}
                    onChange={(e) => setConceptTricks(e.target.value)}
                    className="mt-2 block w-full border border-neutral-700 bg-neutral-800 text-gray-100 rounded-lg p-3 h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-100"
                    placeholder="Paste or type concepts/tricks here..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white">Description / Context</label>
                  <div
                    contentEditable={true}
                    ref={descriptionRef}
                                      onPaste={(e) => {
                    const items = e.clipboardData.items;
                    for (let i = 0; i < items.length; i++) {
                      if (items[i].type.indexOf('image') !== -1) {
                        e.preventDefault();
                        const file = items[i].getAsFile();
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const img = document.createElement('img');
                            img.src = event.target?.result as string;
                            img.style.maxWidth = '100%';
                            const selection = window.getSelection();
                            if (selection && selection.rangeCount > 0) {
                              const range = selection.getRangeAt(0);
                              range.deleteContents();
                              range.insertNode(img);
                              range.setStartAfter(img);
                              range.setEndAfter(img);
                              selection.removeAllRanges();
                              selection.addRange(range);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }
                    }
                  }}
                    className="mt-2 block w-full border border-neutral-700 bg-neutral-800 text-gray-100 rounded-lg p-4 h-48 overflow-y-auto shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                <button
                  onClick={generateModule}
                  disabled={loading || !topic || (topicOptions[topic].length > 0 && !subTopic)}
                  className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Generating...' : 'Generate Workbook Module'}
                </button>
              </div>
            </section>
            <section className="bg-neutral-900 p-8 rounded-xl shadow-lg border border-neutral-800 flex flex-col">
              {content ? (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-100">Generated Module</h2>
                    <button
                      onClick={() => copyToClipboard(content)}
                      className="bg-neutral-800 text-blue-200 font-medium px-4 py-2 rounded-lg text-sm hover:bg-neutral-700 transition"
                    >
                      Copy to Clipboard
                    </button>
                  </div>
                  <div className="flex-1 p-6 bg-black border border-neutral-800 rounded-lg shadow-inner overflow-y-auto markdown-body">
                    <ReactMarkdown>{content}</ReactMarkdown>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 gap-4 border-2 border-dashed border-neutral-800 rounded-lg">
                    <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-600">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <p>Waiting for Input...</p>
                </div>
              )}
            </section>
          </div>
        ) : (
          <section className="bg-neutral-900 p-8 rounded-xl shadow-lg border border-neutral-800">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-100">Content Generation Analytics</h2>
                <button onClick={downloadJSON} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition">Download Results</button>
            </div>
            
            <div className="mb-8">
                <div className="flex justify-between text-sm text-neutral-400 mb-2">
                    <span>Overall Progress ({doneSubtopics}/{totalSubtopics} subtopics completed)</span>
                    <span>{progress}%</span>
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-4">
                    <div className="bg-blue-600 h-4 rounded-full transition-all duration-500" style={{width: `${progress}%`}}></div>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-100 mb-4">Subtopic Checklist</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        {allSubtopics.map(sub => (
                            <div key={sub} className="flex justify-between items-center p-3 bg-neutral-800 rounded-lg border border-neutral-700">
                                <span className="text-neutral-200">{sub}</span>
                                <select 
                                    value={subtopicStatus[sub] || 'Pending'}
                                    onChange={(e) => setSubtopicStatus(prev => ({ ...prev, [sub]: e.target.value as 'Done' | 'Pending' }))}
                                    className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-sm rounded p-1"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Done">Done</option>
                                </select>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-100 mb-4">History</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-neutral-200">
                            <thead className="border-b border-neutral-700 text-neutral-400">
                                <tr>
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4">Chapter</th>
                                    <th className="py-3 px-4">Sub-topic</th>
                                    <th className="py-3 px-4">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(item => (
                                    <tr key={item.id} className="border-b border-neutral-800 hover:bg-neutral-800/50">
                                        <td className="py-3 px-4 text-sm">{new Date(item.timestamp).toLocaleDateString()}</td>
                                        <td className="py-3 px-4 font-semibold">{item.topic}</td>
                                        <td className="py-3 px-4">{item.subTopic}</td>
                                        <td className="py-3 px-4">
                                            <button 
                                                onClick={() => { setContent(item.content); setView('generator'); }}
                                                className="text-blue-400 hover:text-blue-300 font-semibold"
                                            >View</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
