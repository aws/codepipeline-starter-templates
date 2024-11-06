import {ValidateFunction} from "ajv";
import * as fs from "fs";
import { glob } from 'glob';

/*
 * AWS AppConfig only support version JSON Schema version 4.x.
 * Ref: https://docs.aws.amazon.com/appconfig/latest/userguide/appconfig-creating-configuration-and-profile.html#appconfig-creating-configuration-and-profile-validators
 */
const Ajv = require("ajv-draft-04")
const ajv = new Ajv();

/**
 * The main entry-point
 */
function main() {
    validate('templates/metadata/**/*.json');
    validate('templates/ui-hints/**/*.json');
}

/**
 * Takes a folder and validate the files within the folder
 */
function validate(filePath: string) {
    const jsonFiles = glob.globSync(filePath);
    const schemaValidator = findAndCompileJsonSchema(jsonFiles);
    if (schemaValidator == null) {
        process.exit(1)
    }
    const metadataFiles = findJsonConfigs(jsonFiles);
    if (!validateSchemas(metadataFiles, schemaValidator)) {
        process.exit(1);
    }
}

/**
 * Takes in a list of json-files, identifies the schema-file, loads+compiles the same.
 */
function findAndCompileJsonSchema(jsonFiles: string[]): ValidateFunction<any> | null {
    console.log('\nLOADING SCHEMAS:\n');
    let compiledSchema: ValidateFunction<any> | null = null;

    jsonFiles.forEach((jsonFile) => {
        if (jsonFile.endsWith('schema.json')) {
            console.log(`- Found Schema: ${jsonFile}`);
            const schemaObject = readJsonObjectFromFile(jsonFile);
            compiledSchema = ajv.compile(schemaObject);
        }
    });

    if (compiledSchema) {
        return compiledSchema;
    } else {
        console.log('- No schema file found.');
        return null;
    }
}

/**
 * Reads a file and parses it into a JSON object
 */
function readJsonObjectFromFile(jsonFile: string) {
    const fileContents = fs.readFileSync(jsonFile).toString('utf-8');
    return JSON.parse(fileContents);
}

/**
 * Takes in a list of json-files, identifies the (non-schema) config-files, and groups them - to
 * return a map of config-name -> list of config-files
 */
function findJsonConfigs(jsonFiles: string[]): string[] {
    const fileList: string[] = []
    jsonFiles.forEach((jsonFile) => {
        if (!jsonFile.endsWith('schema.json')) {
            fileList.push(jsonFile);
        }
    });
    return fileList;
}


/**
 * Iterates over the config-files and validates each one with the corresponding schema file.
 * Logs a comment if it's not able to find a schema for a given set of config-files.
 * Logs the errors if a config file fails the schema validation.
 * Returns true if all schema validations pass successfully.
 */
function validateSchemas(
    configFiles: string[],
    schemaValidator: ValidateFunction<any>
): boolean {
    console.log('\nVALIDATING CONFIGS:\n');
    let valid = true;

    configFiles.forEach((configFile) => {
        const configObject = readJsonObjectFromFile(configFile);
        const validatorResults = schemaValidator(configObject);
        if (!validatorResults) {
            valid = false;
            console.log(`[ERROR]  ${configFile}\n`);
            console.log(schemaValidator.errors);
            console.log('\n');
        } else {
            console.log(`[OK]  ${configFile}\n`);
        }
    })
    return valid;
}

main();