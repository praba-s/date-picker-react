import React, {Component} from 'react'
import { formatTime, parseTime } from '../utils/index'
import PropTypes from "prop-types";
import classNames from 'classnames';

export class PanelTime extends Component {
  constructor(props){
    super(props)
  }

  stringifyText (value) {
    return ('00' + value).slice(String(value).length)
  }
  selectTime (time) {
    if (typeof this.props.disabledTime === 'function' && this.props.disabledTime(time)) {
      return
    }
    this.props.select(new Date(time))
  }
  pickTime (time) {
    if (typeof this.props.disabledTime === 'function' && this.props.disabledTime(time)) {
      return
    }
    this.props.pick(new Date(time))
  }
  getTimePickerOptions () {
    const result = []
    const options = this.props.timePickerOptions
    if (!options) {
      return []
    }
    if (typeof options === 'function') {
      return options() || []
    }
    const start = parseTime(options.start)
    const end = parseTime(options.end)
    const step = parseTime(options.step)
    if (start && end && step) {
      const startMinutes = start.minutes + start.hours * 60
      const endMinutes = end.minutes + end.hours * 60
      const stepMinutes = step.minutes + step.hours * 60
      const len = Math.floor((endMinutes - startMinutes) / stepMinutes)
      for (let i = 0; i <= len; i++) {
        let timeMinutes = startMinutes + i * stepMinutes
        let hours = Math.floor(timeMinutes / 60)
        let minutes = timeMinutes % 60
        let value = {
          hours,
          minutes
        }
        result.push({
          value,
          label: formatTime(value, ...this.timeType)
        })
      }
    }
    return result
  }

  render (h) {
      const { value, disabledTime, timeSelectOptions, minuteStep } = this.props
      let currentHours = value ? new Date(value).getHours() : 0
      let currentMinutes = value ? new Date(value).getMinutes() : 0
      let currentSeconds = value ? new Date(value).getSeconds() : 0

    const date = value ? new Date(value) : new Date().setHours(0, 0, 0, 0)

    //const disabledTime = typeof disabledTime === 'function' && disabledTime

    let pickers = this.getTimePickerOptions()
    if (Array.isArray(pickers) && pickers.length) {
      pickers = pickers.map(picker => {
        const pickHours = picker.value.hours
        const pickMinutes = picker.value.minutes
        const time = new Date(date).setHours(pickHours, pickMinutes, 0)
        return (
          <li
            className={classNames({
              'mx-time-picker-item': true,
              'cell': true,
              'actived': pickHours === currentHours && pickMinutes === currentMinutes,
                disabled: disabledTime && disabledTime(time)
            })}
            onClick={() => this.pickTime(time)}
          >
            {picker.label}
          </li>
        )
      })
      return (
        <div className="mx-panel mx-panel-time">
          <ul className="mx-time-list">{pickers}</ul>
        </div>
      )
    }

    const minuteStepTemp = minuteStep || 1
    const minuteLength = parseInt(60 / minuteStepTemp)
    let hours = Array.apply(null, { length: 24 }).map((_, i) => i)
    let minutes = Array.apply(null, { length: minuteLength }).map(
      (_, i) => i * minuteStepTemp
    )
    let seconds =
      minuteStep === 0
        ? Array.apply(null, { length: 60 }).map((_, i) => i)
        : []
    let columns = { hours, minutes, seconds }

    if (timeSelectOptions && typeof timeSelectOptions === 'object') {
      columns = { ...columns, ...timeSelectOptions }
    }

    const hoursColumn = columns.hours.map(v => {
      const time = new Date(date).setHours(v)
      return (
        <li
          className={classNames({
            cell: true,
            actived: v === currentHours,
            disabled: disabledTime && disabledTime(time)
          })}
          onClick={() => this.selectTime(time)}
        >
          {this.stringifyText(v)}
        </li>
      )
    })

    const minutesColumn = columns.minutes.map(v => {
      const time = new Date(date).setMinutes(v)
      return (
        <li
          className={classNames({
            cell: true,
            actived: v === currentMinutes,
            disabled: disabledTime && disabledTime(time)
          })}
          onClick={() => this.selectTime(time)}
        >
          {this.stringifyText(v)}
        </li>
      )
    })

    const secondsColumn = columns.seconds.map(v => {
      const time = new Date(date).setSeconds(v)
      return (
        <li
          className={classNames({
            cell: true,
            actived: v === currentSeconds,
            disabled: disabledTime && disabledTime(time)
          })}
          onClick={() => this.selectTime(time)}
        >
          {this.stringifyText(v)}
        </li>
      )
    })

    let times = [hoursColumn, minutesColumn, secondsColumn].filter(
      v => v.length > 0
    )

    times = times.map(list => (
      <ul className="mx-time-list" style={{ 'width': 100 / times.length + '%' }}>
        {list}
      </ul>
    ))

    return <div className="mx-panel mx-panel-time">{times}</div>
  }
}


PanelTime.propTypes = {
    timePickerOptions: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.func
    ]),
    timeSelectOptions: PropTypes.object,
    value: PropTypes.array,
    minuteStep: function(props, propName, componentName){
        let isValid = val => val >= 1 && val <= 60;
        if(!isValid){
            return new Error(
                'Invalid prop `' + propName + '` supplied to' +
                ' `' + componentName + '`. Validation failed.'
            );
        }
    },
    disabledTime: PropTypes.func,
    select : PropTypes.func,
    pick : PropTypes.func,
}

PanelTime.defaultProps = {
    value : ['24', 'a'],
}
