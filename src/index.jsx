import React from "react"
import ReactDOM from "react-dom"
import nodeChanges from "../data/nodesChanges"
import nodePositions from "../data/nodesPositions"
import links from "../data/links"

let cities = [...new Set(nodeChanges.map((e) => e.city))]
let years = [...new Set(nodeChanges.map((e) => e.year))]
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
    this.state = {
      city: cities[0],
      year: years[0],
      nodePositions: nodePositions,
      nodeChanges: nodeChanges,
      links: links
    }
    this.yearChanged = this.yearChanged.bind(this)
    this.cityChanged = this.cityChanged.bind(this)
  }

  yearChanged(e) {
    this.setState({
      year: parseInt(e.target.value)
    })
  }

  cityChanged(e) {
    this.setState({
      city: e.target.value
    })
  }

  render() {
    let nodeChangesLookup = {}
    for (let node of this.state.nodeChanges) {
      if (node.city === this.state.city && node.year === this.state.year) {
        nodeChangesLookup[node.id] = {activated: node.activated, size: node.size}
      }
    }
    console.log(nodeChangesLookup)

    let nodeLookup = {}
    let nodeData = []
    for (let node of this.state.nodePositions) {
      let processedNode = {}
      processedNode.x = 0.8*this.props.width*node.x
      processedNode.y = 0.8*this.props.height*node.y
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

    return(
      <div>
        <select value={this.state.year} onChange={this.yearChanged}>
          {yearOptions}
        </select>
        <select value={this.state.city} onChange={this.cityChanged}>
          {cityOptions}
        </select>
        <div>
          <IndustrialNetwork nodeData={nodeData}
            linkPositions={linkPositions}
            linkScale={this.props.linkScale}
            nodeScale={this.props.nodeScale}
            width={this.props.width} height={this.props.height}
          />
        </div>
      </div>
    )
  }
}


class IndustrialNetwork extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      chosenNode: ""
    }
    this.updateTooltip = this.updateTooltip.bind(this)
  }

  updateTooltip(name) {
    return (
      () => this.setState({chosenNode: name})
    )
  }

  render() {
    let lines = []
    for (let link of this.props.linkPositions) {
      lines.push(
        <line x1={link.x1} y1={link.y1} x2={link.x2} y2={link.y2}
          key={link.id} strokeWidth={this.props.linkScale*link.weight}
          stroke="black"/>
      )
    }
    let circles = []
    for (let node of this.props.nodeData) {
      circles.push(
        <circle cx={node.x} cy={node.y} key={node.id}
          r={this.props.nodeScale*node.size}
          fill={(node.activated && node.color) || "#999999"}
          onMouseEnter={this.updateTooltip(node.name)}
          onMouseLeave={this.updateTooltip("")}
        />
      )
    }

    return(
      <div>
        <div id="network">
          <svg width={this.props.width} height={this.props.height}>
            <g transform="translate(40,40)">
              {lines}
              {circles}
            </g>
          </svg>
        </div>
        <div id="tooltip">
          <p>{this.state.chosenNode}</p>
        </div>
      </div>
    )

  }
}


ReactDOM.render(
  <App linkScale={1} nodeScale={1.5} defaultNodeSize={5}
    width={800} height={600} />,
  document.getElementById("react-app")
)
