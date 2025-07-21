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
      color: "bg-cyan-900",
      textColor: "text-cyan-100",
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
      color: "bg-cyan-900",
      textColor: "text-cyan-100",
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
      color: "bg-cyan-900",
      textColor: "text-cyan-100",
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

  // Sticky come versione precedente

  return (
    <div
      className="w-full max-w-7xl mx-auto p-6 min-h-screen text-white"
      style={{
        backgroundColor: '#0a1833',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='1600' height='1000' xmlns='http://www.w3.org/2000/svg'%3E%3Cg%3E%3Ccircle cx='154' cy='987' r='0.6' fill='white' opacity='0.7'/%3E%3Ccircle cx='1202' cy='234' r='0.4' fill='white' opacity='0.5'/%3E%3Ccircle cx='1456' cy='876' r='0.5' fill='white' opacity='0.8'/%3E%3Ccircle cx='321' cy='123' r='0.3' fill='white' opacity='0.6'/%3E%3Ccircle cx='789' cy='654' r='0.7' fill='white' opacity='0.7'/%3E%3Ccircle cx='100' cy='900' r='0.5' fill='white' opacity='0.5'/%3E%3Ccircle cx='1300' cy='200' r='0.6' fill='white' opacity='0.8'/%3E%3Ccircle cx='1500' cy='800' r='0.4' fill='white' opacity='0.6'/%3E%3Ccircle cx='170' cy='180' r='0.7' fill='white' opacity='0.7'/%3E%3Ccircle cx='190' cy='200' r='0.5' fill='white' opacity='0.5'/%3E%3Ccircle cx='210' cy='220' r='0.6' fill='white' opacity='0.8'/%3E%3Ccircle cx='230' cy='240' r='0.4' fill='white' opacity='0.6'/%3E%3Ccircle cx='250' cy='260' r='0.7' fill='white' opacity='0.7'/%3E%3Ccircle cx='270' cy='280' r='0.5' fill='white' opacity='0.5'/%3E%3Ccircle cx='290' cy='300' r='0.6' fill='white' opacity='0.8'/%3E%3Ccircle cx='310' cy='320' r='0.4' fill='white' opacity='0.6'/%3E%3Ccircle cx='330' cy='340' r='0.7' fill='white' opacity='0.7'/%3E%3Ccircle cx='350' cy='360' r='0.5' fill='white' opacity='0.5'/%3E%3Ccircle cx='370' cy='380' r='0.6' fill='white' opacity='0.8'/%3E%3Ccircle cx='390' cy='400' r='0.4' fill='white' opacity='0.6'/%3E%3Ccircle cx='410' cy='420' r='0.7' fill='white' opacity='0.7'/%3E%3Ccircle cx='430' cy='440' r='0.5' fill='white' opacity='0.5'/%3E%3Ccircle cx='450' cy='460' r='0.6' fill='white' opacity='0.8'/%3E%3Ccircle cx='470' cy='480' r='0.4' fill='white' opacity='0.6'/%3E%3Ccircle cx='490' cy='500' r='0.7' fill='white' opacity='0.7'/%3E%3Ccircle cx='510' cy='520' r='0.5' fill='white' opacity='0.5'/%3E%3Ccircle cx='530' cy='540' r='0.6' fill='white' opacity='0.8'/%3E%3Ccircle cx='550' cy='560' r='0.4' fill='white' opacity='0.6'/%3E%3Ccircle cx='570' cy='580' r='0.7' fill='white' opacity='0.7'/%3E%3Ccircle cx='590' cy='600' r='0.5' fill='white' opacity='0.5'/%3E%3Ccircle cx='610' cy='620' r='0.6' fill='white' opacity='0.8'/%3E%3Ccircle cx='630' cy='640' r='0.4' fill='white' opacity='0.6'/%3E%3Ccircle cx='650' cy='660' r='0.7' fill='white' opacity='0.7'/%3E%3Ccircle cx='670' cy='680' r='0.5' fill='white' opacity='0.5'/%3E%3Ccircle cx='690' cy='700' r='0.6' fill='white' opacity='0.8'/%3E%3Ccircle cx='710' cy='720' r='0.4' fill='white' opacity='0.6'/%3E%3Ccircle cx='730' cy='740' r='0.7' fill='white' opacity='0.7'/%3E%3Ccircle cx='750' cy='760' r='0.5' fill='white' opacity='0.5'/%3E%3Ccircle cx='770' cy='780' r='0.6' fill='white' opacity='0.8'/%3E%3Ccircle cx='790' cy='800' r='0.4' fill='white' opacity='0.6'/%3E%3Ccircle cx='810' cy='820' r='0.7' fill='white' opacity='0.7'/%3E%3Ccircle cx='830' cy='840' r='0.5' fill='white' opacity='0.5'/%3E%3Ccircle cx='850' cy='860' r='0.6' fill='white' opacity='0.8'/%3E%3Ccircle cx='870' cy='880' r='0.4' fill='white' opacity='0.6'/%3E%3Ccircle cx='890' cy='900' r='0.7' fill='white' opacity='0.7'/%3E%3Ccircle cx='910' cy='920' r='0.5' fill='white' opacity='0.5'/%3E%3Ccircle cx='930' cy='940' r='0.6' fill='white' opacity='0.8'/%3E%3Ccircle cx='950' cy='960' r='0.4' fill='white' opacity='0.6'/%3E%3Ccircle cx='970' cy='980' r='0.7' fill='white' opacity='0.7'/%3E%3Ccircle cx='990' cy='1000' r='0.5' fill='white' opacity='0.5'/%3E%3Ccircle cx='1010' cy='1020' r='0.6' fill='white' opacity='0.8'/%3E%3Ccircle cx='1030' cy='1040' r='0.4' fill='white' opacity='0.6'/%3E%3Ccircle cx='1050' cy='1060' r='0.7' fill='white' opacity='0.7'/%3E%3Ccircle cx='1070' cy='1080' r='0.5' fill='white' opacity='0.5'/%3E%3Ccircle cx='1090' cy='1100' r='0.6' fill='white' opacity='0.8'/%3E%3Ccircle cx='1110' cy='1120' r='0.4' fill='white' opacity='0.6'/%3E%3Ccircle cx='1130' cy='1140' r='0.7' fill='white' opacity='0.7'/%3E%3Ccircle cx='1150' cy='1160' r='0.5' fill='white' opacity='0.5'/%3E%3Ccircle cx='1170' cy='1180' r='0.6' fill='white' opacity='0.8'/%3E%3Ccircle cx='1190' cy='1200' r='0.4' fill='white' opacity='0.6'/%3E%3Ccircle cx='1210' cy='1220' r='0.7' fill='white' opacity='0.7'/%3E%3Ccircle cx='1230' cy='1240' r='0.5' fill='white' opacity='0.5'/%3E%3Ccircle cx='1250' cy='1260' r='0.6' fill='white' opacity='0.8'/%3E%3Ccircle cx='1270' cy='1280' r='0.4' fill='white' opacity='0.6'/%3E%3Ccircle cx='1290' cy='1300' r='0.7' fill='white' opacity='0.7'/%3E%3Ccircle cx='1310' cy='1320' r='0.5' fill='white' opacity='0.5'/%3E%3Ccircle cx='1330' cy='1340' r='0.6' fill='white' opacity='0.8'/%3E%3Ccircle cx='1350' cy='1360' r='0.4' fill='white' opacity='0.6'/%3E%3Ccircle cx='1370' cy='1380' r='0.7' fill='white' opacity='0.7'/%3E%3Ccircle cx='1390' cy='1400' r='0.5' fill='white' opacity='0.5'/%3E%3Ccircle cx='1410' cy='1420' r='0.6' fill='white' opacity='0.8'/%3E%3Ccircle cx='1430' cy='1440' r='0.4' fill='white' opacity='0.6'/%3E%3Ccircle cx='1450' cy='1460' r='0.7' fill='white' opacity='0.7'/%3E%3Ccircle cx='1470' cy='1480' r='0.5' fill='white' opacity='0.5'/%3E%3Ccircle cx='1490' cy='1500' r='0.6' fill='white' opacity='0.8'/%3E%3Ccircle cx='1510' cy='1520' r='0.4' fill='white' opacity='0.6'/%3E%3Ccircle cx='1530' cy='1540' r='0.7' fill='white' opacity='0.7'/%3E%3Ccircle cx='1550' cy='1560' r='0.5' fill='white' opacity='0.5'/%3E%3Ccircle cx='1570' cy='1580' r='0.6' fill='white' opacity='0.8'/%3E%3Ccircle cx='1590' cy='1600' r='0.4' fill='white' opacity='0.6'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: 'cover',
      }}
    >
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
          <label className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-lg text-sm cursor-pointer mt-4">
            <input
              type="checkbox"
              checked={showOnlyComuni}
              onChange={e => setShowOnlyComuni(e.target.checked)}
              className="accent-yellow-400"
            />
            Mostra solo accordi comuni
          </label>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex gap-10">
        {/* Mind Map */}
        <div className="flex-1 space-y-8">
          {Object.entries(chordData).map(([categoryKey, category]) => (
            <div
              key={categoryKey}
              className="bg-gray-900 rounded-2xl p-8 shadow-sm"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(categoryKey)}
                className={`w-full flex items-center justify-between p-4 rounded-xl font-semibold text-lg mb-6 shadow-none hover:opacity-95 transition-opacity border-none`}
                style={{
                  background:
                    categoryKey === 'triadi' ? '#4a6fa5'
                    : categoryKey === 'quadriadi' ? '#5fb9b0'
                    : categoryKey === 'estesi' ? '#b7a7e9'
                    : '#3399cc',
                  color: '#fff',
                  boxShadow: 'none',
                  border: 'none',
                  letterSpacing: '0.03em',
                }}
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
                        <div key={subsectionKey} className="bg-gray-800 rounded-xl p-5 mb-4 ml-3 md:ml-6">
                          {/* Subsection Header */}
                          <button
                            onClick={() => toggleSubsection(categoryKey, subsectionKey)}
                            className="w-full flex items-center justify-between p-2 rounded-lg bg-gray-700 text-gray-100 hover:bg-gray-600 transition-colors mb-2 border-none shadow-none"
                            style={{boxShadow: 'none'}}
                          >
                            <span className="font-medium text-sm tracking-wide">{subsection.title}</span>
                            {isSubsectionExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>

                          {/* Chords Grid */}
                          {isSubsectionExpanded && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {subsection.chords
                                .filter(chord => !showOnlyComuni || chord.comune)
                                .map((chord, index) => (
                                  <button
                                    key={index}
                                    onClick={() => handleChordClick(chord, categoryKey)}
                                    className={`p-3 rounded-xl border transition-all duration-200 hover:bg-cyan-900/30 hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-base font-mono ${
                                      chord.comune 
                                        ? 'border-yellow-400 text-yellow-100 bg-cyan-900/10 font-semibold' 
                                        : 'border-gray-600 text-gray-200 bg-gray-900/10'
                                    } ${selectedChord?.sigla === chord.sigla ? 'ring-2 ring-cyan-400' : ''}`}
                                    style={{boxShadow: 'none'}}
                                  >
                                    <div className="text-center">
                                      <div className="font-mono text-base mb-1 tracking-wide">{chord.sigla}</div>
                                      <div className="text-xs opacity-80 leading-tight font-sans">{chord.nome}</div>
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
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black bg-opacity-60 z-40 animate-fadein"
              onClick={() => setSelectedChord(null)}
            ></div>
            {/* Modal Popup */}
            <div className="fixed inset-0 z-50 flex items-center justify-center px-2 py-8">
              <div
                className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl bg-gray-900 rounded-2xl p-4 sm:p-6 md:p-7 shadow-lg max-h-[80vh] overflow-y-auto relative"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-cyan-300 tracking-wide">Dettagli accordo</h3>
                  <button
                    onClick={() => setSelectedChord(null)}
                    className="text-gray-400 hover:text-cyan-200 transition-colors"
                    aria-label="Chiudi dettagli"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="text-center mb-2">
                    <div className="text-2xl font-mono font-bold text-cyan-100 mb-1 tracking-wide">
                      {selectedChord.sigla}
                    </div>
                    <div className="text-base text-gray-300 mb-1">
                      {selectedChord.nome}
                    </div>
                    {selectedChord.comune && (
                      <div className="inline-block bg-yellow-400 text-gray-900 px-2 py-1 rounded text-xs font-bold mt-1">
                        comune
                      </div>
                    )}
                  </div>
                  <div className="border-t border-cyan-900 pt-4">
                    <div className="mb-2">
                      <h4 className="font-semibold text-cyan-400 mb-1 text-xs uppercase tracking-wide">Formula</h4>
                      <div className="font-mono text-base bg-gray-800 p-2 rounded-lg text-cyan-100">
                        {selectedChord.formula}
                      </div>
                    </div>
                    <div className="mb-2">
                      <h4 className="font-semibold text-cyan-400 mb-1 text-xs uppercase tracking-wide">Note (in Do)</h4>
                      <div className="font-mono text-base bg-gray-800 p-2 rounded-lg text-cyan-100">
                        {selectedChord.note}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-cyan-400 mb-1 text-xs uppercase tracking-wide">Categoria</h4>
                      <div className="text-xs bg-gray-800 p-2 rounded-lg capitalize text-cyan-100">
                        {chordData[selectedChord.category]?.title}
                      </div>
                    </div>
                  </div>
                  {/* ...nessun messaggio aggiuntivo... */}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Legend */}
      <div className="mt-10 bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-base font-semibold mb-4 text-center text-cyan-300 tracking-wide">Legenda</h3>
        <div className="flex flex-wrap justify-center gap-5 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded"></div>
            <span className="text-yellow-100">Accordi comuni</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-600 rounded"></div>
            <span className="text-gray-300">Accordi avanzati</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-900 rounded"></div>
            <span className="text-cyan-100">Triadi</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-900 rounded"></div>
            <span className="text-cyan-100">Quadriadi</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-900 rounded"></div>
            <span className="text-cyan-100">Estesi</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChordMindMap;
