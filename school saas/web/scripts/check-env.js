
require('dotenv').config({ path: '.env.local' });

if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
    console.log("DATABASE_URL_FOUND");
} else {
    console.log("DATABASE_URL_MISSING");
}
