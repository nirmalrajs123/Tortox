const axios = require('axios');
const cheerio = require('cheerio');

async function analyze() {
    const res = await axios.get('http://www.tortox.com/products/shadow.php');
    const $ = cheerio.load(res.data);
    
    console.log('--- PRODUCTS INFO ---');
    console.log('H1:', $('h1').text());
    console.log('--- IMAGES ---');
    $('img').each((i, el) => {
        const src = $(el).attr('src');
        if (src && src.includes('product')) console.log('IMG:', src);
    });
    console.log('--- HEADERS (Specs?) ---');
    $('h4, h3, h2').each((i, el) => {
        console.log($(el).prop('tagName') + ':', $(el).text());
        if ($(el).text().toLowerCase().includes('spec')) {
            console.log('NEXT-TEXT:', $(el).nextAll().first().text().substring(0, 100));
            console.log('UL-LI-COUNT:', $(el).nextAll('ul').first().find('li').length);
        }
    });
}
analyze();
