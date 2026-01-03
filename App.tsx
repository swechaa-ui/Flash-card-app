import React, { useState } from "react";

const STOPWORDS = new Set([
  "the","is","in","at","of","a","an","and","or","to","for","by","on","with","that","this","it","as","are","was","were","be","from","which","have","has","had","but","not","they","their","its","you","we","he","she","I","me","my","your","our","us"
]);

function splitIntoSentences(text: string) {
  return text.replace(/\n+/g, " ").split(/(?<=\.|\?|!)\s+/).map(s => s.trim()).filter(Boolean);
}

function extractKeyword(sentence: string) {
  const words = sentence.replace(/["'()\[\],;:]/g, "").split(/\s+/).map(w => w.replace(/[^a-zA-Z0-9_-]/g, "")).filter(Boolean);
  let candidate = "";
  for (const w of words) {
    const lw = w.toLowerCase();
    if (STOPWORDS.has(lw)) continue;
    if (lw.length > candidate.length) candidate = w;
  }
  if (!candidate && words.length) candidate = words[0];
  return candidate;
}

function makeQuestionAnswer(sentence: string) {
  const keyword = extractKeyword(sentence);
  if (!keyword) return null;
  const regex = new RegExp(keyword.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), "i");
  let question = sentence.replace(regex, "____");
  if (question === sentence) question = `What is the key term? — \n\n${sentence}`;
  const answer = keyword + " — " + sentence;
  return { question, answer, keyword };
}

const sampleParagraph = `Photosynthesis is the process by which plants and other organisms convert light energy into chemical energy stored in glucose. It primarily occurs in chloroplasts, where the pigment chlorophyll captures sunlight. During photosynthesis, carbon dioxide and water react to form glucose and oxygen; this process is fundamental to life on Earth as it produces oxygen and forms the base of most food chains.`;

export default function App() {
  const [input, setInput] = useState("");
  const [cards, setCards] = useState<any[]>([]);
  const [flippedIds, setFlippedIds] = useState<Set<string>>(new Set());
  const [maxCards, setMaxCards] = useState(50);

  const cryptoId = () => Math.random().toString(36).slice(2, 9);

  const generateFromParagraph = (paragraph: string) => {
    const sentences = splitIntoSentences(paragraph);
    const newCards: any[] = [];
    for (const s of sentences) {
      if (newCards.length >= maxCards) break;
      if (s.length < 10) continue;
      const qa = makeQuestionAnswer(s);
      if (qa) newCards.push({ id: cryptoId(), q: qa.question, a: qa.answer, orig: s });
    }
    if (!newCards.length) { alert("Couldn't generate flashcards. Try a longer paragraph."); return; }
    setCards(newCards);
    setFlippedIds(new Set());
  };

  const flipCard = (id: string) => {
    setFlippedIds(prev => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  const clearAll = () => {
    if (!confirm("Clear all flashcards?")) return;
    setCards([]);
    setFlippedIds(new Set());
  };

  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      padding: "20px",
      boxSizing: "border-box",
      fontFamily: "Poppins, sans-serif",
      background: "linear-gradient(135deg, #fce7f3 0%, #dbeafe 50%, #d1fae5 100%)", // pastel pink, blue, mint
      backgroundAttachment: "fixed"
    }}>
      <h1 style={{
        textAlign: "center",
        color: "#333",
        marginBottom: "15px",
        fontSize: "32px",
        textShadow: "1px 1px 2px rgba(255,255,255,0.7)"
      }}>
        🌼 FlashForge 
      </h1>

      <div style={{ marginBottom: "20px" }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Paste paragraph here..."
          style={{
            width: "100%",
            minHeight: "100px",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            backgroundColor: "#fffafc"
          }}
        />
        <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
          <button onClick={() => generateFromParagraph(input)} style={buttonStyleGreen}>Generate</button>
          <button onClick={() => setInput("")} style={buttonStyleGray}>Clear</button>
          <button onClick={() => setInput(sampleParagraph)} style={buttonStyleGray}>Load Sample</button>
        </div>
        <div style={{ marginTop: "10px" }}>
          Max Cards: {maxCards}
          <input type="range" min={1} max={100} value={maxCards} onChange={e => setMaxCards(Number(e.target.value))} />
        </div>
      </div>

      {/* Cards container */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
        justifyItems: "center"
      }}>
        {cards.map(c => (
          <div key={c.id} onClick={() => flipCard(c.id)} style={{
            width: "250px",
            height: "180px",
            perspective: "1000px",
            cursor: "pointer"
          }}>
            <div style={{
              position: "relative",
              width: "100%",
              height: "100%",
              transition: "transform 0.6s",
              transformStyle: "preserve-3d",
              transform: flippedIds.has(c.id) ? "rotateY(180deg)" : "rotateY(0deg)"
            }}>
              {/* Front */}
              <div style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                padding: "12px",
                backfaceVisibility: "hidden",
                backgroundColor: "#fff",
                color: "#333",
                borderRadius: "12px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                overflow: "auto"
              }}>
                {c.q}
              </div>

              {/* Back */}
              <div style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                padding: "12px",
                backfaceVisibility: "hidden",
                backgroundColor: "#a5b4fc", // soft lavender tone
                color: "#fff",
                borderRadius: "12px",
                transform: "rotateY(180deg)",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                overflow: "auto"
              }}>
                {c.a}
              </div>
            </div>
          </div>
        ))}
      </div>

      {cards.length > 0 && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button onClick={clearAll} style={buttonStyleRed}>Clear All</button>
        </div>
      )}
    </div>
  );
}

// Button styles
const buttonStyleGreen = { padding: "8px 16px", backgroundColor: "#86efac", color: "#333", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" };
const buttonStyleGray = { padding: "8px 16px", backgroundColor: "#f1f5f9", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" };
const buttonStyleRed = { padding: "8px 16px", backgroundColor: "#fca5a5", color: "#333", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" };
