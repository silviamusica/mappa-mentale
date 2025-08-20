import { useState } from 'react';
import { X } from 'lucide-react';
import './App.css';

const ChordMindMap = () => {
  const [selectedChord, setSelectedChord] = useState(null);
  const [popupPosition, setPopupPosition] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({
    triadi: true,
    quadriadi: true,
    estesi: false
  });
  const [expandedSubsections, setExpandedSubsections] = useState({});
  const [viewMode, setViewMode] = useState('accordi_comuni'); // 'accordi_comuni', 'accordi_avanzati', 'mappa_generale'
  const [selectedRoot, setSelectedRoot] = useState('Do'); // Do, Mi e Sol per iniziare

  const [expandedMappa, setExpandedMappa] = useState({
    triadi: true,
    quadriadi: false,
    estesi: false
  });

  const toggleSubsection = (categoryKey, subsectionKey) => {
    const key = `${categoryKey}_${subsectionKey}`;
    setExpandedSubsections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleCategory = (key) => {
    setExpandedCategories(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleMappaCategory = (cat) => {
    setExpandedMappa(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleChordClick = (chord, category, event) => {
    const y = event?.clientY || window.innerHeight / 2;
    setPopupPosition({ top: y });
    setSelectedChord({ ...chord, category });
  };

  // SISTEMA DI TRASPOSIZIONE AUTOMATICA
  const transposeChord = (chord, targetRoot) => {
    if (targetRoot === 'Do') {
      return chord; // Nessuna trasposizione
    }

    // Mappa delle tonalità con i loro intervalli in semitoni da Do
    const keyIntervals = {
      'Do': 0, 'Re': 2, 'Mi': 4, 'Fa': 5, 'Sol': 7, 'La': 9, 'Si': 11
    };

    // Mappa delle note cromatiche
    const chromaticNotes = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
    const interval = keyIntervals[targetRoot] || 0;

    // Funzione per trasporre una singola nota
    const transposeNote = (note) => {
      // Trova la nota base (senza alterazioni)
      const baseNote = note.replace(/[#♯♭b]/g, '');
      const alterations = note.slice(baseNote.length);
      
      const noteIndex = chromaticNotes.indexOf(baseNote);
      if (noteIndex === -1) return note; // Se non trova la nota, la lascia invariata
      
      const newIndex = (noteIndex + interval) % 12;
      return chromaticNotes[newIndex] + alterations;
    };

    // Trasponi la sigla (sostituisce solo la prima lettera o le prime due se c'è #)
    const newSigla = chord.sigla.replace(/^C([#♯♭b]?)/, (match, alteration) => {
      return transposeNote('Do' + alteration);
    });

    // Trasponi il nome (sostituisce "Do" con la nuova tonalità)
    const newNome = chord.nome.replace(/Do/g, targetRoot);

    // Trasponi le note
    const newNote = chord.note ? chord.note.split(' ').map(transposeNote).join(' ') : chord.note;

    return {
      ...chord,
      sigla: newSigla,
      nome: newNome,
      note: newNote
    };
  };

  const getTransposedChords = (chords) => {
    return chords.map(chord => transposeChord(chord, selectedRoot));
  };

  // DATI ESPANSI - PIÙ ACCORDI PER TESTARE IL SISTEMA AUTOMATICO
  const chordData = {
    triadi: {
      title: "TRIADI (3 Note)",
      color: "bg-cyan-900",
      textColor: "text-cyan-100",
      subsections: {
        base: {
          title: "Accordi Base",
          chords: [
            { sigla: 'C', nome: 'Do maggiore', formula: '1 - 3 - 5', note: 'Do Mi Sol', comune: true },
            { sigla: 'Cm', nome: 'Do minore', formula: '1 - ♭3 - 5', note: 'Do Mi♭ Sol', comune: true },
            { sigla: 'Cdim', nome: 'Do diminuito', formula: '1 - ♭3 - ♭5', note: 'Do Mi♭ Sol♭', comune: false },
            { sigla: 'Caug', nome: 'Do aumentato', formula: '1 - 3 - ♯5', note: 'Do Mi Sol♯', comune: false }
          ]
        },
        sus: {
          title: "Sospesi",
          chords: [
            { sigla: 'Csus2', nome: 'Do seconda sospesa', formula: '1 - 2 - 5', note: 'Do Re Sol', comune: false },
            { sigla: 'Csus4', nome: 'Do quarta sospesa', formula: '1 - 4 - 5', note: 'Do Fa Sol', comune: false }
          ]
        }
      }
    },
    quadriadi: {
      title: "QUADRIADI (4 Note)",
      color: "bg-slate-700",
      textColor: "text-slate-100",
      subsections: {
        settima: {
          title: "Accordi di Settima",
          chords: [
            { sigla: 'C7', nome: 'Do settima di dominante', formula: '1 - 3 - 5 - ♭7', note: 'Do Mi Sol Si♭', comune: true },
            { sigla: 'Cmaj7', nome: 'Do settima maggiore', formula: '1 - 3 - 5 - 7', note: 'Do Mi Sol Si', comune: true },
            { sigla: 'Cm7', nome: 'Do minore settima', formula: '1 - ♭3 - 5 - ♭7', note: 'Do Mi♭ Sol Si♭', comune: true }
          ]
        },
        sesta: {
          title: "Accordi di Sesta",
          chords: [
            { sigla: 'C6', nome: 'Do sesta', formula: '1 - 3 - 5 - 6', note: 'Do Mi Sol La', comune: true },
            { sigla: 'Cm6', nome: 'Do minore sesta', formula: '1 - ♭3 - 5 - 6', note: 'Do Mi♭ Sol La', comune: false }
          ]
        }
      }
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col text-white relative overflow-auto"
      style={{ backgroundColor: '#0a1833' }}
    >
      {/* Header */}
      <div className="sticky top-0 z-30">
        <div className="w-full px-6 py-4" style={{ backgroundColor: '#0a1833' }}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white">
                🎵 Accordi Musicali ({selectedRoot})
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-medium">Modalità:</span>
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg text-base font-medium cursor-pointer border-none outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="accordi_comuni">Accordi comuni</option>
                  <option value="accordi_avanzati">Accordi avanzati</option>
                  <option value="mappa_generale">Mappa generale</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-medium">Tonalità:</span>
                <select
                  value={selectedRoot}
                  onChange={(e) => setSelectedRoot(e.target.value)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg text-base font-medium cursor-pointer border-none outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="Do">Do (C)</option>
                  <option value="Re">Re (D)</option>
                  <option value="Mi">Mi (E)</option>
                  <option value="Fa">Fa (F)</option>
                  <option value="Sol">Sol (G)</option>
                  <option value="La">La (A)</option>
                  <option value="Si">Si (B)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row relative z-10">
        {viewMode === 'mappa_generale' ? (
          <div className="flex-1 p-8">
            <div className="bg-white text-gray-800 rounded-xl p-8 shadow-lg border border-gray-200">
              <h2 className="text-3xl font-bold mb-6 text-center">🗺️ Mappa Mentale degli Accordi</h2>
              <p className="text-center text-lg mb-8">Una vista d'insieme di tutti gli accordi musicali</p>
              
              {Object.entries(chordData).map(([catKey, category]) => (
                <div key={catKey} className="mb-6">
                  <button
                    onClick={() => toggleMappaCategory(catKey)}
                    className="w-full text-left p-4 rounded-lg transition-all duration-200 flex justify-between items-center"
                    style={{ backgroundColor: '#0a1833', color: 'white' }}
                  >
                    <span className="text-lg font-semibold">{category.title}</span>
                    <span className="text-xl">{expandedMappa[catKey] ? '−' : '+'}</span>
                  </button>
                  
                  {expandedMappa[catKey] && (
                    <div className="mt-4 ml-4">
                      {Object.entries(category.subsections).map(([subKey, sub]) => (
                        <div key={subKey} className="mb-4">
                          {sub.title && <h4 className="font-medium text-gray-700 mb-2">{sub.title}</h4>}
                          <div className="flex flex-wrap gap-2 ml-4">
                            {getTransposedChords(sub.chords).map((chord, idx) => (
                              <button
                                key={idx}
                                className={`px-3 py-1 rounded-lg text-sm transition font-mono border ${chord.comune ? 'font-bold bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100' : 'font-medium bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                                onClick={() => handleChordClick(chord, catKey, {clientY: window.innerHeight/2})}
                              >
                                {chord.sigla}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 p-8">
            <div className="bg-white text-gray-800 rounded-xl p-8 shadow-lg border border-gray-200">
              <h2 className="text-3xl font-bold mb-6 text-center">
                {viewMode === 'accordi_comuni' ? '🎯 Accordi Comuni' : '🔧 Accordi Avanzati'}
              </h2>
              
              {Object.entries(chordData).map(([categoryKey, category]) => {
                const isExpanded = expandedCategories[categoryKey];
                
                return (
                  <div key={categoryKey} className="mb-6">
                    <button
                      onClick={() => toggleCategory(categoryKey)}
                      className="w-full text-left p-4 rounded-lg transition-all duration-200 hover:shadow-md flex justify-between items-center"
                      style={{ backgroundColor: '#0a1833', color: 'white' }}
                    >
                      <span className="text-lg font-semibold">{category.title}</span>
                      <span className="text-xl font-bold">{isExpanded ? '−' : '+'}</span>
                    </button>
                    
                    {isExpanded && (
                      <div className="mt-4">
                        {Object.entries(category.subsections).map(([subsectionKey, subsection]) => {
                          const subsectionExpanded = expandedSubsections[`${categoryKey}_${subsectionKey}`] ?? true;
                          const hasTitle = subsection.title && subsection.title.trim() !== '';
                          
                          return (
                            <div key={subsectionKey} className="mb-4">
                              {hasTitle && (
                                <button
                                  onClick={() => toggleSubsection(categoryKey, subsectionKey)}
                                  className="w-full text-left p-3 rounded-lg transition-all duration-200 bg-gray-100 text-gray-800 hover:bg-gray-200 flex justify-between items-center border border-gray-200"
                                >
                                  <span className="text-base font-medium">{subsection.title}</span>
                                  <span className="text-lg">{subsectionExpanded ? '−' : '+'}</span>
                                </button>
                              )}
                              
                              {(!hasTitle || subsectionExpanded) && (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
                                  {getTransposedChords(subsection.chords)
                                    .filter(chord => viewMode === 'accordi_avanzati' || chord.comune)
                                    .map((chord, index) => (
                                      <button
                                        key={index}
                                        onClick={e => handleChordClick(chord, categoryKey, e)}
                                        className={`p-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base font-mono shadow-sm group border-2
                                          ${chord.comune
                                            ? 'bg-blue-50 text-blue-900 font-bold hover:bg-blue-100 hover:shadow-md border-blue-200'
                                            : 'bg-gray-50 text-gray-800 font-semibold hover:bg-gray-100 hover:shadow-md border-gray-200'}
                                          ${selectedChord?.sigla === chord.sigla ? 'ring-2 ring-blue-400 bg-blue-100' : ''}`}
                                        style={{boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)'}}
                                      >
                                        <div className="text-center">
                                          <div className={`font-mono text-lg mb-1 tracking-wide ${chord.comune ? 'text-blue-800 font-bold' : 'text-gray-700 font-semibold'} group-hover:scale-105 transition-transform`}>{chord.sigla}</div>
                                          <div className={`text-xs leading-tight font-sans ${chord.comune ? 'text-blue-600 font-medium' : 'text-gray-600 font-normal'} group-hover:underline transition-all`}>{chord.nome}</div>
                                        </div>
                                      </button>
                                    ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Detail Panel */}
        {selectedChord && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-60 z-40 animate-fadein"
              onClick={() => { setSelectedChord(null); setPopupPosition(null); }}
            />
            <div
              className="fixed left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-gray-300 z-50 w-96 max-w-[90vw] animate-slidein"
              style={{
                top: `${Math.max(20, Math.min(popupPosition?.top - 150, window.innerHeight - 350))}px`
              }}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-cyan-700">Dettagli Accordo</h3>
                  <button
                    onClick={() => { setSelectedChord(null); setPopupPosition(null); }}
                    className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                    aria-label="Chiudi dettagli"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="text-center mb-2">
                    <div className="text-2xl font-mono font-bold text-cyan-700 mb-1 tracking-wide">
                      {selectedChord.sigla}
                    </div>
                    <div className="text-base text-gray-300 mb-1">
                      <span className="text-gray-700">{selectedChord.nome}</span>
                    </div>
                    {selectedChord.comune && (
                      <div className="inline-block bg-yellow-300 text-gray-900 px-2 py-1 rounded text-xs font-bold mt-1">
                        comune
                      </div>
                    )}
                  </div>
                  <div className="pt-4">
                    <div className="mb-2">
                      <h4 className="font-semibold text-cyan-700 mb-1 text-xs uppercase tracking-wide">Formula</h4>
                      <div className="font-mono text-base bg-gray-200 p-2 rounded-lg text-cyan-900">
                        {selectedChord.formula}
                      </div>
                    </div>
                    <div className="mb-2">
                      <h4 className="font-semibold text-cyan-700 mb-1 text-xs uppercase tracking-wide">Note (in {selectedRoot})</h4>
                      <div className="font-mono text-base bg-gray-200 p-2 rounded-lg text-cyan-900">
                        {selectedChord.note}
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-xs text-cyan-700 opacity-80 mt-2 pt-2">
                    Per chiudere premi la <span className="font-bold">X</span> in alto a destra
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChordMindMap;