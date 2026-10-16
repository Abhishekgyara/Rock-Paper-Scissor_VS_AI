
import { useEffect, useRef, useState } from "react";
import {
  initializeHandDetector,
  detectHand,
  closeHandDetector
} from "./vision/handDetector";
import { classifyGesture } from "./vision/gestureClassifier";
import "./App.css";
import InstallButton from "./components/InstallButton";

const MOVES = ["Rock", "Paper", "Scissors"];

const EMOJI = {
  Rock: "✊",
  Paper: "✋",
  Scissors: "✌️"
};

function getWinner(player, ai) {
  if (player === ai) return "Draw";

  if (
    (player === "Rock" && ai === "Scissors") ||
    (player === "Paper" && ai === "Rock") ||
    (player === "Scissors" && ai === "Paper")
  ) {
    return "You Win!";
  }

  return "AI Wins!";
}

export default function App() {
  const videoRef = useRef(null);
  const detectorRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);

  // Used to avoid reacting to a single unstable frame.
  const candidateRef = useRef(null);
  const frameCountRef = useRef(0);
  const stableGestureRef = useRef(null);

  const [status, setStatus] = useState("Loading AI...");
  const [gesture, setGesture] = useState("Waiting for hand");
  const [cameraOn, setCameraOn] = useState(false);

  const [phase, setPhase] = useState("idle");
  const [countdown, setCountdown] = useState(3);
  const [playerMove, setPlayerMove] = useState(null);
  const [aiMove, setAiMove] = useState(null);
  const [roundResult, setRoundResult] = useState("");
  const [message, setMessage] = useState(
    "Show your hand to the camera"
  );

  const [score, setScore] = useState({
    wins: 0,
    losses: 0,
    draws: 0
  });

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        setStatus("Loading hand detector...");

        const detector = await initializeHandDetector();

        if (cancelled) {
          closeHandDetector();
          return;
        }

        detectorRef.current = detector;

        setStatus("Requesting camera permission...");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false
        });

        if (cancelled) {
          stream.getTracks().forEach(track => track.stop());
          closeHandDetector();
          return;
        }

        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        if (cancelled) return;

        setCameraOn(true);
        setStatus("No hand detected");

        function processFrame() {
          const video = videoRef.current;

          if (
            !video ||
            !detectorRef.current ||
            video.readyState < 2
          ) {
            animationRef.current =
              requestAnimationFrame(processFrame);
            return;
          }

          if (video.currentTime !== lastVideoTimeRef.current) {
            lastVideoTimeRef.current = video.currentTime;

            try {
              const detection = detectHand(
                video,
                performance.now()
              );

              if (detection.landmarks?.length) {
                const result = classifyGesture(
                  detection.landmarks[0]
                );

                setStatus("Hand detected");
                setGesture(result.gesture);

                if (MOVES.includes(result.gesture)) {
                  if (candidateRef.current === result.gesture) {
                    frameCountRef.current += 1;
                  } else {
                    candidateRef.current = result.gesture;
                    frameCountRef.current = 1;
                  }

                  // Require several consistent frames.
                  if (frameCountRef.current >= 8) {
                    stableGestureRef.current = result.gesture;
                  }
                } else {
                  candidateRef.current = null;
                  frameCountRef.current = 0;
                  stableGestureRef.current = null;
                }
              } else {
                setStatus("No hand detected");
                setGesture("Waiting for hand");

                candidateRef.current = null;
                frameCountRef.current = 0;
                stableGestureRef.current = null;
              }
            } catch (error) {
              console.error("Detection error:", error);
            }
          }

          animationRef.current =
            requestAnimationFrame(processFrame);
        }

        processFrame();
      } catch (error) {
        console.error(error);

        setStatus(
          error.name === "NotAllowedError"
            ? "Camera permission denied"
            : "Unable to start camera or load AI model"
        );
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      cancelAnimationFrame(animationRef.current);
      streamRef.current?.getTracks().forEach(track => track.stop());
      closeHandDetector();
    };
  }, []);

  // Run the countdown and resolve the round.
  useEffect(() => {
    if (phase !== "countdown") return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(value => value - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }

    const player = stableGestureRef.current;

    if (!player) {
      setMessage(
        "No clear gesture captured. Try again with your hand visible."
      );
      setPhase("idle");
      return;
    }

    const ai = MOVES[Math.floor(Math.random() * MOVES.length)];
    const result = getWinner(player, ai);

    setPlayerMove(player);
    setAiMove(ai);
    setRoundResult(result);
    setMessage(`${result} ${EMOJI[player]} vs ${EMOJI[ai]}`);

    setScore(previous => ({
      wins: previous.wins + (result === "You Win!" ? 1 : 0),
      losses: previous.losses + (result === "AI Wins!" ? 1 : 0),
      draws: previous.draws + (result === "Draw" ? 1 : 0)
    }));

    setPhase("result");
  }, [phase, countdown]);

  
function startRound() {
  if (!cameraOn) {
    setMessage("Please wait for the camera to start.");
    return;
  }

  const player = stableGestureRef.current;

  if (!player) {
    setMessage(
      "Gesture not ready! Show Rock, Paper, or Scissors clearly and hold steady."
    );
    return;
  }

  setPlayerMove(null);
  setAiMove(null);
  setRoundResult("");
  setMessage("Hold your gesture steady!");
  setCountdown(3);
  setPhase("countdown");
}


  function resetGame() {
    setScore({ wins: 0, losses: 0, draws: 0 });
    setPlayerMove(null);
    setAiMove(null);
    setRoundResult("");
    setMessage("Score reset. Ready for another game!");
    setPhase("idle");
  }

  return (
    <main className="app">
      <header className="game-header">
        <h1>✊ Rock Paper Scissors</h1>
        <p>Challenge the Computer Vision AI</p>
      </header>
      <header className="app-header">
  <h1>Rock Paper Scissors AI</h1>
  <InstallButton />
</header>

      <section className="scoreboard">
        <div>
          <strong>{score.wins}</strong>
          <span>Wins</span>
        </div>
        <div>
          <strong>{score.draws}</strong>
          <span>Draws</span>
        </div>
        <div>
          <strong>{score.losses}</strong>
          <span>Losses</span>
        </div>
      </section>

      <section className="camera-card">
        <div className="camera-frame">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
          />

          {!cameraOn && (
            <div className="camera-placeholder">
              <span>📷</span>
              <p>Starting camera...</p>
            </div>
          )}

          {phase === "countdown" && (
            <div className="countdown-overlay">
              {countdown > 0 ? countdown : "GO!"}
            </div>
          )}
        </div>

        <div className="detection-status">
          <span className={status === "Hand detected" ? "status-dot detected" : "status-dot"} />
          <span>{status}</span>
          <strong>{gesture}</strong>
        </div>

        <p className="instructions">
          Show a clear hand gesture and hold it steady.
        </p>

        <button
  className="play-button"
  onClick={startRound}
  disabled={phase === "countdown"}
>
          {phase === "countdown"
            ? "Get Ready..."
            : phase === "result"
              ? "Play Again"
              : "Start Round"}
        </button>
      </section>

      <section className="battle-card">
        <div className="fighter">
          <span className="fighter-emoji">
            {playerMove ? EMOJI[playerMove] : "👤"}
          </span>
          <h3>You</h3>
          <p>{playerMove || "Your move"}</p>
        </div>

        <div className="versus">VS</div>

        <div className="fighter">
          <span className="fighter-emoji">
            {aiMove ? EMOJI[aiMove] : "🤖"}
          </span>
          <h3>AI</h3>
          <p>{aiMove || "AI move"}</p>
        </div>
      </section>

      <section className="result-card">
        <h2>
          {phase === "countdown"
            ? "Get ready!"
            : roundResult || "Ready to play?"}
        </h2>
        <p>{message}</p>
      </section>

      <button className="reset-button" onClick={resetGame}>
        Reset Score
      </button>

      <footer>
        <p>Powered by MediaPipe hand tracking</p>
      </footer>
    </main>
  );
}
