# Templates Metadata

This folder contains metadata that control how templates will be rendered in the template category on the CodePipeline console.

## Schema

1. **id**: A unique identifier for the template (string).
2. **name**: The display name of the template (string).
3. **description**: A brief description of what the template does (string).
4. **category**: The category under which the template will be displayed (string).
5. **badge**: An optional badge to highlight the template's status. Possible values are "Coming Soon", "New", "Default", and "Popular" (string). 
6. **icon-name**: The name of the icon to be displayed with the template (string).
7. **tags**: An array of strings that can be used for filtering or searching templates.
8. **template-location**: The relative path to the CloudFormation template file (string).
9. **ui-hints-location**: The relative path to the UI hints file for this template (string).

For more information, see the `schema.json` file in this directory.