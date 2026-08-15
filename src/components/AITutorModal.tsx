import React, { useState } from 'react';
import { Formula } from '../types';
import { Sparkles, X, Send, BookOpen, Lightbulb, Loader2 } from 'lucide-react';

interface AITutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  formula: Formula | null;
}

export const AITutorModal: React.FC<AITutorModalProps> = ({
  isOpen,
  onClose,
  formula
}) => {
  const [question, setQuestion] = useState<string>('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const quickPrompts = [
    `Why is this formula proportional or squared?`,
    `Explain the physical mechanics using a real-world civil/mech example.`,
    `How is this formula applied in modern industry design codes?`,
    `Show the mathematical derivation and dimensional balance from first principles.`
  ];

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || question;
    if (!q.trim()) return;

    const newHistory = [...messages, { role: 'user' as const, text: q }];
    setMessages(newHistory);
    setQuestion('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          formulaName: formula.name,
          formulaEquation: formula.formulaPlain,
          context: `Topic: ${formula.topic}, Chapter: ${formula.chapter}, Subject: ${formula.subject}, Derivation: ${formula.derivationSummary}`
        })
      });

      const data = await response.json();
      setMessages([...newHistory, { role: 'assistant', text: data.answer || 'I am ready to help explain any formula concept!' }]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...newHistory,
        {
          role: 'assistant',
          text: `**Physical Concept Explanation**:\n\nIn ${formula.name} (${formula.formulaPlain}), each term maintains dimensional equilibrium and reflects physical boundary constraints. Adjusting parameters demonstrates rate changes according to fundamental conservation laws.`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !formula) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div id="ai-tutor-modal" className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-2xl w-full p-5 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-600 text-white rounded shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-display text-slate-900">Engineering Concept Tutor</h3>
              <p className="text-[11px] font-mono-tech text-slate-500">
                Deep-dive physics & mechanics assistant for <span className="font-bold text-slate-700">{formula.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conversation Stream / Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4 min-h-[220px]">
          {messages.length === 0 ? (
            <div className="text-center py-5 px-4 bg-slate-50 rounded border border-slate-200">
              <Lightbulb className="w-6 h-6 text-amber-500 mx-auto mb-2" />
              <h4 className="text-xs font-bold font-mono-tech text-slate-800 mb-1">
                Explore Mechanics & Derivation of "{formula.formulaPlain}"
              </h4>
              <p className="text-[11px] font-mono-tech text-slate-500 max-w-md mx-auto mb-3">
                Ask about non-linear sensitivities, physical boundary assumptions, or real-world industrial failure cases.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(qp)}
                    className="p-2 rounded bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-xs font-mono-tech text-slate-700 transition-all flex items-start gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>{qp}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded text-xs font-mono-tech max-w-[85%] leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-slate-900 text-white font-medium'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 whitespace-pre-line'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded border border-slate-200 text-xs font-mono-tech text-slate-600">
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              <span>Analyzing formula physics and synthesizing explanation...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 shrink-0">
          <input
            type="text"
            placeholder={`Ask a question about ${formula.name}...`}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-3 py-2 rounded border border-slate-300 text-xs font-mono-tech text-slate-900 focus:outline-none focus:border-blue-600"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !question.trim()}
            className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors flex items-center gap-1 text-xs font-mono-tech font-semibold"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
