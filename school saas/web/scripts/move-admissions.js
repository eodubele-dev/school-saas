const fs = require('fs-extra');
const path = require('path');

const src = path.join(process.cwd(), 'app/[domain]/dashboard/students/admissions');
const dest = path.join(process.cwd(), 'app/[domain]/dashboard/admin/admissions');

async function moveDir() {
    try {
        console.log(`Moving from ${src} to ${dest}`);

        if (!fs.existsSync(src)) {
            console.error('Source does not exist!');
            return;
        }

        await fs.ensureDir(path.dirname(dest));
        await fs.move(src, dest, { overwrite: true });
        console.log('Move successful!');

        // Cleanup empty parent if needed
        const parent = path.dirname(src);
        if (fs.readdirSync(parent).length === 0) {
            fs.rmdirSync(parent);
            console.log('Removed empty parent directory');
        }

    } catch (err) {
        console.error('Move failed:', err);
    }
}

moveDir();
