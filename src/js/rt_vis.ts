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
  activeSource: string;
  activeMapData: string;
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

    this.fullWidth = x['fullWidth']

  }
  setupFlex(root_element){

    var onlyUnique = function(value, index, self) {
      return self.indexOf(value) === index;
    }

    var containsAll = (arr, target) => target.every(v => arr.includes(v));

    var i = new interact(this._config)

    var eventHandlers = {
      'time7ButtonClick': i.time7ButtonClick.bind(this),
      'time14ButtonClick': i.time14ButtonClick.bind(this),
      'time30ButtonClick': i.time30ButtonClick.bind(this),
      'timeAllButtonClick': i.timeAllButtonClick.bind(this),
      'dropdownClick': i.dropdownClick.bind(this),
      'sourceSelectClick': i.sourceSelectClick.bind(this)
    }

    var _config = this._config
    var country = this.activeArea
    var time = this.activeTime
    var runDate = this.runDate
    var activeSource = this.activeSource
    var subRegion = this.subRegion
    var fullWidth = this.fullWidth

    this._requiredData.then(function(data: any){
      data = data[0]

      /*

      */
      // For development until EpiNow2 changes
      data['rtData']['Cases']['summaryData'] = data['rtData']['Cases']['summaryData'].map(subRegion);
      data['rtData']['Cases']['rtData'] = data['rtData']['Cases']['rtData'].map(subRegion);
      data['rtData']['Cases']['casesInfectionData'] = data['rtData']['Cases']['casesInfectionData'].map(subRegion);
      data['rtData']['Cases']['casesReportData'] = data['rtData']['Cases']['casesReportData'].map(subRegion);
      data['rtData']['Deaths']['summaryData'] = data['rtData']['Deaths']['summaryData'].map(subRegion);
      data['rtData']['Deaths']['rtData'] = data['rtData']['Deaths']['rtData'].map(subRegion);
      data['rtData']['Deaths']['casesInfectionData'] = data['rtData']['Deaths']['casesInfectionData'].map(subRegion);
      data['rtData']['Deaths']['casesReportData'] = data['rtData']['Deaths']['casesReportData'].map(subRegion);

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
        s.addSourceSelect(root_element, 'source-select', Object.keys(data['rtData']), eventHandlers['sourceSelectClick'], fullWidth)
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

    var i = new interact(this._config)

    var _config = this._config
    var mapClick = i.mapClick.bind(this)
    var dropdownClick = i.dropdownClick.bind(this)
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
  subRegion(s) {

    if ( s.hasOwnProperty("Country") ){
         s.region = s.Country;
         delete s.Country;
         return(s)
    } else if ( s.hasOwnProperty("country") ){
         s.region = s.country;
         delete s.country;
         return(s)
    } else if ( s.hasOwnProperty("Region") ){
         s.region = s.Region;
         delete s.Region;
         return(s)
    } else {
      return(s)
    }

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
