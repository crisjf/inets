import React from "react"
import ReactDOM from "react-dom"
import nodeChanges from "../data/nodesChanges"
import nodePositions from "../data/nodesPositions"
import citiesMetadata from "../data/citiesMetadata"
import industriesMetadata from "../data/industriesMetadata"
import communityName from "../data/communityName"
import links from "../data/links"

import IndustrialNetworkResponsive from "./components/IndustrialNetwork.jsx"

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
      citiesLookup[[entry.city,entry.year]] = {export:parseInt(entry.export),
        nProducts:entry.nProducts,firstYear:parseInt(entry.firstYear)}
    }
    this.state = {
      city: 'Stockholm',
      year: 1940,
      cityExport: citiesLookup[['Sweden',1940]].export,
      cityNProducts: citiesLookup[['Sweden',1940]].nProducts,
      firstYear: citiesLookup[['Sweden',1940]].firstYear,
      nodePositions: nodePositions,
      nodeChanges: nodeChanges,
      links: links,
      citiesMetadata: citiesMetadata,
      industriesMetadata: industriesMetadata,
      citiesLookup: citiesLookup,
      communityName:communityName,
      playTimers: [],
      playing: false
    }
    this.yearChanged = this.yearChanged.bind(this)
    this.cityChanged = this.cityChanged.bind(this)
    this.playThrough = this.playThrough.bind(this)
    this.stopPlayThrough = this.stopPlayThrough.bind(this)
  }

  yearChanged(e) {
    this.setState({
      year: parseInt(e.target.value),
      cityExport: this.state.citiesLookup[[this.state.city,parseInt(e.target.value)]].export,
      cityNProducts: this.state.citiesLookup[[this.state.city,parseInt(e.target.value)]].nProducts,
      firstYear: this.state.citiesLookup[[this.state.city,parseInt(e.target.value)]].firstYear,
    })
  }

  cityChanged(e) {
    this.setState({
      city: e.target.value,
      cityExport: this.state.citiesLookup[[e.target.value,this.state.year]].export,
      cityNProducts: this.state.citiesLookup[[e.target.value,this.state.year]].nProducts,
      firstYear: this.state.citiesLookup[[e.target.value,this.state.year]].firstYear,
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
      if (node.city === this.state.city && node.year === this.state.year) {
        nodeChangesLookup[node.id] = {activated: node.activated, size: node.size,
          nodeExport:node.export, nodeShare:node.share}
      }
    }

    let industriesMetadataLookup = {}
    for (let node of this.state.industriesMetadata) {
      if (node.year === this.state.year) {
        industriesMetadataLookup[node.id] = {existed:node.existed}
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

      if (industriesMetadataLookup[node.id] && industriesMetadataLookup[node.id].existed) {
        processedNode["existed"] = true
      } else {
        processedNode["existed"] = false
      }
      if (nodeChangesLookup[node.id] && nodeChangesLookup[node.id].size) {
        processedNode["size"] = nodeChangesLookup[node.id].size
      } else {
        processedNode["size"] = this.props.defaultNodeSize
      }
      if (nodeChangesLookup[node.id] && nodeChangesLookup[node.id].nodeExport) {
        processedNode["nodeExport"] = nodeChangesLookup[node.id].nodeExport
      } else {
        processedNode["nodeExport"] = ""
      }
      if (nodeChangesLookup[node.id] && nodeChangesLookup[node.id].nodeShare) {
        processedNode["nodeShare"] = nodeChangesLookup[node.id].nodeShare
      } else {
        processedNode["nodeShare"] = ""
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
    legendCircles.push(
      <circle key={"notExistedLegendCircle"} cx={10} cy={10} r={8} fill={"#212831"}/>
    )
    legendText.push(
      <text className={"legendText"} key={"notExistedLegendText"}
        x={30} y={15}> {"Not produced in Sweden"} </text>
    )
    legendCircles.push(
      <circle key={"notProducedLegendCircle"} cx={10} cy={10+1*legendSeparation} r={8} fill={"#3b424a"}/>
    )
    legendText.push(
      <text className={"legendText"} key={"notProducedLegendText"}
        x={30} y={15+1*legendSeparation}> {"Not produced in "+this.state.city}</text>
    )
    let legendCircleCount = 2
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

    let playPauseButton = <button onClick={this.playThrough}> Play </button>
    if (this.state.playing) {
      playPauseButton = <button onClick={this.stopPlayThrough}> Stop </button>
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

          {playPauseButton}

          <ul>
            <li>Total production: {this.state.cityExport} SEK</li>
            <li>Diversification: {this.state.cityNProducts}</li>
            <li>First reported year: {this.state.firstYear}</li>
          </ul>

          <div className="legend">
            <svg className="legendCircles" height={legendSeparation*legendCircleCount}>
              {legendCircles}
              {legendText}
            </svg>
          </div>

          <div className={"methodsButton"}>
            <a href="methods.html" className="button">Methods</a>
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
          <h2> List of products </h2>
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
