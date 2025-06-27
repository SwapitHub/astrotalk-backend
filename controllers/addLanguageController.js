const AddLanguage = require("../models/addLanguageModel");

const getAddLanguageAstro = async (req, res) => {
  try {
    const AddLanguageData = await AddLanguage.find();
    res.json(AddLanguageData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteAddLanguageAstro = async (req, res) => {
    try {
      const { id } = req.params;
  
      const deletedLanguage = await AddLanguage.findByIdAndDelete(id);
  
      if (!deletedLanguage) {
        return res.status(404).json({ message: "Language not found" });
      }
  
      res.status(200).json({
        message: "success",
        data: deletedLanguage,
      });
    } catch (error) {
      console.error("delete-language-astrologer:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
  
  const setAddLanguageAstro = async (req, res) => {
  try {
    const { languages } = req.body;
    if (!languages) {
      return res.status(400).json({ message: "Please fill languages" });
    }

    const newLanguage= new AddLanguage({
        languages
    });

    await newLanguage.save();

    res.status(200).json({
      message: "success",
      data: newLanguage,
    });
  } catch (error) {
    console.error("add-Language-astrologer:", error);
  }
}
  

module.exports = {
  getAddLanguageAstro,
  deleteAddLanguageAstro,
  setAddLanguageAstro,
};