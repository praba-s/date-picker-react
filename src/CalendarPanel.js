import React, {Component} from 'react'
import { isValidDate, isDateObejct, formatDate } from './utils/index'
import scrollIntoView from './utils/scroll-into-view'
import { PanelDate } from './panel/date'
import { PanelYear } from './panel/year'
import { PanelMonth } from './panel/month'
import { PanelTime } from './panel/time'
import PropTypes from 'prop-types';

export class CalendarPanel extends Component {
    constructor (props) {
        super(props)
        this.state = {
            panel: 'DATE',
            dates: [],
            now : this.getNow(this.props.value),
            calendarYear: this.getNow(this.props.value).getFullYear(),
            calendarMonth: this.getNow(this.props.value).getMonth() ,
            firstYear: Math.floor(this.getNow(this.props.value).getFullYear() / 10) * 10,
            months:['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        }
    }

    static defaultProps = {
        valueType : 'date',
        format: 'YYYY-MM-DD',
        type: 'type',
        confirmText: 'OK',
        confirm: true,
        inputName: 'date',
        inputClass: 'mx-input',
        popupStyle: '',
        placeholder: "Please select Date",
    }


/*
    getNow() {
        return new Date(this.calendarYear, this.calendarMonth).getTime()
    }

    setNow(val) {
        const now = new Date(val)
        this.calendarYear = now.getFullYear()
        this.calendarMonth = now.getMonth()
    }*/

    timeType() {
        const h = /h+/.test(this.$parent.format) ? '12' : '24'
        const a = /A/.test(this.$parent.format) ? 'A' : 'a'
        return [h, a]
    }

    timeHeader() {
        if (this.props.type === 'time') {
            return this.$parent.format
        }
        return this.props.value && formatDate(this.props.value, this.props.dateFormat)
    }

    yearHeader() {
        return this.firstYear + ' ~ ' + (this.firstYear + 9)
    }

    months() {
        return this.state.months;
    }

    notBeforeTime() {
        return this.getCriticalTime(this.notBefore)
    }

    notAfterTime() {
        return this.getCriticalTime(this.notAfter)
    }

    /*watch: {
      value: {
        immediate: true,
        handler: 'updateNow'
      },
      visible: {
        immediate: true,
        handler: 'init'
      },
      panel: {
        handler: 'handelPanelChange'
      }
    },*/

    handelPanelChange(panel, oldPanel) {
        this.dispatch('DatePicker', 'panel-change', [panel, oldPanel])
        if (panel === 'YEAR') {
            this.firstYear = Math.floor(this.calendarYear / 10) * 10
        } else if (panel === 'TIME') {
            this.$nextTick(() => {
                const list = this.$el.querySelectorAll('.mx-panel-time .mx-time-list')
                for (let i = 0, len = list.length; i < len; i++) {
                    const el = list[i]
                    scrollIntoView(el, el.querySelector('.actived'))
                }
            })
        }
    }

    init(val) {
        if (val) {
            const type = this.type
            if (type === 'month') {
                this.showPanelMonth()
            } else if (type === 'year') {
                this.showPanelYear()
            } else if (type === 'time') {
                this.showPanelTime()
            } else {
                this.showPanelDate()
            }
        } else {
            this.showPanelNone()
            this.updateNow(this.value)
        }
    }

    getNow(value) {
        console.log("Value   " + value)
        let val = value ? new Date(value): this.props.defaultValue && (isValidDate(this.props.defaultValue) ? new Date(this.props.defaultValue) : new Date())
        return val;
    }

    updateNow(value) {
        const oldNow = this.state.now
        this.setState({now: this.getNow(value)})
        this.updateCalendar(value);
        if (this.props.visible && this.state.now !== oldNow) {
            /*this.dispatch('DatePicker', 'calendar-change', [
                new Date(this.now),
                new Date(oldNow)
            ])*/


        }
    }

    updateCalendar(now){
        this.setState ({
            calendarYear: this.getNow(now).getFullYear(),
            calendarMonth :this.getNow(now).getMonth(),
            firstYear : Math.floor(now.getFullYear() / 10) * 10,
        })
    }

    getCriticalTime(value) {
        if (!value) {
            return null
        }
        const date = new Date(value)
        if (this.type === 'year') {
            return new Date(date.getFullYear(), 0).getTime()
        } else if (this.type === 'month') {
            return new Date(date.getFullYear(), date.getMonth()).getTime()
        } else if (this.type === 'date') {
            return date.setHours(0, 0, 0, 0)
        }
        return date.getTime()
    }

    inBefore(time, startAt) {
        if (startAt === undefined) {
            startAt = this.startAt
        }
        return (
            (this.notBeforeTime && time < this.notBeforeTime) ||
            (startAt && time < this.getCriticalTime(startAt))
        )
    }

    inAfter(time, endAt) {
        if (endAt === undefined) {
            endAt = this.endAt
        }
        return (
            (this.notAfterTime && time > this.notAfterTime) ||
            (endAt && time > this.getCriticalTime(endAt))
        )
    }

    inDisabledDays(time) {
        if (Array.isArray(this.disabledDays)) {
            return this.disabledDays.some(v => this.getCriticalTime(v) === time)
        } else if (typeof this.disabledDays === 'function') {
            return this.disabledDays(new Date(time))
        }
        return false
    }

    isDisabledYear(year) {
        const time = new Date(year, 0).getTime()
        const maxTime = new Date(year + 1, 0).getTime() - 1
        return (
            this.inBefore(maxTime) ||
            this.inAfter(time) ||
            (this.type === 'year' && this.inDisabledDays(time))
        )
    }

    isDisabledMonth(month) {
        const time = new Date(this.state.calendarYear, month).getTime()
        const maxTime = new Date(this.state.calendarYear, month + 1).getTime() - 1
        return (
            this.inBefore(maxTime) ||
            this.inAfter(time) ||
            (this.type === 'month' && this.inDisabledDays(time))
        )
    }

    isDisabledDate = (date) => {
        console.log("Inside isDisabledDate")
        const time = new Date(date).getTime()
        const maxTime = new Date(date).setHours(23, 59, 59, 999)
        return (
            this.inBefore(maxTime) ||
            this.inAfter(time) ||
            this.inDisabledDays(time)
        )
    }

    isDisabledTime(date, startAt, endAt) {
        const time = new Date(date).getTime()
        return (
            this.inBefore(time, startAt) ||
            this.inAfter(time, endAt) ||
            this.inDisabledDays(time)
        )
    }

    selectDate(date) {
        console.log("Hello Inside Select Date " + date)
        if (this.type === 'datetime') {
            let time = new Date(date)
            if (isDateObejct(this.value)) {
                time.setHours(
                    this.value.getHours(),
                    this.value.getMinutes(),
                    this.value.getSeconds()
                )
            }
            if (this.isDisabledTime(time)) {
                time.setHours(0, 0, 0, 0)
                if (
                    this.notBefore &&
                    time.getTime() < new Date(this.notBefore).getTime()
                ) {
                    time = new Date(this.notBefore)
                }
                if (
                    this.startAt &&
                    time.getTime() < new Date(this.startAt).getTime()
                ) {
                    time = new Date(this.startAt)
                }
            }
            this.selectTime(time)
            this.showPanelTime()
            return
        }
        //this.$emit('select-date', date)
    }

    selectYear(year) {
        this.changeCalendarYear(year)
        if (this.type.toLowerCase() === 'year') {
            return this.selectDate(new Date(this.now))
        }
        this.dispatch('DatePicker', 'select-year', [year, this.index])
        this.showPanelMonth()
    }

    selectMonth(month) {
        this.changeCalendarMonth(month)
        if (this.type.toLowerCase() === 'month') {
            return this.selectDate(new Date(this.now))
        }
        this.dispatch('DatePicker', 'select-month', [month, this.index])
        this.showPanelDate()
    }

    selectTime(time) {
        //this.$emit('select-time', time, false)
    }

    pickTime(time) {
        //this.$emit('select-time', time, true)
    }

    changeCalendarYear(year) {
        this.updateNow(new Date(year, this.state.calendarMonth))
    }

    changeCalendarMonth(month) {
        this.updateNow(new Date(this.state.calendarYear, month))
    }

    getSibling() {
        const calendars = this.$parent.$children.filter(
            v => v.$options.name === this.$options.name
        )
        const index = calendars.indexOf(this)
        const sibling = calendars[index ^ 1]
        return sibling
    }

    handleIconMonth(flag) {
        const month = this.state.calendarMonth
        this.changeCalendarMonth(month + flag)
        /*this.$parent.$emit('change-calendar-month', {
            month,
            flag,
            vm: this,
            sibling: this.getSibling()
        })*/
    }

    handleIconYear (flag){
        if (this.state.panel === 'YEAR') {
            this.changePanelYears(flag)
        } else {
            const year = this.state.calendarYear
            this.changeCalendarYear(year + flag)
            /*this.$parent.$emit('change-calendar-year', {
                year,
                flag,
                vm: this,
                sibling: this.getSibling()
            })*/
        }
    }

    handleBtnYear = () => {
        this.showPanelYear()
    }

    handleBtnMonth() {
        this.showPanelMonth()
    }

    handleTimeHeader() {
        if (this.state.type === 'time') {
            return
        }
        this.showPanelDate()
    }

    changePanelYears(flag) {
        this.setState({'firstYear':this.state.firstYear + flag * 10})
    }

    showPanelNone() {
        this.setState({'panel':'NONE'})
    }

    showPanelTime() {
        this.setState({'panel':'TIME'})
    }

    showPanelDate() {
        this.setState({'panel':'DATE'})
    }

    showPanelYear = () => {
        this.setState({'panel':'YEAR'})
    }

    showPanelMonth() {
        this.setState({'panel':'MONTH'})
    }

    render() {
        const {value, dateFormat, startAt, endAt, visible, type, index, defaultValue, firstDayOfWeek, notBefore, notAfter, disabledDays, minuteStep, timeSelectOptions, timePickerOptions} = this.props;
        const { panel, firstYear, calendarMonth, calendarYear } = this.state;
        let panelClass = 'mx-calendar-panel-' + panel.toLowerCase();

        return (
        <div>
            <div className="mx-calendar" className={panelClass}>
                <div className="mx-calendar-header">
                    {
                        panel !== 'TIME' &&
                        <a className="mx-icon-last-year"
                           onClick={(flag) => this.handleIconYear(-1)}>&#171;</a>
                    }
                    {
                        panel === 'DATE' &&
                        <a className="mx-icon-last-month"
                           onClick={this.handleIconMonth.bind(this,-1)}>&#8249;</a>
                    }
                    {
                        panel !== 'TIME' &&
                        <a className="mx-icon-next-year"
                           onClick={(flag) => this.handleIconYear(1)}>&#187;</a>
                    }

                    {
                        panel === 'DATE' &&
                        <a className="mx-icon-next-month"
                           onClick={(flag) => this.handleIconMonth(1)}>&#8250;</a>
                    }
                    {
                        panel === 'DATE' &&
                        <a className="mx-current-month"
                           onClick={this.handleBtnMonth}>{this.state.months[calendarMonth]}</a>
                    }

                    {
                        (panel === 'DATE' || panel === 'MONTH') &&
                        <a className="mx-current-year"
                           onClick={this.handleBtnYear}>&nbsp;{calendarYear}</a>
                    }

                    {
                        panel === 'YEAR' &&
                        <a className="mx-current-year"
                           onClick={this.handleBtnYear}>{this.yearHeader}</a>
                    }

                    {
                        panel === 'TIME' &&
                        <a className="mx-time-header"
                           onClick={this.handleTimeHeader}>{this.timeHeader}</a>
                    }

                </div>

                <div className="mx-calendar-content">
                    {
                        (panel === 'DATE') &&
                        <PanelDate value={value}
                                    date-format={dateFormat}
                                    calendarMonth={calendarMonth}
                                    calendarYear={calendarYear}
                                    startAt={startAt}
                                    endAt={endAt}
                                    firstDayOfWeek={firstDayOfWeek}
                                    disabledDate={this.isDisabledDate}
                                    select={this.selectDate}
                                    />
                    }

                    { (panel === 'YEAR') &&
                        <PanelYear
                            value={value}
                            disabled-year={this.isDisabledYear}
                            first-year={firstYear}
                            select={() => this.selectYear}/>
                    }

                    { (panel === 'MONTH') &&
                        <PanelMonth
                            value={value}
                            disabled-month={this.isDisabledMonth}
                            calendar-year={calendarYear}
                            select={this.selectMonth}/>
                    }

                    { (panel === 'TIME') &&
                        <PanelTime
                        minute-step={minuteStep}
                        time-picker-options={timePickerOptions}
                        time-select-options={timeSelectOptions}
                        value={value}
                        disabled-time={this.isDisabledTime}
                        time-type={this.timeType}
                        select={this.selectTime}
                        pick={this.pickTime}/>
                    }

                </div>
            </div>
        </div>
        )
    }
}
