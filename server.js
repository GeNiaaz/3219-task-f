const express = require("express");
const axios = require("axios");
const cors = require("cors");
const redis = require("redis");

const redisClient = redis.createClient();

const DEFAULT_EXPIRATION = 3600;

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", async(req, res) => {
    const albumId = req.query.albumId;
    redisClient.get("photos", async(error, photos) => {
        if (error) console.log(error);
        if (photos != null) {
            console.log("cache hit");
            return res.json(JSON.parse(photos));
        } else {
            console.log("cache miss");
            const { data } = await axios.get(
                "http://jsonplaceholder.typicode.com/photos", { params: { albumId } }
            );
            redisClient.setex("photos", DEFAULT_EXPIRATION, JSON.stringify(data));
            res.json(data);
        }
    });
});

app.get("/:id", async(req, res) => {
    const { data } = await axios.get(
        `http://jsonplaceholder.typicode.com/photos/${req.params.id}`
    );
    res.json(data);
});

var port = 3000;

app.listen(port);