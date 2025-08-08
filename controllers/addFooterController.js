const footerProduct = require("../models/addFooterModel");

const getAddFooterProductAstro = async (req, res) => {
  try {
    const AddFooterProductData = await footerProduct.find();
    res.json(AddFooterProductData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteAddFooterProductAstro = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedFooterProduct = await footerProduct.findByIdAndDelete(id);

    if (!deletedFooterProduct) {
      return res.status(404).json({ message: "FooterProduct not found" });
    }

    res.status(200).json({
      message: "success",
      data: deletedFooterProduct,
    });
  } catch (error) {
    console.error("delete-language-astrologer:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const postAddFooterProductAstro = async (req, res) => {
  try {
    const { footerProductLink, footerProductName } = req.body;
    if (!footerProductName || !footerProductLink) {
      return res.status(400).json({ message: "Please fill FooterProduct" });
    }

    const newFooterProduct = new footerProduct({
      footerProductName,
      footerProductLink,
    });

    await newFooterProduct.save();

    res.status(200).json({
      message: "success",
      data: newFooterProduct,
    });
  } catch (error) {
    console.error("add-FooterProduct-astrologer:", error);
  }
};

module.exports = {
  getAddFooterProductAstro,
  deleteAddFooterProductAstro,
  postAddFooterProductAstro,
};
