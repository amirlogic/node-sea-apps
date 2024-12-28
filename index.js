


const fs = require('node:fs')

const process = require('node:process')


const filename = process.argv[2];

(async()=>{

    const mupdfjs = await import('mupdf/mupdfjs')    //  

    const doc = mupdfjs.PDFDocument.openDocument(fs.readFileSync(filename), "application/pdf");

    format = doc.getMetaData('format')
    
    console.log(`PDF format: ${format}`)

})()


