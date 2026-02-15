import cron from "node-cron";
import Content from "../models/Content.js";
import fs from "fs-extra";

/* Run every 2 minutes (safer) */
cron.schedule("*/2 * * * *", async () => {
  try {

    const now = new Date();

    const expired = await Content.find({
      expiresAt: {
        $exists: true,
        $type: "date",
        $lt: now,
      },
    });

    for (const item of expired) {

      if (item.filePath) {
        await fs.remove(item.filePath);
      }

      await Content.deleteOne({ _id: item._id });

      console.log("Auto-deleted:", item.uuid);
    }

  } catch (err) {
    console.error("Cleanup error:", err);
  }
});
