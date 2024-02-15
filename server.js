const express = require('express');
const http = require('http');
const https = require('https');
const path = require('path');
const qs = require('querystring');
const axios = require('axios');
const datetime = require('node-datetime');

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// OpenWeatherAPI endpoint
const openWeatherAPIKey = '31591fef82e6aa11427ab864a59d58c5';
const openWeatherEndpoint = 'https://api.openweathermap.org/data/2.5/weather';
let currentCity = 'London';

// const spotifyClientId = '8158caa38db44af5b23af6f804e6c8a1';
// const spotifyClientSecret = 'e1b77175ee2a4593a7ed5d62eddb662b';
// const spotifyATrackId = '11dFghVXANMlKmJXsNCbNl';



const fetchData = (url) => {
    return new Promise((resolve, reject) => {
        const request = https.get(url, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                resolve(JSON.parse(data));
            });
        });

        request.on('error', (error) => {
            console.error('Error fetching data:', error.message);
            reject(error);
        });

        request.end();
    });
};

let weatherData = {
    temperature: null,
    feel_like_temp: null,
    pressure: null,
    humidity: null,
    wind_speed: null,
    rain1h: null,
    rain3h: null,
    description: null,
    icon: null,
    time: null,
    country_code:null,
    lon: null,
    lat: null,
    rainmapurl: null,
    tempmapurl: null
};

function lonLatToTile(lon, lat, zoom) {
    const n = 2 ** zoom;
    const x = Math.floor((lon + 180) / 360 * n);
    const latRad = lat * Math.PI / 180;
    const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);

    return { x, y };
}
const fetchWeatherData = async () => {
    try {
        const cityURL = `https://api.openweathermap.org/geo/1.0/direct?q=${currentCity}&limit=1&appid=${openWeatherAPIKey}`;
        const cityData = await fetchData(cityURL);
        const lon = cityData[0].lon;
        const lat = cityData[0].lat;

        const weatherURL = `${openWeatherEndpoint}?lat=${lat}&lon=${lon}&units=metric&appid=${openWeatherAPIKey}`;
        const data = await fetchData(weatherURL);

        weatherData.temperature = data.main.temp;
        weatherData.feel_like_temp = data.main.feels_like;
        weatherData.pressure = data.main.pressure;
        weatherData.humidity = data.main.humidity;
        weatherData.wind_speed = data.wind.speed;
        if (data.rain) {
            weatherData.rain1h = data.rain['1h'] ? data.rain['1h'] : null;
            weatherData.rain3h = data.rain['3h'] ? data.rain['3h'] : null;
        }
        weatherData.description = data.weather[0].description;
        weatherData.icon = data.weather[0].icon;
        weatherData.time = data.dt;
        weatherData.country_code = data.sys.country;
        weatherData.lon = data.coord.lon;
        weatherData.lat = data.coord.lat;

        const zoomfactor = 8;
        const  xy = lonLatToTile(weatherData.lon,weatherData.lat,zoomfactor)

        const mapUrl1 = `https://tile.openweathermap.org/map/precipitation_new/${zoomfactor}/${xy.x}/${xy.y}.png?appid=${openWeatherAPIKey}`;
        weatherData.rainmapurl = mapUrl1;
        const mapUrl2 = `https://tile.openweathermap.org/map/temp_new/${zoomfactor}/${xy.x}/${xy.y}.png?appid=${openWeatherAPIKey}`;
        weatherData.tempmapurl = mapUrl2;

        console.log('Weather data updated:', weatherData);
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
    }
};

// Initial fetch and then fetch every 10 minutes
setInterval(fetchWeatherData, 10 * 60 * 1000);

// const fetchSpotifyData = async () => {
//     try {
//         // Step 1: Get Spotify Token
//         const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', {
//             grant_type: 'client_credentials',
//             client_id: spotifyClientId,
//             client_secret: spotifyClientSecret
//         }, {
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded',
//                 'Cookie': '__Host-device_id=AQBqqtNSNFEcY4vhmU9j4wRs5L1t2YCrVXlWii-Xgk5zEKQUSfVs7mAVF5ZQt0QYKcNbSm6v0bkbqVhsDhNemKYg7Ge5ujeGDJ4; sp_tr=false'
//             }
//         });
//
//         const accessToken = tokenResponse.data.access_token;
//
//         // Step 2: Use Spotify Token to get data
//         const spotifyResponse = await axios.get(`https://api.spotify.com/v1/tracks/${spotifyATrackId}`, {
//             headers: {
//                 'Authorization': `Bearer ${accessToken}`,
//             },
//         });
//
//         const spotifyData = spotifyResponse.data;
//         spotifyData.token = accessToken;
//         console.log(spotifyData);
//
//         return spotifyData;
//     } catch (error) {
//         console.error('Error fetching Spotify data:', error);
//         throw error;
//     }
// };
const exchangeApiKey = 'ef3473c58f080c6d863a3fe7';
let baseCurrency = 'USD';
let targetCurrency = 'EUR';
let exchangeData = {
    baseCurrency: baseCurrency,
    targetCurrency : targetCurrency,
    exchangeRate: null,
    exchangeKeys: []
};
const fetchCurrencyExchangeData = async (baseCurrency, targetCurrency) => {
    const url = `https://v6.exchangerate-api.com/v6/${exchangeApiKey}/latest/${baseCurrency}`;
    try {
        const result = await fetchData(url);

        if (result.result === 'error') {
            throw new Error(result['error-type']);
        }

        const exchangeRate = result.conversion_rates[targetCurrency];
        console.log(`1 ${baseCurrency} = ${exchangeRate} ${targetCurrency}`);

        exchangeData.baseCurrency = baseCurrency;
        exchangeData.targetCurrency = targetCurrency;
        exchangeData.exchangeRate = exchangeRate;
        exchangeData.exchangeKeys = Object.keys(result.conversion_rates);
    } catch (error) {
        console.error('Error fetching currency exchange data:', error.message);
    }
}



const nasaApiKey = 'DEMO_KEY';
let solarData = {
    start_date: '2023-12-01',
    end_date: '2023-12-07',
    cme: 'init',
    gst: null,
    ips: null,
    flr: null
};
const fetchSolarData = async (start_date,end_date) => {
    const cmeUrl = `https://api.nasa.gov/DONKI/CME?startDate=${start_date}&endDate=${end_date}&api_key=${nasaApiKey}`;
    const gstUrl = `https://api.nasa.gov/DONKI/GST?startDate=${start_date}&endDate=${end_date}&location=Earth&api_key=${nasaApiKey}`;
    const ipsUrl = `https://api.nasa.gov/DONKI/IPS?startDate=${start_date}&endDate=${end_date}&api_key=${nasaApiKey}`;
    const flrUrl = `https://api.nasa.gov/DONKI/FLR?startDate=${start_date}&endDate=${end_date}&api_key=${nasaApiKey}`;
    try {
        if (solarData.cme!=null){
            const result = await fetchData(cmeUrl);
            if (result.result === 'error') {
                throw new Error(result['error-type']);
            }
            const output = result.map(function (entry) {
                const dt = datetime.create(entry.startTime);
                const formattedStartTime = dt.format('Y-m-d');

                const note = entry.note;

                const speeds = entry.cmeAnalyses ? entry.cmeAnalyses.map(analysis => analysis.speed) : [];
                const halfAngles = entry.cmeAnalyses ? entry.cmeAnalyses.map(analysis => analysis.halfAngle) : [];

                const averageSpeed = speeds.length > 0 ? speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length : null;
                const halfAngleDifference = Math.max(...halfAngles, 0) - Math.min(...halfAngles, 0);

                const maskObject = {
                    startTime: formattedStartTime,
                    note: note,
                    averageSpeed: averageSpeed,
                    angleWidth: halfAngleDifference
                };

                return maskObject;})
            solarData.cme = output;
            solarData.start_date = start_date;
            solarData.end_date = end_date;
        }
        if(solarData.gst!=null){
            const result = await fetchData(gstUrl);
            if (result.result === 'error') {
                throw new Error(result['error-type']);
            }
            const output = result.map(function (entry) {
                const dt = datetime.create(entry.startTime);
                const startTime = dt.format('Y-m-d');

                const kpIndexArray = entry.allKpIndex || [];

                const totalKpIndex = kpIndexArray.reduce((sum, data) => sum + data.kpIndex, 0);
                const averageKpIndex = kpIndexArray.length > 0 ? totalKpIndex / kpIndexArray.length : 0;

                return {
                    startTime: startTime,
                    kpIndex: averageKpIndex
                };
            })
            solarData.gst = output;
            solarData.start_date = start_date;
            solarData.end_date = end_date;
        }
        if (solarData.ips!=null){
            const result = await fetchData(ipsUrl);
            if (result.result === 'error') {
                throw new Error(result['error-type']);
            }
            const output = result.map(function (entry) {
                const dt = datetime.create(entry.eventTime);
                const eventTime = dt.format('Y-m-d');

                return {
                    eventTime: eventTime,
                };
            });
            solarData.ips = output;
            solarData.start_date = start_date;
            solarData.end_date = end_date;
        }
        if (solarData.flr!=null){
            const result = await fetchData(flrUrl);
            if (result.result === 'error') {
                throw new Error(result['error-type']);
            }
            const output = result.map(function (entry) {
                const dt = datetime.create(entry.beginTime);
                const formattedBeginTime = dt.format('Y-m-d');
                const classType = entry.classType;

                return {
                    beginTime: formattedBeginTime,
                    classType: classType
                };
            })
            solarData.flr = output;
            solarData.start_date = start_date;
            solarData.end_date = end_date;
        }
    } catch (error) {
        console.error('Error fetching currency exchange data:', error.message);
    }
}


// API route to get weather data
app.get('/', async (req, res) => {
    try {
        await fetchWeatherData();
        await fetchCurrencyExchangeData(baseCurrency,targetCurrency);
        //await fetchSolarData(solarData.start_date,solarData.end_date);
        res.render('index', { weatherData, exchangeData,solarData});
    } catch (error) {
        res.status(500).send('Error fetching data');
    }
});

app.post('/weatherlayer', async (req, res) => {
    const zoomfactor = 8;
    const x = req.body.x;
    const y = req.body.y;

    const mapUrl1 = `https://tile.openweathermap.org/map/precipitation_new/${zoomfactor}/${x}/${y}.png?appid=${openWeatherAPIKey}`;
    weatherData.rainmapurl = mapUrl1;
    const mapUrl2 = `https://tile.openweathermap.org/map/temp_new/${zoomfactor}/${x}/${y}.png?appid=${openWeatherAPIKey}`;
    weatherData.tempmapurl = mapUrl2;
    res.json({ mapUrl1 });
});

app.post('/citychange', async (req,res) => {
    currentCity = req.body.city;
    try {
        //await fetchWeatherData(currentCity);
        res.json({ message: 'Success', redirect: '/' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

app.post('/exchangechange', async (req,res) => {
    baseCurrency = req.body.base;
    targetCurrency = req.body.target;
    try {
        //await fetchCurrencyExchangeData(baseCurrency,targetCurrency);
        res.json({ message: 'Success', redirect: '/' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

app.post('/solarchange', async (req,res) => {
    try {
        if (req.body.cme==null) {solarData.cme=null;} else {solarData.cme=req.body.cme;}
        if (req.body.gst==null) {solarData.gst=null;} else {solarData.gst=req.body.gst;}
        if (req.body.ips==null) {solarData.ips=null;} else {solarData.ips=req.body.ips;}
        if (req.body.flr==null) {solarData.flr=null;} else {solarData.flr=req.body.flr;}
        solarData.start_date = req.body.start_date;
        solarData.end_date = req.body.end_date;
        //await fetchSolarData(solarData.start_date,solarData.end_date);
        res.json({ message: 'Success', redirect: '/' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});