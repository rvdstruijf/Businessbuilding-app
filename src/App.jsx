import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { SYSTEM_PROMPTS } from './prompts.js';

// BusinessBuilding Brand Colors
const brand = {
  darkBlue: '#001649',
  orange: '#F77F00',
  grey: '#C5CACE',
  lightGrey: '#E7E6E6',
  white: '#FFFFFF',
};

const introPhases = [
  { id: 'companyProfile', name: 'Bedrijfsprofiel', icon: '🏢', description: 'Genereer een compleet strategisch bedrijfsprofiel' },
  { id: 'competitorAnalysis', name: 'Concurrentieanalyse', icon: '🎯', description: 'Analyseer je belangrijkste concurrenten' }
];

const mainPillars = [
  { id: 'doelgroep', name: 'Doelgroepen', day: 2, icon: '👥', description: 'Wie zijn je ideale klanten?' },
  { id: 'pmc', name: 'PMC', day: 3, icon: '📦', description: 'Product-Markt Combinaties' },
  { id: 'orientatie', name: 'Oriëntatie', day: 4, icon: '🧭', description: 'Waar oriënteert je doelgroep zich?' },
  { id: 'contacten', name: 'Contacten', day: 5, icon: '🤝', description: 'Hoe bouw je structureel contact op?' },
  { id: 'conversie', name: 'Conversie', day: 6, icon: '💰', description: 'Van interesse naar opdracht' }
];

const conversionSteps = [
  { letter: 'V', name: 'Eerste Contact → Sales' },
  { letter: 'I', name: 'Sales → Afspraak' },
  { letter: 'B', name: 'Afspraak → Demo' },
  { letter: 'A', name: 'Demo → Offerte' },
  { letter: 'N', name: 'Offerte → Deal' }
];

const allPhases = [
  ...introPhases, 
  ...mainPillars, 
  { id: 'synthesis', name: 'Synthese', icon: '🎯', description: 'Commercieel Plan 2026' }
];

// Markdown renderer
function renderMarkdown(text) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (line.startsWith('#### ')) return <h5 key={i} style={{ color: brand.darkBlue, margin: '12px 0 6px', fontSize: '0.85rem', fontWeight: '600' }}>{line.slice(5)}</h5>;
    if (line.startsWith('### ')) return <h4 key={i} style={{ color: brand.darkBlue, margin: '14px 0 8px', fontSize: '0.95rem', fontWeight: '600' }}>{line.slice(4)}</h4>;
    if (line.startsWith('## ')) return <h3 key={i} style={{ color: brand.darkBlue, margin: '18px 0 10px', fontSize: '1.05rem', fontWeight: '600', borderBottom: `2px solid ${brand.orange}`, paddingBottom: '4px' }}>{line.slice(3)}</h3>;
    if (line.startsWith('# ')) return <h2 key={i} style={{ color: brand.darkBlue, margin: '20px 0 12px', fontSize: '1.15rem', fontWeight: '700' }}>{line.slice(2)}</h2>;
    if (line.startsWith('---')) return <hr key={i} style={{ border: 'none', borderTop: `1px solid ${brand.lightGrey}`, margin: '16px 0' }} />;
    
    let processed = line
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.*?)`/g, '<code style="background:#f0f0f0;padding:2px 6px;border-radius:3px">$1</code>');
    
    if (line.startsWith('- ')) return <li key={i} style={{ marginLeft: '20px', marginBottom: '4px', fontSize: '0.85rem' }} dangerouslySetInnerHTML={{ __html: processed.slice(2) }} />;
    if (line.match(/^\d+\.\s/)) return <li key={i} style={{ marginLeft: '20px', marginBottom: '4px', fontSize: '0.85rem', listStyleType: 'decimal' }} dangerouslySetInnerHTML={{ __html: processed.replace(/^\d+\.\s/, '') }} />;
    if (!line.trim()) return <br key={i} />;
    if (line.includes('✅')) return <p key={i} style={{ margin: '12px 0', padding: '12px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', borderLeft: '4px solid #22c55e', fontWeight: '600', color: '#166534' }} dangerouslySetInnerHTML={{ __html: processed }} />;
    return <p key={i} style={{ margin: '8px 0', lineHeight: '1.6', fontSize: '0.85rem' }} dangerouslySetInnerHTML={{ __html: processed }} />;
  });
}

// Main App
export default function App() {
  const [currentView, setCurrentView] = useState('hub');
  const [activePhase, setActivePhase] = useState(null);
  const [completedPhases, setCompletedPhases] = useState([]);
  const [phaseDocuments, setPhaseDocuments] = useState({});
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use ref for input value to prevent re-renders
  const inputRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (activePhase) {
      const phase = allPhases.find(p => p.id === activePhase);
      const prevDocs = Object.keys(phaseDocuments);
      const contextInfo = prevDocs.length > 0 ? `\n\n📄 **Context:** ${prevDocs.join(', ')}` : '';
      
      let welcome = '';
      if (activePhase === 'companyProfile') {
        welcome = `👋 **Welkom bij de Bedrijfsprofiel Analyse!**\n\nGeef me een bedrijfsnaam, website-URL, of beschrijving om te starten.`;
      } else if (activePhase === 'competitorAnalysis') {
        welcome = `🎯 **Concurrentieanalyse**\n\nIk analyseer concurrenten op basis van het bedrijfsprofiel.${contextInfo}\n\nTyp "Start analyse" om te beginnen.`;
      } else if (activePhase === 'synthesis') {
        welcome = `🎯 **Synthese - Commercieel Plan 2026**${contextInfo}\n\nTyp "Genereer plan" om te beginnen.`;
      } else {
        welcome = `👋 **${phase?.name}**\n\n${phase?.description}${contextInfo}\n\nTyp "Start analyse" om te beginnen.`;
      }
      setMessages([{ role: 'assistant', content: welcome }]);
    }
  }, [activePhase]);

  const getSystemPrompt = (phaseId) => {
    const basePrompt = SYSTEM_PROMPTS[phaseId] || `Je bent een business consultant.`;
    const docs = Object.entries(phaseDocuments)
      .map(([id, doc]) => `--- ${id.toUpperCase()} ---\n${doc.substring(0, 3000)}\n---`)
      .join('\n\n');
    return docs ? `${basePrompt}\n\n## CONTEXT:\n${docs}` : basePrompt;
  };

  const sendMessage = async () => {
    const inputValue = inputRef.current?.value || '';
    if (!inputValue.trim() || isLoading) return;

    const userMsg = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMsg]);
    if (inputRef.current) inputRef.current.value = '';
    setIsLoading(true);

    try {
      const apiMsgs = [...messages, userMsg].filter((_, i) => i > 0).map(m => ({ role: m.role, content: m.content }));
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system: getSystemPrompt(activePhase), messages: apiMsgs })
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      
      const data = await res.json();
      const reply = data.content?.[0]?.text || 'Er ging iets mis.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);

      if (reply.length > 2000 || reply.includes('Samenvatting') || reply.includes('VOLTOOID')) {
        const allMsgs = [...messages, userMsg, { role: 'assistant', content: reply }]
          .filter(m => m.role === 'assistant').map(m => m.content).join('\n\n---\n\n');
        setPhaseDocuments(prev => ({ ...prev, [activePhase]: allMsgs }));
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ Fout: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDocument = () => {
    const allMsgs = messages.filter(m => m.role === 'assistant').map(m => m.content).join('\n\n---\n\n');
    setPhaseDocuments(prev => ({ ...prev, [activePhase]: allMsgs }));
  };

  const completePhase = () => {
    if (!completedPhases.includes(activePhase)) {
      setCompletedPhases(prev => [...prev, activePhase]);
    }
    const curr = activePhase;
    setActivePhase(null);
    setMessages([]);
    if (introPhases.find(p => p.id === curr)) setCurrentView('intro');
    else if (mainPillars.find(p => p.id === curr)) setCurrentView('pillars');
    else setCurrentView('hub');
  };

  const goBack = () => {
    const curr = activePhase;
    setActivePhase(null);
    setMessages([]);
    if (introPhases.find(p => p.id === curr)) setCurrentView('intro');
    else if (mainPillars.find(p => p.id === curr)) setCurrentView('pillars');
    else setCurrentView('hub');
  };

  // Header
  const Header = ({ showBack }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: brand.darkBlue, borderBottom: `3px solid ${brand.orange}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {showBack && <button onClick={goBack} style={{ background: 'none', border: 'none', color: brand.orange, cursor: 'pointer' }}>← Terug</button>}
        <div>
          <h1 style={{ fontSize: '1.2rem', color: brand.white, margin: 0 }}><span style={{ color: brand.orange, fontWeight: '700' }}>Business</span>Building</h1>
          <p style={{ color: brand.orange, fontSize: '0.55rem', margin: 0 }}>Delivering Your Ambition</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '3px' }}>
        {allPhases.map(p => (
          <div key={p.id} style={{ width: '8px', height: '8px', borderRadius: '50%', background: completedPhases.includes(p.id) ? '#22c55e' : brand.grey, opacity: completedPhases.includes(p.id) ? 1 : 0.3 }} />
        ))}
      </div>
    </div>
  );

  // Hub View
  if (currentView === 'hub' && !activePhase) {
    return (
      <div style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${brand.white} 0%, ${brand.lightGrey} 100%)`, fontFamily: 'Calibri, Arial, sans-serif' }}>
        <Header showBack={false} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px', maxWidth: '500px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.25rem', color: brand.darkBlue, margin: '0 0 4px 0', textAlign: 'center' }}>Samen bouwen aan een commercieel fundament</h2>
          <p style={{ color: brand.grey, fontSize: '0.8rem', margin: '0 0 16px 0' }}>AI-gestuurde commerciële groei in 7 dagen</p>
          <img src="/groeimodel.jpg" alt="Groeimodel" style={{ width: '100%', maxWidth: '340px', marginBottom: '20px', borderRadius: '8px' }} />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '400px' }}>
            <div onClick={() => setCurrentView('intro')} style={{ background: brand.orange, borderRadius: '12px', padding: '16px', cursor: 'pointer' }}>
              <span style={{ background: brand.white, color: brand.orange, padding: '3px 10px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: '600' }}>DAG 1</span>
              <h3 style={{ color: brand.white, margin: '6px 0 4px 0', fontSize: '1.1rem' }}>🚀 Introductie</h3>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.75rem', margin: 0 }}>Bedrijfsprofiel & Concurrentieanalyse</p>
            </div>
            
            <div onClick={() => setCurrentView('pillars')} style={{ background: brand.darkBlue, borderRadius: '12px', padding: '16px', cursor: 'pointer' }}>
              <span style={{ background: brand.orange, color: brand.white, padding: '3px 10px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: '600' }}>DAG 2-6</span>
              <h3 style={{ color: brand.white, margin: '6px 0 4px 0', fontSize: '1.1rem' }}>📊 De 5 Pijlers</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', margin: 0 }}>Doelgroep → PMC → Oriëntatie → Contacten → Conversie</p>
            </div>
            
            <div onClick={() => mainPillars.every(p => completedPhases.includes(p.id)) && setActivePhase('synthesis')} 
                 style={{ background: mainPillars.every(p => completedPhases.includes(p.id)) ? '#22c55e' : brand.grey, borderRadius: '12px', padding: '16px', cursor: mainPillars.every(p => completedPhases.includes(p.id)) ? 'pointer' : 'not-allowed', opacity: mainPillars.every(p => completedPhases.includes(p.id)) ? 1 : 0.6 }}>
              <span style={{ background: brand.white, color: brand.darkBlue, padding: '3px 10px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: '600' }}>DAG 7</span>
              <h3 style={{ color: brand.white, margin: '6px 0 4px 0', fontSize: '1.1rem' }}>🎯 Synthese</h3>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem', margin: 0 }}>Commercieel Plan 2026</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Intro View
  if (currentView === 'intro' && !activePhase) {
    return (
      <div style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${brand.white} 0%, ${brand.lightGrey} 100%)`, fontFamily: 'Calibri, Arial, sans-serif' }}>
        <Header showBack />
        <div style={{ maxWidth: '450px', margin: '0 auto', padding: '24px 16px' }}>
          <h1 style={{ color: brand.darkBlue, fontSize: '1.5rem' }}>Dag 1: Introductie</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
            {introPhases.map((phase, idx) => {
              const done = completedPhases.includes(phase.id);
              const unlocked = idx === 0 || completedPhases.includes(introPhases[idx - 1].id);
              return (
                <div key={phase.id} onClick={() => unlocked && setActivePhase(phase.id)}
                     style={{ background: done ? 'rgba(34,197,94,0.1)' : brand.white, border: `2px solid ${done ? '#22c55e' : unlocked ? brand.orange : brand.grey}`, borderRadius: '12px', padding: '18px', cursor: unlocked ? 'pointer' : 'not-allowed', opacity: unlocked ? 1 : 0.5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: done ? '#22c55e' : brand.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{done ? '✓' : phase.icon}</div>
                    <div style={{ flex: 1 }}>
                      <span style={{ color: brand.orange, fontSize: '0.65rem', fontWeight: '600' }}>STAP {idx + 1}</span>
                      <h3 style={{ color: brand.darkBlue, margin: '2px 0', fontSize: '1.05rem' }}>{phase.name}</h3>
                      <p style={{ color: brand.grey, margin: 0, fontSize: '0.8rem' }}>{phase.description}</p>
                    </div>
                    <div style={{ color: unlocked ? brand.orange : brand.grey, fontSize: '1.4rem' }}>→</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Pillars View
  if (currentView === 'pillars' && !activePhase) {
    return (
      <div style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${brand.white} 0%, ${brand.lightGrey} 100%)`, fontFamily: 'Calibri, Arial, sans-serif' }}>
        <Header showBack />
        <div style={{ maxWidth: '450px', margin: '0 auto', padding: '24px 16px' }}>
          <h1 style={{ color: brand.darkBlue, fontSize: '1.5rem' }}>Dag 2-6: De 5 Pijlers</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
            {mainPillars.map((pillar, idx) => {
              const done = completedPhases.includes(pillar.id);
              const prereq = idx === 0 ? (completedPhases.includes('companyProfile') && completedPhases.includes('competitorAnalysis')) : completedPhases.includes(mainPillars[idx - 1].id);
              return (
                <div key={pillar.id} onClick={() => prereq && setActivePhase(pillar.id)}
                     style={{ background: done ? 'rgba(34,197,94,0.1)' : brand.white, border: `2px solid ${done ? '#22c55e' : prereq ? brand.darkBlue : brand.lightGrey}`, borderRadius: '12px', padding: '14px', cursor: prereq ? 'pointer' : 'not-allowed', opacity: prereq ? 1 : 0.4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: done ? '#22c55e' : brand.darkBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>{done ? '✓' : pillar.icon}</div>
                    <div style={{ flex: 1 }}>
                      <span style={{ color: brand.orange, fontSize: '0.65rem', fontWeight: '600' }}>Dag {pillar.day}</span>
                      <h3 style={{ color: brand.darkBlue, margin: '0 0 4px 0', fontSize: '1rem' }}>{pillar.name}</h3>
                      <p style={{ color: brand.grey, margin: 0, fontSize: '0.75rem' }}>{pillar.description}</p>
                    </div>
                    <div style={{ color: prereq ? brand.orange : brand.grey }}>{done ? '✓' : '→'}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Chat View
  if (activePhase) {
    const phase = allPhases.find(p => p.id === activePhase);
    const hasDoc = phaseDocuments[activePhase];
    const hasResponses = messages.filter(m => m.role === 'assistant').length > 1;

    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Calibri, Arial, sans-serif' }}>
        <Header showBack />
        
        <div style={{ padding: '12px 16px', background: brand.darkBlue, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: brand.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{phase?.icon}</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ color: brand.white, margin: 0, fontSize: '1.1rem' }}>{phase?.name}</h2>
            <p style={{ color: brand.orange, margin: 0, fontSize: '0.7rem' }}>{phase?.description}</p>
          </div>
        </div>

        {activePhase === 'conversie' && (
          <div style={{ padding: '12px 16px', background: brand.lightGrey, display: 'flex', gap: '6px', overflowX: 'auto' }}>
            {conversionSteps.map((step, i) => (
              <div key={step.letter} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: brand.white, padding: '6px 10px', borderRadius: '8px' }}>
                <span style={{ width: '24px', height: '24px', background: brand.orange, color: brand.white, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.8rem' }}>{step.letter}</span>
                <span style={{ fontSize: '0.65rem', color: brand.darkBlue }}>{step.name.split('→')[0].trim()}</span>
                {i < 4 && <span style={{ color: brand.grey }}>→</span>}
              </div>
            ))}
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', background: brand.lightGrey }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ marginBottom: '14px', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '88%', padding: '12px 16px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: msg.role === 'user' ? brand.orange : brand.white, color: msg.role === 'user' ? brand.white : brand.darkBlue }}>
                {msg.role === 'user' ? msg.content : renderMarkdown(msg.content)}
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '14px' }}>
              <div style={{ padding: '16px 20px', background: brand.white, borderRadius: '16px' }}>
                <span style={{ color: brand.grey }}>⏳ Analyse wordt gegenereerd...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {hasResponses && !completedPhases.includes(activePhase) && (
          <div style={{ padding: '12px 16px', background: hasDoc ? 'rgba(34,197,94,0.1)' : 'rgba(247,127,0,0.1)', borderTop: `2px solid ${hasDoc ? '#22c55e' : brand.orange}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: hasDoc ? '#166534' : brand.darkBlue }}>{hasDoc ? '✅ Opgeslagen!' : '💡 Klaar? Sla op en ga door.'}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {!hasDoc && <button onClick={saveDocument} style={{ background: brand.orange, color: brand.white, border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>💾 Opslaan</button>}
              <button onClick={completePhase} disabled={!hasDoc} style={{ background: hasDoc ? '#22c55e' : brand.grey, color: brand.white, border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: hasDoc ? 'pointer' : 'not-allowed', fontWeight: '600' }}>Doorgaan →</button>
            </div>
          </div>
        )}

        <div style={{ padding: '12px 16px', background: brand.white, borderTop: `1px solid ${brand.lightGrey}`, display: 'flex', gap: '10px' }}>
          <input
            ref={inputRef}
            type="text"
            placeholder={activePhase === 'companyProfile' ? 'Typ een bedrijfsnaam of URL...' : 'Typ je vraag...'}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            style={{ flex: 1, padding: '12px 18px', border: `2px solid ${brand.lightGrey}`, borderRadius: '24px', fontSize: '0.9rem', outline: 'none' }}
          />
          <button onClick={sendMessage} disabled={isLoading} style={{ width: '48px', height: '48px', borderRadius: '50%', background: isLoading ? brand.grey : brand.orange, border: 'none', color: brand.white, fontSize: '1.2rem', cursor: isLoading ? 'not-allowed' : 'pointer' }}>➤</button>
        </div>
      </div>
    );
  }

  return null;
}
