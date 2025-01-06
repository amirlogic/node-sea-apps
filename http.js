
const http = require("http");

const path = require("path")

const { exec } = require('node:child_process');

const SERVER_PORT = 9000

function webpage(title='untitled',xhead='',body=''){

    return `<html>
                            <head>
                                <title>${title}</title>
                                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
                                ${xhead}
                            </head>
                            <body>
                                ${body}
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
                                        <div class="p-2"><input type="text" name="filepath" /></div>
                                        <div class="p-2"><input type="file" id="fname" name="fname" /></div>
                                        <input type="hidden" id="filename" name="filename" />    
                                        <div class="p-2"><input type="submit" /></div>
                                    </form>
                                </div>
                                <div class="p-2">
                                    <div class="w-75 mx-auto row">
                                        <div class="col"><a href="/magick">Magick Version</a></div>
                                        <div class="col"><a href="/ffmpeg">FFMPEG Version</a></div>
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
                                                <h1>FFMPEG</h1>
                                                <div><pre>${filePath}</pre></div>
                                                        <div class="row p-2">
                                                            <div class="col">
                                                                <form method="get" action="/ffmpeg">
                                                                    Convert to: <input type="text" name="nwext" size="5" />
                                                                    <input type="hidden" name="target" value="convert" />
                                                                    <input type="hidden" name="fname" value="${filePath}" />
                                                                    <input type="submit" />
                                                                </form>
                                                            </div>
                                                            <div class="col"><a href="/ffmpeg?f=${filePath}&target=reverse">Reverse</a></div>
                                                        </div>
                                                </div>`))
                res.end()

            }
            else if( params.get('target') == 'magick' ){

                exec(`magick identify ${filePath}`,(err,stdout)=>{

                    if(err){
    
                        console.error(err)
                    }

                    console.log(stdout)

                    res.write(webpage("File","",`<div class="container">
                                                    <h1>Magick</h1>
                                                    <div class="p-3"><pre>${stdout}</pre></div>
                                                    <div>
                                                        <div class="row">
                                                            <div class="col"><a href="/magick?f=${filePath}&target=metadata">Metadata</a></div>
                                                            <div class="col"></div>
                                                        </div>
                                                        <div>
                                                            <form method="get" action="/magick">
                                                                <div>Convert to: <input type="text" name="convert" placeholder="png" /></div>
                                                                <div>Resize: <input type="text" name="resize" placeholder="widthxheight" /></div>
                                                                <input type="hidden" name="target" value="modify" />
                                                                <input type="hidden" name="filepath" value="${filePath}" />
                                                                <div><input type="submit" /></div>
                                                            </form>
                                                        </div>
                                                    </div>
                                                 </div>`))

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

                //convert = (convert.length > 0) ? `convert `

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

                //res.write("\nfwx: "+fwx)
                //res.write("\next: "+ext)
                //res.end()

            }
            else{

                exec(`magick -version`,(err,stdout)=>{

                    if(err){
    
                        console.error(err)
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

                let cmd = `ffmpeg -i "${fname}" "${fnwx}.${params.get('nwext')}"`

                //let ext = fname.substring(fname.lastIndexOf('.'))

                exec(cmd,(err,stdout)=>{

                    if(err){
    
                        console.error(err)
                        res.end(err)
                    }

                    res.writeHead(200, {'Connection': 'Keep-Alive','Content-Type': 'text/plain'});
                    res.write(`${cmd}\n${stdout}\nDone!`)

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
                    }

                    res.writeHead(200, {'Connection': 'Keep-Alive','Content-Type': 'text/plain'});
                    res.write(`${revcmd}\n${stdout}\nDone!`)

                    res.end()
                })
            }
            else{

                exec(`ffmpeg -version`,(err,stdout)=>{

                    if(err){
    
                        console.error(err)
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