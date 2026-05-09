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
        
        // Wait for table or content indicators (Posición, PJ, etc.)
        await page.waitForFunction(() => {
            const text = document.body.innerText;
            return (text.includes('Posición') || text.includes('PJ') || text.includes('PTS')) && 
                   !text.includes('Cargando') && 
                   !text.includes('Loading');
        }, { timeout: 30000 }).catch(() => console.log("Timeout waiting for specific text, proceeding anyway..."));

        // Extra check: ensure table rows are present if it's a standings page
        if (url.includes('clasificacion') || url.includes('posiciones') || url.includes('tabla')) {
            await page.waitForSelector('table tr, .table tr, [role="row"]', { visible: true, timeout: 10000 }).catch(() => {});
        }
        
        // Wait a bit more for dynamic content/ads to settle
        await new Promise(r => setTimeout(r, 3000));

        if (mode === 'text') {
            const data = await page.evaluate(() => {
                // Check if table is ready
                const table = document.querySelector('table, .table, [role="row"]');
                if (!table || table.innerText.length < 100) return "DOM_NOT_READY";

                // Function to map colors/classes to V/D/E
                const mapForm = (el) => {
                    const style = window.getComputedStyle(el);
                    const bgColor = style.backgroundColor;
                    const className = el.className.toLowerCase();
                    
                    if (className.includes('win') || className.includes('vitoria') || bgColor.includes('rgb(0, 128, 0)') || bgColor.includes('rgb(46, 204, 113)')) return 'V';
                    if (className.includes('loss') || className.includes('derrota') || bgColor.includes('rgb(255, 0, 0)') || bgColor.includes('rgb(231, 76, 60)')) return 'D';
                    if (className.includes('draw') || className.includes('empate') || bgColor.includes('rgb(128, 128, 128)') || bgColor.includes('rgb(241, 196, 15)')) return 'E';
                    return el.innerText.trim() || '?';
                };

                // Try to find form elements and replace their text
                const formContainers = document.querySelectorAll('.streak, .form, .últimos-5');
                formContainers.forEach(container => {
                    const icons = container.querySelectorAll('span, div, i');
                    if (icons.length > 0) {
                        let streakText = "";
                        icons.forEach(icon => streakText += mapForm(icon));
                        container.setAttribute('data-extracted-streak', streakText);
                        container.innerText = streakText; // Force text for scraper
                    }
                });

                return document.body.innerText.substring(0, 10000);
            });

            if (data === "DOM_NOT_READY") {
                console.error("DOM_NOT_READY");
                process.exit(1);
            }
            console.log(data);
        } else {
            const outputPath = process.argv[4] || 'screenshot.png';
            await page.screenshot({ path: outputPath, fullPage: true });
            console.log(outputPath);
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
