const fs = require('fs');
const api = {
    ok: ({res, data, message = "success"}) => res.status(200).json({ success: 1, data, message }),
    list: ({res, data = {}}) => res.status(200).json({ success: 1, data }),
    unAuthorize: ({res, data = {}, message = "Authorization failed!"}) =>
      res.status(401).json({ success: 0, data, message }),
    notFound: ({res, data = {}, message = "Sever has some problems!"}) =>
      res.status(400).json({ success: 0, data, message }),
    error: ({res, data = {}, message = "Sever has some problems!"}) =>
      res.status(500).json({ success: 0, data, message }),
};
const readHTMLFile = (path) => {
  fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
    if (err) {
      return Promise.reject(err)
    }
    else {
      return Promise.resolve(html)
    }
  });
};

function between(min, max) {
  return Math.floor(
    Math.random() * (max - min) + min
  )
}


module.exports = {
  api,
  readHTMLFile,
  betweenNumber: between,
}