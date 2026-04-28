import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const key = process.env.GOOGLE_GEMINI_API_KEY
async function list() {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`)
    const data = await res.json()
    console.log(JSON.stringify(data, null, 2))
}
list()
