import { Router } from "express";
import { UrlSchema } from "../../schemas/url.schema";

const router = Router()

export default router.get("/:shortUrlCode", async (req, res) => {
  const { shortUrlCode } = req.params

  if (!shortUrlCode) {
    res.status(400).json({ "error": "shortUrlCode is required in this request." })
    return
  }

  try {
    const response = await UrlSchema.findOne({ shortUrlCode })

    if (!response) {
      res.status(404).json({ "error": `${shortUrlCode} não existe.` })
      return
    }

    res.redirect(response.originalUrl)
  } catch (error) {
    res.status(500).json({ error })
    return
  }

})