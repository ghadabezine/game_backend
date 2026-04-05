const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Session = require("../models/Session");
const Event = require("../models/Event");
const Position = require("../models/Position");

router.get("/", (req, res) => {
  res.json({ message: "Analytics API is working" });
});

router.post("/session/start", async (req, res) => {
  try {
    const { playerName } = req.body;

    if (!playerName) {
      return res.status(400).json({ message: "playerName is required" });
    }

    const session = new Session({ playerName });
    await session.save();

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/session/end", async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: "sessionId is required" });
    }

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    session.sessionEnd = new Date();
    session.duration = Math.floor(
      (session.sessionEnd - session.sessionStart) / 1000,
    );
    session.status = "ended";

    await session.save();

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/event", async (req, res) => {
  try {
    const { sessionId, eventType, value } = req.body;

    if (!sessionId || !eventType) {
      return res.status(400).json({
        message: "sessionId and eventType are required",
      });
    }

    const event = new Event({
      sessionId,
      eventType,
      value,
    });

    await event.save();

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/position", async (req, res) => {
  try {
    const { sessionId, x, y, z } = req.body;

    if (!sessionId || x === undefined || y === undefined || z === undefined) {
      return res.status(400).json({
        message: "sessionId, x, y, z are required",
      });
    }

    const position = new Position({
      sessionId,
      x,
      y,
      z,
    });

    await position.save();

    res.status(201).json(position);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/sessions", async (req, res) => {
  try {
    const sessions = await Session.find().sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/sessions/:id/events", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid session id" });
    }
    const events = await Event.find({ sessionId: id })
      .sort({ timestamp: 1 })
      .select("_id eventType value timestamp")
      .lean();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/sessions/:id/positions", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid session id" });
    }
    const positions = await Position.find({ sessionId: id })
      .sort({ timestamp: 1 })
      .select("_id x y z timestamp")
      .lean();
    res.json(positions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/sessions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid session id" });
    }
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/events", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/positions", async (req, res) => {
  try {
    const positions = await Position.find().sort({ createdAt: -1 });
    res.json(positions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
