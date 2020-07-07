import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

app.post('/', (req, res) => {
    // console.log(req.body)
    res.end()
})

app.listen(3000)