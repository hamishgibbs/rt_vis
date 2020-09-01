try {
  var d3 = require('d3')
}
catch(err) {}

interface rtVis {
  _config: any;
  fullHeight: any,
  fullWidth: any,
  activeArea: string;
  activeTime: string;
  runDate: string;
  sourceDeaths: boolean;
  activeSource: string;
  geoUrl: string;
  summaryUrl: string;
  r0Url: string;
  casesInfectionUrl: string;
  casesReportUrl: string;
  obsCasesUrl: string;
  _dataset_ref: any;
  _requiredData: Promise<any[]>;
  _geoData: Promise<any[]>;
  _subregional_ref: any;
}

class rtVis {
  constructor(x: any) {

    this._config = x

    this.activeArea = x['activeArea']
    this.activeTime = x['activeTime']
    this.runDate = x['runDate']
    this.sourceDeaths = false
    this.activeSource = Object.keys(x['rtData'])[0]

    var available_rt_data: any = Object.values(x['rtData'][this.activeSource]).filter(x => x !== null )

    if(!available_rt_data[0].then){
      this._requiredData = Promise.all([{'geoData':x['geoData'],
        'rtData':x['rtData']}
      ])
    } else {
      this._requiredData = this.recursiveObjectPromiseAll([{'geoData':x['geoData'],
        'rtData':x['rtData']
      }])
    }

    this._subregional_ref = x['subregional_ref']

  }
  setupFlex(root_element){

    var onlyUnique = function(value, index, self) {
      return self.indexOf(value) === index;
    }

    var containsAll = (arr, target) => target.every(v => arr.includes(v));

    var eventHandlers = {
      'time7ButtonClick': this.time7ButtonClick.bind(this),
      'time14ButtonClick': this.time14ButtonClick.bind(this),
      'time30ButtonClick': this.time30ButtonClick.bind(this),
      'timeAllButtonClick': this.timeAllButtonClick.bind(this),
      'dropdownClick': this.dropdownClick.bind(this),
      'sourceSelectClick': this.sourceSelectClick.bind(this)
    }

    var _config = this._config
    var country = this.activeArea
    var time = this.activeTime
    var runDate = this.runDate
    var activeSource = this.activeSource

    this._requiredData.then(function(data: any){
      data = data[0]

      var s = new setup(_config);
      var t = new ts(_config)

      s.setupDropDown(root_element)

      if (data['geoData'] !== null && data['rtData'][activeSource]['summaryData'] !== null){
        s.setupMap(root_element)
      }

      try {var areaNames = data['rtData'][activeSource]['rtData'].map(function(d){return(d.region)}).filter(onlyUnique).sort()} catch {}
      try {var areaNames = data['rtData'][activeSource]['casesInfectionData'].map(function(d){return(d.region)}).filter(onlyUnique).sort()} catch {}
      try {var areaNames = data['rtData'][activeSource]['casesReportData'].map(function(d){return(d.region)}).filter(onlyUnique).sort()} catch {}

      // @ts-ignore
      $('#dropdown-container').append('.js-example-basic-single').select2({placeholder: 'Select an area', data: areaNames}).on('select2:select', eventHandlers['dropdownClick']);

      if (Object.keys(data['rtData']).length > 1){
        s.addSourceSelect(root_element, 'source-select', Object.keys(data['rtData']), eventHandlers['sourceSelectClick'])
      }

      s.setupCountryTitle(root_element)
      t.tsCountryTitle(country, 'country-title-container')

      if (data['rtData'][activeSource]['rtData'] !== null){
        s.setupRt(root_element)
      }

      if (data['rtData'][activeSource]['casesInfectionData'] !== null){
        s.setupCasesInfection(root_element)
      }

      if (data['rtData'][activeSource]['casesReportData'] !== null){
        s.setupCasesReport(root_element)
      }

      if (data['rtData'][activeSource]['rtData'] !== null || data['rtData'][activeSource]['casesInfectionData'] !== null || data['rtData'][activeSource]['casesReportData'] !== null) {
        s.setupControls(root_element, eventHandlers)
      }

      s.setupFooter(root_element)


      t.plotAllTs(country, time, data, activeSource, runDate)

    });

  }
  setupPage(root_element) {

    this.setupFlex(root_element)

  }
  createMap(){

    var _config = this._config
    var mapClick = this.mapClick.bind(this)
    var dropdownClick = this.dropdownClick.bind(this)
    var activeSource = this.activeSource

    this._requiredData.then(function(data: any){
      var m = new map(_config)
      m.setupMap(data[0]['geoData'], data[0]['rtData'][activeSource]['summaryData'], mapClick, dropdownClick)

    });
  }
  plotRt(dataset: any) {

    var _config = this._config
    var country = this.activeArea
    var time = this.activeTime
    var runDate = this.runDate
    var activeSource = this.activeSource

    this._requiredData.then(function(data: any){

      var t = new ts(_config)

      t.plotAllTs(country, time, data[0], activeSource, runDate)

    });
  }
  time7ButtonClick() {

    var _config = this._config
    var country = this.activeArea
    var runDate = this.runDate
    var activeSource = this.activeSource

    this._requiredData.then(function(data: any){
      var t = new ts(_config)

      var time = '7d'

      t.plotAllTs(country, time, data[0], activeSource, runDate)

    });

    this.activeTime = '7d'

  }
  time14ButtonClick() {


    var _config = this._config
    var country = this.activeArea
    var runDate = this.runDate
    var activeSource = this.activeSource

    this._requiredData.then(function(data: any){
      var t = new ts(_config)

      var time = '14d'

      t.plotAllTs(country, time, data[0], activeSource, runDate)

    });

    this.activeTime = '14d'

  }
  time30ButtonClick() {


    var _config = this._config
    var country = this.activeArea
    var runDate = this.runDate
    var activeSource = this.activeSource

    this._requiredData.then(function(data: any){
      var t = new ts(_config)

      var time = '30d'

      t.plotAllTs(country, time, data[0], activeSource, runDate)

    });

    this.activeTime = '30d'

  }
  timeAllButtonClick() {


    var _config = this._config
    var country = this.activeArea
    var runDate = this.runDate
    var activeSource = this.activeSource

    this._requiredData.then(function(data: any){
      var t = new ts(_config)

      var time = 'all'

      t.plotAllTs(country, time, data[0], activeSource, runDate)

    });

    this.activeTime = 'all'
  }
  mapClick(e) {

    this.activeArea = e.properties.sovereignt

    var _config = this._config
    var country = this.activeArea
    var time = this.activeTime
    var runDate = this.runDate
    var activeSource = this.activeSource

    this._requiredData.then(function(data: any){
      var t = new ts(_config)

      t.plotAllTs(country, time, data[0], activeSource, runDate)

    });

  }
  dropdownClick(e) {
    this.activeArea = e.params.data.text

    var _config = this._config
    var country = this.activeArea
    var time = this.activeTime
    var runDate = this.runDate
    var activeSource = this.activeSource

    this._requiredData.then(function(data: any){
      var t = new ts(_config)

      t.plotAllTs(country, time, data[0], activeSource, runDate)

    });

    d3.select('#select2-dropdown-container-container').text(this.activeArea)

  }
  sourceSelectClick(e) {

    this.activeSource = d3.select('#source-select :checked').text()

    var _config = this._config
    var country = this.activeArea
    var time = this.activeTime
    var runDate = this.runDate
    var activeSource = this.activeSource

    this.createMap()

    this._requiredData.then(function(data: any){
      var t = new ts(_config)

      t.plotAllTs(country, time, data[0], activeSource, runDate)

    });

  }
  zipObject(keys, values) {
    const result = {};

    keys.forEach((key, i) => {
      result[key] = values[i];
    });

    return result;
  };

  recursiveObjectPromiseAll(obj) {
    const keys = Object.keys(obj);
    return Promise.all(keys.map(key => {
      const value = obj[key];
      // Promise.resolve(value) !== value should work, but !value.then always works
      if (typeof value === 'object' && !value.then) {
        return this.recursiveObjectPromiseAll(value);
      }
      return value;
    }))
      .then(result => this.zipObject(keys, result));
  };

};
