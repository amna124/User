// routes/eventRoutes.js
const express = require("express");
const router = express.Router();
const Event = require("../models/Event"); // Ensure this path is correct
const Sponsor = require("../models/Sponsor");
// Fetch all events (GET request)
router.get("/", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ message: "Error fetching events" });
  }
});

// Example of backend route in eventRoutes.js
router.post("/sponsor", async (req, res) => {
  const { sponsorId, eventId, contributionAmount } = req.body;
  try {
    // Find the sponsor and event
    const sponsor = await Sponsor.findById(sponsorId);
    if (!sponsor) {
      return res.status(404).json({ message: "Sponsor not found" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Update sponsor's data
    sponsor.sponsoredEvents.push({
      eventId,
      contributionAmount,
      status: "Pending",
    });
    console.log("Updated sponsor before save:", sponsor);

    sponsor.totalContributions += contributionAmount;

    // Update event's data
    event.sponsors.push(sponsorId);

    // Save both entities
    await sponsor.save();
    await event.save();

    // Fetch updated sponsor with populated fields
    const updatedSponsor = await Sponsor.findById(sponsorId).populate(
      "sponsoredEvents.eventId"
    );

    // Fetch updated event with populated fields
    const updatedEvent = await Event.findById(eventId).populate("sponsors");

    res.status(201).json({
      message: "Event sponsored successfully",
      sponsor: updatedSponsor,
      event: updatedEvent,
    });
    console.log("Updated Sponsor:", updatedSponsor);
    console.log("Updated Event:", updatedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
