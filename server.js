var React =  require('react');
var ReactDOMServer = require('react-dom/server');
var express = require('express');
var hogan = require('hogan-express');

// Express
const app = express();
app.engine('html', hogan);
app.set('views', __dirname + '/views');
app.use('/', express.static(__dirname));
app.set('port', 8080);

app.get('*', (req, res) => {
    res.status(200).render('index.html');
});

app.listen(app.get('port'));

console.info('==> ✅  Server is listening in ' + process.env.NODE_ENV + ' mode');
console.info('==> 🌎  Go to http://localhost:%s', app.get('port'));
