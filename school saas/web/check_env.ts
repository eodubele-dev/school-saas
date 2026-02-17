
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

if (process.env.DATABASE_URL) {
    console.log("DATABASE_URL is available");
} else {
    console.log("DATABASE_URL is NOT available");
}
