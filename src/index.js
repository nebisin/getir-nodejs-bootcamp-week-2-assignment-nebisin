const http = require("http");
const fs = require("fs");

const port = process.env.PORT || 3000;

// Eğer mevcut değilse, log.json dosyasını oluşturacağız
fs.open("log.json", "wx", (err, fd) => {
  // race condition'a yol açabileceğinden dosyanın erişilebilir olup olmadığını
  // kontrol etmek için `fs.access()` kullanılması tavsiye edilmiyor.
  if (err) {
    // log.json dosyasının mevcut olup olmadığını kontrol ediyoruz
    if (err.code === "EEXIST") {
      // eğer dosya mevcutsa doğrudan return ediyoruz
      return;
    }
    console.log("something went wrong while opening the log.json file", err);
  }

  // eğer log.json dosyası mevcut değilse oluşturuyoruz
  fs.writeFile(fd, "[]", (err) => {
    fs.close(fd);
    if (err) {
      console.log("something went wrong while creating the log.json file", err);
      return;
    }
  });
});

// http modülünü kullanarak sunucu oluşturuyoruz
const server = http.createServer((req, res) => {
  const newLog = {
    date: new Date(),
    url: req.url,
    method: req.method,
    statusCode: 200,
  };

  if (req.url === "/") {
    res.end("You're in home page");
  } else if (req.url === "/about") {
    res.end("You're in about page");
  } else if (req.url === "/contact") {
    res.end("You're in contact page");
  } else {
    newLog.statusCode = 404;

    res.writeHead(404).end("404 - Page not found");
  }

  pushNewLog(newLog);
});

// pushNewLog log.json dosyasını okuyor ve sonuna yeni log ekliyor
function pushNewLog(newLog) {
  fs.readFile("log.json", "utf-8", (err, data) => {
    if (err) {
      console.log("something went wrong while reading the log file", err);
      return;
    }

    const log = JSON.parse(data);

    log.push(newLog);

    fs.writeFile("log.json", JSON.stringify(log), (err) => {
      if (err) {
        console.log(
          "something went wrong while pushing new log to the file",
          err
        );
        return;
      }
    });
  });
}

// sunucuyu verilen portta dinliyoruz
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
