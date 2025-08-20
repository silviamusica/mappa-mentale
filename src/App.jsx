import { useState, useEffect } from 'react';
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
  const [csvData, setCsvData] = useState(null); // Dati del CSV caricati
  const [csvLoading, setCsvLoading] = useState(true);

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

  // Carica e parsa il CSV all'avvio
  useEffect(() => {
    const loadCSV = async () => {
      try {
        setCsvLoading(true);
        const response = await fetch('/accordi_database.csv');
        if (!response.ok) throw new Error('CSV non trovato');
        
        const csvText = await response.text();
        const lines = csvText.split('\n');
        
        // Parsa il CSV in una struttura utilizzabile
        // Il CSV ha una struttura speciale: riga 2 continua nella riga 3
        const headers1 = lines[1].split(','); // Riga 2: primi accordi
        const headers2 = lines[2].split(','); // Riga 3: continua gli accordi
        
        // La riga 2 termina con "m add 9 e la riga 3 inizia con ",9,m9...
        // Quindi dobbiamo unire le due righe correttamente
        const allHeaders = [...headers1]; // Inizia con la riga 2
        
        // La riga 3 inizia con una virgola vuota, quindi salta il primo elemento
        for (let i = 1; i < headers2.length; i++) {
          const header = headers2[i]?.trim();
          if (header) {
            allHeaders.push(header);
          }
        }
        
        const csvDataMap = {};
        
        // Per ogni riga (tonalità), crea un mapping accordo → note
        for (let i = 6; i < lines.length && lines[i].trim(); i++) { // Inizia dalla riga 7 (indice 6)
          const values = lines[i].split(',');
          const tonalita = values[0]; // Prima colonna = tonalità
          
          if (tonalita && tonalita.trim()) {
            csvDataMap[tonalita] = {};
            
            // Le prime colonne corrispondono alla riga 2 degli header
            for (let j = 1; j < headers1.length && j < values.length; j++) {
              const accordoType = headers1[j]?.trim();
              const note = values[j]?.trim();
              
              if (accordoType && note && note !== 'no') {
                csvDataMap[tonalita][accordoType] = note;
              }
            }
            
            // Se ci sono altre colonne, potrebbero essere dalla riga 3
            // Ma nel CSV che vedo, sembra che ogni riga abbia tutti i valori sulla stessa riga
            // Quindi continuo con gli header della riga 3
            let headerIndex = headers1.length;
            for (let j = 1; j < headers2.length; j++) { // Salta il primo elemento vuoto della riga 3
              const accordoType = headers2[j]?.trim();
              if (accordoType && headerIndex < values.length) {
                const note = values[headerIndex]?.trim();
                if (note && note !== 'no') {
                  csvDataMap[tonalita][accordoType] = note;
                }
                headerIndex++;
              }
            }
          }
        }
        
        setCsvData(csvDataMap);
        console.log('✅ CSV caricato con successo:', Object.keys(csvDataMap));
        console.log('🔍 Headers CSV (combinati):', allHeaders);
        console.log('🔍 Esempio Do:', csvDataMap['Do']);
        console.log('🔍 Totale headers trovati:', allHeaders.length);
        console.log('🔍 Headers CSV riga 2:', headers1);
        console.log('🔍 Headers CSV riga 3:', headers2);
        
      } catch (error) {
        console.error('❌ Errore caricamento CSV:', error);
        setCsvData(null);
      } finally {
        setCsvLoading(false);
      }
    };

    loadCSV();
  }, []);

  const handleChordClick = (chord, category, event) => {
    const y = event?.clientY || window.innerHeight / 2;
    setPopupPosition({ top: y });
    setSelectedChord({ ...chord, category });
  };

  // SISTEMA DI TRASPOSIZIONE CON CSV
  const transposeChord = (chord, targetRoot) => {
    // Cambia solo la sigla da C a quella corrispondente alla tonalità target
    const rootMap = {
      'Do': 'C', 'Do#': 'C#', 'Reb': 'Db', 'Re': 'D', 'Re#': 'D#', 'Mib': 'Eb', 'Mi': 'E',
      'Fa': 'F', 'Fa#': 'F#', 'Solb': 'Gb', 'Sol': 'G', 'Sol#': 'G#', 'Lab': 'Ab', 
      'La': 'A', 'La#': 'A#', 'Sib': 'Bb', 'Si': 'B'
    };
    
    const newSigla = chord.sigla.replace(/^C/, rootMap[targetRoot] || 'C');
    const newNome = chord.nome.replace(/Do/g, targetRoot);

    // CERCA LE NOTE NEL CSV
    let newNote = `prova a calcolarlo tu`; // Fallback
    
    if (csvData && csvData[targetRoot]) {
      // Mappa COMPLETA basata su tutti gli accordi esistenti nel CSV
      const csvTypeMap = {
        // TRIADI (dalla intestazione CSV)
        'C': 'Maggiore',
        'Cm': 'm',
        'Cdim': 'dim (°)',
        'Caug': 'aum (+)',
        'Csus2': 'sus 2',
        'Csus4': 'sus 4',
        
        // QUADRIADI (dalla intestazione CSV)
        'C6': '6',
        'Cm6': 'm6',
        'C7': '7 (di dominante)',
        'Cmaj7': 'maj7',
        'Cm7': 'm7',
        'Cm7♭5': 'm7b5 (semidim)',
        'Cdim7': '7dim',
        
        // ACCORDI AGGIUNTI (dalla intestazione CSV)
        'Cadd2': 'add 2',
        'Cadd4': 'add 4',
        'Cadd9': 'add 9',
        
        // ACCORDI ESTESI (che esistono nel nostro sistema)
        'C7♯5': '7 ♯5',            // Do settima quinta aumentata
        'C7♭5': '7 ♭5',            // Do settima quinta diminuita
        
        // ACCORDI ESTESI - RIGA 3 (dalla intestazione CSV)
        'C9': '9',
        'Cm9': 'm9',
        'Cmaj9': 'maj 9',
        'C11': '11',
        'Cm11': 'm 11',
        'C13': '13',
        'Cm13': 'm 13',
        // ACCORDI CHE NON ESISTONO nel CSV (usano formula)
        'Cmaj11': null,   // ❌ Non nel CSV
        'Cmaj13': null,   // ❌ Non nel CSV  
        'C7♯9': null,     // ❌ Non nel CSV
        'C7♭9': null,     // ❌ Non nel CSV
        'C7♯11': null,    // ❌ Non nel CSV
        'C7♭13': null     // ❌ Non nel CSV
      };

      const csvType = csvTypeMap[chord.sigla];
      if (csvType && csvData[targetRoot]) {
        // Prova prima il mapping esatto
        if (csvData[targetRoot][csvType]) {
          newNote = csvData[targetRoot][csvType];
          console.log(`✅ Trovato nel CSV: ${chord.sigla} -> ${targetRoot} -> ${csvType} = ${newNote}`);
        } else {
          // Prova varianti con spazi
          const csvTypeWithSpace = csvType + ' ';
          const csvTypeTrimmed = csvType.trim();
          
          if (csvData[targetRoot][csvTypeWithSpace]) {
            newNote = csvData[targetRoot][csvTypeWithSpace];
            console.log(`✅ Trovato nel CSV (con spazio): ${chord.sigla} -> ${targetRoot} -> "${csvTypeWithSpace}" = ${newNote}`);
          } else if (csvData[targetRoot][csvTypeTrimmed]) {
            newNote = csvData[targetRoot][csvTypeTrimmed];
            console.log(`✅ Trovato nel CSV (trimmed): ${chord.sigla} -> ${targetRoot} -> "${csvTypeTrimmed}" = ${newNote}`);
          } else {
            console.log(`❌ Non trovato nel CSV: ${chord.sigla} -> ${targetRoot} -> "${csvType}"`);
            console.log(`   Chiavi disponibili:`, Object.keys(csvData[targetRoot]));
          }
        }
      } else if (csvType === null) {
        // Accordo non mappato nel CSV, usa la formula
        newNote = `prova a calcolarlo tu`;
      } else {
        console.log(`❌ Non trovato nel CSV: ${chord.sigla} -> ${targetRoot} -> ${csvType}`);
      }
    }

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
            { sigla: 'Cm7', nome: 'Do minore settima', formula: '1 - ♭3 - 5 - ♭7', note: 'Do Mi♭ Sol Si♭', comune: true },
            { sigla: 'Cm7♭5', nome: 'Do semidiminuito', formula: '1 - ♭3 - ♭5 - ♭7', note: 'Do Mi♭ Sol♭ Si♭', comune: false },
            { sigla: 'Cdim7', nome: 'Do diminuito settima', formula: '1 - ♭3 - ♭5 - ♭♭7', note: 'Do Mi♭ Sol♭ La', comune: false }
          ]
        },
        sesta: {
          title: "Accordi di Sesta",
          chords: [
            { sigla: 'C6', nome: 'Do sesta', formula: '1 - 3 - 5 - 6', note: 'Do Mi Sol La', comune: true },
            { sigla: 'Cm6', nome: 'Do minore sesta', formula: '1 - ♭3 - 5 - 6', note: 'Do Mi♭ Sol La', comune: false }
          ]
        },
        add: {
          title: "Accordi Add",
          chords: [
            { sigla: 'Cadd9', nome: 'Do add nona', formula: '1 - 3 - 5 - 9', note: 'Do Mi Sol Re', comune: true },
            { sigla: 'Cadd2', nome: 'Do add seconda', formula: '1 - 2 - 3 - 5', note: 'Do Re Mi Sol', comune: false },
            { sigla: 'Cadd4', nome: 'Do add quarta', formula: '1 - 3 - 4 - 5', note: 'Do Mi Fa Sol', comune: false }
          ]
        }
      }
    },
    estesi: {
      title: "ACCORDI ESTESI (5+ Note)",
      color: "bg-purple-700",
      textColor: "text-purple-100",
      subsections: {
        noni: {
          title: "Accordi di Nona",
          chords: [
            { sigla: 'C9', nome: 'Do nona di dominante', formula: '1 - 3 - 5 - ♭7 - 9', note: 'Do Mi Sol Si♭ Re', comune: false },
            { sigla: 'Cmaj9', nome: 'Do nona maggiore', formula: '1 - 3 - 5 - 7 - 9', note: 'Do Mi Sol Si Re', comune: false },
            { sigla: 'Cm9', nome: 'Do minore nona', formula: '1 - ♭3 - 5 - ♭7 - 9', note: 'Do Mi♭ Sol Si♭ Re', comune: false },
            { sigla: 'C7♯9', nome: 'Do settima nona aumentata', formula: '1 - 3 - 5 - ♭7 - ♯9', note: 'Do Mi Sol Si♭ Re♯', comune: false },
            { sigla: 'C7♭9', nome: 'Do settima nona diminuita', formula: '1 - 3 - 5 - ♭7 - ♭9', note: 'Do Mi Sol Si♭ Re♭', comune: false }
          ]
        },
        undicesimi: {
          title: "Accordi di Undicesima",
          chords: [
            { sigla: 'C11', nome: 'Do undicesima', formula: '1 - 3 - 5 - ♭7 - 9 - 11', note: 'Do Mi Sol Si♭ Re Fa', comune: false },
            { sigla: 'Cmaj11', nome: 'Do undicesima maggiore', formula: '1 - 3 - 5 - 7 - 9 - 11', note: 'Do Mi Sol Si Re Fa', comune: false },
            { sigla: 'Cm11', nome: 'Do minore undicesima', formula: '1 - ♭3 - 5 - ♭7 - 9 - 11', note: 'Do Mi♭ Sol Si♭ Re Fa', comune: false },
            { sigla: 'C7♯11', nome: 'Do settima undicesima aumentata', formula: '1 - 3 - 5 - ♭7 - 9 - ♯11', note: 'Do Mi Sol Si♭ Re Fa♯', comune: false }
          ]
        },
        tredicesimi: {
          title: "Accordi di Tredicesima",
          chords: [
            { sigla: 'C13', nome: 'Do tredicesima', formula: '1 - 3 - 5 - ♭7 - 9 - 11 - 13', note: 'Do Mi Sol Si♭ Re Fa La', comune: false },
            { sigla: 'Cmaj13', nome: 'Do tredicesima maggiore', formula: '1 - 3 - 5 - 7 - 9 - 11 - 13', note: 'Do Mi Sol Si Re Fa La', comune: false },
            { sigla: 'Cm13', nome: 'Do minore tredicesima', formula: '1 - ♭3 - 5 - ♭7 - 9 - 11 - 13', note: 'Do Mi♭ Sol Si♭ Re Fa La', comune: false },
            { sigla: 'C7♭13', nome: 'Do settima tredicesima diminuita', formula: '1 - 3 - 5 - ♭7 - 9 - ♭13', note: 'Do Mi Sol Si♭ Re La♭', comune: false }
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
                  <option value="Do#">Do# (C#)</option>
                  <option value="Reb">Re♭ (D♭)</option>
                  <option value="Re">Re (D)</option>
                  <option value="Re#">Re# (D#)</option>
                  <option value="Mib">Mi♭ (E♭)</option>
                  <option value="Mi">Mi (E)</option>
                  <option value="Fa">Fa (F)</option>
                  <option value="Fa#">Fa# (F#)</option>
                  <option value="Solb">Sol♭ (G♭)</option>
                  <option value="Sol">Sol (G)</option>
                  <option value="Sol#">Sol# (G#)</option>
                  <option value="Lab">La♭ (A♭)</option>
                  <option value="La">La (A)</option>
                  <option value="La#">La# (A#)</option>
                  <option value="Sib">Si♭ (B♭)</option>
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