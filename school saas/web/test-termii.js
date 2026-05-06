const TERMII_API_KEY = "TLSZwEebclIGgbGudiiOVJeooFAeRbfetEXqMOxJpEnkWEeEzyoTdHVqZRXMmN"
const TERMII_SENDER_ID = "Eduflow"
const TERMII_API_URL = "https://api.ng.termii.com/api/sms/send"

async function testTermii() {
    console.log("Testing Termii SMS...")
    const payload = {
        to: "2348130029819", // test phone
        from: TERMII_SENDER_ID,
        sms: "Test SMS from system",
        type: "plain",
        api_key: TERMII_API_KEY,
        channel: "generic"
    }

    try {
        const response = await fetch(TERMII_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })

        const text = await response.text()
        console.log("Response Status:", response.status)
        console.log("Response Body:", text)
    } catch (e) {
        console.error("Error:", e)
    }
}

testTermii()
