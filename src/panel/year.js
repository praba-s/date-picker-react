import React, {Component} from 'react'
import PropTypes from "prop-types";
import classNames from 'classnames'

export class PanelYear extends Component {
  constructor(props){
    super (props)
  }

  isDisabled (year) {
    if (typeof this.props.disabledYear === 'function' && this.props.disabledYear(year)) {
      return true
    }
    return false
  }
  selectYear (year) {
    if (this.isDisabled(year)) {
      return
    }
    this.props.select(year)
  }

  render () {
    console.log("Inside render year")
    const firstYear = Math.floor(this.props.firstYear / 10) * 10
    const currentYear = this.props.value && new Date(this.props.value).getFullYear()
    const years = Array.apply(null, { length: 10 }).map((_, i) => {
      const year = firstYear + i
      return <span
        className={classNames({
          'cell': true,
          'actived': currentYear === year,
          'disabled': this.isDisabled(year)
        })}
        onClick={() => this.selectYear(year)}>{year}</span>
    })
    return <div className="mx-panel mx-panel-year">{years}</div>
  }
}

PanelYear.propTypes = {
    firstYear: PropTypes.number,
    value: PropTypes.any,
    disabledYear: PropTypes.func,
}
