
const http = require("http");

const path = require("path")

const { exec } = require('node:child_process');

const SERVER_PORT = 9000

const FFMPEG_SVG = `<svg fill="#000000" width="60px" height="60px" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg"><path d="M21.72 17.91V6.5l-.53-.49L9.05 18.52l-1.29-.06L24 1.53l-.33-.95-11.93 1-5.75 6.6v-.23l4.7-5.39-1.38-.77-9.11.77v2.85l1.91.46v.01l.19-.01-.56.66v10.6c.609-.126 1.22-.241 1.83-.36L14.12 5.22l.83-.04L0 21.44l9.67.82 1.35-.77 6.82-6.74v2.15l-5.72 5.57 11.26.95.35-.94v-3.16l-3.29-.18a64.66 64.66 0 0 0 1.28-1.23z"/></svg>`

const MAGICK_SVG = `<svg height="60px" width="60px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
                        viewBox="0 0 512.002 512.002" xml:space="preserve">
                    <path style="fill:#806749;" d="M300.875,211.126l-54.033-16.788L4.892,436.289c-6.521,6.521-6.521,17.086,0,23.607l47.214,47.214
                        c3.261,3.261,7.533,4.891,11.803,4.891c4.272,0,8.543-1.63,11.803-4.891l241.95-241.95L300.875,211.126z"/>
                    <path style="fill:#5F4D37;" d="M300.875,211.126L300.875,211.126L28.499,483.503l23.607,23.607
                        c3.261,3.261,7.533,4.891,11.803,4.891c4.272,0,8.543-1.63,11.803-4.891l241.95-241.95L300.875,211.126z"/>
                    <path style="fill:#FFDA44;" d="M320.435,347.033c-0.869,0-1.74-0.066-2.609-0.207c-6.283-0.989-11.445-5.467-13.336-11.531
                        l-30.292-97.494l-97.494-30.292c-6.065-1.891-10.543-7.054-11.531-13.336c-0.999-6.272,1.663-12.564,6.847-16.238l83.354-58.953
                        L254.07,16.913c-0.076-6.358,3.456-12.206,9.119-15.096c5.663-2.88,12.466-2.304,17.564,1.5l81.81,61.051l96.678-32.78
                        c5.989-2.021,12.662-0.489,17.162,4.011c4.5,4.489,6.043,11.152,4.01,17.162l-32.78,96.678l61.051,81.81
                        c3.804,5.097,4.38,12.04,1.5,17.703c-2.858,5.597-8.608,9.258-14.879,9.258c-0.066,0-0.141,0-0.217,0l-102.069-1.444l-58.953,83.283
                        C330.902,344.517,325.804,347.033,320.435,347.033z"/>
                    <path style="fill:#EEBF00;" d="M476.403,35.598L274.199,237.802l30.292,97.494c1.891,6.065,7.054,10.543,13.336,11.531
                        c0.869,0.141,1.74,0.207,2.609,0.207c5.369,0,10.466-2.587,13.629-7.054l58.953-83.213l102.069,1.442c0.076,0,0.152,0,0.217,0
                        c6.272,0,12.021-3.661,14.879-9.258c2.88-5.663,2.304-12.536-1.5-17.634l-61.051-81.844l32.781-96.696
                        C482.447,46.766,480.903,40.086,476.403,35.598z"/>
                    </svg>`

function webpage(title='untitled',xhead='',body=''){

    return `<html>
                            <head>
                                <title>${title}</title>
                                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
                                <meta charset="UTF-8">
                                <style>
                                    body{ background-color:#f2f2f2; }
                                </style>
                                ${xhead}
                            </head>
                            <body>
                                ${body}
                                <script>
                                    let subrr = document.querySelectorAll("input[type='submit']")
                                    let xlkrr = document.querySelectorAll("a.xlink")

                                    subrr.forEach((el)=>{
                                        
                                            el.addEventListener('click',(e)=>{

                                                    e.currentTarget.value = "Processing..."
                                                    e.currentTarget.style.cursor = "wait"
                                                })
                                        })

                                    xlkrr.forEach((el)=>{
                                        
                                            el.addEventListener('click',(e)=>{

                                                    e.currentTarget.textContent = "Processing..."
                                                    e.currentTarget.style.cursor = "wait"
                                                })
                                        })

                                </script>
                            </body>
                        </html>`
}

const server = http.createServer(async (req, res) => {


    const pgurl = new URL('http://localhost'+req.url)

    const reqUrl = pgurl.pathname

    const params = pgurl.searchParams


    if (req.method == "GET") {


        if (reqUrl == "/" || reqUrl == "/home") {

            res.write( webpage("Home","",`<body>
                                <div style="padding:20px;">
                                    <h1>MediaWebGui</h1>
                                    <form action="/file" method="get">
                                        <div class="p-2">
                                            <select name="target">
                                                <option value="ffmpeg">FFMPEG</option>
                                                <option value="magick">Image Magick</option>
                                            </select>
                                        </div>
                                        <div class="p-2"><input type="text" name="filepath" placeholder="Working Dir" required /></div>
                                        <div class="p-2"><input type="file" id="fname" name="fname" required /></div>
                                        <input type="hidden" id="filename" name="filename" />    
                                        <div class="p-2"><input type="submit" /></div>
                                    </form>
                                </div>
                                <div class="p-2">
                                    <div class="w-75 mx-auto row">
                                        <div class="col"><a href="/magick" class="xlink">Magick Version</a></div>
                                        <div class="col"><a href="/ffmpeg" class="xlink">FFMPEG Version</a></div>
                                    </div>

                                </div>
                                <script>

                                    document.getElementById("fname").addEventListener(
                                        "change",
                                        (event) => {
                                            
                                            console.log(event.target.files[0])
                                            document.getElementById('filename').value = event.target.files[0].name
                                        },
                                        false,
                                    );

                                </script>
                            </body>`))

            res.end()

        }
        else if (reqUrl == "/file") {

            //console.log(params)

            const filePath = path.join(params.get('filepath'), params.get('fname'))

            if( params.get('target') == 'ffmpeg' ){

                res.write(webpage("File","",`<div class="container">
                                                ${FFMPEG_SVG}<h1>FFMPEG</h1>
                                                    <div>
                                                        <pre>${filePath}</pre>
                                                    </div>
                                                        <div class="row p-2">
                                                            <div class="col">
                                                                <form method="get" action="/ffmpeg">
                                                                    Convert to: <input type="text" name="nwext" size="5" required />
                                                                    <input type="hidden" name="target" value="convert" />
                                                                    <input type="hidden" name="fname" value="${filePath}" />
                                                                    <input type="submit" />
                                                                </form>
                                                            </div>
                                                            <div class="col"><a href="/ffmpeg?f=${filePath}&target=reverse" class="xlink">Reverse</a></div>
                                                            <div class="col">
                                                                <form method="get" action="/ffmpeg">
                                                                    <div class="p-2">✂️ Split</div>
                                                                    <div class="p-2">
                                                                        <span>From:</span> 
                                                                        <input type="text" name="fhrs" maxlength="2" size="2" value="00" required />:
                                                                        <input type="text" name="fmin" maxlength="2" size="2" value="00" required />:
                                                                        <input type="text" name="fsec" maxlength="2" size="2" value="00" required />
                                                                    </div>
                                                                    <div class="p-2">
                                                                        <span style="margin-right:20px;">To:</span>
                                                                        <input type="text" name="thrs" maxlength="2" size="2" value="00" required />:
                                                                        <input type="text" name="tmin" maxlength="2" size="2" value="00" required />:
                                                                        <input type="text" name="tsec" maxlength="2" size="2" value="00" required />
                                                                    </div>
                                                                    
                                                                    <input type="hidden" name="target" value="cut" />
                                                                    <input type="hidden" name="fname" value="${filePath}" />
                                                                    <div class="p-2"><input type="submit" /></div>
                                                                </form>
                                                            </div>
                                                        
                                                        </div>

                                                        <div class="row p-2">

                                                            <div class="col">📷 Screenshot
                                                                <form method="get" action="/ffmpeg">
                                                                    <div class="p-2">
                                                                        <input type="text" name="hrs" maxlength="2" size="2" value="00" required />:
                                                                        <input type="text" name="min" maxlength="2" size="2" value="00" required />:
                                                                        <input type="text" name="sec" maxlength="2" size="2" value="00" required />
                                                                        <input type="hidden" name="target" value="screenshot" />
                                                                        <input type="hidden" name="fname" value="${filePath}" />
                                                                    </div>
                                                                    <div class="p-2">
                                                                        # frames: <input type="number" name="frames" size="3" value="1" />
                                                                        <input type="submit" />
                                                                    </div>
                                                                </form>
                                                            </div>

                                                            <div class="col">Image overlay</div>

                                                        </div>

                                                        <div class="p-2"><a href="/">home</a></div>

                                                </div>`))
                res.end()

            }
            else if( params.get('target') == 'magick' ){

                exec(`magick identify ${filePath}`,(err,stdout)=>{

                    if(err){
    
                        console.error(err)
                        res.end(err.toString())
                        return
                    }

                    console.log(stdout)

                    res.write(webpage("File","",`<div class="container">
                                                    ${MAGICK_SVG}
                                                    <h1>Magick</h1>
                                                    <div class="p-3"><pre>${stdout}</pre></div>
                                                    <div>
                                                        <div class="row">
                                                            <div class="col"><a href="/magick?f=${filePath}&target=metadata" class="xlink">Metadata</a></div>
                                                            <div class="col"></div>
                                                        </div>
                                                        <div>
                                                            <form method="get" action="/magick">
                                                                <div class="p-2">Convert to: <input type="text" name="convert" placeholder="png" size="5" /></div>
                                                                <div class="p-2">Resize: <input type="text" name="resize" placeholder="widthxheight or x%" /></div>
                                                                <div class="p-2">
                                                                    <select id="mgckxcmdsel">
                                                                        <option value="">More options...</option>
                                                                        <option value="transparency">Transparency</option>
                                                                    </select>
                                                                </div>
                                                                <div class="p-2"><input type="text" name="xcmd" id="magickxcmd" placeholder="Extra commands" size="60" maxlength="200" /></div>
                                                                <input type="hidden" name="target" value="modify" />
                                                                <input type="hidden" name="filepath" value="${filePath}" />
                                                                <div class="p-2"><input type="submit" /></div>
                                                            </form>
                                                        </div>
                                                    </div>
                                                 </div>
                                                 <script>

                                                    document.getElementById('mgckxcmdsel').addEventListener('click',(e)=>{

                                                                            if(e.currentTarget.value == 'transparency'){

                                                                                document.getElementById('magickxcmd').value = "-fuzz 20% -transparent white"
                                                                            }
                                                                            
                                                                        })

                                                 </script>`))

                    res.end()
                })

                

            }
            else{

                res.write(webpage("File","",`<h1>Error</h1>
                                             <div>Unkown error</div>`))

                res.end()
            }

            
        }
        else if (reqUrl == "/magick") {

            if( params.get('target') == 'metadata' ){

                exec(`magick identify -verbose ${params.get('f')}`,(err,stdout)=>{

                    if(err){
    
                        console.error(err)
                        res.write(err)
                        res.end()
                        return
                    }

                    res.write(webpage("Image Metadata","",`<div class="container">
                                                    <h1>Magick</h1>
                                                    <div><pre>${stdout}</pre></div>
                                                 </div>`))

                    res.end()
                })
            }
            else  if( params.get('target') == 'modify' ){

                let fname = params.get('filepath')

                let fwx = fname.substring(0,fname.lastIndexOf('.'))

                let ext = fname.substring(fname.lastIndexOf('.'))

                let newext = ""

                let suffix = ""

                let convert = params.get('convert') || ""

                let resize = params.get('resize') || ""

                let xcmd = params.get('xcmd') || ""

                let cmd = "magick "

                if(convert.length > 0 ){

                    cmd += `convert `
                    newext = `.${convert}`
                }
                else{

                    newext = ext
                }

                // Source file
                cmd += `"${fname}" `

                if(resize.length > 0){

                    cmd += `-resize ${resize} `
                    suffix = `_${resize}`
                }

                // xcmd
                cmd += `${xcmd} `

                // Output file
                cmd += `"${fwx}${suffix}${newext}"`

                res.writeHead(200, {'Connection': 'Keep-Alive','Content-Type': 'text/plain'});
                res.write("\ncmd: "+cmd)
                res.write("\nProcessing...")

                exec(cmd,(err,stdout)=>{

                    if(err){
    
                        console.error(err)
                        res.write(err.toString())
                        res.end()
                        return
                    }

                    res.write("\nDone!")

                    res.end()
                })

                

            }
            else{

                exec(`magick -version`,(err,stdout)=>{

                    if(err){
    
                        console.error(err)
                        res.end(err.toString())
                        return
                    }

                    res.write(webpage("Version","",`<div class="container">
                                                    <h1>Magick</h1>
                                                    <div><pre>${stdout}</pre></div>
                                                 </div>`))

                    res.end()
                })
            }
        }
        else if (reqUrl == "/ffmpeg") {

            if( params.get('target') == 'convert' ){

                let fname = params.get('fname')

                let fnwx = fname.substring(0,fname.lastIndexOf('.'))

                let cmd = `ffmpeg -i "${fname}" -map 0 -c copy "${fnwx}.${params.get('nwext')}"`

                //let ext = fname.substring(fname.lastIndexOf('.'))

                res.writeHead(200, {'Connection': 'Keep-Alive','Content-Type': 'text/plain'});

                exec(cmd,(err,stdout)=>{

                    if(err){
    
                        console.error(err)
                        res.end(err.toString())
                        return
                    }

                    
                    res.write(`${cmd}\n${stdout}\nDone!\n`)

                    res.end()
                })

            }
            else if( params.get('target') == 'reverse' ){

                let fname = params.get('f')

                let fnwx = fname.substring(0,fname.lastIndexOf('.'))

                let ext = fname.substring(fname.lastIndexOf('.'))

                let revcmd = `ffmpeg -i "${fname}" -vf reverse "${fnwx}_reversed${ext}"`

                exec(revcmd,(err,stdout)=>{

                    if(err){
    
                        console.error(err)
                        res.end(err.toString())
                        return
                    }

                    res.writeHead(200, {'Connection': 'Keep-Alive','Content-Type': 'text/plain'});
                    res.write(`${revcmd}\n${stdout}\nDone!\n`)

                    res.end()
                })
            }
            else if( params.get('target') == 'cut' ){

                let fname = params.get('fname')

                let fnwx = fname.substring(0,fname.lastIndexOf('.'))

                //let ext = fname.substring(fname.lastIndexOf('.'))

                let splitcmd = `ffmpeg -ss ${params.get('fhrs')}:${params.get('fmin')}:${params.get('fsec')} -to ${params.get('thrs')}:${params.get('tmin')}:${params.get('tsec')} -i "${fname}" -c copy "${fnwx}_${params.get('fhrs')+params.get('fmin')+params.get('fsec')}_${params.get('thrs')+params.get('tmin')+params.get('tsec')}.avi"`

                exec(splitcmd,(err,stdout)=>{

                    if(err){
    
                        console.error(err)
                        res.end(err.toString())
                        return
                    }

                    res.writeHead(200, {'Connection': 'Keep-Alive','Content-Type': 'text/plain'});
                    res.write(`${splitcmd}\n${stdout}\nDone!\n`)

                    res.end()
                })
            }
            else if( params.get('target') == 'screenshot' ){

                let fname = params.get('fname')

                let fnwx = fname.substring(0,fname.lastIndexOf('.'))

                let screencmd = `ffmpeg -ss ${params.get('hrs')}:${params.get('min')}:${params.get('sec')} -i "${fname}" -frames:v ${params.get('frames')} ${fnwx}.png`

                exec(screencmd,(err,stdout)=>{

                    if(err){
    
                        console.error(err)
                        res.end(err.toString())
                        return
                    }

                    res.writeHead(200, {'Connection': 'Keep-Alive','Content-Type': 'text/plain'});
                    res.write(`${screencmd}\n${stdout}\nDone!\n`)

                    res.end()
                })

            }
            else if( params.get('target') == 'overlay' ){

                let fname = params.get('fname')

                let fnwx = fname.substring(0,fname.lastIndexOf('.'))

                let overlaycmd = `ffmpeg -ss ${params.get('hrs')}:${params.get('min')}:${params.get('sec')} -i "${fname}" -frames:v ${params.get('frames')} ${fnwx}.png`

                exec(overlaycmd,(err,stdout)=>{

                    if(err){
    
                        console.error(err)
                        res.end(err.toString())
                        return
                    }

                    res.writeHead(200, {'Connection': 'Keep-Alive','Content-Type': 'text/plain'});
                    res.write(`${overlaycmd}\n${stdout}\nDone!\n`)

                    res.end()
                })

            }
            else{

                exec(`ffmpeg -version`,(err,stdout)=>{

                    if(err){
    
                        console.error(err)
                        res.end(err.toString())
                        return null
                    }

                    res.write(webpage("Version","",`<div class="container">
                                                        <h1>FFMPEG</h1>
                                                        <div><pre>${stdout}</pre></div>
                                                    </div>`))

                    res.end()
                })
            }
        }
        else{

            res.write( "Error 404: not found" )
            res.end()
        }


    }
})

// Have the server listen on port 9000
server.listen(SERVER_PORT)

exec(`explorer http://localhost:${SERVER_PORT}`)