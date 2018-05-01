import React from "react"
import {Resize} from "replot-core"
import Node from "./Node.jsx"
import Link from "./Link.jsx"

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
      nodeText: "",
    }
    this.updateTooltip = this.updateTooltip.bind(this)
  }

  updateTooltip(name,nodeText) {
    this.setState({chosenNode: name,
                  nodeText: nodeText})
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
          <p>{this.state.nodeText}&nbsp;</p>
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

export default IndustrialNetworkResponsive
