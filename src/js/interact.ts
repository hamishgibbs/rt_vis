try {
  var d3 = require('d3')
}
catch(err) {}

interface interact {
}

class interact extends rtVis {
  constructor (x) {
    super(x)
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
  mapDataClick(){

    this.activeMapData = d3.select('#map-dataset-item-active').text()

    this.createMap()

    //console.log(e)
    //console.log(this)

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
  timeBrush(date_lims){

    var time = date_lims
    var _config = this._config
    var country = this.activeArea
    var runDate = this.runDate
    var activeSource = this.activeSource

    this._requiredData.then(function(data: any){
      var t = new ts(_config)

      t.plotAllTs(country, time, data[0], activeSource, runDate)

    });

    this.activeTime = '7d'

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
}
