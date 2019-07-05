import React, { Component } from 'react'
import { formatDate } from '../utils/index'
import PropTypes from 'prop-types'

export class PanelDate extends Component {
  constructor (props) {
      super(props)
      this.state = {
          days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      }
  }

  selectDate ({ year, month, day }) {
      console.log("year " + year)
      const date = new Date(year, month, day)
      if (this.props.disabledDate(date)) {
          return
      }
      this.props.select(date)
  }

  getDays (firstDayOfWeek) {
    const days = this.state.days
    const firstday = parseInt(firstDayOfWeek, 10)
    return days.concat(days).slice(firstday, firstday + 7)
  }

  getDates (year, month, firstDayOfWeek) {
      console.log("Hello")
    const arr = []
    const time = new Date(year, month)

    time.setDate(0)
    const lastMonthLength = (time.getDay() + 7 - firstDayOfWeek) % 7 + 1
    const lastMonthfirst = time.getDate() - (lastMonthLength - 1)
    for (let i = 0; i < lastMonthLength; i++) {
      arr.push({ year, month: month - 1, day: lastMonthfirst + i })
    }

    time.setMonth(time.getMonth() + 2, 0)
    const curMonthLength = time.getDate()
    for (let i = 0; i < curMonthLength; i++) {
      arr.push({ year, month, day: 1 + i })
    }

    time.setMonth(time.getMonth() + 1, 1)
    const nextMonthLength = 42 - (lastMonthLength + curMonthLength)
    for (let i = 0; i < nextMonthLength; i++) {
      arr.push({ year, month: month + 1, day: 1 + i })
    }

    return arr
  }
  getCellClasses ({ year, month, day }) {

    const { value, startAt, endAt, disabledDate, calendarMonth  } = this.props;

    const classes = []
    classes.push("cell")
    const cellTime = new Date(year, month, day).getTime()
    const today = new Date().setHours(0, 0, 0, 0)
    const curTime = value && new Date(value).setHours(0, 0, 0, 0)
    const startTime = startAt && new Date(startAt).setHours(0, 0, 0, 0)
    const endTime = endAt && new Date(endAt).setHours(0, 0, 0, 0)

    if (month < calendarMonth) {
      classes.push('last-month')
    } else if (month > calendarMonth) {
      classes.push('next-month')
    } else {
      classes.push('cur-month')
    }

    if (cellTime === today) {
      classes.push('today')
    }

    if (disabledDate(cellTime)) {
      classes.push('disabled')
    }

    if (curTime) {
      if (cellTime === curTime) {
        classes.push('actived')
      } else if (startTime && cellTime <= curTime) {
        classes.push('inrange')
      } else if (endTime && cellTime >= curTime) {
        classes.push('inrange')
      }
    }
    console.log("classes  " + classes)
    return classes
  }

  getCellTitle ({ year, month, day }) {
    return formatDate(new Date(year, month, day), this.props.dateFormat)
  }

  render () {
      const {firstDayOfWeek, calendarYear, calendarMonth } = this.props;

      console.log("firstDayOfWeek "+firstDayOfWeek + "calendarYear " + calendarYear + " calendarMonth " +  calendarMonth +
      "startAt "+ this.props.startAt + " endAt " + this.props.endAt )

    const ths = this.getDays(firstDayOfWeek).map(day => {
      return <th key={day}>{day}</th>
    })
    console.log("inside date  " + calendarYear + " calendarMonth " + calendarMonth)
    let indexKey = 0;
    const dates = this.getDates(calendarYear, calendarMonth, firstDayOfWeek)
    const tbody = Array.apply(null, { length: 6 }).map((week, i) => {
      const tds = dates.slice(7 * i, 7 * i + 7).map(date => {
        indexKey = indexKey + 1;
        let className =  this.getCellClasses(date).join(' ')
        return (
          <td
            className = {className}
            key={indexKey}
            data-year={date.year}
            data-month={date.month}
            title={this.getCellTitle(date)}
            onClick={() => this.selectDate(date)}>
            {date.day}
          </td>
        )
      })
      return <tr>{tds}</tr>
    })

    return (
      <table className="mx-panel mx-panel-date">
        <thead>
          <tr>{ths}</tr>
        </thead>
        <tbody>
          {tbody}
        </tbody>
      </table>
    )
  }
}

PanelDate.propTypes = {
    value: PropTypes.any,
    startAt: PropTypes.any,
    endAt: PropTypes.any,
    dateFormat: PropTypes.string,

    calendarMonth: PropTypes.number,
    calendarYear: PropTypes.number,
    firstDayOfWeek: function(props, propName, componentName){
        let isValid = val => val >= 1 && val <= 7;
        if(!isValid){
            return new Error(
                'Invalid prop `' + propName + '` supplied to' +
                ' `' + componentName + '`. Validation failed.'
                );
        }
    },
    disabledDate: PropTypes.func,
    select : PropTypes.func
}

PanelDate.defaultProps = {
    dateFormat : 'YYYY-MM-DD',
    calendarMonth : new Date().getMonth(),
    calendarYear : new Date().getFullYear(),
    firstDayOfWeek: 7,
    disabledDate :  () => {return false}
}
