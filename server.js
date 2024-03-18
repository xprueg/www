const Fs = require("fs").promises
const Path = require("path")
const Http = require("http")
const port = process.env.PORT

class Static {
    static buffer = new Map()

    static get_content_type(path) {
        const ext = Path.extname(path)
        switch(ext) {
            case ".html": return "text/html"
            case ".js": return "text/javascript"
            case ".css": return "text/css"
            default: return "text/plain"
        }
    }

    static build_abs_url(url) {
        const paths = [__dirname, "static", url]
        const has_extension = Path.extname(url) !== String()
        if (has_extension)
            return Path.join(...paths)

        const basename = Path.basename(url)
        switch(basename) {
            case "script":
                paths.push(paths.pop() + ".js")
                break
            case "style":
                paths.push(paths.pop() + ".css")
                break
            default:
                paths.push("index.html")
                break
        }

        return Path.join(...paths)
    }

    static async serve(req, res) {
        const { method, url } = req
        const abs_url = Static.build_abs_url(url)

        if (Static.buffer.has(abs_url)) {
            res.writeHead(200, { "Content-Type": Static.get_content_type(abs_url) })
            res.end(Static.buffer.get(abs_url))
            return
        }

        return Fs
        .access(abs_url)
        .then(_ => Fs.readFile(abs_url, "utf8"))
        .then(data => {
            Static.buffer.set(abs_url, data)
            res.writeHead(200, { "Content-Type": Static.get_content_type(abs_url) })
            res.end(data)
        })
    }
}

Http
.createServer(async (req, res) => {
    const origin = req.headers.referer || req.headers.origin
    if (origin && !new URL(origin).hostname.endsWith("xpr.org"))
        return res.writeHeader(403).end()

    try {
        await Static.serve(req, res)
    } catch(err) {
        console.error(err)
        res.writeHead(404, { "Content-Type": "text/plain" })
        res.end("~")
    }
})
.listen(port, () => {
    console.info("Server is listening!")
})