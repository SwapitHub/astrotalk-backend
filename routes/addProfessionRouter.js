const express = require("express");
const AddProfession = require("../models/addProfessionModel");
const addProfessionRoute = express.Router();


addProfessionRoute.get("/add-Profession-astrologer", async (req, res) => {
  try {
    const AddProfessionData = await AddProfession.find();
    res.json(AddProfessionData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

addProfessionRoute.delete("/delete-Profession-astrologer/:id", async (req, res) => {
    try {
      const { id } = req.params;
  
      const deletedProfession = await AddProfession.findByIdAndDelete(id);
  
      if (!deletedProfession) {
        return res.status(404).json({ message: "Profession not found" });
      }
  
      res.status(200).json({
        message: "success",
        data: deletedProfession,
      });
    } catch (error) {
      console.error("delete-Profession-astrologer:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  

addProfessionRoute.post("/add-Profession-astrologer", async (req, res) => {
    
  try {
    const { professions } = req.body;
    if (!professions) {
      return res.status(400).json({ message: "Please fill Professions" });
    }

    const newProfession = new AddProfession({
        professions
    });

    await newProfession.save();

    res.status(200).json({
      message: "success",
      data: newProfession,
    });
  } catch (error) {
    console.error("add-Profession-astrologer:", error);
  }
});

module.exports = addProfessionRoute;