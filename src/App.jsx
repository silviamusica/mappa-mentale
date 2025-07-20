import React, { useState, useEffect, useRef } from 'react';
import { Music, Volume2, X, ChevronDown, ChevronRight } from 'lucide-react';

const ChordMindMap = () => {
  const [selectedChord, setSelectedChord] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({
    triadi: true,
    quadriadi: true,
    estesi: false
  });
  const [expandedSubsections, setExpandedSubsections] = useState({});
  const [showOnlyComuni, setShowOnlyComuni] = useState(false);

  const chordData = {
    triadi: {
      title: "TRIADI (3 Note)",
      color: "bg-blue-500",
      textColor: "text-blue-100",
      subsections: {
        base: {
          title: "Accordi Base",
          chords: [
            { sigla: 'C', nome: 'Maggiore', formula: '1 - 3 - 5', note: 'Do Mi Sol', comune: true },
            { sigla: 'Cm', nome: 'Minore', formula: '1 - ♭3 - 5', note: 'Do Mi♭ Sol', comune: true },
            { sigla: 'Caug', nome: 'Aumentato', formula: '1 - 3 - ♯5', note: 'Do Mi Sol♯', comune: false },
            { sigla: 'Cdim', nome: 'Diminuito', formula: '1 - ♭3 - ♭5', note: 'Do Mi♭ Sol♭', comune: false }
          ]
        },
        sus: {
          title: "Sospesi",
          chords: [
            { sigla: 'Csus2', nome: 'Seconda sospesa', formula: '1 - 2 - 5', note: 'Do Re Sol', comune: false },
            { sigla: 'Csus4', nome: 'Quarta sospesa', formula: '1 - 4 - 5', note: 'Do Fa Sol', comune: false }
          ]
        }
      }
    },
    quadriadi: {
      title: "QUADRIADI (4 Note)",
      color: "bg-green-500",
      textColor: "text-green-100",
      subsections: {
        seste: {
          title: "Seste",
          chords: [
            { sigla: 'C6', nome: 'Sesta', formula: '1 - 3 - 5 - 6', note: 'Do Mi Sol La', comune: true },
            { sigla: 'Cm6', nome: 'Minore sesta', formula: '1 - ♭3 - 5 - 6', note: 'Do Mi♭ Sol La', comune: false }
          ]
        },
        settime: {
          title: "Settime",
          chords: [
            { sigla: 'C7', nome: 'Settima di dominante', formula: '1 - 3 - 5 - ♭7', note: 'Do Mi Sol Si♭', comune: true },
            { sigla: 'Cmaj7', nome: 'Settima maggiore', formula: '1 - 3 - 5 - 7', note: 'Do Mi Sol Si', comune: true },
            { sigla: 'Cm7', nome: 'Minore settima', formula: '1 - ♭3 - 5 - ♭7', note: 'Do Mi♭ Sol Si♭', comune: true },
            { sigla: 'Cm7♭5', nome: 'Semidiminuito', formula: '1 - ♭3 - ♭5 - ♭7', note: 'Do Mi♭ Sol♭ Si♭', comune: false },
            { sigla: 'Cm(maj7)', nome: 'Minore settima maggiore', formula: '1 - ♭3 - 5 - 7', note: 'Do Mi♭ Sol Si', comune: false },
            { sigla: 'Cmaj7♯5', nome: 'Settima maggiore quinta aumentata', formula: '1 - 3 - ♯5 - 7', note: 'Do Mi Sol♯ Si', comune: false },
            { sigla: 'C7♯5', nome: 'Settima con quinta aumentata', formula: '1 - 3 - ♯5 - ♭7', note: 'Do Mi Sol♯ Si♭', comune: false },
            { sigla: 'C7♭5', nome: 'Settima con quinta diminuita', formula: '1 - 3 - ♭5 - ♭7', note: 'Do Mi Sol♭ Si♭', comune: false },
            { sigla: 'Cmaj7♭5', nome: 'Settima maggiore con quinta diminuita', formula: '1 - 3 - ♭5 - 7', note: 'Do Mi Sol♭ Si', comune: false },
            { sigla: 'Cdim(maj7)', nome: 'Diminuito settima maggiore', formula: '1 - ♭3 - ♭5 - 7', note: 'Do Mi♭ Sol♭ Si', comune: false }
          ]
        },
        sus: {
          title: "Settime Sospese",
          chords: [
            { sigla: 'C7sus4', nome: 'Settima con quarta sospesa', formula: '1 - 4 - 5 - ♭7', note: 'Do Fa Sol Si♭', comune: false }
          ]
        },
        add: {
          title: "Accordi Add",
          chords: [
            { sigla: 'Cadd9', nome: 'Maggiore con nona', formula: '1 - 3 - 5 - 9', note: 'Do Mi Sol Re', comune: true },
            { sigla: 'Cmadd9', nome: 'Minore con nona', formula: '1 - ♭3 - 5 - 9', note: 'Do Mi♭ Sol Re', comune: true },
            { sigla: 'Cadd2', nome: 'Maggiore add2', formula: '1 - 2 - 3 - 5', note: 'Do Re Mi Sol', comune: true },
            { sigla: 'Cmadd2', nome: 'Minore add2', formula: '1 - 2 - ♭3 - 5', note: 'Do Re Mi♭ Sol', comune: false },
            { sigla: 'Cadd4', nome: 'Maggiore add4', formula: '1 - 3 - 4 - 5', note: 'Do Mi Fa Sol', comune: false },
            { sigla: 'Cmadd4', nome: 'Minore add4', formula: '1 - ♭3 - 4 - 5', note: 'Do Mi♭ Fa Sol', comune: false }
          ]
        }
      }
    },
    estesi: {
      title: "ACCORDI ESTESI (5-7 Note)",
      color: "bg-purple-500",
      textColor: "text-purple-100",
      subsections: {
        none: {
          title: "None",
          chords: [
            { sigla: 'C9', nome: 'Nona di dominante', formula: '1 - 3 - 5 - ♭7 - 9', note: 'Do Mi Sol Si♭ Re', comune: true },
            { sigla: 'Cmaj9', nome: 'Nona maggiore', formula: '1 - 3 - 5 - 7 - 9', note: 'Do Mi Sol Si Re', comune: false },
            { sigla: 'Cm9', nome: 'Minore nona', formula: '1 - ♭3 - 5 - ♭7 - 9', note: 'Do Mi♭ Sol Si♭ Re', comune: false }
          ]
        },
        undicesime: {
          title: "Undicesime",
          chords: [
            { sigla: 'C11', nome: 'Undicesima (dominante)', formula: '1 - 3 - 5 - ♭7 - 9 - 11', note: 'Do Mi Sol Si♭ Re Fa', comune: false },
            { sigla: 'Cm11', nome: 'Undicesima minore', formula: '1 - ♭3 - 5 - ♭7 - 9 - 11', note: 'Do Mi♭ Sol Si♭ Re Fa', comune: false }
          ]
        },
        tredicesime: {
          title: "Tredicesime",
          chords: [
            { sigla: 'C13', nome: 'Tredicesima (dominante)', formula: '1 - 3 - 5 - ♭7 - 9 - 13', note: 'Do Mi Sol Si♭ Re La', comune: false },
            { sigla: 'Cmaj13', nome: 'Tredicesima maggiore', formula: '1 - 3 - 5 - 7 - 9 - 13', note: 'Do Mi Sol Si Re La', comune: false }
          ]
        },
        sus: {
          title: "Estesi Sospesi",
          chords: [
            { sigla: 'C13sus4', nome: 'Tredicesima sospesa', formula: '1 - 4 - 5 - ♭7 - 9 - 13', note: 'Do Fa Sol Si♭ Re La', comune: false }
          ]
        },
        alterati: {
          title: "Accordi Alterati",
          chords: [
            { sigla: 'C7♭9', nome: 'Settima con nona diminuita', formula: '1 - 3 - 5 - ♭7 - ♭9', note: 'Do Mi Sol Si♭ Re♭', comune: false },
            { sigla: 'C7♯9', nome: 'Settima con nona aumentata', formula: '1 - 3 - 5 - ♭7 - ♯9', note: 'Do Mi Sol Si♭ Re♯', comune: false },
            { sigla: 'C7♭9♯5', nome: 'Settima con nona dim. e quinta aum.', formula: '1 - 3 - ♯5 - ♭7 - ♭9', note: 'Do Mi Sol♯ Si♭ Re♭', comune: false },
            { sigla: 'C7♭13', nome: 'Settima con tredicesima diminuita', formula: '1 - 3 - 5 - ♭7 - ♭13', note: 'Do Mi Sol Si♭ La♭', comune: false }
          ]
        }
      }
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleSubsection = (categoryKey, subsectionKey) => {
    const key = `${categoryKey}-${subsectionKey}`;
    setExpandedSubsections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleChordClick = (chord, category) => {
    setSelectedChord({ ...chord, category });
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen text-white">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
          Mappa mentale accordi
        </h1>
        <div className="flex flex-col items-center">
          <span
            style={{
              fontFamily: 'Bodoni FLF, serif',
              fontWeight: 'bold',
              color: 'white',
              fontSize: '2.1rem',
              letterSpacing: '0.02em',
              marginBottom: '0.2rem',
            }}
          >
            <span
              style={{
                fontFamily: 'inherit',
                fontWeight: 'normal',
                color: 'white',
                fontStyle: 'normal',
              }}
            >
              sognando
            </span>
            <span
              style={{
                fontFamily: 'inherit',
                fontStyle: 'italic',
                color: 'red',
                fontWeight: 'normal',
              }}
            >
              il
            </span>
            <span
              style={{
                fontFamily: 'inherit',
                fontWeight: 'bold',
                color: 'white',
                fontStyle: 'normal',
              }}
            >
              piano
            </span>
          </span>
          <span
            style={{
              color: 'white',
              fontSize: '1.1rem',
              marginTop: '0.3rem',
              fontWeight: 'normal',
              fontFamily: 'sans-serif',
            }}
          >
            Memorizza facilmente creando dei cassetti
          </span>
        </div>
        <p className="text-gray-300 text-lg">clicca sugli accordi per esplorare i dettagli</p>
      </div>

      {/* Selettore accordi comuni/tutti */}
      <div className="flex justify-center mb-6">
        <label className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-lg text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={showOnlyComuni}
            onChange={e => setShowOnlyComuni(e.target.checked)}
            className="accent-yellow-400"
          />
          Mostra solo accordi comuni
        </label>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Mind Map */}
        <div className="flex-1 space-y-6">
          {Object.entries(chordData).map(([categoryKey, category]) => (
            <div key={categoryKey} className="bg-gray-800 rounded-xl p-6 shadow-lg">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(categoryKey)}
                className={`w-full flex items-center justify-between p-4 rounded-lg ${category.color} ${category.textColor} font-bold text-lg mb-4 hover:opacity-90 transition-opacity`}
              >
                <span>{category.title}</span>
                {expandedCategories[categoryKey] ? <ChevronDown /> : <ChevronRight />}
              </button>

              {/* Subsections */}
              {expandedCategories[categoryKey] && (
                <div className="space-y-4">
                  {Object.entries(category.subsections)
                    .filter(([_, subsection]) => {
                      if (!showOnlyComuni) return true;
                      return subsection.chords.some(chord => chord.comune);
                    })
                    .map(([subsectionKey, subsection]) => {
                      const subsectionExpandKey = `${categoryKey}-${subsectionKey}`;
                      const isSubsectionExpanded = expandedSubsections[subsectionExpandKey];
                      return (
                        <div key={subsectionKey} className="bg-gray-700 rounded-lg p-4">
                          {/* Subsection Header */}
                          <button
                            onClick={() => toggleSubsection(categoryKey, subsectionKey)}
                            className="w-full flex items-center justify-between p-2 rounded bg-gray-600 text-gray-200 hover:bg-gray-500 transition-colors mb-3"
                          >
                            <span className="font-semibold text-sm">{subsection.title}</span>
                            {isSubsectionExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>

                          {/* Chords Grid */}
                          {isSubsectionExpanded && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                              {subsection.chords
                                .filter(chord => !showOnlyComuni || chord.comune)
                                .map((chord, index) => (
                                  <button
                                    key={index}
                                    onClick={() => handleChordClick(chord, categoryKey)}
                                    className={`p-2 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                                      chord.comune 
                                        ? 'bg-yellow-100 border-yellow-400 text-gray-900 font-bold' 
                                        : 'bg-gray-600 border-gray-500 text-gray-200 hover:border-gray-400'
                                    } ${selectedChord?.sigla === chord.sigla ? 'ring-2 ring-blue-400' : ''}`}
                                  >
                                    <div className="text-center">
                                      <div className="font-mono text-sm mb-1">{chord.sigla}</div>
                                      <div className="text-xs opacity-80 leading-tight">{chord.nome}</div>
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
          ))}
        </div>

        {/* Detail Panel */}
        {selectedChord && (
          <div className="w-80 bg-gray-800 rounded-xl p-6 shadow-lg sticky top-6 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-yellow-400">Dettagli Accordo</h3>
              <button
                onClick={() => setSelectedChord(null)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-mono font-bold text-white mb-2">
                  {selectedChord.sigla}
                </div>
                <div className="text-lg text-gray-300">
                  {selectedChord.nome}
                </div>
                {selectedChord.comune && (
                  <div className="inline-block bg-yellow-400 text-gray-900 px-2 py-1 rounded text-sm font-bold mt-2">
                    COMUNE
                  </div>
                )}
              </div>

              <div className="border-t border-gray-600 pt-4">
                <div className="mb-3">
                  <h4 className="font-semibold text-blue-400 mb-1">Formula:</h4>
                  <div className="font-mono text-lg bg-gray-700 p-2 rounded">
                    {selectedChord.formula}
                  </div>
                </div>

                <div className="mb-3">
                  <h4 className="font-semibold text-green-400 mb-1">Note (in Do):</h4>
                  <div className="font-mono text-lg bg-gray-700 p-2 rounded">
                    {selectedChord.note}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-purple-400 mb-1">Categoria:</h4>
                  <div className="text-sm bg-gray-700 p-2 rounded capitalize">
                    {chordData[selectedChord.category]?.title}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-400 pt-4 border-t border-gray-600">
                <Volume2 size={16} />
                <span>Clicca su altri accordi per esplorare</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-8 bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 text-center">Legenda</h3>
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 rounded"></div>
            <span>Accordi comuni</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-600 rounded"></div>
            <span>Accordi avanzati</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Triadi (3 note)</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Quadriadi (4 note)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span>Accordi estesi (5-7 note)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChordMindMap;
