// Copyright 2016 Google Inc.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


(function() {
  'use strict';

  var app = {
    isLoading: true,
    visibleCards: {},
    selectedCities: [],
    spinner: document.querySelector('.loader'),
    cardTemplate: document.querySelector('.cardTemplate'),
    container: document.querySelector('.main'),
    addDialog: document.querySelector('.dialog-container'),
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  };


  /*****************************************************************************
   *
   * Event listeners for UI elements
   *
   ****************************************************************************/

  document.getElementById('butRefresh').addEventListener('click', function() {
    // Refresh all of the forecasts
    app.updateForecasts();
  });

  document.getElementById('butAdd').addEventListener('click', function() {
    // Open/show the add new city dialog
    app.toggleAddDialog(true);
  });

  document.getElementById('butAddNote').addEventListener('click', function() {
    var inputText = document.getElementById('text').value;
    console.log("add text: " + inputText);
    
    var index = 0;
    if(app.selectedCities) {
      console.log("i ", index, app.selectedCities);
      index = app.selectedCities.length;

      app.selectedCities.push({key: "text-" + index, label: inputText});
    } else {
      app.selectedCities = [
        {key: "text-0", label: inputText}
      ];
    }

    app.saveSelectedCities();
    app.toggleAddDialog(false);
    app.updateForecasts();
  });

  document.getElementById('butAddCancel').addEventListener('click', function() {
    // Close the add new city dialog
    app.toggleAddDialog(false);
  });


  /*****************************************************************************
   *
   * Methods to update/refresh the UI
   *
   ****************************************************************************/

  // Toggles the visibility of the add new city dialog.
  app.toggleAddDialog = function(visible) {
    if (visible) {
      app.addDialog.classList.add('dialog-container--visible');
    } else {
      app.addDialog.classList.remove('dialog-container--visible');
    }
  };

  // Updates a weather card with the latest weather forecast. If the card
  // doesn't already exist, it's cloned from the template.
  app.updateForecastCard = function(data) {
    /*var dataLastUpdated = new Date(data.created);
    var sunrise = data.channel.astronomy.sunrise;
    var sunset = data.channel.astronomy.sunset;
    var current = data.channel.item.condition;
    var humidity = data.channel.atmosphere.humidity;
    var wind = data.channel.wind;
*/
    console.log("updateForecastCard ", data);
    var card = app.visibleCards[data.key];
    if (!card) {
      console.log("card", card);
      card = app.cardTemplate.cloneNode(true);
      card.classList.remove('cardTemplate');
      card.querySelector('.text').textContent = data.label;
      card.removeAttribute('hidden');
      app.container.appendChild(card);
      app.visibleCards[data.key] = card;
    }

    if (app.isLoading) {
      app.spinner.setAttribute('hidden', true);
      app.container.removeAttribute('hidden');
      app.isLoading = false;
    }
  };


  /*****************************************************************************
   *
   * Methods for dealing with the model
   *
   ****************************************************************************/

  /*
   * Gets a forecast for a specific city and updates the card with the data.
   * getForecast() first checks if the weather data is in the cache. If so,
   * then it gets that data and populates the card with the cached data.
   * Then, getForecast() goes to the network for fresh data. If the network
   * request goes through, then the card gets updated a second time with the
   * freshest data.
   */
  app.getForecast = function(key, label) {
    console.log("getForecast ", key,label);
    var results = {};
    results.key = key;
    results.label = label;
    console.log("before update");
    app.updateForecastCard(results);
    console.log("after update");

  };

  // Iterate all of the cards and attempt to get the latest forecast data
  app.updateForecasts = function() {

    app.selectedCities = localStorage.selectedCities;
    if (app.selectedCities) {
      app.selectedCities = JSON.parse(app.selectedCities);
      app.selectedCities.forEach(function(city) {
        console.log("start ", city.key, city.label);
        app.getForecast(city.key, city.label);
      });
    } 

    //var keys = Object.keys(app.visibleCards);
    //keys.forEach(function(key) {
    //  app.getForecast(key);
    //});
    console.log("update");
    //app.getForecast("text");
  };

  // Save list of cities to localStorage, see note below about localStorage.
  app.saveSelectedCities = function() {
    var selectedCities = JSON.stringify(app.selectedCities);
    // IMPORTANT: See notes about use of localStorage.
    localStorage.selectedCities = selectedCities;
  };


  /*
   * Fake weather data that is presented when the user first uses the app,
   * or when the user has not saved any cities. See startup code for more
   * discussion.
   */
  var initialWeatherForecast = {
    key: 'text',
    label: 'initial text',
  };

  /************************************************************************
   *
   * Code required to start the app
   *
   * NOTE: To simplify this codelab, we've used localStorage.
   *   localStorage is a synchronous API and has serious performance
   *   implications. It should not be used in production applications!
   *   Instead, check out IDB (https://www.npmjs.com/package/idb) or
   *   SimpleDB (https://gist.github.com/inexorabletash/c8069c042b734519680c)
   ************************************************************************/

  app.selectedCities = localStorage.selectedCities;
  if (app.selectedCities) {
    app.selectedCities = JSON.parse(app.selectedCities);
    app.selectedCities.forEach(function(city) {
      console.log("start ", city.key, city.label);
      app.getForecast(city.key, city.label);
    });
  } /*else {*/
    /* The user is using the app for the first time, or the user has not
     * saved any cities, so show the user some fake data. A real app in this
     * scenario could guess the user's location via IP lookup and then inject
     * that data into the page.
     */
    /*console.log("initial");
    app.updateForecastCard(initialWeatherForecast);
    app.selectedCities = [
      {key: initialWeatherForecast.key, label: initialWeatherForecast.label}
    ];
    app.saveSelectedCities();
  }*/

  if('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./service-worker.js')
             .then(function() { console.log('Service Worker registered'); });
  }
})();
