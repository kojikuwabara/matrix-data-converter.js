# MatrixDataConverter.js

MatrixDataConverter.js is a JavaScript library for converting matrix data between various formats such as CSV, TSV, JSON, and HTML.

## Features
- Convert between CSV, TSV, JSON, and HTML table formats.
- Optional data processing like transposing matrices and adding headers.
- Handles escaped quotes and delimiters within the data.

## Installation

To use MatrixDataConverter, simply include the `matrixdataconverter.js` file in your project:

```html
<script src="path/to/matrixdataconverter.js"></script>
```

## Usage
Here's a basic example of how to use the MatrixDataConverter class:

```javascript
const converter = new MatrixDataConverter();

const csvData  = "name,age\nAlice,30\nBob,25";
const jsonData1 = '[{"name":"Alice","age":30}, {"name":"Bob","age":25}]';
const jsonData2 = '[["name","age"], ["Alice",30], ["Bob",25]]';
const htmlTableData = `<table><thead><tr><th>name</th><th>age</th></tr></thead><tbody><tr><td>Alice</td><td>30</td></tr><tr><td>Bob</td><td>25</td></tr></tbody></table>`;

// Convert CSV to JSON
const arrayFromCsv = converter.convert(csvData, 'csv', 'aoo');

// Convert JSON(Array of objects) to HTML
const htmlFromJson = converter.convert(jsonData1, 'aoo', 'html');

// Convert JSON(Array of arrays) to TSV
const tsvFromJson  = converter.convert(jsonData2, 'aoa', 'tsv');

// Convert HTML table to CSV
const csvFromHtmlTable = converter.convert(htmlTableData, 'html', 'csv');
```

## Constructor
- constructor(): Initializes a new MatrixDataConverter instance.

## Properties
### Getters
These properties return the data in various formats based on the current state of the array2D property.

- csv: Returns the data as a CSV string.
- tsv: Returns the data as a TSV string.
- arrayOfArrays: Returns the data as a JSON string representing an array of arrays.
- arrayOfObjects: Returns the data as a JSON string representing an array of objects.
- htmlTable: Returns the data as an HTML table string.

## Methods

### Main Method
- convert(inputValue, inputFormat, outputFormat, options): Converts data from one format to another.
  - inputValue   (string): The input data to be converted.
  - inputFormat  (string): The format of the input data (csv, tsv, aoa, aoo, html).
  - outputFormat (string): The desired format for the output data (csv, tsv, aoa, aoo, html).
  - options (Array<string>): An array of options for data processing. Possible values are transpose, add_head, no_quot, add_ds, rm_lf_c.

  #### Conversion Options
  - transpose: Transpose the matrix data.
  - add_head : Add headers to the matrix data.
  - no_quot  : Do not add quotes in the output.
  - add_ds   : Include dataset properties in the HTML output.
  - rm_lf_c  : Remove line feed in cells.


### Convert to a 2D array
  These functions convert various input formats into a 2D array.

- get2DArrayFromDsv(dsvText): Converts CSV or TSV data into a two-dimensional array.
  - splitDsv(row): Splits a row string into columns, handling escaped quotes and delimiters.

- get2DArrayFromJson(jsonText): Converts JSON data into a two-dimensional array.
- get2DArrayFromHtmlTable(htmlText): Converts HTML table data into a two-dimensional array.

### Convert from a 2D array
  These functions convert a 2D array into various output formats.

- getDsvFrom2DArray(array2D, separator, noQuot): Converts a two-dimensional array to a CSV or TSV string.
- getJsonFrom2DArray(array2D): Converts a two-dimensional array to a JSON string.
- getHtmlTableFrom2DArray(array2D, withDataset): Converts a two-dimensional array to an HTML table string.

### Optional Functions
- optionalDataProcessing(array2D): Performs optional data processing on a 2D array based on the specified options.
- addHeader(array2D): Adds a header row to the matrix data.
- transpose(array2D): Transposes the matrix data.
- removeLFInCells(dsvText): Deletes the linefeed inside the double quotes in delimiter-separated values.

## License
This project is licensed under the [MIT License](https://github.com/kojikuwabara/easy-drop-files.js/blob/main/LICENSE). See the LICENSE file for details.

## Author
Koji Kuwabara - [GitHub](https://github.com/kojikuwabara)
