import React, {Component} from 'react'
import { isValidDate, isDateObejct, formatDate } from '@/utils/index'
import emitter from './mixins/emitter'
import locale from './mixins/locale'
import scrollIntoView from '@/utils/scroll-into-view'
import PanelDate from './panel/DatePanel'
import PanelYear from './panel/YearPanel'
import PanelMonth from './panel/MonthPanel'
import PanelTime from './panel/TimePanel'


export class CalendarPanel extends Component {
    constructor (props) {
        super(props)
        this.state = {
            components: {PanelDate, PanelYear, PanelMonth, PanelTime},
            mixins: [locale, emitter],
            value: {
                default: null,
                validator: function (val) {
                    return val === null || isValidDate(val)
                }
            },
            startAt: null,
            endAt: null,
            visible: {
                type: Boolean,
                default: false
            },
            type: {
                type: String,
                default: 'date' // ['date', 'datetime'] zendy added 'month', 'year', mxie added "time"
            },
            dateFormat: {
                type: String,
                default: 'YYYY-MM-DD'
            },
            index: Number,
            // below user set
            defaultValue: {
                validator: function (val) {
                    return isValidDate(val)
                }
            },
            firstDayOfWeek: {
                default: 7,
                type: Number,
                validator: val => val >= 1 && val <= 7
            },
            notBefore: {
                default: null,
                validator: function (val) {
                    return !val || isValidDate(val)
                }
            },
            notAfter: {
                default: null,
                validator: function (val) {
                    return !val || isValidDate(val)
                }
            },
            disabledDays: {
                type: [Array, Function],
                default: function () {
                    return []
                }
            },
            minuteStep: {
                type: Number,
                default: 0,
                validator: val => val >= 0 && val <= 60
            },
            timeSelectOptions: {
                type: Object,
                default() {
                    return null
                }
            },
            timePickerOptions: {
                type: [Object, Function],
                default() {
                    return null
                }
            }
        }
    }


    data() {
        const now = this.getNow(this.value)
        const calendarYear = now.getFullYear()
        const calendarMonth = now.getMonth()
        const firstYear = Math.floor(calendarYear / 10) * 10
        return {
            panel: 'NONE',
            dates: [],
            calendarMonth,
            calendarYear,
            firstYear
        }
    }

    getNow() {
        return new Date(this.calendarYear, this.calendarMonth).getTime()
    }

    setNow(val) {
        const now = new Date(val)
        this.calendarYear = now.getFullYear()
        this.calendarMonth = now.getMonth()
    }

    timeType() {
        const h = /h+/.test(this.$parent.format) ? '12' : '24'
        const a = /A/.test(this.$parent.format) ? 'A' : 'a'
        return [h, a]
    }

    timeHeader() {
        if (this.type === 'time') {
            return this.$parent.format
        }
        return this.value && formatDate(this.value, this.dateFormat)
    }

    yearHeader() {
        return this.firstYear + ' ~ ' + (this.firstYear + 9)
    }

    months() {
        return this.t('months')
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
        return value
            ? new Date(value)
            : this.defaultValue && isValidDate(this.defaultValue)
                ? new Date(this.defaultValue)
                : new Date()
    }

    updateNow(value) {
        const oldNow = this.now
        this.now = this.getNow(value)
        if (this.visible && this.now !== oldNow) {
            this.dispatch('DatePicker', 'calendar-change', [
                new Date(this.now),
                new Date(oldNow)
            ])
        }
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
        const time = new Date(this.calendarYear, month).getTime()
        const maxTime = new Date(this.calendarYear, month + 1).getTime() - 1
        return (
            this.inBefore(maxTime) ||
            this.inAfter(time) ||
            (this.type === 'month' && this.inDisabledDays(time))
        )
    }

    isDisabledDate(date) {
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
        this.$emit('select-date', date)
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
        this.$emit('select-time', time, false)
    }

    pickTime(time) {
        this.$emit('select-time', time, true)
    }

    changeCalendarYear(year) {
        this.updateNow(new Date(year, this.calendarMonth))
    }

    changeCalendarMonth(month) {
        this.updateNow(new Date(this.calendarYear, month))
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
        const month = this.calendarMonth
        this.changeCalendarMonth(month + flag)
        this.$parent.$emit('change-calendar-month', {
            month,
            flag,
            vm: this,
            sibling: this.getSibling()
        })
    }

    handleIconYear(flag) {
        if (this.panel === 'YEAR') {
            this.changePanelYears(flag)
        } else {
            const year = this.calendarYear
            this.changeCalendarYear(year + flag)
            this.$parent.$emit('change-calendar-year', {
                year,
                flag,
                vm: this,
                sibling: this.getSibling()
            })
        }
    }

    handleBtnYear() {
        this.showPanelYear()
    }

    handleBtnMonth() {
        this.showPanelMonth()
    }

    handleTimeHeader() {
        if (this.type === 'time') {
            return
        }
        this.showPanelDate()
    }

    changePanelYears(flag) {
        this.firstYear = this.firstYear + flag * 10
    }

    showPanelNone() {
        this.panel = 'NONE'
    }

    showPanelTime() {
        this.panel = 'TIME'
    }

    showPanelDate() {
        this.panel = 'DATE'
    }

    showPanelYear() {
        this.panel = 'YEAR'
    }

    showPanelMonth() {
        this.panel = 'MONTH'
    }

    render() {
        const {value, dateFormat} = this.props;
        return (

        <div>
            <div className="mx-calendar" className="'mx-calendar-panel-' + panel.toLowerCase()">
                <div className="mx-calendar-header">
                    <a v-show="panel !== 'TIME'" className="mx-icon-last-year"
                       onClick={this.handleIconYear(-1)}>&#171;</a>
                    <a v-show="panel === 'DATE'" className="mx-icon-last-month"
                       onClick={this.handleIconMonth(-1)}>&#8249;</a>
                    <a v-show="panel !== 'TIME'" className="mx-icon-next-year"
                       onClick={this.handleIconYear(1)}>&#187;</a>
                    <a v-show="panel === 'DATE'" className="mx-icon-next-month"
                       onClick={this.handleIconMonth(1)}>&#8250;</a>
                    <a v-show="panel === 'DATE'" className="mx-current-month"
                       onClick={this.handleBtnMonth}>{this.months[this.calendarMonth]}</a>
                    <a v-show="panel === 'DATE' || panel === 'MONTH'" className="mx-current-year"
                       onClick={this.handleBtnYear}>{this.calendarYear}</a>
                    <a v-show="panel === 'YEAR'" className="mx-current-year">{this.yearHeader}</a>
                    <a v-show="panel === 'TIME'" className="mx-time-header"
                       onClick={this.handleTimeHeader}>{this.timeHeader}</a>
                </div>
                <div className="mx-calendar-content">
                    { (this.panel === 'DATE') &&
                        <panel-date value={this.value}
                                    date-format={this.dateFormat}
                                    calendar-month={this.calendarMonth}
                                    calendar-year={this.calendarYear}
                                    start-at={this.startAt}
                                    end-at={this.endAt}
                                    first-day-of-week={this.firstDayOfWeek}
                                    disabled-date={this.isDisabledDate}
                                    select={this.selectDate}/>
                    }

                    { (this.panel === 'YEAR') &&
                        <panel-year
                            value={this.value}
                            disabled-year={this.isDisabledYear}
                            first-year={this.firstYear}
                            select={this.selectYear}/>
                    }

                    { (this.panel === 'MONTH') &&
                        <panel-month
                            value={this.value}
                            disabled-month={this.isDisabledMonth}
                            calendar-year={this.calendarYear}
                            select={this.selectMonth}/>
                    }

                    { (this.panel === 'TIME') &&
                        <panel-time
                        minute-step={this.minuteStep}
                        time-picker-options={this.timePickerOptions}
                        time-select-options={this.timeSelectOptions}
                        value={this.value}
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
