pocketciv-js
============

Javascript library for PocketCiv game

This package is a RequireJS library for PocketCiv. It also contains simple AngularJS web client as an example client.

Development
========
- Fork the repo
- npm install
- npm run test
- npm run watch
- npm run start (in another terminal)
- Open http://localhost:3000 with your browser

Architecture
=========

The main file is pocketciv.js. It contains the main elements of the game:
- Event deck
- Engine
- Workers
 - TribeMover
 - Reducer
 - AdvanceAcquirer

The idea is that the engine is stateless. Any action can be done at any moment. Any advance can be acquired and so on. It is the clients responsibility to check that user actions are valid. For that, it can use Workers like TribeMover that checks that the suggested tribe movement is ok.

There is couple of callback functions that the client must implement:
- drawer: Draws the next card
- changer: Shows the upcoming changes to user and asks confirmation 
- reducer: Reduces tribes and other stuff from the map (use Reducer)
- mover: Moves tribes around (use TribeMover)

These callback function should implement the UI part of the software using the engine and workers. No business logic is allowed in the UI client.
