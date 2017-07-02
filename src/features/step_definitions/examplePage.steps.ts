import ExamplePage from './../pages/example.page'

module.exports = function () {
    this.When(/^I click \'(.*)\' on the about page$/, (element: string) => {
        ExamplePage.clickElementByID(element)
    })
    this.Then(/^I am on the example page$/, () => {
        ExamplePage.verifyExamplePage()
    })
}
