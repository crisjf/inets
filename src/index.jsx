import React from "react"
import ReactDOM from "react-dom"
import nodeChanges from "../data/nodesChanges"
import nodePositions from "../data/nodesPositions"
import citiesMetadata from "../data/citiesMetadata"
import links from "../data/links"

let cities = [...new Set(nodeChanges.map((e) => e.city))]
let years = [...new Set(nodeChanges.map((e) => e.year))]
cities.sort()
years.sort((a,b) => a-b)

const palette = [
  "#336699",
  "#339999",
  "#336666",
  "#996699",
  "#336633",
  "#116699",
]

class App extends React.Component {
  constructor(props) {
    super(props)
    let citiesLookup = {}
    for (let entry of citiesMetadata) {
      let cityYearLookup = {}
      citiesLookup[[entry.city,entry.year]] = {export:parseInt(entry.export),nProducts:entry.nProducts}
    }
    this.state = {
      city: 'Sweden',
      year: 1940,
      cityExport: citiesLookup[['Sweden',1940]].export,
      cityNProducts: citiesLookup[['Sweden',1940]].nProducts,
      nodePositions: nodePositions,
      nodeChanges: nodeChanges,
      links: links,
      citiesMetadata: citiesMetadata,
      citiesLookup: citiesLookup
    }
    this.yearChanged = this.yearChanged.bind(this)
    this.cityChanged = this.cityChanged.bind(this)
  }

  yearChanged(e) {
    this.setState({
      year: parseInt(e.target.value),
      cityExport: this.state.citiesLookup[[this.state.city,parseInt(e.target.value)]].export,
      cityNProducts: this.state.citiesLookup[[this.state.city,parseInt(e.target.value)]].nProducts,
    })
  }

  cityChanged(e) {
    this.setState({
      city: e.target.value,
      cityExport: this.state.citiesLookup[[e.target.value,this.state.year]].export,
      cityNProducts: this.state.citiesLookup[[e.target.value,this.state.year]].nProducts,
    })
  }

  render() {
    let nodeChangesLookup = {}
    for (let node of this.state.nodeChanges) {
      if (node.city === this.state.city && node.year === this.state.year) {
        nodeChangesLookup[node.id] = {activated: node.activated, size: node.size, nodeExport:node.export, nodeShare:node.share}
      }
    }

    let nodeLookup = {}
    let nodeData = []
    for (let node of this.state.nodePositions) {
      let processedNode = {}
      processedNode.id = node.id
      processedNode.x = 0.9*this.props.width*node.x
      processedNode.y = 0.9*this.props.height*node.y
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
          <ul>
            <li>Total export: {this.state.cityExport} SEK</li>
            <li>Diversification: {this.state.cityNProducts}</li>
          </ul>
        </div>


        <div className="menu networkViz">
          <IndustrialNetwork nodeData={nodeData}
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

class IndustrialNetwork extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      chosenNode: "",
      nodeExport: ""
    }
    this.updateTooltip = this.updateTooltip.bind(this)
  }

  updateTooltip(name,nodeExport,nodeShare) {
    if (nodeExport==0) {
      nodeExport = ""
    } else {
      nodeShare = parseInt(nodeShare*10000)/100
      nodeExport = "Export value: "+parseInt(nodeExport)+" SEK ("+nodeShare+"%)"
    }
    this.setState({chosenNode: name,
                  nodeExport: nodeExport})
  }

  render() {
    let lines = []
    for (let link of this.props.linkPositions) {
      lines.push(
        <Link key={link.id} link={link} linkScale={this.props.linkScale}/>
      )
    }
    let circles = []
    for (let node of this.props.nodeData) {
      circles.push(<Node key={node.id} node={node} nodeScale={this.props.nodeScale}
        updateTooltip={this.updateTooltip}/>)
    }

    return(
      <div>
        <div id="tooltip">
          <p>{this.state.chosenNode}&nbsp;</p>
          <p>{this.state.nodeExport}&nbsp;</p>
        </div>

        <div id="network">
          <svg width={this.props.width} height={this.props.height}>
            <g transform="translate(40,40)">
              <g key="lines">
                {lines}
              </g>
              <g key="nodes">
                {circles}
              </g>
            </g>
          </svg>
        </div>
      </div>
    )

  }
}



class Node extends React.Component {
  constructor(props) {
    super(props)
    this.handleEnter = this.handleEnter.bind(this)
    this.handleLeave = this.handleLeave.bind(this)
  }
  handleEnter(){
    this.props.updateTooltip(this.props.node.name,this.props.node.nodeExport,this.props.node.nodeShare)
  }
  handleLeave(){
    this.props.updateTooltip("",0,"")
  }
  render() {
    return(
      <circle cx={this.props.node.x} cy={this.props.node.y}
        r={this.props.nodeScale*this.props.node.size}
        fill={(this.props.node.activated && this.props.node.color) || "#3b424a"}
        onMouseEnter={this.handleEnter}
        onMouseLeave={this.handleLeave}
      />
    )
  }
}


class Link extends React.Component {
  render() {
    return(
      <line x1={this.props.link.x1} y1={this.props.link.y1}
        x2={this.props.link.x2} y2={this.props.link.y2}
        key={this.props.link.id}
        strokeWidth={this.props.linkScale*this.props.link.weight}
        stroke="#212831"/>
    )
  }
}


ReactDOM.render(
  <App linkScale={1} nodeScale={15} defaultNodeSize={.5}
    width={800} height={600} />,
  document.getElementById("react-app")
)
