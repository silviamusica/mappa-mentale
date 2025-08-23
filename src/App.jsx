import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './App.css';

const App = () => {
  const [selectedChord, setSelectedChord] = useState(null);

  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSubsections, setExpandedSubsections] = useState({});
  const [expandedNestedSubsections, setExpandedNestedSubsections] = useState({});
  const [viewMode, setViewMode] = useState('accordi_comuni'); // 'accordi_comuni', 'accordi_avanzati', 'mappa_generale'
  const [selectedRoot, setSelectedRoot] = useState('Do'); // Do, Mi e Sol per iniziare
  const [csvData, setCsvData] = useState(null); // Dati del CSV caricati
  const [csvLoading, setCsvLoading] = useState(true);

  const [expandedMappa, setExpandedMappa] = useState({});
  
  // Stato per le inversioni
  const [showInversions, setShowInversions] = useState(false);
  const [expandedInversions, setExpandedInversions] = useState({});
  
  // Stato per le istruzioni
  const [showInstructions, setShowInstructions] = useState(false);
  
  // Stato per il gioco Rebus
  const [gameMode, setGameMode] = useState('none'); // 'none', 'rebus'
  const [rebusLevel, setRebusLevel] = useState(1);
  const [currentRebusChord, setCurrentRebusChord] = useState(null);
  const [rebusAnswer, setRebusAnswer] = useState('');
  const [rebusScore, setRebusScore] = useState(0);
  const [rebusAttempts, setRebusAttempts] = useState(0);
  const [rebusQuestionsLeft, setRebusQuestionsLeft] = useState(5);
  const [rebusCurrentSet, setRebusCurrentSet] = useState(1);
  const [tonalityFilter, setTonalityFilter] = useState('tutte'); // 'tutte', 'bianchi', 'neri'
  const [usedChords, setUsedChords] = useState(new Set()); // Accordi già usati nel set
  const [wrongAnswers, setWrongAnswers] = useState([]); // Risposte sbagliate per il ripasso
  const [showReview, setShowReview] = useState(false); // Mostra il riepilogo

  const [showGameSettings, setShowGameSettings] = useState(false); // Mostra/nasconde impostazioni gioco

  const toggleSubsection = (categoryKey, subsectionKey) => {
    const key = `${categoryKey}_${subsectionKey}`;
    setExpandedSubsections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleNestedSubsection = (categoryKey, subsectionKey, nestedSubsectionKey) => {
    const key = `${categoryKey}_${subsectionKey}_${nestedSubsectionKey}`;
    setExpandedNestedSubsections(prev => ({
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

  // Funzioni per il gioco Rebus
  const generateRebusChord = () => {
    console.log('🎯 Generando nuovo puzzle...');
    
    // Trova tutti gli accordi disponibili (escludi quelli già usati)
    const allChords = [];
    Object.entries(chordData).forEach(([categoryKey, category]) => {
      Object.entries(category.subsections).forEach(([subsectionKey, subsection]) => {
        if (subsection.subsections) {
          // Sottosezioni annidate
          Object.entries(subsection.subsections).forEach(([nestedSubsectionKey, nestedSubsection]) => {
            nestedSubsection.chords.forEach(chord => {
              if (chord.note && chord.note !== 'enarmonico') {
                allChords.push({
                  ...chord,
                  category: categoryKey,
                  subsection: subsectionKey,
                  nestedSubsection: nestedSubsectionKey
                });
              }
            });
          });
        } else {
          // Sottosezioni normali
          subsection.chords.forEach(chord => {
            if (chord.note && chord.note !== 'enarmonico') {
              allChords.push({
                ...chord,
                category: categoryKey,
                subsection: subsectionKey
              });
            }
          });
        }
      });
    });

    // Filtra accordi per tonalità selezionata (prima riga del CSV)
    const tonalitaFilteredChords = allChords.filter(chord => {
      // La prima nota dell'accordo deve corrispondere alla tonalità selezionata
      const firstNote = chord.note.split(' ')[0]; // Prima nota dell'accordo
      return firstNote === selectedRoot;
    });
    
    console.log(`🎵 Filtro tonalità: ${selectedRoot}, accordi disponibili: ${tonalitaFilteredChords.length}`);
    
    if (tonalitaFilteredChords.length === 0) {
      console.log(`❌ Nessun accordo disponibile per la tonalità ${selectedRoot}, cambio tonalità`);
      // Se non ci sono accordi per questa tonalità, prova con un'altra
      const availableTonalities = getAvailableTonalities();
      const randomTonalita = availableTonalities[Math.floor(Math.random() * availableTonalities.length)];
      setSelectedRoot(randomTonalita);
      console.log(`🔄 Cambiata tonalità a: ${randomTonalita}`);
      return generateRebusChord(); // Ricorsione con nuova tonalità
    }
    
    // Filtra accordi già usati
    const availableChords = tonalitaFilteredChords.filter(chord => !usedChords.has(chord.sigla));
    
    if (availableChords.length === 0) {
      console.log('❌ Nessun accordo disponibile, reset accordi usati');
      setUsedChords(new Set()); // Reset accordi usati
      return generateRebusChord(); // Ricorsione per generare nuovo puzzle
    }

    // Seleziona un accordo casuale tra quelli disponibili
    const randomChord = availableChords[Math.floor(Math.random() * availableChords.length)];
    console.log('🎵 Accordo selezionato:', randomChord.sigla);
    
    // Aggiungi l'accordo agli usati
    setUsedChords(prev => new Set([...prev, randomChord.sigla]));
    
    // Usa direttamente le note dal CSV (NESSUN TRASPORTO!)
    const chordNotes = randomChord.note;
    console.log('🎼 Note dell\'accordo (dal CSV):', chordNotes);

    // Dividi le note in array
    const notesArray = chordNotes.split(' ').filter(note => note.trim());
    console.log('🔢 Array note:', notesArray);
    
    // Determina quante note rimuovere in base al livello
    const notesToRemove = Math.min(rebusLevel, notesArray.length);
    
    console.log('🎯 Note totali:', notesArray.length, 'Livello:', rebusLevel, 'Note da rimuovere:', notesToRemove);
    
    // Se non ci sono abbastanza note per il livello, riduci il numero
    if (notesToRemove <= 0) {
      console.log('❌ Accordo troppo semplice per questo livello, cambio accordo');
      return generateRebusChord(); // Prova con un altro accordo
    }
    
    // Rimuovi note casuali (inclusa la fondamentale se necessario)
    const notesToRemoveIndices = [];
    while (notesToRemoveIndices.length < notesToRemove) {
      const randomIndex = Math.floor(Math.random() * notesArray.length); // Include anche l'indice 0 (fondamentale)
      if (!notesToRemoveIndices.includes(randomIndex)) {
        notesToRemoveIndices.push(randomIndex);
      }
    }
    
    console.log('🗑️ Indici note rimosse:', notesToRemoveIndices);
    
    // Crea l'accordo puzzle
    const puzzleNotes = notesArray.filter((_, index) => !notesToRemoveIndices.includes(index));
    console.log('🧩 Note puzzle:', puzzleNotes);
    
    const rebusChord = {
      ...randomChord,
      originalNotes: chordNotes,
      puzzleNotes: puzzleNotes.join(' '),
      missingNotes: notesToRemoveIndices.map(i => notesArray[i]).join(' '),
      level: rebusLevel
    };
    
    console.log('🎮 Puzzle creato:', rebusChord);
    
    setCurrentRebusChord(rebusChord);
    setRebusAnswer('');
    setRebusAttempts(0);
  };

  // Funzione per generare un nuovo set di 5 domande
  const generateNewSet = () => {
    // Reset completo del set
    setRebusQuestionsLeft(5);
    setRebusCurrentSet(prev => prev + 1);
    setRebusScore(0);
    setRebusAttempts(0);
    setUsedChords(new Set()); // Reset accordi usati
    setWrongAnswers([]); // Reset errori
    setShowReview(false); // Nascondi riepilogo
    
    alert(`🎵 Nuovo set - 5 domande`);
    generateRebusChord();
  };

  // Funzione per ottenere tonalità disponibili in base al filtro
  const getAvailableTonalities = () => {
    if (tonalityFilter === 'bianchi') {
      return ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'];
    } else if (tonalityFilter === 'neri') {
      return ['Do#', 'Reb', 'Re#', 'Mib', 'Fa#', 'Solb', 'Sol#', 'Lab', 'La#', 'Sib'];
    } else {
      return ['Do', 'Do#', 'Reb', 'Re', 'Re#', 'Mib', 'Mi', 'Fa', 'Fa#', 'Solb', 'Sol', 'Sol#', 'Lab', 'La', 'La#', 'Sib', 'Si'];
    }
  };

  const checkRebusAnswer = () => {
    if (!currentRebusChord || !rebusAnswer.trim()) return;
    
    setRebusAttempts(prev => prev + 1);
    
    console.log('🔍 Confronto risposte:');
    console.log('  Risposta utente:', rebusAnswer.trim());
    console.log('  Note mancanti:', currentRebusChord.missingNotes);
    
    // Usa il confronto flessibile che gestisce ordine e formati
    if (compareNotesUnordered(rebusAnswer.trim(), currentRebusChord.missingNotes)) {
      // Risposta corretta
      const pointsEarned = 6 - rebusLevel;
      setRebusScore(prev => prev + pointsEarned);
      
      // Controlla se è l'ultima domanda del set
      if (rebusQuestionsLeft === 1) {
        // Set completato - mostra riepilogo
        setRebusQuestionsLeft(0);
        alert(`🎉 Set completato! Punteggio finale: ${rebusScore + pointsEarned} punti!`);
        setCurrentRebusChord(null);
        setRebusAnswer('');
        setShowReview(true); // Mostra riepilogo con errori
      } else {
        // Ancora domande nel set
        setRebusQuestionsLeft(prev => prev - 1);
        alert(`🎉 Risposta corretta! +${pointsEarned} punti! Domande rimanenti: ${rebusQuestionsLeft - 1}`);
        setCurrentRebusChord(null);
        setRebusAnswer('');
        // Genera automaticamente la prossima domanda
        setTimeout(() => generateRebusChord(), 1000);
      }
    } else {
      // Risposta sbagliata - salva per il ripasso
      const wrongAnswer = {
        chord: currentRebusChord.sigla,
        chordName: currentRebusChord.nome,
        userAnswer: rebusAnswer.trim(),
        correctAnswer: currentRebusChord.missingNotes,
        level: currentRebusChord.level,
        attempts: rebusAttempts
      };
      
      setWrongAnswers(prev => [...prev, wrongAnswer]);
      
      // Controlla se è l'ultima domanda del set
      if (rebusQuestionsLeft === 1) {
        // Set completato - mostra riepilogo
        setRebusQuestionsLeft(0);
        setShowReview(true);
      } else {
        // Continua con la prossima domanda
        setRebusQuestionsLeft(prev => prev - 1);
        setTimeout(() => generateRebusChord(), 1000);
      }
      
      alert('❌ Risposta sbagliata. Le note mancanti erano: ' + currentRebusChord.missingNotes);
    }
  };

  // Funzione per normalizzare le stringhe delle note (case-insensitive, gestisce alterazioni)
  const normalizeNoteString = (noteString) => {
    return noteString
      .toLowerCase()
      .replace(/[,;]/g, ' ') // Sostituisce virgole e punto e virgola con spazi
      .replace(/\s+/g, ' ') // Normalizza spazi multipli
      .trim()
      // Gestisce tutti i formati di bemolle
      .replace(/♭/g, 'b') // Simbolo bemolle Unicode
      .replace(/bemolle/g, 'b') // "bemolle"
      .replace(/be molle/g, 'b') // "be molle"
      .replace(/b molle/g, 'b') // "b molle"
      .replace(/bemol/g, 'b') // "bemol"
      .replace(/be mol/g, 'b') // "be mol"
      .replace(/b mol/g, 'b') // "b mol"
      // Gestisce tutti i formati di diesis
      .replace(/♯/g, '#') // Simbolo diesis Unicode
      .replace(/diesis/g, '#') // "diesis"
      .replace(/di esis/g, '#') // "di esis"
      .replace(/diesel/g, '#') // "diesel"
      .replace(/di esel/g, '#') // "di esel"
      // Normalizza le note con alterazioni (con o senza spazi)
      .replace(/do\s*#/g, 'do#') // "do #" o "do#" → "do#"
      .replace(/re\s*#/g, 're#') // "re #" o "re#" → "re#"
      .replace(/fa\s*#/g, 'fa#') // "fa #" o "fa#" → "fa#"
      .replace(/sol\s*#/g, 'sol#') // "sol #" o "sol#" → "sol#"
      .replace(/la\s*#/g, 'la#') // "la #" o "la#" → "la#"
      .replace(/si\s*#/g, 'si#') // "si #" o "si#" → "si#"
      .replace(/do\s*b/g, 'dob') // "do b" o "dob" → "dob"
      .replace(/re\s*b/g, 'reb') // "re b" o "reb" → "reb"
      .replace(/mi\s*b/g, 'mib') // "mi b" o "mib" → "mib"
      .replace(/fa\s*b/g, 'fab') // "fa b" o "fab" → "fab"
      .replace(/sol\s*b/g, 'solb') // "sol b" o "solb" → "solb"
      .replace(/la\s*b/g, 'lab') // "la b" o "lab" → "lab"
      .replace(/si\s*b/g, 'sib'); // "si b" o "sib" → "sib"
  };

  // Funzione per confrontare le note indipendentemente dall'ordine
  const compareNotesUnordered = (answer, correct) => {
    // Normalizza entrambe le stringhe
    const normalizedAnswer = normalizeNoteString(answer);
    const normalizedCorrect = normalizeNoteString(correct);
    
    // Dividi in array di note
    const answerNotes = normalizedAnswer.split(' ').filter(note => note.trim());
    const correctNotes = normalizedCorrect.split(' ').filter(note => note.trim());
    
    // Se il numero di note è diverso, non possono essere uguali
    if (answerNotes.length !== correctNotes.length) {
      return false;
    }
    
    // Crea copie degli array per non modificare gli originali
    const answerCopy = [...answerNotes].sort();
    const correctCopy = [...correctNotes].sort();
    
    // Confronta le note ordinate
    return answerCopy.every((note, index) => note === correctCopy[index]);
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
              
              if (accordoType && note) {
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
                if (note) {
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

  const handleChordClick = (chord, category) => {
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
        // TRIADI (dalla intestazione CSV riga 2)
        'C': 'Maggiore',
        'Cm': 'm',
        'Cdim': 'dim (°)',
        'Caug': 'aum (+)',
        'Csus2': 'sus 2',
        'Csus4': 'sus 4',
        
        // QUADRIADI (dalla intestazione CSV riga 2)
        'C6': '6',
        'Cm6': 'm6',
        'C7': '7 (di dominante)',
        'Cmaj7': 'maj7',
        'Cm7': 'm7',
        'Cm7♭5': 'm7b5 (semidim)',
        'Cdim7': '7dim',
        
        // ACCORDI ESTESI - RIGA 2 CONTINUAZIONE (dalla intestazione CSV)
        'Cm7maj': 'm (maj 7)',
        'Cmaj7♯5': 'maj 7 ♯5',
        'C7♯5': '7 ♯5',
        'C7♭5': '7 ♭5',
        'Cmaj7♭5': 'maj 7 ♭5',
        'Cdimmaj7': 'dim (maj7)',
        'C7sus4': '7 sus 4',
        
        // ACCORDI AGGIUNTI (dalla intestazione CSV riga 2)
        'Cadd2': 'add 2',
        'Cmadd2': 'm add 2',
        'Cadd4': 'add 4',
        'Cmadd4': 'm add 4',
        'Cadd9': 'add 9 ',
        'Cmadd9': 'm add 9',
        
        // ACCORDI ESTESI - RIGA 3 (dalla intestazione CSV)
        'C9': '9',
        'Cm9': 'm9',
        'Cmaj9': 'maj 9',
        'C11': '11',
        'Cm11': 'm 11',
        'C13sus4': '13 sus 4',

        // ACCORDI CHE NON ESISTONO nel CSV (usano formula)
        // Rimossi C7♯9 e C7♭9 dalle none
      };

      const csvType = csvTypeMap[chord.sigla];
      if (csvType && csvData[targetRoot]) {
        // Prova prima il mapping esatto
        if (csvData[targetRoot][csvType]) {
          const noteValue = csvData[targetRoot][csvType];
          if (noteValue === 'no') {
            // Caso "no" nel CSV - accordo enarmonico
            newNote = 'enarmonico';
          } else {
            newNote = noteValue;
            console.log(`✅ Trovato nel CSV: ${chord.sigla} -> ${targetRoot} -> ${csvType} = ${newNote}`);
          }
        } else {
          // Prova varianti con spazi
          const csvTypeWithSpace = csvType + ' ';
          const csvTypeTrimmed = csvType.trim();
          
          if (csvData[targetRoot][csvTypeWithSpace]) {
            const noteValue = csvData[targetRoot][csvTypeWithSpace];
            if (noteValue === 'no') {
              newNote = 'enarmonico';
            } else {
              newNote = noteValue;
              console.log(`✅ Trovato nel CSV (con spazio): ${chord.sigla} -> ${targetRoot} -> "${csvTypeWithSpace}" = ${newNote}`);
            }
          } else if (csvData[targetRoot][csvTypeTrimmed]) {
            const noteValue = csvData[targetRoot][csvTypeTrimmed];
            if (noteValue === 'no') {
              newNote = 'enarmonico';
            } else {
              newNote = noteValue;
              console.log(`✅ Trovato nel CSV (trimmed): ${chord.sigla} -> ${targetRoot} -> "${csvTypeTrimmed}" = ${newNote}`);
            }
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

  // Funzione per calcolare la nota enarmonica
  const getEnharmonicNote = (note) => {
    const enarmonicMap = {
      'Do': 'Si#',
      'Do#': 'Reb',
      'Reb': 'Do#',
      'Re': 'Do##',
      'Re#': 'Mib',
      'Mib': 'Re#',
      'Mi': 'Fa',
      'Fa': 'Mi#',
      'Fa#': 'Solb',
      'Solb': 'Fa#',
      'Sol': 'Fa##',
      'Sol#': 'Lab',
      'Lab': 'Sol#',
      'La': 'Sol##',
      'La#': 'Sib',
      'Sib': 'La#',
      'Si': 'Do'
    };
    return enarmonicMap[note] || note;
  };

  // SISTEMA INTELLIGENTE PER LE INVERSIONI
  const calculateInversions = (chord) => {
    if (!chord.note || chord.note === 'prova a calcolarlo tu' || chord.note === 'enarmonico') {
      return [];
    }

    const notes = chord.note.split(' ').filter(note => note.trim());
    if (notes.length < 3) return [];

    const inversions = [];
    
    // Per ogni possibile inversione (n-1 dove n è il numero di note)
    for (let i = 1; i < notes.length; i++) {
      const inversion = [...notes.slice(i), ...notes.slice(0, i)];
      inversions.push({
        position: i,
        notes: inversion.join(' '),
        description: `${i === 1 ? 'Primo' : i === 2 ? 'Secondo' : i === 3 ? 'Terzo' : `${i}º`} rivolto`
      });
    }

    return inversions;
  };

  const toggleInversion = (chordKey) => {
    setExpandedInversions(prev => ({
      ...prev,
      [chordKey]: !prev[chordKey]
    }));
  };

  // DATI ESPANSI - PIÙ ACCORDI PER TESTARE IL SISTEMA AUTOMATICO
  const chordData = {
    triadi: {
      title: "TRIADI (3 Note)",
      color: "bg-cyan-900",
      textColor: "text-cyan-100",
      subsections: {
        base: {
          title: "Maggiori e Minori",
          chords: [
            { sigla: 'C', nome: 'Do maggiore', formula: '1 - 3 - 5', note: 'Do Mi Sol', comune: true },
            { sigla: 'Cm', nome: 'Do minore', formula: '1 - ♭3 - 5', note: 'Do Mi♭ Sol', comune: true }
          ]
        },
        alterati: {
          title: "Aumentati e Diminuiti",
          chords: [
            { sigla: 'Caug', nome: 'Do aumentato', formula: '1 - 3 - ♯5', note: 'Do Mi Sol♯', comune: false },
            { sigla: 'Cdim', nome: 'Do diminuito', formula: '1 - ♭3 - ♭5', note: 'Do Mi♭ Sol♭', comune: false }
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
          subsections: {
            settima_maggiore: {
              title: "Settime su Accordi Maggiori",
          chords: [
                { sigla: 'C7', nome: 'Do settima di dominante', formula: '1 - 3 - 5 - ♭7', note: 'Do Mi Sol Si♭', comune: true },
                { sigla: 'Cmaj7', nome: 'Do settima maggiore', formula: '1 - 3 - 5 - 7', note: 'Do Mi Sol Si', comune: true }
          ]
        },
            settima_minore: {
              title: "Settime su Accordi Minori",
          chords: [
                { sigla: 'Cm7', nome: 'Do minore settima', formula: '1 - ♭3 - 5 - ♭7', note: 'Do Mi♭ Sol Si♭', comune: true },
                { sigla: 'Cm7maj', nome: 'Do minore settima maggiore', formula: '1 - ♭3 - 5 - 7', note: 'Do Mi♭ Sol Si', comune: false }
          ]
        },
            settima_diminuita: {
              title: "Settime su Accordi Diminuiti",
          chords: [
                { sigla: 'Cm7♭5', nome: 'Do semidiminuito', formula: '1 - ♭3 - ♭5 - ♭7', note: 'Do Mi♭ Sol♭ Si♭', comune: false },
                { sigla: 'Cdim7', nome: 'Do diminuito settima', formula: '1 - ♭3 - ♭5 - ♭♭7', note: 'Do Mi♭ Sol♭ La', comune: false }
              ]
            }
          }
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
      title: "ESTESI (5+ Note)",
      color: "bg-purple-700",
      textColor: "text-purple-100",
      subsections: {
                noni: {
          title: "Accordi di Nona",
          subsections: {
            nona_maggiore: {
              title: "None su Accordi Maggiori",
          chords: [
                { sigla: 'C9', nome: 'Do nona di dominante', formula: '1 - 3 - 5 - ♭7 - 9', note: 'Do Mi Sol Si♭ Re', comune: true },
                { sigla: 'Cmaj9', nome: 'Do nona maggiore', formula: '1 - 3 - 5 - 7 - 9', note: 'Do Mi Sol Si Re', comune: false }
          ]
        },
            nona_minore: {
              title: "None su Accordi Minori",
          chords: [
                { sigla: 'Cm9', nome: 'Do minore nona', formula: '1 - ♭3 - 5 - ♭7 - 9', note: 'Do Mi♭ Sol Si♭ Re', comune: false }
              ]
            }
          }
        },
        undicesimi: {
          title: "Accordi di Undicesima",
          subsections: {
            undicesima_maggiore: {
              title: "Undicesime su Accordi Maggiori",
          chords: [
                { sigla: 'C11', nome: 'Do undicesima di dominante', formula: '1 - 3 - 5 - ♭7 - 9 - 11', note: 'Do Mi Sol Si♭ Re Fa', comune: false }
          ]
        },
            undicesima_minore: {
              title: "Undicesime su Accordi Minori",
          chords: [
                { sigla: 'Cm11', nome: 'Do minore undicesima', formula: '1 - ♭3 - 5 - ♭7 - 9 - 11', note: 'Do Mi♭ Sol Si♭ Re Fa', comune: false }
              ]
            }
          }
        },

      }
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col text-white relative overflow-auto"
      style={{ backgroundColor: '#0a1833' }}
    >
      {/* Header e Controlli Unificati */}
      <div className="relative z-10">
        <div className="w-full py-4 px-4 lg:px-12 xl:px-16 2xl:px-20" style={{ backgroundColor: '#0a1833' }}>
          {/* Titolo */}
          <div className="text-center mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              🎵 Accordi Musicali
            </h1>
            <div className="text-lg text-yellow-300 font-medium">
              Tonalità corrente: <span className="font-bold">{selectedRoot}</span>
            </div>
          </div>

          {/* Istruzioni collassabili */}
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl border border-blue-500/30 mb-4">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="w-full p-4 text-left transition-all duration-200 hover:bg-white/5 rounded-xl flex justify-between items-center"
            >
              <h2 className="text-yellow-300 font-bold text-lg">📖 Come usare l'applicazione</h2>
              <span className="text-yellow-300 text-xl font-bold">
                {showInstructions ? '−' : '+'}
              </span>
            </button>
            
            {showInstructions && (
              <div className="px-4 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <div className="font-semibold text-blue-300 mb-1">🎯 Modalità di visualizzazione</div>
                    <div className="text-white/90">
                      Seleziona <span className="font-bold text-yellow-300">"Accordi avanzati"</span> per vedere tutti gli accordi disponibili, oppure <span className="font-bold text-yellow-300">"Accordi comuni"</span> per vedere solo quelli più utilizzati.
                    </div>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <div className="font-semibold text-green-300 mb-1">🔄 Rivolti degli accordi</div>
                    <div className="text-white/90">
                      Attiva il pulsante <span className="font-bold text-yellow-300">"Rivolti"</span> per visualizzare tutti i rivolti di ogni accordo nei dettagli.
                    </div>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <div className="font-semibold text-purple-300 mb-1">🎼 Cambiare tonalità</div>
                    <div className="text-white/90">
                      Scegli una <span className="font-bold text-yellow-300">tonalità diversa</span> dal menu a tendina per trasporre automaticamente tutti gli accordi.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Selezione Modalità Gioco (sempre visibile) */}
          <div className="mt-4 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-medium whitespace-nowrap">🎮 Modalità:</span>
              <select
                value={gameMode}
                onChange={(e) => setGameMode(e.target.value)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer border-none outline-none focus:ring-2 focus:ring-yellow-400 min-w-[140px]"
              >
                <option value="none">Modalità Apprendimento</option>
                <option value="rebus">Modalità Gioco</option>
              </select>
            </div>
          </div>

          {/* Impostazioni Dinamiche */}
          <div className="mt-4">
            {/* Tendina Impostazioni */}
            <div className="bg-gray-700 rounded-lg p-3">
              <button
                onClick={() => setShowGameSettings(!showGameSettings)}
                className="w-full flex items-center justify-between text-white text-sm font-medium cursor-pointer"
              >
                <span>⚙️ Impostazioni {gameMode === 'rebus' ? 'Gioco' : 'Apprendimento'}</span>
                <span className="text-lg">{showGameSettings ? '−' : '+'}</span>
              </button>
              
              {showGameSettings && (
                <div className="mt-3 space-y-3">
                                    {/* Modalità Accordi */}
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium whitespace-nowrap">📚 Modalità Accordi:</span>
                    <select
                      value={viewMode}
                      onChange={(e) => setViewMode(e.target.value)}
                      className="bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium cursor-pointer border-none outline-none focus:ring-2 focus:ring-yellow-400 min-w-[140px]"
                    >
                      <option value="accordi_comuni">Accordi Comuni</option>
                      <option value="accordi_avanzati">Accordi Avanzati</option>
                      <option value="mappa_generale">Mappa Generale</option>
                    </select>
                  </div>
                  
                  {/* Rivolti (solo per modalità apprendimento) */}
                  {gameMode === 'none' && (
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-medium whitespace-nowrap">🔄 Rivolti:</span>
                      <button
                        onClick={() => setShowInversions(!showInversions)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          showInversions 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'bg-gray-600 hover:bg-gray-700 text-white'
                        }`}
                      >
                        {showInversions ? '✅ Attivi' : '❌ Disattivi'}
                      </button>
                    </div>
                  )}
                  
                  {/* Filtro Tonalità */}
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium whitespace-nowrap">🎵 Filtro:</span>
                    <select
                      value={tonalityFilter}
                      onChange={(e) => setTonalityFilter(e.target.value)}
                      className="bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium cursor-pointer border-none outline-none focus:ring-2 focus:ring-yellow-400 min-w-[120px]"
                    >
                      <option value="tutte">Tutte</option>
                      <option value="bianchi">Tasti Bianchi</option>
                      <option value="neri">Tasti Neri</option>
                    </select>
                  </div>
                  
                  {/* Selezione Tonalità */}
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium whitespace-nowrap">🎹 Tonalità:</span>
                    <select
                      value={selectedRoot}
                      onChange={(e) => setSelectedRoot(e.target.value)}
                      className="bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium cursor-pointer border-none outline-none focus:ring-2 focus:ring-yellow-400 min-w-[100px]"
                    >
                      {tonalityFilter === 'bianchi' && (
                        <>
                          <option value="Do">Do (C)</option>
                          <option value="Re">Re (D)</option>
                          <option value="Mi">Mi (E)</option>
                          <option value="Fa">Fa (F)</option>
                          <option value="Sol">Sol (G)</option>
                          <option value="La">La (A)</option>
                          <option value="Si">Si (B)</option>
                        </>
                      )}
                      {tonalityFilter === 'neri' && (
                        <>
                          <option value="Do#">Do# (C#)</option>
                          <option value="Reb">Re♭ (D♭)</option>
                          <option value="Re#">Re# (D#)</option>
                          <option value="Mib">Mi♭ (E♭)</option>
                          <option value="Fa#">Fa# (F#)</option>
                          <option value="Solb">Sol♭ (G♭)</option>
                          <option value="Sol#">Sol# (G#)</option>
                          <option value="Lab">La♭ (A♭)</option>
                          <option value="La#">La# (A#)</option>
                          <option value="Sib">Si♭ (B♭)</option>
                        </>
                      )}
                      {tonalityFilter === 'tutte' && (
                        <>
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
                        </>
                      )}
                    </select>
        </div>
                  
                  {/* Opzioni specifiche per Modalità Gioco */}
                  {gameMode === 'rebus' && (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-medium whitespace-nowrap">📊 Livello:</span>
                        <select 
                          value={rebusLevel} 
                          onChange={(e) => setRebusLevel(parseInt(e.target.value))} 
                          className="bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium cursor-pointer border-none outline-none focus:ring-2 focus:ring-yellow-400 min-w-[80px]"
                        >
                          <option value={1}>1 - Indovina la nota mancante</option>
                          <option value={2}>2 - Indovina le 2 note mancanti</option>
                          <option value={3}>3 - Indovina le 3 note mancanti</option>
                          <option value={4}>4 - Indovina le 4 note mancanti (può includere la fondamentale)</option>
                          <option value={5}>5 - Indovina le 5 note mancanti (può includere la fondamentale)</option>
                        </select>
      </div>
                      
                      {/* Statistiche Gioco */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-white">
                        <div className="bg-gray-600 p-2 rounded text-center">
                          <div className="font-semibold">Set {rebusCurrentSet}</div>
                          <div>Domande: {rebusQuestionsLeft}/5</div>
                        </div>
                        <div className="bg-gray-600 p-2 rounded text-center">
                          <div className="font-semibold">Punteggio</div>
                          <div>{rebusScore}</div>
                        </div>
                      </div>
                      
                      {/* Pulsanti Azione */}
                      <div className="flex gap-2">
                        {rebusQuestionsLeft === 0 ? (
                          <button 
                            onClick={generateNewSet} 
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                          >
                            🆕 Nuovo Set
                          </button>
                        ) : (
                          <button 
                            onClick={generateRebusChord} 
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                          >
                            🎯 Nuovo Puzzle
                          </button>
                        )}
                      </div>
                      
                      {/* Regole */}
                      <div className="text-xs text-yellow-200 text-left">
                        💡 <strong>Regole:</strong> Indovina le note mancanti!
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row relative z-10 px-4 lg:px-12 xl:px-16 2xl:px-20">
        {viewMode === 'mappa_generale' ? (
          <div className="flex-1 p-4 lg:p-8">
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
                      {Object.entries(category.subsections).map(([subKey, sub]) => {
                        const hasNestedSubsections = sub.subsections;
                        
                      return (
                          <div key={subKey} className="mb-4">
                            {sub.title && <h4 className="font-medium text-gray-700 mb-2">{sub.title}</h4>}
                            
                            {hasNestedSubsections ? (
                              // Rendering per sottosezioni annidate (es. settime, none)
                              Object.entries(sub.subsections).map(([nestedSubKey, nestedSub]) => (
                                <div key={nestedSubKey} className="mb-3 ml-4">
                                  <h5 className="font-medium text-gray-600 mb-2 text-sm">{nestedSub.title}</h5>
                                  <div className="flex flex-wrap gap-2 ml-4">
                                    {getTransposedChords(nestedSub.chords).map((chord, idx) => (
                          <button
                                        key={idx}
                                        className={`px-3 py-1 rounded-lg text-sm transition font-mono border ${chord.comune ? 'font-bold bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100' : 'font-medium bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                                        onClick={() => handleChordClick(chord, catKey)}
                                      >
                                        {chord.sigla}
                          </button>
                                    ))}
                                  </div>
                                </div>
                              ))
                            ) : (
                              // Rendering normale per sottosezioni senza annidamento
                              <div className="flex flex-wrap gap-2 ml-4">
                                {getTransposedChords(sub.chords).map((chord, idx) => (
                                  <button
                                    key={idx}
                                    className={`px-3 py-1 rounded-lg text-sm transition font-mono border ${chord.comune ? 'font-bold bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100' : 'font-medium bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                                    onClick={() => handleChordClick(chord, catKey)}
                                  >
                                    {chord.sigla}
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
          </div>
        ) : (
          <div className="flex-1 p-4 lg:p-8">
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
                          const subsectionExpanded = expandedSubsections[`${categoryKey}_${subsectionKey}`] ?? false;
                          const hasTitle = subsection.title && subsection.title.trim() !== '';
                          const hasNestedSubsections = subsection.subsections;
                          
                          // Controlla se la sottosezione ha almeno un accordo comune
                          let subsectionHasCommonChords = false;
                          if (hasNestedSubsections) {
                            // Per sottosezioni annidate
                            subsectionHasCommonChords = Object.values(subsection.subsections).some(nestedSubsection => 
                              nestedSubsection.chords.some(chord => chord.comune)
                            );
                          } else {
                            // Per sottosezioni normali
                            subsectionHasCommonChords = subsection.chords.some(chord => chord.comune);
                          }
                          
                          // Nascondi la sottosezione se non ha accordi comuni e siamo in modalità "accordi comuni"
                          if (viewMode === 'accordi_comuni' && !subsectionHasCommonChords) {
                            return null;
                          }
                          
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
                                <div>
                                  {hasNestedSubsections ? (
                                    // Rendering per sottosezioni annidate (es. settime)
                                    Object.entries(subsection.subsections).map(([nestedSubsectionKey, nestedSubsection]) => {
                                      const nestedExpanded = expandedNestedSubsections[`${categoryKey}_${subsectionKey}_${nestedSubsectionKey}`] ?? false;
                                      
                                      // Controlla se la sottosezione annidata ha almeno un accordo comune
                                      const nestedHasCommonChords = nestedSubsection.chords.some(chord => chord.comune);
                                      
                                      // Nascondi la sottosezione annidata se non ha accordi comuni e siamo in modalità "accordi comuni"
                                      if (viewMode === 'accordi_comuni' && !nestedHasCommonChords) {
                                        return null;
                                      }
                                      
                                      return (
                                        <div key={nestedSubsectionKey} className="mt-3 ml-4">
                                          <button
                                            onClick={() => toggleNestedSubsection(categoryKey, subsectionKey, nestedSubsectionKey)}
                                            className="w-full text-left p-2 rounded-lg transition-all duration-200 bg-gray-50 text-gray-700 hover:bg-gray-100 flex justify-between items-center border border-gray-100 text-sm"
                                          >
                                            <span className="font-medium">{nestedSubsection.title}</span>
                                            <span className="text-lg">{nestedExpanded ? '−' : '+'}</span>
                                          </button>
                                          
                                          {nestedExpanded && (
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
                                              {getTransposedChords(nestedSubsection.chords)
                                                .filter(chord => viewMode === 'accordi_avanzati' || chord.comune)
                                .map((chord, index) => (
                                  <button
                                    key={index}
                                                    onClick={() => handleChordClick(chord, categoryKey)}
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
                                    }).filter(Boolean) // Rimuove i null
                                  ) : (
                                    // Rendering normale per sottosezioni senza annidamento (es. seste, add)
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
                                      {getTransposedChords(subsection.chords)
                                        .filter(chord => viewMode === 'accordi_avanzati' || chord.comune)
                                        .map((chord, index) => (
                                          <button
                                            key={index}
                                            onClick={() => handleChordClick(chord, categoryKey)}
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
                            )}
        </div>
                        );
                      }).filter(Boolean)}
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
              className="fixed inset-0 bg-black bg-opacity-60 z-50 animate-fadein"
              onClick={() => setSelectedChord(null)}
            />
            <div
              className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl border border-gray-300 z-50 w-96 max-w-[90vw] max-h-[80vh] overflow-y-auto animate-modal"
              style={{ top: 'calc(50vh + 50px)' }}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-cyan-700">Dettagli Accordo</h3>
                  <button
                    onClick={() => setSelectedChord(null)}
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
                        {selectedChord.note === 'enarmonico' ? (
                          <div className="relative group">
                            <span className="text-purple-600 font-semibold cursor-help">
                              enarmonico
                            </span>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-purple-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-48 text-center">
                              Questo accordo esiste nella sua<br/>variante enarmonica con<br/><strong>{getEnharmonicNote(selectedRoot)}</strong>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-800"></div>
                      </div>
                    </div>
                        ) : (
                          selectedChord.note
                        )}
                  </div>
                    </div>
                    
                    {/* INVERSIONI */}
                    {showInversions && (
                      <div className="mb-2">
                        <div className="relative group mb-1">
                          <h4 className="font-semibold text-cyan-700 text-xs uppercase tracking-wide cursor-help inline-block">
                            Rivolti
                          </h4>
                          <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-cyan-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-64 text-left">
                            L'ordine delle note dopo la prima è a tua scelta.<br/>
                            Non devono essere presenti tutte le note: puoi omettere<br/>
                            quinta, settima, nona, ecc. (mantieni settima e nona<br/>
                            negli accordi che le contengono)
                            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-cyan-800"></div>
                          </div>
                        </div>
                        {(() => {
                          const inversions = calculateInversions(selectedChord);
                          if (inversions.length === 0) {
                            return (
                              <div className="text-sm text-gray-500 italic bg-gray-100 p-2 rounded-lg">
                                Nessun rivolto disponibile per questo accordo
                              </div>
                            );
                          }
                          
                          return (
                            <div className="space-y-2">
                              {inversions.map((inversion, idx) => (
                                <div key={idx} className="bg-gradient-to-r from-blue-50 to-cyan-50 p-2 rounded-lg border border-blue-200">
                                  <div className="text-xs font-semibold text-blue-700 mb-1">
                                    {inversion.description}
                                  </div>
                                  <div className="font-mono text-sm text-blue-900">
                                    {inversion.notes}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    )}
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

      {/* Interfaccia del gioco Rebus */}
      {gameMode === 'rebus' && currentRebusChord && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[9998] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-300 z-[9999] w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-cyan-700">🎮 Puzzle Rebus - Livello {currentRebusChord.level}</h3>
            <button
                  onClick={() => setCurrentRebusChord(null)}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                  aria-label="Chiudi puzzle"
                >
                  ✕
            </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">🎵 Accordo: {currentRebusChord.sigla}</h4>
                  <p className="text-sm text-gray-700 mb-1">Formula: {currentRebusChord.formula}</p>
                  <p className="text-sm text-gray-700">Nome: {currentRebusChord.nome}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">🔍 Puzzle:</h4>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-lg font-mono text-blue-800">{currentRebusChord.puzzleNotes}</p>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Indovina le note mancanti</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">✍️ La tua risposta:</h4>
                  <input
                    type="text"
                    value={rebusAnswer}
                    onChange={(e) => setRebusAnswer(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && checkRebusAnswer()}
                    placeholder="Es: Mi Sol, Mi,Sol, Mi# Sol, Mi diesis Sol, Mib Sol, Mi bemolle Sol"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-800"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    💡 <strong>Formati accettati:</strong> Spazi, virgole, "Mi#", "Mi #", "Mi diesis", "Mib", "Mi b", "Mi bemolle" - Ordine libero!
                  </div>
                </div>
                
                <div className="flex gap-2">
            <button
                    onClick={checkRebusAnswer}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
                    ✅ Controlla
            </button>
          <button
                    onClick={() => setCurrentRebusChord(null)}
                    className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
                    ❌ Passa
          </button>
                </div>
                
                <div className="text-center text-sm text-gray-700">
                  Set {rebusCurrentSet} | Domande rimanenti: {Math.max(0, rebusQuestionsLeft)}/5 | Tentativi: {rebusAttempts} | Punteggio: {rebusScore}
              </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Riepilogo del set con errori */}
      {showReview && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[9998] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-300 z-[9999] w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-cyan-700">📊 Riepilogo Set {rebusCurrentSet}</h3>
                    <button
                  onClick={() => setShowReview(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100"
                  aria-label="Chiudi riepilogo"
                    >
                  ✕
                    </button>
                            </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Statistiche generali */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-3 text-left">📈 Statistiche</h4>
                  <div className="space-y-2 text-sm text-blue-800 text-left">

                    <div><strong>Livello:</strong> {rebusLevel}</div>
                    <div><strong>Punteggio finale:</strong> {rebusScore} punti</div>
                    <div><strong>Domande corrette:</strong> {5 - wrongAnswers.length}/5</div>
                    <div><strong>Errori totali:</strong> {wrongAnswers.length}</div>
                          </div>
                      </div>
                
                {/* Punteggio per livello */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-3 text-left">🎯 Punteggio per livello</h4>
                  <div className="text-sm text-green-800 text-left">
                    <div><strong>Livello {rebusLevel}:</strong> {6 - rebusLevel} punti per risposta corretta</div>
                    <div><strong>Punteggio massimo:</strong> {(6 - rebusLevel) * 5} punti</div>
                    <div><strong>Punteggio ottenuto:</strong> {rebusScore} punti</div>
                  </div>
                </div>
              </div>
              
              {/* Errori da ripassare */}
              {wrongAnswers.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-red-700 mb-4 text-lg text-left">❌ Errori da ripassare</h4>
                  <div className="space-y-4">
                    {wrongAnswers.map((error, index) => (
                      <div key={index} className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="font-semibold text-red-800 mb-2 text-left">
                              🎵 {error.chord}
                            </div>
                            <div className="text-sm text-red-700 space-y-1 text-left">
                              <div><strong>Nome:</strong> {error.chordName || 'N/A'}</div>
                              <div><strong>Livello:</strong> {error.level}</div>
                              <div><strong>Tentativi:</strong> {error.attempts}</div>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-red-700 space-y-1 text-left">
                              <div><strong>La tua risposta:</strong></div>
                              <div className="bg-white p-2 rounded border text-red-600">"{error.userAnswer}"</div>
                              <div><strong>Risposta corretta:</strong></div>
                              <div className="bg-white p-2 rounded border text-green-600 font-semibold">"{error.correctAnswer}"</div>
                            </div>
                          </div>
                        </div>
                  </div>
                ))}
              </div>
            </div>
          )}
              
              {/* Azioni */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-start">
                <button
                  onClick={generateNewSet}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  🆕 Nuovo Set
                </button>
                <button
                  onClick={() => setShowReview(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  📖 Chiudi Riepilogo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;