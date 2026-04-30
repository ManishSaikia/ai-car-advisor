"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Car as CarIcon, Loader2 } from "lucide-react";
import { Car, RecommendationResponse } from "./api/recommend/route";

type Message = {
  role: "user" | "assistant";
  content: string;
  recommendations?: RecommendationResponse[];
  detailedCar?: Car;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "I need a budget friendly city car under 10 Lakhs.",
    "Looking for a safe 7-seater SUV for family road trips.",
    "What's a good EV with long range for daily commuting?",
  ];

  const hasMessages = messages.length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Map to the format required by the API
      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch recommendations");
      }

      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: data.content,
          recommendations: data.recommendations,
          detailedCar: data.detailedCar,
        },
      ]);
    } catch (error: any) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: `Sorry, I encountered an error: ${error.message}. Please check your API key and try again.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans transition-all duration-500">
      {/* Header - Visible only in chat mode */}
      <header
        className={`bg-white border-b border-slate-200 py-4 px-6 flex items-center justify-between shadow-sm transition-all duration-500 ${
          hasMessages ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full absolute top-0 w-full"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <CarIcon className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Car Advisor</h1>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative flex flex-col">
        {!hasMessages ? (
          /* Initial Centered State */
          <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-3xl mx-auto h-full">
            <div className="bg-blue-600 p-4 rounded-2xl mb-6 shadow-lg shadow-blue-200">
              <CarIcon className="text-white w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2 text-center">
              Find Your Perfect Car
            </h2>
            <p className="text-slate-500 text-center mb-8 max-w-md">
              Tell me about your budget, needs, and preferences, and I'll find the best matches in the Indian market.
            </p>

            <div className="w-full relative mb-8">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend(input);
                  }}
                  placeholder="e.g. I want a safe 5-seater SUV under 20 lakhs..."
                  className="w-full bg-white border border-slate-200 rounded-full py-4 pl-6 pr-14 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg transition-all"
                />
                <button
                  onClick={() => handleSend(input)}
                  disabled={!input.trim()}
                  className="absolute right-2 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 w-full">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(suggestion)}
                  className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-full text-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors shadow-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat State */
          <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-4">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>

                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                      {msg.recommendations.map((rec, i) => (
                        <div
                          key={i}
                          className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
                        >
                          <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-start">
                            <div>
                              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                                Match {i + 1}
                              </p>
                              <h3 className="font-bold text-lg text-slate-800">
                                {rec.car.make} {rec.car.model}
                              </h3>
                              <p className="text-sm text-slate-500 line-clamp-1">{rec.car.variant}</p>
                            </div>
                          </div>
                          
                          <div className="p-4 flex-1 flex flex-col">
                            <div className="flex items-center gap-2 mb-3 bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                              <span className="text-xl font-bold text-slate-800">
                                ₹{(rec.car.price_inr / 100000).toFixed(2)}L
                              </span>
                            </div>
                            
                            <p className="text-sm text-slate-600 mb-4 flex-1">
                              "{rec.match_reason}"
                            </p>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mt-auto pt-3 border-t border-slate-100">
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-400">Body</span>
                                <span className="text-slate-700 capitalize">{rec.car.body_type}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-400">Fuel</span>
                                <span className="text-slate-700 capitalize">{rec.car.fuel_type}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-400">Mileage/Range</span>
                                <span className="text-slate-700">
                                  {rec.car.fuel_type === 'electric' ? `${rec.car.range_km} km` : `${rec.car.mileage_kmpl} kmpl`}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-400">Safety</span>
                                <span className="text-slate-700">{rec.car.safety_rating.stars} Stars</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.detailedCar && (
                    <div className="mt-4 w-full max-w-3xl bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md flex flex-col">
                      <div className="bg-slate-800 text-white p-6 border-b border-slate-700">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-blue-400 font-semibold tracking-wider uppercase text-sm mb-1">{msg.detailedCar.make}</p>
                            <h3 className="text-3xl font-bold">{msg.detailedCar.model}</h3>
                            <p className="text-slate-300 mt-1">{msg.detailedCar.variant} ({msg.detailedCar.year})</p>
                          </div>
                          <div className="bg-blue-600 px-4 py-2 rounded-xl shadow-inner">
                            <span className="text-2xl font-bold">₹{(msg.detailedCar.price_inr / 100000).toFixed(2)}L</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Key Specifications</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                              <span className="text-slate-500">Body Type</span>
                              <span className="font-medium text-slate-800 capitalize">{msg.detailedCar.body_type}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                              <span className="text-slate-500">Fuel & Trans</span>
                              <span className="font-medium text-slate-800 capitalize">{msg.detailedCar.fuel_type} • {msg.detailedCar.transmission}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                              <span className="text-slate-500">Engine / Range</span>
                              <span className="font-medium text-slate-800">
                                {msg.detailedCar.fuel_type === 'electric' ? `${msg.detailedCar.range_km} km` : `${msg.detailedCar.engine_cc} cc`}
                              </span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                              <span className="text-slate-500">Power / Torque</span>
                              <span className="font-medium text-slate-800">{msg.detailedCar.specs.power_bhp} bhp / {msg.detailedCar.specs.torque_nm} Nm</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                              <span className="text-slate-500">Safety Rating</span>
                              <span className="font-medium text-slate-800">{msg.detailedCar.safety_rating.stars} Stars ({msg.detailedCar.safety_rating.source})</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Top Features</h4>
                          <div className="flex flex-wrap gap-2 mb-6">
                            {msg.detailedCar.specs.features.map((feat, idx) => (
                              <span key={idx} className="bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-full font-medium">
                                {feat}
                              </span>
                            ))}
                          </div>
                          
                          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">User Review</h4>
                          <p className="text-sm text-slate-600 italic mb-4">"{msg.detailedCar.user_review.summary}"</p>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h5 className="text-xs font-bold text-green-600 uppercase mb-1">Pros</h5>
                              <ul className="text-xs text-slate-600 list-disc pl-3 space-y-1">
                                {msg.detailedCar.user_review.pros.map((pro, idx) => <li key={idx}>{pro}</li>)}
                              </ul>
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-red-500 uppercase mb-1">Cons</h5>
                              <ul className="text-xs text-slate-600 list-disc pl-3 space-y-1">
                                {msg.detailedCar.user_review.cons.map((con, idx) => <li key={idx}>{con}</li>)}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm p-4 shadow-sm flex items-center gap-2">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    <div className="flex gap-1 ml-1">
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce-delay-100"></div>
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce-delay-200"></div>
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </main>

      {/* Input Area - Visible only in chat mode */}
      {hasMessages && (
        <div className="bg-white border-t border-slate-200 p-4 w-full shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 relative">
          <div className="max-w-4xl mx-auto relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend(input);
              }}
              placeholder="Ask a follow-up or refine your search..."
              className="w-full bg-slate-50 border border-slate-200 rounded-full py-3 pl-5 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isLoading}
              className="absolute right-1.5 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
