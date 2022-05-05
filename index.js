// importing libraries.
const http = require('http');
const https = require('https');

// All Request Listner
requestListner = (req, res) => {
    if(req.url == '/') {
        // this is root endpoint
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write('<h1> Please goto "localhost:3000/getTimeStories" to get the response. </h1>')
        res.end();

    } else if(req.url = '/getTimeStories') {
        // this is /getTimeStories endpoint
        let finalData;
        // network call to time.com to get the response in text format
        const req = https.get('https://time.com/', resp => {
            let data = ''
            console.log(`statusCode: ${resp.statusCode}`);

            // getting the data in text format from 'time.com'
            resp.on('data', d => {
              data += d;
            });

            // main business logic
            resp.on('end', () => {
                // regular expression for extracting the 'li', 'h3', and 'anchor-url'
                let liregex = /<li\s+class="latest-stories__item">[\S\s]*?<\/li>/gi
                let h3regex = /<h3\s+class="latest-stories__item-headline">[\S\s]*?<\/h3>/gi
                anchorRegex = /href="(.*)"/
                
                // getging all 'li' tag of time-stories of html in text format
                let liTag = data.match(liregex)
                // getging all 'url' of time-stories of html in text format
                let link = liTag.map(value => {
                    return 'https://time.com' + value.match(anchorRegex)[1]
                })
                // getging all 'h3' tags of time-stories of html in text format
                let headingTag = data.match(h3regex)
                // removing all '<h3></h3>' to extract the data.
                let heading = headingTag.map(value => {
                    return value.replace(/(<\/?[^>]+>)/gi, '');
                })
                // final mapping of headings and link
                finalData = heading.map((value, headingIndex) => {
                    let filteredLink =  link.filter((linkValue, linkIndex) => {
                        if(headingIndex === linkIndex) {
                            return linkValue;
                        }
                    })
                    return {title: value, link: filteredLink[0]}
                })
                // sending final data to client
                res.end(JSON.stringify(finalData));
            })
        });
        
        // if any error while network call
        req.on('error', (err) => {
            console.log(err);
        })
        
        
    }
}

// creating server and passing the request listner to this server.
const server = http.createServer(requestListner);

// server listen on port 3000
server.listen(3000, () => {
    console.log('server listen on port 3000')
});