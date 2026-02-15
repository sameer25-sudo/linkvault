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

    if ((!text && !req.file) || (text && req.file)) {
        return res.status(400).json({
            msg: "Upload either text OR file (not both)",
        });
    }


    const id = uuidv4();

    const minutes = Number(expiryMinutes) || 10;

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + minutes);

    const data = await Content.create({
        uuid: id,

        text: text || null,

        filePath: req.file?.path || null,
        fileName: req.file?.originalname || null,

        expiresAt,

        maxViews: maxViews || 1, // default one-time
    });


    res.json({
      link: `http://localhost:5173/view/${id}`,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/download/:id", async (req, res) => {
  try {

    const data = await Content.findOne({ uuid: req.params.id });

    if (!data || !data.filePath) {
      return res.status(404).json({ msg: "Not found" });
    }

    if (new Date() > data.expiresAt) {
      return res.status(410).json({ msg: "Expired" });
    }

    if (data.views >= data.maxViews) {
      return res.status(403).json({ msg: "Limit reached" });
    }

    // Count download as view
    data.views += 1;
    await data.save();

    res.download(data.filePath, data.fileName);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



export default router;
