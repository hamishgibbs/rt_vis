try {
  var d3 = require('d3')
}
catch(err) {}

interface rtVis {
  activeArea: string;
  activeData: string;
  activeTime: string;
  geoUrl: string;
  summaryUrl: string;
  r0Url: string;
  casesInfectionUrl: string;
  casesReportUrl: string;
  obsCasesUrl: string;
  _requiredData: Promise<any[]>;
  //_optionalData: Promise<any[]>;
  _dataset_ref: any;
  r0ButtonClick(): void;
}
class rtVis {
  constructor() {
    this.activeArea = 'United Kingdom';
    this.activeData = 'R0'
    this.activeTime = 'all'
    this.geoUrl = 'https://raw.githubusercontent.com/hamishgibbs/rt_interactive_vis/master/geo_data/world.geojson';
    this.summaryUrl = 'https://raw.githubusercontent.com/epiforecasts/covid-rt-estimates/master/national/cases/summary/summary_table.csv';
    this.r0Url = 'https://raw.githubusercontent.com/epiforecasts/covid-rt-estimates/master/national/cases/summary/rt.csv'
    this.casesInfectionUrl = 'https://raw.githubusercontent.com/epiforecasts/covid-rt-estimates/master/national/cases/summary/cases_by_infection.csv'
    this.casesReportUrl = 'https://raw.githubusercontent.com/epiforecasts/covid-rt-estimates/master/national/cases/summary/cases_by_report.csv'
    this.obsCasesUrl = 'https://opendata.ecdc.europa.eu/covid19/casedistribution/csv'
    this._requiredData = Promise.all([d3.json(this.geoUrl),
      d3.csv(this.summaryUrl),
      d3.csv(this.r0Url),
      d3.csv(this.casesInfectionUrl),
      d3.csv(this.casesReportUrl)])
    //this._optionalData = Promise.all([d3.csv(this.obsCasesUrl)])
    this._dataset_ref = {'R0':{'index':2, 'title':'R'},'casesInfection':{'index':3, 'title':'Cases by date of infection'},'casesReport':{'index':4, 'title':'Cases by date of report'}}

  }
  setupPage() {

    var eventHandlersRef = {
      'r0ButtonClick': this.r0ButtonClick.bind(this),
      'casesInfectionButtonClick': this.casesInfectionButtonClick.bind(this),
      'casesReportButtonClick': this.casesReportButtonClick.bind(this),
      'time7ButtonClick': this.time7ButtonClick.bind(this),
      'time14ButtonClick': this.time14ButtonClick.bind(this),
      'time30ButtonClick': this.time30ButtonClick.bind(this),
      'timeAllButtonClick': this.timeAllButtonClick.bind(this),
    }

    this._requiredData.then(function(data: any){
      var s = new setup();
      s.setupLayout(eventHandlersRef)

    });
  }
  createMap(){

    var mapClick = this.mapClick.bind(this)
    var dropdownClick = this.dropdownClick.bind(this)

    this._requiredData.then(function(data: any){
      var m = new map
      m.setupMap(data[0], data[1], mapClick, dropdownClick)
    });
  }
  plotRt(dataset: any) {

    var country = this.activeArea
    var time = this.activeTime
    var dataset_ref = this._dataset_ref

    if (this.activeData === 'R0'){
      var r0 = true
    } else {
      var r0 = false
    }

    this._requiredData.then(function(data: any){

      var t = new ts

      t.plotTs(data[dataset_ref[dataset]['index']], country, time, r0)
      t.tsTitle(country, dataset_ref[dataset]['title'])

    });
  }
  r0ButtonClick() {


    //this switched to bound because it is fixed when it is bound
    //the  data and time methods talk to eachother correctly

    var country = this.activeArea
    var time = this.activeTime

    this._requiredData.then(function(data: any){
      var t = new ts

      t.plotTs(data[2], country, time, true)
      t.tsTitle(country, 'Cases by date of infection')

    });

    this.activeData = 'R0'

  }
  casesInfectionButtonClick() {



    var country = this.activeArea
    var time = this.activeTime

    this._requiredData.then(function(data: any){
      var t = new ts

      t.plotTs(data[3], country, time)
      t.tsTitle(country, 'Cases by date of infection')

    });

    this.activeData = 'casesInfection'
  }
  casesReportButtonClick() {



    var country = this.activeArea
    var time = this.activeTime

    this._requiredData.then(function(data: any){
      var t = new ts

      t.plotTs(data[4], country, time)
      t.tsTitle(country, 'Cases by date of report')

    });

    this.activeData = 'casesReport'

  }
  time7ButtonClick() {



    var country = this.activeArea
    var dataset = this._dataset_ref[this.activeData]['index']
    var dataset_title = this._dataset_ref[this.activeData]['title']

    if (this.activeData === 'R0'){
      var r0 = true
    } else {
      var r0 = false
    }

    this._requiredData.then(function(data: any){
      var t = new ts

      t.plotTs(data[dataset], country, '7d', r0)
      t.tsTitle(country, dataset_title)

    });

    this.activeTime = '7d'

  }
  time14ButtonClick() {



    var country = this.activeArea
    var dataset = this._dataset_ref[this.activeData]['index']
    var dataset_title = this._dataset_ref[this.activeData]['title']

    if (this.activeData === 'R0'){
      var r0 = true
    } else {
      var r0 = false
    }

    this._requiredData.then(function(data: any){
      var t = new ts

      t.plotTs(data[dataset], country, '14d', r0)
      t.tsTitle(country, dataset_title)

    });

    this.activeTime = '14d'

  }
  time30ButtonClick() {



    var country = this.activeArea
    var dataset = this._dataset_ref[this.activeData]['index']
    var dataset_title = this._dataset_ref[this.activeData]['title']

    if (this.activeData === 'R0'){
      var r0 = true
    } else {
      var r0 = false
    }

    this._requiredData.then(function(data: any){
      var t = new ts

      t.plotTs(data[dataset], country, '30d', r0)
      t.tsTitle(country, dataset_title)

    });

    this.activeTime = '30d'

  }
  timeAllButtonClick() {



    var country = this.activeArea
    var dataset = this._dataset_ref[this.activeData]['index']
    var dataset_title = this._dataset_ref[this.activeData]['title']

    if (this.activeData === 'R0'){
      var r0 = true
    } else {
      var r0 = false
    }

    this._requiredData.then(function(data: any){
      var t = new ts

      t.plotTs(data[dataset], country, 'all', r0)
      t.tsTitle(country, dataset_title)

    });

    this.activeTime = 'all'
  }
  mapClick(e) {

    this.activeArea = e.properties.sovereignt

    var country = this.activeArea
    var dataset = this._dataset_ref[this.activeData]['index']
    var dataset_title = this._dataset_ref[this.activeData]['title']
    var time = this.activeTime

    if (this.activeData === 'R0'){
      var r0 = true
    } else {
      var r0 = false
    }

    this._requiredData.then(function(data: any){
      var t = new ts

      t.plotTs(data[dataset], country, time, r0)
      t.tsTitle(country, dataset_title)

    });

  }
  dropdownClick(e) {
    this.activeArea = e.params.data.text

    var country = this.activeArea
    var dataset = this._dataset_ref[this.activeData]['index']
    var dataset_title = this._dataset_ref[this.activeData]['title']
    var time = this.activeTime

    if (this.activeData === 'R0'){
      var r0 = true
    } else {
      var r0 = false
    }

    this._requiredData.then(function(data: any){
      var t = new ts

      t.plotTs(data[dataset], country, time, r0)
      t.tsTitle(country, dataset_title)

    });

    d3.select('#select2-dropdown-container-container').text(this.activeArea)

  }

};
