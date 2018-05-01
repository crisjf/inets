import React from "react"

class Node extends React.Component {
  constructor(props) {
    super(props)
    this.handleEnter = this.handleEnter.bind(this)
    this.handleLeave = this.handleLeave.bind(this)
  }
  handleEnter(){
    let nodeText = ""
    for (let key of Object.keys(this.props.node.nodeMeta)) {
      nodeText+= key+': '+this.props.node.nodeMeta[key]+', '
    }
    nodeText = nodeText.substring(0, nodeText.length - 2)
    this.props.updateTooltip(this.props.node.name,nodeText)
  }
  handleLeave(){
    this.props.updateTooltip("","")
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

export default Node
