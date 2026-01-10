import { useEffect, useState, useRef } from "react";
import type { Route } from "./+types/home";
import { Play, Repeat, Pause } from "lucide-react";
import * as Tone from "tone";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "chord-trainer" },
    { name: "description", content: "Welcome to Chord Trainer" },
  ];
}

export default function Home() {
  const [bgColor, setBgColor] = useState("black");
  const [key, setKey] = useState("C");
  const [visited, setVisited] = useState<boolean[]>(Array(7).fill(false));
  const [currentChord, setCurrentChord] = useState("---");
  const [prevChord, setPrevChord] = useState("---");
  const [nextIndex, setNextIndex] = useState(0);
  const [currentKeyChords, setCurrentKeyChords] = useState<string[]>([]);
  const [disabled, setDisabled] = useState<boolean[]>(Array(7).fill(false));
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [isMetronomeOn, setIsMetronomeOn] = useState(false);
  const [beat, setBeat] = useState(1);
  const [tempo, setTempo] = useState(60); // BPM
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const bgColorSelection = [
    "#F59E42", // Soft Orange
    "#9B87F5", // Soft Purple
    "#6BA4F6", // Sky Blue
    "#52C9A8", // Mint Green
    "#F87171", // Coral Red
    "#F3A6C3", // Rose Pink
    "#A5B4FC", // Lavender
    "#B4A08A", // Warm Taupe
    "#94A3B8", // Cool Gray
    "black",
  ];

  const playClickSound = async (pitch: string) => {
    await Tone.start();
    const synth = new Tone.MembraneSynth({
      pitchDecay: 1,
      octaves: 1,
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0,
        release: 0.05,
      },
      volume: -15,
    }).toDestination();
    synth.triggerAttackRelease(pitch, "8n");
  };

  const handlePlay = () => {
    if (isMetronomeOn) {
      // Stop metronome
      setIsMetronomeOn(false);
      setBeat(1);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else {
      // Start metronome
      resetVisited();
      setIsMetronomeOn(true);
      setBeat(1);
    }
  };

  // Metronome effect
  useEffect(() => {
    if (isMetronomeOn) {
      const intervalMs = 60000 / tempo; // Convert BPM to milliseconds
      intervalRef.current = setInterval(() => {
        setBeat((prevBeat) => {
          const nextBeat = prevBeat === 4 ? 1 : prevBeat + 1;
          // Use prevBeat instead of beat
          prevBeat === 4 ? playClickSound("C5") : playClickSound("C4");
          return nextBeat;
        });
      }, intervalMs);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isMetronomeOn, tempo]);

  // Trigger chord switch on beat 1
  useEffect(() => {
    if (isMetronomeOn && beat === 1) {
      // Check if all chords are visited
      const unvisitedCount = visited.filter(
        (v, i) => !v && !disabled[i]
      ).length;

      handleSwitchChord();
    }
  }, [beat]);

  const resetVisited = () => {
    setVisited(Array(7).fill(false));
  };

  //change currentKeyChords based on keychange
  useEffect(() => {
    const chords = keyMap[key].map(
      (note, index) => note + dominant_seventh[index]
    );
    setCurrentKeyChords(chords);
  }, [key]);

  //change visted status when currentIndex change
  useEffect(() => {
    // console.log("step3: detect currentIndex change:", currentIndex);
    setVisited((prev) => {
      const newVisited = [...prev];
      newVisited[nextIndex] = true;
      return newVisited;
    });
  }, [nextIndex]);

  const dominant_seventh = [
    "Maj7",
    "min7",
    "min7",
    "Maj7",
    "7",
    "min7",
    "min7b5",
  ];

  const enharmonicMap: Record<string, string> = {
    "C#": "Db",
    Db: "C#",
    "D#": "Eb",
    Eb: "D#",
    "F#": "Gb",
    Gb: "F#",
    "G#": "Ab",
    Ab: "G#",
    "A#": "Bb",
    Bb: "A#",
  };

  const handleKeyClick = (selectedKey: string) => {
    // If clicking the same key and it has an enharmonic equivalent, toggle
    if (key === selectedKey && enharmonicMap[selectedKey]) {
      setKey(enharmonicMap[selectedKey]);
    } else {
      setKey(selectedKey);
    }
  };

  const handleSwitchChord = () => {
    // console.log("step 1: handle switch called");
    const unvisitedIndices = visited
      .map((isVisited, index) =>
        !isVisited && !disabled[index] && index !== nextIndex ? index : -1
      )
      .filter((index) => index !== -1);

    if (unvisitedIndices.length === 0) {
      setVisited(Array(7).fill(false));
      const newArray = disabled
        .map((isDisabled, index) =>
          !isDisabled && index !== nextIndex ? index : -1
        )
        .filter((index) => index !== -1);
      const randomIndex = newArray[Math.floor(Math.random() * newArray.length)];
      setNextIndex(randomIndex);
      setPrevChord(currentChord);
      setCurrentChord(currentKeyChords[nextIndex]);
      // console.log("step2: change currentIndex", randomIndex);
      return;
    }

    const randomIndex =
      unvisitedIndices[Math.floor(Math.random() * unvisitedIndices.length)];
    // console.log("step2: change currentIndex", randomIndex);
    setNextIndex(randomIndex);
    setPrevChord(currentChord);
    setCurrentChord(currentKeyChords[nextIndex]);
  };

  const handleChordClick = (index: number) => {
    setDisabled((prev) => {
      const newDisabled = [...prev];
      newDisabled[index] = !prev[index];
      return newDisabled;
    });
  };

  const keyMap: Record<string, string[]> = {
    C: ["C", "D", "E", "F", "G", "A", "B"],
    "C#": ["C#", "D#", "E#", "F#", "G#", "A#", "B#"],
    Db: ["Db", "Eb", "F", "Gb", "Ab", "Bb", "C"],
    D: ["D", "E", "F#", "G", "A", "B", "C#"],
    "D#": ["D#", "E#", "F##", "G#", "A#", "B#", "C##"],
    Eb: ["Eb", "F", "G", "Ab", "Bb", "C", "D"],
    E: ["E", "F#", "G#", "A", "B", "C#", "D#"],
    F: ["F", "G", "A", "Bb", "C", "D", "E"],
    "F#": ["F#", "G#", "A#", "B", "C#", "D#", "E#"],
    Gb: ["Gb", "Ab", "Bb", "Cb", "Db", "Eb", "F"],
    G: ["G", "A", "B", "C", "D", "E", "F#"],
    "G#": ["G#", "A#", "B#", "C#", "D#", "E#", "F##"],
    Ab: ["Ab", "Bb", "C", "Db", "Eb", "F", "G"],
    A: ["A", "B", "C#", "D", "E", "F#", "G#"],
    "A#": ["A#", "B#", "C##", "D#", "E#", "F##", "G##"],
    Bb: ["Bb", "C", "D", "Eb", "F", "G", "A"],
    B: ["B", "C#", "D#", "E", "F#", "G#", "A#"],
    Cb: ["Cb", "Db", "Eb", "Fb", "Gb", "Ab", "Bb"],
  };

  return (
    <div
      className="flex-1 flex  w-screen h-screen justify-center items-center select-none"
      style={{ backgroundColor: bgColor }}
    >
      {/* prev chord */}
      <div className="absolute left-60 top-20 flex leading-tight flex-col">
        <h1 className=" text-center  text-[75px] font-extrabold tracking-tight text-balance text-white">
          {prevChord}
        </h1>
        <h2 className="scroll-m-20 text-center   text-[25px] font-extrabold tracking-tight text-balance text-white">
          previous chord
        </h2>
      </div>
      {/* next chord */}
      <div className=" absolute right-60 top-20 flex leading-tight flex-col">
        <h1 className=" text-center text-[75px] font-extrabold tracking-tight text-balance text-white">
          {currentKeyChords[nextIndex]}
        </h1>
        <h2 className="scroll-m-20 text-center text-[25px] font-extrabold tracking-tight text-balance text-white">
          next chord
        </h2>
      </div>

      <div className="flex leading-tight flex-col">
        <h1 className=" text-center  text-[250px] font-extrabold tracking-tight text-balance text-white">
          {currentChord}
        </h1>
        <h2 className="scroll-m-20 text-center text-[50px] font-extrabold tracking-tight text-balance text-white">
          current chord
        </h2>
      </div>

      {/* footer */}
      <div className="absolute bottom-12 space-x-12 flex flex-row items-center justify-center">
        {/* start */}
        <button
          onClick={handlePlay}
          className=" rounded-full w-32 h-32 bg-white hover:opacity-80 active:opacity-50 flex justify-center items-center"
        >
          {isMetronomeOn ? (
            <Pause size={55} color={bgColor} />
          ) : (
            <Play size={55} color={bgColor} />
          )}
        </button>
        {/* switch */}
        <button
          disabled={isMetronomeOn}
          onClick={handleSwitchChord}
          className=" rounded-full w-32 h-32 disabled:opacity-30 bg-white hover:opacity-80 active:opacity-50 flex justify-center items-center"
        >
          <Repeat size={55} color={bgColor} />
        </button>
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setTempo((t) => Math.max(30, t - 10))}
              className="w-12 h-12 rounded-full bg-white hover:opacity-80 active:opacity-50 flex justify-center items-center text-2xl font-bold"
              style={{ color: bgColor }}
            >
              -
            </button>
            <h3 className="scroll-m-20 text-4xl font-light tracking-tight text-white w-24 text-center">
              {tempo}
            </h3>
            <button
              onClick={() => setTempo((t) => Math.min(240, t + 10))}
              className="w-12 h-12 rounded-full bg-white hover:opacity-80 active:opacity-50 flex justify-center items-center text-2xl font-bold"
              style={{ color: bgColor }}
            >
              +
            </button>
          </div>
          <h4 className="text-xl text-white opacity-70">BPM</h4>
        </div>
        <div className="flex-row flex space-x-8">
          <h3
            className={`scroll-m-20 text-8xl font-light tracking-tight text-white ${beat === 1 && isMetronomeOn ? "opacity-100" : "opacity-50"}`}
          >
            1
          </h3>
          <h3
            className={`scroll-m-20 text-8xl font-light tracking-tight text-white ${beat === 2 && isMetronomeOn ? "opacity-100" : "opacity-50"}`}
          >
            2
          </h3>
          <h3
            className={`scroll-m-20 text-8xl font-light tracking-tight text-white ${beat === 3 && isMetronomeOn ? "opacity-100" : "opacity-50"}`}
          >
            3
          </h3>
          <h3
            className={`scroll-m-20 text-8xl font-light tracking-tight text-white ${beat === 4 && isMetronomeOn ? "opacity-100" : "opacity-50"}`}
          >
            4
          </h3>
        </div>
      </div>
      {/* left */}
      <div className="flex flex-col absolute left-6 space-y-4">
        <button
          onClick={() => handleKeyClick("C")}
          className=" rounded-full w-24 h-24 bg-white hover:opacity-80 active:opacity-50 flex justify-center items-center"
        >
          <h3
            className="scroll-m-20 text-6xl font-light "
            style={{ color: bgColor }}
          >
            C
          </h3>
        </button>
        <button
          onClick={() => handleKeyClick("D")}
          className=" rounded-full w-24 h-24 bg-white hover:opacity-80 active:opacity-50 flex justify-center items-center"
        >
          <h3
            className="scroll-m-20 text-6xl font-light "
            style={{ color: bgColor }}
          >
            D
          </h3>
        </button>
        <button
          onClick={() => handleKeyClick("E")}
          className=" rounded-full w-24 h-24 bg-white hover:opacity-80 active:opacity-50 flex justify-center items-center"
        >
          <h3
            className="scroll-m-20 text-6xl font-light "
            style={{ color: bgColor }}
          >
            E
          </h3>
        </button>
        <button
          onClick={() => handleKeyClick("F")}
          className=" rounded-full w-24 h-24 bg-white hover:opacity-80 active:opacity-50 flex justify-center items-center"
        >
          <h3
            className="scroll-m-20 text-6xl font-light "
            style={{ color: bgColor }}
          >
            F
          </h3>
        </button>
        <button
          onClick={() => handleKeyClick("G")}
          className=" rounded-full w-24 h-24 bg-white hover:opacity-80 active:opacity-50 flex justify-center items-center"
        >
          <h3
            className="scroll-m-20 text-6xl font-light "
            style={{ color: bgColor }}
          >
            G
          </h3>
        </button>
        <button
          onClick={() => handleKeyClick("A")}
          className=" rounded-full w-24 h-24 bg-white hover:opacity-80 active:opacity-50 flex justify-center items-center"
        >
          <h3
            className="scroll-m-20 text-6xl font-light "
            style={{ color: bgColor }}
          >
            A
          </h3>
        </button>
        <button
          onClick={() => handleKeyClick("B")}
          className=" rounded-full w-24 h-24 bg-white hover:opacity-80 active:opacity-50 flex justify-center items-center"
        >
          <h3
            className="scroll-m-20 text-6xl font-light "
            style={{ color: bgColor }}
          >
            B
          </h3>
        </button>
        {/* sharps and flats */}
        <div className="absolute left-24 top-14 space-y-4">
          <button
            onClick={() => handleKeyClick("Db")}
            className=" rounded-full w-24 h-24 bg-white hover:opacity-80 active:opacity-50 flex justify-center items-center"
          >
            <h3
              className="scroll-m-20 text-3xl font-light "
              style={{ color: bgColor }}
            >
              C#/Db
            </h3>
          </button>
          <button
            onClick={() => handleKeyClick("Eb")}
            className=" rounded-full w-24 h-24 bg-white hover:opacity-80 active:opacity-50 flex justify-center items-center"
          >
            <h3
              className="scroll-m-20 text-3xl font-light "
              style={{ color: bgColor }}
            >
              D#/Eb
            </h3>
          </button>
          <div className="h-24" />
          <button
            onClick={() => handleKeyClick("F#")}
            className=" rounded-full w-24 h-24 bg-white hover:opacity-80 active:opacity-50 flex justify-center items-center"
          >
            <h3
              className="scroll-m-20 text-3xl font-light "
              style={{ color: bgColor }}
            >
              F#/Gb
            </h3>
          </button>
          <button
            onClick={() => handleKeyClick("Ab")}
            className=" rounded-full w-24 h-24 bg-white hover:opacity-80 active:opacity-50 flex justify-center items-center"
          >
            <h3
              className="scroll-m-20 text-3xl font-light "
              style={{ color: bgColor }}
            >
              G#/Ab
            </h3>
          </button>
          <button
            onClick={() => handleKeyClick("Bb")}
            className=" rounded-full w-24 h-24 bg-white hover:opacity-80 active:opacity-50 flex justify-center items-center"
          >
            <h3
              className="scroll-m-20 text-3xl font-light "
              style={{ color: bgColor }}
            >
              A#/Bb
            </h3>
          </button>
        </div>
        {/* top */}
      </div>
      <div className="absolute top-12">
        <h3 className="scroll-m-20 text-6xl font-light text-white">
          Key: {key}
        </h3>
      </div>
      {/* color menu */}
      <div className="absolute top-12 right-12 z-1000">
        <button
          onClick={() => setShowColorMenu(!showColorMenu)}
          className="hover:opacity-70 active:opacity-50 border-white w-16 h-16 rounded-full border-4 "
        ></button>

        {showColorMenu && (
          <div className="mt-4 flex flex-col space-y-2 bg-white rounded-2xl p-4 absolute right-0">
            {bgColorSelection.map((color) => (
              <button
                key={color}
                onClick={() => {
                  setBgColor(color);
                  setShowColorMenu(false);
                }}
                className="w-16 h-16 rounded-full hover:opacity-80 active:opacity-50 border-4 border-white shadow-lg"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}
      </div>
      {/* right */}
      <div className="absolute right-12 flex flex-col items-center justify-center">
        <button
          className="hover:opacity-70 active:opacity-50 flex items-center justify-center "
          onClick={() => {
            resetVisited();
          }}
        >
          <h3 className="scroll-m-20 text-6xl font-light text-white text-center">
            reset
          </h3>
        </button>

        <div className="flex flex-col rounded-2xl  w-48 items-center justify-center mt-12">
          <button
            onClick={() => handleChordClick(0)}
            className="items-center justify-center flex flex-1 w-full  not-last:border-b p-2 py-4 rounded-t-2xl bg-white hover:opacity-80 active:opacity-50"
            style={{
              borderColor: bgColor,
              opacity: disabled[0] ? 0.3 : visited[0] ? 0.7 : 1,
            }}
          >
            <h3
              className="scroll-m-20 text-4xl font-light  "
              style={{ color: bgColor }}
            >
              {currentKeyChords[0]}
            </h3>
          </button>
          <button
            onClick={() => handleChordClick(1)}
            className="items-center justify-center flex flex-1 w-full  not-last:border-b p-2  py-4 bg-white hover:opacity-80 active:opacity-50"
            style={{
              borderColor: bgColor,
              opacity: disabled[1] ? 0.3 : visited[1] ? 0.7 : 1,
            }}
          >
            <h3
              className="scroll-m-20 text-4xl font-light "
              style={{ color: bgColor }}
            >
              {currentKeyChords[1]}
            </h3>
          </button>
          <button
            onClick={() => handleChordClick(2)}
            className="items-center justify-center flex flex-1 w-full  not-last:border-b p-2  py-4  bg-white hover:opacity-80 active:opacity-50"
            style={{
              borderColor: bgColor,
              opacity: disabled[2] ? 0.3 : visited[2] ? 0.7 : 1,
            }}
          >
            <h3
              className="scroll-m-20 text-4xl font-light "
              style={{ color: bgColor }}
            >
              {currentKeyChords[2]}
            </h3>
          </button>
          <button
            onClick={() => handleChordClick(3)}
            className="items-center justify-center flex flex-1 w-full  not-last:border-b p-2 py-4  bg-white hover:opacity-80 active:opacity-50"
            style={{
              borderColor: bgColor,
              opacity: disabled[3] ? 0.3 : visited[3] ? 0.7 : 1,
            }}
          >
            <h3
              className="scroll-m-20 text-4xl font-light "
              style={{ color: bgColor }}
            >
              {currentKeyChords[3]}
            </h3>
          </button>
          <button
            onClick={() => handleChordClick(4)}
            className="items-center justify-center flex flex-1 w-full  not-last:border-b p-2 py-4  bg-white hover:opacity-80 active:opacity-50"
            style={{
              borderColor: bgColor,
              opacity: disabled[4] ? 0.3 : visited[4] ? 0.7 : 1,
            }}
          >
            <h3
              className="scroll-m-20 text-4xl font-light "
              style={{ color: bgColor }}
            >
              {currentKeyChords[4]}
            </h3>
          </button>
          <button
            onClick={() => handleChordClick(5)}
            className="items-center justify-center flex flex-1 w-full  not-last:border-b p-2 py-4  bg-white hover:opacity-80 active:opacity-50"
            style={{
              borderColor: bgColor,
              opacity: disabled[5] ? 0.3 : visited[5] ? 0.7 : 1,
            }}
          >
            <h3
              className="scroll-m-20 text-4xl font-light "
              style={{ color: bgColor }}
            >
              {currentKeyChords[5]}
            </h3>
          </button>
          <button
            onClick={() => handleChordClick(6)}
            className="items-center justify-center flex flex-1 w-full not-last:border-b p-2 py-4  bg-white rounded-b-2xl hover:opacity-80 active:opacity-50"
            style={{
              borderColor: bgColor,
              opacity: disabled[6] ? 0.3 : visited[6] ? 0.7 : 1,
            }}
          >
            <h3
              className="scroll-m-20 text-4xl font-light "
              style={{ color: bgColor }}
            >
              {currentKeyChords[6]}
            </h3>
          </button>
        </div>
      </div>
    </div>
  );
}
