import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

const PianoChordApp = () => {
  // Stati principali
  const [selectedCategory, setSelectedCategory] = useState('triadi');
  const [selectedChord, setSelectedChord] = useState('C');
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Stati per animazioni e feedback visivo
  const [activeKeys, setActiveKeys] = useState(new Set());
  const [keyAnimations, setKeyAnimations] = useState(new Map());
  const audioContextRef = useRef(null);

  // All piano keys for display (2 ottave complete: C3-C5)
  const pianoKeys = [
    { note: 'C3', type: 'white' },
    { note: 'C#3', type: 'black' },
    { note: 'D3', type: 'white' },
    { note: 'D#3', type: 'black' },
    { note: 'E3', type: 'white' },
    { note: 'F3', type: 'white' },
    { note: 'F#3', type: 'black' },
    { note: 'G3', type: 'white' },
    { note: 'G#3', type: 'black' },
    { note: 'A3', type: 'white' },
    { note: 'A#3', type: 'black' },
    { note: 'B3', type: 'white' },
    { note: 'C4', type: 'white' },
    { note: 'C#4', type: 'black' },
    { note: 'D4', type: 'white' },
    { note: 'D#4', type: 'black' },
    { note: 'E4', type: 'white' },
    { note: 'F4', type: 'white' },
    { note: 'F#4', type: 'black' },
    { note: 'G4', type: 'white' },
    { note: 'G#4', type: 'black' },
    { note: 'A4', type: 'white' },
    { note: 'A#4', type: 'black' },
    { note: 'B4', type: 'white' },
    { note: 'C5', type: 'white' }
  ];

  // Database accordi completo basato sul CSV
  const chordDatabase = {
    triadi: {
      'C': { name: 'Do maggiore', notes: ['C4', 'E4', 'G4'], intervals: '1 3 5' },
      'Cm': { name: 'Do minore', notes: ['C4', 'D#4', 'G4'], intervals: '1 b3 5' },
      'Caug': { name: 'Do aumentato', notes: ['C4', 'E4', 'G#4'], intervals: '1 3 #5' },
      'Cdim': { name: 'Do diminuito', notes: ['C4', 'D#4', 'F#4'], intervals: '1 b3 b5' },
      'Csus2': { name: 'Do seconda sospesa', notes: ['C4', 'D4', 'G4'], intervals: '1 2 5' },
      'Csus4': { name: 'Do quarta sospesa', notes: ['C4', 'F4', 'G4'], intervals: '1 4 5' }
    },
    quadriadi: {
      'C6': { name: 'Do sesta', notes: ['C4', 'E4', 'G4', 'A4'], intervals: '1 3 5 6' },
      'Cm6': { name: 'Do minore sesta', notes: ['C4', 'D#4', 'G4', 'A4'], intervals: '1 b3 5 6' },
      'C7': { name: 'Do settima (dominante)', notes: ['C4', 'E4', 'G4', 'A#4'], intervals: '1 3 5 b7' },
      'Cmaj7': { name: 'Do settima maggiore', notes: ['C4', 'E4', 'G4', 'B4'], intervals: '1 3 5 7' },
      'Cm7': { name: 'Do minore settima', notes: ['C4', 'D#4', 'G4', 'A#4'], intervals: '1 b3 5 b7' },
      'Cm7b5': { name: 'Do semidiminuito', notes: ['C4', 'D#4', 'F#4', 'A#4'], intervals: '1 b3 b5 b7' },
      'Cm(maj7)': { name: 'Do minore settima maggiore', notes: ['C4', 'D#4', 'G4', 'B4'], intervals: '1 b3 5 7' },
      'Cmaj7#5': { name: 'Do settima maggiore quinta aumentata', notes: ['C4', 'E4', 'G#4', 'B4'], intervals: '1 3 #5 7' },
      'C7#5': { name: 'Do settima quinta aumentata', notes: ['C4', 'E4', 'G#4', 'A#4'], intervals: '1 3 #5 b7' },
      'C7b5': { name: 'Do settima quinta diminuita', notes: ['C4', 'E4', 'F#4', 'A#4'], intervals: '1 3 b5 b7' },
      'Cmaj7b5': { name: 'Do settima maggiore quinta diminuita', notes: ['C4', 'E4', 'F#4', 'B4'], intervals: '1 3 b5 7' },
      'Cdim(maj7)': { name: 'Do diminuito settima maggiore', notes: ['C4', 'D#4', 'F#4', 'B4'], intervals: '1 b3 b5 7' },
      'C7sus4': { name: 'Do settima quarta sospesa', notes: ['C4', 'F4', 'G4', 'A#4'], intervals: '1 4 5 b7' }
    },
    estese: {
      'C9': { name: 'Do nona (dominante)', notes: ['C4', 'E4', 'G4', 'A#4', 'D5'], intervals: '1 3 5 b7 9' },
      'Cmaj9': { name: 'Do nona maggiore', notes: ['C4', 'E4', 'G4', 'B4', 'D5'], intervals: '1 3 5 7 9' },
      'Cm9': { name: 'Do minore nona', notes: ['C4', 'D#4', 'G4', 'A#4', 'D5'], intervals: '1 b3 5 b7 9' },
      'C11': { name: 'Do undicesima (dominante)', notes: ['C4', 'E4', 'G4', 'A#4', 'D5', 'F5'], intervals: '1 3 5 b7 9 11' },
      'Cm11': { name: 'Do minore undicesima', notes: ['C4', 'D#4', 'G4', 'A#4', 'D5', 'F5'], intervals: '1 b3 5 b7 9 11' },
      'C13': { name: 'Do tredicesima (dominante)', notes: ['C4', 'E4', 'G4', 'A#4', 'D5', 'A5'], intervals: '1 3 5 b7 9 13' },
      'Cmaj13': { name: 'Do tredicesima maggiore', notes: ['C4', 'E4', 'G4', 'B4', 'D5', 'A5'], intervals: '1 3 5 7 9 13' },
      'C13sus4': { name: 'Do tredicesima sospesa', notes: ['C4', 'F4', 'G4', 'A#4', 'D5', 'A5'], intervals: '1 4 5 b7 9 13' },
      'C7b9': { name: 'Do settima nona diminuita', notes: ['C4', 'E4', 'G4', 'A#4', 'C#5'], intervals: '1 3 5 b7 b9' },
      'C7#9': { name: 'Do settima nona aumentata', notes: ['C4', 'E4', 'G4', 'A#4', 'D#5'], intervals: '1 3 5 b7 #9' },
      'C7b9#5': { name: 'Do settima nona dim. quinta aum.', notes: ['C4', 'E4', 'G#4', 'A#4', 'C#5'], intervals: '1 3 #5 b7 b9' },
      'C7b13': { name: 'Do settima tredicesima diminuita', notes: ['C4', 'E4', 'G4', 'A#4', 'G#5'], intervals: '1 3 5 b7 b13' }
    }
  };

  const currentChords = chordDatabase[selectedCategory];
  const currentChord = currentChords[selectedChord];

  // Funzione per verificare se un tasto è parte dell'accordo
  const isKeyInChord = (note) => {
    return currentChord?.notes.includes(note);
  };

  // Funzione per ottenere la frequenza di una nota
  const getNoteFrequency = (note) => {
    const noteMap = {
      'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
      'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
    };
    
    const noteName = note.slice(0, -1);
    const octave = parseInt(note.slice(-1));
    const semitoneFromA4 = (octave - 4) * 12 + noteMap[noteName] - 9;
    return 440 * Math.pow(2, semitoneFromA4 / 12);
  };

  // Funzione per suonare una singola nota
  const playNote = (note) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(getNoteFrequency(note), audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  // Funzione per suonare l'accordo
  const playChord = async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      const gainNode = audioContext.createGain();
      gainNode.connect(audioContext.destination);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);

      currentChord.notes.forEach((note, index) => {
        const oscillator = audioContext.createOscillator();
        const noteGain = audioContext.createGain();
        
        oscillator.connect(noteGain);
        noteGain.connect(gainNode);
        
        oscillator.frequency.setValueAtTime(getNoteFrequency(note), audioContext.currentTime);
        oscillator.type = 'sine';
        
        noteGain.gain.setValueAtTime(0, audioContext.currentTime);
        noteGain.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
        noteGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 2);
      });

      setTimeout(() => setIsPlaying(false), 2000);
    } catch (error) {
      console.error('Errore nella riproduzione audio:', error);
      setIsPlaying(false);
    }
  };

  // Render della tastiera piano migliorata
  const renderPiano = () => {
    const whiteKeys = pianoKeys.filter(key => key.type === 'white');
    const blackKeys = pianoKeys.filter(key => key.type === 'black');

    return (
      <div className="flex justify-center px-8 mb-8">
        <div className="relative bg-gray-200 p-4 rounded-2xl shadow-sm" style={{width: '928px'}}>
          <div className="relative">
            {/* Tasti bianchi */}
            <div className="flex">
              {whiteKeys.map((key) => {
                const isActive = isKeyInChord(key.note);
                const animationKey = keyAnimations.get(key.note) || 0;
                
                return (
                  <button
                    key={key.note}
                    onMouseDown={() => playNote(key.note)}
                    className={`
                      w-16 h-64 border border-gray-300 rounded-b-xl
                      hover:bg-gray-50 active:bg-gray-100
                      transition-all duration-300
                      ${isActive ? 'bg-teal-200 border-teal-400' : 'bg-white'}
                    `}
                    style={{
                      animationDuration: '0.6s',
                      animationIterationCount: '1',
                      animationKey: animationKey
                    }}
                  >
                    {isActive && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full bg-teal-600" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tasti neri */}
            <div className="absolute top-0 left-0">
              {blackKeys.map((key, index) => {
                // Posizionamento preciso per 2 ottave: tasti neri a cavallo delle note bianche
                const blackKeyPositions = {
                  'C#3': 0.7,   // tasto nero 1: spostato verso destra per centrare meglio
                  'D#3': 1.7,   // tasto nero 2: spostato verso destra per centrare meglio
                  'F#3': 3.5,   // tasto nero 3: a cavallo fra nota bianca 4 e 5
                  'G#3': 4.5,   // tasto nero 4: a cavallo fra nota bianca 5 e 6
                  'A#3': 5.5,   // tasto nero 5: a cavallo fra nota bianca 6 e 7
                  'C#4': 7.3,   // tasto nero 6: spostato leggermente a sinistra per centrare meglio
                  'D#4': 8.3,   // tasto nero 7: spostato leggermente a sinistra per centrare meglio
                  'F#4': 10.3,  // tasto nero 8: spostato leggermente a sinistra per centrare meglio
                  'G#4': 11.3,  // tasto nero 9: spostato leggermente a sinistra per centrare meglio
                  'A#4': 12.2   // tasto nero 10: spostato leggermente a sinistra per centrare meglio
                };
                
                const position = blackKeyPositions[key.note];
                const leftOffset = (position * 64) - 24; // 64px per tasto bianco, -24px per centrare
                const isActive = isKeyInChord(key.note);
                const animationKey = keyAnimations.get(key.note) || 0;
                
                return (
                  <button
                    key={key.note}
                    onMouseDown={() => playNote(key.note)}
                    style={{ 
                      left: `${leftOffset + 4}px`,
                      animationKey: animationKey
                    }}
                    className={`
                      absolute w-12 h-40 border border-gray-800 rounded-b-lg shadow-2xl text-white
                      hover:bg-gray-800 active:bg-gray-700
                      transition-all duration-300 z-10
                      ${isActive ? 'bg-teal-600 border-teal-500' : 'bg-black'}
                    `}
                  >
                    {isActive && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full bg-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Accordi Pianoforte</h1>
          <p className="text-gray-600">Impara gli accordi Pop/Jazz • Triadi & Quadriadi</p>
        </div>

        {/* Controlli categorie */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-lg">
            {Object.keys(chordDatabase).map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setSelectedChord(Object.keys(chordDatabase[category])[0]);
                }}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category === 'triadi' ? 'Triadi' : 
                 category === 'quadriadi' ? 'Quadriadi' : 
                 'Accordi Estesi'}
              </button>
            ))}
          </div>
        </div>

        {/* Selezione accordo e info */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Selezione accordo */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Seleziona Accordo</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.keys(currentChords).map((chord) => (
                  <button
                    key={chord}
                    onClick={() => setSelectedChord(chord)}
                    className={`p-3 rounded-lg font-medium transition-all ${
                      selectedChord === chord
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {chord}
                  </button>
                ))}
              </div>
            </div>

            {/* Info accordo */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Informazioni Accordo</h3>
              {currentChord && (
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-teal-600">{selectedChord}</span>
                    <span className="text-gray-600 ml-2">({currentChord.name})</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Note: </span>
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                      {currentChord.notes.map(note => note.slice(0, -1)).join(' - ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Intervalli: </span>
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                      {currentChord.intervals}
                    </span>
                  </div>
                  <button
                    onClick={playChord}
                    disabled={isPlaying}
                    className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    {isPlaying ? 'Riproduzione...' : 'Suona Accordo'}
                    <Volume2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tastiera Piano */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-center">Tastiera Piano</h3>
          {renderPiano()}
          <p className="text-center text-sm text-gray-500 mt-4">
            I tasti evidenziati in blu petrolio fanno parte dell'accordo selezionato. Clicca sui tasti per sentire le singole note.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Basato sulla guida "Accordi Pianoforte" di Silvia Platania - Sognandoilpiano</p>
        </div>
      </div>
    </div>
  );
};

export default PianoChordApp;