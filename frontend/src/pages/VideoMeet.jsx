import React, { useEffect, useMemo, useRef, useState } from "react";


import { AppBar, Toolbar, Typography, Box, IconButton, TextField, Badge, Button } from '@mui/material';
import io from "socket.io-client";
import VideocamIcon from "@mui/icons-material/Videocam"
import VideocamOffIcon from "@mui/icons-material/VideocamOff"
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import HomeIcon from "@mui/icons-material/Home";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import{ useNavigate} from "react-router-dom"




const server_url = "http://localhost:8000";
const MAX_USERS_PER_SLIDE = 6;

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoref = useRef();

    const navigate = useNavigate();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(true);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState();

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([])

    let [videos, setVideos] = useState([])
    let [participantMeta, setParticipantMeta] = useState({})
    let [currentSlide, setCurrentSlide] = useState(0)

    const syncParticipants = (list = []) => {
        setParticipantMeta(() => {
            return list.reduce((acc, participant) => {
                acc[participant.socketId] = participant;
                return acc;
            }, {});
        });
    };

    const upsertParticipant = (socketId, data = {}) => {
        if (!socketId) return;
        setParticipantMeta(prev => ({
            ...prev,
            [socketId]: {
                ...(prev[socketId] || {}),
                ...data,
                socketId
            }
        }));
    };

    const removeParticipant = (socketId) => {
        setParticipantMeta(prev => {
            const updated = { ...prev };
            delete updated[socketId];
            return updated;
        });
    };

    const allTiles = useMemo(() => {
        const remoteTiles = videos.map(video => ({
            ...video,
            username: participantMeta[video.socketId]?.username || "Guest",
            audioEnabled: participantMeta[video.socketId]?.audioEnabled ?? true
        }));

        const localSocketId = socketIdRef.current || "local-preview";
        const localMeta = participantMeta[localSocketId] || {
            username: username || "You",
            audioEnabled: audio ?? true
        };

        const localTile = window.localStream ? [{
            socketId: localSocketId,
            stream: window.localStream,
            username: localMeta.username,
            audioEnabled: localMeta.audioEnabled,
            isLocal: true
        }] : [];

        return [...localTile, ...remoteTiles];
    }, [videos, participantMeta, audio, username]);

    const tilesCount = allTiles.length;

    useEffect(() => {
        const totalSlidesCount = Math.max(1, Math.ceil(tilesCount / MAX_USERS_PER_SLIDE));
        setCurrentSlide(prev => Math.min(prev, totalSlidesCount - 1));
    }, [tilesCount]);



    useEffect(() => {
        console.log("HELLO")
        getPermissions();
    }, [])

    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
                console.log('Video permission granted');
            } else {
                setVideoAvailable(false);
                console.log('Video permission denied');
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
                console.log('Audio permission granted');
            } else {
                setAudioAvailable(false);
                console.log('Audio permission denied');
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
            console.log("SET STATE HAS ", video, audio);

        }


    }, [video, audio])
    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();

    }




    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                console.log(description)
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }





    let getDislayMediaSuccess = (stream) => {
        console.log("HERE")
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            getUserMedia()

        })
    }

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }




    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketIdRef.current = socketRef.current.id
            const initialAudioState = (typeof audio === "boolean") ? audio : (audioAvailable ?? true)
            upsertParticipant(socketIdRef.current, {
                username: username || "You",
                audioEnabled: initialAudioState
            });
            socketRef.current.emit('join-call', {
                path: window.location.href,
                username: username || "You"
            })
            socketRef.current.emit('media-state', { audioEnabled: initialAudioState })

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
                removeParticipant(id)
            })

            socketRef.current.on('media-state-changed', (id, state) => {
                upsertParticipant(id, state)
            })

            socketRef.current.on('user-joined', (id, clients, participantList = []) => {
                if (participantList.length) {
                    syncParticipants(participantList)
                }
                clients.forEach((socketListId) => {

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
              
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    connections[socketListId].onaddstream = (event) => {
                        console.log("BEFORE:", videoRef.current);
                        console.log("FINDING ID: ", socketListId);

                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            console.log("FOUND EXISTING");

                           
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                         
                            console.log("CREATING NEW");
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };


                    
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let handleVideo = () => {
        setVideo(!video);
      
    }
    let handleAudio = () => {
        setAudio(!audio)
    }

    useEffect(() => {
        if (audio === undefined) return;
        if (socketRef.current) {
            socketRef.current.emit('media-state', { audioEnabled: audio });
        }
        if (socketIdRef.current) {
            upsertParticipant(socketIdRef.current, { audioEnabled: audio });
        }
    }, [audio])

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen])
    let handleScreen = () => {
        setScreen(!screen);
    }

    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        window.location.href = "/home";
    }

    let openChat = () => {
        setModal(true);
        setNewMessages(0);
    }
    let closeChat = () => {
        setModal(false);
    }
    let handleMessage = (e) => {
        setMessage(e.target.value);
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };



    let sendMessage = () => {
        console.log(socketRef.current);
        socketRef.current.emit('chat-message', message, username)
        setMessage("");

      
    }

    
    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }


    const totalSlides = Math.max(1, Math.ceil(allTiles.length / MAX_USERS_PER_SLIDE))
    const visibleTiles = allTiles.slice(currentSlide * MAX_USERS_PER_SLIDE, (currentSlide + 1) * MAX_USERS_PER_SLIDE)
    const showSlideControls = totalSlides > 1

    const goToPrevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0))
    const goToNextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, totalSlides - 1))

    return (
        <div>
            <AppBar position="static" sx={{
                background: "rgba(255,255,255,0.15)",
                boxShadow: "0 8px 32px rgba(31,38,135,0.37)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "white"
            }}>
                <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="h6" component="div" sx={{ color: "#FF9839", fontWeight: 600 }}>
                        Meow Video Call
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <IconButton aria-label="Home" onClick={() => navigate("/home")} sx={{ color: "#FF9839", '&:hover': { color: '#FF7A00' } }}>
                            <HomeIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            {askForUsername === true ?

                <div style={{
                    padding: "24px",
                    borderRadius: "16px",
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(0,0,0,0.1)",
                    boxShadow: "0 8px 32px rgba(31,38,135,0.37)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    width: "fit-content",
                    margin: "24px auto"
                }}>
                    <h2 style={{ marginBottom: "12px" }}>Enter into Lobby</h2>
                    <TextField
                        id="outlined-basic"
                        label="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        variant="outlined"
                        required
                        sx={{
                            input: { color: "#000000" },
                            label: { color: "#000000" },
                            '& .MuiOutlinedInput-root': {
                                background: "#ffffff",
                                borderRadius: "12px",
                                '& fieldset': { borderColor: "rgba(0,0,0,0.2)" },
                                '&:hover fieldset': { borderColor: "#FF9839" },
                                '&.Mui-focused fieldset': { borderColor: "#FF9839" }
                            }
                        }}
                        style={{ marginRight: "10px" }}
                    />
                    <Button
                        variant="contained"
                        onClick={connect}
                        sx={{
                            background: "linear-gradient(90deg, #FF8C00, #FF9839)",
                            color: "#ffffff",
                            boxShadow: "0 8px 24px rgba(31,38,135,0.37)",
                            '&:hover': { background: "linear-gradient(90deg, #FF7A00, #FF8F2F)" }
                        }}
                    >
                        Connect
                    </Button>

                    <div style={{ marginTop: "16px" }}>
                        <video ref={localVideoref} autoPlay muted></video>
                    </div>

                </div> :


                <div className={`${styles.meetVideoContainer} ${showModal ? styles.chatActive : ""}`}>

                    <div className={styles.contentArea}>
                        <div className={styles.gridWrapper}>
                            {showSlideControls &&
                                <div className={styles.slideControls}>
                                    <IconButton className={styles.navButton} onClick={goToPrevSlide} disabled={currentSlide === 0}>
                                        <ChevronLeftIcon />
                                    </IconButton>
                                    <span className={styles.slideCounter}>{currentSlide + 1}/{totalSlides}</span>
                                    <IconButton className={styles.navButton} onClick={goToNextSlide} disabled={currentSlide === totalSlides - 1}>
                                        <ChevronRightIcon />
                                    </IconButton>
                                </div>
                            }

                            <div className={styles.conferenceView}>
                                {visibleTiles.length > 0 ? visibleTiles.map((tile) => (
                                    <div key={tile.socketId} className={styles.videoTile}>
                                        <video
                                            className={styles.videoElement}
                                            data-socket={tile.socketId}
                                            ref={ref => {
                                                if (!ref) return;
                                                if (tile.isLocal) {
                                                    localVideoref.current = ref;
                                                    if (window.localStream) {
                                                        ref.srcObject = window.localStream;
                                                    }
                                                } else if (tile.stream) {
                                                    ref.srcObject = tile.stream;
                                                }
                                            }}
                                            autoPlay
                                            muted={tile.isLocal}
                                            playsInline
                                        >
                                        </video>
                                        <div className={styles.videoOverlay}>
                                            <span>{tile.isLocal ? `${tile.username} (You)` : tile.username}</span>
                                            <span className={`${styles.micIndicator} ${tile.audioEnabled ? styles.micOn : styles.micOff}`}>
                                                {tile.audioEnabled ? <MicIcon fontSize="small" /> : <MicOffIcon fontSize="small" />}
                                            </span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className={styles.placeholderTile}>
                                        <p>Waiting for participants...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <aside
                            className={styles.chatRoom}
                            aria-hidden={!showModal}
                        >
                            <div className={styles.chatContainer}>
                                <h1>Chat</h1>

                                <div className={styles.chattingDisplay}>

                                    {messages.length !== 0 ? messages.map((item, index) => {

                                        console.log(messages)
                                        return (
                                            <div style={{ marginBottom: "20px" }} key={index}>
                                                <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                                                <p>{item.data}</p>
                                            </div>
                                        )
                                    }) : <p>No Messages Yet</p>}


                                </div>

                                <div className={styles.chattingArea}>
                                    <TextField value={message} onChange={(e) => setMessage(e.target.value)} id="outlined-basic" label="Enter Your chat" variant="outlined" />
                                    <Button variant='contained' onClick={sendMessage}>Send</Button>
                                </div>
                            </div>
                        </aside>
                    </div>

                    <div className={styles.buttonContainers}>
                        <IconButton className={styles.controlButton} aria-label="toggle video" onClick={handleVideo}>
                            {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>
                        <IconButton className={styles.controlButton} aria-label="end call" onClick={handleEndCall}>
                            <CallEndIcon  />
                        </IconButton>
                        <IconButton className={styles.controlButton} aria-label="toggle microphone" onClick={handleAudio}>
                            {audio === true ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>

                        {screenAvailable === true ?
                            <IconButton className={styles.controlButton} aria-label="toggle screen share" onClick={handleScreen}>
                                {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                            </IconButton> : <></>}

                        <Badge badgeContent={newMessages} max={999} sx={{ '& .MuiBadge-badge': { backgroundColor: '#FF9839', color: '#ffffff' } }}>
                            <IconButton className={styles.controlButton} aria-label="toggle chat" onClick={() => setModal(!showModal)}>
                                <ChatIcon />                        </IconButton>
                        </Badge>

                    </div>

                </div>

            }

        </div>
    )
}