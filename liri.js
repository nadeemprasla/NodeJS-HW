console.log("Loading...")
require("dotenv").config();
var inquirer = require('inquirer');
var keys = require('./keys.js');
var Spotify = require("node-spotify-api");
var axios = require("axios")
var spotify = new Spotify(keys.spotify);
var omdbKey = keys.omdb.apikey
var moment = require("moment")
var fs = require('fs')


function startInquery() {

    inquirer.prompt([{
            type: "list",
            name: "task",
            message: "Do this command below...",
            choices: ["Concert-this", "Spotify-this-song", "Movie-this", "Do-what it says"]
        },
        // {
        //     name: "term",
        //     Message: "Search Term:"
        // }
    ]).then(function(response) {
        if (response.task === "Do-what it says") {
            taskFunctions.doWhat();
        } else(
            searchInputter(response)
        )
    })
}

function searchInputter(response) {
    inquirer.prompt([{
        name: "term",
        Message: "Search Term:"
    }]).then(function(data) {
        term = data.term
        term = term.replace(/\s/g, '+');
        switch (response.task) {
            case "Concert-this":
                taskFunctions.concert(term);
                break;
            case "Spotify-this-song":
                taskFunctions.spotify(term);
                break;
            case "Movie-this":
                taskFunctions.movie(term);
                break;
        }
    })
}


startInquery();


function confirmation() {

    inquirer.prompt([{
        type: "confirm",
        name: "confirm",
        message: "Do you want to search again",
    }]).then(function(response) {
        if (response.confirm === true) {
            startInquery();
        } else { process.exit() }
    })
}

count = 0;
var taskFunctions = {
    concert: function(artist) {
        url = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp"
        axios.get(url).then(function(response) {
            var condRes = response.data[count]
            var time = moment(condRes.datetime).format('MMMM Do YYYY')
            printer.concert(condRes.lineup[0], condRes.venue.name, condRes.venue.region, condRes.venue.city, time)
        }).then(function() {
            if (count < 3) {
                inquirer.prompt([{
                    type: "confirm",
                    name: "next",
                    message: "Next concert?"
                }]).then(function(res) {
                    if (res.next === true) {
                        count++;
                        taskFunctions.concert(artist)
                    } else {
                        count = 0;
                        confirmation();
                    }
                })
            } else {
                count = 0;
                confirmation()
            }
        })
    },
    spotify: function(song) {
        spotify.search({
            type: 'track',
            query: song
        }).then(function(response) {
            var condRes = response.tracks.items[0]
            var time = moment(condRes.album.release_date).format('MMMM Do YYYY');
            printer.spotify(condRes.name, condRes.artists[0].name, condRes.external_urls.spotify, condRes.album.name, time)
        }).catch(function() {
            console.log(`
------------------------------------------------------
The Sign

            Artist Name: Ace of Base
            Preview Link: https://open.spotify.com/track/0hrBpAOgrt8RXigk83LLNE
            Album: Happy Nation
            Release Date: 1992
------------------------------------------------------
                `)
        }).finally(function() {
            confirmation()
        })
    },
    movie: function(search) {
        url = "http://www.omdbapi.com/?apikey=" + omdbKey + "&t=" + search
        axios.get(url).then(function(response) {
            var condRes = response.data
                // var time = moment(condRes.Released).format('MMMM Do YYYY')
            printer.movie(condRes.Title, condRes.Released, condRes.Ratings[0].Value, condRes.Ratings[1].Value, condRes.Country, condRes.Language, condRes.Plot, condRes.Actors)
        }).then(function() {
            confirmation()
        })
    },
    doWhat: function() {
        fs.readFile("random.txt", "utf8", function(error, data) {
            dataArray = data.split(',')
            term = dataArray[1]
            term = term.replace(/\s/g, '+');
            task = dataArray[0].toLowerCase()
            switch (task) {
                case "concert-this":
                    taskFunctions.concert(term);
                    break;
                case "spotify-this-song":
                    taskFunctions.spotify(term);
                    break;
                case "movie-this":
                    taskFunctions.movie(term);
                    break;
            }
        })
    }
}


var printer = {
    concert: function(artist, venue, region, city, time) {
        var printThis = `
------------------------------------------------------
${artist}

        Venue: 
            Name: ${venue}
            Region: ${region}
            City: ${city}
            Date/Time: ${time}
------------------------------------------------------
                `;
        console.log(printThis)
        fs.appendFile("log.txt", printThis, function(err) {})
    },
    spotify: function(name, artist, url, album, time) {
        var printThis = `
------------------------------------------------------
${name}

            Artist Name: ${name}
            Preview Link: ${url}
            Album: ${album}
            Release Date: ${time}
------------------------------------------------------
                `;
        console.log(printThis)
        fs.appendFile("log.txt", printThis, function(err) {})
    },
    movie: function(title, release, imRating, rtRating, country, language, plot, actor) {
        var printThis = `
    ------------------------------------------------------
${title}

            Release: ${release}
            IMDB Rating: ${imRating}
            Rotten Tomato Rating: ${rtRating}
            Production Country: ${country}
            Language: ${language}
            Actors: ${actor}
            Plot: ${plot}
------------------------------------------------------
                `;
        console.log(printThis)
        fs.appendFile("log.txt", printThis, function(err) {})
    },
    dothis: function(params) {

    }
}