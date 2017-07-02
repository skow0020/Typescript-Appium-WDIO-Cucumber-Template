const capability = require('./src/support/capabilities.json')[process.env.CAPABILITY],
      appiumController = require('appium-controller'),
      exec = require('child_process').exec,
      fs = require('fs')
      resultFolder = `./run_results`
let scenarioResult, testCount = 0, failedTestCount = 0

exports.config = {
    // =====================
    // Server Configurations
    // =====================
    // Host address of the running Selenium server. This information is usually obsolete as
    // WebdriverIO automatically connects to localhost. Also, if you are using one of the
    // supported cloud services like Sauce Labs, Browserstack, or Testing Bot you don't
    // need to define host and port information because WebdriverIO can figure that out
    // according to your user and key information. However, if you are using a private Selenium
    // backend you should define the host address, port, and path here.
    //
    host: 'localhost',
    port: 4723,
    //path: '/wd/hub',
    //
    // ==================
    // Specify Test Files
    // ==================
    // Define which test specs should run. The pattern is relative to the directory
    // from which `wdio` was called. Notice that, if you are calling `wdio` from an
    // NPM script (see https://docs.npmjs.com/cli/run-script) then the current working
    // directory is where your package.json resides, so `wdio` will be called from there.
    //
    specs: [
        './src/features/*.feature'
    ],
    // Patterns to exclude.
    exclude: [
        // 'path/to/excluded/files'
    ],
    suites: {
        compatibleDeviceSuite: [
            './src/features/*.feature',
        ],
        nonCompatibleDeviceSuite: [
            './src/features/login.feature',
            './src/features/other.feature',
        ],
    },
    //
    // ============
    // Capabilities
    // ============
    // Define your capabilities here. WebdriverIO can run multiple capabilities at the same
    // time. Depending on the number of capabilities, WebdriverIO launches several test
    // sessions. Within your capabilities you can overwrite the spec and exclude options in
    // order to group specific specs to a specific capability.
    //
    // First, you can define how many instances should be started at the same time. Let's
    // say you have 3 different capabilities (Chrome, Firefox, and Safari) and you have
    // set maxInstances to 1; wdio will spawn 3 processes. Therefore, if you have 10 spec
    // files and you set maxInstances to 10, all spec files will get tested at the same time
    // and 30 processes will get spawned. The property handles how many capabilities
    // from the same test should run tests.
    //
    maxInstances: 1,
    //
    // If you have trouble getting all important capabilities together, check out the
    // Sauce Labs platform configurator - a great tool to configure your capabilities:
    // https://docs.saucelabs.com/reference/platforms-configurator
    //
    capabilities: [capability],
    //
    // ===================
    // Test Configurations
    // ===================
    // Define all options that are relevant for the WebdriverIO instance here
    //
    // By default WebdriverIO commands are executed in a synchronous way using
    // the wdio-sync package. If you still want to run your tests in an async way
    // e.g. using promises you can set the sync option to false.
    sync: true,
    //
    // Level of logging verbosity: silent | verbose | command | data | result | error
    logLevel: 'error',
    //
    // Enables colors for log output.
    coloredLogs: true,
    //
    // If you only want to run your tests until a specific amount of tests have failed use
    // bail (default is 0 - don't bail, run all tests).
    bail: 0,
    //
    // Saves a screenshot to a given path if a command fails.
    //screenshotPath: './errorShots/',
    //
    // Set a base URL in order to shorten url command calls. If your url parameter starts
    // with "/", then the base url gets prepended.
    baseUrl: 'http://localhost',
    //
    // Default timeout for all waitFor* commands.
    waitforTimeout: 30000,
    //
    // Default timeout in milliseconds for request
    // if Selenium Grid doesn't send response
    connectionRetryTimeout: 90000,
    //
    // Default request retries count
    connectionRetryCount: 3,
    //
    // Make sure you have the wdio adapter package for the specific framework installed
    // before running any tests.
    framework: 'cucumber',
    //
    // Test reporter for stdout.
    // The only one supported by default is 'dot'
    // see also: http://webdriver.io/guide/testrunner/reporters.html
    reporters: ['spec', 'cucumber', 'junit', 'json', 'allure'],
    reporterOptions: {
        outputDir: `${resultFolder}`,
        allure: {
            outputDir: `${resultFolder}/allure`
        }
    },
    //
    // If you are using Cucumber you need to specify the location of your step definitions.
    cucumberOpts: {
        require: ['./src/features/step_definitions'],        // <string[]> (file/dir) require files before executing features
        backtrace: false,   // <boolean> show full backtrace for errors
        compiler: ['ts:ts-node/register'],       //'<string[]> ("extension:module") require files with the given EXTENSION after requiring MODULE (repeatable)
        dryRun: false,      // <boolean> invoke formatters without executing steps
        failFast: false,    // <boolean> abort the run on first failure
        format: ['pretty'], // <string[]> (type[:path]) specify the output format, optionally supply PATH to redirect formatter output (repeatable)
        colors: true,       // <boolean> disable colors in formatter output
        snippets: true,     // <boolean> hide step definition snippets for pending steps
        source: true,       // <boolean> hide source uris
        profile: [],        // <string[]> (name) specify the profile to use
        strict: false,      // <boolean> fail if there are any undefined or pending steps
        tags: [],           // <string[]> (expression) only execute the features or scenarios with tags matching the expression
        timeout: 90000,     // <number> timeout for step definitions
        ignoreUndefinedDefinitions: false // <boolean> Enable this config to treat undefined definitions as warnings.
    },

    //
    // =====
    // Hooks
    // =====
    // WebdriverIO provides several hooks you can use to interfere with the test process in order to enhance
    // it and to build services around it. You can either apply a single function or an array of
    // methods to it. If one of them returns with a promise, WebdriverIO will wait until that promise got
    // resolved to continue.
    //
    // Gets executed once before all workers get launched.
    // onPrepare: function (config, capabilities) {
    // },
    //
    // Gets executed just before initialising the webdriver session and test framework. It allows you
    // to manipulate configurations depending on the capability or spec.
    // beforeSession: function (config, capabilities, specs) {
    // },
    //
    // Gets executed before test execution begins. At this point you can access all global
    // variables, such as `browser`. It is the perfect place to define custom commands.
    before: function () {
        require('ts-node/register')       
    },

    beforeFeature: function(feature) {
        process.env.FEATURE_NAME = feature.getName()
        createResultLogFile(feature)  
    },

    beforeScenario:function(scenario) {
        scenarioResult = 'PASSED', testCount++
        
        process.env.SCENARIO_NAME = scenario.getName()
        log(`\nSCENARIO: ${scenario.getName()}\n`)

        if (testCount > 1) { browser.reload() }
    },

    afterStep: function (stepResult) {
        logStepResult(stepResult)
    },

    afterScenario:function(scenario) {        
        saveScreenShotAfterScenario(scenario)
        log(`SCENARIO: ${scenario.getName()} RESULT: ${scenarioResult}\n`)
    },
    afterFeature:function(feature) {
        log(`\nTOTAL TESTS: ${testCount} FAILED: ${failedTestCount}`)
    },
    //
    //
    // Runs before a WebdriverIO command gets executed.
    // beforeCommand: function (commandName, args) {
    // },
    //
    // Runs after a WebdriverIO command gets executed
    // afterCommand: function (commandName, args, result, error) {
    // },
    //
    // Gets executed after all tests are done. You still have access to all global variables from
    // the test.
    after: function (result, capabilities, specs) {     
        removeApp()
    },
    //
    // Gets executed right after terminating the webdriver session.
    // afterSession: function (config, capabilities, specs) {
    // },
    //
    // Gets executed after all workers got shut down and the process is about to exit. It is not
    // possible to defer the end of the process using a promise.
    onComplete: function(exitCode) {
        exec(`allure generate ${resultFolder}/allure -o ${resultFolder}/allure-report`)
        exec(`allure open ${resultFolder}/allure-report`)
    }
}

function log(textToAppend) {
    fs.appendFile(`${resultFolder}/${process.env.FEATURE_NAME}Log.txt`, textToAppend, function(err) { 
        if (err) throw err
    })
}

function removeApp() {
    let appID
    if (capability["platformName"] === "Android") { 
        appID = '' 
        browser.waitUntil(() => {
            browser.removeApp(appID)
            return browser.isAppInstalled(appID)['value'] === false
        })
    }
    else if (capability["platformName"] === "iOS") { 
        appID = '' 
        browser.removeApp(appID)
    }
}

function saveScreenShotAfterScenario(scenario) {
    let screenshotDir = `./run_results/screenshots/${process.env.DEVICE_NAME}`
    if (!fs.existsSync(screenshotDir)) { fs.mkdirSync(screenshotDir) }
    screenshotDir = `${screenshotDir}/${process.env.FEATURE_NAME}`
    if (!fs.existsSync(screenshotDir)) { fs.mkdirSync(screenshotDir) }

    let screenshotFile = `${screenshotDir}/${scenario.getName()}_${scenarioResult}.png`
    if (fs.existsSync(screenshotFile)) { screenshotFile =+ `${testCount}_` }
    browser.saveScreenshot(`${screenshotDir}/${scenario.getName()}_${scenarioResult}.png`)
}

function logStepResult(stepResult) {
    log(`\t${stepResult.getStatus()} : ${stepResult.getStep().getName()}\n`)
    if (stepResult.getStatus() === 'failed') { 
        failedTestCount++
        scenarioResult = 'FAILED'
        log(`\t${stepResult.getFailureException()}\n`)
    }
}

function setLanguageEnglish() {
    if (capability["platformName"] === "Android") { 
        exec(`adb shell am start -n net.sanapeli.adbchangelanguage/.AdbChangeLanguage -e language en`, function(error, stdout, stderr) {})
    }
}

function createResultLogFile(feature) {
    if (!fs.existsSync(resultFolder)) { fs.mkdirSync(resultFolder) }
    const runDetails = `Platform: ${capability['platformName']}\nDevice Name: ${capability['deviceName']}\nDevice ID: ${capability['udid']}\nPlatform Version: ${capability['platformVersion']}\nApp: ${capability['app']}\n\n`
    fs.writeFile(`${resultFolder}/${process.env.FEATURE_NAME}Log.txt`, runDetails, function(err) { })
    log(`\nFEATURE: ${process.env.FEATURE_NAME}\n`)
}