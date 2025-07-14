import React, { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import AgoraRTM from "agora-rtm-sdk";

/**
 * AGORA APP ID SETUP:
 * - For local testing, use your Agora App ID from the Agora Console (static key mode).
 * - If your Agora project has "App Certificate" enabled, you MUST generate a token server-side and pass it to the join() method.
 * - See: https://docs.agora.io/en/Video/token?platform=Web
 * - For static App ID (testing), just replace below.
 */
const AGORA_APP_ID = "1ae9f7f7a15a47d086c90f9069bb9655"; // <-- Replace with your Agora App ID (from https://console.agora.io)
const CHANNEL = "playerkill";

const PLAYER1_UID = "player1";
const PLAYER2_UID = "player2";

function getRandomViewerId() {
  return "viewer_" + Math.floor(Math.random() * 100000);
}

export default function App() {
  const [role, setRole] = useState(null); // "player1", "player2", "viewer"
  const [joined, setJoined] = useState(false);
  const [reactionCounts, setReactionCounts] = useState({ player1: 0, player2: 0 });
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [loading, setLoading] = useState(false);

  const rtcClient = useRef(null);
  const rtmClient = useRef(null);
  const rtmChannel = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Join RTC and RTM
  const join = async () => {
    setLoading(true);
    // RTC
    rtcClient.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    let uid;
    if (role === "player1") uid = PLAYER1_UID;
    else if (role === "player2") uid = PLAYER2_UID;
    else uid = getRandomViewerId();

    await rtcClient.current.join(AGORA_APP_ID, CHANNEL, null, uid);

    if (role === "player1" || role === "player2") {
      const stream = await AgoraRTC.createMicrophoneAndCameraTracks();
      setLocalStream(stream[1]);
      localVideoRef.current.srcObject = stream[1].getMediaStream();
      await rtcClient.current.publish(stream);
    }

    rtcClient.current.on("user-published", async (user, mediaType) => {
      await rtcClient.current.subscribe(user, mediaType);
      if (mediaType === "video") {
        setRemoteStream(user.videoTrack);
        remoteVideoRef.current.srcObject = user.videoTrack.getMediaStream();
      }
    });

    rtcClient.current.on("user-unpublished", (user) => {
      setRemoteStream(null);
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    });

    // RTM
    rtmClient.current = AgoraRTM.createInstance(AGORA_APP_ID);
    await rtmClient.current.login({ uid });
    rtmChannel.current = await rtmClient.current.createChannel(CHANNEL);
    await rtmChannel.current.join();

    rtmChannel.current.on("ChannelMessage", ({ text }, senderId) => {
      if (text.startsWith("react:")) {
        const target = text.split(":")[1];
        setReactionCounts((prev) => ({
          ...prev,
          [target]: prev[target] + 1,
        }));
      }
      if (text.startsWith("sync:")) {
        // Sync reaction counts for new joiners
        const counts = JSON.parse(text.split(":")[1]);
        setReactionCounts(counts);
      }
    });

    // Sync reaction counts for new joiners
    if (role === "player1" || role === "player2") {
      setTimeout(() => {
        rtmChannel.current.sendMessage({
          text: "sync:" + JSON.stringify(reactionCounts),
        });
      }, 1000);
    }

    setJoined(true);
    setLoading(false);
  };

  const sendReaction = (target) => {
    if (rtmChannel.current) {
      rtmChannel.current.sendMessage({ text: "react:" + target });
    }
  };

  const leave = async () => {
    setJoined(false);
    setLocalStream(null);
    setRemoteStream(null);
    if (rtcClient.current) {
      await rtcClient.current.leave();
      rtcClient.current = null;
    }
    if (rtmChannel.current) {
      await rtmChannel.current.leave();
      rtmChannel.current = null;
    }
    if (rtmClient.current) {
      await rtmClient.current.logout();
      rtmClient.current = null;
    }
  };

  useEffect(() => {
    return () => {
      leave();
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", textAlign: "center", padding: 20 }}>
      <h1>Player Kill 1v1 (Agora Demo)</h1>
      {!role && (
        <div>
          <h2>Select Role</h2>
          <button onClick={() => setRole("player1")}>Player 1</button>
          <button onClick={() => setRole("player2")}>Player 2</button>
          <button onClick={() => setRole("viewer")}>Viewer</button>
        </div>
      )}
      {role && !joined && (
        <div>
          <h2>Role: {role}</h2>
          <button onClick={join} disabled={loading}>
            {loading ? "Joining..." : "Join Match"}
          </button>
          <button onClick={() => setRole(null)} disabled={loading}>
            Back
          </button>
        </div>
      )}
      {joined && (
        <div>
          <h2>Role: {role}</h2>
          <div style={{ display: "flex", justifyContent: "center", gap: 40 }}>
            <div>
              <h3>Player 1</h3>
              <video
                ref={role === "player1" ? localVideoRef : remoteVideoRef}
                autoPlay
                playsInline
                style={{ width: 240, height: 180, background: "#222" }}
              />
              <div>Reacts: {reactionCounts.player1}</div>
              {role === "viewer" && (
                <button onClick={() => sendReaction("player1")}>React</button>
              )}
            </div>
            <div>
              <h3>Player 2</h3>
              <video
                ref={role === "player2" ? localVideoRef : remoteVideoRef}
                autoPlay
                playsInline
                style={{ width: 240, height: 180, background: "#222" }}
              />
              <div>Reacts: {reactionCounts.player2}</div>
              {role === "viewer" && (
                <button onClick={() => sendReaction("player2")}>React</button>
              )}
            </div>
          </div>
          <button onClick={leave} style={{ marginTop: 20 }}>
            Leave
          </button>
        </div>
      )}
      <div style={{ marginTop: 40, fontSize: 12, color: "#888" }}>
        <p>
          Note: Replace <b>YOUR_AGORA_APP_ID</b> in the code with your Agora App ID.
        </p>
        <p>
          This is a simple demo using Agora RTC (video) and RTM (reactions). Open in two tabs as Player 1 and Player 2, and more as viewers to test.
        </p>
      </div>
    </div>
  );
}
