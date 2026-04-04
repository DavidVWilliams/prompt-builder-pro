import React, { useState } from 'react';
import { 
  Brain, 
  UserSquare2, 
  AlertTriangle, 
  ListTree, 
  RotateCcw, 
  Send, 
  Sparkles,
  Loader2
} from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('externalize');
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // YOUR API KEY
  const apiKey = "AIzaSyA5gOfetlZxzpR-YM4W9FN-rXdCcUiNfPs";

  const techniques = {
    externalize: {
      title: "Externalize Brain",
      icon: <Brain className="w-6 h-6" />,
      description: "Turn messy thoughts into a structured prompt.",
      quote: "Externalize your brain... just take that thing you said and write it down.",
      systemInstruction: "You are an expert prompt engineer. The user is providing raw, messy thoughts. Your job is to restructure these into a clear, high-quality prompt. Use clear headings and variables like {{VARIABLE}} where appropriate."
    },
    tempAgency: {
      title: "Temp Agency Test",
      icon: <UserSquare2 className="w-6 h-6" />,
      description: "Check if your prompt relies on hidden context.",
      quote: "Imagine you're sending this to a temp agency. Do they have everything they need?",
      systemInstruction: "Evaluate the user's prompt as if you were a temp worker with no context. Identify missing information, ambiguous terms, or assumptions the user is making."
    },
    edgeCase: {
      title: "Edge Case Red-Team",
      icon: <AlertTriangle className="w-6 h-6" />,
      description: "Find failure modes & give the model an out.",
      quote: "Give the model an out if it doesn't know the answer.",
      systemInstruction: "Analyze the user's prompt for potential 'edge cases' or failure modes. Suggest ways to improve the prompt to handle situations where the model might hallucinate or fail."
    },
    examples: {
      title: "Illustrative Examples",
      icon: <ListTree className="w-6 h-6" />,
      description: "Generate diverse examples to anchor the model.",
      quote: "Show, don't just tell. Give the model examples of what good looks like.",
      systemInstruction: "Based on the user's goal, provide 3 diverse examples (few-shot prompting) that clearly demonstrate the desired input-output format."
    }
  };

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    setFeedback('');

    try {
      const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      
      const payload = {
        contents: [{ parts: [{ text: input }] }],
        systemInstruction: { parts: [{ text: techniques[activeTab].systemInstruction }] }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || "Failed to connect to AI.");
      }

      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No feedback generated.";
      setFeedback(aiText);
    } catch (error) {
      console.error("Analysis Error:", error);
      setFeedback(`Error: ${error.message}. Please check your connection or API key.`);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInput('');
    setFeedback('');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <header className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <Sparkles className="text-indigo-600" /> Prompt Builder Pro
        </h1>
        <p className="text-slate-500 font-medium">Anthropic Edition (via Gemini 1.5 Flash)</p>
      </header>

      <main className="max-w-4xl mx-auto space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-4 text-slate-700">Techniques</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(techniques).map(([key, tech]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`p-4 text-left border-2 rounded-xl transition-all duration-200 ${
                  activeTab === key 
                  ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                  : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className={`mb-2 ${activeTab === key ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {tech.icon}
                </div>
                <h3 className="font-bold text-sm mb-1">{tech.title}</h3>
                <p className="text-xs text-slate-500 leading-tight">{tech.description}</p>
              </button>
            ))}
          </div>
        </section>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              {techniques[activeTab].icon} {techniques[activeTab].title}
            </h2>
            <p className="italic text-slate-600 mt-2 text-sm">
              "{techniques[activeTab].quote}"
            </p>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex justify-between items-end">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Input</label>
              <button 
                onClick={reset}
                className="text-xs flex items-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors uppercase font-bold"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            <textarea
              className="w-full min-h-[150px] p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all outline-none resize-none placeholder:text-slate-400"
              placeholder="Enter your prompt or ideas here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />

            <button
              onClick={handleAnalyze}
              disabled={isLoading || !input}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                isLoading || !input 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
              }`}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {isLoading ? 'Analyzing...' : 'Analyze'}
            </button>

            {feedback && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 mb-3">
                   <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                      <Sparkles className="w-4 h-4" />
                   </div>
                   <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Expert Feedback</label>
                </div>
                <div className="p-6 bg-white border-2 border-indigo-100 rounded-xl whitespace-pre-wrap text-slate-700 leading-relaxed shadow-inner">
                  {feedback}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="max-w-4xl mx-auto mt-12 text-center text-slate-400 text-sm">
        <p>Built for effective prompt engineering. Inspired by the Anthropic Prompting Course.</p>
      </footer>
    </div>
  );
};

export default App;
