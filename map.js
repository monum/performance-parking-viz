let INITIALLAT = 42.3473;
let INITIALLONG = -71.045;
let INITIALZOOM = 16;


let STARTDATE = '2017-01-03';
let ENDDATE = '2017-12-30';


class Meter {

  constructor(occupancyByDate, id, lat, long) {
    this.initialize = this.initialize.bind(this);
    this._occupancy = this._occupancy.bind(this);
    this._radius = this._radius.bind(this);
    this._getStyle = this._getStyle.bind(this);
    this.addMeterMarker = this.addMeterMarker.bind(this);

    this.occupancyByDate = occupancyByDate;
    this.id = id;
    this.lat = lat;
    this.long = long;
    this.circle = null;
  }

  initialize(map) {
    this.circle = L.circle([this.lat, this.long], this._getStyle(STARTDATE)).addTo(map);
  }

  _occupancy(date) {
    return parseFloat(this.occupancyByDate[date]);
  }

  _radius(occupancy) {
    if (isNaN(occupancy)) {
      return 10.0;
    }
    return occupancy*20.0;
  }

  _getStyle(date) {
    let occupancy = this._occupancy(date);
    if (occupancy >= .80) {
      return {
        weight: 0.1,
        color: 'red',
        fillColor: '#f03',
        radius: this._radius(occupancy),
        fillOpacity: 1.0
      };
    }
    return {
      weight: 0.1,
      color: 'blue',
      fillColor: '#00bfff',
      radius: this._radius(occupancy),
      fillOpacity: 0.7
    };

  }

  addMeterMarker(date) {
    this.circle.setStyle(this._getStyle(date));
  }
}

function* dateIndex(datesLength) {
  var index = 0;
  while(index < datesLength) {
    yield index++;
  }
}


class Map {

  constructor(geocodes, occupancyByMeter, dates, ids, aggMonthAverages) {
    this._initializeMeters = this._initializeMeters.bind(this);
    this._initializeMonthData = this._initializeMonthData.bind(this);
    this.transition = this.transition.bind(this);
    this.go = this.go.bind(this);
    this._addMetersByDate = this._addMetersByDate.bind(this);
    this._updateMonth = this._updateMonth.bind(this);
    this._getMonthDataHtml = this._getMonthDataHtml.bind(this);
    // this._updateProgressBar = this._updateProgressBar.bind(this);

    // Data objects
    this.geocodes = geocodes;
    this.occupancyByMeter = occupancyByMeter;
    this.dates = dates;
    this.ids = ids;
    this.agg = aggMonthAverages;

    // Initialize map with tiles
    this.map = new L.Map("map", {
      center: new L.LatLng(INITIALLAT, INITIALLONG),
      zoom: INITIALZOOM
    });
    let layer = new L.StamenTileLayer("toner");
    this.map.addLayer(layer);

    // Dynamic elements
    this.generator = dateIndex(this.dates.length);
    this.meters = this._initializeMeters();
    this._initializeMonthData();
    this.monthData = document.getElementById('aggregateMonthData');
    this.month_names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  }

  _initializeMeters() {
    let meters = {};
    for (let i = 0; i < this.ids.length; i++) {

      let currentId = this.ids[i];
      let geocode = this.geocodes[currentId];

      if (geocode) {
        let lat = geocode.lat;
        let long = geocode.long;
        let newMeter = new Meter(this.occupancyByMeter[currentId], currentId, lat, long);
        newMeter.initialize(this.map);
        meters[currentId] = newMeter;
      }
    }
    return meters;
  }

  _initializeMonthData() {
    let aggData = L.control();
    aggData.onAdd = function (map) {
        this.data = L.DomUtil.create('div', 'monthData');
        this.data.setAttribute('id', 'aggregateMonthData');
        return this.data;
    };
    aggData.addTo(this.map);

    // let progress = L.control();
    // progress.onAdd = function (map) {
    //     this.progressBar = L.DomUtil.create('div', 'bars, leaflet-control');
    //     this.progressBarTotal = L.DomUtil.create('div', 'bars');
    //     this.progressBar.setAttribute('id', 'progressBar');
    //     this.progressBarTotal.setAttribute('id', 'progressBarTotal');
    //     this.progressBarTotal.appendChild(this.progressBar);
    //     return this.progressBarTotal;
    // };
    // progress.addTo(this.map);
  }

  _addMetersByDate(date) {
    for (let meterId in this.meters) {
      let meter = this.meters[meterId];
      meter.addMeterMarker(date);
    }
  }

  _getMonthDataHtml(dataObject, monthIndex) {
    let month = this.month_names[monthIndex];
    let averageSession = Math.round(dataObject.average_session_length*60);
    let averageOccupancy = Math.round(dataObject.occupancy*100);
    return "<h1>Seaport Aggregate Data</h1><h2>"+String(month)+"</h2><p><h4>Average parking session length:</h4><h4> "+String( averageSession)+" minutes</h4></p><p><h4>Average occupancy rates:</h4><h4>"+String(averageOccupancy)+"%</h4></p>";

  }

  // _updateProgressBar(date) {
  //   let progressBar = document.getElementById('progressBar');
  //   let progress = this.dates.indexOf(date)/this.dates.length
  //   progressBar.style.width = "width: "+String(progress)+"%"
  // }

  _updateMonth(date) {
    let dateObject = new Date(date);
    let oldMonthHtml = this.monthData.innerHTML;
    let newMonthHtml = this._getMonthDataHtml(this.agg[dateObject.getMonth()+1], dateObject.getMonth());
    if (oldMonthHtml !== newMonthHtml) {
      this.monthData.innerHTML = newMonthHtml;
    }
  }

  transition() {
    let nextIndex = this.generator.next().value;
    let date = this.dates[nextIndex];
    this._addMetersByDate(date);
    this._updateMonth(date);
    // this._updateProgressBar(date);
  }

  go() {
    this.transition();
    window.setTimeout(this.go,1000);
  }
}
