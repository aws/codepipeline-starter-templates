# CodePipeline Starter Templates

This repository contains a collection of starter templates for AWS CodePipeline, designed to help users quickly set up and configure their CI/CD pipelines for various project types and deployment scenarios.

## Repository Structure

- `/templates`: Contains the main components of the starter templates
  - `/metadata`: JSON files describing each template. These files control how templates are rendered in the CodePipeline console. For more details on the schema and usage, refer to the [metadata README](templates/metadata/README.md).
  - `/cloudformation`: CloudFormation templates for each pipeline configuration.
  - `/ui-hints`: JSON files controlling the rendering of template configuration in the CodePipeline console. These files define how the template configuration step is displayed. For more information on the schema and usage, refer to the [UI hints README](templates/ui-hints/README.md).
- `assets`: Contains svg icons for the starter templates 


## Development

This project uses Node.js for development tasks. To set up the development environment:

1. Ensure you have Node.js 18 or later installed
2. Run `npm install` to install dependencies

### Adding new templates

To add a new template, follow these steps:

1. Create a new metadata file for the template in the `/templates/metadata` folder. This file should conform to the schema defined in `/templates/metadata/schema.json`.
2. Add the corresponding CloudFormation template file in the `/templates/cloudformation` folder.
3. The build script will automatically validate the metadata and CloudFormation template files, and generate the synthesized files for the CodePipeline Console to render.

### Adding new icons
 
You are not required to add a new icon for your template. You can use the existing `codepipeline.svg` icon located in the `assets/icons/` folder. 

If you want to add a new icon to this package,
1. Add the SVG file to the `assets/icons/` folder in this project.
2. The icon-name in the metadata should correspond to the relevant folder, for example, `icon-name: lambda` expects an icon file at `asset/icons/lambda.svg`.


### Testing your changes

Our [template validation workflow](.github/workflows/validate-templates.yaml) involves JSON schema validation using npm and CloudFormation linting using [cfn-lint](https://github.com/aws-cloudformation/cfn-lint). To test your changes locally:

1. Ensure you have npm and cfn-lint installed on your system.
2. Run the following command to validate the JSON files:
   ```
   npm run test
   ```
3. Run the following command to validate the CloudFormation files:
   ```
   cfn-lint templates/cloudformation/*
   ```

## Contributing

We welcome contributions to this project. Please read our [Contributing Guidelines](CONTRIBUTING.md) for more information on how to add new templates or improve existing ones.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This project is licensed under the Apache-2.0 License.

