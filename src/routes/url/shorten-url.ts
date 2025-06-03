import { Router } from "express";
import { UrlSchema } from "../../schemas/url.schema";

const router = Router()

export default router.post("/url/shorten", async (req, res) => {
  const { originalUrl } = req.body

  if (!originalUrl) {
    res.status(400).json({ "error": "originalUrl is required in the body." })
    return
  }

  if (!originalUrl.startsWith("https://") && !originalUrl.startsWith("http://") && !originalUrl.startsWith("www.")) {
    res.status(400).json({ "error": "originalUrl must be a valid link." })
    return
  }

  const characters = "ABCDEFGKIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  const codeLength = 6
  let code = ""

  for (let i = 0; i < codeLength; i++) {
    const index = Math.floor(Math.random() * characters.length)
    code += characters[index]
  }

  const result = {
    "shortUrlCode": code,
    originalUrl
  }

  try {
    const url = await UrlSchema.create(result)

    const shortUrl = `${req.protocol}://${req.headers.host}/${url.shortUrlCode}`

    const resResult = {
      shortUrl,
      "shortUrlCode": url.shortUrlCode,
      "originalUrl": url.originalUrl
    }

    res.status(201).json(resResult)
  } catch (error) {
    if (error) {
      res.status(500).json({ error })
      return
    }
  }
})