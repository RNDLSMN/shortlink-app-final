const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const shortid = require('shortid');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://localhost:27017/shortlink', { useNewUrlParser: true, useUnifiedTopology: true });

const linkSchema = new mongoose.Schema({
    original_url: String,
    short_code: { type: String, unique: true }
});

const Link = mongoose.model('Link', linkSchema);

app.post('/shorten', async (req, res) => {
    const { original_url } = req.body;
    const short_code = shortid.generate();

    const link = new Link({ original_url, short_code });
    await link.save();

    res.json({ shortlink: `http://localhost:3000/${short_code}` });
});

app.get('/:code', async (req, res) => {
    const { code } = req.params;
    const link = await Link.findOne({ short_code: code });

    if (link) {
        return res.redirect(link.original_url);
    }

    res.status(404).send('URL not found');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
