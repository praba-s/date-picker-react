import React, { Component } from 'react'
import PropTypes from "prop-types";
import classNames from 'classnames';

export class PanelMonth extends Component {
  constructor (props) {
      super(props)
      this.state = {
          months : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      }
  }

  isDisabled (month) {
    if (typeof this.props.disabledMonth === 'function' && this.props.disabledMonth(month)) {
      return true
    }
    return false
  }
  selectMonth (month) {
    if (this.isDisabled(month)) {
      return
    }
    //this.props.select(month) //TODO
  }

  render () {
    let months = this.state.months
    const currentYear = this.props.value && new Date(this.props.value).getFullYear()
    const currentMonth = this.props.value && new Date(this.props.value).getMonth()


    months = months.map((v, i) => {
      return <span
          className={classNames({
              'cell': true,
              'actived': currentYear === this.props.calendarYear && currentMonth === i,
              'disabled': this.isDisabled(i)
          })}
        onClick={() => this.selectMonth(i)}>
        {v}
      </span>
    })
    return <div className="mx-panel mx-panel-month">{months}</div>
  }
}


PanelMonth.propTypes = {
    value: PropTypes.any,
    calendarYear: PropTypes.number,
    disabledMonth : PropTypes.func
}

PanelMonth.defaultProps = {
    value: null,
    calendarYear: new Date().getFullYear(),
}
