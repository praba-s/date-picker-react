import React, { Component } from 'react'
import { isValidDate, isValidRangeDate, isDateObejct } from './utils/index'
import { CalendarPanel } from './CalendarPanel'

export class DatePicker extends Component{

    constructor(props){
        super(props);
        this.state = {
            currentValue: new Date(),
            userInput: null,
            popupVisible: false,
            position: {}
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
        placeholder: "Please select Date"
    }

    showPopup(event) {
        console.log("Hello  " + event)
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
        if (this.disabled) {
            return
        }
        this.setState({'popupVisible': true});
    }

    closePopup = () => {
        this.setState({'popupVisible': false});
    }

    handleBlur = (event) =>{
       // this.$emit('blur', event)
    }

    handleFocus (event) {
        if (!this.popupVisible) {
            this.showPopup(event)
        }
        //this.props.focus(event) //TODO
    }

    handleKeydown = (event) => {
        const keyCode = event.keyCode
        // Tab 9 or Enter 13
        if (keyCode === 9 || keyCode === 13) {
            // ie emit the watch before the change event
            event.stopPropagation()
            this.handleChange()
            this.setState({'userInput' : null})
            this.closePopup()
        }
    }

    clearDate = (e) => {
        e.stopPropagation();
        let date = this.props.range ? [null, null] : null
        this.setState({'currentValue':  date})
        this.updateDate(true)
        if(this.props.clear != undefined){ this.props.clear()};
    }

    handleInput = (event) => {
        this.setState({'userInput' : event.target.value})
    }

    handleChange = () => {
        if (this.props.editable && this.state.userInput !== null) {
            const value = this.text
            const checkDate = this.$refs.calendarPanel.isDisabledTime
            if (!value) {
                this.clearDate()
                return
            }
            if (this.range) {
                const range = value.split(` ${this.rangeSeparator} `)
                if (range.length === 2) {
                    const start = this.parse(range[0])
                    const end = this.parse(range[1])
                    if (start && end && !checkDate(start, null, end) && !checkDate(end, start, null)) {
                        this.setState({'currentValue' : [start, end]})
                        this.updateDate(true)
                        this.closePopup()
                        return
                    }
                }
            } else {
                const date = this.parse(value)
                if (date && !checkDate(date, null, null)) {
                    this.setState({'currentValue' : date})
                    this.updateDate(true)
                    this.closePopup()
                    return
                }
            }
            this.props.inputError(value);
        }
    }
    /*innerPopupStyle = () => {
        console.log("Style   " + { ...this.state.position, ...this.props.popupStyle })
        return { ...this.state.position, ...this.props.popupStyle }
    }*/

    selectDate = (date) => {
        this.setState({'currentValue' : date})
        this.updateDate() && this.closePopup()
    }

    selectTime = (time, close) => {
        this.setState({'currentValue' : time})
        this.updateDate() && close && this.closePopup()
    }

    updateDate = (confirm = false) => {
        if ((this.props.confirm && !confirm) || this.disabled) {
            return false
        }
        const equal = this.dateEqual(this.props.value, this.state.currentValue)
        if (equal) {
            return false
        }
        if(this.props.input != undefined){ this.props.input()};
        if(this.props.change != undefined){ this.props.change()};
        return true
    }

    dateEqual (a, b) {
        return isDateObejct(a) && isDateObejct(b) && a.getTime() === b.getTime()
    }

    confirmDate = () => {
        const valid = this.props.range ? isValidRangeDate(this.state.currentValue) : isValidDate(this.state.currentValue)
        if (valid) {
            this.updateDate(true)
        }
        this.props.confirm()
        this.closePopup()
    }

    computedWidth () {
        if (typeof this.props.width === 'number' || (typeof this.props.width === 'string' && /^\d+$/.test(this.props.width))) {
            return this.props.width + 'px'
        }
        return this.props.width
    }

    innerPlaceholder = () => {
        console.log("Hello inside placeholder")
        if (typeof this.props.placeholder === 'string') {
            return this.props.placeholder
        }
    }

    calendarChange(){

    }

    changeCalendarYear = () => {

    }

    render(){

        const { value, valueType, placeholder, lang, format, dateFormat, type, range,
            rangeSeparator, width, confirmText, confirm, editable, disabled, clearable,
            shortcuts, inputName, inputClass, inputAttr, appendToBody, popupStyle } = this.props;
        let computedWidth = this.computedWidth(); //TODO
        let innerPopupStyle = { ...this.state.position, ...this.props.popupStyle }
        console.log("innerPopupStyle  " + innerPopupStyle)
        return (
            <div>
            <div className="mx-datepicker"
                style={{"width": computedWidth}}
                /*v-clickoutside="closePopup"*/>
                <div className="mx-input-wrapper" onClick={this.showPopup.bind(this)}>

                    <input
                        className={inputClass}
                        name={inputName}
                        /*v-bind="inputAttr"
                        ref="input"*/
                        type="text"
                        disabled={disabled}
                        readOnly={!editable}
                        value=""
                        placeholder={placeholder}
                        onKeyDown={this.handleKeydown}
                        onFocus={this.handleFocus.bind(this)}
                        onBlur={this.handleBlur}
                        onInput={this.handleInput}
                        onChange={this.handleChange}/>
                    <span
                      v-if="showClearIcon"
                      className="mx-input-append mx-clear-wrapper" onClick={this.clearDate}>
                        <slot name="mx-clear-icon">
                            <i className="mx-input-icon mx-clear-icon"></i>
                        </slot>
                    </span>
                    <span className="mx-input-append">
                        <slot name="calendar-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 200 200" className="mx-calendar-icon">
                            <rect x="13" y="29" rx="14" ry="14" width="174" height="158" fill="transparent" />
                            <line x1="46" x2="46" y1="8" y2="50" />
                            <line x1="154" x2="154" y1="8" y2="50" />
                            <line x1="13" x2="187" y1="70" y2="70" />
                            <text x="50%" y="135" fontSize="90" strokeWidth="1" textAnchor="middle" dominantBaseline="middle">{new Date().getDate()}</text>
                          </svg>
                        </slot>
                    </span>
                </div>
            </div>
                {this.state.popupVisible &&
                    <div className="mx-datepicker-popup"
                     style={{innerPopupStyle}}
                     ref="calendar">
                    <slot name="header">

                    </slot>
                    <CalendarPanel
                        index="-1"
                        type={type}
                        date-format={dateFormat}
                        value={this.state.currentValue}
                        visible={this.state.popupVisible}
                        select-date={this.selectDate}
                        select-time={this.selectTime}
                        >

                    </CalendarPanel>

                    <slot name="footer">
                        {confirm &&
                            <div className="mx-datepicker-footer">
                                <button type="button" className="mx-datepicker-btn mx-datepicker-btn-confirm" onClick={this.confirmDate}>{confirmText}</button>
                            </div>
                        }
                    </slot>
                    </div>
                }
        </div>
        )
    }
}
