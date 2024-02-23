const fs = require('fs');

const recoverySteps = {
    "accidental deletion": [
        "Check Recycle Bin for deleted files.",
        "Use file recovery software to scan for and recover deleted files.",
        "Restore from backup if available.",
        "Attempt to recover deleted files using previous file versions if applicable.",
        "Check temporary directories for unsaved versions of files.",
        "Contact others who may have copies of the lost files.",
        "Search cloud storage and online services for backups or copies of the files.",
        "Consider professional data recovery services if all else fails."
    ],
    "hardware failure": [
        "Attempt to access the drive on another device to rule out connection issues.",
        "If the device is not recognized, consult a professional data recovery service.",
        "Consider hardware repair or replacement if data is critical and not recoverable.",
        "Check for physical damage such as dents, scratches, or unusual noises.",
        "If the drive is making unusual noises, power it off immediately to prevent further damage.",
        "Avoid attempting DIY repair methods that may worsen the situation.",
        "Use specialized hardware diagnostic tools to identify and address hardware issues.",
        "If data is not accessible due to hardware failure, seek professional assistance."
    ],
    "software corruption": [
        "Attempt to repair corrupted files using data recovery software.",
        "If unsuccessful, try using file repair tools specific to the file format.",
        "Restore from backup if available.",
        "Attempt to open the corrupted files in different applications or environments.",
        "Use disk repair utilities to check and repair file system errors.",
        "Consider using system restore or recovery options available in the operating system.",
        "Check for software updates or patches that may address file corruption issues.",
        "Consult online forums or communities for advice on recovering corrupted files."
    ],
    "virus infection": [
        "Run antivirus software to remove the virus and quarantine infected files.",
        "Use data recovery software to recover files affected by the virus.",
        "Restore from backup if available.",
        "Disable system restore to prevent reinfection from stored restore points.",
        "Update antivirus definitions and perform a full system scan.",
        "Use bootable antivirus tools to scan the system outside of the infected OS.",
        "Remove any suspicious browser extensions or plugins.",
        "Educate users on safe browsing habits and avoiding malware downloads."
    ],
    "physical damage": [
        "Assess the extent of physical damage to the storage device.",
        "Consult a professional data recovery service for physical repairs and recovery.",
        "Avoid further attempts to access the device to prevent additional damage.",
        "Handle damaged devices with care to prevent further deterioration.",
        "If water damage is suspected, dry the device thoroughly before attempting data recovery.",
        "Minimize exposure to dust, debris, or other contaminants.",
        "Do not attempt to disassemble or repair physically damaged devices without proper expertise.",
        "Consider using protective cases or enclosures to prevent physical damage in the future."
    ]
};

const operatingSystems = ["windows", "linux", "macos", "android", "ios"];
const deviceTypes = ["usb", "solid state drives", "hard drive",
    "desktop", "camera", "laptop", "mobile", "sd card"];
const fileTypes = ["photos", "videos"];
const dataLossCauses = ["accidental deletion",
    "hardware failure", "software corruption",
    "virus infection",
    "physical damage"];

function generateRecoverySteps(os, deviceType, fileType, dataLossCause) {
    const steps = recoverySteps[dataLossCause];
    if (!steps) {
        return ["No recovery steps available for the specified data loss cause."];
    }
    return steps;
}

const records = [];
for (const os of operatingSystems) {
    for (const deviceType of deviceTypes) {
        for (const fileType of fileTypes) {
            for (const dataLossCause of dataLossCauses) {
                const recoverySteps = generateRecoverySteps(os, deviceType, fileType, dataLossCause);
                records.push({
                    os,
                    deviceType,
                    fileType,
                    dataLossCause,
                    recoverySteps
                });
            }
        }
    }
}
console.log(records.length)
fs.writeFileSync('generatedRecords.json', JSON.stringify(records, null, 2));
