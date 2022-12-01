// Selenium
const { Builder, Browser, By, Key, until } = require('selenium-webdriver');
const { Options } = require('selenium-webdriver/chrome');
require('dotenv').config();


// Serp api
const SerpApi = require('google-search-results-nodejs');
const countries = require("i18n-iso-countries");
countries.registerLocale(require("i18n-iso-countries/langs/en.json"));

/**
 * Split the location by state and country if the state is included in the query
 * @param {*} location 
 * @returns a JSON of location(state) and geolocation (the country)
 */
const splitLocation = (location) => {
    const splitLoc = location.split(",");
    const res = splitLoc.map(word => word.trim())
    let gl;
    if (res.length === 2) {
        // convert country to code
        gl = countries.getAlpha2Code(res[1], "en").toLowerCase()
        return { location: res[0], gl: gl }
    } else {
        gl = countries.getAlpha2Code(res[0], "en").toLowerCase()
        return { location: null, gl: gl }
    }
}


/**
 * Will set the param needed for serp api
 * @param {*} req the request received from the get request
 * @returns the params ready to be inserted to serp api search.json method
 */
const setParams = (req) => {
    const location = splitLocation(req.query.location)
    const title = req.query.title.toLowerCase()

    let params = {
        engine: "google_jobs",
        q: title,
        // google_domain: "google.com",
        hl: "en",
        start: 0,
        gl: location.gl // country
    }

    // specific location
    if (location.location) {
        params = { ...params, location: location.location.toLowerCase() }
    }

    return params
}

/**
 * Will go to to the result url using selenium and search for the apply link for each job
 * the url will contain 10 jobs. 
 * The link is rotated at index 10. so it starts as [job2, job3, job4, job5, job6, job7, job8, job9, job]
 * So we need to reorder it
 * @param {*} resultUrl the url given by serp api
 * @returns the list of 10 url for the job
 */
const searchLink = async (resultUrl) => {

    // comment for docker >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    let sortLinks = [];
    let driver
    try {
        //Browser Setup
        let builder = new Builder().forBrowser('chrome');
        let options = new Options();
        options.headless();                             // run headless Chrome
        options.excludeSwitches(['enable-logging']);    // disable 'DevTools listening on...'
        options.addArguments(['--no-sandbox']);
        driver = await builder.setChromeOptions(options).build();
        console.log("driver built");
        // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
        // >>>>>>> uncomment for local 
        // await driver
        //     .manage()
        //     .window()
        //     .maximize();
        // await driver.manage().deleteAllCookies();
        // <<<<<<<<<<<<<<<<<<<<

        // resultUrl = "https://serpapi.com/searches/b22ee9f37de962d7/634ce9bf2c68786907dfe710.html"
        // ds : https://serpapi.com/searches/b68f300f32af5df2/634d0d3df8f5f78f6c8404de.html#htivrt=jobs&htidocid=4Q8i9TpWpOkAAAAAAAAAAA%3D%3D&fpstate=tldetail
        // swe: https://serpapi.com/searches/5348802b0ffca492/634cff1b969c087cf7dcbf3f.html#htivrt=jobs&htidocid=FgYnJySDDoEAAAAAAAAAAA%3D%3D&fpstate=tldetail

        // - visit the address
        await driver.get(resultUrl);

        // - grab element
        // //*[@id="gws-plugins-horizon-jobs__job_details_page"]/div/g-scrolling-carousel/div/div/div/span/a
        const xpath = "//*[@id=\"gws-plugins-horizon-jobs__job_details_page\"]/div/g-scrolling-carousel/div/div/div/span/a"
        const eles = await driver.findElements(By.xpath(xpath))

        let applyLinks = []
        // - push to array
        for (ele of eles) {
            let link = await ele.getAttribute("href");
            applyLinks.push(link)
        }

        // - reorder array
        sortLinks.push(applyLinks[9])
        sortLinks.push(applyLinks.slice(0, 9))
        // console.log("sortLinks", sortLinks.flat())

    } catch (err) {
        console.error(err);
    } finally {
        driver.quit();
        console.log('complete!');
        return sortLinks.flat()
    }
};



/**
 * 
 * @param {*} params the params used for to call the serp api
 * @returns the result of job search
 */
const callSerpApi = async (params) => {
    const search = new SerpApi.GoogleSearch(process.env.SERP_API);

    return new Promise((resolve) => {
        const callback = async (data) => {
            // return data here
            resolve(data)
        }
        search.json(params, callback);
    })
}

/**
 * Get the estimated date that the job is posted based on the posted days/ hours ago
 * @param {*} postedAgo the string received from serp api, can be in hour or days
 * @returns the estimated date that this job is posted
 */
const getPostedEstimate = (postedAgo) => {
    const s = postedAgo.split(" ")
    // var initialDate = new Date(); 
    let estDate;
    console.log("postedAgo", postedAgo);
    if (s[1] === "days" || s[1] === "day" ) {
        let dayAgo = parseInt(s[0])
        estDate = new Date(Date.now() - (86400000 * dayAgo))
    } else if (s[1] === "hour" || s[1] === "minutes" || s[1] === "hours") {
        estDate = new Date()
    }
    console.log("estDate=", estDate);
    return estDate.toISOString().slice(0, 10).replace('T', '')
}

module.exports = { searchLink, setParams, splitLocation, callSerpApi, getPostedEstimate }
