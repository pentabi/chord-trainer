import { useEffect, useState } from "react";
import type { Route } from "./+types/home";
import { Play, Repeat } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "chord-trainer" },
    { name: "description", content: "Welcome to Chord Trainer" },
  ];
}

export default function Home() {
  const [bgColor, setBgColor] = useState("#F59E42");
  const [key, setKey] = useState("C");
  const [visited, setVisited] = useState<boolean[]>(Array(7).fill(false));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentKeyChords, setCurrentKeyChords] = useState<string[]>([]);
  const [disabled, setDisabled] = useState<boolean[]>(Array(7).fill(false));
  const [showColorMenu, setShowColorMenu] = useState(false);

  const bgColorSelection = [
    "#F59E42", // Soft Orange
    "#9B87F5", // Soft Purple
    "#6BA4F6", // Sky Blue
    "#52C9A8", // Mint Green
    "#F87171", // Coral Red
    "#F3A6C3", // Rose Pink
    "#7DD3C0", // Turquoise
    "#A5B4FC", // Lavender
    "#67E8F9", // Light Cyan
    "#B4A08A", // Warm Taupe
    "#94A3B8", // Cool Gray
    "black",
  ];

  const handleReset = () => {
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
      newVisited[currentIndex] = true;
      return newVisited;
    });
  }, [currentIndex]);

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
      .map((isVisited, index) => (!isVisited && !disabled[index] ? index : -1))
      .filter((index) => index !== -1);

    if (unvisitedIndices.length === 0) {
      setVisited(Array(7).fill(false));
      const newArray = disabled
        .map((isDisabled, index) =>
          !isDisabled && index !== currentIndex ? index : -1
        )
        .filter((index) => index !== -1);
      const randomIndex = newArray[Math.floor(Math.random() * newArray.length)];
      setCurrentIndex(randomIndex);
      // console.log("step2: change currentIndex", randomIndex);
      return;
    }

    const randomIndex =
      unvisitedIndices[Math.floor(Math.random() * unvisitedIndices.length)];
    // console.log("step2: change currentIndex", randomIndex);
    setCurrentIndex(randomIndex);
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
      className="flex-1 flex  w-screen h-screen justify-center items-center "
      style={{ backgroundColor: bgColor }}
    >
      <h1 className="scroll-m-20 text-center text-[350px] font-extrabold tracking-tight text-balance text-white">
        {currentKeyChords[currentIndex]}
      </h1>
      {/* footer */}
      <div className="absolute bottom-12 space-x-12 flex flex-row items-center justify-center">
        {/* start */}
        <button className=" rounded-full w-32 h-32 bg-white hover:opacity-80 active:opacity-50 flex justify-center items-center">
          <Play size={55} color={bgColor} />
        </button>
        {/* switch */}
        <button
          onClick={handleSwitchChord}
          className=" rounded-full w-32 h-32 bg-white hover:opacity-80 active:opacity-50 flex justify-center items-center"
        >
          <Repeat size={55} color={bgColor} />
        </button>
        <div className="flex-row flex space-x-8">
          <h3 className="scroll-m-20 text-8xl font-light tracking-tight text-white opacity-50">
            1
          </h3>
          <h3 className="scroll-m-20 text-8xl font-light tracking-tight  text-white opacity-50">
            2
          </h3>
          <h3 className="scroll-m-20 text-8xl font-light tracking-tight  text-white opacity-50">
            3
          </h3>
          <h3 className="scroll-m-20 text-8xl font-light tracking-tight  text-white opacity-50">
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
            handleReset();
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
