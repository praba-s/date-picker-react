import React, { Component } from 'react'
import locale from '@/mixins/locale'

export class MonthPanel extends Component {
  constructor (props) {
      super(props)
      this.state = {

          value: null,
          calendarYear: {
              default: new Date().getFullYear()
          },
          disabledMonth: Function
      }
  }

  isDisabled (month) {
    if (typeof this.disabledMonth === 'function' && this.disabledMonth(month)) {
      return true
    }
    return false
  }
  selectMonth (month) {
    if (this.isDisabled(month)) {
      return
    }
    this.$emit('select', month)
  }

  render () {
    let months = this.t('months')
    const currentYear = this.value && new Date(this.value).getFullYear()
    const currentMonth = this.value && new Date(this.value).getMonth()
    months = months.map((v, i) => {
      return <span
          className={{
          'cell': true,
          'actived': currentYear === this.calendarYear && currentMonth === i,
          'disabled': this.isDisabled(i)
        }}
        onClick={this.selectMonth.bind(this, i)}>
        {v}
      </span>
    })
    return <div className="mx-panel mx-panel-month">{months}</div>
  }
}
