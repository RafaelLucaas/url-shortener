import express from "express"
import "dotenv/config"
import shortenUrl from "./routes/url/shorten-url"
import { connectToDatabase } from "./lib/mongodb"
import shortUrlRedirect from "./routes/url/short-url-redirect"

const app = express()
const port = 8080

connectToDatabase()
app.use(express.json())
app.listen(port, () => console.log(`Server is running on port ${port}`))

app.use(shortenUrl)
app.use(shortUrlRedirect)