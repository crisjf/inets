import React from "react"
import ReactDOM from "react-dom"
import nodeChanges from "../data/nodesChanges"
import nodePositions from "../data/nodesPositions"
import citiesMetadata from "../data/citiesMetadata"
import industriesMetadata from "../data/industriesMetadata"
import communityName from "../data/communityName"
import links from "../data/links"
import {Resize} from "replot-core"

let cities = [...new Set(nodeChanges.map((e) => e.city))]
let years = [...new Set(nodeChanges.map((e) => e.year))]
console.log(years)
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
      let cityYearLookup = {}
      citiesLookup[[entry.city,entry.year]] = {export:parseInt(entry.export),nProducts:entry.nProducts}
    }
    this.state = {
      city: 'Stockholm',
      year: 1940,
      cityExport: citiesLookup[['Sweden',1940]].export,
      cityNProducts: citiesLookup[['Sweden',1940]].nProducts,
      nodePositions: nodePositions,
      nodeChanges: nodeChanges,
      links: links,
      citiesMetadata: citiesMetadata,
      industriesMetadata: industriesMetadata,
      citiesLookup: citiesLookup,
      communityName:communityName
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

class IndustrialNetworkResponsive extends React.Component {
  render() {
    return(
      <Resize width={this.props.width}>
        <IndustrialNetwork {...this.props} />
      </Resize>
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
    let widthScale = 0.9*this.props.width
    let heightScale = 0.9*this.props.height
    for (let link of this.props.linkPositions) {
      lines.push(
        <Link key={link.id} link={link} linkScale={this.props.linkScale}
          widthScale={widthScale} heightScale={heightScale} />
      )
    }
    let circles = []
    for (let node of this.props.nodeData) {
      circles.push(<Node key={node.id} node={node} nodeScale={this.props.nodeScale}
        updateTooltip={this.updateTooltip}
        widthScale={widthScale} heightScale={heightScale} />)
    }

    let networkXPadding = parseInt(0.05*this.props.width)
    let networkYPadding = parseInt(0.05*this.props.height)
    let translate ="translate("+networkXPadding+","+networkYPadding+")"
    return(
      <div>
        <div id="tooltip">
          <p>{this.state.chosenNode}&nbsp;</p>
          <p>{this.state.nodeExport}&nbsp;</p>
        </div>

        <div id="network">
          <svg width={this.props.width} height={this.props.height}>
            <g transform={translate}>
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
      <circle cx={this.props.widthScale*this.props.node.x}
        cy={this.props.heightScale*this.props.node.y}
        r={this.props.nodeScale*this.props.node.size}
        fill={(this.props.node.activated && this.props.node.color) || (this.props.node.existed && "#3b424a") || "#212831"}
        onMouseEnter={this.handleEnter}
        onMouseLeave={this.handleLeave}
      />
    )
  }
}

class Link extends React.Component {
  render() {
    return(
      <line x1={this.props.widthScale*this.props.link.x1}
        y1={this.props.heightScale*this.props.link.y1}
        x2={this.props.widthScale*this.props.link.x2}
        y2={this.props.heightScale*this.props.link.y2}
        key={this.props.link.id}
        strokeWidth={this.props.linkScale*this.props.link.weight}
        stroke="#212831"/>
    )
  }
}

let h = 0.75*window.innerHeight;

ReactDOM.render(
  <App linkScale={1} nodeScale={15} defaultNodeSize={.75}
    width={"100%"} height={h} />,
  document.getElementById("react-app")
)
