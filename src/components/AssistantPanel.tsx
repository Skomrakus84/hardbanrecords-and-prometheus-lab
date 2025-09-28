
import React, { useState } from 'react';
import { Card, Button, Textarea, Spinner } from '../shared/ui';

// Panel AI/Asystenta: miejsce na podpowiedzi, generowanie tekstu, wsparcie dla użytkownika

const promptTemplates = [
  { label: 'Wygeneruj opis wydania muzycznego', value: 'Napisz kreatywny opis dla nowego wydania muzycznego w stylu synthwave.' },
  { label: 'Zaproponuj tytuł książki', value: 'Zaproponuj 5 chwytliwych tytułów dla książki o cyberpunkowej przyszłości.' },
  { label: 'Podsumuj zadania', value: 'Podsumuj najważniejsze zadania do wykonania w tym tygodniu.' },
  { label: 'Wygeneruj blurb do książki', value: 'Napisz krótki blurb promocyjny do powieści science-fiction.' },
  { label: 'Wygeneruj listę słów kluczowych', value: 'Wygeneruj 10 słów kluczowych do promocji wydania muzycznego.' },
];

const contextHints = [
  'Masz nieukończone zadania – zapytaj AI jak je rozplanować.',
  'Możesz poprosić AI o kreatywny opis wydania lub książki.',
  'AI może wygenerować blurb, tytuł, słowa kluczowe lub podsumowanie.',
  'Zadaj pytanie dotyczące rozwoju projektu lub poproś o inspirację.',
];

const AssistantPanel: React.FC = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [model, setModel] = useState<'groq' | 'gemini'>('groq');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const handleTemplate = (val: string) => {
    setInput(val);
    setSelectedTemplate(val);
  };

  const handleAsk = async () => {
    setLoading(true);
    setResponse('');
    setError('');
    try {
      let res;
      if (model === 'groq') {
        res = await fetch('/api/ai/groq-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: input })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Błąd AI');
        setResponse(data.result);
      } else {
        res = await fetch('/api/ai/generate-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'gemini-pro', contents: [{ role: 'user', parts: [{ text: input }] }] })
        });
        const data = await res.json();
        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
          setResponse(data.candidates[0].content.parts[0].text);
        } else {
          throw new Error(data.message || 'Błąd AI');
        }
      }
    } catch (e: any) {
      setError(e.message || 'Błąd połączenia z AI');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="AI Assistant" style={{ maxWidth: 440, margin: '0 auto' }}>
      <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
        <label style={{ fontWeight: 500 }}>Model:</label>
        <select value={model} onChange={e => setModel(e.target.value as 'groq' | 'gemini')} style={{ padding: 4 }}>
          <option value="groq">Groq (Llama 3)</option>
          <option value="gemini">Gemini Pro</option>
        </select>
        <label style={{ fontWeight: 500, marginLeft: 16 }}>Szablon promptu:</label>
        <select value={selectedTemplate} onChange={e => handleTemplate(e.target.value)} style={{ padding: 4, minWidth: 180 }}>
          <option value="">-- wybierz --</option>
          {promptTemplates.map(t => (
            <option key={t.label} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      <Textarea
        placeholder="Zadaj pytanie lub poproś o pomoc..."
        value={input}
        onChange={e => setInput(e.target.value)}
        minRows={3}
        maxRows={6}
        style={{ marginBottom: 8 }}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <Button onClick={handleAsk} disabled={loading || !input.trim()}>
          {loading ? <Spinner size={16} /> : 'Wyślij'}
        </Button>
        <Button onClick={() => setInput('')} disabled={loading || !input} variant="secondary">Wyczyść</Button>
      </div>
      <div style={{ marginTop: 10, fontSize: 13, color: '#888' }}>
        <strong>Podpowiedzi:</strong> {contextHints[Math.floor(Math.random()*contextHints.length)]}
      </div>
      <div style={{ marginTop: 10, fontSize: 13, color: '#888' }}>
        <strong>Przykładowe pytania:</strong>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li onClick={() => setInput('Jakie są najważniejsze zadania na dziś?')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Jakie są najważniejsze zadania na dziś?</li>
          <li onClick={() => setInput('Wygeneruj opis wydania muzycznego w stylu synthwave.')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Wygeneruj opis wydania muzycznego w stylu synthwave.</li>
          <li onClick={() => setInput('Podsumuj postępy w projekcie za ostatni tydzień.')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Podsumuj postępy w projekcie za ostatni tydzień.</li>
        </ul>
      </div>
      {error && (
        <div style={{ color: 'red', marginTop: 12 }}>{error}</div>
      )}
      {response && (
        <div style={{ marginTop: 16, background: '#f6f6f6', padding: 12, borderRadius: 6 }}>
          <strong>Odpowiedź AI:</strong>
          <div style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}>{response}</div>
        </div>
      )}
    </Card>
  );
};

export default AssistantPanel;
