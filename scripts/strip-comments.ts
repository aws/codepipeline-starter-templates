import * as fs from "fs";
import { glob } from 'glob';

const strip = require('strip-comments');

/**
 * The main entry-point
 */
function main() {
    const jsonFiles = glob.globSync('generated-metadata/**/*.json');
    console.log('\nLOADING CONFIGS:\n');
    jsonFiles.forEach((jsonFile: string) => {
            console.log(`- Found File: ${jsonFile}`);
            stripJsonComments(jsonFile);
    });
}

/**
 * Reads a file and removes comments, then overwrites the original
 */
function stripJsonComments(jsonFile: string) {
    const rawContents = fs.readFileSync(jsonFile).toString('utf-8');
    const strippedContents = strip(rawContents);
    fs.writeFileSync(jsonFile, strippedContents);
}

main();