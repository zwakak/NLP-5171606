const { WebhookClient } = require('dialogflow-fulfillment');


const { Storage } = require('@google-cloud/storage');


let recordsCache;
async function populateRecordsCache() {
    const storage = new Storage();
    const bucketName = 'nlp-chatbot-fulfiment';
    const fileName = 'generatedRecords.json';
    const file = storage.bucket(bucketName).file(fileName);

    try {
        const fileContents = await file.download();
        recordsCache = JSON.parse(fileContents.toString());
        console.log(`${recordsCache.length} records downloaded and cached successfully.`);
    } catch (error) {
        console.error('Error downloading and caching file:', error);
    }
}

populateRecordsCache();

async function findRecordFromCache(deviceType, os, fileType, dataLossCause) {
    if (!recordsCache) {
        console.error('Records cache is not populated.');
        await populateRecordsCache()

    }

    return recordsCache.find(record =>
        record.os.toLowerCase() === os &&
        record.deviceType.toLowerCase() === deviceType &&
        record.fileType.toLowerCase() === fileType &&
        record.dataLossCause.toLowerCase() === dataLossCause
    );
}


function checkMissingValues(agent) {
    console.log("checkMissingValues Function ...")

    const expectedParameters = ['DeviceType', 'OperatingSystem', 'FileType', 'DataLossCause'];
    var missingParameter;

    for (const parameter of expectedParameters) {
        if (!(parameter in agent.parameters) || agent.parameters[parameter] === undefined
            ||  agent.parameters[parameter] ==='' || (""+agent.parameters[parameter]).startsWith('#')) {
            missingParameter = parameter;
            break;
        }
    }
    console.log("Missing Parameter is ...", missingParameter)

    if(missingParameter === "DeviceType"){
        agent.add("Now, What device type are you working on?")
    }else if(missingParameter === "OperatingSystem"){
        agent.add("Now, What operating system are you working on?")
    }else if(missingParameter === "FileType"){
        agent.add("Now, What types of files are you willing to recover?")
    }else if(missingParameter === "DataLossCause"){
        agent.add("Now, How did you lost your data? or what is the cause of the data loss (Hardware failure, Virus infection, etc..)")
    }else if (!missingParameter){

        recoveryStepsHandler(agent)
    }

}

function deviceTypeCorrectionHandler(agent) {

    console.log("Device Type Correction Handler ...")
    console.log("Agent Parameters ...", agent.parameters)

    var correctedValue = getDeviceTypeValue(agent)

    console.log("correctedValue is ...", correctedValue)
    if(!correctedValue)
        agent.add(`I'm sorry, I couldn't understand your inquiry. Can you please rephrase your question?`);
    else {
        agent.context.set({
            name: 'data_recovery_context',
            lifespan: 50,
            parameters: {
                DeviceType: correctedValue
            }
        });

        agent.add(`Got it!. you meant ${correctedValue} that you are using, okay!\n`);
        checkMissingValues(agent);
    }

}

function fileTypeCorrectionHandler(agent) {
    var correctedValue = getFileTypeValue(agent)

    if(!correctedValue)
        agent.add(`I'm sorry, I couldn't understand your inquiry. Can you please rephrase your question?`);
    else {
        agent.context.set({
            name: 'data_recovery_context',
            lifespan: 50,
            parameters: {
                FileType: correctedValue
            }
        });
        agent.add(`Got it!. you meant ${correctedValue} files, correcting the value for you..\n`);
        checkMissingValues(agent);
    }
}

function operatingSystemCorrectionHandler(agent) {
    var correctedValue = getOSValue(agent)

    if(!correctedValue)
        agent.add(`I'm sorry, I couldn't understand your inquiry. Can you please rephrase your question?`);
    else {
        agent.context.set({
            name: 'data_recovery_context',
            lifespan: 50,
            parameters: {
                OperatingSystem: correctedValue
            }
        });
        agent.add(`Got it!. you meant ${correctedValue} operating system, correcting the value for you..\n`);
        checkMissingValues(agent);
    }
}

function dataLossCauseCorrectionHandler(agent) {
    var correctedValue = getDataLossCauseTypeValue(agent);


    if(!correctedValue)
        agent.add(`I'm sorry, I couldn't understand your inquiry. Can you please rephrase your question?`);
    else {
        agent.context.set({
            name: 'data_recovery_context',
            lifespan: 50,
            parameters: {
                DataLossCause: correctedValue
            }
        });
        agent.add(`Got it!. you meant you lost your data through ${correctedValue} cause, correcting the value for you..\n`);
        checkMissingValues(agent);
    }
}

function getDataLossCauseTypeValue(agent) {
    var dataLossCause;
    if (Array.isArray(agent.parameters.DataLossCause)) {
        if(agent.parameters.DataLossCause.length > 1){

            dataLossCause = agent.parameters.DataLossCause[agent.parameters.DataLossCause.length - 1].toLowerCase();
        }else dataLossCause = agent.parameters.DataLossCause[0].toLowerCase()
    }else dataLossCause = agent.parameters.DataLossCause.toLowerCase()
    return dataLossCause;
}

function getDeviceTypeValue(agent) {
    var deviceType;
    if (Array.isArray(agent.parameters.DeviceType)) {
        if(agent.parameters.DeviceType.length > 1){

            deviceType = agent.parameters.DeviceType[agent.parameters.DeviceType.length - 1].toLowerCase();
        }else deviceType = agent.parameters.DeviceType[0].toLowerCase()
    }else deviceType = agent.parameters.DeviceType.toLowerCase()
    return deviceType;
}

function getFileTypeValue(agent) {
    var fileType;
    if (Array.isArray(agent.parameters.FileType)) {
        if(agent.parameters.FileType.length > 1){

            fileType = agent.parameters.FileType[agent.parameters.FileType.length - 1].toLowerCase();
        }else fileType = agent.parameters.FileType[0].toLowerCase()
    }else fileType = agent.parameters.FileType.toLowerCase()
    return fileType;
}

function getOSValue(agent) {
    var os;
    if (Array.isArray(agent.parameters.OperatingSystem)) {
        if(agent.parameters.OperatingSystem.length > 1){

            os = agent.parameters.OperatingSystem[agent.parameters.OperatingSystem.length - 1].toLowerCase();
        }else os = agent.parameters.OperatingSystem[0].toLowerCase()
    }else os = agent.parameters.OperatingSystem.toLowerCase()
    return os;
}

function recoveryStepsHandler(agent) {


    const deviceType = getDeviceTypeValue(agent);
    const os = getOSValue(agent);
    const fileType = getFileTypeValue(agent);
    var dataLossCause = getDataLossCauseTypeValue(agent);
    console.log("recoveryStepsHandler with parameters...", deviceType, os, fileType, dataLossCause)


    findRecordFromCache(deviceType, os, fileType, dataLossCause).then((record)=>{
        if (record) {
            const recoverySteps = record.recoverySteps;
            const response = `Here are the steps for recovering ${fileType} from a ${deviceType} running ${os} due to ${dataLossCause}:\n\n${recoverySteps.join('\n')}`;
            agent.add(response);
        } else {
            agent.add("I'm sorry, I couldn't find the data recovery steps for the specified combination.");
        }
    });



}

exports.dialogflowFirebaseFulfillment =  (req, res) => {
    const agent = new WebhookClient({ request: req, response: res });
    let intentMap = new Map();
    intentMap.set('Recovery Setps - device type - correction', deviceTypeCorrectionHandler);
    intentMap.set('Recovery Setps - file type - correction', fileTypeCorrectionHandler);
    intentMap.set('Recovery Setps - os - correction', operatingSystemCorrectionHandler);
    intentMap.set('Recovery Setps - data loss cause - correction', dataLossCauseCorrectionHandler);
    intentMap.set('Recovery Setps - data loss cause',  recoveryStepsHandler);
    agent.handleRequest(intentMap);
};