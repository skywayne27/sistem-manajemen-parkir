const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

// logger
app.use((req, _, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
})

app.get('/', (_, res) => {
  res.json({
    success: true,
    message: 'API Server Sistem Manajemen Parkir is running',
  });
});

app.use("/api/area-parkir", require("./routes/areaParkir.route"))

app.listen(PORT, () => {
    console.log(`\n=================================================`);
    console.log(`  API Server Sistem Manajemen Parkir Berjalan  `);
    console.log(`  Base URL: http://localhost:${PORT}/        `);
    console.log(`  Waktu:    ${new Date().toLocaleString()}     `);
    console.log(`=================================================\n`);
});