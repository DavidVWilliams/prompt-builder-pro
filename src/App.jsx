import React, { useState, useRef, useEffect } from 'react';
import { 
  BrainCircuit, 
  User, 
  AlertTriangle, 
  ListPlus, 
  Send, 
  Loader2, 
  Copy, 
  CheckCheck,
  RefreshCw,
  MessageSquareQuote
} from 'lucide-react';

/**
 * API Helper with Exponential Backoff
 * This function handles the communication with the Gemini API.
 * The apiKey is left empty as it is provided by the execution environment.
 */
const callGemini = async (prompt, systemInstruction) => {
  const apiKey = ""; 
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] }
  };

  const maxRetries = 5;
  const baseDelay = 1000;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw new Error("Failed to connect to AI after multiple attempts. Please try again later.");
      }
      await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, attempt)));
    }
  }
};

export default function App() {
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [activeTool, setActiveTool] = useState('braindump');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [copied, setCopied] = useState(false);

  const tools = [
    {
      id: 'braindump',
      icon: BrainCircuit,
      name: "Externalize Brain",
      desc: "Turn messy thoughts into a structured prompt.",
      quote: `"Externalize your brain... just take that thing you said and write it down."`,
      sysPrompt: `You are an expert prompt engineer. Rewrite the user's messy thoughts into a highly structured, clear, and precise prompt. Use clear headings and constraints. Avoid cliché roles; explain the exact context and task clearly.`
    },
    {
      id: 'tempagency',
      icon: User,
      name: "Temp Agency Test",
      desc: "Check if your prompt relies on hidden context.",
      quote: `"Imagine you hired a temp agency... they don't know your company."`,
      sysPrompt: `You are a competent temp worker with no internal knowledge of the user's company. Critique the prompt: What is missing? What is ambiguous? What jargon is confusing?`
    },
    {
      id: 'edgecases',
      icon: AlertTriangle,
      name: "Edge Case Red-Team",
      desc: "Find failure modes & give the model an out.",
      quote: `"If something weird happens, just output <unsure>."`,
      sysPrompt: `Identify 3-4 edge cases for this prompt. Suggest specific text to "give the model an out" (e.g., instructions for empty data or impossible requests).`
    },
    {
      id: 'examples',
      icon: ListPlus,
      name: "Illustrative Examples",
      desc: "Generate diverse examples to anchor the model.",
      quote: `"Teach the concept, not just the format."`,
      sysPrompt: `Generate 3 highly diverse few-shot examples (Input/Output) for this task. Ensure they are distinct to help the model learn the core logic.`
    }
  ];

  const activeToolData = tools.find(t => t.id === activeTool);

  const handleRunTool = async () => {
    if (!currentPrompt.trim()) return;
    setIsProcessing(true);
    setAiResponse("");
    try {
      const response = await callGemini(currentPrompt, activeToolData.sysPrompt);
      setAiResponse(response);
    } catch (error) {
      setAiResponse(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
    document.body.removeChild(textArea);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm h-auto md:h-screen sticky top-0">
        <div className="p-6 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-2 mb-1">
            <BrainCircuit className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl font-bold tracking-tight">Prompt Builder <span className="text-indigo-400">Pro</span></h1>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium uppercase tracking-wider">Anthropic Edition</p>
        </div>

        <div className="p-4 flex-1">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Techniques</h2>
          <div className="space-y-2">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`w-full text-left p-3 rounded-xl transition-all border flex flex-col gap-1
                  ${activeTool === tool.id ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-500/20' : 'bg-white border-slate-200 hover:bg-slate-50'}
                `}
              >
                <div className="flex items-center gap-3">
                  <tool.icon className={`w-4 h-4 ${activeTool === tool.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className={`font-medium ${activeTool === tool.id ? 'text-indigo-900' : 'text-slate-700'}`}>{tool.name}</span>
                </div>
                <p className="text-xs text-slate-500 ml-7">{tool.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 m-4 rounded-xl italic text-xs text-slate-600">
          {activeToolData.quote}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <activeToolData.icon className="w-5 h-5 text-indigo-600" />
            {activeToolData.name}
          </h2>
          <button onClick={() => setCurrentPrompt("")} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1">
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6 bg-slate-50 flex flex-col lg:flex-row gap-6">
          {/* Editor */}
          <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Input</div>
            <textarea
              className="flex-1 w-full p-6 resize-none focus:outline-none text-slate-700 leading-relaxed"
              placeholder="Enter your prompt or ideas here..."
              value={currentPrompt}
              onChange={(e) => setCurrentPrompt(e.target.value)}
            />
            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleRunTool}
                disabled={!currentPrompt.trim() || isProcessing}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isProcessing ? 'Thinking...' : 'Analyze'}
              </button>
            </div>
          </div>

          {/* Feedback */}
          <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-2 flex justify-between items-center">
              <span className="text-xs font-semibold text-indigo-800 uppercase">Expert Feedback</span>
              {aiResponse && (
                <button onClick={() => copyToClipboard(aiResponse)} className="text-indigo-600 hover:text-indigo-800 text-xs flex items-center gap-1">
                  {copied ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>
            <div className="flex-1 p-6 overflow-y-auto whitespace-pre-wrap text-slate-700 leading-relaxed">
              {aiResponse || (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                  <activeToolData.icon className="w-10 h-10 mb-4 opacity-20" />
                  <p>Run the analysis to see improvements.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
