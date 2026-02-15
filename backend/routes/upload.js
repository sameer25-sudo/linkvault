import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import Content from "../models/Content.js";

const router = express.Router();

/* Multer Setup */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});


/* Upload API */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { text, expiryMinutes, maxViews } = req.body;

    /* Only one allowed */
    if ((!text && !req.file) || (text && req.file)) {
      return res.status(400).json({
        msg: "Upload either text OR file (not both)",
      });
    }

    const id = uuidv4();

    /* Safe expiry */
    const minutes = Number(expiryMinutes) || 10;

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + minutes);

    /* Save */
    const data = await Content.create({
      uuid: id,

      text: text || null,

      filePath: req.file ? req.file.path : null,
      fileName: req.file ? req.file.originalname : null,

      expiresAt,

      maxViews: Number(maxViews) || 1,
    });

    res.json({
      link: `http://localhost:5173/view/${id}`,
    });

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});


/* Get Content */
router.get("/content/:id", async (req, res) => {
  try {

    const data = await Content.findOne({ uuid: req.params.id });

    if (!data) {
      return res.status(404).json({ msg: "Not found" });
    }

    if (new Date() > data.expiresAt) {
      return res.status(410).json({ msg: "Expired" });
    }

    if (data.views >= data.maxViews) {
      return res.status(403).json({ msg: "Limit reached" });
    }

    /* Count view */
    data.views += 1;
    await data.save();

    res.json(data);

  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Fetch failed" });
  }
});


/* Download */
router.get("/download/:id", async (req, res) => {
  try {

    const data = await Content.findOne({ uuid: req.params.id });

    if (!data || !data.filePath) {
      return res.status(404).json({ msg: "File not found" });
    }

    if (new Date() > data.expiresAt) {
      return res.status(410).json({ msg: "Expired" });
    }

    if (data.views >= data.maxViews) {
      return res.status(403).json({ msg: "Limit reached" });
    }

    /* Count download */
    data.views += 1;
    await data.save();

    res.download(data.filePath, data.fileName);

  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ error: "Download failed" });
  }
});

export default router;
