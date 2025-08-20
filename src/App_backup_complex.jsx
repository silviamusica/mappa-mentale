import React, { useState, useEffect, useRef } from 'react';
import { Music, Volume2, X, ChevronDown, ChevronRight } from 'lucide-react';

// Parser CSV per caricare dinamicamente tutti gli accordi
const parseCSVChordData = (csvText) => {
  const lines = csvText.trim().split('\n');
  const headers = lines[2].split(','); // Riga con le sigle degli accordi
  const formulas = lines[4].split(','); // Riga con le formule
  
  // Mapping delle tonalità con i loro nomi
  const tonalita = {
    'Do': 7, 'Do#': 8, 'Reb': 9, 'Re': 10, 'Re#': 11, 'Mib': 12,
    'Mi': 13, 'Fa': 14, 'Fa#': 15, 'Solb': 16, 'Sol': 17, 'Sol#': 18,
    'Lab': 19, 'La': 20, 'La#': 21, 'Sib': 22, 'Si': 23
  };

  const chordMappings = {};

  // Per ogni tonalità, crea il mapping completo
  Object.entries(tonalita).forEach(([nome, riga]) => {
    const noteRow = lines[riga-1]; // Le righe del CSV sono 0-indexed
    if (!noteRow) return;
    
    const notes = noteRow.split(',');
    const mapping = {};

    headers.forEach((header, index) => {
      if (index === 0 || !header.trim()) return; // Salta la prima colonna (fondamentale)
      
      const nota = notes[index];
      if (!nota || nota.trim() === 'no' || nota.trim() === '') return;

      // Crea il mapping da C* a tonalità*
      const originalChord = header.trim();
      const newSigla = originalChord.replace(/^C/, nome);
      const formula = formulas[index] || '';
      
      mapping[originalChord] = {
        sigla: newSigla,
        nome: `${nome} ${getChordName(originalChord)}`,
        formula: formula.trim(),
        note: nota.trim(),
        comune: isCommonChord(originalChord)
      };
    });

    chordMappings[nome] = mapping;
  });

  return chordMappings;
};

// Helper functions
const getChordName = (chord) => {
  const names = {
    'C': 'maggiore', 'Cm': 'minore', 'Cdim': 'diminuito', 'Caug': 'aumentato',
    'Csus2': 'seconda sospesa', 'Csus4': 'quarta sospesa', 'C6': 'sesta',
    'Cm6': 'minore sesta', 'C7': 'settima di dominante', 'Cmaj7': 'settima maggiore',
    'Cm7': 'minore settima', 'Cm7♭5': 'semidiminuito', 'Cm(maj7)': 'minore settima maggiore',
    'Cmaj7♯5': 'settima maggiore quinta aumentata', 'C7♯5': 'settima con quinta aumentata',
    'C7♭5': 'settima con quinta diminuita', 'Cmaj7♭5': 'settima maggiore con quinta diminuita',
    'Cdim(maj7)': 'diminuito settima maggiore', 'C7sus4': 'settima con quarta sospesa',
    'Cadd2': 'maggiore add2', 'Cmadd2': 'minore add2', 'Cadd4': 'maggiore add4',
    'Cmadd4': 'minore add4', 'Cadd9': 'maggiore con nona', 'Cmadd9': 'minore con nona',
    'C9': 'nona di dominante', 'Cm9': 'minore nona', 'Cmaj9': 'nona maggiore',
    'C11': 'undicesima', 'Cm11': 'undicesima minore', 'C13': 'tredicesima',
    'Cmaj13': 'tredicesima maggiore', 'Cm13': 'tredicesima minore', 'C13sus4': 'tredicesima sospesa',
    'C7♭9': 'settima con nona diminuita', 'C7♯9': 'settima con nona aumentata',
    'C7♭9♯5': 'settima con nona dim. e quinta aum.', 'C7♭13': 'settima con tredicesima diminuita'
  };
  return names[chord] || chord.replace('C', '').toLowerCase();
};

const isCommonChord = (chord) => {
  const common = ['C', 'Cm', 'C6', 'C7', 'Cmaj7', 'Cm7', 'Cadd2', 'Cadd9', 'Cmadd9', 'C9'];
  return common.includes(chord);
};

const getEnglishNote = (italianNote) => {
  const mapping = {
    'Do': 'C', 'Do#': 'C#', 'Reb': 'Db', 'Re': 'D', 'Re#': 'D#', 'Mib': 'Eb',
    'Mi': 'E', 'Fa': 'F', 'Fa#': 'F#', 'Solb': 'Gb', 'Sol': 'G', 'Sol#': 'G#',
    'Lab': 'Ab', 'La': 'A', 'La#': 'A#', 'Sib': 'Bb', 'Si': 'B'
  };
  return mapping[italianNote] || italianNote;
};

const ChordMindMap = () => {
  // Modalità: miniaiutara o altro
  const [modalita] = useState('miniaiutara');
  const [selectedChord, setSelectedChord] = useState(null);
  const [popupPosition, setPopupPosition] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({
    triadi: true,
    quadriadi: true,
    estesi: false
  });
  const [expandedSubsections, setExpandedSubsections] = useState({});
  const [viewMode, setViewMode] = useState('accordi_comuni'); // 'accordi_comuni', 'accordi_avanzati', 'mappa_generale'
  const [selectedRoot, setSelectedRoot] = useState('Do'); // Fondamentale selezionata
  // Nessun CSV - solo trasposizione manuale semplice
  const [expandedMappa, setExpandedMappa] = useState({
    triadi: true,
    quadriadi: false,
    estesi: false
  });

  const toggleMappaCategory = (cat) => {
    setExpandedMappa(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Nessun caricamento CSV - tutto semplice e manuale

  // Mappatura completa degli accordi per Mi basata sul CSV
  const getEChordMapping = () => ({
    // TRIADI (colonne 2-7)
    'C': { sigla: 'E', nome: 'Mi maggiore', formula: '1 - 3 - 5', note: 'Mi Sol# Si', comune: true },
    'Cm': { sigla: 'Em', nome: 'Mi minore', formula: '1 - ♭3 - 5', note: 'Mi Sol Si', comune: true },
    'Cdim': { sigla: 'Edim', nome: 'Mi diminuito', formula: '1 - ♭3 - ♭5', note: 'Mi Sol Sib', comune: false },
    'Caug': { sigla: 'Eaug', nome: 'Mi aumentato', formula: '1 - 3 - ♯5', note: 'Mi Sol# Do', comune: false },
    'Csus2': { sigla: 'Esus2', nome: 'Mi seconda sospesa', formula: '1 - 2 - 5', note: 'Mi Fa# Si', comune: false },
    'Csus4': { sigla: 'Esus4', nome: 'Mi quarta sospesa', formula: '1 - 4 - 5', note: 'Mi La Si', comune: false },
    
    // QUADRIADI (colonne 8-21)
    'C6': { sigla: 'E6', nome: 'Mi sesta', formula: '1 - 3 - 5 - 6', note: 'Mi Sol# Si Do#', comune: true },
    'Cm6': { sigla: 'Em6', nome: 'Mi minore sesta', formula: '1 - ♭3 - 5 - 6', note: 'Mi Sol Si Do#', comune: false },
    'C7': { sigla: 'E7', nome: 'Mi settima di dominante', formula: '1 - 3 - 5 - ♭7', note: 'Mi Sol# Si Re', comune: true },
    'Cmaj7': { sigla: 'Emaj7', nome: 'Mi settima maggiore', formula: '1 - 3 - 5 - 7', note: 'Mi Sol# Si Re#', comune: true },
    'Cm7': { sigla: 'Em7', nome: 'Mi minore settima', formula: '1 - ♭3 - 5 - ♭7', note: 'Mi Sol Si Re', comune: true },
    'Cm7♭5': { sigla: 'Em7♭5', nome: 'Mi semidiminuito', formula: '1 - ♭3 - ♭5 - ♭7', note: 'Mi Sol Sib Re', comune: false },
    'Cm(maj7)': { sigla: 'Em(maj7)', nome: 'Mi minore settima maggiore', formula: '1 - ♭3 - 5 - 7', note: 'Mi Sol Si Re#', comune: false },
    'Cmaj7♯5': { sigla: 'Emaj7♯5', nome: 'Mi settima maggiore quinta aumentata', formula: '1 - 3 - ♯5 - 7', note: 'Mi Sol# Si# Re#', comune: false },
    'C7♯5': { sigla: 'E7♯5', nome: 'Mi settima con quinta aumentata', formula: '1 - 3 - ♯5 - ♭7', note: 'Mi Sol# Si# Re', comune: false },
    'C7♭5': { sigla: 'E7♭5', nome: 'Mi settima con quinta diminuita', formula: '1 - 3 - ♭5 - ♭7', note: 'Mi Sol# Sib Re', comune: false },
    'Cmaj7♭5': { sigla: 'Emaj7♭5', nome: 'Mi settima maggiore con quinta diminuita', formula: '1 - 3 - ♭5 - 7', note: 'Mi Sol# Sib Re#', comune: false },
    'Cdim(maj7)': { sigla: 'Edim(maj7)', nome: 'Mi diminuito settima maggiore', formula: '1 - ♭3 - ♭5 - 7', note: 'Mi Sol Sib Re#', comune: false },
    'C7sus4': { sigla: 'E7sus4', nome: 'Mi settima con quarta sospesa', formula: '1 - 4 - 5 - ♭7', note: 'Mi La Si Re', comune: false },
    
    // ADD CHORDS (colonne 22-27)
    'Cadd2': { sigla: 'Eadd2', nome: 'Mi maggiore add2', formula: '1 - 2 - 3 - 5', note: 'Mi Fa# Sol# Si', comune: true },
    'Cmadd2': { sigla: 'Emadd2', nome: 'Mi minore add2', formula: '1 - 2 - ♭3 - 5', note: 'Mi Fa# Sol Si', comune: false },
    'Cadd4': { sigla: 'Eadd4', nome: 'Mi maggiore add4', formula: '1 - 3 - 4 - 5', note: 'Mi Sol# La Si', comune: false },
    'Cmadd4': { sigla: 'Emadd4', nome: 'Mi minore add4', formula: '1 - ♭3 - 4 - 5', note: 'Mi Sol La Si', comune: false },
    'Cadd9': { sigla: 'Eadd9', nome: 'Mi maggiore con nona', formula: '1 - 3 - 5 - 9', note: 'Mi Sol# Si Fa#', comune: true },
    'Cmadd9': { sigla: 'Emadd9', nome: 'Mi minore con nona', formula: '1 - ♭3 - 5 - 9', note: 'Mi Sol Si Fa#', comune: true },
    
    // ACCORDI ESTESI (colonne 28-35)
    'C9': { sigla: 'E9', nome: 'Mi nona di dominante', formula: '1 - 3 - 5 - ♭7 - 9', note: 'Mi Sol# Si Re Fa#', comune: true },
    'Cm9': { sigla: 'Em9', nome: 'Mi minore nona', formula: '1 - ♭3 - 5 - ♭7 - 9', note: 'Mi Sol Si Re Fa#', comune: false },
    'Cmaj9': { sigla: 'Emaj9', nome: 'Mi nona maggiore', formula: '1 - 3 - 5 - 7 - 9', note: 'Mi Sol# Si Re# Fa#', comune: false },
    'C11': { sigla: 'E11', nome: 'Mi undicesima', formula: '1 - 3 - 5 - ♭7 - 9 - 11', note: 'Mi Sol# Si Re Fa# La', comune: false },
    'Cm11': { sigla: 'Em11', nome: 'Mi undicesima minore', formula: '1 - ♭3 - 5 - ♭7 - 9 - 11', note: 'Mi Sol Si Re Fa# Do#', comune: false },
    'C13': { sigla: 'E13', nome: 'Mi tredicesima', formula: '1 - 3 - 5 - ♭7 - 9 - 13', note: 'Mi Sol# Si Re Fa# Do#', comune: false },
    'Cmaj13': { sigla: 'Emaj13', nome: 'Mi tredicesima maggiore', formula: '1 - 3 - 5 - 7 - 9 - 13', note: 'Mi Sol# Si Re# Fa# Do#', comune: false },
    'Cm13': { sigla: 'Em13', nome: 'Mi tredicesima minore', formula: '1 - ♭3 - 5 - ♭7 - 9 - 13', note: 'Mi Sol# Si Re# Fa# Do#', comune: false },
    'C13sus4': { sigla: 'E13sus4', nome: 'Mi tredicesima sospesa', formula: '1 - 4 - 5 - ♭7 - 9 - 13', note: 'Mi La Si Re Fa# Do#', comune: false },
    
    // ACCORDI ALTERATI (non nel CSV base, ma seguono la logica di trasposizione)
    'C7♭9': { sigla: 'E7♭9', nome: 'Mi settima con nona diminuita', formula: '1 - 3 - 5 - ♭7 - ♭9', note: 'Mi Sol# Si Re Fa', comune: false },
    'C7♯9': { sigla: 'E7♯9', nome: 'Mi settima con nona aumentata', formula: '1 - 3 - 5 - ♭7 - ♯9', note: 'Mi Sol# Si Re Fa##', comune: false },
    'C7♭9♯5': { sigla: 'E7♭9♯5', nome: 'Mi settima con nona dim. e quinta aum.', formula: '1 - 3 - ♯5 - ♭7 - ♭9', note: 'Mi Sol# Si# Re Fa', comune: false },
    'C7♭13': { sigla: 'E7♭13', nome: 'Mi settima con tredicesima diminuita', formula: '1 - 3 - 5 - ♭7 - ♭13', note: 'Mi Sol# Si Re Do', comune: false }
  });

  // Mappatura di base per trasposizione semplice (senza CSV)
  const getBasicTransposition = (tonalita) => {
    const intervalli = {
      'Do': 0, 'Re': 2, 'Mi': 4, 'Fa': 5, 'Sol': 7, 'La': 9, 'Si': 11
    };
    
    const noteCircle = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
    const intervallo = intervalli[tonalita] || 0;
    
    const transposeNote = (notaOriginale) => {
      const baseNote = notaOriginale.replace(/[#b♯♭]/g, '');
      const accidentali = notaOriginale.slice(baseNote.length);
      const originalIndex = noteCircle.indexOf(baseNote);
      if (originalIndex === -1) return notaOriginale;
      const newIndex = (originalIndex + intervallo) % 12;
      return noteCircle[newIndex] + accidentali;
    };

    return (chord) => ({
      ...chord,
      sigla: transposeNote(chord.sigla),
      nome: chord.nome.replace(/Do\s/g, `${tonalita} `).replace(/^Do([^a-zA-Z])/g, `${tonalita}$1`),
      note: chord.note ? chord.note.split(' ').map(transposeNote).join(' ') : chord.note
    });
  };

  // Funzione per ottenere accordi specifici basati sulla tonalità selezionata
  const getTonalidyChords = (originalChords) => {
    if (selectedRoot === 'Do' || csvLoading) {
      return originalChords; // Mostra accordi originali per Do o durante il caricamento
    }

    // Usa i mapping del CSV se disponibili
    const mapping = csvMappings[selectedRoot];
    if (mapping) {
      return originalChords.map(chord => {
        return mapping[chord.sigla] || chord;
      });
    }

    // Fallback al mapping hardcoded per Mi se il CSV non è disponibile
    if (selectedRoot === 'Mi') {
      const eMapping = getEChordMapping();
      return originalChords.map(chord => {
        return eMapping[chord.sigla] || chord;
      });
    }

    // Fallback di base per altre tonalità usando trasposizione semplice
    const transposeChord = getBasicTransposition(selectedRoot);
    return originalChords.map(transposeChord);
  };

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

  const handleChordClick = (chord, category, event) => {
    // Prendi la posizione Y del click rispetto alla viewport
    const y = event?.clientY || window.innerHeight / 2;
    setPopupPosition({ top: y });
    setSelectedChord({ ...chord, category });
  };

  // Funzione per ottenere l'accordo originale da quello attualmente selezionato
  const getOriginalChord = (transposedChord) => {
    if (!transposedChord) return null;
    
    // Se siamo in Do, l'accordo è già quello originale
    if (selectedRoot === 'Do' || csvLoading) {
      return transposedChord;
    }

    // Altrimenti, dobbiamo trovare l'accordo originale dalle strutture di chordData
    // Cerchiamo in tutti i chord arrays
    const allChords = [
      ...chordData.triadi.subsections.none.chords,
      ...chordData.quadriadi.subsections.none.chords,
      ...chordData.estesi.subsections.none.chords,
      ...chordData.estesi.subsections.alterati.chords
    ];

    // Trasformiamo ogni accordo originale e vediamo se corrisponde a quello selezionato
    for (const originalChord of allChords) {
      const transformed = getTonalidyChords([originalChord])[0];
      if (transformed.sigla === transposedChord.sigla) {
        return originalChord;
      }
    }

    // Fallback: ritorna quello che abbiamo
    return transposedChord;
  };

  // Sticky come versione precedente

  return (
    <div
      className="w-full max-w-7xl mx-auto p-6 min-h-screen text-white"
      style={{
        backgroundColor: '#0a1833',
      }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
          Mappa mentale accordi {selectedRoot !== 'Do' && <span className="text-2xl text-green-400">({selectedRoot})</span>}
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
          
          {/* Tendine di selezione */}
          <div className="mt-4 flex flex-col gap-3 items-center">
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="bg-gray-700 text-white px-6 py-3 rounded-lg text-lg font-semibold cursor-pointer border-none outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="accordi_comuni">Accordi comuni</option>
              <option value="accordi_avanzati">Accordi avanzati</option>
              <option value="mappa_generale">Mappa generale</option>
            </select>
            
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-medium">
                Tonalità:
                {!csvLoading && Object.keys(csvMappings).length === 0 && (
                  <span className="text-red-400 ml-1 text-xs">
                    (CSV non caricato - trasposizione semplificata)
                  </span>
                )}
              </span>
              <select
                value={selectedRoot}
                onChange={(e) => setSelectedRoot(e.target.value)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg text-base font-medium cursor-pointer border-none outline-none focus:ring-2 focus:ring-yellow-400"
                disabled={csvLoading}
              >
                <option value="Do">Do (C)</option>
                {csvLoading ? (
                  <option disabled>Caricamento CSV...</option>
                ) : Object.keys(csvMappings).length > 0 ? (
                  Object.keys(csvMappings).map(tonalita => (
                    <option key={tonalita} value={tonalita}>
                      {tonalita} ({getEnglishNote(tonalita)})
                    </option>
                  ))
                ) : (
                  // Fallback se il CSV non si carica: mostra almeno alcune tonalità principali
                  <>
                    <option value="Mi">Mi (E)</option>
                    <option value="Sol">Sol (G)</option>
                    <option value="Re">Re (D)</option>
                    <option value="La">La (A)</option>
                    <option value="Fa">Fa (F)</option>
                    <option value="Si">Si (B)</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex gap-10">
        {/* Contenuto basato sulla selezione della tendina */}
        {viewMode === 'mappa_generale' ? (
          // Mappa generale
          <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl p-6 shadow-lg border border-gray-200 text-gray-800">
            <div className="text-center text-2xl font-bold mb-4 flex items-center justify-center gap-2 text-slate-700">
              <span role="img" aria-label="nota musicale">🎵</span> Accordi
            </div>
            <div className="flex flex-col gap-2">
              {Object.entries(chordData).map(([catKey, cat]) => (
                <div key={catKey}>
                  <button
                    className="flex items-center gap-2 font-bold text-lg py-2 px-3 hover:bg-gray-100 rounded-lg transition w-full text-left text-slate-700 hover:text-slate-800"
                    onClick={() => toggleMappaCategory(catKey)}
                  >
                    <span>{expandedMappa[catKey] ? '▼' : '▶'}</span>
                    {cat.title}
                  </button>
                  {expandedMappa[catKey] && (
                    <div className="ml-8 border-l-2 border-gray-200 pl-4 mt-1">
                      {Object.entries(cat.subsections).map(([subKey, sub]) => (
                        <div key={subKey} className="mb-2">
                          <div className="font-semibold text-base mb-1 text-gray-700">{sub.title}</div>
                          <div className="flex flex-wrap gap-2 ml-4">
                            {getTonalidyChords(sub.chords).map((chord, idx) => (
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
          // Lista accordi (comuni o avanzati)
          <div className="flex-1 space-y-8 bg-[#e7e8eb] rounded-2xl p-8 shadow-sm">
            {Object.entries(chordData).map(([categoryKey, category]) => (
              <div
                key={categoryKey}
                className="bg-transparent rounded-2xl p-0 shadow-none"
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(categoryKey)}
                  className="w-full flex items-center justify-between p-4 rounded-xl font-semibold text-lg mb-6 shadow-sm hover:shadow-md transition-all text-white hover:opacity-90"
                  style={{
                    backgroundColor: '#0a1833',
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
                        if (viewMode === 'accordi_avanzati') return true;
                        return subsection.chords.some(chord => chord.comune);
                      })
                      .map(([subsectionKey, subsection]) => {
                        const subsectionExpandKey = `${categoryKey}-${subsectionKey}`;
                        const isSubsectionExpanded = expandedSubsections[subsectionExpandKey];
                        return (
                          <div key={subsectionKey} className="bg-white rounded-xl p-5 mb-4 ml-3 md:ml-6 shadow-sm border border-gray-200">
                            {/* Subsection Header */}
                            <button
                              onClick={() => toggleSubsection(categoryKey, subsectionKey)}
                              className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-100 text-gray-800 font-bold mb-3 shadow-none hover:bg-gray-200 transition-colors"
                              style={{boxShadow: 'none'}}
                            >
                              <span className="font-bold text-base tracking-wide">{subsection.title}</span>
                              {isSubsectionExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </button>

                            {/* Chords Grid */}
                            {isSubsectionExpanded && (
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {getTonalidyChords(subsection.chords)
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
            ))}
          </div>
        )}

        {/* Detail Panel */}
        {selectedChord && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black bg-opacity-60 z-40 animate-fadein"
              onClick={() => { setSelectedChord(null); setPopupPosition(null); }}
            ></div>
            {/* Modal Popup posizionato */}
            <div
              className="fixed inset-0 z-50 flex items-center justify-center px-2"
              style={{ pointerEvents: 'none' }}
              >
              <div
                className="w-[90vw] min-w-[320px] max-w-6xl md:max-w-2xl md:w-2/5 bg-gray-100 rounded-2xl p-2 sm:p-4 md:p-5 shadow-lg h-fit max-h-[85vh] overflow-y-auto relative"
                style={{ pointerEvents: 'auto' }}
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-cyan-700 tracking-wide">Dettagli accordo</h3>
                  <button
                    onClick={() => { setSelectedChord(null); setPopupPosition(null); }}
                    className="text-gray-400 hover:text-cyan-200 transition-colors"
                    aria-label="Chiudi dettagli"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  {(() => {
                    // L'accordo selezionato è già quello trasposto, lo mostriamo direttamente
                    const displayChord = selectedChord;
                    return (
                      <>
                        <div className="text-center mb-2">
                          <div className="text-2xl font-mono font-bold text-cyan-700 mb-1 tracking-wide">
                            {displayChord.sigla}
                          </div>
                          <div className="text-base text-gray-300 mb-1">
                            <span className="text-gray-700">{displayChord.nome}</span>
                          </div>
                          {displayChord.comune && (
                            <div className="inline-block bg-yellow-300 text-gray-900 px-2 py-1 rounded text-xs font-bold mt-1">
                              comune
                            </div>
                          )}
                        </div>
                        <div className="pt-4">
                          <div className="mb-2">
                            <h4 className="font-semibold text-cyan-700 mb-1 text-xs uppercase tracking-wide">Formula</h4>
                            <div className="font-mono text-base bg-gray-200 p-2 rounded-lg text-cyan-900">
                              {displayChord.formula}
                            </div>
                          </div>
                          <div className="mb-2">
                            <h4 className="font-semibold text-cyan-700 mb-1 text-xs uppercase tracking-wide">Note (in {selectedRoot})</h4>
                            <div className="font-mono text-base bg-gray-200 p-2 rounded-lg text-cyan-900">
                              {displayChord.note}
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                  {/* Messaggio di chiusura */}
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
