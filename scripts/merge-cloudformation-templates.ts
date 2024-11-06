import * as fs from "fs";
import { glob } from "glob";
import * as path from "path";
import * as yaml from "js-yaml";
import { schema } from "yaml-cfn";

type CloudFormationParameterType = "String" | "Number";
type CloudFormationParametersAllowedValue = string;
interface CloudFormationParameter {
  Description?: string;
  Type: CloudFormationParameterType;
  Default?: string;
  AllowedValues?: CloudFormationParametersAllowedValue[];
}
type TemplateInputType =
  | "text"
  | "password"
  | "search"
  | "number"
  | "email"
  | "url";
interface TemplateInputOption {
  value: string;
  label?: string;
}
interface TextEditorStyle {
  mode: string;
  minLines: number;
  maxLines: number;
}

/**
 * A superset of several Cloudscape component properties.
 *
 * @see https://cloudscape.aws.dev/components/input/
 */
interface TemplateInput {
  placeholder?: string;
  type?: TemplateInputType;
  description?: string;
  value?: string | TemplateInputOption;
  options?: TemplateInputOption[];
}

/**
 * Removes undefined fields from an object.
 *
 * @template T - The type of the object to process. It must extend the built-in `Record<string, any>` type,
 *               which means it should be an object with string keys and values of any type.
 *
 * @param obj - The object to remove undefined fields from.
 *
 * @returns A new object with the same keys as the input object, but with undefined values removed.
 *          The return type is `Partial<T>`, which means that all properties of the returned object
 *          are optional (i.e., they can be undefined).
 */
function removeUndefinedFields<T extends Record<string, any>>(
  obj: T
): Partial<T> {
  // Convert the input object to an array of key-value pairs using `Object.entries()`.
  // Then, filter out the pairs where the value is undefined using the `.filter()` method.
  // Finally, convert the filtered array back to an object using `Object.fromEntries()`.
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  ) as Partial<T>;
}

/**
 * Convert a CloudFormation parameter type to a template input type.
 *
 * @param parameterType - a CloudFormation parameter type to be converted to template input type.
 *
 * @returns A template input type.
 *
 * @see https://cloudscape.design/components/input/?tabId=api
 */
function convertToTemplateInputType(
  parameterType: CloudFormationParameterType
): TemplateInputType {
  switch (parameterType) {
    case "Number":
      return "number";
    case "String":
      return "text";
    default:
      throw new Error(
        `Unsupported CloudFormation parameter type: ${parameterType}`
      );
  }
}

function convertToTemplateInputOption(
  allowedValue: CloudFormationParametersAllowedValue
): TemplateInputOption {
  return {
    value: allowedValue,
    label: allowedValue,
  };
}

/**
 * Convert an object of CloudFormation parameters to template inputs.
 *
 * @param cloudformationParameters the object of CloudFormation parameters to be converted to template inputs.
 */
function convertToTemplateInputs(
  cloudformationParameters: Record<string, CloudFormationParameter>,
  uiPlaceholders: Record<string, string>,
  textEditorStyles: Record<string, TextEditorStyle>
): TemplateInput[] {
  return Object.entries(cloudformationParameters).map(
    ([name, cloudformationParameter]) =>
      removeUndefinedFields({
        name,
        type: convertToTemplateInputType(cloudformationParameter["Type"]),
        description: cloudformationParameter["Description"],
        placeholder:
          uiPlaceholders && name in uiPlaceholders
            ? uiPlaceholders[name]
            : cloudformationParameter["Default"],
        value:
          cloudformationParameter["AllowedValues"] &&
          cloudformationParameter["Default"]
            ? convertToTemplateInputOption(cloudformationParameter["Default"])
            : cloudformationParameter["Default"],
        options: cloudformationParameter["AllowedValues"]?.map(
          convertToTemplateInputOption
        ),
        textEditorStyle:
          textEditorStyles && name in textEditorStyles
            ? textEditorStyles[name]
            : undefined,
      })
  );
}

/**
 * Checks if the provided ui-hints contain any key names that are not defined in the CloudFormation parameters.
 * If invalid keys are found, it logs an error message and exits the process with a non-zero status code.
 *
 * @package uiHintsFileName - The name of the ui-hints file
 * @param uiHints - An object containing the ui-hints.
 * @param cloudformationParameters - An object containing the CloudFormation parameters.
 */
function checkUiHints(
  uiHintsFileName: string,
  uiHints: Record<string, any>,
  cloudformationParameters: Record<string, CloudFormationParameter>
): void {
  const parameterKeys = Object.keys(cloudformationParameters);
  const uiHintsKeysToCheck = [
    "constraints",
    "placeholders",
    "text-editor-styles",
  ];

  for (const uiHintsKey of uiHintsKeysToCheck) {
    const hints = uiHints[uiHintsKey];
    if (!hints) {
      continue;
    }
    const invalidKeys = Object.keys(hints).filter(
      (key) => !parameterKeys.includes(key)
    );

    if (invalidKeys.length > 0) {
      const invalidKeysString = invalidKeys.join(", ");
      const errorMessage = `Invalid keys in ${uiHintsFileName} ${uiHintsKey}: ${invalidKeysString}`;
      console.error(errorMessage);
      process.exit(1);
    }
  }
}

function main() {
  const metadataFiles = glob.sync("generated-metadata/**/*.json");
  metadataFiles.forEach((metadataFile) => {
    if (!metadataFile.endsWith("schema.json")) {
      console.log(metadataFile);
      const metadataContent = JSON.parse(
        fs.readFileSync(metadataFile, "utf-8")
      );

      const uiHintsFile = metadataContent["ui-hints-location"];
      const uiHints = JSON.parse(
        fs.readFileSync(path.join("templates", uiHintsFile), "utf-8")
      );

      const cloudformationFile = metadataContent["template-location"];
      if (cloudformationFile && cloudformationFile.endsWith("yaml")) {
        const cloudformationContent = fs.readFileSync(
          path.join("templates", cloudformationFile),
          "utf-8"
        );
        metadataContent["template-body"] = cloudformationContent;

        const cloudformationParameters =
          yaml.load(cloudformationContent, { schema })["Parameters"] ?? {};

        checkUiHints(uiHintsFile, uiHints, cloudformationParameters);

        const templateInputs = convertToTemplateInputs(
          cloudformationParameters,
          uiHints["placeholders"],
          uiHints["text-editor-styles"]
        );
        metadataContent["template-inputs"] = templateInputs;
      } else {
        console.log(
          `Warning: No 'template-location' key found in ${metadataFile}`
        );
        process.exit(1);
      }

      const mergedMetadataContent = { ...metadataContent, ...uiHints };
      fs.writeFileSync(
        metadataFile,
        JSON.stringify(mergedMetadataContent, null, 2)
      );
    }
  });
}

main();
