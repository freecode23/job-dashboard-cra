const mysql = require('mysql2');
const pool = require('./pool').promise();

const createdb = async () =>{

    console.log("SQL:create DB if not exist")
    try {
        await pool.query("CREATE DATABASE IF NOT EXISTS jobsdb")
    } catch (err) {
        console.log("SQL: error creating db", err);
    }
} 

const createTables = async () => {
    // - create table GIVES ERROR HERE
    console.log("SQL:create tables if not exist");
    try {
        // drop table
        // await pool.query(`DROP TABLE IF EXISTS jobs`)
        // await pool.query(`DROP TABLE IF EXISTS queries`)
        let createJobsTable = `CREATE TABLE IF NOT EXISTS jobs(
            id VARCHAR(255) NOT NULL UNIQUE PRIMARY KEY,
            title VARCHAR(255),
            company VARCHAR(255),
            location VARCHAR(255),
            description TEXT,
            applyUrl TEXT,
            posted VARCHAR(255),
            postedEstimate DATE,
            queryName VARCHAR(255)
        )`;
        let createQueriesTable = `CREATE TABLE IF NOT EXISTS queries(
            id VARCHAR(255) PRIMARY KEY,
            queryName VARCHAR(255),
            date DATE NOT NULL
        )`;
        await pool.query(createJobsTable)
        await pool.query(createQueriesTable)

    } catch (err) {
        console.log("SQL:error create tables>>", err);
    }
}

// Jobs table
const insertJob = async (newJob) => {
    
    let insertSql = `INSERT INTO jobs
    (id, title, company, location, description, applyUrl, posted, postedEstimate, queryName)
    VALUES (?,?,?,?,?,?,?,?,?)`

    let values = [newJob.id, newJob.title, newJob.company, newJob.location, newJob.description, newJob.applyUrl, newJob.posted, newJob.postedEstimate, newJob.queryName]
    try {

        const addJob = await pool.query(insertSql,values)
        // console.log("SQL:insertJob", newJob.title)
    } catch (err) {
        if (err.code == "ER_DUP_ENTRY") {
            "skipping duplicate datas"
        } else {

            console.log("SQL:error insert job>>", err);
        }
    }
}

const getJobsByQuery = async (query) => {
    console.log("SQL:get jobs by query:", query)
    let getAllSql = `SELECT * FROM jobs WHERE queryName="${query}"`

    try {
        const allJobs = await pool.query(getAllSql)
        allJobs[0].forEach((job) => {
            console.log("jobtitle:", job.id);
        })
        return allJobs[0]
    } catch (err) {
        console.log("SQL:error get all jobs>>", err);
    }

}


const getJobsById = async (id) => {
    console.log("SQL:get jobs by id:", id)
    let sql = `SELECT * FROM jobs WHERE id="${id}"`

    try {
        const jobById = await pool.query(sql)
        // console.log("jobyId", jobById);
        return jobById
    } catch (err) {
        console.log("SQL:error get all jobs>>", err);
    }

}

const insertQuery = async (newQuery) => {
    console.log("SQL:insertQuery with date", newQuery.date)
    let insertSql = `INSERT INTO queries
    (id, queryName, date)
    VALUES (?,?,?)`

    let values = [newQuery.id, newQuery.queryName, newQuery.date]
    try {
        const addJob = await pool.query(insertSql, values)
    } catch (err) {
        console.log("SQL:error insert query>>", err);
    }
}

/**
 * Update jobPosted days every 24 hours
 */
const updateJobPosted = async() => {
    console.log("SQL:update number of days jobs posted")
    // 1. get all jobs
    let sql  =`SELECT * FROM jobs`
    try {
        const allJobs = await pool.query(sql)

        for(job of allJobs[0]) {
            // console.log("job posted", job.posted);
        }
    } catch (err) {
        console.log("SQL:error update job posted>>", err);
    }

}

// Query table
const getQuery = async (queryName) => {
    console.log("SQL:get Query", queryName)
    let getQuery = `SELECT * FROM queries WHERE queryName="${queryName}"`

    try {
        const queryRes = await pool.query(getQuery)
        queryRes[0].forEach((query) => {
            console.log("SQL:get query matches:", query.date);
        })
        return queryRes[0]
    } catch (err) {
        console.log("SQL:error get all queries>>", err);
    }
}

const updateQueryDate = async (queryName, newDate) => {
    console.log("SQL:update queries to new date:", newDate)
    // let sql = `UPDATE queries SET date="${newDate}" WHERE queryName="${queryName}"`
    
    let sql = `UPDATE queries SET date="${newDate}" WHERE queryName="${queryName}"`

    try {
        const queryRes = await pool.query(sql)
    } catch (err) {
        console.log("SQL:update queries>>", err);
    }
}

module.exports = { createdb, createTables, insertJob, insertQuery, getJobsByQuery, getQuery, updateQueryDate, updateJobPosted, getJobsById}
