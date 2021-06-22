const fetch = require('node-fetch');
const axios = require('axios')
const express = require('express')
const hostname = 'localhost'
const port = 9999

const textEndpoint =  "https://join.reckon.com/test2/textToSearch";
const subTextsEndpoint = "https://join.reckon.com/test2/subTexts";
const submitEndpoint = " https://join.reckon.com/test2/submitResults";
const app = express();

async function retry(endpoint, n=10) {
    for (let i = 0; i < n; i++) {
        try {
            return await fetch(endpoint);
        } catch {}
    }

    throw new Error(`Failed retrying ${n} times`);
}

async function retryPost(endpoint, response, n=10) {
    for (let i = 0; i < n; i++) {
        try {
            return axios.post(endpoint, response)
        } catch {}
    }

    throw new Error(`Failed retrying ${n} times`);
}

app.post('/submitResults', async (req, res) => {
    const reqResults = req['results'];
    const candidate = reqResults['candidate'];
    const resText = await retry(textEndpoint);
    const resSubTexts = await retry(subTextsEndpoint);
    const textJson = await resText.json()
    const subTextsJson = await resSubTexts.json();
    const textToParse = textJson["text"];
    const subTexts = subTextsJson["subTexts"];
    let matchResults = findMatchResults(textToParse, subTexts)

    let response = Object.create({});
    response['candidate'] = candidate;
    response['text'] = textToParse;
    response['results'] = matchResults;

    try {
        const submitResult = await retryPost(submitEndpoint, response);
        console.log(`status: ${submitResult.statusText}`)
        return submitResult.status;
    } catch (err) {
        console.error(err);
    }


})

app.listen(hostname, port);

