# Map Thing 
[![Build Status](https://travis-ci.org/JamesRamm/MapThing.svg?branch=master)](https://travis-ci.org/JamesRamm/MapThing) 

Desktop web map viewer with a flexible extensions framework. MapThing utilizes web technology to gear itself toward integration of geovisualisation and statistical analysis. 

MapThing is written in Javascript using Electron

## Goals
1. Provide a simple and beautiful interface to enable interactive visualisation of geospatial data
2. Provide an API for creating all kinds of visualisations and interactivity through plugins
3. Provide easy-to-use generic UI clients for WMS, WMTS, WFS(T), WPS and TMS web services
4. Bring together web interactivity and desktop processing

## Running MapThing.

Requirements:

- nodejs >= 6.3
- Electron >= 1.3

run `npm install` followed by `npm run templates`. 
You should now be able to run MapThing by running `electron .` in the MapThing directory

## Configuration

Edit the `conf/conf.json` file to edit the default base layers and WMS services. The plugins directory can also be configured.
To enable the example plugins, point the `plugins` path in `conf.json` to the `plugins` directory in the MapThing root folder