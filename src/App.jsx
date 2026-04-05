import React, { useState, useRef } from 'react';
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

export default function App() {
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [activeTool, setActiveTool] = useState('braindump');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [copied, setCopied] = useState(false);
  
  // Reference to auto-scroll to the output on mobile
  const outputRef = useRef(null);

  const tools = [
    {
      id: 'braindump',
      icon: BrainCircuit,
      name: "Externalize Brain",
      desc: "Turn messy thoughts into a structured prompt.",
      quote: `"Externalize your brain... just take that thing you said and write it down."`,
      sysPrompt: `You are an expert prompt engineer. The user is providing raw, messy thoughts or a vague goal. 
      Your task is to "externalize their brain". Rewrite their thoughts into a highly structured, clear, and precise prompt suitable for a highly capable language model. 
      Use clear headings, constraints, and instructions. Do not use cliché roles (like "You are a teacher"); instead, explain the exact context and task clearly.
      If their request is too vague, output a draft prompt but also ask 2-3 specific questions to pull more information out of them.`
    },
    {
      id: 'tempagency',
      icon: User,
      name: "Temp Agency Test",
      desc: "Check if your prompt relies on hidden context.",
      quote: `"Imagine you hired a temp agency... they don't know the name of your company."`,
      sysPrompt: `You are a highly competent temp agency worker. You know a lot about the world but NOTHING about the user's specific company, implicit context, or internal jargon.
      Read the user's prompt. Critique it from your perspective. 
      1. What is missing? 
      2. What is ambiguous? 
      3. What jargon do you not understand?
      Point out exactly where you would get confused and suggest how to make the instructions perfectly explicit.`
    },
    {
      id: 'edgecases',
      icon: AlertTriangle,
      name: "Edge Case Red-Team",
      desc: "Find ways the prompt might fail & give it an out.",
      quote: `"Give it an out... if something weird happens, just output in tags <unsure>."`,
      sysPrompt: `You are an expert AI red-teamer. Review the user's prompt and identify 3-4 edge cases where it might fail or behave unexpectedly.
      Think about:
      - Empty strings or missing data
      - Data formatted completely wrong
      - The user asking for something impossible based on the instructions
      Provide these scenarios, and then suggest specific text the user should ADD to their prompt to "give the model an out" (e.g., telling the model to output <unsure> or a specific error message when it encounters these cases).`
    },
    {
      id: 'examples',
      icon: ListPlus,
      name: "Illustrative Examples",
      desc: "Generate diverse examples to anchor the model.",
      quote: `"I want you to understand the task, but I don't want you to latch on too much to the words that I use."`,
      sysPrompt: `You are an expert prompt engineer helping to construct "few-shot" examples. 
      Read the user's prompt. Generate 3 highly diverse, illustrative examples (Input and Expected Output) that demonstrate the task.
      Crucially, make the examples distinct from each other so the model learns the *concept* rather than just memorizing a specific format or rote phrasing.
      Format them clearly so the user can copy and paste them directly into their prompt.`
    }
  ];

  const activeToolData = tools.find(t => t.id === activeTool);

  const handleRunTool = async () => {
    if (!currentPrompt.trim()) return;
    
    setIsProcessing(true);
    setAiResponse("");
    
    try {
      // securely calls your Vercel backend
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: currentPrompt,
          systemInstruction: activeToolData.sysPrompt
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to connect to the server.");
      }

      setAiResponse(data.text);
      
      // Auto-scroll to the AI output on mobile devices so the user doesn't have to hunt for it
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (error) {
      console.error("Analysis Error:", error);
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
      
      {/* Sidebar / Tools Panel - UNPINNED ON MOBILE */}
      <div className="w-full md:w-80 bg-white border-b md:border-r border-slate-200 flex flex-col shadow-sm z-10 md:h-screen md:sticky md:top-0 md:overflow-y-auto shrink-0">
        <div className="p-4 md:p-6 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-2 mb-1">
            <BrainCircuit className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl font-bold tracking-tight">Prompt Builder <span className="text-indigo-400">Pro</span></h1>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium uppercase tracking-wider">Anthropic Roundtable Edition</p>
        </div>

        <div className="p-4 flex-1">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Prompting Techniques</h2>
          <div className="space-y-2">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`w-full text-left p-3 rounded-xl transition-all duration-200 border flex flex-col gap-1
                  ${activeTool === tool.id 
                    ? 'bg-indigo-50 border-indigo-200 shadow-sm ring-1 ring-indigo-500/20' 
                    : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${activeTool === tool.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                    <tool.icon className="w-4 h-4" />
                  </div>
                  <span className={`font-medium ${activeTool === tool.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                    {tool.name}
                  </span>
                </div>
                <p className="text-xs text-slate-500 ml-[44px] leading-relaxed hidden sm:block md:block">{tool.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 m-4 rounded-xl hidden sm:block">
          <div className="flex items-start gap-2 text-indigo-600 mb-2">
            <MessageSquareQuote className="w-4 h-4 mt-0.5 opacity-70 shrink-0" />
            <p className="text-xs italic font-medium leading-relaxed text-slate-700">
              {activeToolData.quote}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area - FLEXIBLE ON MOBILE */}
      <div className="flex-1 flex flex-col min-h-screen md:h-screen md:overflow-hidden">
        
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shrink-0 sticky top-0 z-20 md:static">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <activeToolData.icon className="w-5 h-5 text-indigo-600" />
            {activeToolData.name} Mode
          </h2>
          
          <button 
            onClick={() => setCurrentPrompt("")}
            className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors bg-slate-100 md:bg-transparent px-3 py-1.5 md:px-0 md:py-0 rounded-lg md:rounded-none"
          >
            <RefreshCw className="w-4 h-4" /> Clear Editor
          </button>
        </header>

        {/* Workspace - SCROLLS ON MOBILE */}
        <div className="flex-1 md:overflow-auto p-4 md:p-6 bg-slate-50 flex flex-col lg:flex-row gap-6">
          
          {/* Editor Column */}
          <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[350px] md:min-h-[400px]">
            <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex justify-between items-center shrink-0">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Prompt / Raw Thoughts</span>
              <button 
                onClick={() => copyToClipboard(currentPrompt)}
                className="text-slate-400 hover:text-indigo-600 transition-colors"
                title="Copy Prompt"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <textarea
              className="flex-1 w-full p-4 md:p-6 resize-none focus:outline-none text-slate-700 leading-relaxed text-base"
              placeholder={activeTool === 'braindump' 
                ? "Dump your messy thoughts here... What do you want the model to do? Don't worry about formatting." 
                : "Paste your existing prompt here to analyze it..."}
              value={currentPrompt}
              onChange={(e) => setCurrentPrompt(e.target.value)}
            />
            <div className="p-4 border-t border-slate-100 bg-white flex justify-end shrink-0">
              <button
                onClick={handleRunTool}
                disabled={!currentPrompt.trim() || isProcessing}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-3 md:py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 md:w-4 md:h-4 animate-spin" /> : <Send className="w-5 h-5 md:w-4 md:h-4" />}
                {isProcessing ? 'Analyzing...' : `Run ${activeToolData.name}`}
              </button>
            </div>
          </div>

          {/* AI Output Column */}
          <div ref={outputRef} className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px] scroll-mt-20">
             <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-3 flex justify-between items-center shrink-0">
              <span className="text-xs font-semibold text-indigo-800 uppercase tracking-wider">AI Assistant Feedback</span>
              {aiResponse && (
                <button 
                  onClick={() => copyToClipboard(aiResponse)}
                  className="bg-white px-3 py-1 rounded-md text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-200 transition-colors flex items-center gap-1 text-xs font-bold shadow-sm"
                >
                  {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 relative">
              {!aiResponse && !isProcessing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                  <activeToolData.icon className="w-12 h-12 mb-4 opacity-20" />
                  <p className="font-medium text-slate-500">Awaiting your prompt</p>
                  <p className="text-sm mt-2 max-w-xs leading-relaxed hidden sm:block">
                    Enter text in the editor and click Run to get expert feedback based on Anthropic prompt engineering principles.
                  </p>
                </div>
              )}

              {isProcessing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-500 bg-slate-50/80 backdrop-blur-sm z-10">
                  <Loader2 className="w-8 h-8 animate-spin mb-4" />
                  <p className="font-medium animate-pulse">Consulting the experts...</p>
                </div>
              )}

              {aiResponse && (
                <div className="prose prose-slate prose-sm md:prose-base max-w-none text-slate-700">
                  {aiResponse.split('\n').map((line, i) => {
                    if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold mt-6 mb-2 text-slate-900">{line.replace('### ', '')}</h3>;
                    if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mt-8 mb-3 text-slate-900 border-b pb-2">{line.replace('## ', '')}</h2>;
                    if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold mt-8 mb-4 text-slate-900">{line.replace('# ', '')}</h1>;
                    if (line.startsWith('- ')) return <li key={i} className="ml-4 mb-1">{line.replace('- ', '')}</li>;
                    if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-bold my-2">{line.replace(/\*\*/g, '')}</p>;
                    if (line.trim() === '') return <br key={i} />;
                    
                    const formattedLine = line.split(/(\*\*.*?\*\*)/g).map((part, index) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={index} className="text-slate-900">{part.slice(2, -2)}</strong>;
                      }
                      return part;
                    });

                    return <p key={i} className="mb-3 leading-relaxed">{formattedLine}</p>;
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


