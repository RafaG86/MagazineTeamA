const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function scrape(url, mode = 'text') {
    let browser;
    try {
        const userDataDir = path.join(process.cwd(), 'storage/app/puppeteer_profiles', 'profile_' + Date.now() + '_' + Math.floor(Math.random() * 1000));
        if (!fs.existsSync(path.dirname(userDataDir))) {
            fs.mkdirSync(path.dirname(userDataDir), { recursive: true });
        }
        const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
        browser = await puppeteer.launch({ 
            headless: true, 
            executablePath: edgePath,
            userDataDir: userDataDir,
            pipe: true, // Use pipe instead of websocket
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox', 
                '--window-size=1920,1080', 
                '--disable-gpu', 
                '--disable-dev-shm-usage',
                '--disable-background-networking',
                '--disable-extensions',
                '--disable-sync',
                '--no-first-run'
            ] 
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        
        // Use a more realistic user agent to avoid blocks
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
        
        // Wait a bit more for dynamic content/ads to settle
        await new Promise(r => setTimeout(r, 5000));

        if (mode === 'screenshot') {
            const outputPath = process.argv[4] || 'screenshot.png';
            await page.screenshot({ path: outputPath, fullPage: false });
            console.log('SCREENSHOT_SAVED:' + outputPath);
        } else {
            const text = await page.evaluate(() => document.body.innerText.substring(0, 15000));
            console.log(text);
        }

        await browser.close();
    } catch (e) {
        if (browser) await browser.close();
        process.stderr.write(e.message);
        process.exit(1);
    }
}

const url = process.argv[2];
const mode = process.argv[3] || 'text'; // 'text' or 'screenshot'

if (!url) {
    process.exit(1);
}

scrape(url, mode);
