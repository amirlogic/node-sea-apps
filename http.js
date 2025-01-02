
const http = require("http");

const url = require("url");

const { exec } = require('node:child_process');

const SERVER_PORT = 9000


const server = http.createServer(async (req, res) => {

    //const parsed = url.parse(req.url, true)       // Deprecated

    const pgurl = new URL('http://localhost'+req.url)

    //const reqUrl = parsed.pathname

    const reqUrl = pgurl.pathname

    const params = pgurl.searchParams

    // let screen = 'leucocytes';

    // let cell

    if (req.method == "GET") {


        if (reqUrl == "/" || reqUrl == "/leucocytes") {

           /*  screen = 'leucocytes'

                cell = params.get('cell') || payload[screen][0].key 

                let mhtml = getHtml([
                    
                    [ "b290a78d-4d92-4c2f-8f5c-6f8e9949c082", 
                    { payload:payload[screen], bindto:"imageselectorleftcol", imgkey:cell } ]

                ]) */

           /*  }
            else if( cell === 'monocytebis' ){

                let mhtml = getHtml([
                    
                    [ "507bd06d-3806-4e72-a8ed-514e09fc40b1", 
                    { payload:payload[screen], bindto:"imageselectorleftcol", imgkey:cell } ]

                ])
            }
            else{

                let mhtml = "<p>Error</p>"
            } */


            res.write( "<html>It works</html>" )   // webpage("Cytology",xhead,pageBody(MAIN_TITLE,"Normal Leucocytes",mhtml))
            res.end()

        }
        else if (reqUrl == "/ffmpeg") {

            console.log(reqUrl)

            exec(`ffmpeg -help`,(err,stdout)=>{

                if(err){

                    console.error(err)
                }

                console.log(stdout)

                res.write( stdout ) 
                res.end()
            })
            
            /* screen = 'other'

            let mhtml = getHtml([
                
                [ "b290a78d-4d92-4c2f-8f5c-6f8e9949c082", 
                { payload:payload[screen], bindto:"imageselectorleftcol", imgkey:payload[screen][0].key } ]

            ]) */

            // res.write( xout )
            // res.end()
        }
        else{

            res.write( "Error 404: not found" )
            res.end()
        }


    } else if (req.method == "POST") {

        if (reqUrl == "/hello") {

            res.write("hello world")
            res.end()
        }
    }
})

// Have the server listen on port 9000
server.listen(SERVER_PORT)

exec(`explorer http://localhost:${SERVER_PORT}`)