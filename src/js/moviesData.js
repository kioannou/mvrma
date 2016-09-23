/**
 * @module {Module} src/js/moviesData.js
 *
 * This module contains all the ajax requests of the application
 */

"use strict";

var $ = require("jquery");
var MoviesView = require("./moviesView.js");
var Debug = require("debug");
var debug = Debug("moviesData");
Debug.enable('*');

/**
 * Request for getting the in-theater movies
 *
 * @function getInTheaterMovies
 *
 * @param {string} apiKey - RT's API key, required for the requests
 * @param pageLimit {number} - Number of movies that will be returned
 * @param page {number} Number of page
 * @param callback {function(): {}} - The callback function returns an object
 */
exports.getInTheaterMovies = function (apiKey, pageLimit, page, callback) {

    //Show loading
    MoviesView.loading.show();

    debug("Requesting for movies in theater");

    $.ajax({
        type: 'GET',
        url: 'http://api.rottentomatoes.com/api/public/v1.0/lists/movies/in_theaters.json?apikey=' + apiKey + '&page_limit=' + pageLimit + '&page=' + page,
        dataType: 'jsonp',
        success: function (response) {

            debug("Success on getting the movies in theater");

            //Hide loading
            MoviesView.loading.hide();

            //Formatting the response in a template that is useful for me
            var formattedResponse = {
                movies: response.movies,
                total: response.total,
                next: response.links.next ? response.links.next : null
            };

            return callback({
                success: true,
                data: formattedResponse
            });
        },
        error: function () {

            debug("Error on getting the movies in theater");

            //Hide loading
            MoviesView.loading.hide();

            return callback({
                success: false,
                data: {
                    movies: [],
                    total: 0,
                    next: null
                }
            });
        }
    });
};


/**
 * Request for searching a movie
 *
 * @param {string} apiKey - RT's API key, required for the requests
 * @param {string} stringForSearch - User's input for search
 * @param pageLimit {number} - Number of movies that will be returned
 * @param page {number} Number of page
 * @param callback {function(): {}} - The callback function returns an object
 */
exports.searchForMovie = function (apiKey, stringForSearch, pageLimit, page, callback) {

    debug("Requesting search for %s", stringForSearch);

    //Show loading
    MoviesView.loading.show();

    $.ajax({
        type: 'GET',
        url: 'http://api.rottentomatoes.com/api/public/v1.0/movies.json?apikey=' + apiKey + '&q=' + stringForSearch + '&page_limit=' + pageLimit + '&page=' + page,
        dataType: 'jsonp',
        success: function (response) {

            debug("Success on search request for %s", stringForSearch);
            debug("Response", response);

            //Hiding loading
            MoviesView.loading.hide();

            //Formatting the response in a template that is useful for me
            var formattedResponse = {
                movies: response.movies,
                total: response.total,
                next: response.links.next ? response.links.next : null
            };

            return callback({
                success: true,
                data: formattedResponse
            });
        },
        error: function () {

            debug("Error on search request for %s", stringForSearch);

            //Hide loading
            MoviesView.loading.hide();

            return callback({
                success: false,
                data: {
                    movies: [],
                    total: 0,
                    next: null
                }
            });
        }
    });
};


/**
 * Getting movie details for the selected movie
 *
 * @param {string} apiKey - RT's API key, required for the requests
 * @param {string} id - The id of the movie we are getting details
 * @returns {*}
 */
exports.getMovieDetails = function (apiKey, id) {

    debug("Getting movie details for the movie with id: ", id);

    return $.ajax({
        type: 'GET',
        url: 'http://api.rottentomatoes.com/api/public/v1.0/movies/' + id + '.json?apikey=' + apiKey,
        dataType: 'jsonp'
    });
};

/**
 * Getting reviews for the selected movie
 *
 * @param {string} apiKey - RT's API key, required for the requests
 * @param id - The id of the movie we are getting details
 * @param pageLimit
 * @returns {*}
 */
exports.getMovieReviews = function (apiKey, id, pageLimit) {

    debug("Getting movie reviews for the movie with id: ", id);

    return $.ajax({
        type: 'GET',
        url: 'http://api.rottentomatoes.com/api/public/v1.0/movies/' + id + '/reviews.json?apikey=' + apiKey + '&page_limit=' + pageLimit,
        dataType: 'jsonp'
    });
};

/**
 * Getting similar movies for the selected movie
 *
 * @param {string} apiKey - RT's API key, required for the requests
 * @param id - The id of the movie we are getting details
 * @param pageLimit
 * @returns {*}
 */
exports.getSimilarMovies = function (apiKey, id, pageLimit) {

    debug("Getting similar movies for the movie with id: ", id);

    return $.ajax({
        type: 'GET',
        url: 'http://api.rottentomatoes.com/api/public/v1.0/movies/' + id + '/similar.json?apikey=' + apiKey + '&page_limit=' + pageLimit,
        dataType: 'jsonp'
    });
};

