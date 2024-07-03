////////////////////////////////////////////////////////////////////////////////////////////////////
// MatrixDataConverter.js
////////////////////////////////////////////////////////////////////////////////////////////////////
/*!
 * @classdesc Converting matrix data between various formats such as CSV, TSV, JSON, and HTML.
 *
 * @author    Koji Kuwabara (https://github.com/kojikuwabara/matrix-data-converter.js)
 * @copyright 2024 Koji Kuwabara
 * @version   v1.0.0
 * @licence   Licensed under MIT (https://opensource.org/licenses/MIT)
 */
////////////////////////////////////////////////////////////////////////////////////////////////////
// Overview
////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 *  constructor:
 *  Property:
 *    - csv            #getter
 *    - tsv            #getter
 *    - arrayOfArrays  #getter
 *    - arrayOfObjects #getter
 *    - htmlTable      #getter
 *  Method:
 *    - convert
 *    - splitDsv
 *    - get2DArrayFromDsv
 *    - get2DArrayFromJson
 *    - get2DArrayFromHtmlTable
 *    - getDsvFrom2DArray
 *    - getJsonFrom2DArray
 *    - getHtmlTableFrom2DArray
 *    - optionalDataProcessing
 *    - addHeader
 *    - transpose
 */
class MatrixDataConverter { 
	////////////////////////////////////////////////////////////////////////////////////////////////////
	// constructor
	////////////////////////////////////////////////////////////////////////////////////////////////////
	/**
	 * Constructs a new MatrixDataConverter instance.
	 * @constructor
	 */
	constructor() {
		this.array2D = [];
		this.options = [];
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////
	// getter 
	////////////////////////////////////////////////////////////////////////////////////////////////////
	get csv() {
		const ret = this.optionalDataProcessing(this.array2D);
		return this.getDsvFrom2DArray(ret, "," , this.options.includes("no_quot"));
	}
	get tsv() {
		const ret = this.optionalDataProcessing(this.array2D);
		return this.getDsvFrom2DArray(ret, "\t" , this.options.includes("no_quot"));
	}
	get arrayOfArrays() {
		const ret = this.optionalDataProcessing(this.array2D);
		return JSON.stringify(ret, "", "\t");
	}
	get arrayOfObjects() {
		const ret = this.optionalDataProcessing(this.array2D);
		return this.getJsonFrom2DArray(ret);
	}
	get htmlTable() {
		const ret = this.optionalDataProcessing(this.array2D);
		return this.getHtmlTableFrom2DArray(ret, this.options.includes("add_ds"));
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////
	// Main process
	////////////////////////////////////////////////////////////////////////////////////////////////////
	/**
	 * Converts data from one format to another.
	 * 
	 * @param {string}        inputValue   - The input data to be converted.
	 * @param {string}        inputFormat  - The format of the input data (e.g., 'csv', 'tsv').
	 * @param {string}        outputFormat - The desired format for the output data (e.g., 'aoa', 'html').
	 * @param {Array<string>} options      - An array of options for data processing. Possible values are "transpose", "add_head", "no_quot", "add_ds".
	 * @returns {*}                          The converted data in the desired format.
	 */
	convert(inputValue, inputFormat, outputFormat, options) {
		try {
			//Convert input data to a two-dimensional array.
			const convertTo2DArray = {
				  "csv"  : () => this.get2DArrayFromDsv(inputValue)
				, "tsv"  : () => this.get2DArrayFromDsv(inputValue)
				, "aoa"  : () => JSON.parse(inputValue)
				, "aoo"  : () => this.get2DArrayFromJson(inputValue)
				, "html" : () => this.get2DArrayFromHtmlTable(inputValue)
			};
			this.options = options;
			this.array2D = convertTo2DArray[inputFormat]();

			//Convert data to output format
			const convertFrom2DArray = {
				  "csv"  : () => this.csv
				, "tsv"  : () => this.tsv
				, "aoa"  : () => this.arrayOfArrays
				, "aoo"  : () => this.arrayOfObjects
				, "html" : () => this.htmlTable
			};
			return convertFrom2DArray[outputFormat]();

		} catch(error){
			console.error(error);
		}
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////
	// Convert to a 2D array
	////////////////////////////////////////////////////////////////////////////////////////////////////
	/**
	 * Splits a row string into columns, handling escaped quotes and delimiters.
	 *
	 * @param   {string} row       - The row string to be split.
	 * @returns {Array<string>}      An array of columns.
	 */
	splitDsv(row) {
		try {
			//Escaping delimiters to \v
			const escapeSeparator = arg => arg.replace(/"(,|\t)"/g, `"\v"`);
			const escapedRow  = escapeSeparator(row);
			const escapedRow2 = escapedRow === row ? escapedRow.replace(/(,|\t)/g, `\v`) : escapedRow;

			//Remove trailing extra commas
			const escapedRow3 = escapedRow2.replace(/,$/, '');

			//Split into columns
			const cols = escapedRow3.split("\v");

			//Escaping commas and double quotes
			const escapeComma  = arg => {
				const buff = arg.replace(/("[^"]*?),([^"]*?")/g, '$1\^\f\^$2');
				return buff == arg ? buff : escapeComma(buff);
			};
			const escapeQuote  = arg => {
				const buff = arg.replace(/("[^"]*?)\"\"([^"]*?")/g, '$1\+\f\+$2'); /*" */
				return buff == arg ? buff : escapeQuote(buff);
			};
			const escapledCols = cols.map(col => escapeQuote(escapeComma(col)));

			//Trim double quotation marks surrounding a cell
			const trimQuote   = arg => arg.replace(/^"(.*)"$/g, '$1');
			const trimmedCols = escapledCols.map(col => trimQuote(col));

			//Unescape commas and double quotes
			const unescapeComma = arg => arg.replace(/\^\f\^/g, ',');
			const unescapeQuote = arg => arg.replace(/\+\f\+/g, '\u0022');
			const unescapedCols = trimmedCols.map( col => unescapeQuote(unescapeComma(col)));

			return unescapedCols;
		} catch(error){
			console.error(error);
		}
	}

	/**
	 * Converts CSV or TSV data into a two-dimensional array.
	 *
	 * @param   {string} dsvText      - The input data.
	 * @returns {Array<Array<string>>}  A two-dimensional array representation of the data.
	 */
	get2DArrayFromDsv(dsvText) {
		try {
			const array2D   = [];
			const separator = dsvText.includes("\r\n") ? "\r\n" : "\n";
			const dsvText2  = this.options.includes("rm_lf_c") ? this.removeLFInCells(dsvText) : dsvText;
			const rows      = dsvText2.split(separator).filter(Boolean);
			rows.forEach( row => {
				const cols = this.splitDsv(row);
				array2D.push(cols);
			});
			return array2D;
		} catch(error){
			console.error(error);
		}
	}

	/**
	 * Converts JSON data into a two-dimensional array.
	 *
	 * @param   {string} jsonText      - The input JSON data as a string.
	 * @returns {Array<Array<string>>}   A two-dimensional array representation of the JSON data.
	 */
	get2DArrayFromJson(jsonText) {
		try {
			const array2D = [];
			const json    = JSON.parse(jsonText);
			const headers = Object.keys(json[0]);
			json.forEach( obj => {
				const cols = [];
				Object.keys(obj).forEach(key => cols.push(obj[key]));
				array2D.push(cols);
			});
			return [...[headers], ...array2D];
		} catch(error){
			console.error(error);
		}
	}

	/**
	 * Converts HTML table data into a two-dimensional array.
	 *
	 * @param   {string} htmlText    - The input HTML string containing a table.
	 * @returns {Array<Array<string>>} A two-dimensional array representation of the HTML table.
	 */
	get2DArrayFromHtmlTable(htmlText) {
		try {
			const parser = new DOMParser();
			const doc    = parser.parseFromString(htmlText, 'text/html');
			const table  = doc.querySelector('table');
			const array2D = [];

			// Get header
			const headerCells = table.querySelectorAll('thead th');
			const headers     = [];
			headerCells.forEach( headerCell => headers.push(headerCell.innerText));
			array2D.push(headers);

			// Get body
			const tableRows = table.querySelectorAll('tbody tr');
			tableRows.forEach( tableRow => {
				const cols = [];
				const tableCols = tableRow.querySelectorAll('td');
				tableCols.forEach( tableCol => cols.push(tableCol.innerText));
				array2D.push(cols);
			});
			return array2D;
		} catch(error){
			console.error(error);
		}
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////
	// Convert from a 2D array
	////////////////////////////////////////////////////////////////////////////////////////////////////
	/**
	 * Converts a two-dimensional array to a CSV or TSV string.
	 *
	 * @param   {Array<Array<string>>} array2D   - The input two-dimensional array.
	 * @param   {string}               separator - The delimiter used (e.g., comma or tab).
	 * @param   {boolean}              noQuot    - If true, no quotes will be added.
	 * @returns {string}                           The CSV or TSV string.
	 */
	getDsvFrom2DArray(array2D, separator, noQuot) {
		try {
			const ret = [];
			const addQuote = (arg, noQuot) => {
				const escapedString = arg.replace(/[\u0022]/g, '\u0022\u0022');
				return noQuot ? arg : `"${escapedString}"`;
			};
			array2D.forEach(row => {
				const cols = row.map( col => `${addQuote(col, noQuot)}`);
				ret.push(cols.join(separator));
			});
			return ret.join("\n");
		} catch(error){
			console.error(error);
		}
	};

	/**
	 * Converts a two-dimensional array to a JSON string.
	 *
	 * @param   {Array<Array<string>>} array2D - The input two-dimensional array.
	 * @returns {string}                         The JSON string.
	 */
	getJsonFrom2DArray(array2D) {
		try {
			const ret      = [];
			const headers  = array2D[0];
			const dataRows = array2D.slice(1);
			dataRows.forEach(row => {
				const cols = {};
				headers.forEach( (header, colNum) => {
					cols[header] = row[colNum];
				});
				ret.push(cols);
			});
			return JSON.stringify(ret, "", "\t");
		} catch(error){
			console.error(error);
		}
	};

	/**
	 * Converts a two-dimensional array to an HTML table string.
	 *
	 * @param   {Array<Array<string>>} array2D     - The input two-dimensional array.
	 * @param   {boolean}              withDataset - If true, dataset properties will be included.
	 * @returns {string}                             The HTML table string.
	 */
	getHtmlTableFrom2DArray(array2D, withDataset) {
		try {
			const headers  = array2D[0];
			const dataRows = array2D.slice(1);

			//Create thead string
			const theadString =  headers.map((col, colNum) => `\t\t\t<th data-col="${colNum}">${col}</th>`).join("\n");

			//Create tbody string
			const tbodyRows = [];
			dataRows.forEach( (row, rowNum) => {
				const tds = [];
				row.forEach( (col, colNum) => {
					tds.push(`\t\t\t<td data-row="${rowNum}" data-col="${colNum}">${col}</td>`);
				});
				const tdString = tds.join("\n");
				tbodyRows.push(`\t\t<tr data-row="${rowNum}">\n${tdString}\n\t\t</tr>`);
			});
			const tbodyString = tbodyRows.join("\n");

			//Return table string
			const tableString = `<table>\n\t<thead>\n\t\t<tr>\n${theadString}\n\t\t</tr>\n\t</thead>\n\t<tbody>\n${tbodyString}\n\t</tbody>\n</table>`;
			const noDataset   = htmlString => htmlString.replace(/<(tr|th|td)(\s+[^>]+)?>/g, '<$1>');
			return withDataset ? tableString : noDataset(tableString);
		} catch(error){
			console.error(error);
		}
	};

	////////////////////////////////////////////////////////////////////////////////////////////////////
	// Optional functions
	////////////////////////////////////////////////////////////////////////////////////////////////////
	/**
	 * Performs optional data processing on a 2D array based on the specified options.
	 * 
	 * @param   {Array<Array<string>>} array2D - The input two-dimensional array.
	 * @returns {Array<Array<*>>}                The processed 2D array.
	 */
	optionalDataProcessing(array2D) {
		try {
			let buff = array2D;
			buff     = this.options.includes("transpose") ? this.transpose(buff) : buff;
			buff     = this.options.includes("add_head" ) ? this.addHeader(buff) : buff;
			return buff;
		} catch(error){
			console.error(error);
		}
	}

	/**
	 * Adds a header row to the matrix data.
	 *
	 * @param   {Array<Array<string>>} array2D - The input two-dimensional array.
	 * @returns {Array<Array<string>>}           The array with the header row added.
	 */
	addHeader(array2D) {
		try {
			const headers = array2D[0].map( (_, colNum) => `column_${colNum}`);
			return [...[headers], ...array2D];
		} catch(error){
			console.error(error);
		}
	}

	/**
	 * Transposes the matrix data.
	 *
	 * @param   {Array<Array<string>>} array2D - The input two-dimensional array.
	 * @returns {Array<Array<string>>}           The transposed array.
	 */
	transpose(array2D) {
		try {
			return array2D[0].map((_, colNum) => array2D.map(row => row[colNum]));
		} catch(error){
			console.error(error);
		}
	}

	/**
	 * Delete the linefeed inside the double quotes in delimiter-separated values.
	 *
	 * @param   {string} dsvText - The delimiter-separated values text to process.
	 * @returns {string}           The processed DSV text with line feed characters inside cells escaped.
	 */
	removeLFInCells(dsvText) {
		try {
			return dsvText.replace(/^"/gm, `\t\t\t\t"`).replace(/\n/gm, "").replace(/\t\t\t\t/gm, "\n");
		} catch(error){
			console.error(error);
		}
	}
};

