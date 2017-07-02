import { assert } from 'chai'
import { Page } from './util.page'

class Example_Page extends Page {
    get exElement()  { return this.getBrowserElementById('myTransmitterTextView') }
    get element2()   { return this.getBrowserElementById('mySensorTextView') }
    get element3()   { return this.getBrowserElementById('arrow6') }

    /**
     * Get element by string name as defined in page objects
     */
    public getElement(element: string) {
        switch (element) {
            case 'exElement':
                return this.exElement
            default:
                assert.fail(`getElement not implemented for: ${element}`)
                return
        }
    }

    /**
     * Verify the Example page opens correctly with all elements
     */
    public verifyExamplePage() {

    }
}
const ExamplePage = new Example_Page()
export default ExamplePage