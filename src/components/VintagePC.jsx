import { Suspense, useRef, useState, useEffect, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";

const IDLE_POS    = new THREE.Vector3(0, 0, 1);
const FOCUSED_POS = new THREE.Vector3(0.05, 0.042, 0.55);

const CW = 6144;
const CH = 4000;

const FONT_MAIN  = "bold 18px 'Courier New', monospace";
const LINE_H     = 22;
const PAD_X      = 330;
const PAD_Y      = 1350;
const PROMPT_Y   = PAD_Y + 250;

const COMMANDS = {
  help: {
    desc: "Show available commands",
    exec: () => {
      const names = Object.keys(COMMANDS);
      return [
        "Available commands:",
        ...names.map(c => `  ${c.padEnd(12)} ${COMMANDS[c].desc}`),
      ];
    },
  },
  whoami: {
    desc: "About me",
    exec: () => [
      "NAME    Kovacs Adam",
      "AGE     24",
      "STATUS  Finance & CS student",
      "STYLE   Simple. Clean. Blazingly fast.",
      "",
      "Based in Hungary. Building for everywhere.",
    ],
  },
  origin: {
    desc: "How it started",
    exec: () => [
      "TIMELINE:",
      "  RollerCoaster Tycoon",
      "  Minecraft redstone",
      "  Java mod: planes & balloons",
      "  Trojan avoided. Barely.",
      "  Factorio brain unlocked",
      "  -> HERE",
    ],
  },
  interests: {
    desc: "Current interests",
    exec: () => [
      "CURRENT  C++ (learning)",
      "NEXT     Rust",
      "PAST     Solana algo trading",
      "",
      "Theories -> testable, measurable code.",
      "High perf. Low level. No bloat.",
    ],
  },
  site: {
    desc: "About this site",
    exec: () => [
      "Stack: Astro . Three.js . React",
      "",
      "Sites should have a soul.",
      "Each pixel placed with intent.",
      "",
      "github.com/kadam-x/portfolio-website",
    ],
  },
  contact: {
    desc: "Contact info",
    exec: () => [
      "adam.kovacs@example.com",
      "github.com/kadam-x",
    ],
  },
};

function CameraRig({ focused }) {
  const { camera } = useThree();
  const snapRef = useRef(true);
  useFrame(() => {
    const target = focused ? FOCUSED_POS : IDLE_POS;
    if (snapRef.current) {
      camera.position.copy(target);
      snapRef.current = false;
    } else {
      camera.position.lerp(target, 0.025);
    }
  });
  return null;
}

function LightsRig() {
  const lightRef = useRef();
  useFrame(() => {
    if (!lightRef.current) return;
    const base = 1.5;
    const flicker = Math.random() * 0.4 + 0.8;
    lightRef.current.intensity = base * flicker;
  });
  return (
    <>
      <ambientLight intensity={0} />
      <spotLight
        ref={lightRef}
        position={[0, 0.8, 0.55]}
        angle={0.4}
        penumbra={0.6}
        decay={1}
        distance={1.8}
        intensity={1.5}
      />
    </>
  );
}

function DeskMesh() {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext("2d");

    const img = ctx.createImageData(512, 512);
    for (let i = 0; i < img.data.length; i += 4) {
      const grain = Math.random() * 120 + 80;
      const n = (Math.random() * 80 + grain) | 0;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = n;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);

    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const w = Math.random() * 120 + 5;
      ctx.strokeStyle = `rgba(0,0,0,${Math.random() * 0.15})`;
      ctx.lineWidth = Math.random() * 3 + 0.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w * (Math.random() - 0.5), y + w * (Math.random() - 0.15));
      ctx.stroke();
    }

    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 4 + 1, 0, Math.PI * 2);
      ctx.fill();
    }

    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 2);
    return t;
  }, []);

  return (
    <mesh position={[0, -0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[2.5, 0.8]} />
      <meshStandardMaterial
        color="#020202"
        emissive="#020202"
        emissiveIntensity={0}
        map={tex}
        bumpMap={tex}
        bumpScale={0.008}
        roughnessMap={tex}
        roughness={1.0}
        metalness={0.0}
      />
    </mesh>
  );
}

function Scene({ focused, setFocused, terminalTexture, onInteract }) {
  const { scene } = useGLTF("/models/computer.glb");
  const orbitRef     = useRef();
  const screenMatRef = useRef(null);

  useEffect(() => {
    scene.traverse((node) => {
      if (node.isMesh) {
        const name = node.name.toLowerCase();
        if (name === "screen_glass_screen_0") {
          const mat = new THREE.MeshStandardMaterial({
            map:               terminalTexture,
            emissiveMap:       terminalTexture,
            emissive:          new THREE.Color(0x004400),
            emissiveIntensity: 0.6,
            roughness:         0.3,
            metalness:         0.0,
          });
          node.material        = mat;
          screenMatRef.current = mat;
        }
        if (name.includes("table") || name.includes("desk") || name.includes("base") || name.includes("floor")) {
          node.visible = false;
        }
      }
    });
  }, [scene]);

  useEffect(() => {
    if (screenMatRef.current) {
      screenMatRef.current.map         = terminalTexture;
      screenMatRef.current.emissiveMap = terminalTexture;
      screenMatRef.current.needsUpdate = true;
    }
  }, [terminalTexture]);

  useEffect(() => {
    if (orbitRef.current) orbitRef.current.enabled = !focused;
  }, [focused]);

  return (
    <>
      <CameraRig focused={focused} />
      <primitive
        object={scene}
        onClick={() => {
          if (!focused) {
            setFocused(true);
            if (onInteract) onInteract();
          }
        }}
      />
      <DeskMesh />
      <OrbitControls
        ref={orbitRef}
        enablePan={false}
        target={[0.05, 0, 0]}
        minPolarAngle={0}
        maxPolarAngle={Math.PI * 0.55}
      />
    </>
  );
}

export default function VintagePC() {
  const [focused, setFocused] = useState(false);
  const [input,   setInput]   = useState("");
  const [output,  setOutput]  = useState([
    "Welcome to my terminal! Type 'help' for available commands.",
  ]);
  const [cursor,  setCursor]  = useState(true);

  const inputRef        = useRef("");
  const hasInteractedRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => setCursor(c => !c), 530);
    return () => clearInterval(id);
  }, []);

  const handleCommand = useCallback((cmd) => {
    const trimmed = cmd.trim().toLowerCase();
    if (trimmed === "") return;
    if (trimmed === "clear") {
      setOutput([]);
      return;
    }
    const command = COMMANDS[trimmed];
    if (command) {
      setOutput(prev => [...prev, `$ ${cmd}`, ...command.exec()]);
    } else {
      setOutput(prev => [...prev, `$ ${cmd}`, `Command not found: '${trimmed}'. Type 'help' for available commands.`]);
    }
  }, []);

  useEffect(() => {
    const handler = (e) => {
      hasInteractedRef.current = true;
      if (e.key === "Escape") { setFocused(false); return; }
      if (!focused) return;

      if (e.key === "Enter") {
        handleCommand(inputRef.current);
        setInput("");
        inputRef.current = "";
        return;
      }
      if (e.key === "Backspace") {
        setInput(prev => {
          const next = prev.slice(0, -1);
          inputRef.current = next;
          return next;
        });
        return;
      }
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key.length === 1) {
        setInput(prev => {
          const next = prev + e.key;
          inputRef.current = next;
          return next;
        });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [focused, handleCommand]);

  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  if (!canvasRef.current) {
    const c = document.createElement("canvas");
    c.width  = CW;
    c.height = CH;
    canvasRef.current = c;
  }

  useEffect(() => {
    const id = setTimeout(() => setReady(true), 400);
    return () => clearTimeout(id);
  }, []);

  const [textureKey, setTextureKey] = useState(0);
  const prevTextureRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#050e05";
    ctx.fillRect(0, 0, CW, CH);

    ctx.fillStyle = "rgba(0,0,0,0.15)";
    for (let sy = 0; sy < CH; sy += 4) {
      ctx.fillRect(0, sy, CW, 2);
    }

    const maxLines = Math.floor((PROMPT_Y - PAD_Y) / LINE_H);
    const visible = output.slice(-maxLines);

    let y = PAD_Y;
    for (const line of visible) {
      ctx.font = FONT_MAIN;
      ctx.fillStyle = line.startsWith("$ ") ? "#2d7a2d" : "#afffaf";
      ctx.fillText(line, PAD_X, y);
      y += LINE_H;
    }

    if (!focused && !hasInteractedRef.current) {
      ctx.font = FONT_MAIN;
      ctx.fillStyle = "#2d7a2d";
      ctx.fillText("> click to interact", PAD_X, y);
      setTextureKey(k => k + 1);
      return;
    }

    if (focused) {
      ctx.font = FONT_MAIN;
      ctx.fillStyle = "#2d7a2d";
      ctx.fillText("> " + input, PAD_X, PROMPT_Y);

      if (cursor) {
        ctx.font = FONT_MAIN;
        const promptWidth = ctx.measureText("> " + input).width;
        ctx.fillStyle = "#00ff44";
        ctx.fillRect(PAD_X + promptWidth, PROMPT_Y - LINE_H + 2, 7, LINE_H - 2);
      }
    }

    setTextureKey(k => k + 1);
  }, [output, input, cursor, focused]);

  const terminalTexture = useMemo(() => {
    if (prevTextureRef.current) {
      prevTextureRef.current.dispose();
    }
    const t = new THREE.CanvasTexture(canvasRef.current);
    t.flipY = true;
    prevTextureRef.current = t;
    return t;
  }, [textureKey]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <button
        onClick={() => { window.location.href = "/"; }}
        style={{
          position:      "fixed",
          top:           "1rem",
          left:          "1rem",
          zIndex:        200,
          background:    "none",
          border:        "none",
          fontFamily:    "'Courier New', monospace",
          fontSize:      "14px",
          color:         "#2d7a2d",
          cursor:        "pointer",
          padding:       "4px 8px",
          letterSpacing: "0.5px",
        }}
      >
        {'<- take me home'}
      </button>

      <div style={{
        width: "100%",
        height: "100%",
        opacity: ready ? 1 : 0,
        transition: "opacity 0.4s ease-out",
        willChange: "opacity",
      }}>
      <Canvas
        style={{ width: "100%", height: "100%" }}
        camera={{ position: [0.5, 0, 1], fov: 35 }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <LightsRig />
          <Environment preset="city" />
          <Scene
            focused={focused}
            setFocused={setFocused}
            terminalTexture={terminalTexture}
            onInteract={() => { hasInteractedRef.current = true; }}
          />
        </Suspense>
      </Canvas>
      </div>

      <div style={{
        position:      "absolute",
        inset:         0,
        zIndex:        50,
        pointerEvents: "none",
        background:    "radial-gradient(ellipse 130% 130% at 50% 50%, transparent 18%, rgba(0,0,0,0.85) 48%, #000 72%)",
      }} />



    </div>
  );
}

useGLTF.preload("/models/computer.glb");
