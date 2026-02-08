
'use client'

import { createClient } from "@/lib/supabase/client"
import { useState } from "react"

export default function DebugLoginPage() {
    const [status, setStatus] = useState("Idle")
    const [details, setDetails] = useState("")

    const supabase = createClient()
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL

    async function testLogin() {
        setStatus("Testing Login...")
        setDetails("")

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: 'student@test.com',
                password: 'password123'
            })

            if (error) {
                setStatus("Failed")
                setDetails(JSON.stringify(error, null, 2))
                console.error("Debug Login Error:", error)
            } else {
                setStatus("Success")
                setDetails(`User ID: ${data.user.id}\nRun 'auth.getSession()' to see if session persists.`)
            }
        } catch (err: any) {
            setStatus("Exception")
            setDetails(err.message)
        }
    }

    return (
        <div className="p-10 bg-black text-white min-h-screen font-mono">
            <h1 className="text-xl font-bold mb-4">Debug Login Tool</h1>

            <div className="mb-6 p-4 border border-gray-700 rounded">
                <p><strong>Supabase URL:</strong> {url?.slice(0, 15)}...</p>
                <p><strong>Status:</strong> {status}</p>
            </div>

            <button
                onClick={testLogin}
                className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500 mb-6"
            >
                Test Login (student@test.com)
            </button>

            <pre className="bg-gray-900 p-4 rounded overflow-auto border border-red-900/50 text-red-200">
                {details || "No details yet..."}
            </pre>
        </div>
    )
}
