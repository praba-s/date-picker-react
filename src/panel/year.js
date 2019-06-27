import React, {Component} from 'react'

export class YearPanel extends Component {
  constructor(props){
    super (props)
      this.state = {
          value: null,
          firstYear: Number,
          disabledYear: Function
      }
  }

  isDisabled (year) {
    if (typeof this.disabledYear === 'function' && this.disabledYear(year)) {
      return true
    }
    return false
  }
  selectYear (year) {
    if (this.isDisabled(year)) {
      return
    }
    this.$emit('select', year)
  }

  render (h) {
    const firstYear = Math.floor(this.firstYear / 10) * 10
    const currentYear = this.value && new Date(this.value).getFullYear()
    const years = Array.apply(null, { length: 10 }).map((_, i) => {
      const year = firstYear + i
      return <span
        className={{
          'cell': true,
          'actived': currentYear === year,
          'disabled': this.isDisabled(year)
        }}
        onClick={this.selectYear.bind(this, year)}
      >{year}</span>
    })
    return <div className="mx-panel mx-panel-year">{years}</div>
  }
}
