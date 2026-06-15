/*
File: script.js
GUI Assignment: HW4 Part 1 - jQuery Validation Plugin with Dynamic Table
Name: Andrew Nguyen
Email: Andrew_Nguyen4@student.uml.edu
Description: Uses the jQuery Validation plugin to validate user input and dynamically create a multiplication table.
*/
$(function () {
    /*
    Custom validation rule.
    This allows whole numbers that can be positive, negative, or zero.
    */
    $.validator.addMethod("wholeNumber", function (value, element) {
        return this.optional(element) || /^-?\d+$/.test(value);
    }, "Please enter a whole number.");

    /*
    Custom validation rule.
    This makes sure the minimum column value is not greater than the maximum column value.
    */
    $.validator.addMethod("validColumnRange", function () {
        return getInputNumber("#minCol") <= getInputNumber("#maxCol");
    }, "Minimum column value must be less than or equal to maximum column value.");

    /*
    Custom validation rule.
    This makes sure the minimum row value is not greater than the maximum row value.
    */
    $.validator.addMethod("validRowRange", function () {
        return getInputNumber("#minRow") <= getInputNumber("#maxRow");
    }, "Minimum row value must be less than or equal to maximum row value.");

    /*
    Sets up the jQuery Validation plugin.
    The form will not generate a table unless all rules pass.
    */
    $("#tableForm").validate({
        rules: {
            minCol: {
                required: true,
                wholeNumber: true,
                range: [-50, 50],
                validColumnRange: true
            },
            maxCol: {
                required: true,
                wholeNumber: true,
                range: [-50, 50],
                validColumnRange: true
            },
            minRow: {
                required: true,
                wholeNumber: true,
                range: [-50, 50],
                validRowRange: true
            },
            maxRow: {
                required: true,
                wholeNumber: true,
                range: [-50, 50],
                validRowRange: true
            }
        },

        messages: {
            minCol: {
                required: "Enter the starting column value.",
                wholeNumber: "The minimum column must be a whole number, such as -5, 0, or 12.",
                range: "The minimum column must be between -50 and 50.",
                validColumnRange: "Fix the column range: the minimum column cannot be greater than the maximum column."
            },
            maxCol: {
                required: "Enter the ending column value.",
                wholeNumber: "The maximum column must be a whole number, such as -5, 0, or 12.",
                range: "The maximum column must be between -50 and 50.",
                validColumnRange: "Fix the column range: the maximum column must be greater than or equal to the minimum column."
            },
            minRow: {
                required: "Enter the starting row value.",
                wholeNumber: "The minimum row must be a whole number, such as -5, 0, or 12.",
                range: "The minimum row must be between -50 and 50.",
                validRowRange: "Fix the row range: the minimum row cannot be greater than the maximum row."
            },
            maxRow: {
                required: "Enter the ending row value.",
                wholeNumber: "The maximum row must be a whole number, such as -5, 0, or 12.",
                range: "The maximum row must be between -50 and 50.",
                validRowRange: "Fix the row range: the maximum row must be greater than or equal to the minimum row."
            }
        },

        /*
        Places each error message directly below the input that caused it.
        This helps the user know where the problem happened and how to fix it.
        */
        errorPlacement: function (error, element) {
            const errorBox = "#" + element.attr("id") + "Error";
            error.appendTo(errorBox);
        },

        /*
        Runs only when all validation rules pass.
        This prevents the page from reloading and generates the table dynamically.
        */
        submitHandler: function () {
            const values = collectValues();
            $("#tableContainer").html(buildTable(values));
            return false;
        }
    });

    /*
    Reads a number from an input field.
    */
    function getInputNumber(selector) {
        return Number($(selector).val());
    }

    /*
    Collects all four form values into one object.
    This makes table generation cleaner.
    */
    function collectValues() {
        return {
            minCol: getInputNumber("#minCol"),
            maxCol: getInputNumber("#maxCol"),
            minRow: getInputNumber("#minRow"),
            maxRow: getInputNumber("#maxRow")
        };
    }

    /*
    Builds the multiplication table dynamically.
    The top row contains column values, the left column contains row values,
    and each inside cell contains row multiplied by the column.
    */
    function buildTable(values) {
        let tableHtml = "<table>";

        // Creating the top header row of the table.
        tableHtml += "<thead><tr><th></th>";

        // Adds each column number across the top.
        for (let col = values.minCol; col <= values.maxCol; col++) {
            tableHtml += "<th>" + col + "</th>";
        }

        tableHtml += "</tr></thead><tbody>";

        // Creates each table row and calculates the multiplication results.
        for (let row = values.minRow; row <= values.maxRow; row++) {
            tableHtml += "<tr>";

            // Adds the row number on the left side.
            tableHtml += "<th>" + row + "</th>";

            // Adds the multiplication results for the current row.
            for (let col = values.minCol; col <= values.maxCol; col++) {
                tableHtml += "<td>" + (row * col) + "</td>";
            }

            tableHtml += "</tr>";
        }

        tableHtml += "</tbody></table>";

        return tableHtml;
    }
});
