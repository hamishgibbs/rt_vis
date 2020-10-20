try {
  var d3 = require('d3')
}
catch(err) {}

class rtVisInterface {
  _config: any;
  fullHeight: any;
  fullWidth: any;
  activeArea: string;
  activeTime: string;
  runDate: string;
  activeSource: string;
  activeMapData: string;
  downloadUrl: string;
  ts_color_ref: any;
  _dataset_ref: any;
  _requiredData: Promise<any[]>;
  _geoData: Promise<any[]>;
  _subregional_ref: any;
}

export class rtVis extends rtVisInterface {
  constructor(x: any) {

    super()

    this._config = x

    this.activeArea = x['activeArea']
    this.activeTime = x['activeTime']
    this.runDate = x['runDate']
    this.activeSource = Object.keys(x['rtData'])[0]
    this.activeMapData = 'Expected change in daily cases'
    this.downloadUrl = x['downloadUrl']
    this.ts_color_ref = x['ts_color_ref']

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
  summaryWidget(root_element) {

    this.setupPage(root_element)
    this.createMap()

  }
  setupFlex(root_element){

    var onlyUnique = this.onlyUnique

    var containsAll = (arr, target) => target.every(v => arr.includes(v));

    var i = new interact(this._config)

    var eventHandlers = {
      'timeBrush':i.timeBrush.bind(this),
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
    var getDateLims = this.getDateLims
    var setActiveTime = function(lims){this.activeTime = lims}.bind(this)
    var downloadUrl = this.downloadUrl
    var ts_color_ref = this.ts_color_ref

    this._requiredData.then(function(data: any){
      data = data[0]

      var date_lims = null

      // For development until EpiNow2 changes
      try {
        data['rtData']['Cases']['summaryData'] = data['rtData']['Cases']['summaryData'].map(subRegion);
        data['rtData']['Cases']['rtData'] = data['rtData']['Cases']['rtData'].map(subRegion);
        data['rtData']['Cases']['casesInfectionData'] = data['rtData']['Cases']['casesInfectionData'].map(subRegion);
        data['rtData']['Cases']['casesReportData'] = data['rtData']['Cases']['casesReportData'].map(subRegion);
        data['rtData']['Deaths']['summaryData'] = data['rtData']['Deaths']['summaryData'].map(subRegion);
        data['rtData']['Deaths']['rtData'] = data['rtData']['Deaths']['rtData'].map(subRegion);
        data['rtData']['Deaths']['casesInfectionData'] = data['rtData']['Deaths']['casesInfectionData'].map(subRegion);
        data['rtData']['Deaths']['casesReportData'] = data['rtData']['Deaths']['casesReportData'].map(subRegion);
      } catch {}

      var s = new setup(_config);
      var t = new ts(_config)

      var ts_null = data['rtData'][activeSource]['rtData'] === null && data['rtData'][activeSource]['casesInfectionData'] === null && data['rtData'][activeSource]['casesReportData'] === null

      if (!ts_null || downloadUrl !== null){
        var header = s.setupHeader(root_element)
      }

      if (!ts_null){
        s.setupDropDown(header)
      }

      if (downloadUrl !== null){
        s.setupDownload(header, downloadUrl, fullWidth)
      }

      if (data['geoData'] !== null && data['rtData'][activeSource]['summaryData'] !== null){
        s.setupMap(root_element)
      }

      try {var areaNames = data['rtData'][activeSource]['rtData'].map(function(d){return(d.region)}).filter(onlyUnique).sort()} catch {}
      try {var areaNames = data['rtData'][activeSource]['casesInfectionData'].map(function(d){return(d.region)}).filter(onlyUnique).sort()} catch {}
      try {var areaNames = data['rtData'][activeSource]['casesReportData'].map(function(d){return(d.region)}).filter(onlyUnique).sort()} catch {}

      if (!ts_null){

        // @ts-ignore
        $('#dropdown-container').append('.js-example-basic-single').select2({placeholder: 'Select an area', data: areaNames}).on('select2:select', eventHandlers['dropdownClick']);

        s.setupCountryTitle(root_element)
        t.tsCountryTitle(country, 'country-title-container')
      }

      if (Object.keys(data['rtData']).length > 1){
        var sources_header = s.setupSourcesHeader(root_element)

        s.addSourceSelect(sources_header, 'source-select', Object.keys(data['rtData']), eventHandlers['sourceSelectClick'], fullWidth)
      }

      if (data['rtData'][activeSource]['rtData'] !== null){
        s.setupRt(root_element)
        date_lims = getDateLims(data['rtData'][activeSource]['rtData'], onlyUnique)
      }

      if (data['rtData'][activeSource]['casesInfectionData'] !== null){
        s.setupCasesInfection(root_element)
        date_lims = getDateLims(data['rtData'][activeSource]['casesInfectionData'], onlyUnique)
      }

      if (data['rtData'][activeSource]['casesReportData'] !== null){
        s.setupCasesReport(root_element)
        date_lims = getDateLims(data['rtData'][activeSource]['casesReportData'], onlyUnique)
      }

      if (data['rtData'][activeSource]['rtData'] !== null || data['rtData'][activeSource]['casesInfectionData'] !== null || data['rtData'][activeSource]['casesReportData'] !== null) {
        s.setupControls(root_element, eventHandlers, date_lims, ts_color_ref)
      }

      s.setupFooter(root_element)


      t.plotAllTs(country, date_lims, data, activeSource, runDate)

      setActiveTime(date_lims)

    });

  }
  getDateLims(data, onlyUnique){
    var parseTime = d3.timeParse("%Y-%m-%d");

    var dates = data.map(function(d){return(d['date'])}).filter(onlyUnique).map(function(d){return(parseTime(d))})

    return([d3.min(dates), d3.max(dates)]);

  }
  onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }
  setupPage(root_element) {

    this.setupFlex(root_element)

  }
  createMap(){

    var i = new interact(this._config)

    var _config = this._config
    var mapClick = i.mapClick.bind(this)
    var dropdownClick = i.dropdownClick.bind(this)
    var mapDataClick = i.mapDataClick.bind(this)
    var activeSource = this.activeSource
    var activeMapData = this.activeMapData


    this._requiredData.then(function(data: any){
      var m = new map(_config)
      m.setupMap(data[0]['geoData'], data[0]['rtData'][activeSource]['summaryData'], mapClick, dropdownClick, mapDataClick, activeMapData)

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
