import React, { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Card,
    CardContent,
    Chip,
    IconButton,
    Stack,
    Typography,
    Divider,
    Tooltip
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";

export default function History() {
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(Array.isArray(history) ? history : []);
            } catch {
                setMeetings([]);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const totals = useMemo(() => ({
        count: meetings.length,
        recent: meetings
            .slice()
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.date
    }), [meetings]);

    const formatDate = (dateString) => {
        if (!dateString) return "Unknown";
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background: "radial-gradient(circle at top, #0f172a, #020617 65%)",
                padding: { xs: "32px 16px", md: "48px 40px" },
                color: "white",
            }}
        >
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        Meeting History
                    </Typography>
                    <Typography variant="subtitle1" color="rgba(255,255,255,0.7)">
                        Review the calls you have hosted or joined recently.
                    </Typography>
                </Box>
                <Tooltip title="Back to Home">
                    <IconButton
                        onClick={() => routeTo("/home")}
                        sx={{
                            color: "#FF9839",
                            border: "1px solid rgba(255, 152, 57, 0.4)",
                            "&:hover": {
                                background: "rgba(255, 152, 57, 0.15)",
                            },
                        }}
                    >
                        <HomeIcon />
                    </IconButton>
                </Tooltip>
            </Stack>

            <Card
                sx={{
                    mb: 4,
                    borderRadius: "20px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(16px)",
                    color: "#fff",
                }}
            >
                <CardContent>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="center">
                        <Box>
                            <Typography variant="h3" fontWeight={700}>
                                {loading ? "--" : totals.count}
                            </Typography>
                            <Typography variant="subtitle2" color="rgba(255,255,255,0.7)">
                                Total Sessions
                            </Typography>
                        </Box>
                        <Divider flexItem orientation="vertical" sx={{ display: { xs: "none", sm: "block" }, borderColor: "rgba(255,255,255,0.1)" }} />
                        <Box>
                            <Typography variant="h6" fontWeight={600}>
                                {totals.recent ? formatDate(totals.recent) : (loading ? "Loading..." : "No sessions yet")}
                            </Typography>
                            <Typography variant="subtitle2" color="rgba(255,255,255,0.7)">
                                Last Meeting
                            </Typography>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            <Stack spacing={2}>
                {loading && (
                    <Card
                        sx={{
                            borderRadius: "16px",
                            background: "rgba(255,255,255,0.04)",
                            border: "1px dashed rgba(255,255,255,0.15)",
                            color: "#fff",
                        }}
                    >
                        <CardContent>
                            <Typography variant="body1" color="rgba(255,255,255,0.8)">
                                Fetching your meeting history...
                            </Typography>
                        </CardContent>
                    </Card>
                )}

                {!loading && meetings.length === 0 && (
                    <Card
                        sx={{
                            borderRadius: "16px",
                            background: "rgba(255,255,255,0.04)",
                            border: "1px dashed rgba(255,255,255,0.15)",
                            color: "#fff",
                        }}
                    >
                        <CardContent>
                            <Typography variant="h6" fontWeight={600}>
                                No recent meetings
                            </Typography>
                            <Typography variant="body2" color="rgba(255,255,255,0.7)">
                                Meet with someone and you’ll find the session details here.
                            </Typography>
                        </CardContent>
                    </Card>
                )}

                {meetings.map((meeting, index) => (
                    <Card
                        key={`${meeting.meetingCode}-${index}`}
                        sx={{
                            borderRadius: "18px",
                            background: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
                            border: "1px solid rgba(255,255,255,0.12)",
                            boxShadow: "0 20px 35px rgba(5, 6, 11, 0.45)",
                            color: "#fff",
                        }}
                    >
                        <CardContent>
                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                justifyContent="space-between"
                                alignItems={{ xs: "flex-start", sm: "center" }}
                                spacing={2}
                            >
                                <Box>
                                    <Typography variant="h6" fontWeight={700}>
                                        Meeting Code
                                    </Typography>
                                    <Typography variant="body1" color="rgba(255,255,255,0.85)" mt={0.5}>
                                        {meeting.meetingCode}
                                    </Typography>
                                </Box>
                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                    <Chip
                                        label={`Date: ${formatDate(meeting.date)}`}
                                        sx={{
                                            background: "rgba(255,255,255,0.08)",
                                            color: "#fff",
                                            borderRadius: "999px",
                                        }}
                                    />
                                    <Chip
                                        label={`Time: ${formatTime(meeting.date)}`}
                                        sx={{
                                            background: "rgba(255,255,255,0.08)",
                                            color: "#fff",
                                            borderRadius: "999px",
                                        }}
                                    />
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                ))}
            </Stack>
        </Box>
    );
}