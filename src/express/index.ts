import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../../public')))

app.post('/', (req, res) => {
    // console.log(req.body)
    res.end()
})

app.listen(3000)