const express = require("express");
const {
  postSeoFetchData,
  getSeoMetaBySlug,
  getSeoMetaData,
  updateSeoMetaDataBySlug,
  deleteSeoMetaDataBySlug,
} = require("../controllers/seoMetaDataController");

const seoMetaData = express.Router();

seoMetaData.post("/post-seo-meta-data", postSeoFetchData);
seoMetaData.get("/get-seo-meta-by-slug/:slug", getSeoMetaBySlug);
seoMetaData.get("/get-seo-meta-data/", getSeoMetaData);
seoMetaData.put("/put-seo-meta-data/:_id", updateSeoMetaDataBySlug);
seoMetaData.delete("/delete-seo-meta-data/:_id", deleteSeoMetaDataBySlug);

module.exports = { seoMetaData };
