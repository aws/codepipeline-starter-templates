# UI Hints

This folder contains JSON files that control how the template configuration step will be rendered on the CodePipeline console.

## Schema

1. **supported-source-filters**: helps filter down the source providers available for a template. When unsure, use `"owner": ["CodeStarConnection"]`.

2. **constraints**: helps the CodePipeline console validate the input fields.

3. **placeholders**: provides placeholder text to be rendered in CodePipeline input fields.

4. **text-editor-styles**: Defines the rendering styles for input fields that should be displayed as text editors in the CodePipeline console. 

For detailed information on the schema and how to use these UI hint files, please refer to the `schema.json` file in this directory.