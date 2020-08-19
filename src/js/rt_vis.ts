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
  _dataset_ref: any;
  _subregional_ref: any;
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
    this.obsCasesUrl = 'https://raw.githubusercontent.com/epiforecasts/covid-rt-estimates/master/national/cases/summary/reported_cases.csv'
    this._requiredData = Promise.all([d3.json(this.geoUrl),
      d3.csv(this.summaryUrl),
      d3.csv(this.r0Url),
      d3.csv(this.casesInfectionUrl),
      d3.csv(this.casesReportUrl),
      d3.csv(this.obsCasesUrl)])
    //this._optionalData = Promise.all([d3.csv(this.obsCasesUrl)])
    this._dataset_ref = {'R0':{'index':2, 'title':'R'},'casesInfection':{'index':3, 'title':'Cases by date of infection'},'casesReport':{'index':4, 'title':'Cases by date of report'}}
    this._subregional_ref = {'Afghanistan':'https://epiforecasts.io/covid/posts/national/afghanistan/',
                             'Brazil':'https://epiforecasts.io/covid/posts/national/brazil/',
                             'Colombia':'https://epiforecasts.io/covid/posts/national/colombia/',
                             'India':'https://epiforecasts.io/covid/posts/national/india/',
                             'Italy':'https://epiforecasts.io/covid/posts/national/italy/',
                             'Germany':'https://epiforecasts.io/covid/posts/national/germany/',
                             'Russia':'https://epiforecasts.io/covid/posts/national/russia/',
                             'United Kingdom':'https://epiforecasts.io/covid/posts/national/united-kingdom/',
                             'United States of America':'https://epiforecasts.io/covid/posts/national/united-states/'}

  }
  setupPage() {

    var eventHandlersRef = {
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

      t.plotAllTs(country, time, data)

    });
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

      var time = '7d'

      t.plotAllTs(country, time, data)

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

      var time = '14d'

      t.plotAllTs(country, time, data)

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

      var time = '30d'

      t.plotAllTs(country, time, data)

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

      var time = 'all'

      t.plotAllTs(country, time, data)

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

      t.plotAllTs(country, time, data)

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

      t.plotAllTs(country, time, data)

    });

    d3.select('#select2-dropdown-container-container').text(this.activeArea)

  }
};
