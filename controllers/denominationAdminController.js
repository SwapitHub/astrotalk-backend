const denominationAdmin = require("../models/denominationAdminModel");


const getDenoMinationAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const denominationAdminDetail = await denominationAdmin.findById(id);

    if (!denominationAdminDetail) {
      return res.status(404).json({ message: "Denomination not found" });
    }

    res.status(200).json({
      message: "Success",
      data: denominationAdminDetail,
    });
  } catch (error) {
    console.error("Error fetching denomination detail:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}

const getDenoMinationAdminList = async (req, res) => {
  try {
    const denominationAdminData = await denominationAdmin.find();
    res.json(denominationAdminData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

const deleteDenominationAdmin = async (req, res)=>{
   const id = req.params.id;
  try{
    const deleteData = await denominationAdmin.findByIdAndDelete(id)
    if(!deleteData){
      return res.status(404).json({message: "Denomination not found"})
    }

    res.status(200).json({message: "success"})
  }
  catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

const setDenoMinationAdmin = async (req, res) => {
  try {
    const { amount, extraAmount, mostPopular } = req.body;
    if (!amount || !extraAmount) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const newAmount = new denominationAdmin({
      amount,
      extraAmount,
      mostPopular
    });

    await newAmount.save();

    res.status(200).json({
      message: "success",
      data: newAmount,
    });
  } catch (error) {
    console.error("denomination-admin:", error);
  }
}

module.exports={
    getDenoMinationAdmin,
    getDenoMinationAdminList,
    setDenoMinationAdmin,
    deleteDenominationAdmin
}