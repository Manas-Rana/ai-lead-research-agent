import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Bot,
  Check,
  ChevronRight,
  Clock3,
  ExternalLink,
  Linkedin,
  Mail,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  X
} from "lucide-react";
import { api } from "./api";

function ScoreRing({ score }) {
  const percent = (score / 10) * 100;

  return (
    <div className="score-ring" style={{ "--score": `${percent}%` }}>
      <div className="score-ring-inner">
        <strong>{score}</strong>
        <span>/10</span>
      </div>
    </div>
  );
}

function Section({ title, icon, children, action }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div className="panel-title">
          {icon}
          <h2>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-icon"><Sparkles size={25} /></div>
      <h2>Ready to research your next lead</h2>
      <p>
        Enter a company name or URL. LeadPilot will research the company,
        evaluate ICP fit, and prepare outreach for human review.
      </p>
      <div className="empty-flow">
        <span><Search size={15} /> Research</span>
        <ChevronRight size={15} />
        <span><Target size={15} /> Score</span>
        <ChevronRight size={15} />
        <span><Mail size={15} /> Draft</span>
        <ChevronRight size={15} />
        <span><Check size={15} /> Review</span>
      </div>
    </div>
  );
}

export default function App() {
  const [company, setCompany] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const loadHistory = async () => {
    try {
      const data = await api.history();
      setHistory(data.items);
    } catch {
      // History is supplementary; don't block the main workflow.
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const research = async (event) => {
    event.preventDefault();

    if (!company.trim()) {
      setError("Enter a company name or website.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await api.research(company.trim());
      setResult(data);
      await loadHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const review = async (status) => {
    if (!result) return;

    try {
      const data = await api.review(result.id, {
        status,
        emailBody: result.result.outreach.emailBody,
        linkedinMessage: result.result.outreach.linkedinMessage
      });

      setResult(data);
      await loadHistory();
      setToast(status === "approved" ? "Lead approved for outreach." : "Changes saved.");
      setTimeout(() => setToast(""), 2500);
    } catch (err) {
      setError(err.message);
    }
  };

  const regenerate = async () => {
    if (!result) return;

    setRegenerating(true);
    setError("");

    try {
      const data = await api.regenerate(result.id);
      setResult(data);
      await loadHistory();
      setToast("Outreach regenerated.");
      setTimeout(() => setToast(""), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setRegenerating(false);
    }
  };

  const updateEmail = (value) => {
    setResult((current) => ({
      ...current,
      result: {
        ...current.result,
        outreach: {
          ...current.result.outreach,
          emailBody: value
        }
      }
    }));
  };

  const updateLinkedIn = (value) => {
    setResult((current) => ({
      ...current,
      result: {
        ...current.result,
        outreach: {
          ...current.result.outreach,
          linkedinMessage: value
        }
      }
    }));
  };

  const scoreFactors = useMemo(() => {
    if (!result) return [];
    const breakdown = result.result.scoreBreakdown;

    return [
      ["Industry fit", breakdown.industryFit],
      ["Company size", breakdown.companySizeFit],
      ["Pain-point fit", breakdown.painPointFit],
      ["Buying signal", breakdown.buyingSignal],
      ["Technology fit", breakdown.technologyFit]
    ];
  }, [result]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><Bot size={21} /></div>
          <div>
            <strong>LeadPilot AI</strong>
            <span>Research & Outreach Agent</span>
          </div>
        </div>

        <div className="topbar-status">
          <span className="status-dot" />
          Human-in-the-loop
        </div>
      </header>

      <main className="main">
        <div className="hero">
          <div>
            <div className="eyebrow"><Sparkles size={14} /> AI SALES RESEARCH</div>
            <h1>Turn a company into a <em>sales-ready lead.</em></h1>
            <p>
              Research the company, understand likely needs, score ICP fit,
              and draft personalised outreach — with a human review before action.
            </p>
          </div>

          <div className="hero-badge">
            <ShieldCheck size={18} />
            <span>Evidence-first workflow</span>
          </div>
        </div>

        <form className="research-form" onSubmit={research}>
          <div className="input-wrap">
            <Search size={19} />
            <input
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder="Enter a company name or website — e.g. stripe.com"
              disabled={loading}
            />
          </div>
          <button className="primary-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" /> Researching…
              </>
            ) : (
              <>
                Research lead <ArrowUpRight size={17} />
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="alert error">
            <X size={18} />
            <span>{error}</span>
          </div>
        )}

        {toast && (
          <div className="alert success">
            <Check size={18} />
            <span>{toast}</span>
          </div>
        )}

        {!result && !loading && <EmptyState />}

        {loading && (
          <div className="loading-card">
            <div className="loading-orb"><Sparkles size={25} /></div>
            <h2>Researching company intelligence</h2>
            <p>Searching public sources and preparing an evidence-backed lead profile…</p>
            <div className="loading-steps">
              <span className="active">Company research</span>
              <span>ICP scoring</span>
              <span>Outreach drafting</span>
            </div>
          </div>
        )}

        {result && !loading && (
          <div className="workspace">
            {result.demoMode && (
              <div className="demo-banner">
                <Sparkles size={17} />
                <div>
                  <strong>Demo mode</strong>
                  <span>No OpenAI API key is configured. The app is using local sample data.</span>
                </div>
              </div>
            )}

            <div className="grid-main">
              <Section title="Company intelligence" icon={<Search size={18} />}>
                <div className="company-head">
                  <div className="company-avatar">
                    {result.result.companyName.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <h3>{result.result.companyName}</h3>
                    <a href={result.result.website} target="_blank" rel="noreferrer">
                      {result.result.website} <ExternalLink size={13} />
                    </a>
                  </div>
                </div>

                <p className="overview">{result.result.overview}</p>

                <div className="info-grid">
                  <div><span>Industry</span><strong>{result.result.industry}</strong></div>
                  <div><span>Size signal</span><strong>{result.result.companySizeSignal}</strong></div>
                  <div><span>HQ signal</span><strong>{result.result.headquartersSignal}</strong></div>
                </div>

                <div className="tag-group">
                  <span className="label">Products / services</span>
                  <div className="tags">
                    {result.result.productsOrServices.map((item) => <span key={item}>{item}</span>)}
                  </div>
                </div>

                <div className="two-col">
                  <div>
                    <span className="label">Likely pain points</span>
                    <ul className="clean-list">
                      {result.result.likelyPainPoints.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <span className="label">Buying signals</span>
                    <ul className="clean-list">
                      {result.result.buyingSignals.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                </div>
              </Section>

              <Section title="ICP qualification" icon={<Target size={18} />}>
                <div className="score-layout">
                  <ScoreRing score={result.result.icpScore} />
                  <div>
                    <div className="score-label">AI-assisted lead score</div>
                    <h3>{result.result.icpScore >= 8 ? "Strong potential fit" : result.result.icpScore >= 5 ? "Moderate potential fit" : "Low potential fit"}</h3>
                    <p>{result.result.scoreReason}</p>
                  </div>
                </div>

                <div className="factor-list">
                  {scoreFactors.map(([label, value]) => (
                    <div className="factor" key={label}>
                      <span>{label}</span>
                      <div className="factor-track">
                        <div className="factor-fill" style={{ width: `${(value / 2) * 100}%` }} />
                      </div>
                      <strong>{value}/2</strong>
                    </div>
                  ))}
                </div>

                <div className="review-note">
                  <ShieldCheck size={16} />
                  <span>This is a prioritisation signal, not a guaranteed fact. Review the evidence before outreach.</span>
                </div>
              </Section>
            </div>

            <Section
              title="Evidence & sources"
              icon={<ShieldCheck size={18} />}
            >
              <div className="evidence-list">
                {result.result.evidence.map((entry, index) => (
                  <div className="evidence" key={`${entry.source}-${index}`}>
                    <div className="evidence-number">{index + 1}</div>
                    <div>
                      <p>{entry.claim}</p>
                      {entry.source.startsWith("http") ? (
                        <a href={entry.source} target="_blank" rel="noreferrer">
                          {entry.source} <ExternalLink size={12} />
                        </a>
                      ) : (
                        <small>{entry.source}</small>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section
              title="Human review"
              icon={<Mail size={18} />}
              action={
                <button className="secondary-btn" onClick={regenerate} disabled={regenerating}>
                  <RefreshCw size={15} className={regenerating ? "spin" : ""} />
                  {regenerating ? "Regenerating…" : "Regenerate"}
                </button>
              }
            >
              <div className="outreach-grid">
                <div className="outreach-card">
                  <div className="outreach-title">
                    <div className="channel-icon"><Mail size={17} /></div>
                    <div>
                      <strong>Cold email</strong>
                      <span>Editable before approval</span>
                    </div>
                  </div>

                  <input
                    className="subject-input"
                    value={result.result.outreach.subject}
                    readOnly
                    aria-label="Email subject"
                  />

                  <textarea
                    value={result.result.outreach.emailBody}
                    onChange={(event) => updateEmail(event.target.value)}
                    rows={12}
                  />
                </div>

                <div className="outreach-card">
                  <div className="outreach-title">
                    <div className="channel-icon linkedin"><Linkedin size={17} /></div>
                    <div>
                      <strong>LinkedIn message</strong>
                      <span>Short, human and personalised</span>
                    </div>
                  </div>

                  <textarea
                    value={result.result.outreach.linkedinMessage}
                    onChange={(event) => updateLinkedIn(event.target.value)}
                    rows={7}
                  />

                  <div className="char-count">
                    {result.result.outreach.linkedinMessage.length} characters
                  </div>

                  <div className="review-actions">
                    <button className="danger-btn" onClick={() => review("rejected")}>
                      <X size={16} /> Reject
                    </button>
                    <button className="approve-btn" onClick={() => review("approved")}>
                      <Check size={16} /> Approve outreach
                    </button>
                  </div>
                </div>
              </div>

              {result.result.reviewNotes?.length > 0 && (
                <div className="notes-box">
                  <Clock3 size={16} />
                  <div>
                    <strong>Review before sending</strong>
                    {result.result.reviewNotes.map((note) => <p key={note}>{note}</p>)}
                  </div>
                </div>
              )}
            </Section>

            <Section title="Recent research runs" icon={<Clock3 size={18} />}>
              {history.length === 0 ? (
                <p className="muted">No previous runs.</p>
              ) : (
                <div className="history-list">
                  {history.slice(0, 6).map((item) => (
                    <button
                      className={`history-item ${item.id === result.id ? "current" : ""}`}
                      key={item.id}
                      onClick={async () => {
                        const data = await api.get(item.id);
                        setResult(data);
                      }}
                    >
                      <div>
                        <strong>{item.company_name}</strong>
                        <span>{item.input}</span>
                      </div>
                      <div className="history-right">
                        <span className={`status ${item.status}`}>{item.status}</span>
                        <ChevronRight size={16} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </Section>
          </div>
        )}
      </main>

      <footer>
        <span>LeadPilot AI</span>
        <span>•</span>
        <span>AI-assisted research with human approval</span>
      </footer>
    </div>
  );
}
