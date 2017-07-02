import { assert } from 'chai'
import Constants from './../../support/constants'
const exec = require('child_process').exec,
    PLATFORM = require('./../../support/capabilities.json')[process.env.CAPABILITY]['platformName']

export class Page {
    constructor() {
    }
    get universalElement()    { return browser.element('android=new UiSelector().text("Chrome")') }
    get anotherElement()    { return this.getBrowserElementById('buttonAlways') }

    /**
     * Get element by string name as defined in page objects
     */
    public getElement(element: string) {
        switch (element) {
            case 'menu':
                return this.universalElement
            default:
                assert.fail(`getElement not implemented for: ${element}`)
                return
        }
    }

    /**
     * Get page element by ID per PLATFORM
     * @param elementId 
     */
    public getBrowserElementById(elementId: String) {
        if (PLATFORM === Constants.ANDROID) return browser.element(`#${elementId}`)
        else if (PLATFORM === Constants.IPHONE) return browser.element(`~${elementId}`)
    }

    /**
     * Click element by id name: Uses the getElement() method to get the page element
     * @param elementID
     */
    public clickElementByID(elementID: string, errorMsg=null, waitTime=Constants.DEFAULT_SEC) {
        if (errorMsg === null)  { errorMsg = `Element was not found to be clicked: ${elementID}` }
        this.waitForElement(this.getElement(elementID), errorMsg, waitTime)
        this.getElement(elementID).click()
    }

    /**
     * Click element by webElement
     * @param element
     */
    public clickElement(element: WebdriverIO.Client<WebdriverIO.RawResult<WebdriverIO.Element>>, waitTime=Constants.DEFAULT_SEC) {
        this.waitForElement(element, `Element not found to be clicked: ${element.element.toString()}`, waitTime)
        element.click()
    }

    public waitForElement(element: WebdriverIO.Client<WebdriverIO.RawResult<WebdriverIO.Element>>, errMsg=null, waitTime=Constants.DEFAULT_SEC){
        if (errMsg === null ) { errMsg = `Could not find element` }
        browser.waitUntil(() => {
            return element.isExisting()
        }, waitTime, errMsg);
    }

    public waitForElementNotExist(element: WebdriverIO.Client<WebdriverIO.RawResult<WebdriverIO.Element>>, errMsg=null, waitTime=Constants.DEFAULT_SEC){
        if (errMsg === null ) { errMsg = `An element unexpectedly continued to exist on page` }
        browser.waitUntil(() => {
            return !element.isExisting()
        }, waitTime, errMsg);
    }

    /**
     * Swipe down on an element a provided number of times
     * @param element 
     * @param numOfSwipes 
     */
    public swipeDown(element: WebdriverIO.RawResult<WebdriverIO.Element>, numOfSwipes: number) {
        try {
            let i = 1;
            while (i <= numOfSwipes) {
                browser.swipe(element.selector, 0, 100, 100)
                browser.pause(500)
                i++
            }
        }
        catch (err) { assert.fail('Failed to swipe down on element: ' + element) }
    }

    /**
     * Swipe up on an element a provided number of times
     * @param element 
     * @param numOfSwipes 
     */
    public swipeUp(element: WebdriverIO.RawResult<WebdriverIO.Element>, numOfSwipes: number) {
        try {
            let i = 1;
            while (i <= numOfSwipes) {
                browser.swipe(element.selector, 0, -100, 100)
                browser.pause(500)
                i++
            }
        }
        catch (err) { assert.fail('Failed to swipe up on element: ' + element) }
    }

    /**
     * Sets the application to the background and reopens it after 3 seconds
     * background method has a bug in it in appium v1.6.4 and will be fixed in 1.6.5. The try/catch is a work around
     */
    public backgroundAndBackUp(time = 3) {
        try {
            browser.background(time)
        }
        catch (err) {
            console.log(err)
        }
    }

    /**
     * General assertion for errors on verifying element text
     * @param expectedValue
     * @param actualValue
     */
    public assertElementText(expectedValue: string, actualValue: string) {
        assert.equal(expectedValue, actualValue, `FAILURE: Expected value '${expectedValue}' did not match actual value '${actualValue}'`)
    }

    /**
     * General assertion for errors on element visisbility
     * @param visible: The isVisible() method run on the element
     * @param element: Element description
     */
    public assertElementVisible(element: WebdriverIO.Client<WebdriverIO.RawResult<WebdriverIO.Element>>, errorMsg = null) {
        if (!errorMsg) { errorMsg = `Element was not visible: ${element.getText()}` }
        assert.isTrue(element.isVisible(), errorMsg)
    }
    
    /**
     * Changes the app orientation
     * @param orientation 
     */
    public rotate(orientation: string) {
        if (orientation === 'landscape') { browser.setOrientation("landscape") }
        else if (orientation === 'portriat') { browser.setOrientation("portrait") }
    }

    /**
     * Verifies landscape app orientation
     * @param orientation 
     */
    public verifyLandscapeOrientation() {
        orientation = browser.getOrientation().getValue()
        assert.isTrue(orientation === 'landscape', 'Orientation was not landscape')
    }
    /**
     * Format date for filename
     */
    public formatDateForFileName(date: Date) {
        return `${Constants.weekdayNames[date.getDay()]}-${Constants.monthNames[date.getMonth()]}-${date.getDate()}}`
    }

    /**
     * Format date object example: Friday, June 09, 2017
     * @param date 
     */
    public formatDate(date: Date) {
        var day = (date.getDate() <=9 ? `0${date.getDate()}` : `${date.getDate()}`);
        return `${Constants.weekdayNames[date.getDay()]}, ${Constants.monthNames[date.getMonth()]} ${day}, ${date.getFullYear()}`
    }

    /**
     * Set the language on the device
     */
    public setLanguage(language: string) {
        let languageCode: string
        switch (language) {
            case 'spa':
                languageCode = 'es'
                break
            case 'nob':
                languageCode = 'nb'
                break
            case 'swe':
                languageCode = 'sv'
                break
            case 'deu':
                languageCode = 'de'
                break
            case 'nld':
                languageCode = 'nl'
                break
            case 'ron':
                languageCode = 'ro'
                break
            case 'fra':
                languageCode = 'fr'
                break
            case 'dan':
                languageCode = 'da'
                break
            case 'eng':
                languageCode = 'en'
                break
            case 'fin':
                languageCode = 'fi'
                break
            case 'ita':
                languageCode = 'it'
                break
            case 'arb':
                languageCode = 'ar'
                break
            default:
                assert.isTrue(false, 'setLanguage not implemented for: ' + language)
                break
        }
        exec(`adb shell am start -n net.sanapeli.adbchangelanguage/.AdbChangeLanguage -e language ${languageCode}`, function(error, stdout, stderr) { });
    }


    /**
     * Verify text language using text and an expected language code
     */
    public verifyTextLanguage(text: string, languageCode: string) {
        let verified = false
        const imgFile = `./run_results/language_screenshots/${PLATFORM}_${languageCode}` + this.formatDateForFileName(new Date()) + '.png'
        browser.saveScreenshot(imgFile)

        for (const entry of franc.all(text))
        {
            if (entry[0] === languageCode) { 
                const value = parseFloat(entry[1])
                assert.isTrue(value > 0.8, 'Language verification value was low for: ' + text + ' // ' + languageCode + ', actual: ' + entry[1])
                verified = true
                break
            }    
        }
        assert.isTrue(verified, 'Language could not be verified: ' + languageCode)
    }
}
const page = new Page()
export default page
