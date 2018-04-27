import React from "react"

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

export default Link
