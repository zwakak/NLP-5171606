const { WebhookClient } = require('dialogflow-fulfillment');

const stepsMap = {
    'hard drive': {
        'windows': {
            'accidental deletion': [
                '1. Power off the computer immediately to prevent further data loss.',
                '2. Remove the hard drive from the computer and connect it to another Windows PC using a SATA-to-USB adapter.',
                '3. Download and install reputable data recovery software like "Recuva" or "EaseUS Data Recovery Wizard".',
                '4. Run the data recovery software and scan the connected hard drive for deleted files.',
                '5. Preview the scan results and select the files you want to recover.',
                '6. Choose a safe location to save the recovered files, preferably on a different storage device.',
                '7. Begin the recovery process and wait for the software to complete the operation.',
                '8. After recovery, verify the integrity of the recovered files and transfer them to a secure backup location.'
            ],
            'hardware failure': [
                '1. Power off the computer and disconnect the malfunctioning hard drive.',
                '2. Consult with a professional data recovery service if the hard drive is making unusual noises or not detected by the system.',
                '3. If attempting DIY recovery, use specialized hardware diagnostic tools to determine the extent of the damage.',
                '4. Consider replacing faulty components such as the PCB board or damaged read/write heads if feasible.',
                '5. Once the hard drive is operational, follow the steps for accidental deletion recovery as mentioned above.',
                '6. After successful recovery, perform thorough backups to prevent future data loss events.'
            ]
        },
        'macos': {
            'accidental deletion': [
                '1. Immediately stop using the Mac to avoid overwriting deleted files.',
                '2. Connect the Mac hard drive to another macOS computer using a compatible interface (e.g., Thunderbolt or USB).',
                '3. Download and install reputable data recovery software such as "Disk Drill" or "Stellar Data Recovery".',
                '4. Launch the data recovery software and initiate a deep scan of the connected hard drive.',
                '5. Review the scan results and select the files you wish to recover.',
                '6. Specify a secure location for saving the recovered files, preferably on an external drive.',
                '7. Start the recovery process and allow the software to retrieve the selected files.',
                '8. Once recovery is complete, verify the integrity of the recovered files and make necessary backups.'
            ],
            'hardware failure': [
                '1. Power off the Mac and disconnect the malfunctioning hard drive.',
                '2. Consult with a certified Mac technician or data recovery specialist for professional assistance.',
                '3. If attempting DIY recovery, handle the hard drive with care to avoid further damage.',
                '4. Consider options like disk cloning or platter transplant if the damage is severe.',
                '5. Proceed with data recovery efforts using macOS-compatible tools and utilities.',
                '6. After successful recovery, implement robust backup strategies to prevent future data loss incidents.'
            ]
        }
    },
    'sd card': {
        'windows': {
            'accidental deletion': [
                '1. Remove the SD card from the device (e.g., camera or smartphone) immediately to prevent data overwriting.',
                '2. Insert the SD card into a card reader and connect it to a Windows computer.',
                '3. Use reliable data recovery software like "PhotoRec" or "Remo Recover" to scan the SD card for lost files.',
                '4. Select the appropriate file types and start the recovery process.',
                '5. Review the recovered files and choose the ones you wish to restore.',
                '6. Save the recovered files to a different drive or storage location to avoid overwriting.',
                '7. Safely eject the SD card and insert it back into the device.',
                '8. Verify the recovered files and perform regular backups to prevent future data loss.'
            ],
            'hardware failure': [
                '1. If the SD card is physically damaged, avoid further use to prevent exacerbating the issue.',
                '2. Insert the SD card into a card reader and connect it to a Windows computer.',
                '3. Utilize data recovery software designed for damaged media like "R-Studio" or "DiskInternals Flash Recovery".',
                '4. Follow the software instructions to perform a thorough scan of the SD card.',
                '5. Select the files you want to recover and commence the recovery process.',
                '6. Save the recovered files to a reliable storage medium and avoid writing to the damaged SD card.',
                '7. Consider professional data recovery services if software-based recovery efforts prove ineffective.',
                '8. After successful recovery, take preventative measures such as using quality SD cards and regular backups.'
            ]
        },
        'macos': {
            'accidental deletion': [
                '1. Remove the SD card from the device and handle it with care to avoid further damage.',
                '2. Insert the SD card into a card reader and connect it to a macOS computer.',
                '3. Install reputable data recovery software like "Disk Drill" or "EaseUS Data Recovery Wizard" on your Mac.',
                '4. Launch the recovery software and select the SD card as the target drive for scanning.',
                '5. Configure the software to search for deleted files and initiate the scanning process.',
                '6. Review the scan results and select the files you wish to recover.',
                '7. Specify a secure location for saving the recovered files, preferably on an external drive.',
                '8. Initiate the recovery process and allow the software to retrieve the selected files.',
                '9. After recovery, verify the integrity of the recovered files and make necessary backups.'
            ],
            'hardware failure': [
                '1. If the SD card is physically damaged, handle it with extreme care to avoid further harm.',
                '2. Connect the SD card to a macOS computer using a reliable card reader.',
                '3. Utilize specialized data recovery software compatible with macOS, such as "Data Rescue" or "TestDisk".',
                '4. Configure the software to perform an in-depth scan of the damaged SD card.',
                '5. Review the scan results and select the files you wish to recover.',
                '6. Save the recovered files to a secure location on your Mac or an external drive.',
                '7. Consider professional data recovery services if software-based recovery proves insufficient.',
                '8. Implement preventive measures like regular backups and proper handling of storage media.'
            ]
        }
    }
};


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

    var correctedValue;
    if (Array.isArray(agent.parameters.DeviceType)) {
        console.log("Device Type is array")
        if(agent.parameters.DeviceType.length > 1){
            console.log("Device Type Length is more than 1")
            correctedValue = agent.parameters.DeviceType[agent.parameters.DeviceType.length - 1];
        }else {
            console.log("Device Type Length is 1")
            correctedValue = agent.parameters.DeviceType[0]}
    }else {
        console.log("Device Type Length not an array")

        correctedValue = agent.parameters.DeviceType
    }

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

        agent.add(`Got it!. you meant ${correctedValue}`);
        checkMissingValues(agent);
    }

}

function fileTypeCorrectionHandler(agent) {
    var correctedValue;
    if (Array.isArray(agent.parameters.FileType)) {
        if(agent.parameters.FileType.length > 1){

            correctedValue = agent.parameters.FileType[agent.parameters.FileType.length - 1];
        }else correctedValue = agent.parameters.FileType[0]
    }else correctedValue = agent.parameters.FileType

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
        agent.add(`Got it!. you meant ${correctedValue} files, correcting the value for you..`);
        checkMissingValues(agent);
    }
}

function operatingSystemCorrectionHandler(agent) {
    var correctedValue;
    if (Array.isArray(agent.parameters.OperatingSystem)) {
        if(agent.parameters.OperatingSystem.length > 1){

            correctedValue = agent.parameters.OperatingSystem[agent.parameters.OperatingSystem.length - 1];
        }else correctedValue = agent.parameters.OperatingSystem[0]
    }else correctedValue = agent.parameters.OperatingSystem

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
        agent.add(`Got it!. you meant ${correctedValue} operating system, correcting the value for you..`);
        checkMissingValues(agent);
    }
}

function dataLossCauseCorrectionHandler(agent) {
    var correctedValue;
    if (Array.isArray(agent.parameters.DataLossCause)) {
        if(agent.parameters.DataLossCause.length > 1){

            correctedValue = agent.parameters.DataLossCause[agent.parameters.DataLossCause.length - 1];
        }else correctedValue = agent.parameters.DataLossCause[0]
    }else correctedValue = agent.parameters.DataLossCause

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
        agent.add(`Got it!. you meant you lost your data through ${correctedValue} cause, correcting the value for you..`);
        checkMissingValues(agent);
    }
}

function recoveryStepsHandler(agent) {
    console.log("recoveryStepsHandler with parameters...", agent.parameters)

    const deviceType = agent.parameters.DeviceType.toLowerCase();
    const os = agent.parameters.OperatingSystem.toLowerCase();
    var dataLossCause;
    if (Array.isArray(agent.parameters.DataLossCause)) {
        if(agent.parameters.DataLossCause.length > 1){

            dataLossCause = agent.parameters.DataLossCause[agent.parameters.DataLossCause.length - 1].toLowerCase();
        }else dataLossCause = agent.parameters.DataLossCause[0].toLowerCase()
    }else dataLossCause = agent.parameters.DataLossCause.toLowerCase()
    console.log("dataLossCause..", dataLossCause)

    const deviceSteps = stepsMap[deviceType];
    if (deviceSteps && deviceSteps[os] && deviceSteps[os][dataLossCause]) {
        const recoverySteps = deviceSteps[os][dataLossCause];
        const response = `Here are the steps for recovering data from a ${deviceType} running ${os} due to ${dataLossCause}:\n\n${recoverySteps.join('\n')}`;
        agent.add(response);
    } else {
        agent.add("I'm sorry, I couldn't find the data recovery steps for the specified combination.");
    }
}

exports.dialogflowFirebaseFulfillment = (req, res) => {
    const agent = new WebhookClient({ request: req, response: res });
    let intentMap = new Map();
    intentMap.set('Recovery Setps - device type - correction', deviceTypeCorrectionHandler);
    intentMap.set('Recovery Setps - file type - correction', fileTypeCorrectionHandler);
    intentMap.set('Recovery Setps - os - correction', operatingSystemCorrectionHandler);
    intentMap.set('Recovery Setps - data loss cause - correction', dataLossCauseCorrectionHandler);
    intentMap.set('Recovery Setps - data loss cause', recoveryStepsHandler);
    agent.handleRequest(intentMap);
};