import React from "react"
import ReactDOM from "react-dom"
import nodeChanges from "../data/nodesChanges"
import nodePositions from "../data/nodesPositions"
import communityName from "../data/communityName"

import citiesMetadata from "../data/citiesMetadata"

import links from "../data/links"
import IndustrialNetworkResponsive from "./components/IndustrialNetwork.jsx"

let citiesMetadataKeys = []
for (let entry of citiesMetadata) {
  for (let keyName of Object.keys(entry)) {
    if (keyName!="city" && keyName!="year") {
      citiesMetadataKeys.push(keyName)
    }
  }
}
citiesMetadataKeys = [...new Set(citiesMetadataKeys.map((e) => e))]

let nodeMetadataKeys = []
for (let entry of nodeChanges) {
  for (let keyName of Object.keys(entry)) {
    if (keyName!="city" && keyName!="year" && keyName!="size" && keyName!="activated" && keyName!="id") {
      nodeMetadataKeys.push(keyName)
    }
  }
}
nodeMetadataKeys = [...new Set(nodeMetadataKeys.map((e) => e))]

let cities = [...new Set(nodeChanges.map((e) => e.city))]
let years = [...new Set(nodeChanges.map((e) => e.year))]
cities.sort()
years.sort((a,b) => a-b)

const palette = [
  "#03aedf",
  "#81cbd5",
  "#521301",
  "#035a15",
  "#e8b605",
  "#e8a0c0",
  "#aae905",
  "#b10405",
  "#03ad22",
  "#aae905",
  "#e8d98a",
  "#d35005"
]

class App extends React.Component {
  constructor(props) {
    super(props)

    let citiesLookup = {}
    for (let entry of citiesMetadata) {
      let cityEntry = {}
      for (let key of citiesMetadataKeys) {
        cityEntry[key] = entry[key]
      }
      citiesLookup[[entry.city,entry.year]] = cityEntry
    }

    let cityMeta = {}
    for (let key of citiesMetadataKeys) {
      cityMeta[key] = citiesLookup[[cities[0],years[0]]][key]
    }

    this.state = {
      city: cities[0],
      year: years[0],
      nodePositions: nodePositions,
      nodeChanges: nodeChanges,
      links: links,
      communityName:communityName,
      playTimers: [],
      playing: false,
      citiesLookup: citiesLookup,
      cityMeta:cityMeta,
    }

    this.yearChanged = this.yearChanged.bind(this)
    this.cityChanged = this.cityChanged.bind(this)
    this.playThrough = this.playThrough.bind(this)
    this.stopPlayThrough = this.stopPlayThrough.bind(this)
  }

  yearChanged(e) {
    let newCityMeta = {}
    for (let key of citiesMetadataKeys) {
      newCityMeta[key] = this.state.citiesLookup[[this.state.city,parseInt(e.target.value)]][key]
    }
    this.setState({
      year:parseInt(e.target.value),
      cityMeta:newCityMeta,
    })
  }

  cityChanged(e) {
    let newCityMeta = {}
    for (let key of citiesMetadataKeys) {
      newCityMeta[key] = this.state.citiesLookup[[e.target.value,this.state.year]][key]
    }
    this.setState({
      city: e.target.value,
      cityMeta:newCityMeta,
    })
  }

  playThrough() {
    let playTimers = []
    for (let i=0; i < years.length; i++) {
      playTimers.push(setTimeout(() => this.yearChanged({target: {value: years[i]}}), i*600))
    }
    this.setState({playTimers: playTimers, playing: true})
    setTimeout(() => this.stopPlayThrough,(years.length + 1)*600)
  }

  stopPlayThrough() {
    for (let timer of this.state.playTimers) {
      clearTimeout(timer)
    }
    this.setState({playTimers: [], playing: false})
  }

  render() {
    let nodeChangesLookup = {}
    for (let node of this.state.nodeChanges) {

      // THIS IS FOR NODE META
      let nodeMeta = {}
      for (let key of nodeMetadataKeys) {
        nodeMeta[key] = node[key]
      }
      // END NODE META

      if (node.city === this.state.city && node.year === this.state.year) {
        nodeChangesLookup[node.id] = {activated: node.activated, size: node.size,
          nodeMeta:nodeMeta}
      }
    }


    let nodeLookup = {}
    let nodeData = []
    for (let node of this.state.nodePositions) {
      let processedNode = {}
      processedNode.id = node.id
      processedNode.x = node.x
      processedNode.y = node.y
      processedNode.name = node.name
      processedNode.color = palette[node.community_id%palette.length]
      nodeLookup[node.id] = {x: processedNode.x, y: processedNode.y}
      if (nodeChangesLookup[node.id] && nodeChangesLookup[node.id].activated) {
        processedNode["activated"] = true
      } else {
        processedNode["activated"] = false
      }

      if (nodeChangesLookup[node.id] && nodeChangesLookup[node.id].size) {
        processedNode["size"] = nodeChangesLookup[node.id].size
      } else {
        processedNode["size"] = this.props.defaultNodeSize
      }
      if (nodeChangesLookup[node.id] && nodeChangesLookup[node.id].nodeMeta) {
        processedNode["nodeMeta"] = nodeChangesLookup[node.id].nodeMeta
      } else {
        processedNode["nodeMeta"] = {}
      }
      nodeData.push(processedNode)
    }

    let linkPositions = []
    for (let link of this.state.links) {
      linkPositions.push({
        x1: nodeLookup[link.parentId].x,
        y1: nodeLookup[link.parentId].y,
        x2: nodeLookup[link.childId].x,
        y2: nodeLookup[link.childId].y,
        id: `${link.parentId}-${link.childId}`,
        weight: link.weight,
      })
    }

    let cityOptions = cities.map((e) => <option key={e} value={e}>{e}</option>)
    let yearOptions = years.map((e) => <option key={e} value={e}>{e}</option>)

    let activeNodes = nodeData.filter((e) => e.activated).map((e) => <li key={e.name}>{e.name}</li>)

    let legendCircles = []
    let legendText = []
    let legendSeparation = 23

    let legendCircleCount = 0
    for (let community of this.state.communityName) {
      legendCircles.push(
        <circle key={"community"+community.community_id+"LegendCircle"}
          cx={10} cy={10+legendSeparation*legendCircleCount} r={8}
          fill={palette[community.community_id%palette.length]}/>
      )
      legendText.push(
        <text className={"legendText"}
          key={"community"+community.community_id+"LegendText"}
          x={30} y={15+legendSeparation*legendCircleCount}> {""+community.name} </text>
      )
      legendCircleCount++;
    }

    let playPauseButton = <button className="playButton" onClick={this.playThrough}> Play </button>
    if (this.state.playing) {
      playPauseButton = <button className="playButton" onClick={this.stopPlayThrough}> Stop </button>
    }

    let citiesMetadataBullets = []
    for (let key of citiesMetadataKeys) {
      citiesMetadataBullets.push(
        <li key={key+"_cityMeta"}>{key}: {this.state.cityMeta[key]}</li>
      )
    }

    return(
      <div>
        <div className="menu Left">
          <h2> Menu </h2>
          <select value={this.state.year} onChange={this.yearChanged} className="menuSelect">
            {yearOptions}
          </select>

          <select value={this.state.city} onChange={this.cityChanged} className="menuSelect">
            {cityOptions}
          </select>
          <div className="playButtonDiv">
          {playPauseButton}
          </div>

          <ul>
           {citiesMetadataBullets}
          </ul>

          <div className="legend">
            <svg className="legendCircles" height={legendSeparation*legendCircleCount}>
              {legendCircles}
              {legendText}
            </svg>
          </div>
        </div>

        <div className="menu networkViz">
          <IndustrialNetworkResponsive nodeData={nodeData}
            linkPositions={linkPositions}
            linkScale={this.props.linkScale}
            nodeScale={this.props.nodeScale}
            width={this.props.width} height={this.props.height}
          />
        </div>

        <div className="menu Right">
          <h2> Active nodes </h2>
          <ul>
            {activeNodes}
          </ul>
        </div>
      </div>

    )
  }
}

let h = 0.75*window.innerHeight;

ReactDOM.render(
  <App linkScale={1} nodeScale={15} defaultNodeSize={.75}
    width={"100%"} height={h} />,
  document.getElementById("react-app")
)
