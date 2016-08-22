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
    noteEntries: [],
    spinner: document.querySelector('.loader'),
    cardTemplate: document.querySelector('.cardTemplate'),
    container: document.querySelector('.main'),
    addDialog: document.querySelector('.dialog-container')
  };


  /*****************************************************************************
   *
   * Event listeners for UI elements
   *
   ****************************************************************************/

  document.getElementById('butRefresh').addEventListener('click', function() {
    // Refresh all of the notes
    app.updateNotes();
  });

  document.getElementById('butAdd').addEventListener('click', function() {
    // Open/show the add new note dialog
    app.toggleAddDialog(true);
  });

  document.getElementById('butAddNote').addEventListener('click', function() {
    var inputText = document.getElementById('text').value;
    console.log("add text: " + inputText);
    
    var index = 0;
    if(app.noteEntries) {
      console.log("i ", index);
      index = app.noteEntries.length;

      app.noteEntries.push({key: "text-" + index, label: inputText});
    } else {
      app.noteEntries = [
        {key: "text-0", label: inputText}
      ];
    }

    app.savenoteEntries();
    app.toggleAddDialog(false);
    app.updateNotes();
  });

  document.getElementById('butAddCancel').addEventListener('click', function() {
    // Close the add new note dialog
    app.toggleAddDialog(false);
  });


  /*****************************************************************************
   *
   * Methods to update/refresh the UI
   *
   ****************************************************************************/

  // Toggles the visibility of the add new note dialog.
  app.toggleAddDialog = function(visible) {
    if (visible) {
      app.addDialog.classList.add('dialog-container--visible');
    } else {
      app.addDialog.classList.remove('dialog-container--visible');
    }
  };

  // Updates a note card with the latest notes. If the card
  // doesn't already exist, it's cloned from the template.
  app.updateNoteCard = function(data) {
    console.log("updateNoteCard ", data);
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

  // Iterate all of the cards and attempt to get the latest forecast data
  app.updateNotes = function() {

    app.noteEntries = localStorage.noteEntries;
    if (app.noteEntries) {
      app.noteEntries = JSON.parse(app.noteEntries);
      app.noteEntries.forEach(function(city) {
        console.log("start ", city.key, city.label);
        //app.getForecast(city.key, city.label);
        var results = {};
        results.key = city.key;
        results.label = city.label;
        console.log("before update");
        app.updateNoteCard(results);
      });
    } 

    console.log("update");
  };

  // Save list of notes to localStorage, see note below about localStorage.
  app.savenoteEntries = function() {
    var noteEntries = JSON.stringify(app.noteEntries);
    // IMPORTANT: See notes about use of localStorage.
    localStorage.noteEntries = noteEntries;
  };


  var initialData = {
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

  app.noteEntries = localStorage.noteEntries;
  if (app.noteEntries) {
    app.noteEntries = JSON.parse(app.noteEntries);
    app.noteEntries.forEach(function(note) {
      console.log("start ", note.key, note.label);
      var results = {};
      results.key = note.key;
      results.label = note.label;
      console.log("before update");
      app.updateNoteCard(results);
    });
  } else {
    app.spinner.setAttribute('hidden', true);
    app.container.removeAttribute('hidden');
    app.isLoading = false;
  }

  if('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./service-worker.js')
             .then(function() { console.log('Service Worker registered'); });
  }
})();
