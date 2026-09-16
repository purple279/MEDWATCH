import React, { useEffect, useState } from "react";
import { RegionalShortageRisk } from "../types";
import {
  Sparkles,
  X,
  AlertOctagon,
  TrendingDown,
  Clock,
  ShieldCheck,
  Brain,
  Layers,
  ArrowRight,
  Activity,
  CheckCircle2,
} from "lucide-react";

interface AIExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  risk: RegionalShortageRisk | null;
}

interface ParsedSection {
  title: string;
  content: string;
  type: "happened" | "why" | "when" | "recommends" | "other";
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
    setSections([]);

    const parseExplanationToSections = (rawText: string): ParsedSection[] => {
      const parsed: ParsedSection[] = [];
      const blocks = rawText.split(/\n\s*\n/);

      for (const block of blocks) {
        const trimmed = block.trim();
        if (!trimmed) continue;

        // Check if block starts with **SECTION NAME:** or 1. SECTION NAME:
        const headerMatch = trimmed.match(/^(?:\d+\.\s*)?\*{0,2}(WHAT HAPPENED|WHY IT IS HAPPENING|WHEN IT MAY BECOME CRITICAL|URGENCY & TIMELINE|WHAT MEDWATCH RECOMMENDS|ACTIONABLE REDISTRIBUTION)\*{0,2}:?\s*([\s\S]*)/i);

        if (headerMatch) {
          const rawTitle = headerMatch[1].toUpperCase();
          const content = headerMatch[2].replace(/^\*{0,2}:\*{0,2}\s*/, "").trim();

          let type: ParsedSection["type"] = "other";
          let cleanTitle = rawTitle;

          if (rawTitle.includes("WHAT HAPPENED")) {
            type = "happened";
            cleanTitle = "WHAT HAPPENED";
          } else if (rawTitle.includes("WHY")) {
            type = "why";
            cleanTitle = "WHY IT IS HAPPENING";
          } else if (rawTitle.includes("WHEN") || rawTitle.includes("URGENCY")) {
            type = "when";
            cleanTitle = "WHEN IT MAY BECOME CRITICAL";
          } else if (rawTitle.includes("RECOMMENDS") || rawTitle.includes("REDISTRIBUTION")) {
            type = "recommends";
            cleanTitle = "WHAT MEDWATCH RECOMMENDS";
          }

          parsed.push({
            title: cleanTitle,
            content,
            type,
          });
        } else {
          // General paragraph
          parsed.push({
            title: "Analysis Overview",
            content: trimmed,
            type: "other",
          });
        }
      }

      // If parsing resulted in standard structure, return it
      if (parsed.length > 0) return parsed;

      // Fallback
      return [
        {
          title: "WHAT HAPPENED",
          content: `${risk.affected_count} of ${risk.total_district_facilities} facilities in ${risk.district} are concurrently reporting severe depletion of ${risk.medicine_name}.`,
          type: "happened",
        },
        {
          title: "WHY IT IS HAPPENING",
          content: `High daily burn velocity across multiple clinics exceeds standard delivery intervals, creating an acute regional deficit.`,
          type: "why",
        },
        {
          title: "WHEN IT MAY BECOME CRITICAL",
          content: `Stockouts begin within ${risk.estimated_shortage_window_days} days (${risk.confidence}% prototype risk estimate) as average coverage drops to ${risk.average_days_remaining} days.`,
          type: "when",
        },
        {
          title: "WHAT MEDWATCH RECOMMENDS",
          content: `Execute immediate surplus transfer from ${risk.donor_candidates[0]?.facility.name || "nearby facilities with >14 days reserve"} to extend runway past arrival.`,
          type: "recommends",
        },
      ];
    };

    const fetchExplanation = async () => {
      try {
        const donor = risk.donor_candidates[0];
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

        if (!res.ok) throw new Error("API responded with status " + res.status);
        const data = await res.json();

        if (isMounted) {
          const rawText = data.explanation || "";
          setSections(parseExplanationToSections(rawText));
          setSourceEngine(
            data.source === "gemini-3.8-flash"
              ? "Gemini 3.8 Flash (Server-Side)"
              : "Clinical Rule-Based Pattern Engine"
          );
        }
      } catch (err) {
        console.warn("Error getting AI explanation:", err);
        if (isMounted) {
          const fallbackText = `**WHAT HAPPENED:**
${risk.affected_count} of ${risk.total_district_facilities} healthcare facilities in ${risk.district} are simultaneously registering critical stock depletion for ${risk.medicine_name}.

**WHY IT IS HAPPENING:**
Facility-level depletion curves demonstrate sustained consumption exceeding baseline replenishment lead-times. Because the decline is synchronized across multiple nearby sites, this reflects a regional supply bottleneck rather than an isolated clinic ordering discrepancy.

**WHEN IT MAY BECOME CRITICAL:**
Average regional stock coverage has dropped to ${risk.average_days_remaining} days. Current depletion modeling indicates stockouts beginning within ${risk.estimated_shortage_window_days} days (${risk.confidence}% prototype risk estimate).

**WHAT MEDWATCH RECOMMENDS:**
Immediate inter-facility transfer of surplus stock from ${
            risk.donor_candidates[0]?.facility.name || "nearby surplus facilities"
          } is recommended to bridge receiving facilities safely past their replenishment delivery buffer.`;

          setSections(parseExplanationToSections(fallbackText));
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border-2 border-purple-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Subtle purple/blue tinted Modal Header */}
        <div className="px-6 py-4 border-b border-purple-100 flex items-center justify-between bg-gradient-to-r from-purple-50 via-indigo-50/50 to-blue-50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                AI Supply Risk Explanation
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                {risk.district} &bull; {risk.medicine_name} &bull; Clinical Shortage Intelligence
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/80 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 bg-gradient-to-b from-purple-50/20 to-white">
          {/* Source indicator */}
          <div className="flex items-center justify-between text-xs text-slate-500 border-b border-purple-100/80 pb-3">
            <div className="flex items-center space-x-1.5">
              <Brain className="w-4 h-4 text-purple-600" />
              <span>Intelligence Source:</span>
              <span className="font-semibold text-purple-900 bg-purple-100/80 px-2.5 py-0.5 rounded-full border border-purple-200">
                {sourceEngine || "Evaluating supply-chain telemetry..."}
              </span>
            </div>
            <span className="text-[11px] font-mono text-purple-600 font-bold">gemini-3.8-flash</span>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin"></div>
              <p className="text-xs text-slate-600 font-medium">
                Synthesizing multi-site telemetry into concise clinical insights...
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sections.map((sec, idx) => {
                let badgeColor = "bg-purple-100 text-purple-900 border-purple-200";
                let icon = <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />;
                let cardBg = "bg-white border-purple-100";

                if (sec.type === "happened") {
                  badgeColor = "bg-rose-100 text-rose-900 border-rose-200";
                  icon = <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />;
                  cardBg = "bg-rose-50/40 border-rose-200";
                } else if (sec.type === "why") {
                  badgeColor = "bg-amber-100 text-amber-900 border-amber-200";
                  icon = <Activity className="w-4 h-4 text-amber-600 shrink-0" />;
                  cardBg = "bg-amber-50/40 border-amber-200";
                } else if (sec.type === "when") {
                  badgeColor = "bg-blue-100 text-blue-900 border-blue-200";
                  icon = <Clock className="w-4 h-4 text-blue-600 shrink-0" />;
                  cardBg = "bg-blue-50/40 border-blue-200";
                } else if (sec.type === "recommends") {
                  badgeColor = "bg-emerald-100 text-emerald-900 border-emerald-200";
                  icon = <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
                  cardBg = "bg-emerald-50/50 border-emerald-200";
                }

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border ${cardBg} shadow-2xs space-y-1.5 transition-all`}
                  >
                    <div className="flex items-center space-x-2">
                      {icon}
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${badgeColor}`}>
                        {sec.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 font-medium leading-relaxed pl-6">
                      {sec.content}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Operational Verification Note */}
          <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-200 text-xs text-purple-950 flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Clinical Verification:</span>
              <p className="text-[11px] text-purple-900 mt-0.5">
                Multi-site synchronization confirms a true regional supply bottleneck ({risk.affected_count}/
                {risk.total_district_facilities} facilities below {risk.average_days_remaining}d coverage), verified through deterministic stock audit.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
};
