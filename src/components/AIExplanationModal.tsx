import React, { useEffect, useState } from "react";
import { RegionalShortageRisk } from "../types";
import {
  Sparkles,
  X,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
} from "lucide-react";

interface AIExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  risk: RegionalShortageRisk | null;
}

interface ParsedSection {
  title: string;
  content: string;
  type: "happened" | "why" | "when" | "recommends";
}

export const AIExplanationModal: React.FC<AIExplanationModalProps> = ({
  isOpen,
  onClose,
  risk,
}) => {
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<ParsedSection[]>([]);
  const [sourceEngine, setSourceEngine] = useState<string>("");

  useEffect(() => {
    if (!isOpen || !risk) return;

    let isMounted = true;
    setLoading(true);

    const defaultSections: ParsedSection[] = [
      {
        title: "WHAT HAPPENED",
        content: `${risk.affected_count} of ${risk.total_district_facilities} healthcare facilities in ${risk.district} are concurrently reporting severe stock depletion for ${risk.medicine_name}.`,
        type: "happened",
      },
      {
        title: "WHY IT IS HAPPENING",
        content: `Sustained high daily consumption velocity across neighboring clinics exceeds standard replenishment lead times, reflecting an acute regional supply bottleneck rather than an isolated order delay.`,
        type: "why",
      },
      {
        title: "WHEN IT BECOMES CRITICAL",
        content: `Average stock coverage is down to ${risk.average_days_remaining} days. Depletion curves indicate stockouts beginning in ${risk.estimated_shortage_window_days} days (${risk.confidence}% prototype risk estimate).`,
        type: "when",
      },
      {
        title: "RECOMMENDED ACTION",
        content: `Dispatch 150 units of surplus stock immediately from ${
          risk.donor_candidates?.[0]?.facility.name || "Eastside Regional Medical Center"
        } to ${
          risk.affected_facilities?.[0]?.facility.name || "St. Jude District Hospital"
        } to bridge supply safely past scheduled replenishment.`,
        type: "recommends",
      },
    ];

    const fetchExplanation = async () => {
      try {
        const donor = risk.donor_candidates?.[0];
        const res = await fetch("/api/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            regionName: risk.district,
            district: risk.district,
            medicineName: risk.medicine_name,
            affectedCount: risk.affected_count,
            totalCount: risk.total_district_facilities,
            avgDaysRemaining: risk.average_days_remaining,
            confidence: risk.confidence,
            shortageWindowDays: risk.estimated_shortage_window_days,
            trend: risk.trend,
            facilitiesSummary: risk.affected_facilities
              .map((f) => `${f.facility.name} (${f.days_of_stock_remaining}d)`)
              .join(", "),
            surplusFacilityName: donor ? donor.facility.name : undefined,
            recommendedTransferUnits: donor ? 120 : undefined,
          }),
        });

        if (!res.ok) throw new Error("API status " + res.status);
        const data = await res.json();

        if (isMounted) {
          const rawText: string = data.explanation || "";
          // If the AI generated structured markdown headers, parse or use default structure
          if (rawText && rawText.includes("WHAT HAPPENED")) {
            const blocks = rawText.split(/\n\s*\n/);
            const parsed: ParsedSection[] = [];
            for (const b of blocks) {
              const trimmed = b.trim();
              if (trimmed.toUpperCase().includes("WHAT HAPPENED")) {
                parsed.push({
                  title: "WHAT HAPPENED",
                  content: trimmed.replace(/^.*WHAT HAPPENED[:\*\s]*/i, "").trim() || defaultSections[0].content,
                  type: "happened",
                });
              } else if (trimmed.toUpperCase().includes("WHY IT IS HAPPENING")) {
                parsed.push({
                  title: "WHY IT IS HAPPENING",
                  content: trimmed.replace(/^.*WHY IT IS HAPPENING[:\*\s]*/i, "").trim() || defaultSections[1].content,
                  type: "why",
                });
              } else if (trimmed.toUpperCase().includes("WHEN IT")) {
                parsed.push({
                  title: "WHEN IT BECOMES CRITICAL",
                  content: trimmed.replace(/^.*WHEN IT.*[:\*\s]*/i, "").trim() || defaultSections[2].content,
                  type: "when",
                });
              } else if (trimmed.toUpperCase().includes("RECOMMEND")) {
                parsed.push({
                  title: "RECOMMENDED ACTION",
                  content: trimmed.replace(/^.*RECOMMEND.*[:\*\s]*/i, "").trim() || defaultSections[3].content,
                  type: "recommends",
                });
              }
            }
            setSections(parsed.length === 4 ? parsed : defaultSections);
          } else {
            setSections(defaultSections);
          }

          setSourceEngine(
            data.source === "gemini-3.8-flash"
              ? "Gemini 3.8 Flash (Server-Side)"
              : "Clinical Rule-Based Pattern Engine"
          );
        }
      } catch (err) {
        if (isMounted) {
          setSections(defaultSections);
          setSourceEngine("Clinical Rule-Based Pattern Engine");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchExplanation();

    return () => {
      isMounted = false;
    };
  }, [isOpen, risk]);

  if (!isOpen || !risk) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-indigo-100 shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                AI Supply Risk Explanation
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {risk.district} &bull; {risk.medicine_name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md text-slate-400 hover:text-slate-600 hover:bg-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: 4 Organized Sections */}
        <div className="p-5 space-y-3.5">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400">
              <Sparkles className="w-6 h-6 text-indigo-600 animate-spin" />
              <p className="text-xs font-semibold">Generating clinical risk synthesis...</p>
            </div>
          ) : (
            sections.map((section, idx) => {
              const colors = {
                happened: "border-blue-200 bg-blue-50/30 text-blue-900",
                why: "border-amber-200 bg-amber-50/30 text-amber-900",
                when: "border-rose-200 bg-rose-50/30 text-rose-900",
                recommends: "border-emerald-200 bg-emerald-50/30 text-emerald-900",
              }[section.type];

              const badgeColors = {
                happened: "bg-blue-100 text-blue-800",
                why: "bg-amber-100 text-amber-800",
                when: "bg-rose-100 text-rose-800",
                recommends: "bg-emerald-100 text-emerald-800",
              }[section.type];

              return (
                <div
                  key={section.title}
                  className={`p-3.5 rounded-xl border ${colors} space-y-1.5`}
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${badgeColors}`}
                    >
                      {idx + 1}. {section.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 font-medium leading-relaxed pl-0.5">
                    {section.content}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>Engine: {sourceEngine || "Gemini 3.8 Flash"}</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
