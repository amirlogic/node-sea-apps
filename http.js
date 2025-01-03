
const http = require("http");

const path = require("path")

const { exec } = require('node:child_process');

const SERVER_PORT = 9000


const server = http.createServer(async (req, res) => {


    const pgurl = new URL('http://localhost'+req.url)

    const reqUrl = pgurl.pathname

    const params = pgurl.searchParams


    if (req.method == "GET") {


        if (reqUrl == "/" || reqUrl == "/home") {

            res.write( `<html>
                            <head>
                                <title>Send File</title>
                            </head>
                            <body>
                                <div style="padding:20px;">
                                    <form action="/file" method="get">
                                        <div><input type="text" name="filepath" /></div>
                                        <div><input type="file" id="fname" name="fname" /></div>
                                        <input type="hidden" id="filename" name="filename" />    
                                        <div><input type="submit" /></div>
                                    </form>
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
                            </body>
                        </html>`)

            res.end()

        }
        else if (reqUrl == "/ffmpeg") {

            console.log(reqUrl)

            exec(`ffmpeg -L`,(err,stdout)=>{

                if(err){

                    console.error(err)
                }

                console.log(stdout)

                res.write( stdout ) 
                res.end()
            })
            
           
        }
        else if (reqUrl == "/file") {

            console.log(params)

            const filePath = path.join(params.get('filepath'), params.get('fname'))

            res.write(`<html>
                <head>
                    <title>File</title>
                </head>
                <body>
                    ${filePath}
                </body>        
               </html>`)

            res.end()
        }
        else{

            res.write( "Error 404: not found" )
            res.end()
        }


    } else if (req.method == "POST") {

        if (reqUrl == "/file") {

            console.log(req.body.fname)

            const filePath = path.join(uploadDir, fileName)

            res.write(`<html>
                        <head>
                            <title>post</title>
                        </head>
                        <body>
                            ${req.body.fname}
                        </body>        
                       </html>`)
            res.end()
        }
    }
})

// Have the server listen on port 9000
server.listen(SERVER_PORT)

exec(`explorer http://localhost:${SERVER_PORT}`)