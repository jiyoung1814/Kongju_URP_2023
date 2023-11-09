const express = require('express');
const app = express()
const port = 8000

const db = require('./db/index');
db.connect();

const router = require('./routes/index');
app.use(express.json()); 

// http res
app.get('/', (req, res)=>{

    res.send("sss");
    
})


app.listen(port,() =>{
    console.log(`server start on port ${port}`);
})



app.use('/', router);
