const router = require("express").Router();

//  sql
const sql = require("../db/sql.js")

// util function
const util = require("../util/util.js")
const { v1: uuidv1 } = require('uuid');


router.get('/query/:query', async function (req, res) {
    console.log("\n>>>>>>>>>>>YOOOOOO")
    // 1. create db and table if not exists
    try {
        await sql.createdb()
        await sql.createTables()
        await sql.updateJobPosted()
    } catch (err) {
        console.log(err);
    } 

    // 2. set params for the search api specified in the get req
    const params = util.setParams(req)
    console.log("search params", params)

    
    // 3. If the query has not been made today 
    // make the query to using callSepApi first to first store the datas
    // let twoDaysAgo = new Date(Date.now() + (86400000*2)).toISOString().slice(0, 10).replace('T', '')
    // let yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10).replace('T', '')
    const today = new Date().toISOString().slice(0, 10).replace('T', '')
    const locationQuery = params.gl + (params.location? params.location : "")
    const queryMade = params.q + " " + locationQuery
    let queryRes = await sql.getQuery(queryMade)
    let queryMadeDate;
    if (typeof queryRes[0] != "undefined") {
        queryMadeDate = queryRes[0].date
    }
    
    // - if this query has never been made, or made but not today, insert query to db and call serpApi
    if (queryRes.length === 0 || (queryRes.length > 0 && queryMadeDate !== today)) {
        // A. insert this query to db or update query date
        if (queryRes.length === 0) {
            console.log("ROUTER:query has never been made...");
            const newQuery = {
                id: uuidv1(),
                queryName: queryMade,
                date: today
            }
            await sql.insertQuery(newQuery)

        } else if (queryRes.length > 0 && queryMadeDate != today) {

            console.log("ROUTER:query was made before on", queryMadeDate, ",updating dates...");
            await sql.updateQueryDate(queryMade, today)
        }


        // B. call the api for n page, get the apply links, and insert jobs result to db
        var n = 0;
        for (var startVal = 0; startVal <= n; startVal += 10) {
            console.log("ROUTER:inserting job")
            // 1. call the api and get result
            let result = await util.callSerpApi(params)
            const jobsResults = result["jobs_results"]
            const pageUrl = result["search_metadata"].raw_html_file

            // 2. get the apply links for each of the job result
            const applyLinks = await util.searchLink(pageUrl)

            // 3. Insert Jobs to db
            if (typeof jobsResults != "undefined") {
                let i = 0;
                for (var job of jobsResults){
                    // - default posted days ago, some are unknown
                    let postedAgo = "3 days ago"

                    // - grab the actual postedAgo from result
                    if (typeof job.detected_extensions.posted_at != "undefined") {
                        postedAgo = job.detected_extensions.posted_at;
                    }
                    let postedEstimate = util.getPostedEstimate(postedAgo);
    
                    // - create new job and insert to sql
                    const newJob = {
                        id: (job.title + job.company_name + job.location).replace(/ /g, ''),
                        title: job.title,
                        company: job.company_name,
                        location: job.location,
                        description: job.description,
                        applyUrl: applyLinks[i],
                        posted: postedAgo,
                        postedEstimate: postedEstimate,
                        queryName: queryMade
                    }
                    i+=1
                    
                    await sql.insertJob(newJob)
                }
            }
        }
    
 
    } else {
        console.log("ROUTER:query has been made today, will retrieve from DB");
    }

    // 4. grab all data from SQL and send to react
    try {
        
        const allJobs = await sql.getJobsByQuery(queryMade)
        res.send(allJobs)
    } catch (err) {
        console.log("error getting all jobs", err);
    }

})


router.get("/by-ids/", async function(req,res) {
    var allJobById =[]
    if (req.query.jobIds) {
        for (jobId of req.query.jobIds) {
            var job = await sql.getJobsById(jobId)
            allJobById.push(job[0][0])
        }
    }
    res.send(allJobById)
})
module.exports = router;