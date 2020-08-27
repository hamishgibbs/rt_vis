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
  geoUrl: string;
  summaryUrl: string;
  r0Url: string;
  casesInfectionUrl: string;
  casesReportUrl: string;
  obsCasesUrl: string;
  _dataset_ref: any;
  _requiredData: Promise<any[]>;
  _subregional_ref: any;
  _availableData: any;
}

class rtVis {
  constructor(x: any) {

    this._config = x

    this.activeArea = x['activeArea']
    this.activeTime = x['activeTime']
    this.runDate = x['runDate']
    this.sourceDeaths = false

    this._requiredData = Promise.all([x['geoData'],
      x['summaryData'],
      x['rtData'],
      x['casesInfectionData'],
      x['casesReportData'],
      x['obsCasesData'],
      x['rtData_Deaths'],
      x['casesInfectionData_Deaths'],
      x['casesReportData_Deaths']
    ])

    this._dataset_ref = [{'geoData':{'index':0, 'title':'Geography'}},
                         {'summaryData':{'index':1, 'title':'Summary'}},
                         {'rt':{'index':2, 'title':'R'}},
                         {'casesInfection':{'index':3, 'title':'Cases by date of infection'}},
                         {'casesReport':{'index':4, 'title':'Cases by date of report'}},
                         {'obsCasesData':{'index':5, 'title':'Observed cases'}},
                         {'rt_Deaths':{'index':6, 'title':'R'}},
                         {'casesInfection_Deaths':{'index':7, 'title':'Cases by date of infection'}},
                         {'casesReport_Deaths':{'index':8, 'title':'Cases by date of report'}},
                       ]


    this._subregional_ref = x['subregional_ref']

    this._availableData = []

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
      'sourceToggleClick': this.sourceToggleClick.bind(this)
    }

    var _dataset_ref = this._dataset_ref
    var _config = this._config
    var getAvailableData = this.getAvailableData
    var country = this.activeArea
    var time = this.activeTime
    var runDate = this.runDate
    var sourceDeaths = this.sourceDeaths

    this._requiredData.then(function(data: any){

      var availableData = getAvailableData(data, _dataset_ref)

      var s = new setup(_config);
      var t = new ts(_config)

      s.setupDropDown(root_element)

      if (availableData.includes('geoData') && availableData.includes('summaryData')) {
        s.setupMap(root_element)
      }

      try {var areaNames = data[2].map(function(d){return(d.country)}).filter(onlyUnique).sort()} catch {}
      try {var areaNames = data[3].map(function(d){return(d.country)}).filter(onlyUnique).sort()} catch {}
      try {var areaNames = data[4].map(function(d){return(d.country)}).filter(onlyUnique).sort()} catch {}

      // @ts-ignore
      $('#dropdown-container').append('.js-example-basic-single').select2({placeholder: 'Select an area', data: areaNames}).on('select2:select', eventHandlers['dropdownClick']);

      console.log(this._config)

      console.log(availableData)
      console.log('Contains all = ' + containsAll(availableData, ['rt','casesInfection','casesReport','rt_Deaths','casesInfection_Deaths','casesReport_Deaths']))

      if (containsAll(availableData, ['rt','casesInfection','casesReport','rt_Deaths','casesInfection_Deaths','casesReport_Deaths'])){
        s.addSourceToggle(root_element, 'source-toggle', eventHandlers['sourceToggleClick'])
      }

      s.setupCountryTitle(root_element)
      t.tsCountryTitle(country, 'country-title-container')

      console.log(data)
      console.log(availableData)

      //plot all ts here - not this

      if (availableData.includes('rt')){
        s.setupRt(root_element)
      }

      if (availableData.includes('casesInfection')){
        s.setupCasesInfection(root_element)
      }

      if (availableData.includes('casesReport')){
        s.setupCasesReport(root_element)
      }

      console.log(availableData)

      if (availableData.includes('rt') || availableData.includes('casesInfection') || availableData.includes('casesReport')) {
        s.setupControls(root_element, eventHandlers)
      }

      s.setupFooter(root_element)

      t.plotAllTs(country, time, data, getAvailableData(data, _dataset_ref), runDate, sourceDeaths)

    });

  }
  getAvailableData(data, _dataset_ref) {

    var availableData = data.map((e, i) => e !== null ? i : '').filter(String)

    availableData =  availableData.map(function (item) {return _dataset_ref[item];})

    availableData = availableData.map(function (item) {return(Object.keys(item));}).flat()

    return(availableData)

  }
  setupPage(root_element) {

    this.setupFlex(root_element)

  }
  createMap(){

    var _config = this._config
    var mapClick = this.mapClick.bind(this)
    var dropdownClick = this.dropdownClick.bind(this)
    var getAvailableData = this.getAvailableData

    this._requiredData.then(function(data: any){
      var m = new map(_config)
      m.setupMap(data[0], data[1], mapClick, dropdownClick)

    });
  }
  plotRt(dataset: any) {

    var _config = this._config
    var _dataset_ref = this._dataset_ref
    var country = this.activeArea
    var time = this.activeTime
    var getAvailableData = this.getAvailableData
    var runDate = this.runDate
    var sourceDeaths = this.sourceDeaths

    this._requiredData.then(function(data: any){

      var t = new ts(_config)

      t.plotAllTs(country, time, data, getAvailableData(data, _dataset_ref), runDate, sourceDeaths)

    });
  }
  time7ButtonClick() {

    var _config = this._config
    var _dataset_ref = this._dataset_ref
    var country = this.activeArea
    var getAvailableData = this.getAvailableData
    var runDate = this.runDate
    var sourceDeaths = this.sourceDeaths

    this._requiredData.then(function(data: any){
      var t = new ts(_config)

      var time = '7d'

      t.plotAllTs(country, time, data, getAvailableData(data, _dataset_ref), runDate, sourceDeaths)

    });

    this.activeTime = '7d'

  }
  time14ButtonClick() {


    var _config = this._config
    var _dataset_ref = this._dataset_ref
    var country = this.activeArea
    var getAvailableData = this.getAvailableData
    var runDate = this.runDate
    var sourceDeaths = this.sourceDeaths

    this._requiredData.then(function(data: any){
      var t = new ts(_config)

      var time = '14d'

      t.plotAllTs(country, time, data, getAvailableData(data, _dataset_ref), runDate, sourceDeaths)

    });

    this.activeTime = '14d'

  }
  time30ButtonClick() {


    var _config = this._config
    var _dataset_ref = this._dataset_ref
    var country = this.activeArea
    var getAvailableData = this.getAvailableData
    var runDate = this.runDate
    var sourceDeaths = this.sourceDeaths

    this._requiredData.then(function(data: any){
      var t = new ts(_config)

      var time = '30d'

      t.plotAllTs(country, time, data, getAvailableData(data, _dataset_ref), runDate, sourceDeaths)

    });

    this.activeTime = '30d'

  }
  timeAllButtonClick() {


    var _config = this._config
    var _dataset_ref = this._dataset_ref
    var country = this.activeArea
    var getAvailableData = this.getAvailableData
    var runDate = this.runDate
    var sourceDeaths = this.sourceDeaths

    this._requiredData.then(function(data: any){
      var t = new ts(_config)

      var time = 'all'

      t.plotAllTs(country, time, data, getAvailableData(data, _dataset_ref), runDate, sourceDeaths)

    });

    this.activeTime = 'all'
  }
  mapClick(e) {

    this.activeArea = e.properties.sovereignt

    var _config = this._config
    var _dataset_ref = this._dataset_ref
    var country = this.activeArea
    var time = this.activeTime
    var getAvailableData = this.getAvailableData
    var runDate = this.runDate
    var sourceDeaths = this.sourceDeaths

    this._requiredData.then(function(data: any){
      var t = new ts(_config)

      t.plotAllTs(country, time, data, getAvailableData(data, _dataset_ref), runDate, sourceDeaths)

    });

  }
  dropdownClick(e) {
    this.activeArea = e.params.data.text

    var _config = this._config
    var _dataset_ref = this._dataset_ref
    var country = this.activeArea
    var time = this.activeTime
    var getAvailableData = this.getAvailableData
    var runDate = this.runDate
    var sourceDeaths = this.sourceDeaths

    this._requiredData.then(function(data: any){
      var t = new ts(_config)

      t.plotAllTs(country, time, data, getAvailableData(data, _dataset_ref), runDate, sourceDeaths)

    });

    d3.select('#select2-dropdown-container-container').text(this.activeArea)

  }
  sourceToggleClick(e) {

    if (this.sourceDeaths){
      this.sourceDeaths = false
    } else {
      this.sourceDeaths = true
    }

    var _config = this._config
    var _dataset_ref = this._dataset_ref
    var country = this.activeArea
    var time = this.activeTime
    var getAvailableData = this.getAvailableData
    var runDate = this.runDate
    var sourceDeaths = this.sourceDeaths

    this._requiredData.then(function(data: any){
      var t = new ts(_config)

      t.plotAllTs(country, time, data, getAvailableData(data, _dataset_ref), runDate, sourceDeaths)

    });

    console.log(this.sourceDeaths)

  }
};
